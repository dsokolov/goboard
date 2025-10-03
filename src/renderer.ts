import { GoPluginSettings, Stone, Move, GoGame } from './data';

export class GoBoardRenderer {
	private settings: GoPluginSettings;

	constructor(settings: GoPluginSettings) {
		this.settings = settings;
	}

	render(source: string, containerEl: HTMLElement) {
		const game = this.parseGame(source);
		const svg = this.generateSVG(game, containerEl);
		containerEl.appendChild(svg);
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
					circle.setAttribute('fill', move.stone.color === 'black' ? 
						'var(--text-normal)' : 'var(--background-primary)');
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
		
		// Отладочная информация
		console.log('Theme colors from Obsidian:', themeColors);
		console.log('Available CSS variables:', {
			docElement: Array.from(docStyle).filter(prop => prop.startsWith('--')),
			body: Array.from(bodyStyle).filter(prop => prop.startsWith('--')),
			container: Array.from(containerStyle).filter(prop => prop.startsWith('--'))
		});
		
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

