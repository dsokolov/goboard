import { GoGame, Move, BoardPosition, GoPluginSettings } from '../data';
import { BoardDimensions } from './BoardCalculationService';
import { ElementFactory } from './ElementFactory';
import { GoGameParser } from '../parser';

export class SVGBuilder {
	private svg: SVGElement;
	private elementFactory: ElementFactory;
	private parser: GoGameParser;

	constructor(elementFactory: ElementFactory, parser: GoGameParser) {
		this.elementFactory = elementFactory;
		this.parser = parser;
	}

	/**
	 * Создает SVG элемент с базовыми настройками
	 */
	createSVG(dimensions: BoardDimensions): SVGBuilder {
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svg.setAttribute('width', dimensions.totalSize.toString());
		this.svg.setAttribute('height', dimensions.totalSize.toString());
		this.svg.setAttribute('viewBox', `0 0 ${dimensions.totalSize} ${dimensions.totalSize}`);
		this.svg.classList.add('go-board-svg');
		return this;
	}

	/**
	 * Добавляет фон доски
	 */
	addBoardBackground(dimensions: BoardDimensions, settings: GoPluginSettings): SVGBuilder {
		const background = this.elementFactory.createBoardBackground(dimensions, settings);
		this.svg.appendChild(background);
		return this;
	}

	/**
	 * Добавляет линии доски
	 */
	addBoardLines(game: GoGame, dimensions: BoardDimensions, settings: GoPluginSettings): SVGBuilder {
		const lines = this.elementFactory.createBoardLines(game, dimensions, settings);
		lines.forEach(line => this.svg.appendChild(line));
		return this;
	}

	/**
	 * Добавляет камни на доску
	 */
	addStones(moves: Move[], dimensions: BoardDimensions, containerEl: HTMLElement, 
			  boardSize: number, settings: GoPluginSettings): SVGBuilder {
		for (const move of moves) {
			const pos = this.parser.positionToCoords(move.stone.position, boardSize);
			if (pos) {
				const stone = this.elementFactory.createStone(pos, move.stone.color, dimensions, containerEl, boardSize, settings);
				this.svg.appendChild(stone);
			}
		}
		return this;
	}

	/**
	 * Добавляет координаты на доску
	 */
	addCoordinates(boardSize: number, cellSize: number, padding: number, settings: GoPluginSettings): SVGBuilder {
		if (settings.showCoordinates) {
			const coordinates = this.elementFactory.createCoordinates(boardSize, cellSize, padding, settings);
			coordinates.forEach(coord => this.svg.appendChild(coord));
		}
		return this;
	}

	/**
	 * Создает полную доску с игрой
	 */
	createBoard(game: GoGame, dimensions: BoardDimensions, containerEl: HTMLElement, settings: GoPluginSettings): SVGBuilder {
		this.createSVG(dimensions)
			.addBoardBackground(dimensions, settings)
			.addBoardLines(game, dimensions, settings)
			.addCoordinates(game.boardSize.width, dimensions.cellSize, dimensions.padding, settings)
			.addStones(game.moves, dimensions, containerEl, game.boardSize.width, settings);
		return this;
	}

	/**
	 * Возвращает построенный SVG элемент
	 */
	build(): SVGElement {
		return this.svg;
	}

	/**
	 * Очищает камни с доски (для перерисовки)
	 */
	clearStones(): SVGBuilder {
		const circles = this.svg.querySelectorAll('circle');
		circles.forEach(circle => circle.remove());
		return this;
	}

	/**
	 * Добавляет камни заново (для перерисовки)
	 */
	rerenderStones(moves: Move[], dimensions: BoardDimensions, containerEl: HTMLElement, 
				   boardSize: number, settings: GoPluginSettings): SVGBuilder {
		this.clearStones();
		return this.addStones(moves, dimensions, containerEl, boardSize, settings);
	}
}
