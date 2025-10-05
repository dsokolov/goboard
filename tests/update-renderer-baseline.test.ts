import * as fs from 'fs';
import * as path from 'path';
import { createParser, Parser } from '../src/parser/parser';
import { createMapper, Mapper } from '../src/mapper/mapper';
import { createRenderer } from '../src/renderer/renderer';
import { ParseError } from '../src/parser/data';

/**
 * Скрипт для обновления бейзлайна рендерера
 * Обрабатывает все txt файлы из test-data каталога
 * Последовательно запускает parser -> mapper -> renderer
 * Сохраняет результат как SVG файл (бейзлайн)
 * 
 * Запуск: npm run update-baseline
 */

describe('Update Renderer Baseline', () => {
    let parser: Parser;
    let mapper: Mapper;
    let renderer: any;

    beforeEach(() => {
        parser = createParser();
        mapper = createMapper();
        renderer = createRenderer();
    });

    it('должен обновить бейзлайн рендерера - обработать все txt файлы и создать SVG файлы', async () => {
        const testDataDir = path.join(__dirname, 'test-data');
        
        // Получаем все txt файлы
        const txtFiles = getTxtFiles(testDataDir);
        
        if (txtFiles.length === 0) {
            console.log('Не найдено txt файлов в каталоге test-data');
            return;
        }

        console.log(`\n=== Обработка ${txtFiles.length} txt файлов ===\n`);

        // Обрабатываем каждый файл
        for (const txtFile of txtFiles) {
            await processFile(txtFile, parser, mapper, renderer);
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
 * Обрабатывает один txt файл
 */
async function processFile(txtFilePath: string, parser: Parser, mapper: Mapper, renderer: any): Promise<void> {
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
        console.log(`  ✓ Маппинг успешен (доска ${board.cells.length}x${board.cells[0]?.length || 0})`);

        // Шаг 4: Рендеринг
        const svgContent = generateSVG(board);
        console.log(`  ✓ Рендеринг успешен`);

        // Шаг 5: Сохранение SVG
        fs.writeFileSync(svgFilePath, svgContent, 'utf-8');
        console.log(`  ✓ SVG сохранен: ${path.basename(svgFilePath)}`);

    } catch (error) {
        console.error(`  ✗ Ошибка при обработке ${fileName}:`, error instanceof Error ? error.message : error);
        console.log(`  → Переход к следующему файлу`);
    }
    
    console.log(''); // Пустая строка для разделения
}

/**
 * Генерирует SVG строку для доски
 */
function generateSVG(board: any): string {
    const boardSize = board.cells.length;
    const cellSize = 20;
    const padding = 20;
    const totalSize = padding * 2 + (boardSize - 1) * cellSize;
    
    let svg = `<svg width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Фон доски
    svg += `<rect x="${padding}" y="${padding}" width="${totalSize - padding * 2}" height="${totalSize - padding * 2}" fill="#DCB35C"/>`;
    
    // Линии доски
    for (let i = 0; i < boardSize; i++) {
        const pos = padding + i * cellSize;
        
        // Вертикальные линии
        svg += `<line x1="${pos}" y1="${padding}" x2="${pos}" y2="${totalSize - padding}" stroke="#000000" stroke-width="1"/>`;
        
        // Горизонтальные линии
        svg += `<line x1="${padding}" y1="${pos}" x2="${totalSize - padding}" y2="${pos}" stroke="#000000" stroke-width="1"/>`;
    }
    
    // Камни
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            const cell = board.cells[y][x];
            if (cell !== 'empty') {
                const cx = padding + x * cellSize;
                const cy = padding + y * cellSize;
                const r = 8;
                
                let fill = '#000000';
                let stroke = '#000000';
                
                if (cell === 'white') {
                    fill = '#FFFFFF';
                    stroke = '#000000';
                }
                
                svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
            }
        }
    }
    
    svg += '</svg>';
    return svg;
}
