import * as fs from 'fs';
import * as path from 'path';
import { createParser } from '../src/parser/parser';
import { createMapper } from '../src/mapper/mapper';
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

async function main() {
    console.log('=== Обновление бейзлайна рендерера ===\n');
    
    const parser = createParser();
    const mapper = createMapper();
    const renderer = createRenderer();
    console.log('Debug: Renderer created:', typeof renderer);
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
}

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
async function processFile(txtFilePath: string, parser: any, mapper: any, renderer: any): Promise<void> {
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
        const svgElement = renderer.parse(board);
        const svgContent = new XMLSerializer().serializeToString(svgElement);
        console.log(`  ✓ Рендеринг успешен`);
        console.log(`  Debug: SVG content preview: ${svgContent.substring(0, 100)}...`);

        // Шаг 5: Сохранение SVG
        fs.writeFileSync(svgFilePath, svgContent, 'utf-8');
        console.log(`  ✓ SVG сохранен: ${path.basename(svgFilePath)}`);

    } catch (error) {
        console.error(`  ✗ Ошибка при обработке ${fileName}:`, error instanceof Error ? error.message : error);
        console.log(`  → Переход к следующему файлу`);
    }
    
    console.log(''); // Пустая строка для разделения
}


// Запускаем main функцию
main().catch(error => {
    console.error('Ошибка выполнения скрипта:', error);
    process.exit(1);
});
