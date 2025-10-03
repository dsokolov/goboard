import { Plugin, MarkdownRenderer } from 'obsidian';
import { GoPluginSettings } from './data';
import { DEFAULT_SETTINGS } from './settings';
import { GoBoardRenderer } from './renderer';

export default class GoPlugin extends Plugin {
	settings: GoPluginSettings;
	renderer: GoBoardRenderer;

	async onload() {
		await this.loadSettings();
		
		this.renderer = new GoBoardRenderer(this.settings);
		
		// Регистрируем обработчик для блоков кода с языком 'go'
		this.registerMarkdownCodeBlockProcessor('go', (source, el, ctx) => {
			this.renderer.render(source, el);
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

