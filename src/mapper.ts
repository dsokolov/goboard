import { BoardSize, ParseResult, Instruction, Color, SinglePosition, IntervalPosition, Board, Point, PointContent, Viewport } from "./models";

export class Mapper {
    map(source: ParseResult): Board {
        // Проверяем, если это ParseResult с ошибками
        if (source.errors.length > 0) {
            throw new Error(`Parse errors: ${source.errors.map(e => e.message).join(', ')}`);
        }
        
        const { boardSize, instructions, showCoordinates, showHoshi } = source;
        const points: Point[][] = [];
        
        // Создаем пустую доску
        // points[y][x] где y - строка (row), x - колонка (column)
        for (let i = 0; i < boardSize.height; i++) {
            points[i] = [];
            for (let j = 0; j < boardSize.width; j++) {
                // hasHoshi принимает (x, y) = (колонка, строка)
                const hoshi = showHoshi && this.hasHoshi(boardSize, j, i);
                points[i][j] = new Point(PointContent.Empty, hoshi);
            }
        }
        
        // Применяем инструкции
        for (const instruction of instructions) {
            this.applyInstruction(points, instruction);
        }
        
        // Рассчитываем границы отображения (bounds)
        const viewport = source.viewport;
        const bounds = this.mapViewport(boardSize, viewport);

        return new Board(points, showCoordinates, bounds.boundLeft, bounds.boundRight, bounds.boundTop, bounds.boundBottom);
    }
    
    private mapViewport(boardSize: BoardSize, viewport: Viewport | null): {
        boundLeft: number;
        boundRight: number;
        boundTop: number;
        boundBottom: number;
    } {
        const fullLeft = 0;
        const fullTop = 0;
        const fullRight = boardSize.width - 1;
        const fullBottom = boardSize.height - 1;

        let boundLeft = fullLeft;
        let boundRight = fullRight;
        let boundTop = fullTop;
        let boundBottom = fullBottom;

        if (viewport) {
            const startX = viewport.start.x;
            const startY = viewport.start.y;
            const endX = viewport.end.x;
            const endY = viewport.end.y;

            boundLeft = Math.max(fullLeft, Math.min(startX, endX));
            boundRight = Math.min(fullRight, Math.max(startX, endX));
            boundTop = Math.max(fullTop, Math.min(startY, endY));
            boundBottom = Math.min(fullBottom, Math.max(startY, endY));
        }

        return { boundLeft, boundRight, boundTop, boundBottom };
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
        if (y >= 0 && y < points.length && x >= 0 && x < points[y].length) {
            const existing = points[y][x];
            const hoshi = existing ? existing.hasHoshi : false;
            points[y][x] = new Point(content, hoshi);
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
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                this.placeStone(points, x, y, content);
            }
        }
    }
    
    private mapColorToContent(color: Color): PointContent {
        return color === Color.Black ? PointContent.Black : 
               color === Color.White ? PointContent.White : 
               PointContent.Empty;
    }

    /**
     * Проверяет, является ли позиция хоси (звездной точкой)
     * @param boardSize Размер доски
     * @param x Колонка (0-based, A=0, B=1, ..., J=8, ...)
     * @param y Строка (0-based, 1=0, 2=1, ..., 9=8, ...)
     * @returns true если позиция является хоси
     */
    private hasHoshi(boardSize: BoardSize, x: number, y: number): boolean {
        const key = `${boardSize.width}x${boardSize.height}`;
        
        // Стандартные позиции хоси для разных размеров досок
        if (key === '19x19') {
            // Для 19x19: позиции 3, 9, 15 (4-4, 10-10, 16-16 и их комбинации)
            // Координаты: x=колонка, y=строка
            const hoshiCoords = [3, 9, 15];
            return hoshiCoords.includes(x) && hoshiCoords.includes(y);
        }
        
        if (key === '13x13') {
            // Для 13x13: позиции 3, 6, 9 (4-4, 7-7, 10-10 и их комбинации)
            // Координаты: x=колонка, y=строка
            const hoshiCoords = [3, 6, 9];
            return hoshiCoords.includes(x) && hoshiCoords.includes(y);
        }
        
        if (key === '9x9') {
            // Для 9x9: стандартные позиции хоси согласно правилам Го
            // C3, G3, E5 (центр), C7, G7
            // В 0-based координатах [x, y]: (2,2), (6,2), (4,4), (2,6), (6,6)
            // где x - колонка (C=2, E=4, G=6), y - строка (3=2, 5=4, 7=6)
            const hoshiPositions: [number, number][] = [
                [2, 2], // C3
                [6, 2], // G3  
                [4, 4], // E5 (центр)
                [2, 6], // C7
                [6, 6]  // G7
            ];
            return hoshiPositions.some(([hx, hy]) => hx === x && hy === y);
        }
        
        return false;
    }
}
