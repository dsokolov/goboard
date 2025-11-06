import { App, PluginSettingTab, Setting } from 'obsidian';
import GoBoardPlugin from './main';
import { detectOS } from './osUtils';

export interface BoardSizeOption {
	title: string;
	width: number;
	height: number;
}

export const BOARD_SIZES: Record<'9x9' | '13x13' | '19x19', BoardSizeOption> = {
	'9x9': { title: '9x9', width: 9, height: 9 },
	'13x13': { title: '13x13', width: 13, height: 13 },
	'19x19': { title: '19x19', width: 19, height: 19 },
};

export interface GoBoardPluginSettings {
	defaultBoardSize: '9x9' | '13x13' | '19x19';
	showHoshi: boolean;
	showCoordinates: boolean;
}

export const DEFAULT_SETTINGS: GoBoardPluginSettings = {
	defaultBoardSize: '19x19',
	showHoshi: true,
	showCoordinates: true,
};

interface ObsidianAppWithVersion extends App {
	version?: string;
}

export class GoBoardSettingTab extends PluginSettingTab {
	plugin: GoBoardPlugin;
	private boardContainer: HTMLElement | null = null;
	
	// GitHub issue template name (if template is created in .github/ISSUE_TEMPLATE/)
	// For example: 'bug_report.md' or 'feature_request.md'
	// If not specified, only body with system information will be used
	private readonly issueTemplateName?: string = 'bug_report.md';

	constructor(app: App, plugin: GoBoardPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		
		// Reset container reference as it was removed from DOM
		this.boardContainer = null;

		containerEl.createEl('h2', { text: 'GoBoard Settings' });

		this.displayExampleBoard(containerEl);
		this.displaySettings(containerEl);
		this.displayGitHubLink(containerEl);
	}

	private displayExampleBoard(containerEl?: HTMLElement): void {
		const exampleSource = 'B(1) D3\nW(2) C5\n(A) C3\n(B) F3\n';
		// Use current settings to display the board
		const svg = this.plugin.renderBoard(exampleSource, this.plugin.settings);
		if (!svg) {
			return;
		}

		// If container already exists and is in DOM, update it
		if (this.boardContainer && this.boardContainer.parentElement) {
			this.boardContainer.empty();
			this.boardContainer.setAttribute('data-source', exampleSource);
			this.boardContainer.appendChild(svg);
		} else {
			// Create new container
			const boardContainer = document.createElement('div');
			boardContainer.classList.add('go-board-container');
			boardContainer.setAttribute('data-source', exampleSource);
			boardContainer.style.marginBottom = '2em';
			boardContainer.style.marginLeft = 'auto';
			boardContainer.style.marginRight = 'auto';
			boardContainer.style.maxWidth = '33.33%';
			boardContainer.style.width = '33.33%';
			boardContainer.appendChild(svg);
			
			if (containerEl) {
				containerEl.appendChild(boardContainer);
			}
			
			// Save container reference for subsequent updates
			this.boardContainer = boardContainer;
		}
		
		// Set SVG styles to preserve aspect ratio
		svg.style.width = '100%';
		svg.style.height = 'auto';
		svg.style.maxWidth = '100%';
	}

	private displaySettings(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName('Default board size')
			.setDesc('Select the default board size for new boards')
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
			.setName('Display hoshi')
			.setDesc('Show hoshi points on the board by default')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.showHoshi)
					.onChange(async (value: boolean) => {
						this.plugin.settings.showHoshi = value;
						await this.plugin.saveSettings();
						this.displayExampleBoard(this.containerEl);
					});
			});

		new Setting(containerEl)
			.setName('Display coordinates')
			.setDesc('Show coordinates on the board by default')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.showCoordinates)
					.onChange(async (value: boolean) => {
						this.plugin.settings.showCoordinates = value;
						await this.plugin.saveSettings();
						this.displayExampleBoard(this.containerEl);
					});
			});
	}

	private displayGitHubLink(containerEl: HTMLElement): void {
		const issuesContainer = containerEl.createDiv();
		issuesContainer.style.marginTop = '2em';
		issuesContainer.style.paddingTop = '2em';
		issuesContainer.style.borderTop = '1px solid var(--background-modifier-border)';
		
		const issuesText = issuesContainer.createEl('p');
		issuesText.appendText('If you found a bug or have a suggestion, please don\'t hesitate to ');
		
		const issuesLink = issuesText.createEl('a', {
			text: 'create an issue on GitHub',
			href: this.buildGitHubIssueUrl(this.issueTemplateName)
		});
		issuesLink.setAttribute('target', '_blank');
		issuesLink.setAttribute('rel', 'noopener noreferrer');
		
		issuesText.appendText('.');
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

