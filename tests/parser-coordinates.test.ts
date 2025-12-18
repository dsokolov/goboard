import { CoordinatesParser } from '../src/parser';
import { ParseResult, COORDINATE_SIDES } from '../src/models';

describe('CoordinatesParser', () => {
  let parser: CoordinatesParser;

  beforeEach(() => {
    parser = new CoordinatesParser();
  });

  describe('isApplicable', () => {
    it('should return true for coordinates line', () => {
      expect(parser.isApplicable('coordinates on')).toBe(true);
      expect(parser.isApplicable('coordinates off')).toBe(true);
      expect(parser.isApplicable('coordinates top')).toBe(true);
      expect(parser.isApplicable('coordinates top, left')).toBe(true);
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
    it('should parse coordinates on (all sides)', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('coordinates on', 1, initialResult);

      expect(result.coordinateSides.has(COORDINATE_SIDES.TOP)).toBe(true);
      expect(result.coordinateSides.has(COORDINATE_SIDES.BOTTOM)).toBe(true);
      expect(result.coordinateSides.has(COORDINATE_SIDES.LEFT)).toBe(true);
      expect(result.coordinateSides.has(COORDINATE_SIDES.RIGHT)).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should parse coordinates off (no sides)', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('coordinates off', 1, initialResult);

      expect(result.coordinateSides.size).toBe(0);
      expect(result.errors.length).toBe(0);
    });

    it('should parse individual sides', () => {
      const initialResult = ParseResult.create();
      
      const resultTop = parser.parse('coordinates top', 1, initialResult);
      expect(resultTop.coordinateSides.has(COORDINATE_SIDES.TOP)).toBe(true);
      expect(resultTop.coordinateSides.size).toBe(1);

      const resultBottom = parser.parse('coordinates bottom', 1, initialResult);
      expect(resultBottom.coordinateSides.has(COORDINATE_SIDES.BOTTOM)).toBe(true);
      expect(resultBottom.coordinateSides.size).toBe(1);

      const resultLeft = parser.parse('coordinates left', 1, initialResult);
      expect(resultLeft.coordinateSides.has(COORDINATE_SIDES.LEFT)).toBe(true);
      expect(resultLeft.coordinateSides.size).toBe(1);

      const resultRight = parser.parse('coordinates right', 1, initialResult);
      expect(resultRight.coordinateSides.has(COORDINATE_SIDES.RIGHT)).toBe(true);
      expect(resultRight.coordinateSides.size).toBe(1);
    });

    it('should parse combinations of sides', () => {
      const initialResult = ParseResult.create();
      
      const result = parser.parse('coordinates top, left', 1, initialResult);
      expect(result.coordinateSides.has(COORDINATE_SIDES.TOP)).toBe(true);
      expect(result.coordinateSides.has(COORDINATE_SIDES.LEFT)).toBe(true);
      expect(result.coordinateSides.size).toBe(2);
      expect(result.errors.length).toBe(0);
    });

    it('should handle equivalent combinations (top, left vs left, top)', () => {
      const initialResult1 = ParseResult.create();
      const result1 = parser.parse('coordinates top, left', 1, initialResult1);

      const initialResult2 = ParseResult.create();
      const result2 = parser.parse('coordinates left, top', 1, initialResult2);

      expect(result1.coordinateSides.size).toBe(result2.coordinateSides.size);
      expect(result1.coordinateSides.has(COORDINATE_SIDES.TOP)).toBe(true);
      expect(result1.coordinateSides.has(COORDINATE_SIDES.LEFT)).toBe(true);
      expect(result2.coordinateSides.has(COORDINATE_SIDES.TOP)).toBe(true);
      expect(result2.coordinateSides.has(COORDINATE_SIDES.LEFT)).toBe(true);
    });

    it('should handle different separators', () => {
      const initialResult = ParseResult.create();
      
      const result1 = parser.parse('coordinates top left', 1, initialResult);
      expect(result1.coordinateSides.has(COORDINATE_SIDES.TOP)).toBe(true);
      expect(result1.coordinateSides.has(COORDINATE_SIDES.LEFT)).toBe(true);

      const result2 = parser.parse('coordinates top,left', 1, initialResult);
      expect(result2.coordinateSides.has(COORDINATE_SIDES.TOP)).toBe(true);
      expect(result2.coordinateSides.has(COORDINATE_SIDES.LEFT)).toBe(true);

      const result3 = parser.parse('coordinates top , left', 1, initialResult);
      expect(result3.coordinateSides.has(COORDINATE_SIDES.TOP)).toBe(true);
      expect(result3.coordinateSides.has(COORDINATE_SIDES.LEFT)).toBe(true);
    });

    it('should handle case insensitive "coordinates" keyword', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('COORDINATES ON', 1, initialResult);

      expect(result.coordinateSides.has(COORDINATE_SIDES.TOP)).toBe(true);
      expect(result.coordinateSides.has(COORDINATE_SIDES.BOTTOM)).toBe(true);
      expect(result.coordinateSides.has(COORDINATE_SIDES.LEFT)).toBe(true);
      expect(result.coordinateSides.has(COORDINATE_SIDES.RIGHT)).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should handle case insensitive "on" and "off"', () => {
      const initialResult1 = ParseResult.create();
      const resultOn = parser.parse('coordinates ON', 1, initialResult1);

      const initialResult2 = ParseResult.create();
      const resultOff = parser.parse('coordinates OFF', 1, initialResult2);

      expect(resultOn.coordinateSides.size).toBe(4);
      expect(resultOff.coordinateSides.size).toBe(0);
      expect(resultOn.errors.length).toBe(0);
      expect(resultOff.errors.length).toBe(0);
    });

    it('should handle alternative disable values', () => {
      const initialResult = ParseResult.create();
      
      const values = ['none', 'no', 'false', 'disabled'];
      for (const value of values) {
        const result = parser.parse(`coordinates ${value}`, 1, initialResult);
        expect(result.coordinateSides.size).toBe(0);
        expect(result.errors.length).toBe(0);
      }
    });

    it('should handle alternative enable values', () => {
      const initialResult = ParseResult.create();
      
      const values = ['yes', 'enabled'];
      for (const value of values) {
        const result = parser.parse(`coordinates ${value}`, 1, initialResult);
        expect(result.coordinateSides.size).toBe(4);
        expect(result.errors.length).toBe(0);
      }
    });

    it('should handle whitespace variations', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('coordinates    on', 1, initialResult);

      expect(result.coordinateSides.size).toBe(4);
      expect(result.errors.length).toBe(0);
    });

    it('should preserve other ParseResult properties', () => {
      const initialResult = new ParseResult(
        [],
        { width: 9, height: 9 },
        new Set([COORDINATE_SIDES.TOP, COORDINATE_SIDES.BOTTOM, COORDINATE_SIDES.LEFT, COORDINATE_SIDES.RIGHT]),
        [],
        null,
        false
      );
      const result = parser.parse('coordinates off', 1, initialResult);

      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.coordinateSides.size).toBe(0);
      expect(result.showHoshi).toBe(false);
      expect(result.errors.length).toBe(0);
    });
  });
});

