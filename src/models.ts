import { GoBoardPluginSettings, BOARD_SIZES, DEFAULT_SETTINGS } from './settings';

export const COORDINATE_SIDES = {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right',
} as const;

export type CoordinateSide = typeof COORDINATE_SIDES[keyof typeof COORDINATE_SIDES];

/**
 * Нормализует строковое значение координат в Set сторон
 * Поддерживает обратную совместимость со старыми значениями on/off
 */
export function normalizeCoordinateSides(value: string): Set<string> {
    const normalized = value.trim().toLowerCase();
    
    // Значения, означающие "нет координат"
    if (['none', 'off', 'no', 'false', 'disabled'].includes(normalized)) {
        return new Set<string>();
    }
    
    // Значения, означающие "все стороны"
    if (['yes', 'on', 'enabled'].includes(normalized)) {
        return new Set<string>([COORDINATE_SIDES.TOP, COORDINATE_SIDES.BOTTOM, COORDINATE_SIDES.LEFT, COORDINATE_SIDES.RIGHT]);
    }
    
    // Парсим комбинации сторон
    const sides = normalized
        .split(/[,\s]+/)
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0);
    
    const validSides = new Set<string>();
    const validSideValues: string[] = [COORDINATE_SIDES.TOP, COORDINATE_SIDES.BOTTOM, COORDINATE_SIDES.LEFT, COORDINATE_SIDES.RIGHT];
    
    for (const side of sides) {
        if (validSideValues.includes(side)) {
            validSides.add(side);
        }
    }
    
    return validSides;
}

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
        public readonly instructions: Instruction[],
        public readonly boardSize: BoardSize,
        public readonly coordinateSides: Set<string>,
        public readonly errors: ParseError[],
        public readonly viewport: Viewport | null,
        public readonly showHoshi: boolean
    ) {}

    static create(settings: GoBoardPluginSettings | null = null): ParseResult {
        const settingsToUse = settings || DEFAULT_SETTINGS;
        const boardSizeOption = BOARD_SIZES[settingsToUse.defaultBoardSize];
        // Конвертируем настройки координат в Set
        let coordinateSides: Set<string>;
        if (settingsToUse.coordinateSides && Array.isArray(settingsToUse.coordinateSides)) {
            // Новый формат - массив строк
            coordinateSides = new Set<string>(settingsToUse.coordinateSides);
        } else if (settingsToUse.showCoordinates !== undefined && typeof settingsToUse.showCoordinates === 'boolean') {
            // Старый формат - boolean для обратной совместимости
            coordinateSides = settingsToUse.showCoordinates 
                ? new Set<string>([COORDINATE_SIDES.TOP, COORDINATE_SIDES.BOTTOM, COORDINATE_SIDES.LEFT, COORDINATE_SIDES.RIGHT])
                : new Set<string>();
        } else {
            // Значение по умолчанию - все стороны
            coordinateSides = new Set<string>([COORDINATE_SIDES.TOP, COORDINATE_SIDES.BOTTOM, COORDINATE_SIDES.LEFT, COORDINATE_SIDES.RIGHT]);
        }
        return new ParseResult(
            [],
            { width: boardSizeOption.width, height: boardSizeOption.height },
            coordinateSides,
            [],
            null,
            settingsToUse.showHoshi
        );
    }
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
        public readonly coordinateSides: Set<string>,
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
