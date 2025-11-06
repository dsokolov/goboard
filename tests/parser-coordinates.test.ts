import { CoordinatesParser } from '../src/parser';
import { ParseResult } from '../src/models';

describe('CoordinatesParser', () => {
  let parser: CoordinatesParser;

  beforeEach(() => {
    parser = new CoordinatesParser();
  });

  describe('isApplicable', () => {
    it('should return true for coordinates line', () => {
      expect(parser.isApplicable('coordinates on')).toBe(true);
      expect(parser.isApplicable('coordinates off')).toBe(true);
      expect(parser.isApplicable('COORDINATES ON')).toBe(true);
      expect(parser.isApplicable('coordinates    on')).toBe(true);
    });

    it('should return false for non-coordinates line', () => {
      expect(parser.isApplicable('size 9x9')).toBe(false);
      expect(parser.isApplicable('viewport A1-H9')).toBe(false);
      expect(parser.isApplicable('hoshi on')).toBe(false);
      expect(parser.isApplicable('B A1')).toBe(false);
    });
  });

  describe('parse - coordinates visibility handling', () => {
    it('should parse coordinates on', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('coordinates on', 1, initialResult);

      expect(result.showCoordinates).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should parse coordinates off', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('coordinates off', 1, initialResult);

      expect(result.showCoordinates).toBe(false);
      expect(result.errors.length).toBe(0);
    });

    it('should handle case insensitive "coordinates" keyword', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('COORDINATES ON', 1, initialResult);

      expect(result.showCoordinates).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should handle case insensitive "on" and "off"', () => {
      const initialResult1 = ParseResult.create();
      const resultOn = parser.parse('coordinates ON', 1, initialResult1);

      const initialResult2 = ParseResult.create();
      const resultOff = parser.parse('coordinates OFF', 1, initialResult2);

      expect(resultOn.showCoordinates).toBe(true);
      expect(resultOff.showCoordinates).toBe(false);
      expect(resultOn.errors.length).toBe(0);
      expect(resultOff.errors.length).toBe(0);
    });

    it('should handle whitespace variations', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('coordinates    on', 1, initialResult);

      expect(result.showCoordinates).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should preserve other ParseResult properties', () => {
      const initialResult = new ParseResult(
        [],
        { width: 9, height: 9 },
        true,
        [],
        null,
        false
      );
      const result = parser.parse('coordinates off', 1, initialResult);

      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.showCoordinates).toBe(false);
      expect(result.showHoshi).toBe(false);
      expect(result.errors.length).toBe(0);
    });
  });
});

