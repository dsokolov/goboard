import { Parser } from '../src/parser';
import { Instruction, Color, ParseError, ParseSuccess, SinglePosition, IntervalPosition } from '../src/models';
import { testDataLoader } from './test-data-loader';

describe('Parser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  describe('parse', () => {
    it('Empty string should return ParseError', () => {
      const source = testDataLoader.loadTestData('empty-string.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseError);
    });

    it('Only board size 19x19 should return ParseSuccess', () => {
      const source = testDataLoader.loadTestData('empty-board-19x19.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseSuccess);
      expect((result as ParseSuccess).instructions).toEqual([]);
      expect((result as ParseSuccess).boardSize).toEqual({ width: 19, height: 19 });
    });

    it('Only board size 13x13 should return ParseSuccess', () => {
        const source = testDataLoader.loadTestData('empty-board-13x13.txt');
        const result = parser.parse(source);
  
        expect(result).toBeInstanceOf(ParseSuccess);
        expect((result as ParseSuccess).instructions).toEqual([]);
        expect((result as ParseSuccess).boardSize).toEqual({ width: 13, height: 13 });
      });

      it('Only board size 9x9 should return ParseSuccess', () => {
        const source = testDataLoader.loadTestData('empty-board-9x9.txt');
        const result = parser.parse(source);
  
        expect(result).toBeInstanceOf(ParseSuccess);
        expect((result as ParseSuccess).instructions).toEqual([]);
        expect((result as ParseSuccess).boardSize).toEqual({ width: 9, height: 9 });
      });

      it('Only board size 5x5 should return ParseSuccess', () => {
        const source = testDataLoader.loadTestData('empty-board-5x5.txt');
        const result = parser.parse(source);
  
        expect(result).toBeInstanceOf(ParseSuccess);
        expect((result as ParseSuccess).instructions).toEqual([]);
        expect((result as ParseSuccess).boardSize).toEqual({ width: 5, height: 5 });
      });

      it('Invalid format should return ParseError', () => {
        const source = testDataLoader.loadTestData('invalid-format.txt');
        const result = parser.parse(source);
  
        expect(result).toBeInstanceOf(ParseError);
      });

      it('Coordinates ON should set showCoordinates=true', () => {
        const source = testDataLoader.loadTestData('coordinates-on.txt');
        const result = parser.parse(source);

        expect(result).toBeInstanceOf(ParseSuccess);
        expect((result as ParseSuccess).boardSize).toEqual({ width: 19, height: 19 });
        expect((result as ParseSuccess).showCoordinates).toBe(true);
      });

      it('Coordinates OFF should set showCoordinates=false', () => {
        const source = testDataLoader.loadTestData('coordinates-off.txt');
        const result = parser.parse(source);

        expect(result).toBeInstanceOf(ParseSuccess);
        expect((result as ParseSuccess).boardSize).toEqual({ width: 19, height: 19 });
        expect((result as ParseSuccess).showCoordinates).toBe(false);
      });

  });

  describe('parse moves', () => {
    it('9x9 BA1', () => {
      const source = testDataLoader.loadTestData('moves-2.txt');
      const result = parser.parse(source);
  
      expect(result).toBeInstanceOf(ParseSuccess);
      expect((result as ParseSuccess).boardSize).toEqual(
        { width: 9, height: 9 }
      );
      expect((result as ParseSuccess).instructions).toEqual(
        [
          new Instruction(Color.Black, [new SinglePosition(0, 0)]),
        ]
      );
    });
    it('9x9 WI9', () => {
      const source = testDataLoader.loadTestData('moves-1.txt');
      const result = parser.parse(source);
  
      expect(result).toBeInstanceOf(ParseSuccess);
      expect((result as ParseSuccess).boardSize).toEqual(
        { width: 9, height: 9 }
      );
      expect((result as ParseSuccess).instructions).toEqual(
        [
          new Instruction(Color.White, [new SinglePosition(8, 8)]),
        ]
      );
    });
    it('9x9 BA1 WA2 BA3', () => {
      const source = testDataLoader.loadTestData('moves-3.txt');
      const result = parser.parse(source);
  
      expect(result).toBeInstanceOf(ParseSuccess);
      expect((result as ParseSuccess).boardSize).toEqual({ width: 9, height: 9 });
      expect((result as ParseSuccess).instructions).toEqual(
        [
          new Instruction(Color.Black, [new SinglePosition(0, 0)]),
          new Instruction(Color.White, [new SinglePosition(0, 1)]),
          new Instruction(Color.Black, [new SinglePosition(0, 2)]),
        ]
      );
    });

    it('9x9 B A1,A5 (comma-separated moves)', () => {
      const source = testDataLoader.loadTestData('moves-4.txt');
      const result = parser.parse(source);
  
      expect(result).toBeInstanceOf(ParseSuccess);
      expect((result as ParseSuccess).boardSize).toEqual({ width: 9, height: 9 });
      expect((result as ParseSuccess).instructions).toEqual(
        [
          new Instruction(Color.Black, [new SinglePosition(0, 0), new SinglePosition(0, 4)]),
        ]
      );
    });

    it('9x9 B A1-A5 (dash-separated moves)', () => {
      const source = testDataLoader.loadTestData('moves-5.txt');
      const result = parser.parse(source);
  
      expect(result).toBeInstanceOf(ParseSuccess);
      expect((result as ParseSuccess).boardSize).toEqual({ width: 9, height: 9 });
      expect((result as ParseSuccess).instructions).toEqual(
        [
          new Instruction(Color.Black, [new IntervalPosition(new SinglePosition(0, 0), new SinglePosition(0, 4))]),
        ]
      );
    });

    it('9x9 B A1, A3-A5 (mixed single and interval moves)', () => {
      const source = testDataLoader.loadTestData('moves-6.txt');
      const result = parser.parse(source);
  
      expect(result).toBeInstanceOf(ParseSuccess);
      expect((result as ParseSuccess).boardSize).toEqual({ width: 9, height: 9 });
      expect((result as ParseSuccess).instructions).toEqual(
        [
          new Instruction(Color.Black, [new SinglePosition(0, 0), new IntervalPosition(new SinglePosition(0, 2), new SinglePosition(0, 4))]),
        ]
      );
    });

    it('9x9 B A1, A3-A5; W A2; B C1-E3, F1-F9; W D1, D2, D3 (complex mixed moves)', () => {
      const source = testDataLoader.loadTestData('moves-7.txt');
      const result = parser.parse(source);
  
      expect(result).toBeInstanceOf(ParseSuccess);
      expect((result as ParseSuccess).boardSize).toEqual({ width: 9, height: 9 });
      expect((result as ParseSuccess).instructions).toEqual(
        [
          new Instruction(Color.Black, [new SinglePosition(0, 0), new IntervalPosition(new SinglePosition(0, 2), new SinglePosition(0, 4))]),
          new Instruction(Color.White, [new SinglePosition(0, 1)]),
          new Instruction(Color.Black, [new IntervalPosition(new SinglePosition(2, 0), new SinglePosition(4, 2)), new IntervalPosition(new SinglePosition(5, 0), new SinglePosition(5, 8))]),
          new Instruction(Color.White, [new SinglePosition(3, 0), new SinglePosition(3, 1), new SinglePosition(3, 2)]),
        ]
      );
    });
  });
});
