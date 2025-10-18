import { Plugin } from 'obsidian';
import { Renderer } from './renderer';
import { RenderParams } from './models';
import { Parser } from './parser';
import { Mapper } from './mapper';
import { ParseSuccess } from './models';

export default class GoBoardPlugin extends Plugin {

	private parser!: Parser;
	private mapper!: Mapper;
	private renderer!: Renderer;
	private isDarkTheme: boolean = false;

	async onload() {

		this.parser = new Parser();
		this.mapper = new Mapper();
		this.renderer = new Renderer();
		
		// Определяем текущую тему
		this.updateThemeState();
		
		// Подписываемся на изменения CSS (включая смену темы)
		this.registerEvent(
			this.app.workspace.on('css-change', this.handleThemeChange)
		);
		
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
			const renderParams = new RenderParams({
				isDarkTheme: this.isDarkTheme
			});
			return this.renderer.render(board, renderParams);
		}
		return null;
	}

	private updateThemeState(): void {
		// Проверяем, содержит ли body класс для тёмной темы
		this.isDarkTheme = document.body.classList.contains('theme-dark');
	}

	private handleThemeChange = (): void => {
		const wasDarkTheme = this.isDarkTheme;
		this.updateThemeState();
		
		// Если тема изменилась, обновляем все доски
		if (wasDarkTheme !== this.isDarkTheme) {
			this.updateAllBoards();
		}
	};

	private updateAllBoards(): void {
		// Находим все контейнеры досок и обновляем их
		const boardContainers = document.querySelectorAll('.go-board-container');
		
		boardContainers.forEach(container => {
			const source = container.getAttribute('data-source');
			if (source) {
				const svg = this.renderBoard(source);
				if (svg) {
					// Заменяем старый SVG на новый
					container.innerHTML = '';
					container.appendChild(svg);
				}
			}
		});
	}
}
