import { ParseSuccess } from "../parser/data";
import { Board } from "../renderer/data";

export interface Mapper {
    map(source: ParseSuccess): Board
}

export function createMapper(): Mapper {
    const { MapperImpl } = require("./mapper-impl");
    return new MapperImpl();
}
