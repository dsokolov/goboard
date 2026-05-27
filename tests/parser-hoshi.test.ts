import { HoshiParser } from '../src/parser';
import { ParseResult, makeHoshiPointKey } from '../src/models';

describe('HoshiParser', () => {
  let parser: HoshiParser;

  beforeEach(() => {
    parser = new HoshiParser();
  });

  const board9 = (): ParseResult =>
    new ParseResult([], { width: 9, height: 9 }, new Set(), [], null, true, null);

  const board19 = (): ParseResult =>
    new ParseResult([], { width: 19, height: 19 }, new Set(), [], null, true, null);

  describe('isApplicable', () => {
    it('should return true for any hoshi line with a value', () => {
      expect(parser.isApplicable('hoshi on')).toBe(true);
      expect(parser.isApplicable('hoshi off')).toBe(true);
      expect(parser.isApplicable('HOSHI ON')).toBe(true);
      expect(parser.isApplicable('hoshi    on')).toBe(true);
      expect(parser.isApplicable('hoshi D4,K4,G4')).toBe(true);
      expect(parser.isApplicable('hoshi disabled')).toBe(true);
    });

    it('should return false for non-hoshi line', () => {
      expect(parser.isApplicable('size 9x9')).toBe(false);
      expect(parser.isApplicable('viewport A1-H9')).toBe(false);
      expect(parser.isApplicable('coordinates on')).toBe(false);
      expect(parser.isApplicable('B A1')).toBe(false);
      expect(parser.isApplicable('hoshi')).toBe(false);
    });
  });

  describe('parse - standard on/off', () => {
    it('should parse hoshi on', () => {
      const result = parser.parse('hoshi on', 1, ParseResult.create());
      expect(result.showHoshi).toBe(true);
      expect(result.customHoshiPoints).toBeNull();
      expect(result.errors.length).toBe(0);
    });

    it('should parse hoshi off', () => {
      const result = parser.parse('hoshi off', 1, ParseResult.create());
      expect(result.showHoshi).toBe(false);
      expect(result.customHoshiPoints).toBeNull();
      expect(result.errors.length).toBe(0);
    });

    it('should handle case insensitive keyword and values', () => {
      const resultOn = parser.parse('HOSHI ON', 1, ParseResult.create());
      const resultOff = parser.parse('hoshi OFF', 1, ParseResult.create());
      expect(resultOn.showHoshi).toBe(true);
      expect(resultOff.showHoshi).toBe(false);
    });

    it('should handle whitespace variations', () => {
      const result = parser.parse('hoshi    on', 1, ParseResult.create());
      expect(result.showHoshi).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('parse - aliases', () => {
    const disabledAliases = ['none', 'off', 'no', 'false', 'disabled'];
    const enabledAliases = ['yes', 'on', 'enabled'];

    it.each(disabledAliases)('should disable hoshi for alias %s', (alias) => {
      const result = parser.parse(`hoshi ${alias}`, 1, ParseResult.create());
      expect(result.showHoshi).toBe(false);
      expect(result.customHoshiPoints).toBeNull();
      expect(result.errors.length).toBe(0);
    });

    it.each(enabledAliases)('should enable standard hoshi for alias %s', (alias) => {
      const result = parser.parse(`hoshi ${alias}`, 1, ParseResult.create());
      expect(result.showHoshi).toBe(true);
      expect(result.customHoshiPoints).toBeNull();
      expect(result.errors.length).toBe(0);
    });
  });

  describe('parse - custom coordinates', () => {
    it('should parse comma-separated custom hoshi points', () => {
      const result = parser.parse('hoshi D4,K4,G4', 1, board19());
      expect(result.showHoshi).toBe(true);
      expect(result.customHoshiPoints).toEqual(
        new Set([makeHoshiPointKey(3, 3), makeHoshiPointKey(9, 3), makeHoshiPointKey(6, 3)])
      );
      expect(result.errors.length).toBe(0);
    });

    it('should parse space-separated custom hoshi points', () => {
      const result = parser.parse('hoshi D4 K4 G4', 1, board19());
      expect(result.customHoshiPoints?.size).toBe(3);
      expect(result.errors.length).toBe(0);
    });

    it('should dedupe duplicate coordinates', () => {
      const result = parser.parse('hoshi D4,D4,K4', 1, board19());
      expect(result.customHoshiPoints?.size).toBe(2);
    });

    it('should report invalid coordinate format', () => {
      const result = parser.parse('hoshi D4,invalid', 1, board9());
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].message).toContain('Invalid coordinate');
      expect(result.showHoshi).toBe(true);
      expect(result.customHoshiPoints).toBeNull();
    });

    it('should report out-of-bounds coordinates', () => {
      const result = parser.parse('hoshi A20', 1, board9());
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].message).toContain('out of bounds');
    });
  });

  describe('parse - preserve other properties', () => {
    it('should preserve board size and coordinates when setting hoshi', () => {
      const initialResult = new ParseResult(
        [],
        { width: 9, height: 9 },
        new Set<string>(),
        [],
        null,
        false,
        null
      );
      const result = parser.parse('hoshi on', 1, initialResult);
      expect(result.boardSize).toEqual({ width: 9, height: 9 });
      expect(result.coordinateSides.size).toBe(0);
      expect(result.showHoshi).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });
});
