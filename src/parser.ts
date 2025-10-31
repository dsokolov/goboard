import { ParseError, ParseResult, ParseSuccess, Instruction, Position, Color, SinglePosition, IntervalPosition, BoardSize, Viewport } from "./models";
import { parseCoordinate } from "./utils";

export class Parser {

    parse(source: string): ParseResult {
        if (source.trim() === '') {
            return new ParseError("Empty string");
        }
        
        const lines = source.trim().split('\n');
        let boardSize: BoardSize | null = null;
        const moves: Instruction[] = [];
        let showCoordinates = true;
        let viewport: Viewport | null = null;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            // Parse board size from "size WIDTHxHEIGHT" format
            const sizeMatch = trimmedLine.match(/size\s+(\d+)x(\d+)/i);
            if (sizeMatch) {
                const width = parseInt(sizeMatch[1], 10);
                const height = parseInt(sizeMatch[2], 10);
                boardSize = { width, height };
                continue;
            }

            // Parse coordinates visibility from "coordinates on|off" format
            const coordsMatch = trimmedLine.match(/^coordinates\s+(on|off)$/i);
            if (coordsMatch) {
                showCoordinates = coordsMatch[1].toLowerCase() === 'on';
                continue;
            }
            
            // Parse viewport from "viewport A1-H9" format
            if (trimmedLine.toLowerCase().startsWith('viewport')) {
                const viewportMatch = trimmedLine.match(/^viewport\s+([^\s]+)\s*-\s*([^\s]+)$/i);
                if (!viewportMatch) {
                    return new ParseError('Invalid viewport');
                }
                const start = parseCoordinate(viewportMatch[1]);
                const end = parseCoordinate(viewportMatch[2]);
                if (!start || !end) {
                    return new ParseError('Invalid viewport');
                }
                viewport = new Viewport(new SinglePosition(start.x, start.y), new SinglePosition(end.x, end.y));
                continue;
            }

            // Parse moves from "B A1" or "W J9" format, including comma and dash separated
            const moveMatch = trimmedLine.match(/^([BW])\s+(.+)$/i);
            if (moveMatch) {
                const colorStr = moveMatch[1].toUpperCase();
                const coordinatesStr = moveMatch[2];
                
                const color = colorStr === 'B' ? Color.Black : Color.White;
                
                // Parse all positions for this instruction
                const positions = this.parsePositions(coordinatesStr);
                if (positions.length > 0) {
                    moves.push(new Instruction(color, positions));
                }
            }
        }
        
        if (!boardSize) {
            return new ParseError("Invalid format");
        }
        
        return new ParseSuccess(moves, boardSize, showCoordinates, viewport);
    }
    
    private parsePositions(coordinatesStr: string): Position[] {
        const positions: Position[] = [];
        
        // Split by commas and process all parts
        const coords = coordinatesStr.split(',').map(coord => coord.trim());
        for (const coord of coords) {
            const position = this.parsePosition(coord);
            if (position) {
                positions.push(position);
            }
        }
        
        return positions;
    }
    
    private parsePosition(coord: string): Position | null {
        // Check if it's an interval (contains dash)
        if (coord.includes('-')) {
            const [startCoord, endCoord] = coord.split('-').map(c => c.trim());
            const startCoords = parseCoordinate(startCoord);
            const endCoords = parseCoordinate(endCoord);
            
            if (startCoords && endCoords) {
                const startPos = new SinglePosition(startCoords.x, startCoords.y);
                const endPos = new SinglePosition(endCoords.x, endCoords.y);
                return new IntervalPosition(startPos, endPos);
            }
        } else {
            // Single position
            const coords = parseCoordinate(coord);
            if (coords) {
                return new SinglePosition(coords.x, coords.y);
            }
        }
        
        return null;
    }
}
