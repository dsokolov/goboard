import { Plugin, MarkdownRenderer, Setting, App, PluginSettingTab } from 'obsidian';
import { GoPluginSettings } from './data';
import { DEFAULT_SETTINGS } from './settings';
import { GoBoardRenderer } from './renderer';

export default class GoPlugin extends Plugin {
	settings: GoPluginSettings;
	renderer: GoBoardRenderer;

	async onload() {
		console.log('GoBoard: Plugin loading...');
		
		await this.loadSettings();
		
		this.renderer = new GoBoardRenderer(this.settings);
		
		// Регистрируем обработчик для блоков кода с языком 'goboard'
		this.registerMarkdownCodeBlockProcessor('goboard', (source, el, ctx) => {
			console.log('GoBoard: Processing goboard code block');
			this.renderer.render(source, el);
		});

		// Добавляем вкладку настроек
		this.addSettingTab(new GoSettingsTab(this.app, this));
		
		console.log('GoBoard: Plugin loaded successfully!');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// Обновляем рендерер с новыми настройками
		this.renderer = new GoBoardRenderer(this.settings);
	}
}

class GoSettingsTab extends PluginSettingTab {
	plugin: GoPlugin;

	constructor(app: App, plugin: GoPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'GoBoard Settings' });

		// Размер доски
		new Setting(containerEl)
			.setName('Board Size')
			.setDesc('Default board size (9, 13, or 19)')
			.addDropdown(dropdown => dropdown
				.addOption('9', '9x9')
				.addOption('13', '13x13')
				.addOption('19', '19x19')
				.setValue(this.plugin.settings.boardSize.toString())
				.onChange(async (value) => {
					this.plugin.settings.boardSize = parseInt(value);
					await this.plugin.saveSettings();
				}));

		// Использование цветов темы
		new Setting(containerEl)
			.setName('Use Theme Colors')
			.setDesc('Use colors from the current Obsidian theme')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useThemeColors)
				.onChange(async (value) => {
					this.plugin.settings.useThemeColors = value;
					await this.plugin.saveSettings();
					this.display(); // Обновляем интерфейс для показа/скрытия цветовых настроек
				}));

		// Размер камней
		new Setting(containerEl)
			.setName('Stone Size Ratio')
			.setDesc('Size of stones relative to cell size (0.1-1.0)')
			.addSlider(slider => slider
				.setLimits(0.1, 1.0, 0.1)
				.setValue(this.plugin.settings.stoneSizeRatio)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.stoneSizeRatio = value;
					await this.plugin.saveSettings();
				}));

		// Толщина линий
		new Setting(containerEl)
			.setName('Line Width')
			.setDesc('Thickness of board lines')
			.addSlider(slider => slider
				.setLimits(0.5, 3.0, 0.5)
				.setValue(this.plugin.settings.lineWidth)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.lineWidth = value;
					await this.plugin.saveSettings();
				}));

		// Цветовые настройки (только когда useThemeColors = false)
		if (!this.plugin.settings.useThemeColors) {
			// Цвет фона
			new Setting(containerEl)
				.setName('Background Color')
				.setDesc('Color of the board background')
				.addColorPicker(colorPicker => colorPicker
					.setValue(this.plugin.settings.backgroundColor)
					.onChange(async (value) => {
						this.plugin.settings.backgroundColor = value;
						await this.plugin.saveSettings();
					}));

			// Цвет линий
			new Setting(containerEl)
				.setName('Line Color')
				.setDesc('Color of the board lines')
				.addColorPicker(colorPicker => colorPicker
					.setValue(this.plugin.settings.lineColor)
					.onChange(async (value) => {
						this.plugin.settings.lineColor = value;
						await this.plugin.saveSettings();
					}));

			// Цвет черных камней
			new Setting(containerEl)
				.setName('Black Stone Color')
				.setDesc('Color of black stones')
				.addColorPicker(colorPicker => colorPicker
					.setValue(this.plugin.settings.blackStoneColor)
					.onChange(async (value) => {
						this.plugin.settings.blackStoneColor = value;
						await this.plugin.saveSettings();
					}));

			// Цвет белых камней
			new Setting(containerEl)
				.setName('White Stone Color')
				.setDesc('Color of white stones')
				.addColorPicker(colorPicker => colorPicker
					.setValue(this.plugin.settings.whiteStoneColor)
					.onChange(async (value) => {
						this.plugin.settings.whiteStoneColor = value;
						await this.plugin.saveSettings();
					}));
		}

		// Показать координаты
		new Setting(containerEl)
			.setName('Show Coordinates')
			.setDesc('Display coordinates on the board')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showCoordinates)
				.onChange(async (value) => {
					this.plugin.settings.showCoordinates = value;
					await this.plugin.saveSettings();
				}));

		// Цвет координат (только когда useThemeColors = false)
		if (!this.plugin.settings.useThemeColors) {
			new Setting(containerEl)
				.setName('Coordinates Color')
				.setDesc('Color of coordinate labels')
				.addColorPicker(colorPicker => colorPicker
					.setValue(this.plugin.settings.coordinatesColor)
					.onChange(async (value) => {
						this.plugin.settings.coordinatesColor = value;
						await this.plugin.saveSettings();
					}));
		}

		// Размер шрифта координат
		new Setting(containerEl)
			.setName('Coordinates Font Size')
			.setDesc('Font size of coordinate labels')
			.addSlider(slider => slider
				.setLimits(8, 20, 1)
				.setValue(this.plugin.settings.coordinatesFontSize)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.coordinatesFontSize = value;
					await this.plugin.saveSettings();
				}));

		// Кнопка сброса к настройкам по умолчанию
		new Setting(containerEl)
			.setName('Reset to Defaults')
			.setDesc('Reset all settings to default values')
			.addButton(button => button
				.setButtonText('Reset')
				.setCta()
				.onClick(async () => {
					this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
					await this.plugin.saveSettings();
					this.display(); // Обновляем интерфейс
				}));
	}
}

