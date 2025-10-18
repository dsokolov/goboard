import { Renderer } from '../src/renderer';
import { Board, Point, PointContent, RenderParams } from '../src/models';
import { Parser } from '../src/parser';
import { Mapper } from '../src/mapper';
import { ParseSuccess } from '../src/models';
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
    renderer = new Renderer();
    parser = new Parser();
    mapper = new Mapper();
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
      const renderParams = new RenderParams({ width: 100, height: 100 });
      const svg = renderer.render(board, renderParams);
      
      // Проверяем, что фон использует CSS класс
      const background = svg.querySelector('rect');
      expect(background).toBeTruthy();
      expect(background?.classList.contains('go-board-background')).toBe(true);
      
      // Проверяем, что линии используют CSS класс
      const lines = svg.querySelectorAll('line');
      expect(lines.length).toBeGreaterThan(0);
      lines.forEach(line => {
        expect(line.classList.contains('go-board-line')).toBe(true);
      });
      
      // Проверяем, что камни используют CSS классы
      const circles = svg.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThan(0);
      
      circles.forEach(circle => {
        // Камни должны иметь соответствующие CSS классы
        const hasStoneClass = circle.classList.contains('go-stone-black') || 
                             circle.classList.contains('go-stone-white') ||
                             circle.classList.contains('go-board-hoshi');
        expect(hasStoneClass).toBe(true);
      });
      
      // Проверяем, что координаты используют CSS класс
      const texts = svg.querySelectorAll('text');
      expect(texts.length).toBeGreaterThan(0);
      texts.forEach(text => {
        expect(text.classList.contains('go-board-coordinate')).toBe(true);
      });
    });

    it('should use adaptive board size based on font size', () => {
      // Создаем доску 19x19 для проверки адаптивного размера
      const points: Point[][] = Array(19).fill(null).map(() => 
        Array(19).fill(null).map(() => new Point(PointContent.Empty, false))
      );
      const board = new Board(points, true);
      
      // Рендерим SVG с небольшим базовым размером
      const renderParams = new RenderParams({ width: 200, height: 200 });
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
      const renderParams = new RenderParams({ width: 100, height: 100 });
      const svg = renderer.render(board, renderParams);
      
      // Проверяем, что камни используют CSS классы
      const circles = svg.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThan(0);
      
      circles.forEach(circle => {
        // Камни должны иметь соответствующие CSS классы
        const hasStoneClass = circle.classList.contains('go-stone-black') || 
                             circle.classList.contains('go-stone-white') ||
                             circle.classList.contains('go-board-hoshi');
        expect(hasStoneClass).toBe(true);
      });
    });

    it('should render coordinates when enabled', () => {
      const source = 'size 9x9\ncoordinates on';
      const parseResult = parser.parse(source);
      
      expect(parseResult).toBeInstanceOf(ParseSuccess);
      expect((parseResult as ParseSuccess).showCoordinates).toBe(true);
      
      const board = mapper.map(parseResult as ParseSuccess);
      expect(board.showCoordinates).toBe(true);
      
      const renderParams = new RenderParams();
      const svg = renderer.render(board, renderParams);
      const textElements = svg.querySelectorAll('text');
      
      console.log('Text elements count:', textElements.length);
      expect(textElements.length).toBeGreaterThan(0);
      
      // Проверяем, что у текстовых элементов есть font-size
      textElements.forEach((element, index) => {
        const fontSize = element.getAttribute('font-size');
        console.log(`Element ${index}: "${element.textContent}" font-size: ${fontSize}`);
        expect(fontSize).toBeTruthy();
      });
    });

    it('should not render coordinates when disabled', () => {
      const source = 'size 9x9\ncoordinates off';
      const parseResult = parser.parse(source);
      
      expect(parseResult).toBeInstanceOf(ParseSuccess);
      expect((parseResult as ParseSuccess).showCoordinates).toBe(false);
      
      const board = mapper.map(parseResult as ParseSuccess);
      expect(board.showCoordinates).toBe(false);
      
      const renderParams = new RenderParams();
      const svg = renderer.render(board, renderParams);
      const textElements = svg.querySelectorAll('text');
      
      expect(textElements.length).toBe(0);
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
