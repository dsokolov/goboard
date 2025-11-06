import * as fs from 'fs';
import * as path from 'path';
const sharp = require('sharp');
import { Parser } from '../src/parser';
import { Mapper } from '../src/mapper';
import { Renderer } from '../src/renderer';
import { ParseResult, createRenderParams } from '../src/models';
import { addStylesToSVG } from './render-utils';

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
            console.log('Не найдено txt файлов для обработки');
            return;
        }

        console.log(`Найдено ${txtFiles.length} файлов для обработки`);
        
        // Обрабатываем каждый файл для обеих тем
        for (const txtFile of txtFiles) {
            await processFileForThemes(txtFile, parser, mapper, renderer, baselineDir);
        }
        
        console.log(`Обработка завершена. Обновлено файлов: ${txtFiles.length}`);

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
            .map(file => path.join(dir, file))
            .filter(filePath => fs.existsSync(filePath)); // Проверяем существование файла
    } catch (error) {
        return [];
    }
}

/**
 * Обрабатывает один txt файл для обеих тем
 */
async function processFileForThemes(txtFilePath: string, parser: Parser, mapper: Mapper, renderer: Renderer, baselineDir: string): Promise<void> {
    const fileName = path.basename(txtFilePath);
    const baseFileName = fileName.replace('.txt', '');
    
    try {
        console.log(`Обработка файла: ${fileName}`);
        
        // Шаг 1: Читаем содержимое файла
        const content = fs.readFileSync(txtFilePath, 'utf-8');

        // Шаг 2: Парсинг
        const parseResult = parser.parse(content);
        if (parseResult.errors.length > 0) {
            const errorMessages = parseResult.errors.map(e => `Line ${e.line}: ${e.message}`).join(', ');
            throw new Error(`Ошибка парсинга: ${errorMessages}`);
        }

        // Шаг 3: Маппинг
        const board = mapper.map(parseResult);

        // Шаг 4: Рендеринг для светлой темы
        const lightSvgContent = renderer.render(board, createRenderParams());
        addStylesToSVG(lightSvgContent, 'light');
        const lightSvgPath = path.join(baselineDir, `${baseFileName}-light.svg`);
        fs.writeFileSync(lightSvgPath, new XMLSerializer().serializeToString(lightSvgContent), 'utf-8');

        // Шаг 4.1: Конвертация SVG в PNG для светлой темы
        const lightPngPath = path.join(baselineDir, `${baseFileName}-light.png`);
        await convertSvgToPng(lightSvgPath, lightPngPath);

        // Шаг 5: Рендеринг для тёмной темы
        const darkSvgContent = renderer.render(board, createRenderParams());
        addStylesToSVG(darkSvgContent, 'dark');
        const darkSvgPath = path.join(baselineDir, `${baseFileName}-dark.svg`);
        fs.writeFileSync(darkSvgPath, new XMLSerializer().serializeToString(darkSvgContent), 'utf-8');

        // Шаг 5.1: Конвертация SVG в PNG для тёмной темы
        const darkPngPath = path.join(baselineDir, `${baseFileName}-dark.png`);
        await convertSvgToPng(darkSvgPath, darkPngPath);
        
        console.log(`  ✓ Обновлены файлы для ${baseFileName} (light и dark темы)`);

    } catch (error) {
        // Пропускаем файл при ошибке и выводим предупреждение
        console.warn(`  ✗ Пропущен файл ${fileName}: ${error instanceof Error ? error.message : String(error)}`);
    }

}

/**
 * Обрабатывает один txt файл (старая функция для обратной совместимости)
 */
async function processFile(txtFilePath: string, parser: Parser, mapper: Mapper, renderer: Renderer): Promise<void> {
    const fileName = path.basename(txtFilePath);
    const svgFilePath = txtFilePath.replace('.txt', '.svg');
    
    try {
        // Шаг 1: Читаем содержимое файла
        const content = fs.readFileSync(txtFilePath, 'utf-8');

        // Шаг 2: Парсинг
        const parseResult = parser.parse(content);
        if (parseResult.errors.length > 0) {
            const errorMessages = parseResult.errors.map(e => `Line ${e.line}: ${e.message}`).join(', ');
            throw new Error(`Ошибка парсинга: ${errorMessages}`);
        }

        // Шаг 3: Маппинг
        const board = mapper.map(parseResult);

        // Шаг 4: Рендеринг
        const svgContent = renderer.render(board, createRenderParams());

        // Шаг 5: Добавление стилей в SVG (по умолчанию светлая тема)
        addStylesToSVG(svgContent, 'light');

        // Шаг 6: Сохранение SVG
        fs.writeFileSync(svgFilePath, new XMLSerializer().serializeToString(svgContent), 'utf-8');

    } catch (error) {
        // Пропускаем файл при ошибке
    }

}

/**
 * Конвертирует SVG в PNG используя sharp
 */
async function convertSvgToPng(svgPath: string, pngPath: string): Promise<void> {
    try {
        await sharp(svgPath)
            .png()
            .toFile(pngPath);
    } catch (error) {
        // Пропускаем PNG при ошибке
    }
}

