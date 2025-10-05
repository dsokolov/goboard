import { ParseResult } from "./data";

export interface Parser {
    parse(source: string): ParseResult;
}

export function createParser(): Parser {
    const { ParserImpl } = require("./parser-impl");
    return new ParserImpl();
}
