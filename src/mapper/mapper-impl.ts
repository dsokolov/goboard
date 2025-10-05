import { ParseSuccess, Instruction, Color, Position, SinglePosition, IntervalPosition } from "../parser/data";
import { Mapper } from "./mapper";
import { Board, Cell } from "../renderer/data";

export class MapperImpl implements Mapper {
    map(source: ParseSuccess): Board {
        const { boardSize, instructions } = source;
        const cells: Cell[][] = [];
        
        // Создаем пустую доску
        for (let i = 0; i < boardSize.height; i++) {
            cells[i] = [];
            for (let j = 0; j < boardSize.width; j++) {
                cells[i][j] = Cell.Empty;
            }
        }
        
        // Применяем инструкции
        for (const instruction of instructions) {
            this.applyInstruction(cells, instruction);
        }
        
        return new Board(cells);
    }
    
    private applyInstruction(cells: Cell[][], instruction: Instruction): void {
        const cellType = this.mapColorToCell(instruction.color);
        
        for (const position of instruction.positions) {
            if (position instanceof SinglePosition) {
                this.placeStone(cells, position.x, position.y, cellType);
            } else if (position instanceof IntervalPosition) {
                this.placeInterval(cells, position, cellType);
            }
        }
    }
    
    private placeStone(cells: Cell[][], x: number, y: number, cellType: Cell): void {
        if (x >= 0 && x < cells.length && y >= 0 && y < cells[x].length) {
            cells[x][y] = cellType;
        }
    }
    
    private placeInterval(cells: Cell[][], interval: IntervalPosition, cellType: Cell): void {
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
                this.placeStone(cells, x, y, cellType);
            }
        }
    }
    
    private mapColorToCell(color: Color): Cell {
        switch (color) {
            case Color.Black:
                return Cell.Black;
            case Color.White:
                return Cell.White;
            default:
                return Cell.Empty;
        }
    }
}
