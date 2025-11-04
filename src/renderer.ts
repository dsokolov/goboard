import { Board, PointContent, RenderParams } from "./models";
import { indexToLetter } from "./utils";

type TextAnchor = 'start' | 'middle' | 'end';
type DominantBaseline = 'auto' | 'text-bottom' | 'alphabetic' | 'ideographic' | 'middle' | 'central' | 'mathematical' | 'hanging' | 'text-top' | 'bottom' | 'center' | 'top';

export class Renderer {

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
        const boardWidth = source.points[0]?.length ?? boardSize;
        const fullLeft = 0;
        const fullTop = 0;
        const fullRight = boardWidth - 1;
        const fullBottom = boardSize - 1;
        const boundLeft = Math.max(fullLeft, Math.min(source.boundLeft, fullRight));
        const boundRight = Math.min(fullRight, Math.max(source.boundRight, fullLeft));
        const boundTop = Math.max(fullTop, Math.min(source.boundTop, fullBottom));
        const boundBottom = Math.min(fullBottom, Math.max(source.boundBottom, fullTop));
        
        // Увеличенные отступы для координат, чтобы камни не закрывали подписи
        const padding = source.showCoordinates ? fontSize * 2.5 : 20;
        
        // Рассчитываем размер ячейки на основе полного размера доски
        // Сначала находим размер для полной доски
        const minCellSize = fontSize * 2.5;
        const fullCalculatedSize = Math.max(minCellSize * Math.max(boardWidth - 1, boardSize - 1), 200);
        const fullTotalWidth = Math.max(params.width, fullCalculatedSize);
        const fullTotalHeight = Math.max(params.height, fullCalculatedSize);
        const fullInnerWidth = fullTotalWidth - 2 * padding;
        const fullInnerHeight = fullTotalHeight - 2 * padding;
        
        // Шаг ячеек на основе полного размера доски (размер ячейки остается постоянным)
        const stepX = boardWidth > 1 ? fullInnerWidth / (boardWidth - 1) : 0;
        const stepY = boardSize > 1 ? fullInnerHeight / (boardSize - 1) : 0;
        
        // Теперь рассчитываем размер SVG для видимой области
        const visibleCols = boundRight - boundLeft + 1;
        const visibleRows = boundBottom - boundTop + 1;
        const visibleInnerWidth = visibleCols > 1 ? stepX * (visibleCols - 1) : 0;
        const visibleInnerHeight = visibleRows > 1 ? stepY * (visibleRows - 1) : 0;
        const totalWidth = visibleInnerWidth + 2 * padding;
        const totalHeight = visibleInnerHeight + 2 * padding;
        
        svg.setAttribute('width', totalWidth.toString());
        svg.setAttribute('height', totalHeight.toString());
        svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
        svg.classList.add('go-board-svg');

        // Фон доски
        const background = this.renderBackground(totalWidth, totalHeight);
        svg.appendChild(background);

        const localCols = visibleCols;
        const localRows = visibleRows;

        // Линии доски
        const protrude = Math.max(Math.min(stepX, stepY) * 0.3, 6);
        // Из-за инверсии оси Y (0 внизу в терминах доски, но сверху в SVG):
        // если viewport не касается верхней кромки доски (boundBottom < fullBottom), торчим вверх → уменьшаем yStart
        // если viewport не касается нижней кромки доски (boundTop > fullTop), торчим вниз  → увеличиваем yEnd
        const yStart = padding - (boundBottom < fullBottom ? protrude : 0);
        const yEnd = (totalHeight - padding) + (boundTop > fullTop ? protrude : 0);
        const xStart = padding - (boundLeft > fullLeft ? protrude : 0);
        const xEnd = (totalWidth - padding) + (boundRight < fullRight ? protrude : 0);

        for (let i = 0; i < localCols; i++) {
            const xPos = padding + i * stepX;
            const vLine = this.renderVerticalLines(yStart, yEnd, xPos);
            svg.appendChild(vLine);
        }
        for (let i = 0; i < localRows; i++) {
            const yPos = padding + i * stepY;
            const hLine = this.renderHorizontalLines(xStart, xEnd, yPos);
            svg.appendChild(hLine);
        }

        // Хоси (звездные точки)
        for (let y = boundTop; y <= boundBottom; y++) {
            for (let x = boundLeft; x <= boundRight; x++) {
                const point = source.points[y][x];
                if (point.hasHoshi) {
                    const relX = x - boundLeft;
                    const relY = y - boundTop;
                    const invertedYLocal = (localRows - 1) - relY;
                    const hoshi = this.renderHoshi(padding, padding, stepX, stepY, relX, invertedYLocal);
                    svg.appendChild(hoshi);
                }
            }
        }

        // Камни
        for (let y = boundTop; y <= boundBottom; y++) {
            for (let x = boundLeft; x <= boundRight; x++) {
                const point = source.points[y][x];
                if (point.content !== PointContent.Empty) {
                    const relX = x - boundLeft;
                    const relY = y - boundTop;
                    const invertedYLocal = (localRows - 1) - relY;
                    const circle = this.renderStone(
                        padding, padding, stepX, stepY, relX, invertedYLocal, point.content
                    );
                    svg.appendChild(circle);
                }
            }
        }

        // Рендеринг меток
        for (let y = boundTop; y <= boundBottom; y++) {
            for (let x = boundLeft; x <= boundRight; x++) {
                const point = source.points[y][x];
                if (point.mark) {
                    const relX = x - boundLeft;
                    const relY = y - boundTop;
                    const invertedYLocal = (localRows - 1) - relY;
                    const fontSize = this.getFontSizeFromCSS();
                    const markText = point.mark; // Полная метка
                    const text = this.renderMark(
                        padding, padding, stepX, stepY, relX, invertedYLocal, markText, fontSize, point.content
                    );
                    svg.appendChild(text);
                }
            }
        }

        // Координаты
        if (source.showCoordinates) {
            this.renderLeftNumbers(svg, padding, stepX, stepY, localRows, padding, boundTop);
            this.renderBottomLetters(svg, padding, stepY, stepX, localCols, totalHeight, padding, boundLeft);
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
        cell: PointContent
    ) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const cx = paddingLeft + x * stepX;
        const cy = paddingTop + y * stepY;
        circle.setAttribute('cx', cx.toString());
        circle.setAttribute('cy', cy.toString());
        
        // Рассчитываем радиус как расстояние между линиями умноженное на 0.8
        const radius = Math.min(stepX, stepY) * 0.46;
        circle.setAttribute('r', radius.toString());

        // Добавляем базовый класс для всех камней
        circle.classList.add('go-stone');
        
        if (cell === PointContent.Black) {
            circle.classList.add('go-stone-black');
        } else if (cell === PointContent.White) {
            circle.classList.add('go-stone-white');
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
        
        // Фиксированный радиус хоси (задается в CSS)
        dot.setAttribute('cx', cx.toString());
        dot.setAttribute('cy', cy.toString());
        dot.setAttribute('r', '1.5');
        dot.classList.add('go-board-hoshi');
        return dot;
    }

    private renderMark(
        paddingLeft: number,
        paddingTop: number,
        stepX: number,
        stepY: number,
        x: number,
        y: number,
        markText: string,
        fontSize: number,
        pointContent: PointContent
    ) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const cx = paddingLeft + x * stepX;
        const cy = paddingTop + y * stepY;
        
        text.setAttribute('x', cx.toString());
        text.setAttribute('y', cy.toString());
        text.setAttribute('font-size', fontSize.toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.classList.add('go-board-mark');
        
        // Контрастный цвет метки: на черном камне - белый, на белом камне - черный
        if (pointContent === PointContent.Black) {
            text.classList.add('go-board-mark-white');
        } else if (pointContent === PointContent.White) {
            text.classList.add('go-board-mark-black');
        }
        
        text.textContent = markText;
        return text;
    }

    private renderHorizontalLines(xStart: number, xEnd: number, yPos: number) {
        const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hLine.setAttribute('x1', xStart.toString());
        hLine.setAttribute('y1', yPos.toString());
        hLine.setAttribute('x2', xEnd.toString());
        hLine.setAttribute('y2', yPos.toString());
        hLine.classList.add('go-board-line');
        return hLine;
    }

    private renderVerticalLines(yStart: number, yEnd: number, xPos: number) {
        const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vLine.setAttribute('x1', xPos.toString());
        vLine.setAttribute('y1', yStart.toString());
        vLine.setAttribute('x2', xPos.toString());
        vLine.setAttribute('y2', yEnd.toString());
        vLine.classList.add('go-board-line');
        return vLine;
    }

    private renderBackground(totalWidth: number, totalHeight: number) {
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('x', '0');
        background.setAttribute('y', '0');
        background.setAttribute('width', totalWidth.toString());
        background.setAttribute('height', totalHeight.toString());
        background.classList.add('go-board-background');
        return background;
    }

    private renderLeftNumbers(svg: SVGElement, paddingLeft: number, stepX: number, stepY: number, localRows: number, paddingTop: number, globalRowStart: number) {
        const fontSize = this.getFontSizeFromCSS();
        for (let i = 0; i < localRows; i++) {
            const invertedI = localRows - 1 - i;
            const yPos = paddingTop + invertedI * stepY;
            const label = (globalRowStart + i + 1).toString();
            // Увеличенный отступ для координат, чтобы камни не закрывали их
            const gap = Math.max(8, fontSize * 1.2);
            const x = paddingLeft - gap;
            const text = this.renderCoordinateSymbol(x, yPos, label, fontSize, 'end', 'middle');
            svg.appendChild(text);
        }
    }

    private renderBottomLetters(svg: SVGElement, paddingLeft: number, stepY: number, stepX: number, localCols: number, totalHeight: number, paddingBottom: number, globalColStart: number) {
        const fontSize = this.getFontSizeFromCSS();
        for (let i = 0; i < localCols; i++) {
            const xPos = paddingLeft + i * stepX;
            const label = indexToLetter(globalColStart + i);
            const gap = Math.max(8, fontSize * 1.2);
            const y = totalHeight - paddingBottom + gap;
            const text = this.renderCoordinateSymbol(xPos, y, label, fontSize, 'middle', 'hanging');
            svg.appendChild(text);
        }
    }

    private renderCoordinateSymbol(
        x: number,
        y: number,
        label: string,
        fontSize: number,
        textAnchor: TextAnchor,
        dominantBaseline: DominantBaseline
    ): SVGElement {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x.toString());
        text.setAttribute('y', y.toString());
        text.setAttribute('font-size', fontSize.toString());
        text.setAttribute('text-anchor', textAnchor);
        text.setAttribute('dominant-baseline', dominantBaseline);
        text.classList.add('go-board-coordinate');
        text.textContent = label;
        return text;
    }
}
