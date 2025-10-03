import { GoPluginSettings, Stone, Move, GoGame } from './data';

export class GoBoardRenderer {
	private settings: GoPluginSettings;

	constructor(settings: GoPluginSettings) {
		this.settings = settings;
	}

	render(source: string, containerEl: HTMLElement) {
		const game = this.parseGame(source);
		const svg = this.generateSVG(game);
		containerEl.appendChild(svg);
	}

	private parseGame(source: string): GoGame {
		const lines = source.trim().split('\n');
		const moves: Move[] = [];
		let moveNumber = 1;

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

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
			boardSize: this.settings.boardSize
		};
	}

	private generateSVG(game: GoGame): SVGElement {
		const size = 400;
		const cellSize = size / (this.settings.boardSize + 1);
		const stoneRadius = this.settings.stoneSize / 2;

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', size.toString());
		svg.setAttribute('height', size.toString());
		svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

		// Фон доски
		const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		background.setAttribute('width', size.toString());
		background.setAttribute('height', size.toString());
		background.setAttribute('fill', this.settings.backgroundColor);
		svg.appendChild(background);

		// Линии доски
		for (let i = 1; i <= this.settings.boardSize; i++) {
			const pos = i * cellSize;
			
			// Вертикальные линии
			const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			vLine.setAttribute('x1', pos.toString());
			vLine.setAttribute('y1', cellSize.toString());
			vLine.setAttribute('x2', pos.toString());
			vLine.setAttribute('y2', (this.settings.boardSize * cellSize).toString());
			vLine.setAttribute('stroke', this.settings.lineColor);
			vLine.setAttribute('stroke-width', this.settings.lineWidth.toString());
			svg.appendChild(vLine);

			// Горизонтальные линии
			const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			hLine.setAttribute('x1', cellSize.toString());
			hLine.setAttribute('y1', pos.toString());
			hLine.setAttribute('x2', (this.settings.boardSize * cellSize).toString());
			hLine.setAttribute('y2', pos.toString());
			hLine.setAttribute('stroke', this.settings.lineColor);
			hLine.setAttribute('stroke-width', this.settings.lineWidth.toString());
			svg.appendChild(hLine);
		}

		// Камни
		for (const move of game.moves) {
			const pos = this.positionToCoords(move.stone.position);
			if (pos) {
				const x = (pos.x + 1) * cellSize;
				const y = (pos.y + 1) * cellSize;

				const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				circle.setAttribute('cx', x.toString());
				circle.setAttribute('cy', y.toString());
				circle.setAttribute('r', stoneRadius.toString());
				circle.setAttribute('fill', move.stone.color === 'black' ? 
					this.settings.blackStoneColor : this.settings.whiteStoneColor);
				circle.setAttribute('stroke', this.settings.lineColor);
				circle.setAttribute('stroke-width', '1');
				svg.appendChild(circle);
			}
		}

		return svg;
	}

	private positionToCoords(position: string): { x: number; y: number } | null {
		// Конвертация позиции типа "D4" в координаты
		const letter = position.charAt(0);
		const number = parseInt(position.slice(1));

		const x = letter.charCodeAt(0) - 'A'.charCodeAt(0);
		const y = number - 1;

		if (x >= 0 && x < this.settings.boardSize && y >= 0 && y < this.settings.boardSize) {
			return { x, y };
		}

		return null;
	}
}

