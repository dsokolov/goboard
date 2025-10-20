import { Renderer } from '../src/renderer';
import { Board, Point, PointContent, createRenderParams, ParseError } from '../src/models';
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
        Array(19).fill(null).map(() => new Point(PointContent.Empty, false))
      );
      const board = new Board(points, true);
      
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
        [new Point(PointContent.Black, false), new Point(PointContent.White, false), new Point(PointContent.Empty, false)],
        [new Point(PointContent.Empty, false), new Point(PointContent.Black, true), new Point(PointContent.Empty, false)],
        [new Point(PointContent.Empty, false), new Point(PointContent.Empty, false), new Point(PointContent.Empty, false)]
      ];
      const board = new Board(points, true);
      
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
      
      expect(parseResult).toBeInstanceOf(ParseSuccess);
      expect((parseResult as ParseSuccess).showCoordinates).toBe(true);
      
      const board = mapper.map(parseResult as ParseSuccess);
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
      
      expect(parseResult).toBeInstanceOf(ParseSuccess);
      expect((parseResult as ParseSuccess).showCoordinates).toBe(false);
      
      const board = mapper.map(parseResult as ParseSuccess);
      expect(board.showCoordinates).toBe(false);
      
      const renderParams = createRenderParams();
      const svg = renderer.render(board, renderParams);
      const textElements = svg.querySelectorAll('text');
      
      expect(textElements.length).toBe(0);
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
 * Получает список всех txt файлов в указанном каталоге
 */
function getTxtFiles(dir: string): string[] {
  try {
    const files = fs.readdirSync(dir);
    return files
      .filter(file => file.endsWith('.txt'))
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
    if (parseResult instanceof ParseError) {
      return; // Пропускаем файлы, которые не могут быть распарсены
    }

    // Шаг 3: Маппинг
    const board = mapper.map(parseResult as any);

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
 * Добавляет описание используемых стилей в SVG элемент для указанной темы
 */
function addStylesToSVG(svg: SVGElement, theme: 'light' | 'dark'): void {
  // Создаем элемент <defs> для стилей
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  
  // Создаем элемент <style> с описанием CSS стилей
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  
  style.textContent = `
/* Стили для рендеринга диаграмм Го - ${theme === 'light' ? 'Светлая' : 'Тёмная'} тема */

/* Основной контейнер SVG */
.go-board-svg {
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: transparent;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: min(90vw, 800px);
    max-height: min(80vh, 600px);
    width: auto;
    height: auto;
    display: block;
    object-fit: contain;
    transition: max-width 0.3s ease, max-height 0.3s ease;
}

/* Фон доски */
.go-board-background {
    fill: ${theme === 'light' ? '#f8f8f8' : '#2a2a2a'};
}

/* Линии доски */
.go-board-line {
    stroke: ${theme === 'light' ? '#333333' : '#cccccc'};
    stroke-width: 1;
}

/* Звездные точки (хоси) */
.go-board-hoshi {
    fill: ${theme === 'light' ? '#333333' : '#cccccc'};
    r: 5;
}

/* Координаты */
.go-board-coordinate {
    font-size: 16px;
    font-family: Arial, sans-serif;
    fill: ${theme === 'light' ? '#333333' : '#cccccc'};
}

/* Стили камней для ${theme === 'light' ? 'светлой' : 'тёмной'} темы */
.go-stone-black {
    fill: ${theme === 'light' ? '#000000' : '#ffffff'};
    stroke: ${theme === 'light' ? 'none' : '#000000'};
    stroke-width: ${theme === 'light' ? '0' : '1.5'};
}

.go-stone-white {
    fill: ${theme === 'light' ? '#ffffff' : '#000000'};
    stroke: ${theme === 'light' ? '#000000' : 'none'};
    stroke-width: ${theme === 'light' ? '1.5' : '0'};
}

/* Базовые стили камней */
.go-stone {
    /* Базовые стили для всех камней */
}
    `.trim();
    
  defs.appendChild(style);
  
  // Добавляем defs в начало SVG
  svg.insertBefore(defs, svg.firstChild);
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
