import { Mapper } from '../src/mapper';
import { ParseResult, Instruction, StoneColor, Color, SinglePosition, IntervalPosition, Board, PointContent, MarkNone } from '../src/models';

describe('Mapper', () => {
  let mapper: Mapper;

  beforeEach(() => {
    mapper = new Mapper();
  });

  describe('map', () => {
    it('должен создавать пустую доску 3x3', () => {
      const parseResult = new ParseResult([], { width: 3, height: 3 }, true, [], null, true);
      const board = mapper.map(parseResult);

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
      const parseResult = new ParseResult([], { width: 9, height: 9 }, true, [], null, true);
      const board = mapper.map(parseResult);

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
      const parseResult = new ParseResult([], { width: 19, height: 19 }, true, [], null, true);
      const board = mapper.map(parseResult);

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
      const instruction = new Instruction(new StoneColor(Color.Black), new MarkNone(), [new SinglePosition(0, 0)]);
      const parseResult = new ParseResult([instruction], { width: 9, height: 9 }, true, [], null, true);
      const board = mapper.map(parseResult);

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
      const instruction = new Instruction(new StoneColor(Color.White), new MarkNone(), [new SinglePosition(8, 8)]);
      const parseResult = new ParseResult([instruction], { width: 9, height: 9 }, true, [], null, true);
      const board = mapper.map(parseResult);

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
        new Instruction(new StoneColor(Color.Black), new MarkNone(), [new SinglePosition(0, 0)]),
        new Instruction(new StoneColor(Color.White), new MarkNone(), [new SinglePosition(0, 1)]),
        new Instruction(new StoneColor(Color.Black), new MarkNone(), [new SinglePosition(0, 2)])
      ];
      const parseResult = new ParseResult(instructions, { width: 9, height: 9 }, true, [], null, true);
      const board = mapper.map(parseResult);

      expect(board.points[0][0].content).toBe(PointContent.Black);
      expect(board.points[1][0].content).toBe(PointContent.White);
      expect(board.points[2][0].content).toBe(PointContent.Black);
      
      // Проверяем, что остальные клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (!((i === 0 && j === 0) || (i === 1 && j === 0) || (i === 2 && j === 0))) {
            expect(board.points[i][j].content).toBe(PointContent.Empty);
          }
        }
      }
    });

    it('должен обрабатывать интервальные позиции (A1-A5)', () => {
      const instruction = new Instruction(
        new StoneColor(Color.Black), 
        new MarkNone(),
        [new IntervalPosition(new SinglePosition(0, 0), new SinglePosition(0, 4))]
      );
      const parseResult = new ParseResult([instruction], { width: 9, height: 9 }, true, [], null, true);
      const board = mapper.map(parseResult);

      // Проверяем, что все позиции от A1 до A5 заполнены черными камнями
      for (let j = 0; j <= 4; j++) {
        expect(board.points[j][0].content).toBe(PointContent.Black);
      }
      
      // Проверяем, что остальные клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (j !== 0 || i > 4) {
            expect(board.points[i][j].content).toBe(PointContent.Empty);
          }
        }
      }
    });

    it('должен обрабатывать смешанные одиночные и интервальные позиции', () => {
      const instruction = new Instruction(
        new StoneColor(Color.Black), 
        new MarkNone(),
        [
          new SinglePosition(0, 0),
          new IntervalPosition(new SinglePosition(0, 2), new SinglePosition(0, 4))
        ]
      );
      const parseResult = new ParseResult([instruction], { width: 9, height: 9 }, true, [], null, true);
      const board = mapper.map(parseResult);

      // Проверяем одиночную позицию A1
      expect(board.points[0][0].content).toBe(PointContent.Black);
      
      // Проверяем интервальную позицию A3-A5
      for (let j = 2; j <= 4; j++) {
        expect(board.points[j][0].content).toBe(PointContent.Black);
      }
      
      // Проверяем, что A2 пустая
      expect(board.points[1][0].content).toBe(PointContent.Empty);
      
      // Проверяем, что остальные клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 1; j < 9; j++) {
          expect(board.points[i][j].content).toBe(PointContent.Empty);
        }
      }
    });

    it('должен обрабатывать сложную комбинацию камней', () => {
      const instructions = [
        new Instruction(new StoneColor(Color.Black), new MarkNone(), [new SinglePosition(0, 0)]),
        new Instruction(new StoneColor(Color.White), new MarkNone(), [new SinglePosition(0, 1)]),
        new Instruction(new StoneColor(Color.Black), new MarkNone(), [new SinglePosition(1, 1)]),
        new Instruction(new StoneColor(Color.White), new MarkNone(), [new SinglePosition(2, 2)])
      ];
      const parseResult = new ParseResult(instructions, { width: 3, height: 3 }, true, [], null, true);
      const board = mapper.map(parseResult);

      expect(board.points[0][0].content).toBe(PointContent.Black);
      expect(board.points[1][0].content).toBe(PointContent.White);
      expect(board.points[1][1].content).toBe(PointContent.Black);
      expect(board.points[2][2].content).toBe(PointContent.White);
      
      // Проверяем, что остальные клетки пустые
      const expectedEmpty = [
        [2, 0], [0, 1], [2, 1], [0, 2], [1, 2]
      ];
      
      for (const [i, j] of expectedEmpty) {
        expect(board.points[i][j].content).toBe(PointContent.Empty);
      }
    });

    it('должен обрабатывать квадратный интервал B3-D5 (должно быть 9 камней)', () => {
      // B3 = (1, 2), D5 = (3, 4) - это должен быть квадрат 3x3
      const instruction = new Instruction(
        new StoneColor(Color.Black), 
        new MarkNone(),
        [new IntervalPosition(new SinglePosition(1, 2), new SinglePosition(3, 4))]
      );

      const parseResult = new ParseResult([instruction], { width: 9, height: 9 }, true, [], null, true);
      const board = mapper.map(parseResult);

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
        expect(board.points[y][x].content).toBe(PointContent.Black);
      }
      
      // Проверяем, что остальные клетки пустые
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          const isInSquare = expectedPositions.some(([x, y]) => y === i && x === j);
          if (!isInSquare) {
            expect(board.points[i][j].content).toBe(PointContent.Empty);
          }
        }
      }
    });

    it('должен корректно размещать хоси на доске 9x9', () => {
      const parseResult = new ParseResult([], { width: 9, height: 9 }, true, [], null, true);
      const board = mapper.map(parseResult);

      // Проверяем конкретные позиции хоси для доски 9x9:
      // C3 (колонка C=2, строка 3 -> y=2), G3, E5, C7, G7
      const expectedHoshiPositions = [
        { x: 2, y: 2 }, // C3
        { x: 6, y: 2 }, // G3
        { x: 4, y: 4 }, // E5 (центр)
        { x: 2, y: 6 }, // C7
        { x: 6, y: 6 }  // G7
      ];

      // Проверяем, что все ожидаемые позиции являются хоси
      for (const pos of expectedHoshiPositions) {
        expect(board.points[pos.y][pos.x].hasHoshi).toBe(true);
      }

      // Проверяем общее количество хоси (должно быть 5)
      let hoshiCount = 0;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (board.points[i][j].hasHoshi) {
            hoshiCount++;
          }
        }
      }
      expect(hoshiCount).toBe(5);
    });

    it('должен корректно размещать хоси на доске 13x13', () => {
      const parseResult = new ParseResult([], { width: 13, height: 13 }, true, [], null, true);
      const board = mapper.map(parseResult);

      // Для 13x13 хоси находятся на позициях 3, 6, 9 (в обеих осях)
      // Проверяем несколько позиций
      expect(board.points[3][3].hasHoshi).toBe(true);  // D4
      expect(board.points[3][6].hasHoshi).toBe(true);  // G4
      expect(board.points[3][9].hasHoshi).toBe(true); // J4
      expect(board.points[6][6].hasHoshi).toBe(true);  // G7 (центр)
      expect(board.points[9][9].hasHoshi).toBe(true);  // J10
    });

    it('должен корректно размещать хоси на доске 19x19', () => {
      const parseResult = new ParseResult([], { width: 19, height: 19 }, true, [], null, true);
      const board = mapper.map(parseResult);

      // Для 19x19 хоси находятся на позициях 3, 9, 15 (в обеих осях)
      // Проверяем несколько позиций
      expect(board.points[3][3].hasHoshi).toBe(true);   // D4
      expect(board.points[3][9].hasHoshi).toBe(true);  // J4
      expect(board.points[3][15].hasHoshi).toBe(true); // P4
      expect(board.points[9][9].hasHoshi).toBe(true);  // J10 (центр)
      expect(board.points[15][15].hasHoshi).toBe(true); // P16
    });

    it('должен не размещать хоси когда showHoshi=false', () => {
      const parseResult = new ParseResult([], { width: 9, height: 9 }, true, [], null, false);
      const board = mapper.map(parseResult);

      // Проверяем, что нет хоси
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          expect(board.points[i][j].hasHoshi).toBe(false);
        }
      }
    });
  });
});
