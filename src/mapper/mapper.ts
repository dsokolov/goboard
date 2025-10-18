import { SchemeColors } from "src/scheme-colors";
import { ParseSuccess } from "../parser/data";
import { Board, RenderColors } from "../renderer/data";

export interface Mapper {
    map(source: ParseSuccess): Board
    mapSchemeColorsToRenderColors(schemeColors: SchemeColors): RenderColors
}

export function createMapper(): Mapper {
    const { MapperImpl } = require("./mapper-impl");
    return new MapperImpl();
}
