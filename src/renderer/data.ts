export enum Cell {
    Empty = 'empty',
    Black = 'black',
    White = 'white',
}

export class Board {
    constructor(public readonly cells: Cell[][]) {}
}

export class RenderParams {
    constructor(
        public readonly width: number, 
        public readonly height: number,
        public readonly margin?: number,
    ) {}
}
