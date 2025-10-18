import { ParseError, ParseResult, ParseSuccess, Instruction, Position, Color, SinglePosition, IntervalPosition } from "./models";

export class Parser {

    parse(source: string): ParseResult {
        if (source.trim() === '') {
            return new ParseError("Empty string");
        }
        
        const lines = source.trim().split('\n');
        let boardSize: { width: number, height: number } | null = null;
        const moves: Instruction[] = [];
        let showCoordinates = true;
        
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
        
        return new ParseSuccess(moves, boardSize, showCoordinates);
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
            const startPos = this.parseCoordinate(startCoord);
            const endPos = this.parseCoordinate(endCoord);
            
            if (startPos && endPos && startPos instanceof SinglePosition && endPos instanceof SinglePosition) {
                return new IntervalPosition(startPos, endPos);
            }
        } else {
            // Single position
            return this.parseCoordinate(coord);
        }
        
        return null;
    }
    
    private parseCoordinate(coord: string): SinglePosition | null {
        // Parse coordinate like "A1" -> (0,0), "J9" -> (8,8)
        const match = coord.match(/^([A-Z])(\d+)$/);
        if (!match) return null;
        
        const letter = match[1].toUpperCase();
        const number = parseInt(match[2], 10);
        
        // Учитываем пропуск буквы 'I' в традиционной нотации Го
        let x = letter.charCodeAt(0) - 'A'.charCodeAt(0);
        if (letter >= 'J') {
            x = x - 1; // Сдвигаем на одну позицию влево для букв J и далее
        }
        
        const y = number - 1;
        
        return new SinglePosition(x, y);
    }
}
