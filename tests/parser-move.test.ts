import { MoveParser } from '../src/parser';
import { Instruction, Color, SinglePosition, IntervalPosition, ParseResult } from '../src/models';

describe('MoveParser', () => {
  let parser: MoveParser;

  beforeEach(() => {
    parser = new MoveParser();
  });

  describe('isApplicable', () => {
    it('should return true for move line', () => {
      expect(parser.isApplicable('B A1')).toBe(true);
      expect(parser.isApplicable('W A1')).toBe(true);
      expect(parser.isApplicable('b A1')).toBe(true);
      expect(parser.isApplicable('w A1')).toBe(true);
      expect(parser.isApplicable('B    A1')).toBe(true);
    });

    it('should return false for non-move line', () => {
      expect(parser.isApplicable('size 9x9')).toBe(false);
      expect(parser.isApplicable('viewport A1-H9')).toBe(false);
      expect(parser.isApplicable('coordinates on')).toBe(false);
    });
  });

  describe('parse - move handling', () => {
    it('should parse single black move B A1', () => {
      const initialResult = new ParseResult();
      const result = parser.parse('B A1', 1, initialResult);

      expect(result.instructions).toEqual([
        new Instruction(Color.Black, [new SinglePosition(0, 0)]),
      ]);
      expect(result.errors.length).toBe(0);
    });

    it('should parse single white move W I9', () => {
      const initialResult = new ParseResult();
      const result = parser.parse('W I9', 1, initialResult);

      expect(result.instructions).toEqual([
        new Instruction(Color.White, [new SinglePosition(8, 8)]),
      ]);
      expect(result.errors.length).toBe(0);
    });

    it('should parse comma-separated moves B A1,A5', () => {
      const initialResult = new ParseResult();
      const result = parser.parse('B A1,A5', 1, initialResult);

      expect(result.instructions).toEqual([
        new Instruction(Color.Black, [new SinglePosition(0, 0), new SinglePosition(0, 4)]),
      ]);
      expect(result.errors.length).toBe(0);
    });

    it('should parse dash-separated interval moves B A1-A5', () => {
      const initialResult = new ParseResult();
      const result = parser.parse('B A1-A5', 1, initialResult);

      expect(result.instructions).toEqual([
        new Instruction(Color.Black, [new IntervalPosition(new SinglePosition(0, 0), new SinglePosition(0, 4))]),
      ]);
      expect(result.errors.length).toBe(0);
    });

    it('should parse mixed single and interval moves B A1, A3-A5', () => {
      const initialResult = new ParseResult();
      const result = parser.parse('B A1, A3-A5', 1, initialResult);

      expect(result.instructions).toEqual([
        new Instruction(Color.Black, [new SinglePosition(0, 0), new IntervalPosition(new SinglePosition(0, 2), new SinglePosition(0, 4))]),
      ]);
      expect(result.errors.length).toBe(0);
    });

    it('should parse complex mixed moves B A1, A3-A5', () => {
      const initialResult = new ParseResult();
      const result = parser.parse('B A1, A3-A5', 1, initialResult);

      expect(result.instructions).toEqual([
        new Instruction(Color.Black, [new SinglePosition(0, 0), new IntervalPosition(new SinglePosition(0, 2), new SinglePosition(0, 4))]),
      ]);
      expect(result.errors.length).toBe(0);
    });

    it('should parse multiple separate moves', () => {
      const initialResult1 = new ParseResult();
      const result1 = parser.parse('B A1, A3-A5', 1, initialResult1);

      const initialResult2 = new ParseResult(result1.instructions);
      const result2 = parser.parse('W A2', 2, initialResult2);

      const initialResult3 = new ParseResult(result2.instructions);
      const result3 = parser.parse('B C1-E3, F1-F9', 3, initialResult3);

      const initialResult4 = new ParseResult(result3.instructions);
      const result4 = parser.parse('W D1, D2, D3', 4, initialResult4);

      expect(result4.instructions).toEqual([
        new Instruction(Color.Black, [new SinglePosition(0, 0), new IntervalPosition(new SinglePosition(0, 2), new SinglePosition(0, 4))]),
        new Instruction(Color.White, [new SinglePosition(0, 1)]),
        new Instruction(Color.Black, [new IntervalPosition(new SinglePosition(2, 0), new SinglePosition(4, 2)), new IntervalPosition(new SinglePosition(5, 0), new SinglePosition(5, 8))]),
        new Instruction(Color.White, [new SinglePosition(3, 0), new SinglePosition(3, 1), new SinglePosition(3, 2)]),
      ]);
      expect(result4.errors.length).toBe(0);
    });

    it('should handle case insensitive color', () => {
      const initialResult1 = new ParseResult();
      const result1 = parser.parse('b A1', 1, initialResult1);

      const initialResult2 = new ParseResult();
      const result2 = parser.parse('w A1', 1, initialResult2);

      expect(result1.instructions[0].color).toBe(Color.Black);
      expect(result2.instructions[0].color).toBe(Color.White);
      expect(result1.errors.length).toBe(0);
      expect(result2.errors.length).toBe(0);
    });

    it('should handle whitespace variations', () => {
      const initialResult = new ParseResult();
      const result = parser.parse('B    A1', 1, initialResult);

      expect(result.instructions).toEqual([
        new Instruction(Color.Black, [new SinglePosition(0, 0)]),
      ]);
      expect(result.errors.length).toBe(0);
    });

    it('should return errors for invalid coordinates', () => {
      const initialResult = new ParseResult();
      const result = parser.parse('B XX99', 1, initialResult);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('Invalid coordinate'))).toBe(true);
    });

    it('should return errors for invalid interval format', () => {
      const initialResult = new ParseResult();
      const result = parser.parse('B A1-A2-A3', 1, initialResult);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('Invalid interval format'))).toBe(true);
    });
  });
});

