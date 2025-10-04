import { GoPluginSettings, Stone, Move, GoGame } from './data';
import { Toolbar } from './toolbar';
import { App } from 'obsidian';
import { isDarkTheme, getThemeColors, ThemeColors } from './theme';
import { GoGameParser } from './parser';

// Интерфейсы для лучшей типизации
interface BoardDimensions {
	boardSize: number;
	cellSize: number;
	stoneRadius: number;
	padding: number;
	totalSize: number;
}

interface BoardPosition {
	x: number;
	y: number;
}

interface StoneStyle {
	fill: string;
	stroke: string;
	strokeWidth: string;
}

export class GoBoardRenderer {
	private settings: GoPluginSettings | null = null;
	private toolbar: Toolbar | null = null;
	private parser: GoGameParser | null = null;
	private app: App;
	private cachedDimensions: BoardDimensions | null = null;

	constructor(app: App) {
		this.app = app;
	}

	updateSettings(settings: GoPluginSettings) {
		this.settings = settings;
		this.parser = new GoGameParser();
		this.toolbar = new Toolbar(settings);
		
		// Очищаем кэш размеров при изменении настроек
		this.cachedDimensions = null;
		
		// Устанавливаем callback для изменения типа камня
		this.toolbar.setStoneTypeChangeCallback((stoneType: 'black' | 'white' | null, container: HTMLElement) => {
			// Обновляем курсор в зависимости от выбранного типа камня
			this.updateCursor(stoneType, container);
		});
	}

	/**
	 * Вычисляет размеры доски и элементов
	 */
	private calculateBoardDimensions(game: GoGame, container: HTMLElement): BoardDimensions {
		if (!this.settings) {
			throw new Error('Settings not initialized');
		}

		const optimalBoardSize = this.getOptimalBoardSize(game, container);

		// Используем кэшированные размеры если они есть и настройки не изменились
		if (this.cachedDimensions && this.cachedDimensions.boardSize === optimalBoardSize) {
			return this.cachedDimensions;
		}

		const boardSize = optimalBoardSize;
		const cellSize = boardSize / (game.boardSize.width + 1);
		const stoneRadius = (cellSize * this.settings.stoneSizeRatio) / 2;
		const padding = cellSize;
		const totalSize = boardSize + padding * 2;

		const dimensions = {
			boardSize,
			cellSize,
			stoneRadius,
			padding,
			totalSize
		};

		// Кэшируем размеры
		this.cachedDimensions = dimensions;
		return dimensions;
	}

	/**
	 * Вычисляет оптимальный размер доски в зависимости от размера доски
	 */
	private getOptimalBoardSize(game: GoGame, container: HTMLElement): number {
		// Получаем доступную ширину контейнера
		const containerWidth = this.getContainerWidth(container);
		
		// Максимальная ширина доски (80% от доступной ширины, но не более 600px)
		const maxBoardWidth = Math.min(containerWidth * 0.8, 600);
		
		// Базовые размеры для разных размеров досок
		const baseSizes = {
			9: Math.min(300, maxBoardWidth),   // 9x9 - компактная доска
			13: Math.min(400, maxBoardWidth),  // 13x13 - средняя доска  
			19: Math.min(500, maxBoardWidth)   // 19x19 - большая доска
		};

		// Получаем базовый размер для данного размера доски
		let baseSize = baseSizes[game.boardSize.width as keyof typeof baseSizes] || Math.min(400, maxBoardWidth);
		
		// Для досок больше 19x19 используем пропорциональное уменьшение
		if (game.boardSize.width > 19) {
			baseSize = Math.max(300, Math.min(maxBoardWidth, 600 - (game.boardSize.width - 19) * 10));
		}
		
		// Для досок меньше 9x9 используем пропорциональное увеличение
		if (game.boardSize.width < 9) {
			baseSize = Math.min(maxBoardWidth, 200 + (9 - game.boardSize.width) * 20);
		}

		// Ограничиваем размеры: минимум 200px, максимум 600px
		return Math.max(200, Math.min(600, baseSize));
	}

	/**
	 * Получает ширину контейнера для адаптивного размера
	 */
	private getContainerWidth(container: HTMLElement): number {
		if (container) {
			return container.clientWidth || 800; // fallback к 800px
		}
		return 800; // fallback к 800px если контейнер не найден
	}

	/**
	 * Получает стиль камня в зависимости от цвета и настроек
	 */
	private getStoneStyle(stoneColor: 'black' | 'white', containerEl: HTMLElement): StoneStyle {
		if (!this.settings) {
			throw new Error('Settings not initialized');
		}

		if (this.settings.useThemeColors) {
			const isDark = isDarkTheme(containerEl);
			const fill = stoneColor === 'black' ? 
				(isDark ? 'var(--background-primary)' : 'var(--text-normal)') : 
				(isDark ? 'var(--text-normal)' : 'var(--background-primary)');
			
			return {
				fill,
				stroke: 'var(--text-muted)',
				strokeWidth: '1'
			};
		} else {
			return {
				fill: stoneColor === 'black' ? 
					this.settings.blackStoneColor : this.settings.whiteStoneColor,
				stroke: this.settings.lineColor,
				strokeWidth: '1'
			};
		}
	}

	/**
	 * Создает фон доски
	 */
	private createBoardBackground(svg: SVGElement, dimensions: BoardDimensions): void {
		if (!this.settings) return;

		const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		background.setAttribute('x', dimensions.padding.toString());
		background.setAttribute('y', dimensions.padding.toString());
		background.setAttribute('width', dimensions.boardSize.toString());
		background.setAttribute('height', dimensions.boardSize.toString());
		
		if (this.settings.useThemeColors) {
			background.setAttribute('fill', 'var(--background-secondary)');
		} else {
			background.setAttribute('fill', this.settings.backgroundColor);
		}
		
		svg.appendChild(background);
	}

	/**
	 * Создает линии доски
	 */
	private createBoardLines(svg: SVGElement, game: GoGame, dimensions: BoardDimensions): void {
		if (!this.settings) return;

		const lineColor = this.settings.useThemeColors ? 'var(--text-muted)' : this.settings.lineColor;
		const strokeWidth = this.settings.lineWidth.toString();

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
			svg.appendChild(vLine);

			// Горизонтальные линии
			const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			hLine.setAttribute('x1', (dimensions.padding + dimensions.cellSize).toString());
			hLine.setAttribute('y1', pos.toString());
			hLine.setAttribute('x2', (dimensions.padding + game.boardSize.width * dimensions.cellSize).toString());
			hLine.setAttribute('y2', pos.toString());
			hLine.setAttribute('stroke', lineColor);
			hLine.setAttribute('stroke-width', strokeWidth);
			svg.appendChild(hLine);
		}
	}

	/**
	 * Создает камень на доске
	 */
	private createStone(svg: SVGElement, position: BoardPosition, stoneColor: 'black' | 'white', 
						dimensions: BoardDimensions, containerEl: HTMLElement, boardSize: number): void {
		try {
			const x = dimensions.padding + (position.x + 1) * dimensions.cellSize;
			const y = dimensions.padding + (boardSize - position.y) * dimensions.cellSize;

			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle.setAttribute('cx', x.toString());
			circle.setAttribute('cy', y.toString());
			circle.setAttribute('r', dimensions.stoneRadius.toString());
			
			const style = this.getStoneStyle(stoneColor, containerEl);
			circle.setAttribute('fill', style.fill);
			circle.setAttribute('stroke', style.stroke);
			circle.setAttribute('stroke-width', style.strokeWidth);
			
			svg.appendChild(circle);
		} catch (error) {
			console.error('Error creating stone:', error);
		}
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
		
		const dimensions = this.calculateBoardDimensions(game, containerEl);
		const themeColors = getThemeColors(containerEl);
		
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', dimensions.totalSize.toString());
		svg.setAttribute('height', dimensions.totalSize.toString());
		svg.setAttribute('viewBox', `0 0 ${dimensions.totalSize} ${dimensions.totalSize}`);
		svg.classList.add('go-board-svg');

		// Создаем элементы доски
		this.createBoardBackground(svg, dimensions);
		this.createBoardLines(svg, game, dimensions);

		// Координаты (если включены)
		if (game.showCoordinates) {
			this.addCoordinates(svg, game.boardSize.width, dimensions.cellSize, themeColors, dimensions.padding);
		}

		// Камни
		for (const move of game.moves) {
			const pos = this.parser!.positionToCoords(move.stone.position, game.boardSize.width);
			if (pos) {
				this.createStone(svg, pos, move.stone.color, dimensions, containerEl, game.boardSize.width);
			}
		}

		return svg;
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
			await this.updateCodeBlock(game, source);
			
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
		if (!this.parser) return;
		
		try {
			const svg = boardContainer.querySelector('.go-board-svg') as SVGElement;
			if (!svg) {
				console.warn('SVG element not found for rerender');
				return;
			}
			
			// Очищаем SVG от камней
			const circles = svg.querySelectorAll('circle');
			circles.forEach(circle => circle.remove());
			
		// Добавляем камни заново
		const dimensions = this.calculateBoardDimensions(game, boardContainer);
			
			for (const move of game.moves) {
				const pos = this.parser.positionToCoords(move.stone.position, game.boardSize.width);
				if (pos) {
					this.createStone(svg, pos, move.stone.color, dimensions, boardContainer, game.boardSize.width);
				}
			}
		} catch (error) {
			console.error('Error during rerender:', error);
		}
	}

	private async updateCodeBlock(game: GoGame, source: string): Promise<void> {
		if (!this.parser) return;
		
		try {
			const newContent = this.parser.generateCodeContent(game);
			const activeFile = this.app.workspace.getActiveFile();
			
			if (!activeFile) {
				console.warn('No active file to update');
				return;
			}
			
			const content = await this.app.vault.read(activeFile);
			const updatedContent = this.replaceGoboardBlock(content, newContent, source);
			
			if (updatedContent !== content) {
				await this.app.vault.modify(activeFile, updatedContent);
			}
		} catch (error) {
			console.error('Error updating code block:', error);
		}
	}

	/**
	 * Заменяет блок кода goboard в содержимом файла
	 */
	private replaceGoboardBlock(content: string, newContent: string, originalSource: string): string {
		// Экранируем специальные символы для регулярного выражения
		const escapedSource = originalSource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const goboardRegex = new RegExp(`\`\`\`goboard\\n${escapedSource}\\n\`\`\``, 'g');
		const newCodeBlock = `\`\`\`goboard\n${newContent}\n\`\`\``;
		
		if (goboardRegex.test(content)) {
			return content.replace(goboardRegex, newCodeBlock);
		}
		
		return content;
	}





	private addCoordinates(svg: SVGElement, boardSize: number, cellSize: number, themeColors: ThemeColors, padding: number) {
		if (!this.settings) return;
		
		// Буквы по горизонтали (A, B, C, ...) - снизу доски
		for (let i = 0; i < boardSize; i++) {
			const x = padding + (i + 1) * cellSize;
			const y = padding + (boardSize + 1) * cellSize + cellSize * 0.2; // уменьшенный отступ снизу
			
			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute('x', x.toString());
			text.setAttribute('y', y.toString());
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('dominant-baseline', 'middle');
			text.setAttribute('font-size', this.settings.coordinatesFontSize.toString());
			if (this.settings.useThemeColors) {
				text.setAttribute('fill', 'var(--text-faint)');
			} else {
				text.setAttribute('fill', this.settings.coordinatesColor);
			}
			text.setAttribute('font-family', 'Arial, sans-serif');
			text.textContent = String.fromCharCode('A'.charCodeAt(0) + i);
			svg.appendChild(text);
		}

		// Цифры по вертикали (1, 2, 3, ...) - слева от доски, снизу вверх
		for (let i = 0; i < boardSize; i++) {
			const x = padding + cellSize * 0.2; // увеличенный отступ слева
			const y = padding + (boardSize - i) * cellSize; // снизу вверх (1 внизу, 9 вверху)
			
			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute('x', x.toString());
			text.setAttribute('y', y.toString());
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('dominant-baseline', 'middle');
			text.setAttribute('font-size', this.settings.coordinatesFontSize.toString());
			if (this.settings.useThemeColors) {
				text.setAttribute('fill', 'var(--text-faint)');
			} else {
				text.setAttribute('fill', this.settings.coordinatesColor);
			}
			text.setAttribute('font-family', 'Arial, sans-serif');
			text.textContent = (i + 1).toString();
			svg.appendChild(text);
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
		const rect = svg.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		const dimensions = this.calculateBoardDimensions(game, boardContainer);
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
