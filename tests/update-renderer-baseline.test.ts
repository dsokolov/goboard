import * as fs from 'fs';
import * as path from 'path';
const sharp = require('sharp');
import { Parser } from '../src/parser';
import { Mapper } from '../src/mapper';
import { Renderer } from '../src/renderer';
import { ParseError, createRenderParams } from '../src/models';

/**
 * Скрипт для обновления бейзлайна рендерера
 * Обрабатывает все txt файлы из test-data каталога
 * Последовательно запускает parser -> mapper -> renderer
 * Сохраняет результат как SVG и PNG файлы для светлой и тёмной тем
 * 
 * Запуск: npm run update-baseline
 */

describe('Update Renderer Baseline', () => {
    let parser: Parser;
    let mapper: Mapper;
    let renderer: Renderer;

    beforeEach(() => {
        parser = new Parser();
        mapper = new Mapper();
        renderer = new Renderer();
    });

    it('должен обновить бейзлайн рендерера - обработать все txt файлы и создать SVG и PNG файлы для светлой и тёмной тем', async () => {
        const testDataDir = path.join(__dirname, 'test-data');
        
        // Создаем единый каталог baseline
        const baselineDir = path.join(testDataDir, 'baseline');
        
        // Создаем каталог если он не существует
        if (!fs.existsSync(baselineDir)) {
            fs.mkdirSync(baselineDir, { recursive: true });
        }
        
        // Получаем все txt файлы
        const txtFiles = getTxtFiles(testDataDir);
        
        if (txtFiles.length === 0) {
            console.log('Не найдено txt файлов в каталоге test-data');
            return;
        }

        console.log(`\n=== Обработка ${txtFiles.length} txt файлов для светлой и тёмной тем (SVG + PNG) ===\n`);

        // Обрабатываем каждый файл для обеих тем
        for (const txtFile of txtFiles) {
            await processFileForThemes(txtFile, parser, mapper, renderer, baselineDir);
        }

        console.log('\n=== Обработка завершена! ===\n');
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
        console.error(`Ошибка чтения каталога ${dir}:`, error);
        return [];
    }
}

/**
 * Обрабатывает один txt файл для обеих тем
 */
async function processFileForThemes(txtFilePath: string, parser: Parser, mapper: Mapper, renderer: Renderer, baselineDir: string): Promise<void> {
    const fileName = path.basename(txtFilePath);
    const baseFileName = fileName.replace('.txt', '');
    
    console.log(`Обработка файла: ${fileName}`);

    try {
        // Шаг 1: Читаем содержимое файла
        const content = fs.readFileSync(txtFilePath, 'utf-8');
        console.log(`  ✓ Файл прочитан (${content.length} символов)`);

        // Шаг 2: Парсинг
        const parseResult = parser.parse(content);
        if (parseResult instanceof ParseError) {
            throw new Error(`Ошибка парсинга: ${parseResult.error}`);
        }
        console.log(`  ✓ Парсинг успешен`);

        // Шаг 3: Маппинг
        const board = mapper.map(parseResult as any);
        console.log(`  ✓ Маппинг успешен (доска ${board.points.length}x${board.points[0]?.length || 0})`);

        // Шаг 4: Рендеринг для светлой темы
        const lightSvgContent = renderer.render(board, createRenderParams());
        addStylesToSVG(lightSvgContent, 'light');
        const lightSvgPath = path.join(baselineDir, `${baseFileName}-light.svg`);
        fs.writeFileSync(lightSvgPath, new XMLSerializer().serializeToString(lightSvgContent), 'utf-8');
        console.log(`  ✓ SVG для светлой темы сохранен: ${path.basename(lightSvgPath)}`);

        // Шаг 4.1: Конвертация SVG в PNG для светлой темы
        const lightPngPath = path.join(baselineDir, `${baseFileName}-light.png`);
        await convertSvgToPng(lightSvgPath, lightPngPath);

        // Шаг 5: Рендеринг для тёмной темы
        const darkSvgContent = renderer.render(board, createRenderParams());
        addStylesToSVG(darkSvgContent, 'dark');
        const darkSvgPath = path.join(baselineDir, `${baseFileName}-dark.svg`);
        fs.writeFileSync(darkSvgPath, new XMLSerializer().serializeToString(darkSvgContent), 'utf-8');
        console.log(`  ✓ SVG для тёмной темы сохранен: ${path.basename(darkSvgPath)}`);

        // Шаг 5.1: Конвертация SVG в PNG для тёмной темы
        const darkPngPath = path.join(baselineDir, `${baseFileName}-dark.png`);
        await convertSvgToPng(darkSvgPath, darkPngPath);

    } catch (error) {
        console.error(`  ✗ Ошибка при обработке ${fileName}:`, error instanceof Error ? error.message : error);
        console.log(`  → Переход к следующему файлу`);
    }
    
    console.log(''); // Пустая строка для разделения
}

/**
 * Обрабатывает один txt файл (старая функция для обратной совместимости)
 */
async function processFile(txtFilePath: string, parser: Parser, mapper: Mapper, renderer: Renderer): Promise<void> {
    const fileName = path.basename(txtFilePath);
    const svgFilePath = txtFilePath.replace('.txt', '.svg');
    
    console.log(`Обработка файла: ${fileName}`);

    try {
        // Шаг 1: Читаем содержимое файла
        const content = fs.readFileSync(txtFilePath, 'utf-8');
        console.log(`  ✓ Файл прочитан (${content.length} символов)`);

        // Шаг 2: Парсинг
        const parseResult = parser.parse(content);
        if (parseResult instanceof ParseError) {
            throw new Error(`Ошибка парсинга: ${parseResult.error}`);
        }
        console.log(`  ✓ Парсинг успешен`);

        // Шаг 3: Маппинг
        const board = mapper.map(parseResult as any);
        console.log(`  ✓ Маппинг успешен (доска ${board.points.length}x${board.points[0]?.length || 0})`);

        // Шаг 4: Рендеринг
        const svgContent = renderer.render(board, createRenderParams());
        console.log(`  ✓ Рендеринг успешен`);

        // Шаг 5: Добавление стилей в SVG (по умолчанию светлая тема)
        addStylesToSVG(svgContent, 'light');
        console.log(`  ✓ Стили добавлены в SVG`);

        // Шаг 6: Сохранение SVG
        fs.writeFileSync(svgFilePath, new XMLSerializer().serializeToString(svgContent), 'utf-8');
        console.log(`  ✓ SVG сохранен: ${path.basename(svgFilePath)}`);

    } catch (error) {
        console.error(`  ✗ Ошибка при обработке ${fileName}:`, error instanceof Error ? error.message : error);
        console.log(`  → Переход к следующему файлу`);
    }
    
    console.log(''); // Пустая строка для разделения
}

/**
 * Конвертирует SVG в PNG используя sharp
 */
async function convertSvgToPng(svgPath: string, pngPath: string): Promise<void> {
    try {
        await sharp(svgPath)
            .png()
            .toFile(pngPath);
        console.log(`  ✓ PNG создан: ${path.basename(pngPath)}`);
    } catch (error) {
        console.error(`  ✗ Ошибка конвертации SVG в PNG:`, error instanceof Error ? error.message : error);
    }
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
