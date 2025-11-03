import { Parser } from '../src/parser';
import { ParseResult } from '../src/models';

describe('CoordinatesParser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  describe('parse - coordinates visibility handling', () => {
    it('should parse coordinates on', () => {
      const result = parser.parse('coordinates on');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.showCoordinates).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should parse coordinates off', () => {
      const result = parser.parse('coordinates off');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.showCoordinates).toBe(false);
      expect(result.errors.length).toBe(0);
    });

    it('should handle case insensitive "coordinates" keyword', () => {
      const result = parser.parse('COORDINATES ON');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.showCoordinates).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should handle case insensitive "on" and "off"', () => {
      const resultOn = parser.parse('coordinates ON');
      const resultOff = parser.parse('coordinates OFF');

      expect(resultOn.showCoordinates).toBe(true);
      expect(resultOff.showCoordinates).toBe(false);
      expect(resultOn.errors.length).toBe(0);
      expect(resultOff.errors.length).toBe(0);
    });

    it('should handle whitespace variations', () => {
      const result = parser.parse('coordinates    on');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.showCoordinates).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should work with board size', () => {
      const result = parser.parse('size 9x9\ncoordinates off');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.showCoordinates).toBe(false);
      expect(result.errors.length).toBe(0);
    });

    it('should return ParseResult with default showCoordinates=true for empty string', () => {
      const result = parser.parse('');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.showCoordinates).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });
});

