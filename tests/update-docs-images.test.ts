import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp = require('sharp');
import { Parser } from '../src/parser';
import { Mapper } from '../src/mapper';
import { Renderer } from '../src/renderer';
import { createRenderParams } from '../src/models';
import { addStylesToSVG } from './render-utils';

/**
 * Скрипт для обновления изображений в документации
 * Обрабатывает все markdown файлы из docs каталога
 * Находит специальные теги <!-- goboard: ... --> и соответствующие блоки кода
 * Рендерит изображения для светлой и тёмной тем
 * Обновляет ссылки на изображения в markdown файлах
 * 
 * Запуск: npm run update-docs
 */

interface GoboardImageConfig {
    name: string;
    width?: number;
    height?: number;
}

interface GoboardBlock {
    config: GoboardImageConfig;
    codeBlock: string;
    tagLineIndex: number;
    codeBlockStartIndex: number;
    codeBlockEndIndex: number;
}

describe('Update Docs Images', () => {
    let parser: Parser;
    let mapper: Mapper;
    let renderer: Renderer;

    beforeEach(() => {
        parser = new Parser();
        mapper = new Mapper();
        renderer = new Renderer();
    });

    it('должен обновить изображения в документации - обработать все markdown файлы и создать PNG файлы для светлой и тёмной тем', async () => {
        const projectRoot = path.join(__dirname, '..');
        const docsDir = path.join(projectRoot, 'docs');
        const imagesDir = path.join(docsDir, 'images');
        
        // Создаем каталог для изображений если он не существует
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }
        
        // Получаем все markdown файлы из docs и корня проекта
        const mdFiles = [
            ...getMarkdownFiles(docsDir),
            ...getMarkdownFiles(projectRoot),
        ];
        
        if (mdFiles.length === 0) {
            return;
        }

        // Обрабатываем каждый markdown файл
        for (const mdFile of mdFiles) {
            await processMarkdownFile(mdFile, parser, mapper, renderer, imagesDir);
        }
    });
});

/**
 * Получает список всех markdown файлов в указанном каталоге
 */
function getMarkdownFiles(dir: string): string[] {
    try {
        const files = fs.readdirSync(dir);
        return files
            .filter(file => file.endsWith('.md'))
            .map(file => path.join(dir, file));
    } catch (error) {
        return [];
    }
}

/**
 * Обрабатывает один markdown файл
 */
async function processMarkdownFile(
    mdFilePath: string,
    parser: Parser,
    mapper: Mapper,
    renderer: Renderer,
    imagesDir: string
): Promise<void> {
    try {
        // Читаем содержимое файла
        const content = fs.readFileSync(mdFilePath, 'utf-8');
        const lines = content.split('\n');
        
        // Находим все блоки goboard
        const blocks = findGoboardBlocks(lines);
        
        if (blocks.length === 0) {
            return;
        }
        
        // Обрабатываем каждый блок
        for (const block of blocks) {
            await processGoboardBlock(block, parser, mapper, renderer, imagesDir);
        }
        
        // Обновляем ссылки на изображения в файле
        const updatedContent = updateImageLinks(lines, blocks, imagesDir, mdFilePath);
        
        // Сохраняем обновленный файл
        fs.writeFileSync(mdFilePath, updatedContent.join('\n'), 'utf-8');
        
    } catch (error) {
        console.error(`Ошибка при обработке файла ${mdFilePath}:`, error);
    }
}

/**
 * Находит все блоки goboard в markdown файле
 */
function findGoboardBlocks(lines: string[]): GoboardBlock[] {
    const blocks: GoboardBlock[] = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Ищем тег <!-- goboard: ... -->
        const tagMatch = line.match(/<!--\s*goboard:\s*(.+?)\s*-->/);
        if (!tagMatch) {
            continue;
        }
        
        // Парсим конфигурацию из тега
        const config = parseGoboardConfig(tagMatch[1]);
        
        // Ищем следующий блок кода goboard
        const codeBlock = findNextGoboardCodeBlock(lines, i);
        if (!codeBlock) {
            continue;
        }
        
        blocks.push({
            config,
            codeBlock: codeBlock.content,
            tagLineIndex: i,
            codeBlockStartIndex: codeBlock.startIndex,
            codeBlockEndIndex: codeBlock.endIndex,
        });
    }
    
    return blocks;
}

/**
 * Парсит конфигурацию из тега goboard
 */
function parseGoboardConfig(configStr: string): GoboardImageConfig {
    const config: GoboardImageConfig = {
        name: '',
    };
    
    // Парсим имя и параметры
    const parts = configStr.split(',').map(p => p.trim());
    config.name = parts[0];
    
    // Парсим дополнительные параметры
    for (let i = 1; i < parts.length; i++) {
        const param = parts[i];
        const match = param.match(/(\w+)=(\d+)/);
        if (match) {
            const key = match[1];
            const value = parseInt(match[2], 10);
            if (key === 'width') {
                config.width = value;
            } else if (key === 'height') {
                config.height = value;
            }
        }
    }
    
    return config;
}

/**
 * Находит следующий блок кода goboard после указанной строки
 */
function findNextGoboardCodeBlock(lines: string[], startIndex: number): { content: string; startIndex: number; endIndex: number } | null {
    let inPreBlock = false;
    let inGoboardBlock = false;
    let goboardStartIndex = -1;
    let goboardEndIndex = -1;
    let goboardContent: string[] = [];
    
    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Проверяем начало блока <pre>
        if (trimmedLine === '<pre>') {
            inPreBlock = true;
            continue;
        }
        
        // Проверяем конец блока </pre>
        if (trimmedLine === '</pre>') {
            if (inGoboardBlock) {
                // Если мы в goboard блоке, но не нашли закрывающий ```, это ошибка
                // Но все равно возвращаем то, что нашли
                if (goboardContent.length > 0 && goboardStartIndex >= 0) {
                    goboardEndIndex = i - 1; // Конец блока - последняя строка перед </pre>
                    break;
                }
            }
            inPreBlock = false;
            continue;
        }
        
        // Если мы в блоке <pre>, ищем начало goboard блока
        if (inPreBlock && trimmedLine.includes('```goboard')) {
            inGoboardBlock = true;
            goboardStartIndex = i;
            
            // Проверяем, не закрывается ли блок на той же строке
            const parts = trimmedLine.split('```');
            if (parts.length > 2 && parts[parts.length - 1].trim() === '') {
                // Блок закрывается на той же строке
                const content = trimmedLine.replace(/```goboard\s*/, '').replace(/```\s*$/, '').trim();
                if (content) {
                    goboardContent.push(content);
                }
                goboardEndIndex = i;
                break;
            }
            continue;
        }
        
        // Если мы в goboard блоке, собираем содержимое
        if (inGoboardBlock) {
            // Проверяем конец goboard блока
            if (trimmedLine === '```' || trimmedLine.startsWith('```')) {
                goboardEndIndex = i;
                break;
            }
            goboardContent.push(line);
        }
    }
    
    if (goboardStartIndex >= 0 && goboardEndIndex >= 0) {
        return {
            content: goboardContent.join('\n'),
            startIndex: goboardStartIndex,
            endIndex: goboardEndIndex,
        };
    }
    
    return null;
}

/**
 * Обрабатывает один блок goboard: рендерит изображения
 */
async function processGoboardBlock(
    block: GoboardBlock,
    parser: Parser,
    mapper: Mapper,
    renderer: Renderer,
    imagesDir: string
): Promise<void> {
    try {
        // Парсинг
        const parseResult = parser.parse(block.codeBlock);
        if (parseResult.errors.length > 0) {
            const errorMessages = parseResult.errors.map(e => `Line ${e.line}: ${e.message}`).join(', ');
            throw new Error(`Ошибка парсинга: ${errorMessages}`);
        }

        // Маппинг
        const board = mapper.map(parseResult);

        // Параметры рендеринга
        const renderParams = createRenderParams({
            width: block.config.width,
            height: block.config.height,
        });

        // Рендеринг для светлой темы
        const lightSvgContent = renderer.render(board, renderParams);
        addStylesToSVG(lightSvgContent, 'light');
        
        // Конвертация SVG в PNG для светлой темы (без сохранения SVG)
        const lightPngPath = path.join(imagesDir, `${block.config.name}-light.png`);
        await convertSvgToPngInMemory(lightSvgContent, lightPngPath);

        // Рендеринг для тёмной темы
        const darkSvgContent = renderer.render(board, renderParams);
        addStylesToSVG(darkSvgContent, 'dark');
        
        // Конвертация SVG в PNG для тёмной темы (без сохранения SVG)
        const darkPngPath = path.join(imagesDir, `${block.config.name}-dark.png`);
        await convertSvgToPngInMemory(darkSvgContent, darkPngPath);

    } catch (error) {
        console.error(`Ошибка при обработке блока ${block.config.name}:`, error);
    }
}

/**
 * Обновляет ссылки на изображения в markdown файле
 */
function updateImageLinks(lines: string[], blocks: GoboardBlock[], imagesDir: string, mdFilePath: string): string[] {
    const updatedLines = [...lines];
    
    // Определяем путь к изображениям в зависимости от расположения файла
    const mdFileDir = path.dirname(mdFilePath);
    const projectRoot = path.resolve(__dirname, '..');
    const docsDir = path.join(projectRoot, 'docs');
    
    // Проверяем, находится ли файл в docs директории
    // path.relative возвращает путь относительно docsDir, если файл внутри docs - путь не начинается с ..
    const relativePath = path.relative(docsDir, mdFileDir);
    const isInDocs = relativePath !== '' && !relativePath.startsWith('..');
    
    // Если файл в корне проекта, используем docs/images
    // Если файл в docs, используем images
    const imagesBasePath = isInDocs ? 'images' : 'docs/images';
    
    // Обрабатываем блоки в обратном порядке, чтобы индексы не сбились
    for (let blockIndex = blocks.length - 1; blockIndex >= 0; blockIndex--) {
        const block = blocks[blockIndex];
        const imageName = block.config.name;
        
        // Ищем ссылки на изображения после блока кода (до следующего заголовка или до конца файла)
        const searchStartIndex = block.codeBlockEndIndex + 1;
        let searchEndIndex = updatedLines.length;
        
        // Ищем следующий заголовок или конец файла
        for (let i = searchStartIndex; i < updatedLines.length; i++) {
            const trimmedLine = updatedLines[i].trim();
            if (trimmedLine.startsWith('#')) {
                searchEndIndex = i;
                break;
            }
        }
        
        let foundLightLink = false;
        let foundDarkLink = false;
        let foundGenericLink = false;
        let lightLinkIndex = -1;
        let darkLinkIndex = -1;
        let genericLinkIndex = -1;
        
        // Проверяем существующие ссылки
        for (let i = searchStartIndex; i < searchEndIndex; i++) {
            const line = updatedLines[i];
            // Ищем ссылки на изображения с именем блока
            if (line.match(/!\[.*\]\(.*\)/)) {
                if (line.includes(`${imageName}-light.png`)) {
                    foundLightLink = true;
                    lightLinkIndex = i;
                } else if (line.includes(`${imageName}-dark.png`)) {
                    foundDarkLink = true;
                    darkLinkIndex = i;
                } else if (line.includes(`${imageName}.png`) && !line.includes('-light') && !line.includes('-dark')) {
                    foundGenericLink = true;
                    genericLinkIndex = i;
                }
            }
        }
        
        // Обновляем или создаем ссылки
        const lightImagePath = `${imagesBasePath}/${imageName}-light.png`;
        const darkImagePath = `${imagesBasePath}/${imageName}-dark.png`;
        
        // Если найдена общая ссылка без суффикса, заменяем её на две ссылки
        if (foundGenericLink && genericLinkIndex >= 0) {
            const genericLine = updatedLines[genericLinkIndex];
            const altTextMatch = genericLine.match(/!\[([^\]]*)\]/);
            const altText = altTextMatch ? altTextMatch[1] : imageName;
            
            // Заменяем общую ссылку на светлую
            updatedLines[genericLinkIndex] = `![${altText} (light theme)](${lightImagePath}#gh-light-mode-only)`;
            // Добавляем тёмную ссылку после
            updatedLines.splice(genericLinkIndex + 1, 0, `![${altText} (dark theme)](${darkImagePath}#gh-dark-mode-only)`);
            foundLightLink = true;
            foundDarkLink = true;
            lightLinkIndex = genericLinkIndex;
            darkLinkIndex = genericLinkIndex + 1;
        } else {
            // Обновляем или создаем ссылку на светлую тему
            if (foundLightLink && lightLinkIndex >= 0) {
                const lightLine = updatedLines[lightLinkIndex];
                const altTextMatch = lightLine.match(/!\[([^\]]*)\]/);
                const altText = altTextMatch ? altTextMatch[1].replace(/ \(light theme\)| \(dark theme\)/g, '') : imageName;
                updatedLines[lightLinkIndex] = `![${altText} (light theme)](${lightImagePath}#gh-light-mode-only)`;
            } else {
                // Добавляем новую ссылку на светлую тему после блока кода
                const insertIndex = block.codeBlockEndIndex + 1;
                updatedLines.splice(insertIndex, 0, `![${imageName} (light theme)](${lightImagePath}#gh-light-mode-only)`);
                lightLinkIndex = insertIndex;
                // Корректируем индексы для следующей ссылки
                if (foundDarkLink) darkLinkIndex++;
            }
            
            // Обновляем или создаем ссылку на тёмную тему
            if (foundDarkLink && darkLinkIndex >= 0) {
                const darkLine = updatedLines[darkLinkIndex];
                const altTextMatch = darkLine.match(/!\[([^\]]*)\]/);
                const altText = altTextMatch ? altTextMatch[1].replace(/ \(light theme\)| \(dark theme\)/g, '') : imageName;
                updatedLines[darkLinkIndex] = `![${altText} (dark theme)](${darkImagePath}#gh-dark-mode-only)`;
            } else {
                // Добавляем новую ссылку на тёмную тему после ссылки на светлую тему
                const insertIndex = (foundLightLink && lightLinkIndex >= 0) ? lightLinkIndex + 1 : block.codeBlockEndIndex + 1;
                updatedLines.splice(insertIndex, 0, `![${imageName} (dark theme)](${darkImagePath}#gh-dark-mode-only)`);
            }
        }
    }
    
    return updatedLines;
}

/**
 * Конвертирует SVG элемент в PNG используя sharp (без сохранения промежуточного SVG файла)
 */
async function convertSvgToPngInMemory(svg: SVGElement, pngPath: string): Promise<void> {
    try {
        // Сериализуем SVG в строку
        const svgString = new XMLSerializer().serializeToString(svg);
        
        // Конвертируем SVG строку напрямую в PNG
        await sharp(Buffer.from(svgString))
            .png()
            .toFile(pngPath);
    } catch (error) {
        console.error(`Ошибка при конвертации SVG в ${pngPath}:`, error);
    }
}

