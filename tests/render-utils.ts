/**
 * Утилиты для рендеринга SVG изображений в тестах
 * Читает стили из styles.css и заменяет CSS переменные на конкретные значения
 */

import * as fs from 'fs';
import * as path from 'path';

export type Theme = 'light' | 'dark';

/**
 * Маппинг CSS переменных Obsidian на конкретные значения для светлой и тёмной тем
 * Эти значения соответствуют стандартным цветам Obsidian
 */
const cssVariableValues = {
    light: {
        '--background-primary': '#f8f8f8',
        '--background-secondary': '#DCB35C',
        '--background-modifier-border': '#ccc',
        '--background-modifier-box-shadow': 'rgba(0, 0, 0, 0.1)',
        '--text-normal': '#333333',
        '--text-muted': '#333333',
        '--font-text-size': '16px',
        '--font-text': 'Arial, sans-serif',
    },
    dark: {
        '--background-primary': '#2a2a2a',
        '--background-secondary': '#DCB35C',
        '--background-modifier-border': '#ccc',
        '--background-modifier-box-shadow': 'rgba(0, 0, 0, 0.1)',
        '--text-normal': '#cccccc',
        '--text-muted': '#cccccc',
        '--font-text-size': '16px',
        '--font-text': 'Arial, sans-serif',
    },
} as const;

/**
 * Читает содержимое styles.css файла
 */
function readStylesCss(): string {
    // Путь к styles.css относительно корня проекта
    const stylesPath = path.join(__dirname, '..', 'plugin-dist', 'styles.css');
    return fs.readFileSync(stylesPath, 'utf-8');
}

/**
 * Заменяет CSS переменные на конкретные значения
 */
function replaceCssVariables(css: string, theme: Theme): string {
    let result = css;
    const variables = cssVariableValues[theme];
    
    // Заменяем все var(--variable-name, fallback) на конкретные значения
    for (const [varName, varValue] of Object.entries(variables)) {
        // Заменяем var(--variable-name) и var(--variable-name, fallback)
        const escapedVarName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`var\\(${escapedVarName}(?:,\\s*[^)]+)?\\)`, 'g');
        result = result.replace(regex, varValue);
    }
    
    return result;
}

/**
 * Обрабатывает CSS для использования в SVG:
 * - Убирает блоки для другой темы
 * - Убирает префиксы .theme-light/.theme-dark из селекторов
 * - Убирает ненужные стили контейнера
 */
function processCssForSvg(css: string, theme: Theme): string {
    // Убираем блоки для другой темы
    const otherTheme = theme === 'light' ? 'dark' : 'light';
    const otherThemeRegex = new RegExp(`\\.theme-${otherTheme}\\s+[^{]*\\{[^}]*\\}`, 'g');
    let result = css.replace(otherThemeRegex, '');
    
    // Убираем префиксы .theme-light/.theme-dark из селекторов
    result = result.replace(new RegExp(`\\.theme-${theme}\\s+`, 'g'), '');
    
    // Убираем стили контейнера (они не нужны для SVG)
    result = result.replace(/\.go-board-container[^{]*\{[^}]*\}/g, '');
    result = result.replace(/\.go-board-container\s+svg[^{]*\{[^}]*\}/g, '');
    
    // Убираем стили наследования CSS переменных (не нужны в SVG)
    result = result.replace(/\.go-board-svg\s*\*[^{]*\{[^}]*\}/g, '');
    result = result.replace(/\.go-board-container\s+svg,\s*\.go-board-svg[^{]*\{[^}]*\}/g, '');
    
    // Убираем лишние пустые строки
    result = result.replace(/\n{3,}/g, '\n\n');
    
    return result.trim();
}

/**
 * Добавляет описание используемых стилей в SVG элемент для указанной темы
 * Читает стили из styles.css и заменяет CSS переменные на конкретные значения
 */
export function addStylesToSVG(svg: SVGElement, theme: Theme): void {
    // Создаем элемент <defs> для стилей
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Создаем элемент <style> с описанием CSS стилей
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    
    // Читаем стили из CSS файла
    const cssContent = readStylesCss();
    
    // Заменяем CSS переменные на конкретные значения
    const cssWithValues = replaceCssVariables(cssContent, theme);
    
    // Обрабатываем CSS для SVG (убираем лишнее, оставляем нужное)
    const svgStyles = processCssForSvg(cssWithValues, theme);
    
    const themeName = theme === 'light' ? 'Светлая' : 'Тёмная';
    
    style.textContent = `/* Стили для рендеринга диаграмм Го - ${themeName} тема */\n\n${svgStyles}`;
    
    defs.appendChild(style);
    
    // Добавляем defs в начало SVG
    svg.insertBefore(defs, svg.firstChild);
}
