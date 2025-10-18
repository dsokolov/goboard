import { BoardSize, ParseSuccess, Instruction, Color, SinglePosition, IntervalPosition, Board, Point, PointContent } from "./models";

export class Mapper {
    map(source: ParseSuccess): Board {
        const { boardSize, instructions, showCoordinates } = source;
        const points: Point[][] = [];
        
        // Создаем пустую доску
        for (let i = 0; i < boardSize.height; i++) {
            points[i] = [];
            for (let j = 0; j < boardSize.width; j++) {
                const hoshi = this.hasHoshi(boardSize, i, j);
                points[i][j] = new Point(PointContent.Empty, hoshi);
            }
        }
        
        // Применяем инструкции
        for (const instruction of instructions) {
            this.applyInstruction(points, instruction);
        }
        
        return new Board(points, showCoordinates);
    }
    
    private applyInstruction(points: Point[][], instruction: Instruction): void {
        const content = this.mapColorToContent(instruction.color);
        
        for (const position of instruction.positions) {
            if (position instanceof SinglePosition) {
                this.placeStone(points, position.x, position.y, content);
            } else if (position instanceof IntervalPosition) {
                this.placeInterval(points, position, content);
            }
        }
    }
    
    private placeStone(points: Point[][], x: number, y: number, content: PointContent): void {
        if (x >= 0 && x < points.length && y >= 0 && y < points[x].length) {
            const existing = points[x][y];
            const hoshi = existing ? existing.hasHoshi : false;
            points[x][y] = new Point(content, hoshi);
        }
    }
    
    private placeInterval(points: Point[][], interval: IntervalPosition, content: PointContent): void {
        const startX = interval.start.x;
        const startY = interval.start.y;
        const endX = interval.end.x;
        const endY = interval.end.y;
        
        // Определяем границы прямоугольника
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);
        
        // Заполняем весь прямоугольник
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                this.placeStone(points, x, y, content);
            }
        }
    }
    
    private mapColorToContent(color: Color): PointContent {
        return color === Color.Black ? PointContent.Black : 
               color === Color.White ? PointContent.White : 
               PointContent.Empty;
    }

    private hasHoshi(boardSize: BoardSize, x: number, y: number): boolean {
        const hoshiPositions: Record<string, number[]> = {
            '19x19': [3, 9, 15],
            '13x13': [3, 6, 9],
            '9x9': [2, 4, 6]
        };
        
        const key = `${boardSize.width}x${boardSize.height}`;
        const coords = hoshiPositions[key];
        
        if (!coords) return false;
        
        // Special case for 9x9: center point is always hoshi, corners are hoshi
        if (key === '9x9') {
            return (coords.includes(x) && coords.includes(y)) || (x === 4 && y === 4);
        }
        
        return coords.includes(x) && coords.includes(y);
    }
}
