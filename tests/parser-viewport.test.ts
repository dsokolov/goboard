import { ViewportParser } from '../src/parser';
import { ParseResult, SinglePosition, Viewport } from '../src/models';

describe('ViewportParser', () => {
  let parser: ViewportParser;

  beforeEach(() => {
    parser = new ViewportParser();
  });

  describe('isApplicable', () => {
    it('should return true for viewport line', () => {
      expect(parser.isApplicable('viewport A1-H9')).toBe(true);
      expect(parser.isApplicable('VIEWPORT A1-H9')).toBe(true);
      expect(parser.isApplicable('viewport   A1   -   H9')).toBe(true);
    });

    it('should return false for non-viewport line', () => {
      expect(parser.isApplicable('size 9x9')).toBe(false);
      expect(parser.isApplicable('B A1')).toBe(false);
      expect(parser.isApplicable('coordinates on')).toBe(false);
    });
  });

  describe('parse - viewport handling', () => {
    it('should parse valid viewport A1-H9', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('viewport A1-H9', 1, initialResult);

      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual(new Viewport(new SinglePosition(0, 0), new SinglePosition(7, 8)));
      expect(result.errors.length).toBe(0);
    });

    it('should parse small viewport B2-B2', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('viewport B2-B2', 1, initialResult);

      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual(new Viewport(new SinglePosition(1, 1), new SinglePosition(1, 1)));
      expect(result.errors.length).toBe(0);
    });

    it('should parse full viewport A1-H9', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('viewport A1-H9', 1, initialResult);

      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual(new Viewport(new SinglePosition(0, 0), new SinglePosition(7, 8)));
      expect(result.errors.length).toBe(0);
    });

    it('should parse normal viewport B2-E5', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('viewport B2-E5', 1, initialResult);

      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual(new Viewport(new SinglePosition(1, 1), new SinglePosition(4, 4)));
      expect(result.errors.length).toBe(0);
    });

    it('should parse viewport A1-F5', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('viewport A1-F5', 1, initialResult);

      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual(new Viewport(new SinglePosition(0, 0), new SinglePosition(5, 4)));
      expect(result.errors.length).toBe(0);
    });

    it('should handle case insensitive "viewport" keyword', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('VIEWPORT A1-H9', 1, initialResult);

      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual(new Viewport(new SinglePosition(0, 0), new SinglePosition(7, 8)));
      expect(result.errors.length).toBe(0);
    });

    it('should handle whitespace variations', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('viewport   A1   -   H9', 1, initialResult);

      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual(new Viewport(new SinglePosition(0, 0), new SinglePosition(7, 8)));
      expect(result.errors.length).toBe(0);
    });

    it('should return ParseResult with errors for invalid format', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('viewport invalid string', 1, initialResult);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('viewport'))).toBe(true);
    });

    it('should return ParseResult with errors for invalid coordinates', () => {
      const initialResult = ParseResult.create();
      const result = parser.parse('viewport XX99-ZZ99', 1, initialResult);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('Invalid viewport coordinates'))).toBe(true);
    });
  });
});

