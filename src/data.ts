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
	boardSize: number;
}

export interface BoardPosition {
	x: number; // 0-18 для доски 19x19
	y: number;
}

export interface GoPluginSettings {
	boardSize: number;
	stoneSize: number;
	lineWidth: number;
	backgroundColor: string;
	lineColor: string;
	blackStoneColor: string;
	whiteStoneColor: string;
}

