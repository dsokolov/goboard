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
        
        // Рассчитываем размер доски на основе размера шрифта
        const minCellSize = fontSize * 2.5;
        const calculatedSize = Math.max(minCellSize * (boardSize - 1), 200);
        
        const totalWidth = Math.max(params.width, calculatedSize);
        const totalHeight = Math.max(params.height, calculatedSize);
        
        svg.setAttribute('width', totalWidth.toString());
        svg.setAttribute('height', totalHeight.toString());
        svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
        svg.classList.add('go-board-svg');

        // Фон доски
        const background = this.renderBackground(totalWidth, totalHeight);
        svg.appendChild(background);

        // Увеличенные отступы для координат, чтобы камни не закрывали подписи
        const padding = source.showCoordinates ? fontSize * 2.5 : 20;
        const innerWidth = totalWidth - 2 * padding;
        const innerHeight = totalHeight - 2 * padding;
        const stepX = boardSize > 1 ? innerWidth / (boardSize - 1) : 0;
        const stepY = boardSize > 1 ? innerHeight / (boardSize - 1) : 0;

        // Линии доски
        for (let i = 0; i < boardSize; i++) {
            const xPos = padding + i * stepX;
            const yPos = padding + i * stepY;
            const vLine = this.renderVerticalLines(padding, totalHeight - padding, xPos);
            svg.appendChild(vLine);
            const hLine = this.renderHorizontalLines(padding, totalWidth - padding, yPos);
            svg.appendChild(hLine);
        }

        // Хоси (звездные точки)
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize; x++) {
                const point = source.points[y][x];
                if (point.hasHoshi) {
                    const invertedY = boardSize - 1 - y;
                    const hoshi = this.renderHoshi(padding, padding, stepX, stepY, x, invertedY);
                    svg.appendChild(hoshi);
                }
            }
        }

        // Камни
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize; x++) {
                const point = source.points[y][x];
                if (point.content !== PointContent.Empty) {
                    const invertedY = boardSize - 1 - y;
                    const circle = this.renderStone(
                        padding, padding, stepX, stepY, x, invertedY, point.content
                    );
                    svg.appendChild(circle);
                }
            }
        }

        // Координаты
        if (source.showCoordinates) {
            this.renderLeftNumbers(svg, padding, stepX, stepY, boardSize, padding);
            this.renderBottomLetters(svg, padding, stepY, stepX, boardSize, totalHeight, padding);
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

    private renderLeftNumbers(svg: SVGElement, paddingLeft: number, stepX: number, stepY: number, boardSize: number, paddingTop: number) {
        const fontSize = this.getFontSizeFromCSS();
        for (let i = 0; i < boardSize; i++) {
            const invertedI = boardSize - 1 - i;
            const yPos = paddingTop + invertedI * stepY;
            const label = (i + 1).toString();
            // Увеличенный отступ для координат, чтобы камни не закрывали их
            const gap = Math.max(8, fontSize * 1.2);
            const x = paddingLeft - gap;
            const text = this.renderCoordinateSymbol(x, yPos, label, fontSize, 'end', 'middle');
            svg.appendChild(text);
        }
    }

    private renderBottomLetters(svg: SVGElement, paddingLeft: number, stepY: number, stepX: number, boardSize: number, totalHeight: number, paddingBottom: number) {
        const fontSize = this.getFontSizeFromCSS();
        for (let i = 0; i < boardSize; i++) {
            const xPos = paddingLeft + i * stepX;
            const label = indexToLetter(i);
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
