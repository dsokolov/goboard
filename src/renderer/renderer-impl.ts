import { Board, PointContent, RenderParams } from "./data";
import { Renderer } from "./renderer";

export class RendererImpl implements Renderer {

    render(source: Board, params: RenderParams): SVGElement {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const totalWidth = params.width;
        const totalHeight = params.height;
        const padding = params.margin ?? 20; // symmetric padding on all sides, default 20
        svg.setAttribute('width', totalWidth.toString());
        svg.setAttribute('height', totalHeight.toString());
        svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
        svg.classList.add('go-board-svg');

        // Фон доски должен покрывать всю область SVG, чтобы поля были того же цвета
        const background = this.renderBackground(totalWidth, totalHeight);
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
            const vLine = this.renderVerticalLines(padding, totalHeight, xPos);
            svg.appendChild(vLine);
            const hLine = this.renderHorizontalLines(padding, totalWidth, yPos);
            svg.appendChild(hLine);
        }

        // Хоси (звездные точки)
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize; x++) {
                const point = source.points[y][x];
                if (point.hasHoshi) {
                    const hoshi = this.renderHoshi(padding, stepX, stepY, x, y);
                    svg.appendChild(hoshi);
                }
            }
        }

        // Добавляем камни
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize; x++) {
                const point = source.points[y][x];
                if (point.content !== PointContent.Empty) {
                    const circle = this.renderStone(padding, stepX, stepY, x, y, point.content);
                    svg.appendChild(circle);
                }
            }
        }

        return svg;
    }

    private renderStone(
        padding: number,
        stepX: number,
        stepY: number,
        x: number,
        y: number,
        cell: PointContent
    ) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const cx = padding + x * stepX;
        const cy = padding + y * stepY;
        circle.setAttribute('cx', cx.toString());
        circle.setAttribute('cy', cy.toString());
        circle.setAttribute('r', '8');

        if (cell === PointContent.Black) {
            circle.setAttribute('fill', '#000000');
            circle.setAttribute('stroke', '#000000');
        } else if (cell === PointContent.White) {
            circle.setAttribute('fill', '#FFFFFF');
            circle.setAttribute('stroke', '#000000');
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
    ) {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const cx = padding + x * stepX;
        const cy = padding + y * stepY;
        const radius = Math.max(2, Math.min(stepX, stepY) * 0.06);
        dot.setAttribute('cx', cx.toString());
        dot.setAttribute('cy', cy.toString());
        dot.setAttribute('r', radius.toString());
        dot.setAttribute('fill', '#000000');
        return dot;
    }

    private renderHorizontalLines(padding: number, totalWidth: number, yPos: number) {
        const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hLine.setAttribute('x1', padding.toString());
        hLine.setAttribute('y1', yPos.toString());
        hLine.setAttribute('x2', (totalWidth - padding).toString());
        hLine.setAttribute('y2', yPos.toString());
        hLine.setAttribute('stroke', '#000000');
        hLine.setAttribute('stroke-width', '1');
        return hLine;
    }

    private renderVerticalLines(padding: number, totalHeight: number, xPos: number) {
        const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vLine.setAttribute('x1', xPos.toString());
        vLine.setAttribute('y1', padding.toString());
        vLine.setAttribute('x2', xPos.toString());
        vLine.setAttribute('y2', (totalHeight - padding).toString());
        vLine.setAttribute('stroke', '#000000');
        vLine.setAttribute('stroke-width', '1');
        return vLine;
    }

    private renderBackground(totalWidth: number, totalHeight: number) {
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('x', '0');
        background.setAttribute('y', '0');
        background.setAttribute('width', totalWidth.toString());
        background.setAttribute('height', totalHeight.toString());
        background.setAttribute('fill', '#DCB35C');
        return background;
    }
}