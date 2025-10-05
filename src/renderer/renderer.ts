import { Board, RenderParams } from "./data";

export interface Renderer {
    render(source: Board, params: RenderParams): SVGElement;
}

export function createRenderer(): Renderer {
    const { RendererImpl } = require("./renderer-impl");
    return new RendererImpl();
}
