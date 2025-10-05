export enum Cell {
    Empty = 'empty',
    Black = 'black',
    White = 'white',
}

export class Board {
    constructor(public readonly cells: Cell[][]) {}
}
