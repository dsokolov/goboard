export interface Position {}

export class SinglePosition implements Position {
    constructor(
        public readonly x: number, 
        public readonly y: number
    ) {}
}

export class IntervalPosition implements Position {
    constructor(
        public readonly start: SinglePosition, 
        public readonly end: SinglePosition,
    ) {}
}

export class BoardSize {
    constructor(public readonly width: number, public readonly height: number) {}
}

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

export interface ParseResult {}

export class ParseSuccess implements ParseResult {
    constructor(
        public readonly instructions: Instruction[],
         public readonly boardSize: BoardSize,
         public readonly showCoordinates: boolean = false
    ) {}
}

export class ParseError implements ParseResult {
    constructor(public readonly error: string = '') {}
}

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

    constructor({
        width = 250,
        height = 250,
    }: {
        width?: number;
        height?: number;
    } = {}) {
        this.width = width;
        this.height = height;
    }
}
