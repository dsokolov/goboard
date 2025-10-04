import { GoPluginSettings, Stone, Move, GoGame, BoardPosition } from './data';
import { Toolbar } from './toolbar';
import { App } from 'obsidian';
import { GoGameParser } from './parser';
import { ColorService } from './services/ColorService';
import { FileService } from './services/FileService';
import { BoardCalculationService, BoardDimensions } from './services/BoardCalculationService';
import { ElementFactory } from './services/ElementFactory';
import { SVGBuilder } from './services/SVGBuilder';

export class GoBoardRenderer {
	private settings: GoPluginSettings | null = null;
	private toolbar: Toolbar | null = null;
	private parser: GoGameParser | null = null;
	private app: App;
	private colorService: ColorService;
	private fileService: FileService;
	private boardCalculationService: BoardCalculationService;
	private elementFactory: ElementFactory;
	private svgBuilder: SVGBuilder;

	constructor(app: App) {
		this.app = app;
		this.colorService = new ColorService();
		this.boardCalculationService = new BoardCalculationService();
		this.elementFactory = new ElementFactory(this.colorService);
	}

	updateSettings(settings: GoPluginSettings) {
		this.settings = settings;
		this.parser = new GoGameParser();
		this.toolbar = new Toolbar(settings);
		this.fileService = new FileService(this.app, this.parser);
		this.svgBuilder = new SVGBuilder(this.elementFactory, this.parser);
		
		// Очищаем кэш размеров при изменении настроек
		this.boardCalculationService.clearCache();
		
		// Устанавливаем callback для изменения типа камня
		this.toolbar.setStoneTypeChangeCallback((stoneType: 'black' | 'white' | null, container: HTMLElement) => {
			// Обновляем курсор в зависимости от выбранного типа камня
			this.updateCursor(stoneType, container);
		});
	}


	render(source: string, containerEl: HTMLElement): void {
		this.validateRendererState();
		
		try {
			const game = this.parser!.parseGame(source, this.settings!.boardSize, this.settings!.showCoordinates);
			
			const boardContainer = this.createBoardContainer(source);
			const toolbar = this.toolbar!.createToolbar(source, containerEl);
			const svg = this.generateSVG(game, containerEl);
			
			this.addClickHandler(svg, game, boardContainer, source);
			
			boardContainer.appendChild(svg);
			boardContainer.appendChild(toolbar);
			containerEl.appendChild(boardContainer);
		} catch (error) {
			console.error('Error rendering Go board:', error);
			this.showErrorMessage(containerEl, 'Failed to render Go board');
		}
	}

	/**
	 * Валидирует состояние рендерера
	 */
	private validateRendererState(): void {
		if (!this.parser || !this.toolbar || !this.settings) {
			throw new Error('Renderer not initialized. Call updateSettings() first.');
		}
	}

	/**
	 * Создает контейнер для доски
	 */
	private createBoardContainer(source: string): HTMLElement {
		const boardContainer = document.createElement('div');
		boardContainer.classList.add('go-board-container');
		boardContainer.setAttribute('data-source', source);
		return boardContainer;
	}

	/**
	 * Показывает сообщение об ошибке
	 */
	private showErrorMessage(containerEl: HTMLElement, message: string): void {
		const errorDiv = document.createElement('div');
		errorDiv.classList.add('go-board-error');
		errorDiv.textContent = message;
		errorDiv.style.color = 'var(--text-error)';
		errorDiv.style.padding = '10px';
		errorDiv.style.border = '1px solid var(--text-error)';
		errorDiv.style.borderRadius = '4px';
		containerEl.appendChild(errorDiv);
	}


	private generateSVG(game: GoGame, containerEl: HTMLElement): SVGElement {
		if (!this.settings) {
			throw new Error('Settings not initialized');
		}
		
		const dimensions = this.boardCalculationService.calculateDimensions(game, containerEl, this.settings);
		
		return this.svgBuilder
			.createBoard(game, dimensions, containerEl, this.settings)
			.build();
	}

	private updateCursor(stoneType: 'black' | 'white' | null, container: HTMLElement) {
		const svg = container.querySelector('.go-board-svg') as SVGElement;
		if (!svg) return;
		
		if (stoneType) {
			svg.style.cursor = 'crosshair';
		} else {
			svg.style.cursor = 'default';
		}
	}

	private async placeStone(x: number, y: number, color: 'black' | 'white', game: GoGame, boardContainer: HTMLElement, source: string): Promise<void> {
		if (!this.parser) return;
		
		try {
			// Удаляем существующий камень в этой позиции
			this.removeStoneAtPosition(x, y, game);
			
			// Добавляем новый камень
			const position = this.parser.coordsToPosition(x, y);
			const newMove: Move = {
				stone: { color, position },
				moveNumber: game.moves.length + 1
			};
			
			game.moves.push(newMove);
			
			// Обновляем содержимое блока кода
			await this.fileService.updateCodeBlock(game, source);
			
			// Перерисовываем диаграмму
			this.rerender(game, boardContainer);
		} catch (error) {
			console.error('Error placing stone:', error);
		}
	}

	private removeStoneAtPosition(x: number, y: number, game: GoGame) {
		if (!this.parser) return;
		
		game.moves = game.moves.filter(move => {
			const pos = this.parser!.positionToCoords(move.stone.position, game.boardSize.width);
			return !(pos && pos.x === x && pos.y === y);
		});
	}

	private rerender(game: GoGame, boardContainer: HTMLElement): void {
		if (!this.parser || !this.settings) return;
		
		try {
			const svg = boardContainer.querySelector('.go-board-svg') as SVGElement;
			if (!svg) {
				console.warn('SVG element not found for rerender');
				return;
			}
			
			const dimensions = this.boardCalculationService.calculateDimensions(game, boardContainer, this.settings);
			
			// Очищаем камни и добавляем заново
			const circles = svg.querySelectorAll('circle');
			circles.forEach(circle => circle.remove());
			
			// Добавляем камни заново
			for (const move of game.moves) {
				const pos = this.parser.positionToCoords(move.stone.position, game.boardSize.width);
				if (pos) {
					const stone = this.elementFactory.createStone(pos, move.stone.color, dimensions, boardContainer, game.boardSize.width, this.settings);
					svg.appendChild(stone);
				}
			}
		} catch (error) {
			console.error('Error during rerender:', error);
		}
	}








	private addClickHandler(svg: SVGElement, game: GoGame, boardContainer: HTMLElement, source: string): void {
		svg.addEventListener('click', (event) => {
			if (!this.toolbar) return;
			
			try {
				const boardPosition = this.getBoardPositionFromClick(event, svg, game, boardContainer);
				if (!boardPosition) return;
				
				const selectedStoneType = this.toolbar.getSelectedStoneType();
				if (selectedStoneType) {
					this.placeStone(boardPosition.x, boardPosition.y, selectedStoneType, game, boardContainer, source);
				}
			} catch (error) {
				console.error('Error handling click:', error);
			}
		});
	}

	/**
	 * Получает позицию на доске из координат клика
	 */
	private getBoardPositionFromClick(event: MouseEvent, svg: SVGElement, game: GoGame, boardContainer: HTMLElement): BoardPosition | null {
		if (!this.settings) return null;
		
		const rect = svg.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		const dimensions = this.boardCalculationService.calculateDimensions(game, boardContainer, this.settings);
		const boardX = Math.round((x - dimensions.padding) / dimensions.cellSize) - 1;
		const boardY = game.boardSize.width - Math.round((y - dimensions.padding) / dimensions.cellSize);
		
		// Проверяем, что клик был внутри доски
		if (boardX >= 0 && boardX < game.boardSize.width && boardY >= 0 && boardY < game.boardSize.width) {
			return { x: boardX, y: boardY };
		}
		
		return null;
	}

	private getMoveAtPosition(game: GoGame, x: number, y: number): number | null {
		if (!this.parser) return null;
		
		for (const move of game.moves) {
			const pos = this.parser.positionToCoords(move.stone.position, game.boardSize.width);
			if (pos && pos.x === x && pos.y === y) {
				return move.moveNumber;
			}
		}
		return null;
	}
}
