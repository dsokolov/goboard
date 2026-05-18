import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.env.npm_package_version;

const manifestPaths = ["plugin-dist/manifest.json", "manifest.json"];

let minAppVersion;
for (const manifestPath of manifestPaths) {
	const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
	if (!minAppVersion) {
		minAppVersion = manifest.minAppVersion;
	}
	manifest.version = targetVersion;
	writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t") + "\n");
}

const versions = JSON.parse(readFileSync("versions.json", "utf8"));
if (!Object.prototype.hasOwnProperty.call(versions, targetVersion)) {
	versions[targetVersion] = minAppVersion;
	writeFileSync("versions.json", JSON.stringify(versions, null, "\t") + "\n");
}
