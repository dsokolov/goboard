import { Plugin } from 'obsidian';
import { Renderer } from './renderer';
import { createRenderParams } from './models';
import { Parser } from './parser';
import { Mapper } from './mapper';
import { ParseResult } from './models';

export default class GoBoardPlugin extends Plugin {

	private parser!: Parser;
	private mapper!: Mapper;
	private renderer!: Renderer;

	async onload() {

		this.parser = new Parser();
		this.mapper = new Mapper();
		this.renderer = new Renderer();
		
		
		this.registerMarkdownCodeBlockProcessor('goboard', (source, el, ctx) => {
			const svg = this.renderBoard(source);
			if (svg) {
				const boardContainer = document.createElement('div');
				boardContainer.classList.add('go-board-container');
				boardContainer.setAttribute('data-source', source);
				boardContainer.appendChild(svg);
				el.appendChild(boardContainer);
			}
		});
	}

	private renderBoard(source: string): SVGElement | null {
		const parseResult = this.parser.parse(source);
		
		// Проверяем наличие ошибок парсинга
		if (parseResult.errors.length > 0) {
			console.error('Go Board parse errors:', parseResult.errors.map(e => `Line ${e.line}: ${e.message}`).join('; '));
			// Возвращаем null, чтобы не отображать некорректную доску
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
