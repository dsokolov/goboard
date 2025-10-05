import { Plugin } from 'obsidian';
import { createRenderer } from './renderer/renderer';
import { RenderParams } from './renderer/data';
import { createParser } from './parser/parser';
import { createMapper } from './mapper/mapper';
import { ParseSuccess } from './parser/data';

export default class GoBoardPlugin extends Plugin {

	private parser = createParser();
	private mapper = createMapper();
	private renderer = createRenderer();

	async onload() {

		this.registerMarkdownCodeBlockProcessor('goboard', (source, el, ctx) => {

			const parseResult = this.parser.parse(source);
			if (parseResult instanceof ParseSuccess) {
				const board = this.mapper.map(parseResult);
				const renderParams = new RenderParams();
				const svg = this.renderer.render(board, renderParams);

				const boardContainer = document.createElement('div');
				boardContainer.classList.add('go-board-container');
				boardContainer.setAttribute('data-source', source);
				boardContainer.appendChild(svg);
				el.appendChild(boardContainer);
			}
		});
	}
}
