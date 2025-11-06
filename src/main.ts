import { Plugin } from 'obsidian';
import { Renderer } from './renderer';
import { createRenderParams } from './models';
import { Parser } from './parser';
import { Mapper } from './mapper';
import { GoBoardPluginSettings, DEFAULT_SETTINGS, GoBoardSettingTab } from './settings';

export default class GoBoardPlugin extends Plugin {

	private parser!: Parser;
	private mapper!: Mapper;
	private renderer!: Renderer;
	settings: GoBoardPluginSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();

		this.parser = new Parser();
		this.mapper = new Mapper();
		this.renderer = new Renderer();
		
		this.addSettingTab(new GoBoardSettingTab(this.app, this));
		
		this.registerMarkdownCodeBlockProcessor('goboard', (source, el, _ctx) => {
			const svg = this.renderBoard(source, this.settings);
			if (svg) {
				const boardContainer = document.createElement('div');
				boardContainer.classList.add('go-board-container');
				boardContainer.setAttribute('data-source', source);
				boardContainer.appendChild(svg);
				el.appendChild(boardContainer);
			}
		});
	}

	async loadSettings() {
		try {
			const loadedData = await this.loadData();
			this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
		} catch (error) {
			console.error('Failed to load GoBoard settings, using defaults:', error);
			this.settings = Object.assign({}, DEFAULT_SETTINGS);
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	renderBoard(source: string, settings: GoBoardPluginSettings = DEFAULT_SETTINGS): SVGElement | null {
		const parseResult = this.parser.parse(source, settings);
		
		// Check for parsing errors
		if (parseResult.errors.length > 0) {
			console.error('Go Board parse errors:', parseResult.errors.map(e => `Line ${e.line}: ${e.message}`).join('; '));
			// Return null to avoid displaying incorrect board
			return null;
		}
		
		try {
			const board = this.mapper.map(parseResult);
			const renderParams = createRenderParams();
			return this.renderer.render(board, renderParams);
		} catch (error) {
			console.error('Go Board rendering error:', error);
			return null;
		}
	}

}
