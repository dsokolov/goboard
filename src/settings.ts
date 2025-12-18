import { App, PluginSettingTab, Setting } from 'obsidian';
import GoBoardPlugin from './main';
import { detectOS } from './osUtils';
// Не импортируем COORDINATE_SIDES, чтобы избежать циклической зависимости с models.ts
// Используем строковые литералы напрямую

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

		// Use Setting API for heading instead of creating HTML directly
		new Setting(containerEl)
			.setName('Configuration')
			.setHeading();

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
			.setName('Default board size')
			.setDesc('Select the default board size for new boards.')
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
			.setDesc('Show hoshi points on the board by default.')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.showHoshi)
					.onChange(async (value: boolean) => {
						this.plugin.settings.showHoshi = value;
						await this.plugin.saveSettings();
						this.displayExampleBoard(this.containerEl);
					});
			});

		// Координаты - группа чекбоксов для каждой стороны в одной строке
		const coordinateSides = this.plugin.settings.coordinateSides || 
			(this.plugin.settings.showCoordinates 
				? ['top', 'bottom', 'left', 'right']
				: []);

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
			this.displayExampleBoard(this.containerEl);
		};

		const coordinateSetting = new Setting(containerEl)
			.setName('Default coordinate state')
			.setDesc('Select which sides of the board should show coordinates by default.');
		
		// Добавляем класс для стилизации - находим последний setting-item элемент
		const settingItems = containerEl.querySelectorAll('.setting-item');
		if (settingItems.length > 0) {
			const lastSettingItem = settingItems[settingItems.length - 1] as HTMLElement;
			lastSettingItem.classList.add('go-board-coordinate-setting');
		}

		// Создаем контейнер для переключателей вертикально
		const checkboxesContainer = coordinateSetting.controlEl.createDiv();
		checkboxesContainer.classList.add('go-board-coordinate-toggles');
		checkboxesContainer.style.display = 'flex';
		checkboxesContainer.style.flexDirection = 'column';
		checkboxesContainer.style.gap = '12px';
		checkboxesContainer.style.alignItems = 'flex-start';

		const sides = [
			{ key: 'top', label: 'Top' },
			{ key: 'bottom', label: 'Bottom' },
			{ key: 'left', label: 'Left' },
			{ key: 'right', label: 'Right' }
		];

		sides.forEach(({ key, label }) => {
			const toggleWrapper = checkboxesContainer.createDiv();
			toggleWrapper.classList.add('go-board-coordinate-toggle-wrapper');
			toggleWrapper.style.display = 'flex';
			toggleWrapper.style.alignItems = 'center';
			toggleWrapper.style.gap = '12px';

			const labelEl = toggleWrapper.createEl('label', {
				text: label,
				attr: { for: `coordinate-${key}` }
			});
			labelEl.style.cursor = 'pointer';
			labelEl.style.margin = '0';
			labelEl.style.userSelect = 'none';
			labelEl.style.flex = '1';

			const toggleContainer = toggleWrapper.createDiv();
			toggleContainer.classList.add('go-board-coordinate-toggle');
			toggleContainer.setAttribute('data-key', key);
			toggleContainer.setAttribute('role', 'switch');
			toggleContainer.setAttribute('aria-checked', coordinateSides.includes(key) ? 'true' : 'false');
			toggleContainer.setAttribute('tabindex', '0');
			
			if (coordinateSides.includes(key)) {
				toggleContainer.classList.add('is-enabled');
			}

			const toggleSlider = toggleContainer.createDiv();
			toggleSlider.classList.add('go-board-coordinate-toggle-slider');

			const handleToggle = async (event?: Event) => {
				if (event) {
					event.preventDefault();
					event.stopPropagation();
				}
				const isEnabled = toggleContainer.classList.contains('is-enabled');
				const newState = !isEnabled;
				
				await updateCoordinateSide(key, newState);
				
				// Обновляем состояние всех переключателей после изменения
				sides.forEach(({ key: k }) => {
					const toggle = checkboxesContainer.querySelector(`[data-key="${k}"]`) as HTMLElement;
					if (toggle) {
						const currentSides = this.plugin.settings.coordinateSides || [];
						const shouldBeEnabled = currentSides.includes(k);
						toggle.classList.toggle('is-enabled', shouldBeEnabled);
						toggle.setAttribute('aria-checked', shouldBeEnabled ? 'true' : 'false');
					}
				});
			};

			toggleContainer.addEventListener('click', handleToggle);
			toggleContainer.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					handleToggle(e);
				}
			});
			labelEl.addEventListener('click', handleToggle);
		});
	}

	private displayGitHubLink(containerEl: HTMLElement): void {
		const issuesContainer = containerEl.createDiv();
		issuesContainer.addClass('go-board-settings-github-link');
		
		const issuesText = issuesContainer.createEl('p');
		issuesText.appendText('If you found a bug or have a suggestion, please don\'t hesitate to ');
		
		const issuesLink = issuesText.createEl('a', {
			text: 'Create an issue on GitHub',
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

