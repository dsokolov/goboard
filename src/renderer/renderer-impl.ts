import { Board, PointContent, RenderParams } from "./data";
import { Renderer } from "./renderer";

export class RendererImpl implements Renderer {

    private getFontSizeFromCSS(): number {
        // Получаем размер шрифта из CSS переменных Obsidian
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        
        // Пытаемся получить размер шрифта из CSS переменной
        const fontSizeVar = computedStyle.getPropertyValue('--font-text-size').trim();
        if (fontSizeVar) {
            const fontSize = parseFloat(fontSizeVar);
            if (!isNaN(fontSize)) {
                return fontSize;
            }
        }
        
        // Fallback: получаем размер шрифта из body
        const bodyStyle = getComputedStyle(document.body);
        const bodyFontSize = parseFloat(bodyStyle.fontSize);
        return isNaN(bodyFontSize) ? 16 : bodyFontSize;
    }

    render(source: Board, params: RenderParams): SVGElement {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        
        // Получаем размер шрифта из CSS для адаптивного размера доски
        const fontSize = this.getFontSizeFromCSS();
        const boardSize = source.points.length;
        
        // Рассчитываем размер доски на основе размера шрифта
        // Минимальный размер клетки должен быть в 2-3 раза больше размера шрифта
        const minCellSize = fontSize * 2.5;
        const calculatedSize = Math.max(minCellSize * (boardSize - 1), 200); // Минимум 200px
        
        const totalWidth = Math.max(params.width, calculatedSize);
        const totalHeight = Math.max(params.height, calculatedSize);
        
        // Base padding on all sides
        const basePadding = 0;
        svg.setAttribute('width', totalWidth.toString());
        svg.setAttribute('height', totalHeight.toString());
        svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
        svg.classList.add('go-board-svg');

        // Фон доски должен покрывать всю область SVG, чтобы поля были того же цвета
        const background = this.renderBackground(totalWidth, totalHeight);
        svg.appendChild(background);

        // Добавляем линии доски

        // Preliminary step assuming symmetric base padding to estimate sizes
        const prelimInnerWidth = totalWidth - 2 * basePadding;
        const prelimInnerHeight = totalHeight - 2 * basePadding;
        const prelimStepX = boardSize > 1 ? prelimInnerWidth / (boardSize - 1) : 0;
        const prelimStepY = boardSize > 1 ? prelimInnerHeight / (boardSize - 1) : 0;

        // Estimate coordinate font sizes - используем размер шрифта из CSS для координат
        const estNumFont = Math.max(fontSize, prelimStepY * 0.4);
        const estLetFont = Math.max(fontSize, prelimStepX * 0.4);

        // Desired extra space from grid to label: one step plus small extra
        const smallExtra = Math.max(6, Math.round(Math.min(prelimStepX, prelimStepY) * 0.1));
        const desiredLeftGap = prelimStepX + smallExtra; // horizontal gap from first vertical line to numbers
        const desiredBottomGap = prelimStepY + smallExtra; // vertical gap from bottom horizontal line to letters

        // Compute directional paddings to fit labels fully (account for label width/height via font size)
        const paddingLeft = basePadding + (source.showCoordinates ? Math.ceil(Math.max(estNumFont + 4, desiredLeftGap + 4)) : 0);
        const paddingBottom = basePadding + (source.showCoordinates ? Math.ceil(Math.max(estLetFont + 4, desiredBottomGap + 4)) : 0);
        // Make top and right paddings equal to bottom/left for visual symmetry
        const paddingRight = paddingLeft;
        const paddingTop = paddingBottom;

        // Final steps with asymmetric paddings
        const innerWidth = totalWidth - paddingLeft - paddingRight;
        const innerHeight = totalHeight - paddingTop - paddingBottom;
        const stepX = boardSize > 1 ? innerWidth / (boardSize - 1) : 0;
        const stepY = boardSize > 1 ? innerHeight / (boardSize - 1) : 0;

        for (let i = 0; i < boardSize; i++) {
            const xPos = paddingLeft + i * stepX;
            const yPos = paddingTop + i * stepY;
            const vLine = this.renderVerticalLines(paddingTop, totalHeight - paddingBottom, xPos);
            svg.appendChild(vLine);
            const hLine = this.renderHorizontalLines(paddingLeft, totalWidth - paddingRight, yPos);
            svg.appendChild(hLine);
        }

        // Хоси (звездные точки)
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize; x++) {
                const point = source.points[y][x];
                if (point.hasHoshi) {
                    // Инвертируем y-координату: y=0 должна быть внизу, y=boardSize-1 вверху
                    const invertedY = boardSize - 1 - y;
                    const hoshi = this.renderHoshi(paddingLeft, paddingTop, stepX, stepY, x, invertedY);
                    svg.appendChild(hoshi);
                }
            }
        }

        // Добавляем камни
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize; x++) {
                const point = source.points[y][x];
                if (point.content !== PointContent.Empty) {
                    // Инвертируем y-координату: y=0 должна быть внизу, y=boardSize-1 вверху
                    const invertedY = boardSize - 1 - y;
                    const circle = this.renderStone(
                        paddingLeft, paddingTop, stepX, stepY, x, invertedY, point.content,
                        params.stoneSize, params.isDarkTheme
                    );
                    svg.appendChild(circle);
                }
            }
        }

        // Координаты: цифры слева, буквы снизу
        if (source.showCoordinates) {
            // Use the final step sizes to position labels exactly one grid step away
            this.renderLeftNumbers(svg, paddingLeft, stepX, stepY, boardSize, paddingTop);
            this.renderBottomLetters(svg, paddingLeft, stepY, stepX, boardSize, totalHeight, paddingBottom);
        }

        return svg;
    }

    private renderStone(
        paddingLeft: number,
        paddingTop: number,
        stepX: number,
        stepY: number,
        x: number,
        y: number,
        cell: PointContent,
        stoneSizeFraction: number,
        isDarkTheme: boolean
    ) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const cx = paddingLeft + x * stepX;
        const cy = paddingTop + y * stepY;
        circle.setAttribute('cx', cx.toString());
        circle.setAttribute('cy', cy.toString());
        const diameter = Math.min(stepX, stepY) * stoneSizeFraction;
        const radius = diameter / 2;
        circle.setAttribute('r', radius.toString());

        if (cell === PointContent.Black) {
            if (isDarkTheme) {
                // В тёмной теме чёрный камень должен быть тёмным с контрастным светлым контуром
                circle.setAttribute('fill', 'var(--background-primary, #1e1e1e)');
                circle.setAttribute('stroke', 'var(--text-normal, #dcddde)');
                circle.setAttribute('stroke-width', '1.5');
            } else {
                // В светлой теме чёрный камень без контура (хорошо виден на светлом фоне)
                circle.setAttribute('fill', 'var(--text-normal, #2c2c2c)');
                circle.setAttribute('stroke', 'none');
            }
        } else if (cell === PointContent.White) {
            if (isDarkTheme) {
                // В тёмной теме белый камень без контура (хорошо виден на тёмном фоне)
                circle.setAttribute('fill', 'var(--text-normal, #dcddde)');
                circle.setAttribute('stroke', 'none');
            } else {
                // В светлой теме белый камень должен быть светлым с контрастным тёмным контуром
                circle.setAttribute('fill', 'var(--background-primary, #ffffff)');
                circle.setAttribute('stroke', 'var(--text-normal, #2c2c2c)');
                circle.setAttribute('stroke-width', '1.5');
            }
        }
        return circle;
    }

    private renderHoshi(
        paddingLeft: number,
        paddingTop: number,
        stepX: number,
        stepY: number,
        x: number,
        y: number
    ) {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const cx = paddingLeft + x * stepX;
        const cy = paddingTop + y * stepY;
        const radius = Math.max(2, Math.min(stepX, stepY) * 0.06);
        dot.setAttribute('cx', cx.toString());
        dot.setAttribute('cy', cy.toString());
        dot.setAttribute('r', radius.toString());
        dot.setAttribute('fill', 'var(--text-muted, #8a8a8a)');
        return dot;
    }

    private renderHorizontalLines(xStart: number, xEnd: number, yPos: number) {
        const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hLine.setAttribute('x1', xStart.toString());
        hLine.setAttribute('y1', yPos.toString());
        hLine.setAttribute('x2', xEnd.toString());
        hLine.setAttribute('y2', yPos.toString());
        hLine.setAttribute('stroke', 'var(--text-muted, #8a8a8a)');
        hLine.setAttribute('stroke-width', '1');
        return hLine;
    }

    private renderVerticalLines(yStart: number, yEnd: number, xPos: number) {
        const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vLine.setAttribute('x1', xPos.toString());
        vLine.setAttribute('y1', yStart.toString());
        vLine.setAttribute('x2', xPos.toString());
        vLine.setAttribute('y2', yEnd.toString());
        vLine.setAttribute('stroke', 'var(--text-muted, #8a8a8a)');
        vLine.setAttribute('stroke-width', '1');
        return vLine;
    }

    private renderBackground(totalWidth: number, totalHeight: number) {
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('x', '0');
        background.setAttribute('y', '0');
        background.setAttribute('width', totalWidth.toString());
        background.setAttribute('height', totalHeight.toString());
        // Используем CSS переменную для цвета доски
        background.setAttribute('fill', 'var(--background-primary,rgb(210, 15, 15))');
        return background;
    }

    private renderLeftNumbers(svg: SVGElement, paddingLeft: number, stepX: number, stepY: number, boardSize: number, paddingTop: number) {
        const fontSize = this.getFontSizeFromCSS();
        for (let i = 0; i < boardSize; i++) {
            // Инвертируем позицию: i=0 должна быть внизу (строка 1), i=boardSize-1 вверху (строка 9)
            const invertedI = boardSize - 1 - i;
            const yPos = paddingTop + invertedI * stepY;
            const label = (i + 1).toString();
            // Place numbers slightly less than one step away from the first vertical line
            const gap = stepX * 0.75 + Math.max(4, fontSize * 0.15);
            const x = (paddingLeft - gap);
            const text = this.renderCoordinateSymbol(x, yPos, label, fontSize, 'end', 'middle');
            svg.appendChild(text);
        }
    }

    private renderBottomLetters(svg: SVGElement, paddingLeft: number, stepY: number, stepX: number, boardSize: number, totalHeight: number, paddingBottom: number) {
        const fontSize = this.getFontSizeFromCSS();
        for (let i = 0; i < boardSize; i++) {
            const xPos = paddingLeft + i * stepX;
            const label = String.fromCharCode('A'.charCodeAt(0) + i);
            // Place letters slightly less than one step away from the bottom horizontal line
            const gap = stepY * 0.75 + Math.max(4, fontSize * 0.15);
            const y = (totalHeight - paddingBottom + gap);
            const text = this.renderCoordinateSymbol(xPos, y, label, fontSize, 'middle', 'hanging');
            svg.appendChild(text);
        }
    }

    private renderCoordinateSymbol(
        x: number,
        y: number,
        label: string,
        fontSize: number,
        textAnchor: 'start' | 'middle' | 'end',
        dominantBaseline: 'auto' | 'text-bottom' | 'alphabetic' | 'ideographic' | 'middle' | 'central' | 'mathematical' | 'hanging' | 'text-top' | 'bottom' | 'center' | 'top'
    ): SVGElement {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x.toString());
        text.setAttribute('y', y.toString());
        text.setAttribute('text-anchor', textAnchor);
        text.setAttribute('dominant-baseline', dominantBaseline);
        // Используем CSS переменные для размера и семейства шрифтов, как в основном тексте
        text.setAttribute('style', `
            font-size: var(--font-text-size, ${fontSize}px) !important;
            font-family: var(--font-text, inherit) !important;
            fill: var(--text-normal, #dcddde) !important;
        `);
        text.textContent = label;
        return text;
    }
}