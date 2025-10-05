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
        public readonly width: number = 250, 
        public readonly height: number = 250,
        public readonly margin: number = 20,
        // Доля от расстояния между пунктами, определяющая диаметр камня (0..1)
        public readonly stoneSize: number = 0.8,
        // Цвет фона/поля доски
        public readonly boardColor: string = '#DCB35C',
        // Цвет линий сетки (и хоси)
        public readonly lineColor: string = '#000000',
        // Цвет черных камней
        public readonly blackStoneColor: string = '#000000',
        // Цвет белых камней
        public readonly whiteStoneColor: string = '#FFFFFF',
    ) {}
}
