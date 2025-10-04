import { GoPluginSettings, BoardPosition, GoGame } from '../data';
import { BoardDimensions } from './BoardCalculationService';
import { ColorService, StoneStyle } from './ColorService';

export class ElementFactory {
	private colorService: ColorService;

	constructor(colorService: ColorService) {
		this.colorService = colorService;
	}

	/**
	 * Создает фон доски
	 */
	createBoardBackground(dimensions: BoardDimensions, settings: GoPluginSettings): SVGElement {
		const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		background.setAttribute('x', dimensions.padding.toString());
		background.setAttribute('y', dimensions.padding.toString());
		background.setAttribute('width', dimensions.boardSize.toString());
		background.setAttribute('height', dimensions.boardSize.toString());
		background.setAttribute('fill', this.colorService.getBoardBackgroundColor(settings));
		
		return background;
	}

	/**
	 * Создает линии доски
	 */
	createBoardLines(game: GoGame, dimensions: BoardDimensions, settings: GoPluginSettings): SVGElement[] {
		const lines: SVGElement[] = [];
		const lineColor = this.colorService.getBoardLineColor(settings);
		const strokeWidth = settings.lineWidth.toString();

		for (let i = 1; i <= game.boardSize.width; i++) {
			const pos = dimensions.padding + i * dimensions.cellSize;
			
			// Вертикальные линии
			const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			vLine.setAttribute('x1', pos.toString());
			vLine.setAttribute('y1', (dimensions.padding + dimensions.cellSize).toString());
			vLine.setAttribute('x2', pos.toString());
			vLine.setAttribute('y2', (dimensions.padding + game.boardSize.width * dimensions.cellSize).toString());
			vLine.setAttribute('stroke', lineColor);
			vLine.setAttribute('stroke-width', strokeWidth);
			lines.push(vLine);

			// Горизонтальные линии
			const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			hLine.setAttribute('x1', (dimensions.padding + dimensions.cellSize).toString());
			hLine.setAttribute('y1', pos.toString());
			hLine.setAttribute('x2', (dimensions.padding + game.boardSize.width * dimensions.cellSize).toString());
			hLine.setAttribute('y2', pos.toString());
			hLine.setAttribute('stroke', lineColor);
			hLine.setAttribute('stroke-width', strokeWidth);
			lines.push(hLine);
		}

		return lines;
	}

	/**
	 * Создает камень на доске
	 */
	createStone(position: BoardPosition, stoneColor: 'black' | 'white', 
				dimensions: BoardDimensions, containerEl: HTMLElement, 
				boardSize: number, settings: GoPluginSettings): SVGElement {
		const x = dimensions.padding + (position.x + 1) * dimensions.cellSize;
		const y = dimensions.padding + (boardSize - position.y) * dimensions.cellSize;

		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		circle.setAttribute('cx', x.toString());
		circle.setAttribute('cy', y.toString());
		circle.setAttribute('r', dimensions.stoneRadius.toString());
		
		const style = this.colorService.getStoneStyle(stoneColor, containerEl, settings);
		circle.setAttribute('fill', style.fill);
		circle.setAttribute('stroke', style.stroke);
		circle.setAttribute('stroke-width', style.strokeWidth);
		
		return circle;
	}

	/**
	 * Создает координаты на доске
	 */
	createCoordinates(boardSize: number, cellSize: number, padding: number, settings: GoPluginSettings): SVGElement[] {
		const coordinates: SVGElement[] = [];
		const color = this.colorService.getCoordinatesColor(settings);
		const fontSize = settings.coordinatesFontSize.toString();

		// Буквы по горизонтали (A, B, C, ...) - снизу доски
		for (let i = 0; i < boardSize; i++) {
			const x = padding + (i + 1) * cellSize;
			const y = padding + (boardSize + 1) * cellSize + cellSize * 0.2;
			
			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute('x', x.toString());
			text.setAttribute('y', y.toString());
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('dominant-baseline', 'middle');
			text.setAttribute('font-size', fontSize);
			text.setAttribute('fill', color);
			text.setAttribute('font-family', 'Arial, sans-serif');
			text.textContent = String.fromCharCode('A'.charCodeAt(0) + i);
			coordinates.push(text);
		}

		// Цифры по вертикали (1, 2, 3, ...) - слева от доски, снизу вверх
		for (let i = 0; i < boardSize; i++) {
			const x = padding + cellSize * 0.2;
			const y = padding + (boardSize - i) * cellSize;
			
			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute('x', x.toString());
			text.setAttribute('y', y.toString());
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('dominant-baseline', 'middle');
			text.setAttribute('font-size', fontSize);
			text.setAttribute('fill', color);
			text.setAttribute('font-family', 'Arial, sans-serif');
			text.textContent = (i + 1).toString();
			coordinates.push(text);
		}

		return coordinates;
	}
}
