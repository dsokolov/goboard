import { createRenderer, Renderer } from '../src/renderer/renderer';
import { Board, Cell } from '../src/renderer/data';
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

  beforeEach(() => {
    renderer = createRenderer();
  });

  describe('parse', () => {
    it('должен рендерить пустую доску 3x3 и соответствовать эталонному SVG', () => {
      // Создаем пустую доску 3x3
      const cells: Cell[][] = [
        [Cell.Empty, Cell.Empty, Cell.Empty],
        [Cell.Empty, Cell.Empty, Cell.Empty],
        [Cell.Empty, Cell.Empty, Cell.Empty]
      ];
      const board = new Board(cells);

      // Рендерим SVG
      const svgElement = renderer.parse(board);
      
      // Конвертируем SVG в строку для сравнения
      const svgString = new XMLSerializer().serializeToString(svgElement);
      
      // Загружаем эталонное изображение
      const referencePath = path.join(__dirname, 'assets', 'empty-board-3x3.svg');
      const referenceSvg = fs.readFileSync(referencePath, 'utf8');
      
      // Нормализуем SVG для сравнения (убираем пробелы и переносы строк)
      const normalizedSvg = normalizeSvgString(svgString);
      const normalizedReference = normalizeSvgString(referenceSvg);
      
      // Сравниваем
      expect(normalizedSvg).toBe(normalizedReference);
    });

    it('должен рендерить доску 3x3 с камнями и соответствовать эталонному SVG', () => {
      // Создаем доску 3x3 с камнями
      // Черные камни в позициях (0,0), (1,1), (2,2)
      // Белые камни в позициях (0,2), (2,0)
      const cells: Cell[][] = [
        [Cell.Black, Cell.Empty, Cell.White],
        [Cell.Empty, Cell.Black, Cell.Empty],
        [Cell.White, Cell.Empty, Cell.Black]
      ];
      const board = new Board(cells);

      // Рендерим SVG
      const svgElement = renderer.parse(board);
      
      // Конвертируем SVG в строку для сравнения
      const svgString = new XMLSerializer().serializeToString(svgElement);
      
      // Загружаем эталонное изображение
      const referencePath = path.join(__dirname, 'assets', 'board-with-stones-3x3.svg');
      const referenceSvg = fs.readFileSync(referencePath, 'utf8');
      
      // Нормализуем SVG для сравнения (убираем пробелы и переносы строк)
      const normalizedSvg = normalizeSvgString(svgString);
      const normalizedReference = normalizeSvgString(referenceSvg);
      
      // Сравниваем
      expect(normalizedSvg).toBe(normalizedReference);
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
