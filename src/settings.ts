import {App, PluginSettingTab, Setting} from 'obsidian';
import GoBoardPlugin from './main';
import {detectOS} from './osUtils';
import {t} from './i18n';


export interface BoardSizeOption {
    title: string;
    width: number;
    height: number;
}

export const BOARD_SIZES: Record<'9x9' | '13x13' | '19x19', BoardSizeOption> = {
    '9x9': {title: '9x9', width: 9, height: 9},
    '13x13': {title: '13x13', width: 13, height: 13},
    '19x19': {title: '19x19', width: 19, height: 19},
};

export interface GoBoardPluginSettings {
    defaultBoardSize: '9x9' | '13x13' | '19x19';
    showHoshi: boolean;
    // Для обратной совместимости сохраняем оба поля
    showCoordinates?: boolean; // Старое поле, будет конвертировано в coordinateSides
    coordinateSides?: string[]; // Новое поле - массив сторон для сериализации в JSON
}

export const DEFAULT_SETTINGS: GoBoardPluginSettings = {
    defaultBoardSize: '19x19',
    showHoshi: true,
    coordinateSides: ['top', 'bottom', 'left', 'right'], // Используем строковые литералы, чтобы избежать циклической зависимости
};

interface ObsidianAppWithVersion extends App {
    version?: string;
}

export class GoBoardSettingTab extends PluginSettingTab {
    plugin: GoBoardPlugin;
    private boardContainer: HTMLDivElement | null = null;

    // GitHub issue template name (if template is created in .github/ISSUE_TEMPLATE/)
    // For example: 'bug_report.md' or 'feature_request.md'
    // If not specified, only body with system information will be used
    private readonly issueTemplateName?: string = 'bug_report.md';

    constructor(app: App, plugin: GoBoardPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        // Reset container reference as it was removed from DOM
        this.boardContainer = null;

        this.displayExampleBoard(containerEl);
        this.displaySettings(containerEl);
        this.displayGitHubLink(containerEl);
    }

    private displayExampleBoard(containerEl?: HTMLElement): void {
        const exampleSource = 'B(1) D3\nW(2) C5\n(A) C3\n(B) F3\n';
        // Use current settings to display the board
        const result = this.plugin.renderBoard(exampleSource, this.plugin.settings);
        if (!result.svg) {
            return;
        }
        const svg = result.svg;

        // If container already exists and is in DOM, update it
        if (this.boardContainer && this.boardContainer.parentElement) {
            this.boardContainer.empty();
            this.boardContainer.setAttribute('data-source', exampleSource);
            this.boardContainer.appendChild(svg);
        } else {
            // Create new container
            const boardContainer = document.createElement('div');
            boardContainer.classList.add('go-board-container', 'go-board-settings-example');
            boardContainer.setAttribute('data-source', exampleSource);
            boardContainer.appendChild(svg);

            if (containerEl) {
                containerEl.appendChild(boardContainer);
            }

            // Save container reference for subsequent updates
            this.boardContainer = boardContainer;
        }
    }

    private displaySettings(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName(t('settings.defaultBoardSize.name'))
            .setDesc(t('settings.defaultBoardSize.desc'))
            .addDropdown(dropdown => {
                Object.entries(BOARD_SIZES).forEach(([key, size]) => {
                    dropdown.addOption(key, size.title);
                });
                dropdown
                    .setValue(this.plugin.settings.defaultBoardSize)
                    .onChange(async (value: '9x9' | '13x13' | '19x19') => {
                        this.plugin.settings.defaultBoardSize = value;
                        await this.plugin.saveSettings();
                        this.displayExampleBoard(this.containerEl);
                    });
            });

        new Setting(containerEl)
            .setName(t('settings.displayHoshi.name'))
            .setDesc(t('settings.displayHoshi.desc'))
            .addToggle(toggle => {
                toggle
                    .setValue(this.plugin.settings.showHoshi)
                    .onChange(async (value: boolean) => {
                        this.plugin.settings.showHoshi = value;
                        await this.plugin.saveSettings();
                        this.displayExampleBoard(this.containerEl);
                    });
            });


        // Координаты - переключатели для каждой стороны доски
        const coordinateSides = this.plugin.settings.coordinateSides ||
            (this.plugin.settings.showCoordinates
                ? ['top', 'bottom', 'left', 'right']
                : []);

        new Setting(containerEl)
            .setName(t('settings.coordinateEdges.top.name'))
            .setDesc(t('settings.coordinateEdges.top.desc'))
            .addToggle(toggle => {
                toggle
                    .setValue(coordinateSides.includes('top'))
                    .onChange(async (value: boolean) => {
                        await updateCoordinateSide('top', value);
                        this.displayExampleBoard(this.containerEl);
                    });
            });

        new Setting(containerEl)
            .setName(t('settings.coordinateEdges.right.name'))
            .setDesc(t('settings.coordinateEdges.right.desc'))
            .addToggle(toggle => {
                toggle
                    .setValue(coordinateSides.includes('right'))
                    .onChange(async (value: boolean) => {
                        await updateCoordinateSide('right', value);
                        this.displayExampleBoard(this.containerEl);
                    });
            });

        new Setting(containerEl)
            .setName(t('settings.coordinateEdges.bottom.name'))
            .setDesc(t('settings.coordinateEdges.bottom.desc'))
            .addToggle(toggle => {
                toggle
                    .setValue(coordinateSides.includes('bottom'))
                    .onChange(async (value: boolean) => {
                        await updateCoordinateSide('bottom', value);
                        this.displayExampleBoard(this.containerEl);
                    });
            });

        new Setting(containerEl)
            .setName(t('settings.coordinateEdges.left.name'))
            .setDesc(t('settings.coordinateEdges.left.desc'))
            .addToggle(toggle => {
                toggle
                    .setValue(coordinateSides.includes('left'))
                    .onChange(async (value: boolean) => {
                        await updateCoordinateSide('left', value);
                        this.displayExampleBoard(this.containerEl);
                    });
            });

        const updateCoordinateSide = async (side: string, value: boolean) => {
            const currentSides = this.plugin.settings.coordinateSides ||
                (this.plugin.settings.showCoordinates !== undefined && typeof this.plugin.settings.showCoordinates === 'boolean'
                    ? (this.plugin.settings.showCoordinates
                        ? ['top', 'bottom', 'left', 'right']
                        : [])
                    : ['top', 'bottom', 'left', 'right']);

            const newSides = value
                ? [...currentSides.filter(s => s !== side), side]
                : currentSides.filter(s => s !== side);

            this.plugin.settings.coordinateSides = newSides;
            // Удаляем старое поле для обратной совместимости
            delete this.plugin.settings.showCoordinates;
            await this.plugin.saveSettings();
        };
    }

    private displayGitHubLink(containerEl: HTMLElement): void {
        // Examples link
        const examplesContainer = containerEl.createDiv();
        examplesContainer.addClass('go-board-settings-examples-link');

        const examplesText = examplesContainer.createEl('p');
        const examplesLink = examplesText.createEl('a', {
            text: t('examples.linkText'),
            href: t('examples.url')
        });
        examplesLink.setAttribute('target', '_blank');
        examplesLink.setAttribute('rel', 'noopener noreferrer');

        // GitHub issues link
        const issuesContainer = containerEl.createDiv();
        issuesContainer.addClass('go-board-settings-github-link');

        const issuesText = issuesContainer.createEl('p');
        issuesText.appendText(t('github.issuePrompt'));

        const issuesLink = issuesText.createEl('a', {
            text: t('github.createIssue'),
            href: this.buildGitHubIssueUrl(this.issueTemplateName)
        });
        issuesLink.setAttribute('target', '_blank');
        issuesLink.setAttribute('rel', 'noopener noreferrer');

        issuesText.appendText(t('github.issuePromptEnd'));
    }

    private buildGitHubIssueUrl(templateName?: string): string {
        const baseUrl = 'https://github.com/dsokolov/goboard/issues/new';
        const params = new URLSearchParams();

        // Get system information
        const systemInfo = this.getSystemInfo();

        // If template is specified, use it
        if (templateName) {
            params.set('template', templateName);
        }

        // Build issue body with system information
        // If template is used, system information is added at the end
        // If no template, create full structure
        const systemInfoSection = `## Environment

- **OS**: ${systemInfo.os}
- **OS Version**: ${systemInfo.osVersion}
- **Obsidian Version**: ${systemInfo.obsidianVersion}
- **GoBoard Plugin Version**: ${systemInfo.pluginVersion}`;

        const body = templateName
            ? `${systemInfoSection}\n\n<!-- Additional information about your issue or suggestion -->`
            : `${systemInfoSection}

## Description

<!-- Please describe your issue or suggestion here -->`;

        params.set('body', body);

        return `${baseUrl}?${params.toString()}`;
    }

    private getSystemInfo(): {
        os: string;
        osVersion: string;
        obsidianVersion: string;
        pluginVersion: string;
    } {
        // Detect OS using utility
        const osInfo = detectOS();

        // Obsidian version (may not be available through typed API)
        const obsidianVersion = (this.plugin.app as ObsidianAppWithVersion).version || 'Unknown';

        // Plugin version
        const pluginVersion = this.plugin.manifest.version || 'Unknown';

        return {
            os: osInfo.os,
            osVersion: osInfo.osVersion,
            obsidianVersion,
            pluginVersion,
        };
    }
}
