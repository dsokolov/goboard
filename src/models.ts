import { GoBoardPluginSettings, BOARD_SIZES, DEFAULT_SETTINGS } from './settings';
import { parseCoordinate } from './utils';

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

export type HoshiPointKey = `${number},${number}`;

export function makeHoshiPointKey(x: number, y: number): HoshiPointKey {
    return `${x},${y}`;
}

export type HoshiParseSuccess = {
    showHoshi: boolean;
    customHoshiPoints: Set<HoshiPointKey> | null;
};

/**
 * Parses the value after `hoshi` in diagram DSL.
 * Disabled aliases → showHoshi false; enabled aliases → standard layout;
 * otherwise comma/space-separated board coordinates for custom hoshi points.
 */
export function parseHoshiValue(
    value: string,
    boardSize: BoardSize,
): HoshiParseSuccess | { error: string } {
    const normalized = value.trim().toLowerCase();

    if (['none', 'off', 'no', 'false', 'disabled'].includes(normalized)) {
        return { showHoshi: false, customHoshiPoints: null };
    }

    if (['yes', 'on', 'enabled'].includes(normalized)) {
        return { showHoshi: true, customHoshiPoints: null };
    }

    const tokens = value
        .trim()
        .split(/[,\s]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    if (tokens.length === 0) {
        return { error: 'Invalid hoshi format: empty coordinate list' };
    }

    const customHoshiPoints = new Set<HoshiPointKey>();
    for (const token of tokens) {
        const coords = parseCoordinate(token);
        if (!coords) {
            return { error: `Invalid coordinate: ${token}` };
        }
        if (coords.x < 0 || coords.x >= boardSize.width || coords.y < 0 || coords.y >= boardSize.height) {
            return { error: `Coordinate out of bounds: ${token}` };
        }
        customHoshiPoints.add(makeHoshiPointKey(coords.x, coords.y));
    }

    return { showHoshi: true, customHoshiPoints };
}

export class ParseResult {
    constructor(
        public readonly instructions: Instruction[],
        public readonly boardSize: BoardSize,
        public readonly coordinateSides: Set<string>,
        public readonly errors: ParseError[],
        public readonly viewport: Viewport | null,
        public readonly showHoshi: boolean,
        /**
         * If set, hoshi marks are rendered only at these points (0-based x,y).
         * If null, standard hoshi points are used when showHoshi is true.
         */
        public readonly customHoshiPoints: Set<HoshiPointKey> | null
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
            settingsToUse.showHoshi,
            null
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
