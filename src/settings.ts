import { GoPluginSettings } from './data';

export const DEFAULT_SETTINGS: GoPluginSettings = {
	boardSize: { width: 19, height: 19 },
	stoneSizeRatio: 0.9, // 40% от размера ячейки
	lineWidth: 1,
	backgroundColor: '#DCB35C',
	lineColor: '#000000',
	blackStoneColor: '#000000',
	whiteStoneColor: '#FFFFFF',
	showCoordinates: true, // по умолчанию координаты включены
	coordinatesColor: '#666666', // серый цвет для координат
	coordinatesFontSize: 12, // размер шрифта координат
	useThemeColors: true // по умолчанию используем цвета темы
};
