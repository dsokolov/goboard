import { Token } from "typedi";

export class SchemeColors {
  constructor(
    public readonly background: string,
    public readonly foreground: string,
    public readonly text: string,
    public readonly textMuted: string,
    public readonly accent: string,
    public readonly border: string,
    public readonly shadow: string,
    public readonly highlight: string
  ) { }
}

export const SchemeColorsProviderToken = new Token<SchemeColorsProvider>('SchemeColorsProvider');

export interface SchemeColorsProvider {
  getColors(): SchemeColors;
}

export class SchemeColorsProviderImpl implements SchemeColorsProvider {
  getColors(): SchemeColors {
    // Получаем CSS переменные из текущей темы Obsidian
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    // Основные цвета темы
    const background = this.getCSSVariable(computedStyle, '--background-primary', '#1e1e1e');
    const foreground = this.getCSSVariable(computedStyle, '--background-secondary', '#2d2d2d');
    const text = this.getCSSVariable(computedStyle, '--text-normal', '#dcddde');
    const textMuted = this.getCSSVariable(computedStyle, '--text-muted', '#8a8a8a');
    const accent = this.getCSSVariable(computedStyle, '--accent', '#7c3aed');
    const border = this.getCSSVariable(computedStyle, '--background-modifier-border', '#3c3c3c');
    const shadow = this.getCSSVariable(computedStyle, '--shadow-small', 'rgba(0, 0, 0, 0.3)');
    const highlight = this.getCSSVariable(computedStyle, '--text-highlight-bg', 'rgba(124, 58, 237, 0.3)');

    return new SchemeColors(
      background,
      foreground,
      text,
      textMuted,
      accent,
      border,
      shadow,
      highlight
    );
  }

  private getCSSVariable(computedStyle: CSSStyleDeclaration, variableName: string, fallback: string): string {
    const value = computedStyle.getPropertyValue(variableName).trim();
    return value || fallback;
  }
}
