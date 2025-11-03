import { Parser } from '../src/parser';
import { Instruction, Color, SinglePosition, IntervalPosition, ParseResult } from '../src/models';
import { testDataLoader } from './test-data-loader';

describe('MoveParser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  describe('parse - move handling', () => {
    it('should parse single black move BA1', () => {
      const source = testDataLoader.loadTestData('moves-2.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.instructions).toEqual([
        new Instruction(Color.Black, [new SinglePosition(0, 0)]),
      ]);
      expect(result.errors.length).toBe(0);
    });

    it('should parse single white move WI9', () => {
      const source = testDataLoader.loadTestData('moves-1.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.instructions).toEqual([
        new Instruction(Color.White, [new SinglePosition(8, 8)]),
      ]);
      expect(result.errors.length).toBe(0);
    });

    it('should parse multiple moves BA1 WA2 BA3', () => {
      const source = testDataLoader.loadTestData('moves-3.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.instructions).toEqual([
        new Instruction(Color.Black, [new SinglePosition(0, 0)]),
        new Instruction(Color.White, [new SinglePosition(0, 1)]),
        new Instruction(Color.Black, [new SinglePosition(0, 2)]),
      ]);
      expect(result.errors.length).toBe(0);
    });

    it('should parse comma-separated moves B A1,A5', () => {
      const source = testDataLoader.loadTestData('moves-4.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.instructions).toEqual([
        new Instruction(Color.Black, [new SinglePosition(0, 0), new SinglePosition(0, 4)]),
      ]);
      expect(result.errors.length).toBe(0);
    });

    it('should parse dash-separated interval moves B A1-A5', () => {
      const source = testDataLoader.loadTestData('moves-5.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.instructions).toEqual([
        new Instruction(Color.Black, [new IntervalPosition(new SinglePosition(0, 0), new SinglePosition(0, 4))]),
      ]);
      expect(result.errors.length).toBe(0);
    });

    it('should parse mixed single and interval moves B A1, A3-A5', () => {
      const source = testDataLoader.loadTestData('moves-6.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.instructions).toEqual([
        new Instruction(Color.Black, [new SinglePosition(0, 0), new IntervalPosition(new SinglePosition(0, 2), new SinglePosition(0, 4))]),
      ]);
      expect(result.errors.length).toBe(0);
    });

    it('should parse complex mixed moves', () => {
      const source = testDataLoader.loadTestData('moves-7.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.instructions).toEqual([
        new Instruction(Color.Black, [new SinglePosition(0, 0), new IntervalPosition(new SinglePosition(0, 2), new SinglePosition(0, 4))]),
        new Instruction(Color.White, [new SinglePosition(0, 1)]),
        new Instruction(Color.Black, [new IntervalPosition(new SinglePosition(2, 0), new SinglePosition(4, 2)), new IntervalPosition(new SinglePosition(5, 0), new SinglePosition(5, 8))]),
        new Instruction(Color.White, [new SinglePosition(3, 0), new SinglePosition(3, 1), new SinglePosition(3, 2)]),
      ]);
      expect(result.errors.length).toBe(0);
    });

    it('should handle case insensitive color', () => {
      const result1 = parser.parse('size 9x9\nb A1');
      const result2 = parser.parse('size 9x9\nw A1');

      expect(result1.instructions[0].color).toBe(Color.Black);
      expect(result2.instructions[0].color).toBe(Color.White);
      expect(result1.errors.length).toBe(0);
      expect(result2.errors.length).toBe(0);
    });

    it('should handle whitespace variations', () => {
      const result = parser.parse('size 9x9\nB    A1');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.instructions).toEqual([
        new Instruction(Color.Black, [new SinglePosition(0, 0)]),
      ]);
      expect(result.errors.length).toBe(0);
    });

    it('should return errors for invalid coordinates', () => {
      const result = parser.parse('size 9x9\nB XX99');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('Invalid coordinate'))).toBe(true);
    });

    it('should return errors for invalid interval format', () => {
      const result = parser.parse('size 9x9\nB A1-A2-A3');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('Invalid interval format'))).toBe(true);
    });

    it('should return ParseResult with empty instructions for empty string', () => {
      const result = parser.parse('');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.instructions).toEqual([]);
      expect(result.errors.length).toBe(0);
    });
  });
});

