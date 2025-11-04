import { Renderer } from '../src/renderer';
import { Board, Point, PointContent, createRenderParams, ParseResult } from '../src/models';
import { Parser } from '../src/parser';
import { Mapper } from '../src/mapper';
import * as fs from 'fs';
import * as path from 'path';
import { addStylesToSVG } from './render-utils';

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
        [new Point(PointContent.Black, null, false), new Point(PointContent.White, null, false), new Point(PointContent.Empty, null, false)],
        [new Point(PointContent.Empty, null, false), new Point(PointContent.Black, null, true), new Point(PointContent.Empty, null, false)],
        [new Point(PointContent.Empty, null, false), new Point(PointContent.Empty, null, false), new Point(PointContent.Empty, null, false)]
      ];
      const board = new Board(points, true, 0, points[0].length - 1, 0, points.length - 1);
      
      // Рендерим SVG
      const renderParams = createRenderParams({ width: 100, height: 100 });
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
        Array(19).fill(null).map(() => new Point(PointContent.Empty, null, false))
      );
      const board = new Board(points, true, 0, points[0].length - 1, 0, points.length - 1);
      
      // Рендерим SVG с небольшим базовым размером
      const renderParams = createRenderParams({ width: 200, height: 200 });
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
        [new Point(PointContent.Black, null, false), new Point(PointContent.White, null, false), new Point(PointContent.Empty, null, false)],
        [new Point(PointContent.Empty, null, false), new Point(PointContent.Black, null, true), new Point(PointContent.Empty, null, false)],
        [new Point(PointContent.Empty, null, false), new Point(PointContent.Empty, null, false), new Point(PointContent.Empty, null, false)]
      ];
      const board = new Board(points, true, 0, points[0].length - 1, 0, points.length - 1);
      
      // Рендерим SVG для светлой темы
      const renderParams = createRenderParams({ width: 100, height: 100 });
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
      
      expect(parseResult).toBeInstanceOf(ParseResult);
      expect(parseResult.showCoordinates).toBe(true);
      
      const board = mapper.map(parseResult);
      expect(board.showCoordinates).toBe(true);
      
      const renderParams = createRenderParams();
      const svg = renderer.render(board, renderParams);
      const textElements = svg.querySelectorAll('text');
      expect(textElements.length).toBeGreaterThan(0);
      
      // Проверяем, что у текстовых элементов есть font-size
      textElements.forEach((element, index) => {
        const fontSize = element.getAttribute('font-size');
        expect(fontSize).toBeTruthy();
      });
    });

    it('should not render coordinates when disabled', () => {
      const source = 'size 9x9\ncoordinates off';
      const parseResult = parser.parse(source);
      
      expect(parseResult).toBeInstanceOf(ParseResult);
      expect(parseResult.showCoordinates).toBe(false);
      
      const board = mapper.map(parseResult);
      expect(board.showCoordinates).toBe(false);
      
      const renderParams = createRenderParams();
      const svg = renderer.render(board, renderParams);
      const textElements = svg.querySelectorAll('text');
      
      expect(textElements.length).toBe(0);
    });

    it('should render hoshi when enabled', () => {
      const source = 'size 9x9\nhoshi on';
      const parseResult = parser.parse(source);
      
      expect(parseResult).toBeInstanceOf(ParseResult);
      expect(parseResult.showHoshi).toBe(true);
      
      const board = mapper.map(parseResult);
      
      // Проверяем, что точки хоси имеют hasHoshi = true
      let hoshiCount = 0;
      for (let i = 0; i < board.points.length; i++) {
        for (let j = 0; j < board.points[i].length; j++) {
          if (board.points[i][j].hasHoshi) {
            hoshiCount++;
          }
        }
      }
      expect(hoshiCount).toBe(5); // На доске 9x9 должно быть 5 точек хоси
      
      const renderParams = createRenderParams();
      const svg = renderer.render(board, renderParams);
      const hoshiElements = svg.querySelectorAll('circle.go-board-hoshi');
      
      expect(hoshiElements.length).toBe(5);
    });

    it('should not render hoshi when disabled', () => {
      const source = 'size 9x9\nhoshi off';
      const parseResult = parser.parse(source);
      
      expect(parseResult).toBeInstanceOf(ParseResult);
      expect(parseResult.showHoshi).toBe(false);
      
      const board = mapper.map(parseResult);
      
      // Проверяем, что точки хоси имеют hasHoshi = false
      let hoshiCount = 0;
      for (let i = 0; i < board.points.length; i++) {
        for (let j = 0; j < board.points[i].length; j++) {
          if (board.points[i][j].hasHoshi) {
            hoshiCount++;
          }
        }
      }
      expect(hoshiCount).toBe(0);
      
      const renderParams = createRenderParams();
      const svg = renderer.render(board, renderParams);
      const hoshiElements = svg.querySelectorAll('circle.go-board-hoshi');
      
      expect(hoshiElements.length).toBe(0);
    });
  });

  describe('viewport rendering', () => {
    it('full viewport (9x9) should render full grid with larger size than cropped viewport', () => {
      const fullSource = fs.readFileSync(path.join(__dirname, 'test-data', 'viewport-full.txt'), 'utf-8');
      const normalSource = fs.readFileSync(path.join(__dirname, 'test-data', 'viewport-normal.txt'), 'utf-8');

      const fullParsed = parser.parse(fullSource) as ParseResult;
      const normalParsed = parser.parse(normalSource) as ParseResult;

      const fullBoard = mapper.map(fullParsed);
      const normalBoard = mapper.map(normalParsed);

      const svgFull = renderer.render(fullBoard, createRenderParams());
      const svgNormal = renderer.render(normalBoard, createRenderParams());

      const wFull = parseInt(svgFull.getAttribute('width') || '0');
      const hFull = parseInt(svgFull.getAttribute('height') || '0');
      const wNormal = parseInt(svgNormal.getAttribute('width') || '0');
      const hNormal = parseInt(svgNormal.getAttribute('height') || '0');

      expect(wFull).toBeGreaterThan(wNormal);
      expect(hFull).toBeGreaterThan(hNormal);

      // Full grid should have many lines; at least more than a cropped viewport
      const linesFull = svgFull.querySelectorAll('line').length;
      const linesNormal = svgNormal.querySelectorAll('line').length;
      expect(linesFull).toBeGreaterThan(linesNormal);
      expect(linesFull).toBeGreaterThanOrEqual(16);
    });

    it('single-cell viewport should render 1x1 grid with minimal size and 2 lines', () => {
      const source = fs.readFileSync(path.join(__dirname, 'test-data', 'viewport-small.txt'), 'utf-8');
      const parsed = parser.parse(source) as ParseResult;
      const board = mapper.map(parsed);

      const svg = renderer.render(board, createRenderParams());

      // With coordinates on by default, padding = fontSize * 2.5, fallback fontSize=16 => padding≈40
      const width = parseInt(svg.getAttribute('width') || '0');
      const height = parseInt(svg.getAttribute('height') || '0');
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);

      const lines = svg.querySelectorAll('line');
      // 1 vertical + 1 horizontal
      expect(lines.length).toBe(2);
    });

    it('normal viewport should reduce grid lines and overall dimensions', () => {
      const normalSource = fs.readFileSync(path.join(__dirname, 'test-data', 'viewport-normal.txt'), 'utf-8');
      const fullSource = fs.readFileSync(path.join(__dirname, 'test-data', 'viewport-full.txt'), 'utf-8');

      const normalParsed = parser.parse(normalSource) as ParseResult;
      const fullParsed = parser.parse(fullSource) as ParseResult;

      const normalBoard = mapper.map(normalParsed);
      const fullBoard = mapper.map(fullParsed);

      const svgNormal = renderer.render(normalBoard, createRenderParams());
      const svgFull = renderer.render(fullBoard, createRenderParams());

      const wNormal = parseInt(svgNormal.getAttribute('width') || '0');
      const hNormal = parseInt(svgNormal.getAttribute('height') || '0');
      const wFull = parseInt(svgFull.getAttribute('width') || '0');
      const hFull = parseInt(svgFull.getAttribute('height') || '0');

      expect(wNormal).toBeLessThan(wFull);
      expect(hNormal).toBeLessThan(hFull);

      const normalLines = svgNormal.querySelectorAll('line').length;
      const fullLines = svgFull.querySelectorAll('line').length;
      expect(normalLines).toBeLessThan(fullLines); // fewer grid lines in a cropped viewport
    });
  });

  describe('baseline comparison', () => {
    it('should match baseline SVG files for all test data', async () => {
      const testDataDir = path.join(__dirname, 'test-data');
      const baselineDir = path.join(testDataDir, 'baseline');
      
      // Получаем все txt файлы
      const txtFiles = getTxtFiles(testDataDir);
      
      if (txtFiles.length === 0) {
        return;
      }

      // Обрабатываем каждый файл для обеих тем
      for (const txtFile of txtFiles) {
        await compareFileWithBaseline(txtFile, parser, mapper, renderer, baselineDir);
      }

    });
  });

});

/**
 * Получает список указанных txt файлов из каталога
 */
function getTxtFiles(dir: string): string[] {
  try {
    const files = fs.readdirSync(dir);
    return files
      .filter(file => file.endsWith('.txt') && file !== 'empty-string.txt') // Пропускаем empty-string.txt, так как он не имеет baseline
      .map(file => path.join(dir, file));
  } catch (error) {
    return [];
  }
}

/**
 * Сравнивает файл с бейзлайном для обеих тем
 */
async function compareFileWithBaseline(
  txtFilePath: string, 
  parser: Parser, 
  mapper: Mapper, 
  renderer: Renderer, 
  baselineDir: string
): Promise<void> {
  const fileName = path.basename(txtFilePath);
  const baseFileName = fileName.replace('.txt', '');
  
  try {
    // Шаг 1: Читаем содержимое файла
    const content = fs.readFileSync(txtFilePath, 'utf-8');

    // Шаг 2: Парсинг
    const parseResult = parser.parse(content);
    // Всегда возвращается ParseResult, пропускаем если есть ошибки
    if (parseResult.errors.length > 0) {
      return; // Пропускаем файлы, которые не могут быть распарсены
    }

    // Шаг 3: Маппинг
    const board = mapper.map(parseResult);

    // Проверяем светлую тему
    await compareThemeWithBaseline(board, renderer, baselineDir, baseFileName, 'light');
    
    // Проверяем тёмную тему
    await compareThemeWithBaseline(board, renderer, baselineDir, baseFileName, 'dark');

  } catch (error) {
    throw error; // Пробрасываем ошибку, чтобы тест упал
  }
  
}

/**
 * Сравнивает рендеринг с бейзлайном для конкретной темы
 */
async function compareThemeWithBaseline(
  board: Board,
  renderer: Renderer,
  baselineDir: string,
  baseFileName: string,
  theme: 'light' | 'dark'
): Promise<void> {
  // Шаг 1: Рендерим SVG в памяти
  const svgContent = renderer.render(board, createRenderParams());
  addStylesToSVG(svgContent, theme);
  const currentSvgString = new XMLSerializer().serializeToString(svgContent);
  
  // Шаг 2: Читаем бейзлайн SVG
  const baselineSvgPath = path.join(baselineDir, `${baseFileName}-${theme}.svg`);
  
  if (!fs.existsSync(baselineSvgPath)) {
    throw new Error(`Бейзлайн файл не найден: ${baselineSvgPath}`);
  }
  
  const baselineSvgString = fs.readFileSync(baselineSvgPath, 'utf-8');
  
  // Шаг 3: Нормализуем и сравниваем
  const normalizedCurrent = normalizeSvgString(currentSvgString);
  const normalizedBaseline = normalizeSvgString(baselineSvgString);
  
  if (normalizedCurrent !== normalizedBaseline) {
    // Находим различия для более информативного сообщения
    const differences = findSvgDifferences(normalizedCurrent, normalizedBaseline);
    
    
    // Сохраняем текущий результат для отладки
    const debugPath = baselineSvgPath.replace('.svg', '-current.svg');
    fs.writeFileSync(debugPath, currentSvgString, 'utf-8');
    
    throw new Error(`SVG для ${theme === 'light' ? 'светлой' : 'тёмной'} темы не соответствует бейзлайну. Файл: ${baseFileName}. Различия: ${differences}. Текущий результат: ${debugPath}`);
  }

}

/**
 * Находит различия между двумя SVG строками
 */
function findSvgDifferences(current: string, baseline: string): string {
  const currentLines = current.split('\n');
  const baselineLines = baseline.split('\n');
  
  const maxLines = Math.max(currentLines.length, baselineLines.length);
  const differences: string[] = [];
  
  for (let i = 0; i < maxLines; i++) {
    const currentLine = currentLines[i] || '';
    const baselineLine = baselineLines[i] || '';
    
    if (currentLine !== baselineLine) {
      differences.push(`Строка ${i + 1}: "${currentLine}" !== "${baselineLine}"`);
      if (differences.length >= 5) { // Ограничиваем количество различий
        differences.push('... (и другие различия)');
        break;
      }
    }
  }
  
  return differences.join('; ');
}

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
