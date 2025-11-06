import { BoardSizeParser } from '../src/parser';
import { ParseResult, BoardSize } from '../src/models';

describe('BoardSizeParser', () => {
  let parser: BoardSizeParser;

  beforeEach(() => {
    parser = new BoardSizeParser();
  });

  describe('isApplicable', () => {
    it('should return true for size line', () => {
      expect(parser.isApplicable('size 19x19')).toBe(true);
      expect(parser.isApplicable('SIZE 19x19')).toBe(true);
      expect(parser.isApplicable('size   19x19')).toBe(true);
    });

    it('should return false for non-size line', () => {
      expect(parser.isApplicable('viewport A1-H9')).toBe(false);
      expect(parser.isApplicable('coordinates on')).toBe(false);
      expect(parser.isApplicable('B A1')).toBe(false);
      expect(parser.isApplicable('hoshi on')).toBe(false);
    });
  });

  describe('parse - board size handling', () => {
    it('should parse valid board size 19x19', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('size 19x19', 1, initialResult);

      expect(result.boardSize).toEqual({ width: 19, height: 19 });
      expect(result.errors.length).toBe(0);
    });

    it('should parse valid board size 13x13', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('size 13x13', 1, initialResult);

      expect(result.boardSize).toEqual({ width: 13, height: 13 });
      expect(result.errors.length).toBe(0);
    });

    it('should parse valid board size 9x9', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('size 9x9', 1, initialResult);

      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.errors.length).toBe(0);
    });

    it('should parse valid board size 5x5', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('size 5x5', 1, initialResult);

      expect(result.boardSize).toEqual({ width: 5, height: 5 });
      expect(result.errors.length).toBe(0);
    });

    it('should parse valid board size 3x3', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('size 3x3', 1, initialResult);

      expect(result.boardSize).toEqual({ width: 3, height: 3 });
      expect(result.errors.length).toBe(0);
    });

    it('should handle case insensitive "size" keyword', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('SIZE 19x19', 1, initialResult);

      expect(result.boardSize).toEqual({ width: 19, height: 19 });
      expect(result.errors.length).toBe(0);
    });

    it('should handle whitespace variations', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('size   19x19', 1, initialResult);

      expect(result.boardSize).toEqual({ width: 19, height: 19 });
      expect(result.errors.length).toBe(0);
    });

    it('should return ParseResult with errors for invalid format (missing dimensions)', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('size', 1, initialResult);

      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return ParseResult with errors for invalid format (missing x separator)', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('size 1919', 1, initialResult);

      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return ParseResult with errors for invalid format (non-numeric dimensions)', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('size axb', 1, initialResult);

      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return ParseResult with errors for invalid format (only one dimension)', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('size 19', 1, initialResult);

      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return ParseResult with errors for invalid board size (zero dimensions)', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('size 0x0', 1, initialResult);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('Invalid board size'))).toBe(true);
    });

    it('should return ParseResult with errors for invalid board size (negative dimensions)', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('size -5x5', 1, initialResult);

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

