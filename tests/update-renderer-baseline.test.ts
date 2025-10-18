import * as fs from 'fs';
import * as path from 'path';
import { Parser } from '../src/parser';
import { Mapper } from '../src/mapper';
import { Renderer } from '../src/renderer';
import { ParseError, RenderParams } from '../src/models';

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
    let renderer: Renderer;

    beforeEach(() => {
        parser = new Parser();
        mapper = new Mapper();
        renderer = new Renderer();
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
        const svgContent = renderer.render(board, new RenderParams());
        console.log(`  ✓ Рендеринг успешен`);

        // Шаг 5: Сохранение SVG
        fs.writeFileSync(svgFilePath, new XMLSerializer().serializeToString(svgContent), 'utf-8');
        console.log(`  ✓ SVG сохранен: ${path.basename(svgFilePath)}`);

    } catch (error) {
        console.error(`  ✗ Ошибка при обработке ${fileName}:`, error instanceof Error ? error.message : error);
        console.log(`  → Переход к следующему файлу`);
    }
    
    console.log(''); // Пустая строка для разделения
}
