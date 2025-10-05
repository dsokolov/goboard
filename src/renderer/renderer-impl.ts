import { Board, PointContent, RenderParams } from "./data";
import { Renderer } from "./renderer";

export class RendererImpl implements Renderer {

    render(source: Board, params: RenderParams): SVGElement {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const totalWidth = params.width;
        const totalHeight = params.height;
        const padding = params.margin
        svg.setAttribute('width', totalWidth.toString());
        svg.setAttribute('height', totalHeight.toString());
        svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
        svg.classList.add('go-board-svg');

        // Фон доски должен покрывать всю область SVG, чтобы поля были того же цвета
        const background = this.renderBackground(totalWidth, totalHeight, params.boardColor);
        svg.appendChild(background);

        // Добавляем линии доски
        const boardSize = source.points.length;
        const innerWidth = totalWidth - 2 * padding;
        const innerHeight = totalHeight - 2 * padding;
        const stepX = boardSize > 1 ? innerWidth / (boardSize - 1) : 0;
        const stepY = boardSize > 1 ? innerHeight / (boardSize - 1) : 0;

        for (let i = 0; i < boardSize; i++) {
            const xPos = padding + i * stepX;
            const yPos = padding + i * stepY;
            const vLine = this.renderVerticalLines(padding, totalHeight, xPos, params.lineColor);
            svg.appendChild(vLine);
            const hLine = this.renderHorizontalLines(padding, totalWidth, yPos, params.lineColor);
            svg.appendChild(hLine);
        }

        // Хоси (звездные точки)
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize; x++) {
                const point = source.points[y][x];
                if (point.hasHoshi) {
                    const hoshi = this.renderHoshi(padding, stepX, stepY, x, y, params.lineColor);
                    svg.appendChild(hoshi);
                }
            }
        }

        // Добавляем камни
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize; x++) {
                const point = source.points[y][x];
                if (point.content !== PointContent.Empty) {
                    const circle = this.renderStone(
                        padding, stepX, stepY, x, y, point.content,
                        params.stoneSize,
                        params.blackStoneColor,
                        params.whiteStoneColor,
                        params.lineColor
                    );
                    svg.appendChild(circle);
                }
            }
        }

        // Координаты: цифры слева, буквы снизу
        if (source.showCoordinates) {
            this.renderLeftNumbers(svg, padding, stepY, boardSize, params.lineColor);
            this.renderBottomLetters(svg, padding, stepX, boardSize, params.lineColor, totalHeight);
        }

        return svg;
    }

    private renderStone(
        padding: number,
        stepX: number,
        stepY: number,
        x: number,
        y: number,
        cell: PointContent,
        stoneSizeFraction: number,
        blackColor: string,
        whiteColor: string,
        strokeColor: string
    ) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const cx = padding + x * stepX;
        const cy = padding + y * stepY;
        circle.setAttribute('cx', cx.toString());
        circle.setAttribute('cy', cy.toString());
        const diameter = Math.min(stepX, stepY) * stoneSizeFraction;
        const radius = diameter / 2;
        circle.setAttribute('r', radius.toString());

        if (cell === PointContent.Black) {
            circle.setAttribute('fill', blackColor);
            circle.setAttribute('stroke', strokeColor);
        } else if (cell === PointContent.White) {
            circle.setAttribute('fill', whiteColor);
            circle.setAttribute('stroke', strokeColor);
        }
        circle.setAttribute('stroke-width', '1');
        return circle;
    }

    private renderHoshi(
        padding: number,
        stepX: number,
        stepY: number,
        x: number,
        y: number,
        lineColor: string,
    ) {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const cx = padding + x * stepX;
        const cy = padding + y * stepY;
        const radius = Math.max(2, Math.min(stepX, stepY) * 0.06);
        dot.setAttribute('cx', cx.toString());
        dot.setAttribute('cy', cy.toString());
        dot.setAttribute('r', radius.toString());
        dot.setAttribute('fill', lineColor);
        return dot;
    }

    private renderHorizontalLines(padding: number, totalWidth: number, yPos: number, lineColor: string) {
        const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hLine.setAttribute('x1', padding.toString());
        hLine.setAttribute('y1', yPos.toString());
        hLine.setAttribute('x2', (totalWidth - padding).toString());
        hLine.setAttribute('y2', yPos.toString());
        hLine.setAttribute('stroke', lineColor);
        hLine.setAttribute('stroke-width', '1');
        return hLine;
    }

    private renderVerticalLines(padding: number, totalHeight: number, xPos: number, lineColor: string) {
        const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vLine.setAttribute('x1', xPos.toString());
        vLine.setAttribute('y1', padding.toString());
        vLine.setAttribute('x2', xPos.toString());
        vLine.setAttribute('y2', (totalHeight - padding).toString());
        vLine.setAttribute('stroke', lineColor);
        vLine.setAttribute('stroke-width', '1');
        return vLine;
    }

    private renderBackground(totalWidth: number, totalHeight: number, boardColor: string) {
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('x', '0');
        background.setAttribute('y', '0');
        background.setAttribute('width', totalWidth.toString());
        background.setAttribute('height', totalHeight.toString());
        background.setAttribute('fill', boardColor);
        return background;
    }

    private renderLeftNumbers(svg: SVGElement, padding: number, stepY: number, boardSize: number, color: string) {
        const fontSize = Math.max(8, stepY * 0.4);
        for (let i = 0; i < boardSize; i++) {
            const yPos = padding + i * stepY;
            const label = (i + 1).toString();
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', (padding - stepY * 0.5).toString());
            text.setAttribute('y', yPos.toString());
            text.setAttribute('fill', color);
            text.setAttribute('font-size', fontSize.toString());
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('dominant-baseline', 'middle');
            text.textContent = label;
            svg.appendChild(text);
        }
    }

    private renderBottomLetters(svg: SVGElement, padding: number, stepX: number, boardSize: number, color: string, totalHeight: number) {
        const fontSize = Math.max(8, stepX * 0.4);
        for (let i = 0; i < boardSize; i++) {
            const xPos = padding + i * stepX;
            const label = String.fromCharCode('A'.charCodeAt(0) + i);
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', xPos.toString());
            text.setAttribute('y', (totalHeight - padding + stepX * 0.5).toString());
            text.setAttribute('fill', color);
            text.setAttribute('font-size', fontSize.toString());
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'hanging');
            text.textContent = label;
            svg.appendChild(text);
        }
    }
}