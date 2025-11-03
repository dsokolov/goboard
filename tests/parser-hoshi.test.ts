import { Parser } from '../src/parser';
import { ParseResult } from '../src/models';

describe('HoshiParser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  describe('parse - hoshi visibility handling', () => {
    it('should parse hoshi on', () => {
      const result = parser.parse('hoshi on');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.showHoshi).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should parse hoshi off', () => {
      const result = parser.parse('hoshi off');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.showHoshi).toBe(false);
      expect(result.errors.length).toBe(0);
    });

    it('should handle case insensitive "hoshi" keyword', () => {
      const result = parser.parse('HOSHI ON');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.showHoshi).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should handle case insensitive "on" and "off"', () => {
      const resultOn = parser.parse('hoshi ON');
      const resultOff = parser.parse('hoshi OFF');

      expect(resultOn.showHoshi).toBe(true);
      expect(resultOff.showHoshi).toBe(false);
      expect(resultOn.errors.length).toBe(0);
      expect(resultOff.errors.length).toBe(0);
    });

    it('should handle whitespace variations', () => {
      const result = parser.parse('hoshi    on');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.showHoshi).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should work with board size', () => {
      const result = parser.parse('size 9x9\nhoshi off');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.showHoshi).toBe(false);
      expect(result.errors.length).toBe(0);
    });

    it('should work with coordinates and moves', () => {
      const result = parser.parse('size 9x9\ncoordinates off\nhoshi on\nB A1');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.showCoordinates).toBe(false);
      expect(result.showHoshi).toBe(true);
      expect(result.instructions.length).toBe(1);
      expect(result.errors.length).toBe(0);
    });

    it('should return ParseResult with default showHoshi=true for empty string', () => {
      const result = parser.parse('');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.showHoshi).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });
});

