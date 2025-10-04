import { GoPluginSettings, Stone, Move, GoGame } from './data';
import { Toolbar } from './toolbar';
import { App } from 'obsidian';
import { isDarkTheme, getThemeColors, ThemeColors } from './theme';
import { GoGameParser } from './parser';

export class GoBoardRenderer {
	private settings: GoPluginSettings | null = null;
	private toolbar: Toolbar | null = null;
	private parser: GoGameParser | null = null;
	private currentGame: GoGame | null = null;
	private currentContainer: HTMLElement | null = null;
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	updateSettings(settings: GoPluginSettings) {
		this.settings = settings;
		this.parser = new GoGameParser(settings);
		this.toolbar = new Toolbar(settings);
		
		// Устанавливаем callback для изменения типа камня
		this.toolbar.setStoneTypeChangeCallback((stoneType) => {
			// Обновляем курсор в зависимости от выбранного типа камня
			this.updateCursor(stoneType);
		});
	}

	render(source: string, containerEl: HTMLElement) {
		if (!this.parser || !this.toolbar || !this.settings) {
			throw new Error('Renderer not initialized. Call updateSettings() first.');
		}
		
		const game = this.parser.parseGame(source);
		
		// Сохраняем ссылки на текущую игру и контейнер
		this.currentGame = game;
		this.currentContainer = containerEl;
		
		// Создаем контейнер для диаграммы и панели инструментов
		const boardContainer = document.createElement('div');
		boardContainer.classList.add('go-board-container');
		
		// Сохраняем исходный код в data-атрибут для возможности перерисовки
		boardContainer.setAttribute('data-source', source);
		
		// Создаем панель инструментов
		const toolbar = this.toolbar.createToolbar(source, containerEl);
		
		const svg = this.generateSVG(game, containerEl);
		
		// Добавляем обработчик клика на диаграмму
		this.addClickHandler(svg, game);
		
		// Добавляем элементы в стандартном порядке - CSS сам определит правильное размещение
		boardContainer.appendChild(svg);
		boardContainer.appendChild(toolbar);
		
		containerEl.appendChild(boardContainer);
	}


	private generateSVG(game: GoGame, containerEl: HTMLElement): SVGElement {
		if (!this.settings) {
			throw new Error('Settings not initialized');
		}
		
		const size = 400;
		const cellSize = size / (game.boardSize + 1);
		// Размер камня пропорционален размеру ячейки
		const stoneRadius = (cellSize * this.settings.stoneSizeRatio) / 2;

		// Получаем цвета из темы Obsidian
		const themeColors = getThemeColors(containerEl);

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', size.toString());
		svg.setAttribute('height', size.toString());
		svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
		svg.classList.add('go-board-svg');

		// Фон доски - используем цвет темы или настройку
		const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		background.setAttribute('width', size.toString());
		background.setAttribute('height', size.toString());
		if (this.settings.useThemeColors) {
			background.setAttribute('fill', 'var(--background-secondary)');
		} else {
			background.setAttribute('fill', this.settings.backgroundColor);
		}
		svg.appendChild(background);

		// Линии доски
		for (let i = 1; i <= game.boardSize; i++) {
			const pos = i * cellSize;
			
			// Вертикальные линии
			const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			vLine.setAttribute('x1', pos.toString());
			vLine.setAttribute('y1', cellSize.toString());
			vLine.setAttribute('x2', pos.toString());
			vLine.setAttribute('y2', (game.boardSize * cellSize).toString());
			if (this.settings.useThemeColors) {
				vLine.setAttribute('stroke', 'var(--text-muted)');
			} else {
				vLine.setAttribute('stroke', this.settings.lineColor);
			}
			vLine.setAttribute('stroke-width', this.settings.lineWidth.toString());
			svg.appendChild(vLine);

			// Горизонтальные линии
			const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			hLine.setAttribute('x1', cellSize.toString());
			hLine.setAttribute('y1', pos.toString());
			hLine.setAttribute('x2', (game.boardSize * cellSize).toString());
			hLine.setAttribute('y2', pos.toString());
			if (this.settings.useThemeColors) {
				hLine.setAttribute('stroke', 'var(--text-muted)');
			} else {
				hLine.setAttribute('stroke', this.settings.lineColor);
			}
			hLine.setAttribute('stroke-width', this.settings.lineWidth.toString());
			svg.appendChild(hLine);
		}

		// Координаты (если включены)
		if (game.showCoordinates) {
			this.addCoordinates(svg, game.boardSize, cellSize, themeColors);
		}

		// Камни
		for (const move of game.moves) {
			const pos = this.parser.positionToCoords(move.stone.position, game.boardSize);
			if (pos) {
				const x = (pos.x + 1) * cellSize;
				const y = (pos.y + 1) * cellSize;

				const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				circle.setAttribute('cx', x.toString());
				circle.setAttribute('cy', y.toString());
				circle.setAttribute('r', stoneRadius.toString());
				
				// Используем цвета темы или настройки
				if (this.settings.useThemeColors) {
					// Для чёрных камней используем тёмный цвет, для белых - светлый
					// В светлой теме: text-normal тёмный, background-primary светлый
					// В тёмной теме: text-normal светлый, background-primary тёмный
					// Поэтому нужно инвертировать логику для тёмной темы
					const isDark = isDarkTheme(containerEl);
					circle.setAttribute('fill', move.stone.color === 'black' ? 
						(isDark ? 'var(--background-primary)' : 'var(--text-normal)') : 
						(isDark ? 'var(--text-normal)' : 'var(--background-primary)'));
					circle.setAttribute('stroke', 'var(--text-muted)');
				} else {
					circle.setAttribute('fill', move.stone.color === 'black' ? 
						this.settings.blackStoneColor : this.settings.whiteStoneColor);
					circle.setAttribute('stroke', this.settings.lineColor);
				}
				circle.setAttribute('stroke-width', '1');
				svg.appendChild(circle);
			}
		}

		return svg;
	}

	private updateCursor(stoneType: 'black' | 'white' | null) {
		if (!this.currentContainer) return;
		
		const svg = this.currentContainer.querySelector('.go-board-svg') as SVGElement;
		if (!svg) return;
		
		if (stoneType) {
			svg.style.cursor = 'crosshair';
		} else {
			svg.style.cursor = 'default';
		}
	}

	private async placeStone(x: number, y: number, color: 'black' | 'white') {
		if (!this.currentGame || !this.currentContainer || !this.parser) return;
		
		// Удаляем существующий камень в этой позиции
		this.removeStoneAtPosition(x, y);
		
		// Добавляем новый камень
		const position = this.parser.coordsToPosition(x, y);
		const newMove: Move = {
			stone: { color, position },
			moveNumber: this.currentGame.moves.length + 1
		};
		
		this.currentGame.moves.push(newMove);
		
		// Обновляем содержимое блока кода
		await this.updateCodeBlock();
		
		// Перерисовываем диаграмму
		this.rerender();
	}

	private removeStoneAtPosition(x: number, y: number) {
		if (!this.currentGame || !this.parser) return;
		
		this.currentGame.moves = this.currentGame.moves.filter(move => {
			const pos = this.parser!.positionToCoords(move.stone.position, this.currentGame!.boardSize);
			return !(pos && pos.x === x && pos.y === y);
		});
	}

	private rerender() {
		if (!this.currentContainer || !this.currentGame || !this.settings || !this.parser) return;
		
		const boardContainer = this.currentContainer.querySelector('.go-board-container');
		if (!boardContainer) return;
		
		// Находим SVG и обновляем только его содержимое
		const svg = boardContainer.querySelector('.go-board-svg') as SVGElement;
		if (!svg) return;
		
		// Очищаем SVG от камней
		const circles = svg.querySelectorAll('circle');
		circles.forEach(circle => circle.remove());
		
		// Добавляем камни заново
		const size = 400;
		const cellSize = size / (this.currentGame.boardSize + 1);
		const stoneRadius = (cellSize * this.settings.stoneSizeRatio) / 2;
		
		for (const move of this.currentGame.moves) {
			const pos = this.parser.positionToCoords(move.stone.position, this.currentGame.boardSize);
			if (pos) {
				const x = (pos.x + 1) * cellSize;
				const y = (pos.y + 1) * cellSize;

				const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				circle.setAttribute('cx', x.toString());
				circle.setAttribute('cy', y.toString());
				circle.setAttribute('r', stoneRadius.toString());
				
				// Используем цвета темы или настройки
				if (this.settings.useThemeColors) {
					const isDark = isDarkTheme(this.currentContainer);
					circle.setAttribute('fill', move.stone.color === 'black' ? 
						(isDark ? 'var(--background-primary)' : 'var(--text-normal)') : 
						(isDark ? 'var(--text-normal)' : 'var(--background-primary)'));
					circle.setAttribute('stroke', 'var(--text-muted)');
				} else {
					circle.setAttribute('fill', move.stone.color === 'black' ? 
						this.settings.blackStoneColor : this.settings.whiteStoneColor);
					circle.setAttribute('stroke', this.settings.lineColor);
				}
				circle.setAttribute('stroke-width', '1');
				svg.appendChild(circle);
			}
		}
	}

	private async updateCodeBlock() {
		if (!this.currentGame || !this.parser) return;
		
		// Генерируем новое содержимое блока кода
		const newContent = this.parser.generateCodeContent(this.currentGame);
		
		try {
			// Получаем активный файл
			const activeFile = this.app.workspace.getActiveFile();
			if (!activeFile) {
				return;
			}
			
			// Читаем содержимое файла
			const content = await this.app.vault.read(activeFile);
			
			// Ищем блок кода goboard и заменяем его
			const goboardRegex = /```goboard\n([\s\S]*?)\n```/g;
			const newCodeBlock = `\`\`\`goboard\n${newContent}\n\`\`\``;
			
			if (goboardRegex.test(content)) {
				// Заменяем найденный блок кода
				const updatedContent = content.replace(goboardRegex, newCodeBlock);
				
				// Сохраняем изменения
				await this.app.vault.modify(activeFile, updatedContent);
			}
		} catch (error) {
			console.error('Error updating code block:', error);
		}
	}





	private addCoordinates(svg: SVGElement, boardSize: number, cellSize: number, themeColors: ThemeColors) {
		if (!this.settings) return;
		
		// Буквы по горизонтали (A, B, C, ...)
		for (let i = 0; i < boardSize; i++) {
			const x = (i + 1) * cellSize;
			const y = cellSize * 0.5; // немного выше доски
			
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

		// Цифры по вертикали (1, 2, 3, ...)
		for (let i = 0; i < boardSize; i++) {
			const x = cellSize * 0.5; // немного левее доски
			const y = (i + 1) * cellSize;
			
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


	private addClickHandler(svg: SVGElement, game: GoGame) {
		svg.addEventListener('click', (event) => {
			if (!this.toolbar) return;
			
			// Получаем координаты клика относительно SVG
			const rect = svg.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			
			// Конвертируем координаты в позицию на доске
			const size = 400;
			const cellSize = size / (game.boardSize + 1);
			const boardX = Math.round((x - cellSize) / cellSize);
			const boardY = Math.round((y - cellSize) / cellSize);
			
			// Проверяем, что клик был внутри доски
			if (boardX >= 0 && boardX < game.boardSize && boardY >= 0 && boardY < game.boardSize) {
				// Получаем выбранный тип камня
				const selectedStoneType = this.toolbar.getSelectedStoneType();
				
				if (selectedStoneType) {
					// Размещаем камень
					this.placeStone(boardX, boardY, selectedStoneType);
				}
			}
		});
	}


	private getMoveAtPosition(game: GoGame, x: number, y: number): number | null {
		if (!this.parser) return null;
		
		for (const move of game.moves) {
			const pos = this.parser.positionToCoords(move.stone.position, game.boardSize);
			if (pos && pos.x === x && pos.y === y) {
				return move.moveNumber;
			}
		}
		return null;
	}




}


