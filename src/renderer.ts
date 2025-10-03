import { GoPluginSettings, Stone, Move, GoGame } from './data';

export class GoBoardRenderer {
	private settings: GoPluginSettings;

	constructor(settings: GoPluginSettings) {
		this.settings = settings;
	}

	render(source: string, containerEl: HTMLElement) {
		const game = this.parseGame(source);
		
		// Создаем контейнер для диаграммы и панели инструментов
		const boardContainer = document.createElement('div');
		boardContainer.classList.add('go-board-container');
		
		// Сохраняем исходный код в data-атрибут для возможности перерисовки
		boardContainer.setAttribute('data-source', source);
		
		// Создаем панель инструментов
		const toolbar = this.createToolbar(source, containerEl);
		boardContainer.appendChild(toolbar);
		
		const svg = this.generateSVG(game, containerEl);
		
		// Добавляем обработчик клика на диаграмму
		this.addClickHandler(svg, game);
		
		boardContainer.appendChild(svg);
		containerEl.appendChild(boardContainer);
	}

	private parseGame(source: string): GoGame {
		const lines = source.trim().split('\n');
		const moves: Move[] = [];
		let moveNumber = 1;
		let boardSize = this.settings.boardSize; // размер по умолчанию
		let showCoordinates = this.settings.showCoordinates; // по умолчанию из настроек

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			// Проверяем, является ли строка объявлением размера доски
			const sizeMatch = trimmed.match(/^size\s+(\d+)x(\d+)$/i);
			if (sizeMatch) {
				const size = parseInt(sizeMatch[1]);
				boardSize = size;
				continue;
			}

			// Проверяем команды отображения координат
			if (trimmed.toLowerCase() === 'coordinates on') {
				showCoordinates = true;
				continue;
			}
			if (trimmed.toLowerCase() === 'coordinates off') {
				showCoordinates = false;
				continue;
			}

			// Простой парсер для формата "B D4" или "W Q16"
			const match = trimmed.match(/^([BW])\s+([A-T]\d+)$/i);
			if (match) {
				const color = match[1].toUpperCase() === 'B' ? 'black' : 'white';
				const position = match[2].toUpperCase();
				
				moves.push({
					stone: { color, position },
					moveNumber: moveNumber++
				});
			}
		}

		return {
			moves,
			boardSize,
			showCoordinates
		};
	}

	private generateSVG(game: GoGame, containerEl: HTMLElement): SVGElement {
		const size = 400;
		const cellSize = size / (game.boardSize + 1);
		// Размер камня пропорционален размеру ячейки
		const stoneRadius = (cellSize * this.settings.stoneSizeRatio) / 2;

		// Получаем цвета из темы Obsidian
		const themeColors = this.getThemeColors(containerEl);

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
			const pos = this.positionToCoords(move.stone.position, game.boardSize);
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
					const isDarkTheme = this.isDarkTheme(containerEl);
					circle.setAttribute('fill', move.stone.color === 'black' ? 
						(isDarkTheme ? 'var(--background-primary)' : 'var(--text-normal)') : 
						(isDarkTheme ? 'var(--text-normal)' : 'var(--background-primary)'));
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

	private isDarkTheme(containerEl: HTMLElement): boolean {
		// Проверяем, является ли текущая тема тёмной
		const computedStyle = getComputedStyle(containerEl);
		const backgroundColor = computedStyle.getPropertyValue('--background-primary');
		
		// Если background-primary тёмный (низкая яркость), то это тёмная тема
		// Простая проверка: если цвет содержит много тёмных компонентов
		const rgb = backgroundColor.match(/\d+/g);
		if (rgb && rgb.length >= 3) {
			const r = parseInt(rgb[0]);
			const g = parseInt(rgb[1]);
			const b = parseInt(rgb[2]);
			// Если средняя яркость меньше 128, считаем тему тёмной
			return (r + g + b) / 3 < 128;
		}
		
		// Fallback: проверяем класс body или html
		const body = document.body;
		return body.classList.contains('theme-dark') || 
			   body.classList.contains('obsidian-theme-dark') ||
			   document.documentElement.classList.contains('theme-dark');
	}

	private getThemeColors(containerEl: HTMLElement): ThemeColors {
		// Пробуем получить стили из разных источников
		const docStyle = getComputedStyle(document.documentElement);
		const bodyStyle = getComputedStyle(document.body);
		const containerStyle = getComputedStyle(containerEl);
		
		// Функция для получения значения с fallback
		const getColor = (varName: string): string => {
			// Пробуем разные источники
			let value = docStyle.getPropertyValue(varName).trim();
			if (!value) value = bodyStyle.getPropertyValue(varName).trim();
			if (!value) value = containerStyle.getPropertyValue(varName).trim();
			return value;
		};
		
		const themeColors = {
			textNormal: getColor('--text-normal') || '#000000',
			textMuted: getColor('--text-muted') || '#666666',
			textFaint: getColor('--text-faint') || '#999999',
			backgroundPrimary: getColor('--background-primary') || '#ffffff',
			backgroundSecondary: getColor('--background-secondary') || '#f8f8f8',
			interactiveAccent: getColor('--interactive-accent') || '#007acc',
			textAccent: getColor('--text-accent') || '#007acc'
		};
		
		
		return themeColors;
	}

	private addCoordinates(svg: SVGElement, boardSize: number, cellSize: number, themeColors: ThemeColors) {
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

	private positionToCoords(position: string, boardSize: number): { x: number; y: number } | null {
		// Конвертация позиции типа "D4" в координаты
		const letter = position.charAt(0);
		const number = parseInt(position.slice(1));

		const x = letter.charCodeAt(0) - 'A'.charCodeAt(0);
		const y = number - 1;

		if (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
			return { x, y };
		}

		return null;
	}

	private addClickHandler(svg: SVGElement, game: GoGame) {
		// Добавляем курсор указателя для интерактивности
		svg.style.cursor = 'pointer';
		
		svg.addEventListener('click', (event) => {
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
				// Конвертируем координаты в позицию (например, D4)
				const position = this.coordsToPosition(boardX, boardY);
				const moveNumber = this.getMoveAtPosition(game, boardX, boardY);
				
				// Создаем сообщение
				let message = `Позиция: ${position}`;
				if (moveNumber) {
					message += `\nХод: ${moveNumber}`;
					const move = game.moves.find(m => m.moveNumber === moveNumber);
					if (move) {
						message += `\nЦвет: ${move.stone.color === 'black' ? 'Черный' : 'Белый'}`;
					}
				} else {
					message += '\nПустая позиция';
				}
				
				// Отображаем сообщение
				this.showMessage(message);
			}
		});
	}

	private coordsToPosition(x: number, y: number): string {
		const letter = String.fromCharCode('A'.charCodeAt(0) + x);
		const number = y + 1;
		return `${letter}${number}`;
	}

	private getMoveAtPosition(game: GoGame, x: number, y: number): number | null {
		for (const move of game.moves) {
			const pos = this.positionToCoords(move.stone.position, game.boardSize);
			if (pos && pos.x === x && pos.y === y) {
				return move.moveNumber;
			}
		}
		return null;
	}

	private showMessage(message: string) {
		// Создаем модальное окно для отображения сообщения
		const modal = document.createElement('div');
		modal.style.cssText = `
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: var(--background-primary, #ffffff);
			border: 2px solid var(--text-accent, #007acc);
			border-radius: 8px;
			padding: 20px;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
			z-index: 10000;
			font-family: var(--font-text, Arial, sans-serif);
			font-size: 14px;
			color: var(--text-normal, #000000);
			max-width: 300px;
			text-align: center;
			white-space: pre-line;
		`;
		
		modal.textContent = message;
		
		// Добавляем кнопку закрытия
		const closeButton = document.createElement('button');
		closeButton.textContent = 'Закрыть';
		closeButton.style.cssText = `
			margin-top: 10px;
			padding: 8px 16px;
			background: var(--interactive-accent, #007acc);
			color: var(--text-on-accent, #ffffff);
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 12px;
		`;
		
		closeButton.addEventListener('click', () => {
			if (document.body.contains(modal)) {
				document.body.removeChild(modal);
			}
			if (document.body.contains(overlay)) {
				document.body.removeChild(overlay);
			}
		});
		
		modal.appendChild(closeButton);
		
		// Добавляем затемнение фона
		const overlay = document.createElement('div');
		overlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.5);
			z-index: 9999;
		`;
		
		overlay.addEventListener('click', () => {
			if (document.body.contains(overlay)) {
				document.body.removeChild(overlay);
			}
			if (document.body.contains(modal)) {
				document.body.removeChild(modal);
			}
		});
		
		document.body.appendChild(overlay);
		document.body.appendChild(modal);
	}

	private createToolbar(source: string, containerEl: HTMLElement): HTMLElement {
		return this.createToolbarElement(source, containerEl);
	}

	private createToolbarElement(source: string, containerEl: HTMLElement): HTMLElement {
		const toolbar = document.createElement('div');
		toolbar.classList.add('go-board-toolbar');
		
		// Кнопка "Очистить"
		const clearButton = document.createElement('button');
		clearButton.textContent = 'Очистить';
		clearButton.classList.add('go-board-clear-button');
		clearButton.addEventListener('click', () => {
			this.clearBoard(source, containerEl);
		});
		
		toolbar.appendChild(clearButton);
		return toolbar;
	}


	private clearBoard(source: string, containerEl: HTMLElement) {
		// Находим блок кода, который содержит эту диаграмму
		const codeBlock = containerEl.closest('pre');
		if (codeBlock) {
			// Очищаем содержимое блока кода, оставляя только размер доски
			const game = this.parseGame(source);
			const newContent = `size ${game.boardSize}x${game.boardSize}`;
			
			// Находим textarea внутри блока кода (если есть)
			const textarea = codeBlock.querySelector('textarea');
			if (textarea) {
				textarea.value = newContent;
				textarea.dispatchEvent(new Event('input', { bubbles: true }));
			}
		}
	}


}

interface ThemeColors {
	textNormal: string;
	textMuted: string;
	textFaint: string;
	backgroundPrimary: string;
	backgroundSecondary: string;
	interactiveAccent: string;
	textAccent: string;
}

