import { GoGame, GoPluginSettings } from '../data';

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
}
