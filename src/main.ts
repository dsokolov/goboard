import { Plugin } from 'obsidian';
import 'reflect-metadata';
import { Container } from 'typedi';
import type { Renderer } from './renderer/renderer';
import { RenderParams } from './renderer/data';
import type { Parser } from './parser/parser';
import type { Mapper } from './mapper/mapper';
import { ParseSuccess } from './parser/data';
import { DIContainer, ParserToken, MapperToken, RendererToken } from './di/container';
import { SchemeColorsProvider, SchemeColorsProviderToken } from './scheme-colors';

export default class GoBoardPlugin extends Plugin {

	private parser!: Parser;
	private mapper!: Mapper;
	private renderer!: Renderer;
	private schemeColorsProvider!: SchemeColorsProvider;

	async onload() {

		DIContainer.configure();
		this.parser = Container.get(ParserToken);
		this.mapper = Container.get(MapperToken);
		this.renderer = Container.get(RendererToken);
		this.schemeColorsProvider = Container.get(SchemeColorsProviderToken);
		
		this.registerMarkdownCodeBlockProcessor('goboard', (source, el, ctx) => {

			const parseResult = this.parser.parse(source);
			if (parseResult instanceof ParseSuccess) {
				const board = this.mapper.map(parseResult);
				const schemeColors = this.schemeColorsProvider.getColors();
				const renderColors = this.mapper.mapSchemeColorsToRenderColors(schemeColors);
				const renderParams = new RenderParams({
					colors: renderColors
				});
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
