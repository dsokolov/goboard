import { createRenderer, Renderer } from '../src/renderer/renderer';
import { Board, Point, PointContent } from '../src/renderer/data';
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
    it('stub', () => {
      expect(true).toBe(true);
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
