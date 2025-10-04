import { GoGame, GoPluginSettings, BoardPosition } from '../data';

export interface BoardDimensions {
	boardSize: number;
	cellSize: number;
	stoneRadius: number;
	padding: number;
	totalSize: number;
}

export class BoardCalculationService {
	private cachedDimensions: BoardDimensions | null = null;

	/**
	 * Вычисляет размеры доски и элементов
	 */
	calculateDimensions(game: GoGame, container: HTMLElement, settings: GoPluginSettings): BoardDimensions {
		const optimalBoardSize = this.getOptimalBoardSize(game, container);

		// Используем кэшированные размеры если они есть и настройки не изменились
		if (this.cachedDimensions && this.cachedDimensions.boardSize === optimalBoardSize) {
			return this.cachedDimensions;
		}

		const boardSize = optimalBoardSize;
		const cellSize = boardSize / (game.boardSize.width + 1);
		const stoneRadius = (cellSize * settings.stoneSizeRatio) / 2;
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
	 * Очищает кэш размеров
	 */
	clearCache(): void {
		this.cachedDimensions = null;
	}

	/**
	 * Вычисляет позиции хоси (звёзд) для доски заданного размера
	 */
	getHoshiPositions(boardSize: number): BoardPosition[] {
		const positions: BoardPosition[] = [];
		
		// Для стандартной доски 19x19
		if (boardSize === 19) {
			// Угловые хоси (4-4 точки)
			positions.push({ x: 3, y: 3 }, { x: 15, y: 3 }, { x: 3, y: 15 }, { x: 15, y: 15 });
			// Боковые хоси (4-10 и 10-4 точки)
			positions.push({ x: 9, y: 3 }, { x: 9, y: 15 }, { x: 3, y: 9 }, { x: 15, y: 9 });
			// Центральный хоси (10-10 точка)
			positions.push({ x: 9, y: 9 });
		}
		// Для доски 13x13
		else if (boardSize === 13) {
			// Угловые хоси (3-3 точки)
			positions.push({ x: 3, y: 3 }, { x: 9, y: 3 }, { x: 3, y: 9 }, { x: 9, y: 9 });
			// Центральный хоси (6-6 точка)
			positions.push({ x: 6, y: 6 });
		}
		// Для доски 9x9
		else if (boardSize === 9) {
			// Угловые хоси (2-2 точки)
			positions.push({ x: 2, y: 2 }, { x: 6, y: 2 }, { x: 2, y: 6 }, { x: 6, y: 6 });
			// Центральный хоси (4-4 точка)
			positions.push({ x: 4, y: 4 });
		}
		// Для других размеров досок - упрощенная схема
		else {
			// Угловые хоси
			const cornerOffset = Math.floor(boardSize / 6);
			positions.push(
				{ x: cornerOffset, y: cornerOffset },
				{ x: boardSize - 1 - cornerOffset, y: cornerOffset },
				{ x: cornerOffset, y: boardSize - 1 - cornerOffset },
				{ x: boardSize - 1 - cornerOffset, y: boardSize - 1 - cornerOffset }
			);
			
			// Центральный хоси (если доска достаточно большая)
			if (boardSize >= 7) {
				const center = Math.floor(boardSize / 2);
				positions.push({ x: center, y: center });
			}
		}
		
		return positions;
	}
}
