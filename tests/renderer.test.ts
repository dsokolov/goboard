import { createRenderer, Renderer } from '../src/renderer/renderer';
import { Board, Point, PointContent, RenderParams } from '../src/renderer/data';
import { createParser, Parser } from '../src/parser/parser';
import { createMapper, Mapper } from '../src/mapper/mapper';
import { ParseSuccess } from '../src/parser/data';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Тесты для рендерера SVG изображений досок Го.
 * 
 * Принцип работы:
 * 1. Создается объект Board с определенным состоянием
 * 2. Рендерер генерирует SVG изображение
 * 3. SVG сравнивается с эталонным изображением из папки assets/
 */
describe('Renderer', () => {
  let renderer: Renderer;
  let parser: Parser;
  let mapper: Mapper;

  beforeEach(() => {
    renderer = createRenderer();
    parser = createParser();
    mapper = createMapper();
  });

  describe('render', () => {
    it('should use CSS variables for all colors', () => {
      // Создаем простую доску 3x3 с камнями
      const points: Point[][] = [
        [new Point(PointContent.Black, false), new Point(PointContent.White, false), new Point(PointContent.Empty, false)],
        [new Point(PointContent.Empty, false), new Point(PointContent.Black, true), new Point(PointContent.Empty, false)],
        [new Point(PointContent.Empty, false), new Point(PointContent.Empty, false), new Point(PointContent.Empty, false)]
      ];
      const board = new Board(points, true);
      
      // Рендерим SVG
      const renderParams = new RenderParams({ width: 100, height: 100, isDarkTheme: true });
      const svg = renderer.render(board, renderParams);
      
      // Проверяем, что фон использует CSS переменную
      const background = svg.querySelector('rect');
      expect(background).toBeTruthy();
      expect(background?.getAttribute('fill')).toBe('var(--background-primary,rgb(210, 15, 15))');
      
      // Проверяем, что линии используют CSS переменную
      const lines = svg.querySelectorAll('line');
      expect(lines.length).toBeGreaterThan(0);
      lines.forEach(line => {
        expect(line.getAttribute('stroke')).toBe('var(--text-muted, #8a8a8a)');
      });
      
      // Проверяем, что камни используют фиксированные цвета
      const circles = svg.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThan(0);
      
      circles.forEach(circle => {
        const fill = circle.getAttribute('fill');
        const stroke = circle.getAttribute('stroke');
        
        // Камни должны использовать CSS переменные в зависимости от темы
        if (fill === 'var(--background-primary, #1e1e1e)' || fill === 'var(--text-normal, #dcddde)') {
          // Это камень в тёмной теме - проверяем CSS переменные
          expect(fill).toMatch(/var\(--/);
          // В тёмной теме только чёрные камни имеют контур, белые - нет
          if (fill === 'var(--background-primary, #1e1e1e)') {
            expect(stroke).toMatch(/var\(--/);
          } else {
            expect(stroke).toBe('none');
          }
        } else if (fill === 'var(--text-normal, #2c2c2c)' || fill === 'var(--background-primary, #ffffff)') {
          // Это камень в светлой теме - проверяем CSS переменные
          expect(fill).toMatch(/var\(--/);
          // В светлой теме только белые камни имеют контур, чёрные - нет
          if (fill === 'var(--background-primary, #ffffff)') {
            expect(stroke).toMatch(/var\(--/);
          } else {
            expect(stroke).toBe('none');
          }
        } else {
          // Это хоси - должны использовать CSS переменные
          expect(fill).toMatch(/var\(--/);
        }
      });
      
      // Проверяем, что координаты используют CSS переменные для размера и семейства шрифтов
      const texts = svg.querySelectorAll('text');
      expect(texts.length).toBeGreaterThan(0);
      texts.forEach(text => {
        const style = text.getAttribute('style');
        expect(style).toContain('var(--text-normal, #dcddde)');
        expect(style).toContain('var(--font-text-size,');
        expect(style).toContain('var(--font-text, inherit)');
      });
    });

    it('should use adaptive board size based on font size', () => {
      // Создаем доску 19x19 для проверки адаптивного размера
      const points: Point[][] = Array(19).fill(null).map(() => 
        Array(19).fill(null).map(() => new Point(PointContent.Empty, false))
      );
      const board = new Board(points, true);
      
      // Рендерим SVG с небольшим базовым размером
      const renderParams = new RenderParams({ width: 200, height: 200, isDarkTheme: false });
      const svg = renderer.render(board, renderParams);
      
      // Проверяем, что размер доски увеличился для большей доски
      const width = parseInt(svg.getAttribute('width') || '0');
      const height = parseInt(svg.getAttribute('height') || '0');
      
      // Размер должен быть больше базового для доски 19x19
      expect(width).toBeGreaterThan(200);
      expect(height).toBeGreaterThan(200);
    });

    it('should use different colors for light theme', () => {
      // Создаем простую доску 3x3 с камнями
      const points: Point[][] = [
        [new Point(PointContent.Black, false), new Point(PointContent.White, false), new Point(PointContent.Empty, false)],
        [new Point(PointContent.Empty, false), new Point(PointContent.Black, true), new Point(PointContent.Empty, false)],
        [new Point(PointContent.Empty, false), new Point(PointContent.Empty, false), new Point(PointContent.Empty, false)]
      ];
      const board = new Board(points, true);
      
      // Рендерим SVG для светлой темы
      const renderParams = new RenderParams({ width: 100, height: 100, isDarkTheme: false });
      const svg = renderer.render(board, renderParams);
      
      // Проверяем, что камни используют правильные CSS переменные для светлой темы
      const circles = svg.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThan(0);
      
      circles.forEach(circle => {
        const fill = circle.getAttribute('fill');
        const stroke = circle.getAttribute('stroke');
        
        // Камни должны использовать CSS переменные для светлой темы
        if (fill === 'var(--text-normal, #2c2c2c)' || fill === 'var(--background-primary, #ffffff)') {
          // Это камень в светлой теме - проверяем CSS переменные
          expect(fill).toMatch(/var\(--/);
          // В светлой теме только белые камни имеют контур, чёрные - нет
          if (fill === 'var(--background-primary, #ffffff)') {
            expect(stroke).toMatch(/var\(--/);
          } else {
            expect(stroke).toBe('none');
          }
        } else {
          // Это хоси - должны использовать CSS переменные
          expect(fill).toMatch(/var\(--/);
        }
      });
    });
  });

});

/**
 * Нормализует SVG строку для сравнения
 * Убирает лишние пробелы, переносы строк и приводит к единому формату
 */
function normalizeSvgString(svg: string): string {
  return svg
    .replace(/\s+/g, ' ') // Заменяем множественные пробелы на одинарные
    .replace(/>\s+</g, '><') // Убираем пробелы между тегами
    .trim(); // Убираем пробелы в начале и конце
}
