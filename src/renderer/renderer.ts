import { Board } from "./data";

export interface Renderer {
    parse(source: Board): SVGElement;
}

export function createRenderer(): Renderer {
    const { RendererImpl } = require("./renderer-impl");
    return new RendererImpl();
}
