export interface Stone {
	color: 'black' | 'white';
	position: string; // например "D4", "Q16"
}

export interface Move {
	stone: Stone;
	moveNumber: number;
}

export interface GoGame {
	moves: Move[];
	boardSize: number; // размер доски, может быть любым (9, 13, 19, etc.)
	showCoordinates?: boolean; // опция для отображения координат
}

export interface BoardPosition {
	x: number; // 0 до (boardSize-1)
	y: number;
}

export interface GoPluginSettings {
	boardSize: number;
	stoneSizeRatio: number; // коэффициент размера камня относительно ячейки (0.0-1.0)
	lineWidth: number;
	backgroundColor: string;
	lineColor: string;
	blackStoneColor: string;
	whiteStoneColor: string;
	showCoordinates: boolean; // отображение координат на доске
	coordinatesColor: string; // цвет координат
	coordinatesFontSize: number; // размер шрифта координат
	useThemeColors: boolean; // использовать цвета из текущей темы Obsidian
}

