import { createMapper, Mapper } from '../src/mapper/mapper';
import { ParseSuccess, Instruction, Color, SinglePosition, IntervalPosition, BoardSize } from '../src/parser/data';
import { Board, Cell } from '../src/renderer/data';

describe('Mapper', () => {
  let mapper: Mapper;

  beforeEach(() => {
    mapper = createMapper();
  });

  describe('map', () => {
    it('должен создавать пустую доску 3x3', () => {
      const parseSuccess = new ParseSuccess([], new BoardSize(3, 3));
      const board = mapper.map(parseSuccess);

      expect(board).toBeInstanceOf(Board);
      expect(board.cells).toHaveLength(3);
      expect(board.cells[0]).toHaveLength(3);
      expect(board.cells[1]).toHaveLength(3);
      expect(board.cells[2]).toHaveLength(3);
      
      // Проверяем, что все клетки пустые
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          expect(board.cells[i][j]).toBe(Cell.Empty);
        }
      }
    });

    it('должен создавать пустую доску 9x9', () => {
      const parseSuccess = new ParseSuccess([], new BoardSize(9, 9));
      const board = mapper.map(parseSuccess);

      expect(board).toBeInstanceOf(Board);
      expect(board.cells).toHaveLength(9);
      expect(board.cells[0]).toHaveLength(9);
      
      // Проверяем, что все клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          expect(board.cells[i][j]).toBe(Cell.Empty);
        }
      }
    });

    it('должен создавать пустую доску 19x19', () => {
      const parseSuccess = new ParseSuccess([], new BoardSize(19, 19));
      const board = mapper.map(parseSuccess);

      expect(board).toBeInstanceOf(Board);
      expect(board.cells).toHaveLength(19);
      expect(board.cells[0]).toHaveLength(19);
      
      // Проверяем, что все клетки пустые
      for (let i = 0; i < 19; i++) {
        for (let j = 0; j < 19; j++) {
          expect(board.cells[i][j]).toBe(Cell.Empty);
        }
      }
    });

    it('должен размещать черный камень в позиции A1 (0,0)', () => {
      const instruction = new Instruction(Color.Black, [new SinglePosition(0, 0)]);
      const parseSuccess = new ParseSuccess([instruction], new BoardSize(9, 9));
      const board = mapper.map(parseSuccess);

      expect(board.cells[0][0]).toBe(Cell.Black);
      
      // Проверяем, что остальные клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (i !== 0 || j !== 0) {
            expect(board.cells[i][j]).toBe(Cell.Empty);
          }
        }
      }
    });

    it('должен размещать белый камень в позиции J9 (8,8)', () => {
      const instruction = new Instruction(Color.White, [new SinglePosition(8, 8)]);
      const parseSuccess = new ParseSuccess([instruction], new BoardSize(9, 9));
      const board = mapper.map(parseSuccess);

      expect(board.cells[8][8]).toBe(Cell.White);
      
      // Проверяем, что остальные клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (i !== 8 || j !== 8) {
            expect(board.cells[i][j]).toBe(Cell.Empty);
          }
        }
      }
    });

    it('должен размещать несколько камней разных цветов', () => {
      const instructions = [
        new Instruction(Color.Black, [new SinglePosition(0, 0)]),
        new Instruction(Color.White, [new SinglePosition(0, 1)]),
        new Instruction(Color.Black, [new SinglePosition(0, 2)])
      ];
      const parseSuccess = new ParseSuccess(instructions, new BoardSize(9, 9));
      const board = mapper.map(parseSuccess);

      expect(board.cells[0][0]).toBe(Cell.Black);
      expect(board.cells[0][1]).toBe(Cell.White);
      expect(board.cells[0][2]).toBe(Cell.Black);
      
      // Проверяем, что остальные клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (!((i === 0 && j === 0) || (i === 0 && j === 1) || (i === 0 && j === 2))) {
            expect(board.cells[i][j]).toBe(Cell.Empty);
          }
        }
      }
    });

    it('должен обрабатывать интервальные позиции (A1-A5)', () => {
      const instruction = new Instruction(
        Color.Black, 
        [new IntervalPosition(new SinglePosition(0, 0), new SinglePosition(0, 4))]
      );
      const parseSuccess = new ParseSuccess([instruction], new BoardSize(9, 9));
      const board = mapper.map(parseSuccess);

      // Проверяем, что все позиции от A1 до A5 заполнены черными камнями
      for (let j = 0; j <= 4; j++) {
        expect(board.cells[0][j]).toBe(Cell.Black);
      }
      
      // Проверяем, что остальные клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (i !== 0 || j > 4) {
            expect(board.cells[i][j]).toBe(Cell.Empty);
          }
        }
      }
    });

    it('должен обрабатывать смешанные одиночные и интервальные позиции', () => {
      const instruction = new Instruction(
        Color.Black, 
        [
          new SinglePosition(0, 0),
          new IntervalPosition(new SinglePosition(0, 2), new SinglePosition(0, 4))
        ]
      );
      const parseSuccess = new ParseSuccess([instruction], new BoardSize(9, 9));
      const board = mapper.map(parseSuccess);

      // Проверяем одиночную позицию A1
      expect(board.cells[0][0]).toBe(Cell.Black);
      
      // Проверяем интервальную позицию A3-A5
      for (let j = 2; j <= 4; j++) {
        expect(board.cells[0][j]).toBe(Cell.Black);
      }
      
      // Проверяем, что A2 пустая
      expect(board.cells[0][1]).toBe(Cell.Empty);
      
      // Проверяем, что остальные клетки пустые
      for (let i = 1; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          expect(board.cells[i][j]).toBe(Cell.Empty);
        }
      }
    });

    it('должен обрабатывать сложную комбинацию камней', () => {
      const instructions = [
        new Instruction(Color.Black, [new SinglePosition(0, 0)]),
        new Instruction(Color.White, [new SinglePosition(0, 1)]),
        new Instruction(Color.Black, [new SinglePosition(1, 1)]),
        new Instruction(Color.White, [new SinglePosition(2, 2)])
      ];
      const parseSuccess = new ParseSuccess(instructions, new BoardSize(3, 3));
      const board = mapper.map(parseSuccess);

      expect(board.cells[0][0]).toBe(Cell.Black);
      expect(board.cells[0][1]).toBe(Cell.White);
      expect(board.cells[1][1]).toBe(Cell.Black);
      expect(board.cells[2][2]).toBe(Cell.White);
      
      // Проверяем, что остальные клетки пустые
      const expectedEmpty = [
        [0, 2], [1, 0], [1, 2], [2, 0], [2, 1]
      ];
      
      for (const [i, j] of expectedEmpty) {
        expect(board.cells[i][j]).toBe(Cell.Empty);
      }
    });

    it('должен обрабатывать квадратный интервал B3-D5 (должно быть 9 камней)', () => {
      // B3 = (1, 2), D5 = (3, 4) - это должен быть квадрат 3x3
      const instruction = new Instruction(
        Color.Black, 
        [new IntervalPosition(new SinglePosition(1, 2), new SinglePosition(3, 4))]
      );
      const parseSuccess = new ParseSuccess([instruction], new BoardSize(9, 9));
      const board = mapper.map(parseSuccess);

      // Подсчитываем количество черных камней
      let blackStonesCount = 0;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (board.cells[i][j] === Cell.Black) {
            blackStonesCount++;
          }
        }
      }

      // Должно быть ровно 9 камней (квадрат 3x3)
      expect(blackStonesCount).toBe(9);
      
      // Проверяем конкретные позиции квадрата
      // B3-D5 должен покрывать позиции: B3, B4, B5, C3, C4, C5, D3, D4, D5
      const expectedPositions = [
        [1, 2], [1, 3], [1, 4], // B3, B4, B5
        [2, 2], [2, 3], [2, 4], // C3, C4, C5  
        [3, 2], [3, 3], [3, 4]  // D3, D4, D5
      ];
      
      for (const [x, y] of expectedPositions) {
        expect(board.cells[x][y]).toBe(Cell.Black);
      }
      
      // Проверяем, что остальные клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          const isInSquare = expectedPositions.some(([x, y]) => x === i && y === j);
          if (!isInSquare) {
            expect(board.cells[i][j]).toBe(Cell.Empty);
          }
        }
      }
    });
  });
});
