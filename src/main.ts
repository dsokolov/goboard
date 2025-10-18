import { Plugin } from 'obsidian';
import { Renderer } from './renderer';
import { createRenderParams } from './models';
import { Parser } from './parser';
import { Mapper } from './mapper';
import { ParseSuccess } from './models';

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
		if (parseResult instanceof ParseSuccess) {
			const board = this.mapper.map(parseResult);
			const renderParams = createRenderParams();
			return this.renderer.render(board, renderParams);
		}
		return null;
	}

}
