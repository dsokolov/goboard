import { BoardSize, ParseSuccess, Instruction, Color, SinglePosition, IntervalPosition } from "../parser/data";
import { Mapper } from "./mapper";
import { Board, Point, PointContent, RenderColors } from "../renderer/data";
import { SchemeColors } from "../scheme-colors";

export class MapperImpl implements Mapper {
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
        switch (color) {
            case Color.Black:
                return PointContent.Black;
            case Color.White:
                return PointContent.White;
            default:
                return PointContent.Empty;
        }
    }

    private hasHoshi(boardSize: BoardSize, x: number, y: number): boolean {
        const key = `${boardSize.width}x${boardSize.height}`;
        switch (key) {
            case '19x19':
                return this.hasHoshi19(x, y);
            case '13x13':
                return this.hasHoshi13(x, y);
            case '9x9':
                return this.hasHoshi9(x, y);
            default:
                return false;
        }
    }

    private hasHoshi19(x: number, y: number): boolean {
        const coords = [3, 9, 15];
        return coords.includes(x) && coords.includes(y);
    }

    private hasHoshi13(x: number, y: number): boolean {
        const coords = [3, 6, 9];
        return coords.includes(x) && coords.includes(y);
    }

    private hasHoshi9(x: number, y: number): boolean {
        return (
            ((x === 2 || x === 6) && (y === 2 || y === 6)) ||
            (x === 4 && y === 4)
        );
    }

    mapSchemeColorsToRenderColors(schemeColors: SchemeColors): RenderColors {
        return new RenderColors({
            boardColor: schemeColors.background,     // используем фон схемы для доски
            lineColor: schemeColors.border,          // используем цвет границ для линий
            blackStoneColor: schemeColors.text,      // используем основной текст для черных камней
            whiteStoneColor: schemeColors.foreground // используем вторичный фон для белых камней
        });
    }
}
