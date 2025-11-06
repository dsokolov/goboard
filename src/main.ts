import { Plugin } from 'obsidian';
import { Renderer } from './renderer';
import { createRenderParams, ParseError } from './models';
import { Parser } from './parser';
import { Mapper } from './mapper';
import { GoBoardPluginSettings, DEFAULT_SETTINGS, GoBoardSettingTab } from './settings';

type RenderResult = {
	svg: SVGElement | null;
	parseErrors: ParseError[];
	exceptionError: string | null;
};

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
			const result = this.renderBoard(source, this.settings);
			
			// Отображаем доску, если она есть
			if (result.svg) {
				const boardContainer = document.createElement('div');
				boardContainer.classList.add('go-board-container');
				boardContainer.setAttribute('data-source', source);
				boardContainer.appendChild(result.svg);
				el.appendChild(boardContainer);
			}
			
			// Отображаем ошибки парсинга, если они есть
			if (result.parseErrors.length > 0) {
				result.parseErrors.forEach(error => {
					const errorBlock = document.createElement('div');
					errorBlock.classList.add('go-board-error');
					errorBlock.textContent = `Строка ${error.line}: ${error.message}`;
					el.appendChild(errorBlock);
				});
			}
			
			// Отображаем ошибку исключения, если она есть
			if (result.exceptionError) {
				const errorBlock = document.createElement('div');
				errorBlock.classList.add('go-board-error');
				errorBlock.textContent = result.exceptionError;
				el.appendChild(errorBlock);
			}
		});
	}

	async loadSettings() {
		try {
			const loadedData = await this.loadData() as Partial<GoBoardPluginSettings> | null;
			this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
		} catch (error) {
			console.error('Failed to load GoBoard settings, using defaults:', error);
			this.settings = Object.assign({}, DEFAULT_SETTINGS);
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	renderBoard(source: string, settings: GoBoardPluginSettings = DEFAULT_SETTINGS): RenderResult {
		const parseResult = this.parser.parse(source, settings);
		
		// Если есть ошибки парсинга, возвращаем их
		if (parseResult.errors.length > 0) {
			console.error('Go Board parse errors:', parseResult.errors.map(e => `Line ${e.line}: ${e.message}`).join('; '));
			return {
				svg: null,
				parseErrors: parseResult.errors,
				exceptionError: null
			};
		}
		
		try {
			const board = this.mapper.map(parseResult);
			const renderParams = createRenderParams();
			const svg = this.renderer.render(board, renderParams);
			return {
				svg,
				parseErrors: [],
				exceptionError: null
			};
		} catch (error) {
			console.error('Go Board rendering error:', error);
			const errorMessage = error instanceof Error ? error.message : String(error);
			return {
				svg: null,
				parseErrors: [],
				exceptionError: errorMessage
			};
		}
	}

}
