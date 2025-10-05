import { Board, Cell, RenderParams } from "./data";
import { Renderer } from "./renderer";

export class RendererImpl implements Renderer {

    render(source: Board, params: RenderParams): SVGElement {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', params.width.toString());
        svg.setAttribute('height',params.height.toString());
        svg.setAttribute('viewBox', '0 0 120 120');
        svg.classList.add('go-board-svg');

        // Добавляем фон доски
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('x', '20');
        background.setAttribute('y', '20');
        background.setAttribute('width', '80');
        background.setAttribute('height', '80');
        background.setAttribute('fill', '#DCB35C');
        svg.appendChild(background);

        // Добавляем линии доски
        const boardSize = source.cells.length;
        for (let i = 1; i <= boardSize; i++) {
            const pos = 20 + i * 20;
            
            // Вертикальные линии
            const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            vLine.setAttribute('x1', pos.toString());
            vLine.setAttribute('y1', '40');
            vLine.setAttribute('x2', pos.toString());
            vLine.setAttribute('y2', '100');
            vLine.setAttribute('stroke', '#000000');
            vLine.setAttribute('stroke-width', '1');
            svg.appendChild(vLine);

            // Горизонтальные линии
            const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            hLine.setAttribute('x1', '40');
            hLine.setAttribute('y1', pos.toString());
            hLine.setAttribute('x2', '100');
            hLine.setAttribute('y2', pos.toString());
            hLine.setAttribute('stroke', '#000000');
            hLine.setAttribute('stroke-width', '1');
            svg.appendChild(hLine);
        }

        // Добавляем камни
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize; x++) {
                const cell = source.cells[y][x];
                if (cell !== Cell.Empty) {
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    const cx = 20 + (x + 1) * 20;
                    const cy = 20 + (y + 1) * 20;
                    circle.setAttribute('cx', cx.toString());
                    circle.setAttribute('cy', cy.toString());
                    circle.setAttribute('r', '8');
                    
                    if (cell === Cell.Black) {
                        circle.setAttribute('fill', '#000000');
                        circle.setAttribute('stroke', '#000000');
                    } else if (cell === Cell.White) {
                        circle.setAttribute('fill', '#FFFFFF');
                        circle.setAttribute('stroke', '#000000');
                    }
                    circle.setAttribute('stroke-width', '1');
                    svg.appendChild(circle);
                }
            }
        }

        return svg;
    }
}