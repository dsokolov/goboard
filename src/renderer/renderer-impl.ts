import { Board, PointContent, RenderParams } from "./data";
import { Renderer } from "./renderer";

export class RendererImpl implements Renderer {

    render(source: Board, params: RenderParams): SVGElement {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const totalWidth = params.width;
        const totalHeight = params.height;
        // Base padding on all sides
        const basePadding = 0;
        svg.setAttribute('width', totalWidth.toString());
        svg.setAttribute('height', totalHeight.toString());
        svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
        svg.classList.add('go-board-svg');

        // Фон доски должен покрывать всю область SVG, чтобы поля были того же цвета
        const background = this.renderBackground(totalWidth, totalHeight, params.colors.boardColor);
        svg.appendChild(background);

        // Добавляем линии доски
        const boardSize = source.points.length;

        // Preliminary step assuming symmetric base padding to estimate sizes
        const prelimInnerWidth = totalWidth - 2 * basePadding;
        const prelimInnerHeight = totalHeight - 2 * basePadding;
        const prelimStepX = boardSize > 1 ? prelimInnerWidth / (boardSize - 1) : 0;
        const prelimStepY = boardSize > 1 ? prelimInnerHeight / (boardSize - 1) : 0;

        // Estimate coordinate font sizes
        const estNumFont = Math.max(8, prelimStepY * 0.4);
        const estLetFont = Math.max(8, prelimStepX * 0.4);

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
            const vLine = this.renderVerticalLines(paddingTop, totalHeight - paddingBottom, xPos, params.colors.lineColor);
            svg.appendChild(vLine);
            const hLine = this.renderHorizontalLines(paddingLeft, totalWidth - paddingRight, yPos, params.colors.lineColor);
            svg.appendChild(hLine);
        }

        // Хоси (звездные точки)
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize; x++) {
                const point = source.points[y][x];
                if (point.hasHoshi) {
                    const hoshi = this.renderHoshi(paddingLeft, paddingTop, stepX, stepY, x, y, params.colors.lineColor);
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
                        paddingLeft, paddingTop, stepX, stepY, x, y, point.content,
                        params.stoneSize,
                        params.colors.blackStoneColor,
                        params.colors.whiteStoneColor,
                        params.colors.lineColor
                    );
                    svg.appendChild(circle);
                }
            }
        }

        // Координаты: цифры слева, буквы снизу
        if (source.showCoordinates) {
            // Use the final step sizes to position labels exactly one grid step away
            this.renderLeftNumbers(svg, paddingLeft, stepX, stepY, boardSize, params.colors.lineColor, paddingTop);
            this.renderBottomLetters(svg, paddingLeft, stepY, stepX, boardSize, params.colors.lineColor, totalHeight, paddingBottom);
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
        blackColor: string,
        whiteColor: string,
        strokeColor: string
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
        paddingLeft: number,
        paddingTop: number,
        stepX: number,
        stepY: number,
        x: number,
        y: number,
        lineColor: string,
    ) {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const cx = paddingLeft + x * stepX;
        const cy = paddingTop + y * stepY;
        const radius = Math.max(2, Math.min(stepX, stepY) * 0.06);
        dot.setAttribute('cx', cx.toString());
        dot.setAttribute('cy', cy.toString());
        dot.setAttribute('r', radius.toString());
        dot.setAttribute('fill', lineColor);
        return dot;
    }

    private renderHorizontalLines(xStart: number, xEnd: number, yPos: number, lineColor: string) {
        const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hLine.setAttribute('x1', xStart.toString());
        hLine.setAttribute('y1', yPos.toString());
        hLine.setAttribute('x2', xEnd.toString());
        hLine.setAttribute('y2', yPos.toString());
        hLine.setAttribute('stroke', lineColor);
        hLine.setAttribute('stroke-width', '1');
        return hLine;
    }

    private renderVerticalLines(yStart: number, yEnd: number, xPos: number, lineColor: string) {
        const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vLine.setAttribute('x1', xPos.toString());
        vLine.setAttribute('y1', yStart.toString());
        vLine.setAttribute('x2', xPos.toString());
        vLine.setAttribute('y2', yEnd.toString());
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

    private renderLeftNumbers(svg: SVGElement, paddingLeft: number, stepX: number, stepY: number, boardSize: number, color: string, paddingTop: number) {
        const fontSize = Math.max(8, stepY * 0.4);
        for (let i = 0; i < boardSize; i++) {
            const yPos = paddingTop + i * stepY;
            const label = (i + 1).toString();
            // Place numbers slightly less than one step away from the first vertical line
            const gap = stepX * 0.75 + Math.max(4, fontSize * 0.15);
            const x = (paddingLeft - gap);
            const text = this.renderCoordinateSymbol(x, yPos, label, fontSize, color, 'end', 'middle');
            svg.appendChild(text);
        }
    }

    private renderBottomLetters(svg: SVGElement, paddingLeft: number, stepY: number, stepX: number, boardSize: number, color: string, totalHeight: number, paddingBottom: number) {
        const fontSize = Math.max(8, stepX * 0.4);
        for (let i = 0; i < boardSize; i++) {
            const xPos = paddingLeft + i * stepX;
            const label = String.fromCharCode('A'.charCodeAt(0) + i);
            // Place letters slightly less than one step away from the bottom horizontal line
            const gap = stepY * 0.75 + Math.max(4, fontSize * 0.15);
            const y = (totalHeight - paddingBottom + gap);
            const text = this.renderCoordinateSymbol(xPos, y, label, fontSize, color, 'middle', 'hanging');
            svg.appendChild(text);
        }
    }

    private renderCoordinateSymbol(
        x: number,
        y: number,
        label: string,
        fontSize: number,
        color: string,
        textAnchor: 'start' | 'middle' | 'end',
        dominantBaseline: 'auto' | 'text-bottom' | 'alphabetic' | 'ideographic' | 'middle' | 'central' | 'mathematical' | 'hanging' | 'text-top' | 'bottom' | 'center' | 'top'
    ): SVGElement {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x.toString());
        text.setAttribute('y', y.toString());
        text.setAttribute('font-size', fontSize.toString());
        text.setAttribute('text-anchor', textAnchor);
        text.setAttribute('dominant-baseline', dominantBaseline);
        text.setAttribute('font-family', 'Arial, sans-serif');
        text.setAttribute('style', `fill: ${color} !important;`);
        text.textContent = label;
        return text;
    }
}