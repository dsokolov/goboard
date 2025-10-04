import { GoGame, Move, BoardSize } from './data';

export class GoGameParser {
	constructor() {
	}

	parseGame(source: string, defaultBoardSize: BoardSize, defaultShowCoordinates: boolean): GoGame {
		const lines = source.trim().split('\n');
		const moves: Move[] = [];
		let moveNumber = 1;
		let boardSize = defaultBoardSize; // размер по умолчанию
		let showCoordinates = defaultShowCoordinates; // по умолчанию из параметров

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			// Проверяем, является ли строка объявлением размера доски
			const sizeMatch = trimmed.match(/^size\s+(\d+)x(\d+)$/i);
			if (sizeMatch) {
				const height = parseInt(sizeMatch[1]);
				const width = parseInt(sizeMatch[2]);
				boardSize = { width, height };
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

	positionToCoords(position: string, boardSize: number): { x: number; y: number } | null {
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

	coordsToPosition(x: number, y: number): string {
		const letter = String.fromCharCode('A'.charCodeAt(0) + x);
		const number = y + 1;
		return `${letter}${number}`;
	}

	generateCodeContent(game: GoGame): string {
		const lines: string[] = [];
		
		// Добавляем размер доски
		lines.push(`size ${game.boardSize.width}x${game.boardSize.height}`);
		
		// Добавляем команды координат если нужно
		if (game.showCoordinates) {
			lines.push('coordinates on');
		}
		
		// Добавляем ходы
		for (const move of game.moves) {
			const color = move.stone.color === 'black' ? 'B' : 'W';
			lines.push(`${color} ${move.stone.position}`);
		}
		
		return lines.join('\n');
	}
}
