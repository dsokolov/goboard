export enum PointContent {
    Empty = 'empty',
    Black = 'black',
    White = 'white',
}

export class Point {
    constructor(
        public readonly content: PointContent,
        public readonly hasHoshi: boolean,
    ) {}
}

export class Board {
    constructor(
        public readonly points: Point[][],
        public readonly showCoordinates: boolean,
    ) {}
}

export class RenderParams {
    public readonly width: number;
    public readonly height: number;
    public readonly stoneSize: number;
    public readonly colors: RenderColors;
    public readonly isDarkTheme: boolean;

    constructor({
        width = 250,
        height = 250,
        stoneSize = 0.8,
        colors = new RenderColors(),
        isDarkTheme = false,
    }: {
        width?: number;
        height?: number;
        stoneSize?: number;
        colors?: RenderColors;
        isDarkTheme?: boolean;
    } = {}) {
        this.width = width;
        this.height = height;
        this.stoneSize = stoneSize;
        this.colors = colors;
        this.isDarkTheme = isDarkTheme;
    }
}

export class RenderColors {
    constructor() {
        // Все цвета теперь берутся напрямую из CSS переменных
    }
}
