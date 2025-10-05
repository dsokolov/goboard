import { createMapper, Mapper } from '../src/mapper/mapper';
import { ParseSuccess, Instruction, Color, SinglePosition, IntervalPosition, BoardSize } from '../src/parser/data';
import { Board, PointContent } from '../src/renderer/data';

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
      expect(board.points).toHaveLength(3);
      expect(board.points[0]).toHaveLength(3);
      expect(board.points[1]).toHaveLength(3);
      expect(board.points[2]).toHaveLength(3);
      
      // Проверяем, что все клетки пустые
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          expect(board.points[i][j].content).toBe(PointContent.Empty);
        }
      }
    });

    it('должен создавать пустую доску 9x9', () => {
      const parseSuccess = new ParseSuccess([], new BoardSize(9, 9));
      const board = mapper.map(parseSuccess);

      expect(board).toBeInstanceOf(Board);
      expect(board.points).toHaveLength(9);
      expect(board.points[0]).toHaveLength(9);
      
      // Проверяем, что все клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          expect(board.points[i][j].content).toBe(PointContent.Empty);
        }
      }
    });

    it('должен создавать пустую доску 19x19', () => {
      const parseSuccess = new ParseSuccess([], new BoardSize(19, 19));
      const board = mapper.map(parseSuccess);

      expect(board).toBeInstanceOf(Board);
      expect(board.points).toHaveLength(19);
      expect(board.points[0]).toHaveLength(19);
      
      // Проверяем, что все клетки пустые
      for (let i = 0; i < 19; i++) {
        for (let j = 0; j < 19; j++) {
          expect(board.points[i][j].content).toBe(PointContent.Empty);
        }
      }
    });

    it('должен размещать черный камень в позиции A1 (0,0)', () => {
      const instruction = new Instruction(Color.Black, [new SinglePosition(0, 0)]);
      const parseSuccess = new ParseSuccess([instruction], new BoardSize(9, 9));
      const board = mapper.map(parseSuccess);

      expect(board.points[0][0].content).toBe(PointContent.Black);
      
      // Проверяем, что остальные клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (i !== 0 || j !== 0) {
            expect(board.points[i][j].content).toBe(PointContent.Empty);
          }
        }
      }
    });

    it('должен размещать белый камень в позиции J9 (8,8)', () => {
      const instruction = new Instruction(Color.White, [new SinglePosition(8, 8)]);
      const parseSuccess = new ParseSuccess([instruction], new BoardSize(9, 9));
      const board = mapper.map(parseSuccess);

      expect(board.points[8][8].content).toBe(PointContent.White);
      
      // Проверяем, что остальные клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (i !== 8 || j !== 8) {
            expect(board.points[i][j].content).toBe(PointContent.Empty);
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

      expect(board.points[0][0].content).toBe(PointContent.Black);
      expect(board.points[0][1].content).toBe(PointContent.White);
      expect(board.points[0][2].content).toBe(PointContent.Black);
      
      // Проверяем, что остальные клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (!((i === 0 && j === 0) || (i === 0 && j === 1) || (i === 0 && j === 2))) {
            expect(board.points[i][j].content).toBe(PointContent.Empty);
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
        expect(board.points[0][j].content).toBe(PointContent.Black);
      }
      
      // Проверяем, что остальные клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (i !== 0 || j > 4) {
            expect(board.points[i][j].content).toBe(PointContent.Empty);
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
      expect(board.points[0][0].content).toBe(PointContent.Black);
      
      // Проверяем интервальную позицию A3-A5
      for (let j = 2; j <= 4; j++) {
        expect(board.points[0][j].content).toBe(PointContent.Black);
      }
      
      // Проверяем, что A2 пустая
      expect(board.points[0][1].content).toBe(PointContent.Empty);
      
      // Проверяем, что остальные клетки пустые
      for (let i = 1; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          expect(board.points[i][j].content).toBe(PointContent.Empty);
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

      expect(board.points[0][0].content).toBe(PointContent.Black);
      expect(board.points[0][1].content).toBe(PointContent.White);
      expect(board.points[1][1].content).toBe(PointContent.Black);
      expect(board.points[2][2].content).toBe(PointContent.White);
      
      // Проверяем, что остальные клетки пустые
      const expectedEmpty = [
        [0, 2], [1, 0], [1, 2], [2, 0], [2, 1]
      ];
      
      for (const [i, j] of expectedEmpty) {
        expect(board.points[i][j].content).toBe(PointContent.Empty);
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
          if (board.points[i][j].content === PointContent.Black) {
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
        expect(board.points[x][y].content).toBe(PointContent.Black);
      }
      
      // Проверяем, что остальные клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          const isInSquare = expectedPositions.some(([x, y]) => x === i && y === j);
          if (!isInSquare) {
            expect(board.points[i][j].content).toBe(PointContent.Empty);
          }
        }
      }
    });
  });
});
