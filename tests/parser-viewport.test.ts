import { Parser } from '../src/parser';
import { ParseResult, SinglePosition } from '../src/models';
import { testDataLoader } from './test-data-loader';

describe('ViewportParser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  describe('parse - viewport handling', () => {
    it('should parse valid viewport A1-H9', () => {
      const result = parser.parse('viewport A1-H9');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual({ start: new SinglePosition(0, 0), end: new SinglePosition(7, 8) });
      expect(result.errors.length).toBe(0);
    });

    it('should parse small viewport B2-B2', () => {
      const source = testDataLoader.loadTestData('viewport-small.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual({ start: new SinglePosition(1, 1), end: new SinglePosition(1, 1) });
      expect(result.errors.length).toBe(0);
    });

    it('should parse full viewport A1-H9', () => {
      const source = testDataLoader.loadTestData('viewport-full.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual({ start: new SinglePosition(0, 0), end: new SinglePosition(7, 8) });
      expect(result.errors.length).toBe(0);
    });

    it('should parse normal viewport B2-E5', () => {
      const source = testDataLoader.loadTestData('viewport-normal.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual({ start: new SinglePosition(1, 1), end: new SinglePosition(4, 4) });
      expect(result.errors.length).toBe(0);
    });

    it('should parse viewport A1-F5', () => {
      const source = testDataLoader.loadTestData('viewport-a1-f5.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual({ start: new SinglePosition(0, 0), end: new SinglePosition(5, 4) });
      expect(result.errors.length).toBe(0);
    });

    it('should handle case insensitive "viewport" keyword', () => {
      const result = parser.parse('VIEWPORT A1-H9');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual({ start: new SinglePosition(0, 0), end: new SinglePosition(7, 8) });
      expect(result.errors.length).toBe(0);
    });

    it('should handle whitespace variations', () => {
      const result = parser.parse('viewport   A1   -   H9');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.viewport).not.toBeNull();
      expect(result.viewport).toEqual({ start: new SinglePosition(0, 0), end: new SinglePosition(7, 8) });
      expect(result.errors.length).toBe(0);
    });

    it('should return ParseResult with errors for invalid format', () => {
      const source = testDataLoader.loadTestData('viewport-invalid.txt');
      const result = parser.parse(source);

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('viewport'))).toBe(true);
    });

    it('should return ParseResult with errors for invalid coordinates', () => {
      const result = parser.parse('viewport XX99-ZZ99');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('Invalid viewport coordinates'))).toBe(true);
    });

    it('should return ParseResult with default viewport=null for empty string', () => {
      const result = parser.parse('');

      expect(result).toBeInstanceOf(ParseResult);
      expect(result.viewport).toBeNull();
      expect(result.errors.length).toBe(0);
    });
  });
});

