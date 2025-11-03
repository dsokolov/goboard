import { Parser } from '../src/parser';
import { Instruction, Color, ParseResult, SinglePosition, IntervalPosition, ParseError } from '../src/models';
import { testDataLoader } from './test-data-loader';

describe('Parser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  describe('parse', () => {
    it('Empty string should return ParseResult with default values', () => {
      const source = testDataLoader.loadTestData('empty-string.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.instructions).toEqual([]);
      expect(result.boardSize).toEqual({ width: 19, height: 19 });
      expect(result.errors.length).toBe(0);
    });

    it('Only board size 19x19 should return ParseResult', () => {
      const source = testDataLoader.loadTestData('empty-board-19x19.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.instructions).toEqual([]);
      expect(result.boardSize).toEqual({ width: 19, height: 19 });
      expect(result.errors.length).toBe(0);
    });

    it('Only board size 13x13 should return ParseResult', () => {
        const source = testDataLoader.loadTestData('empty-board-13x13.txt');
        const result = parser.parse(source);
  
        expect(result).toBeInstanceOf(ParseResult);
        expect(result.instructions).toEqual([]);
        expect(result.boardSize).toEqual({ width: 13, height: 13 });
        expect(result.errors.length).toBe(0);
      });

      it('Only board size 9x9 should return ParseResult', () => {
        const source = testDataLoader.loadTestData('empty-board-9x9.txt');
        const result = parser.parse(source);
  
        expect(result).toBeInstanceOf(ParseResult);
        expect(result.instructions).toEqual([]);
        expect(result.boardSize).toEqual({ width: 9, height: 9 });
        expect(result.errors.length).toBe(0);
      });

      it('Only board size 5x5 should return ParseResult', () => {
        const source = testDataLoader.loadTestData('empty-board-5x5.txt');
        const result = parser.parse(source);
  
        expect(result).toBeInstanceOf(ParseResult);
        expect(result.instructions).toEqual([]);
        expect(result.boardSize).toEqual({ width: 5, height: 5 });
        expect(result.errors.length).toBe(0);
      });

      it('Invalid format should return ParseResult with errors', () => {
        const source = testDataLoader.loadTestData('invalid-format.txt');
        const result = parser.parse(source);
  
        expect(result).toBeInstanceOf(ParseResult);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('Coordinates ON should set showCoordinates=true', () => {
        const source = testDataLoader.loadTestData('coordinates-on.txt');
        const result = parser.parse(source);

        expect(result).toBeInstanceOf(ParseResult);
        expect(result.boardSize).toEqual({ width: 19, height: 19 });
        expect(result.showCoordinates).toBe(true);
        expect(result.errors.length).toBe(0);
      });

      it('Coordinates OFF should set showCoordinates=false', () => {
        const source = testDataLoader.loadTestData('coordinates-off.txt');
        const result = parser.parse(source);

        expect(result).toBeInstanceOf(ParseResult);
        expect(result.boardSize).toEqual({ width: 19, height: 19 });
        expect(result.showCoordinates).toBe(false);
        expect(result.errors.length).toBe(0);
      });

  });

  describe('parse moves', () => {
    it('9x9 BA1', () => {
      const source = testDataLoader.loadTestData('moves-2.txt');
      const result = parser.parse(source);
  
      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual(
        { width: 9, height: 9 }
      );
      expect(result.instructions).toEqual(
        [
          new Instruction(Color.Black, [new SinglePosition(0, 0)]),
        ]
      );
      expect(result.errors.length).toBe(0);
    });
    it('9x9 WI9', () => {
      const source = testDataLoader.loadTestData('moves-1.txt');
      const result = parser.parse(source);
  
      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual(
        { width: 9, height: 9 }
      );
      expect(result.instructions).toEqual(
        [
          new Instruction(Color.White, [new SinglePosition(8, 8)]),
        ]
      );
      expect(result.errors.length).toBe(0);
    });
    it('9x9 BA1 WA2 BA3', () => {
      const source = testDataLoader.loadTestData('moves-3.txt');
      const result = parser.parse(source);
  
      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.instructions).toEqual(
        [
          new Instruction(Color.Black, [new SinglePosition(0, 0)]),
          new Instruction(Color.White, [new SinglePosition(0, 1)]),
          new Instruction(Color.Black, [new SinglePosition(0, 2)]),
        ]
      );
      expect(result.errors.length).toBe(0);
    });

    it('9x9 B A1,A5 (comma-separated moves)', () => {
      const source = testDataLoader.loadTestData('moves-4.txt');
      const result = parser.parse(source);
  
      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.instructions).toEqual(
        [
          new Instruction(Color.Black, [new SinglePosition(0, 0), new SinglePosition(0, 4)]),
        ]
      );
      expect(result.errors.length).toBe(0);
    });

    it('9x9 B A1-A5 (dash-separated moves)', () => {
      const source = testDataLoader.loadTestData('moves-5.txt');
      const result = parser.parse(source);
  
      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.instructions).toEqual(
        [
          new Instruction(Color.Black, [new IntervalPosition(new SinglePosition(0, 0), new SinglePosition(0, 4))]),
        ]
      );
      expect(result.errors.length).toBe(0);
    });

    it('9x9 B A1, A3-A5 (mixed single and interval moves)', () => {
      const source = testDataLoader.loadTestData('moves-6.txt');
      const result = parser.parse(source);
  
      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.instructions).toEqual(
        [
          new Instruction(Color.Black, [new SinglePosition(0, 0), new IntervalPosition(new SinglePosition(0, 2), new SinglePosition(0, 4))]),
        ]
      );
      expect(result.errors.length).toBe(0);
    });

    it('9x9 B A1, A3-A5; W A2; B C1-E3, F1-F9; W D1, D2, D3 (complex mixed moves)', () => {
      const source = testDataLoader.loadTestData('moves-7.txt');
      const result = parser.parse(source);
  
      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.instructions).toEqual(
        [
          new Instruction(Color.Black, [new SinglePosition(0, 0), new IntervalPosition(new SinglePosition(0, 2), new SinglePosition(0, 4))]),
          new Instruction(Color.White, [new SinglePosition(0, 1)]),
          new Instruction(Color.Black, [new IntervalPosition(new SinglePosition(2, 0), new SinglePosition(4, 2)), new IntervalPosition(new SinglePosition(5, 0), new SinglePosition(5, 8))]),
          new Instruction(Color.White, [new SinglePosition(3, 0), new SinglePosition(3, 1), new SinglePosition(3, 2)]),
        ]
      );
      expect(result.errors.length).toBe(0);
    });
  });

  describe('parse viewport', () => {
    it('Invalid viewport should return ParseResult with errors', () => {
      const source = testDataLoader.loadTestData('viewport-invalid.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('viewport'))).toBe(true);
    });

    it('Small viewport should return ParseResult with viewport', () => {
      const source = testDataLoader.loadTestData('viewport-small.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual({ start: new SinglePosition(1, 1), end: new SinglePosition(1, 1) });
    });

    it('Full viewport should return ParseResult with viewport', () => {
      const source = testDataLoader.loadTestData('viewport-full.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual({ start: new SinglePosition(0, 0), end: new SinglePosition(7, 8) });
    });

    it('Normal viewport should return ParseResult with viewport', () => {
      const source = testDataLoader.loadTestData('viewport-normal.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual({ start: new SinglePosition(1, 1), end: new SinglePosition(4, 4) });
    });

  });

});
