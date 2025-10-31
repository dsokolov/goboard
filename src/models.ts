export class SinglePosition {
    constructor(
        public readonly x: number, 
        public readonly y: number
    ) {}
}

export class IntervalPosition {
    constructor(
        public readonly start: SinglePosition, 
        public readonly end: SinglePosition,
    ) {}
}

export type Position = SinglePosition | IntervalPosition;

export type BoardSize = {
    readonly width: number;
    readonly height: number;
};

export enum Color {
    Black = "Black",
    White = "White",
}

export class Instruction {
    constructor(
        public readonly color: Color,
        public readonly positions: Position[]
    ) {}
}

export class Viewport {
    constructor(
        public readonly start: SinglePosition,
        public readonly end: SinglePosition
    ) {}
}

export class ParseSuccess {
    constructor(
        public readonly instructions: Instruction[],
        public readonly boardSize: BoardSize,
        public readonly showCoordinates: boolean = false,
        public readonly viewport: Viewport | null = null
    ) {}
}

export class ParseError {
    constructor(public readonly error: string = '') {}
}

export type ParseResult = ParseSuccess | ParseError;

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
        public readonly boundLeft: number,
        public readonly boundRight: number,
        public readonly boundTop: number,
        public readonly boundBottom: number,
    ) {}
}

export type RenderParams = {
    readonly width: number;
    readonly height: number;
};

export function createRenderParams({
    width = 250,
    height = 250,
}: {
    width?: number;
    height?: number;
} = {}): RenderParams {
    return { width, height };
}
