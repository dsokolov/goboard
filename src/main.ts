import { Plugin, MarkdownRenderer, Setting, App, PluginSettingTab } from 'obsidian';
import { GoPluginSettings } from './data';
import { DEFAULT_SETTINGS } from './settings';
import { GoBoardRenderer } from './renderer';
import { createThemeChangeListener } from './theme';
import { GoSettingsTab } from './settings-tab';

export default class GoBoardPlugin extends Plugin {
	settings: GoPluginSettings;
	renderer: GoBoardRenderer;
	private themeChangeListener: { disconnect: () => void } | null = null;

	async onload() {
		await this.loadSettings();
		
		this.renderer = new GoBoardRenderer(this.app);
		this.renderer.updateSettings(this.settings);
		
		// Регистрируем обработчик для блоков кода с языком 'goboard'
		this.registerMarkdownCodeBlockProcessor('goboard', (source, el, ctx) => {
			this.renderer.render(source, el);
		});

		// Добавляем слушатель для смены темы
		this.addThemeChangeListener();

		// Добавляем вкладку настроек
		this.addSettingTab(new GoSettingsTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// Обновляем настройки рендерера
		this.renderer.updateSettings(this.settings);
		// Перерисовываем все диаграммы с новыми настройками
		this.rerenderAllDiagrams();
	}

	onunload() {
		// Очищаем слушатель изменений темы
		if (this.themeChangeListener) {
			this.themeChangeListener.disconnect();
			this.themeChangeListener = null;
		}
	}

	private addThemeChangeListener() {
		this.themeChangeListener = createThemeChangeListener(() => {
			this.rerenderAllDiagrams();
		});
	}

	private rerenderAllDiagrams() {
		// Находим все контейнеры с диаграммами Го
		const goBoardContainers = document.querySelectorAll('.go-board-container');
		
		goBoardContainers.forEach(container => {
			const parent = container.parentElement;
			if (parent) {
				// Получаем исходный код из data-атрибута
				const source = container.getAttribute('data-source');
				if (source) {
					// Очищаем контейнер и перерисовываем
					parent.innerHTML = '';
					this.renderer.render(source, parent);
				}
			}
		});
	}
}


