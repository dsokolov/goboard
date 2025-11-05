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

export class StoneColor {
    readonly type = 'color' as const;
    constructor(public readonly color: Color) {}
}

export class StoneNone {
    readonly type = 'none' as const;
}

export type Stone = StoneColor | StoneNone;


export class MarkNone {
    readonly type = 'none' as const;
}

export class MarkNumber {
    readonly type = 'number' as const;
    constructor(public readonly n: number) {}
}

export class MarkLetter {
    readonly type = 'letter' as const;
    constructor(public readonly letter: string) {}
}

export type Mark = MarkNone | MarkNumber | MarkLetter;

export class Instruction {
    constructor(
        public readonly stone: Stone,
        public readonly mark: Mark,
        public readonly positions: Position[]
    ) {}
}

export class Viewport {
    constructor(
        public readonly start: SinglePosition,
        public readonly end: SinglePosition
    ) {}
}

export class ParseResult {
    constructor(
        public readonly instructions: Instruction[] = [],
        public readonly boardSize: BoardSize = { width: 19, height: 19 },
        public readonly showCoordinates: boolean = true,
        public readonly errors: ParseError[] = [],
        public readonly viewport: Viewport | null = null,
        public readonly showHoshi: boolean = true
    ) {}
}

export class ParseError {
    constructor(
        public readonly line: number,
        public readonly message: string = '',
    ) {}
}

export enum PointContent {
    Empty = 'empty',
    Black = 'black',
    White = 'white',
}

export class Point {
    constructor(
        public readonly content: PointContent,
        public readonly mark: string | null,
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
