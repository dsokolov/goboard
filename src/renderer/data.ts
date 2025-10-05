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
    constructor(public readonly points: Point[][]) {}
}

export class RenderParams {
    constructor(
        public readonly width: number, 
        public readonly height: number,
        public readonly margin?: number,
    ) {}
}
