import { ParseError, ParseResult, Instruction, Position, Color, SinglePosition, IntervalPosition, Viewport, MarkNone, MarkNumber } from "./models";
import { parseCoordinate } from "./utils";

export class Parser {

    private lineParsers: LineParser[] = [
        new BoardSizeParser(),
        new CoordinatesParser(),
        new ViewportParser(),
        new MoveParser(),
        new HoshiParser(),
    ];

    parse(source: string): ParseResult {
        const lines = source.trim().split('\n');
        let result: ParseResult = new ParseResult();
        
        for (let lineNumber = 1; lineNumber <= lines.length; lineNumber++) {
            const line = lines[lineNumber - 1];
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            let lineProcessed = false;

            for (const parser of this.lineParsers) {
                if (parser.isApplicable(trimmedLine)) {
                    result = parser.parse(trimmedLine, lineNumber, result);
                    lineProcessed = true;
                    break;
                }
            }
            
            if (!lineProcessed) {
                result = new ParseResult(
                    result.instructions,
                    result.boardSize,
                    result.showCoordinates,
                    [...result.errors, new ParseError(lineNumber, `Unknown format: ${trimmedLine}`)],
                    result.viewport,
                    result.showHoshi
                );
            }
        }
        
        return result;
    }
}

interface LineParser {
    isApplicable(line: string): boolean;
    parse(line: string, lineNumber: number, currentResult: ParseResult): ParseResult;
}

export class BoardSizeParser implements LineParser {
    isApplicable(line: string): boolean {
        return line.trim().match(/^size\s/i) !== null;
    }
    parse(line: string, lineNumber: number, currentResult: ParseResult): ParseResult {
        const trimmedLine = line.trim();
        const sizeMatch = trimmedLine.match(/size\s+(\d+)x(\d+)/i);
        if (sizeMatch) {
            const width = parseInt(sizeMatch[1], 10);
            const height = parseInt(sizeMatch[2], 10);
            if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
                const errors = [...currentResult.errors, new ParseError(lineNumber, `Invalid board size: ${trimmedLine}`)];
                return new ParseResult(currentResult.instructions, currentResult.boardSize, currentResult.showCoordinates, errors, currentResult.viewport, currentResult.showHoshi);
            } else {
                return new ParseResult(currentResult.instructions, { width, height }, currentResult.showCoordinates, currentResult.errors, currentResult.viewport, currentResult.showHoshi);
            }
        }
        const errors = [...currentResult.errors, new ParseError(lineNumber, `Invalid board size format: ${trimmedLine}`)];
        return new ParseResult(currentResult.instructions, currentResult.boardSize, currentResult.showCoordinates, errors, currentResult.viewport, currentResult.showHoshi);
    }
}

export class CoordinatesParser implements LineParser {
    isApplicable(line: string): boolean {
        return line.trim().match(/^coordinates\s+(on|off)$/i) !== null;
    }
    parse(line: string, lineNumber: number, currentResult: ParseResult): ParseResult {
        const trimmedLine = line.trim();
        const coordsMatch = trimmedLine.match(/^coordinates\s+(on|off)$/i);
        if (coordsMatch) {
            const showCoordinates = coordsMatch[1].toLowerCase() === 'on';
            return new ParseResult(
                currentResult.instructions,
                currentResult.boardSize,
                showCoordinates,
                currentResult.errors,
                currentResult.viewport,
                currentResult.showHoshi
            );
        }
        // This shouldn't happen if isApplicable is correct, but handle it anyway
        const errors = [...currentResult.errors, new ParseError(lineNumber, `Invalid coordinates format: ${trimmedLine}`)];
        return new ParseResult(currentResult.instructions, currentResult.boardSize, currentResult.showCoordinates, errors, currentResult.viewport, currentResult.showHoshi);
    }
}

export class ViewportParser implements LineParser {
    isApplicable(line: string): boolean {
        return line.trim().toLowerCase().startsWith('viewport');
    }
    parse(line: string, lineNumber: number, currentResult: ParseResult): ParseResult {
        const trimmedLine = line.trim();
        const viewportMatch = trimmedLine.match(/^viewport\s+([^\s]+)\s*-\s*([^\s]+)$/i);
        if (!viewportMatch) {
            const errors = [...currentResult.errors, new ParseError(lineNumber, 'Invalid viewport format')];
            return new ParseResult(
                currentResult.instructions,
                currentResult.boardSize,
                currentResult.showCoordinates,
                errors,
                currentResult.viewport,
                currentResult.showHoshi
            );
        }
        const start = parseCoordinate(viewportMatch[1]);
        const end = parseCoordinate(viewportMatch[2]);
        if (!start || !end) {
            const errors = [...currentResult.errors, new ParseError(lineNumber, 'Invalid viewport coordinates')];
            return new ParseResult(
                currentResult.instructions,
                currentResult.boardSize,
                currentResult.showCoordinates,
                errors,
                currentResult.viewport,
                currentResult.showHoshi
            );
        }
        const viewport = new Viewport(new SinglePosition(start.x, start.y), new SinglePosition(end.x, end.y));
        return new ParseResult(
            currentResult.instructions,
            currentResult.boardSize,
            currentResult.showCoordinates,
            currentResult.errors,
            viewport,
            currentResult.showHoshi
        );
    }
}

export class MoveParser implements LineParser {
    isApplicable(line: string): boolean {
        return line.trim().match(/^([BW])(?:\((\d+)\))?\s+(.+)$/i) !== null;
    }
    parse(line: string, lineNumber: number, currentResult: ParseResult): ParseResult {
        const trimmedLine = line.trim();
        const moveMatch = trimmedLine.match(/^([BW])(?:\((\d+)\))?\s+(.+)$/i);
        if (!moveMatch) {
            // This shouldn't happen if isApplicable is correct, but handle it anyway
            const errors = [...currentResult.errors, new ParseError(lineNumber, `Invalid move format: ${trimmedLine}`)];
            return new ParseResult(
                currentResult.instructions,
                currentResult.boardSize,
                currentResult.showCoordinates,
                errors,
                currentResult.viewport,
                currentResult.showHoshi
            );
        }
        
        const colorStr = moveMatch[1].toUpperCase();
        const numberStr = moveMatch[2]; // May be undefined if no parentheses
        const coordinatesStr = moveMatch[3];
        const color = colorStr === 'B' ? Color.Black : Color.White;
        
        // Create mark based on whether number is present
        const mark = numberStr ? new MarkNumber(parseInt(numberStr, 10)) : new MarkNone();
        
        // Parse all positions for this instruction
        const parseResult = this.parsePositions(coordinatesStr, lineNumber, currentResult.errors);
        if (parseResult.positions.length > 0) {
            return new ParseResult(
                [...currentResult.instructions, new Instruction(color, mark, parseResult.positions)],
                currentResult.boardSize,
                currentResult.showCoordinates,
                parseResult.errors,
                currentResult.viewport,
                currentResult.showHoshi
            );
        } else {
            // If no positions but there were errors, update errors
            if (parseResult.errors.length > currentResult.errors.length) {
                return new ParseResult(
                    currentResult.instructions,
                    currentResult.boardSize,
                    currentResult.showCoordinates,
                    parseResult.errors,
                    currentResult.viewport,
                    currentResult.showHoshi
                );
            }
            return currentResult;
        }
    }
    
    private parsePositions(coordinatesStr: string, lineNumber: number, currentErrors: ParseError[]): { positions: Position[], errors: ParseError[] } {
        const positions: Position[] = [];
        let errors: ParseError[] = [...currentErrors];
        
        // Split by commas and process all parts
        const coords = coordinatesStr.split(',').map(coord => coord.trim());
        for (const coord of coords) {
            const result = this.parsePosition(coord, lineNumber, errors);
            errors = result.errors;
            if (result.position) {
                positions.push(result.position);
            }
        }
        
        return { positions, errors };
    }
    
    private parsePosition(coord: string, lineNumber: number, errors: ParseError[]): { position: Position | null, errors: ParseError[] } {
        // Check if it's an interval (contains dash)
        if (coord.includes('-')) {
            const parts = coord.split('-').map(c => c.trim());
            if (parts.length !== 2) {
                return { 
                    position: null, 
                    errors: [...errors, new ParseError(lineNumber, `Invalid interval format: ${coord}`)]
                };
            }
            const [startCoord, endCoord] = parts;
            const startCoords = parseCoordinate(startCoord);
            const endCoords = parseCoordinate(endCoord);
            
            if (startCoords && endCoords) {
                const startPos = new SinglePosition(startCoords.x, startCoords.y);
                const endPos = new SinglePosition(endCoords.x, endCoords.y);
                return { position: new IntervalPosition(startPos, endPos), errors };
            } else {
                const newErrors = [...errors];
                if (!startCoords) {
                    newErrors.push(new ParseError(lineNumber, `Invalid start coordinate: ${startCoord}`));
                }
                if (!endCoords) {
                    newErrors.push(new ParseError(lineNumber, `Invalid end coordinate: ${endCoord}`));
                }
                return { position: null, errors: newErrors };
            }
        } else {
            // Single position
            const coords = parseCoordinate(coord);
            if (coords) {
                return { position: new SinglePosition(coords.x, coords.y), errors };
            } else {
                return { 
                    position: null, 
                    errors: [...errors, new ParseError(lineNumber, `Invalid coordinate: ${coord}`)]
                };
            }
        }
    }
}

export class HoshiParser implements LineParser {
    isApplicable(line: string): boolean {
        return line.trim().match(/^hoshi\s+(on|off)$/i) !== null;
    }
    parse(line: string, lineNumber: number, currentResult: ParseResult): ParseResult {
        const trimmedLine = line.trim();
        const hoshiMatch = trimmedLine.match(/^hoshi\s+(on|off)$/i);
        if (hoshiMatch) {
            const showHoshi = hoshiMatch[1].toLowerCase() === 'on';
            return new ParseResult(
                currentResult.instructions,
                currentResult.boardSize,
                currentResult.showCoordinates,
                currentResult.errors,
                currentResult.viewport,
                showHoshi
            );
        }
        // This shouldn't happen if isApplicable is correct, but handle it anyway
        const errors = [...currentResult.errors, new ParseError(lineNumber, `Invalid hoshi format: ${trimmedLine}`)];
        return new ParseResult(currentResult.instructions, currentResult.boardSize, currentResult.showCoordinates, errors, currentResult.viewport, currentResult.showHoshi);
    }
}
