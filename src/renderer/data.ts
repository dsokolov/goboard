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

    constructor({
        width = 250,
        height = 250,
        stoneSize = 0.8,
        colors = new RenderColors(),
    }: {
        width?: number;
        height?: number;
        stoneSize?: number;
        colors?: RenderColors;
    } = {}) {
        this.width = width;
        this.height = height;
        this.stoneSize = stoneSize;
        this.colors = colors;
    }
}

export class RenderColors {
    public readonly boardColor: string;
    public readonly lineColor: string;
    public readonly blackStoneColor: string;
    public readonly whiteStoneColor: string;

    constructor({
        boardColor = '#DCB35C',
        lineColor = '#000000',
        blackStoneColor = '#000000',
        whiteStoneColor = '#FFFFFF',
    }: {
        boardColor?: string;
        lineColor?: string;
        blackStoneColor?: string;
        whiteStoneColor?: string;
    } = {}) {
        this.boardColor = boardColor;
        this.lineColor = lineColor;
        this.blackStoneColor = blackStoneColor;
        this.whiteStoneColor = whiteStoneColor;
    }
}
