param(
    [string]$RemoteVaultPath = "/sdcard/ObsidianDevVault",
    [string]$ObsidianPackage = "md.obsidian",
    [string]$ObsidianApkUrl = "https://github.com/obsidianmd/obsidian-releases/releases/download/v1.12.7/Obsidian-1.12.7.apk",
    [string]$AdbPath = "adb",
    [switch]$SkipBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ExitCodes = @{
    AdbNotFound = 10
    AdbNotWorking = 11
    EmulatorNotFound = 20
    ObsidianInstallFailed = 30
    VaultSourceMissing = 40
    BuildFailed = 50
    ManifestReadFailed = 60
    SyncFailed = 70
    RestartFailed = 80
}

function Write-Step {
    param([string]$Message)
    Write-Host "[android-test-sync] $Message"
}

function Stop-WithCode {
    param(
        [string]$Message,
        [int]$Code
    )
    Write-Error $Message
    exit $Code
}

function Invoke-Adb {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$CommandArgs
    )
    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"

    $hadNativePref = $null -ne (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue)
    if ($hadNativePref) {
        $previousNativePref = $PSNativeCommandUseErrorActionPreference
        $PSNativeCommandUseErrorActionPreference = $false
    }

    try {
        $output = & $AdbPath @CommandArgs 2>&1
        $exitCode = $LASTEXITCODE
    } finally {
        if ($hadNativePref) {
            $PSNativeCommandUseErrorActionPreference = $previousNativePref
        }
        $ErrorActionPreference = $previousErrorActionPreference
    }

    $normalizedOutput = @(
        $output | ForEach-Object {
            if ($_ -is [System.Management.Automation.ErrorRecord]) {
                $_.ToString()
            } else {
                [string]$_
            }
        }
    )

    if ($exitCode -ne 0) {
        throw "adb $($CommandArgs -join ' ') failed with exit code ${exitCode}: $($normalizedOutput -join [Environment]::NewLine)"
    }
    return $normalizedOutput
}

function Test-ObsidianInstalled {
    param([string]$PackageName)
    $packages = Invoke-Adb -CommandArgs @("shell", "pm", "list", "packages", $PackageName)
    return ($packages -join "`n") -match "package:$PackageName"
}

function Install-ObsidianIfNeeded {
    param(
        [string]$PackageName,
        [string]$ApkUrl
    )

    if (Test-ObsidianInstalled -PackageName $PackageName) {
        Write-Step "Obsidian package '$PackageName' already installed."
        return
    }

    Write-Step "Obsidian package '$PackageName' is missing. Downloading APK from: $ApkUrl"
    $tempApk = Join-Path ([IO.Path]::GetTempPath()) "obsidian-latest.apk"
    try {
        Invoke-WebRequest -Uri $ApkUrl -OutFile $tempApk
        Write-Step "Installing Obsidian from $ApkUrl"
        Invoke-Adb -CommandArgs @("install", "-r", $tempApk) | Out-Null
    } catch {
        Stop-WithCode -Message "Failed to download/install Obsidian APK from '$ApkUrl': $_" -Code $ExitCodes.ObsidianInstallFailed
    } finally {
        if (Test-Path $tempApk) {
            Remove-Item -Path $tempApk -Force -ErrorAction SilentlyContinue
        }
    }

    if (-not (Test-ObsidianInstalled -PackageName $PackageName)) {
        Stop-WithCode -Message "Obsidian installation verification failed for package '$PackageName'." -Code $ExitCodes.ObsidianInstallFailed
    }
}

function Get-PluginId {
    $manifestPath = Join-Path $PSScriptRoot "..\manifest.json"
    $manifestPath = [IO.Path]::GetFullPath($manifestPath)
    if (-not (Test-Path $manifestPath)) {
        Stop-WithCode -Message "manifest.json not found at '$manifestPath'." -Code $ExitCodes.ManifestReadFailed
    }

    try {
        $manifest = Get-Content -Path $manifestPath -Raw | ConvertFrom-Json
    } catch {
        Stop-WithCode -Message "Failed to parse manifest.json: $_" -Code $ExitCodes.ManifestReadFailed
    }

    if ([string]::IsNullOrWhiteSpace($manifest.id)) {
        Stop-WithCode -Message "manifest.json does not contain a valid 'id' field." -Code $ExitCodes.ManifestReadFailed
    }

    return [string]$manifest.id
}

function Test-AdbReady {
    Write-Step "Checking adb availability..."
    $adbCmd = Get-Command $AdbPath -ErrorAction SilentlyContinue
    if (-not $adbCmd) {
        Stop-WithCode -Message "adb command not found. Install Android Platform Tools or set -AdbPath." -Code $ExitCodes.AdbNotFound
    }

    try {
        Invoke-Adb -CommandArgs @("version") | Out-Null
    } catch {
        Stop-WithCode -Message "adb is present but not working: $_" -Code $ExitCodes.AdbNotWorking
    }
}

function Test-EmulatorReady {
    Write-Step "Checking emulator availability..."
    $devices = Invoke-Adb -CommandArgs @("devices")
    $onlineEmulators = @()
    foreach ($line in $devices) {
        if ($line -match "^(emulator-\d+)\s+device$") {
            $onlineEmulators += $Matches[1]
        }
    }

    if ($onlineEmulators.Count -eq 0) {
        Stop-WithCode -Message "No running emulator in 'device' state found. Start an Android emulator first." -Code $ExitCodes.EmulatorNotFound
    }

    Write-Step "Using emulator: $($onlineEmulators[0])"
}

function Invoke-PluginBuild {
    if ($SkipBuild) {
        Write-Step "Skipping build as requested."
        return
    }

    Write-Step "Building plugin via 'npm run build'..."
    Push-Location (Join-Path $PSScriptRoot "..")
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Stop-WithCode -Message "Plugin build failed." -Code $ExitCodes.BuildFailed
        }
    } finally {
        Pop-Location
    }
}

function Sync-Vault {
    param(
        [string]$LocalVaultPath,
        [string]$RemotePath
    )

    if (-not (Test-Path -LiteralPath $LocalVaultPath -PathType Container)) {
        Stop-WithCode -Message "Vault source path does not exist: $LocalVaultPath" -Code $ExitCodes.VaultSourceMissing
    }

    Write-Step "Replacing remote vault at '$RemotePath'..."
    try {
        $localVaultContentPath = Join-Path $LocalVaultPath "."
        Invoke-Adb -CommandArgs @("shell", "rm", "-rf", $RemotePath) | Out-Null
        Invoke-Adb -CommandArgs @("shell", "mkdir", "-p", $RemotePath) | Out-Null
        Invoke-Adb -CommandArgs @("push", $localVaultContentPath, $RemotePath) | Out-Null
    } catch {
        Stop-WithCode -Message "Failed to sync vault: $_" -Code $ExitCodes.SyncFailed
    }
}

function Test-PluginPresentInRemoteVault {
    param(
        [string]$RemotePath,
        [string]$PluginId
    )
    $remotePluginPath = "$RemotePath/.obsidian/plugins/$PluginId"
    try {
        $ls = Invoke-Adb -CommandArgs @("shell", "ls", $remotePluginPath)
        $joined = $ls -join "`n"
        if (($joined -notmatch "main\.js") -or ($joined -notmatch "manifest\.json")) {
            Stop-WithCode -Message "Plugin files were not found in remote vault at '$remotePluginPath'." -Code $ExitCodes.SyncFailed
        }
    } catch {
        Stop-WithCode -Message "Failed to verify plugin files in remote vault: $_" -Code $ExitCodes.SyncFailed
    }
}

function Restart-Obsidian {
    param([string]$PackageName)
    Write-Step "Restarting Obsidian..."
    try {
        Invoke-Adb -CommandArgs @("shell", "am", "force-stop", $PackageName) | Out-Null
        Invoke-Adb -CommandArgs @("shell", "monkey", "-p", $PackageName, "-c", "android.intent.category.LAUNCHER", "1") | Out-Null
        Start-Sleep -Seconds 2
        $appPid = Invoke-Adb -CommandArgs @("shell", "pidof", $PackageName)
        if ([string]::IsNullOrWhiteSpace(($appPid -join "").Trim())) {
            Stop-WithCode -Message "Obsidian did not start after restart command." -Code $ExitCodes.RestartFailed
        }
    } catch {
        Stop-WithCode -Message "Failed to restart Obsidian: $_" -Code $ExitCodes.RestartFailed
    }
}

Write-Step "Starting Android emulator test sync..."
Test-AdbReady
Test-EmulatorReady
Install-ObsidianIfNeeded -PackageName $ObsidianPackage -ApkUrl $ObsidianApkUrl
Invoke-PluginBuild

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$localVaultPath = [IO.Path]::GetFullPath((Join-Path $projectRoot "dev-vault"))
Write-Step "Using local vault path: $localVaultPath"
$pluginId = Get-PluginId
Write-Step "Detected plugin id: $pluginId"

Sync-Vault -LocalVaultPath $localVaultPath -RemotePath $RemoteVaultPath
Test-PluginPresentInRemoteVault -RemotePath $RemoteVaultPath -PluginId $pluginId
Restart-Obsidian -PackageName $ObsidianPackage

Write-Step "Done. Emulator vault and plugin are up to date."
