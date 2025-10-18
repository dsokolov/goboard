import { Container, Token } from 'typedi';
import { createParser, Parser } from '../parser/parser';
import { createMapper, Mapper } from '../mapper/mapper';
import { createRenderer, Renderer } from '../renderer/renderer';
import { SchemeColorsProvider, SchemeColorsProviderToken, SchemeColorsProviderImpl } from '../scheme-colors';

// Создаем токены для типизированного доступа к сервисам
export const ParserToken = new Token<Parser>('Parser');
export const MapperToken = new Token<Mapper>('Mapper');
export const RendererToken = new Token<Renderer>('Renderer');

export class DIContainer {
    static configure(): void {
        Container.set(ParserToken, createParser());
        Container.set(MapperToken, createMapper());
        Container.set(RendererToken, createRenderer());
        Container.set(SchemeColorsProviderToken, new SchemeColorsProviderImpl());
    }
}


