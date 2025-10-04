import { GoPluginSettings } from '../data';
import { BoardDimensions } from './BoardCalculationService';
import { isDarkTheme, getThemeColors, ThemeColors } from '../theme';

export interface StoneStyle {
	fill: string;
	stroke: string;
	strokeWidth: string;
}

export class ColorService {
	/**
	 * Получает стиль камня в зависимости от цвета и настроек
	 */
	getStoneStyle(stoneColor: 'black' | 'white', containerEl: HTMLElement, settings: GoPluginSettings): StoneStyle {
		if (settings.useThemeColors) {
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
					settings.blackStoneColor : settings.whiteStoneColor,
				stroke: settings.lineColor,
				strokeWidth: '1'
			};
		}
	}

	/**
	 * Получает цвет фона доски
	 */
	getBoardBackgroundColor(settings: GoPluginSettings): string {
		if (settings.useThemeColors) {
			return 'var(--background-secondary)';
		}
		return settings.backgroundColor;
	}

	/**
	 * Получает цвет линий доски
	 */
	getBoardLineColor(settings: GoPluginSettings): string {
		if (settings.useThemeColors) {
			return 'var(--text-muted)';
		}
		return settings.lineColor;
	}

	/**
	 * Получает цвет координат
	 */
	getCoordinatesColor(settings: GoPluginSettings): string {
		if (settings.useThemeColors) {
			return 'var(--text-faint)';
		}
		return settings.coordinatesColor;
	}

	/**
	 * Получает цвета темы
	 */
	getThemeColors(containerEl: HTMLElement): ThemeColors {
		return getThemeColors(containerEl);
	}

	/**
	 * Проверяет, является ли тема темной
	 */
	isDarkTheme(containerEl: HTMLElement): boolean {
		return isDarkTheme(containerEl);
	}
}
