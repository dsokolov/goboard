import { Parser } from '../src/parser';
import { ParseResult, BoardSize } from '../src/models';

describe('BoardSizeParser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  describe('parse - board size handling', () => {
    it('should parse valid board size 19x19', () => {
      const result = parser.parse('size 19x19');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 19, height: 19 });
      expect(result.errors.length).toBe(0);
    });

    it('should parse valid board size 13x13', () => {
      const result = parser.parse('size 13x13');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 13, height: 13 });
      expect(result.errors.length).toBe(0);
    });

    it('should parse valid board size 9x9', () => {
      const result = parser.parse('size 9x9');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.errors.length).toBe(0);
    });

    it('should parse valid board size 5x5', () => {
      const result = parser.parse('size 5x5');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 5, height: 5 });
      expect(result.errors.length).toBe(0);
    });

    it('should parse valid board size 3x3', () => {
      const result = parser.parse('size 3x3');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 3, height: 3 });
      expect(result.errors.length).toBe(0);
    });

    it('should handle case insensitive "size" keyword', () => {
      const result = parser.parse('SIZE 19x19');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 19, height: 19 });
      expect(result.errors.length).toBe(0);
    });

    it('should handle whitespace variations', () => {
      const result = parser.parse('size   19x19');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 19, height: 19 });
      expect(result.errors.length).toBe(0);
    });

    it('should return ParseResult with errors for invalid format (missing dimensions)', () => {
      const result = parser.parse('size');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return ParseResult with errors for invalid format (missing x separator)', () => {
      const result = parser.parse('size 1919');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return ParseResult with errors for invalid format (non-numeric dimensions)', () => {
      const result = parser.parse('size axb');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return ParseResult with errors for invalid format (only one dimension)', () => {
      const result = parser.parse('size 19');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return ParseResult with default values for empty string', () => {
      const result = parser.parse('');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 19, height: 19 });
      expect(result.errors.length).toBe(0);
    });
  });
});

