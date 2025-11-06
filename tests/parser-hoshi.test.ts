import { HoshiParser } from '../src/parser';
import { ParseResult } from '../src/models';

describe('HoshiParser', () => {
  let parser: HoshiParser;

  beforeEach(() => {
    parser = new HoshiParser();
  });

  describe('isApplicable', () => {
    it('should return true for hoshi line', () => {
      expect(parser.isApplicable('hoshi on')).toBe(true);
      expect(parser.isApplicable('hoshi off')).toBe(true);
      expect(parser.isApplicable('HOSHI ON')).toBe(true);
      expect(parser.isApplicable('hoshi    on')).toBe(true);
    });

    it('should return false for non-hoshi line', () => {
      expect(parser.isApplicable('size 9x9')).toBe(false);
      expect(parser.isApplicable('viewport A1-H9')).toBe(false);
      expect(parser.isApplicable('coordinates on')).toBe(false);
      expect(parser.isApplicable('B A1')).toBe(false);
    });
  });

  describe('parse - hoshi visibility handling', () => {
    it('should parse hoshi on', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('hoshi on', 1, initialResult);

      expect(result.showHoshi).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should parse hoshi off', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('hoshi off', 1, initialResult);

      expect(result.showHoshi).toBe(false);
      expect(result.errors.length).toBe(0);
    });

    it('should handle case insensitive "hoshi" keyword', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('HOSHI ON', 1, initialResult);

      expect(result.showHoshi).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should handle case insensitive "on" and "off"', () => {
      const initialResult1 = ParseResult.create();
      const resultOn = parser.parse('hoshi ON', 1, initialResult1);

      const initialResult2 = ParseResult.create();
      const resultOff = parser.parse('hoshi OFF', 1, initialResult2);

      expect(resultOn.showHoshi).toBe(true);
      expect(resultOff.showHoshi).toBe(false);
      expect(resultOn.errors.length).toBe(0);
      expect(resultOff.errors.length).toBe(0);
    });

    it('should handle whitespace variations', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('hoshi    on', 1, initialResult);

      expect(result.showHoshi).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should preserve other ParseResult properties', () => {
      const initialResult = new ParseResult(
        [],
        { width: 9, height: 9 },
        false,
        [],
        null,
        false
      );
      const result = parser.parse('hoshi on', 1, initialResult);

      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.showCoordinates).toBe(false);
      expect(result.showHoshi).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });
});

