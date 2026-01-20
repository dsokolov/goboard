![GoBoard](./docs/images/goboard_logo.png)

# GoBoard

GoBoard - это плагин для [Obsidian](https://obsidian.md/), рисующий диаграммы [игры Го](https://ru.wikipedia.org/wiki/%D0%93%D0%BE) (так же известна как Вэйци или Бадук).

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/github/v/release/dsokolov/goboard)](https://github.com/dsokolov/goboard/releases/latest)
[![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22goboard%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=goboard)

Язык:&nbsp;[English](README.md)&nbsp;•&nbsp;**Русский**&nbsp;•&nbsp;[中文](README-zh.md)

## Установка

Если у вас ещё не установлен Obsidian - [cкачайте его](https://obsidian.md/download).

Для установки [нажмите здесь](https://obsidian.md/plugins?id=goboard), либо выполните следующие действия: 

1. В приложении Obsidian откройте настройки плагинов сообщества: `Settings -> Community plugins`.
2. Если вы этого ещё не делали, нужно будет включить поддержку сторонних плагинов `Turn on community plugins`.
3. Перейти к выбору плагинов, нажав `Browse`.
4. В строке поиска ввести `GoBoard`.
5. Выбрать плагин, нажать `Install`, а после завершения установки - `Enable`.
6. Готово, теперь можно рисовать диаграммы!

Другие способы установки описаны в [installation.md](./docs/ru/installation.md)

## Использование

Диаграммы рисуются на основе [markdown code blocks](https://www.codecademy.com/resources/docs/markdown/code-blocks) с указанием синтаксиса `goboard`.

Для примера, следующий код нарисует пустой гобан 9х9:

<!-- goboard: empty-board-9x9 -->
<pre>
```goboard
size 9x9
```
</pre>

![Пустой гобан 9x9](/docs/images/empty-board-9x9-light.png#gh-light-mode-only)
![Пустой гобан 9x9](/docs/images/empty-board-9x9-dark.png#gh-dark-mode-only)

Для размещения камней на диаграмме используйте `B <position>` и `W <position>` для чёрных и белых камней соответственно. Например:

<!-- goboard: moves-first-two -->
<pre>
```goboard
size 9x9
B G7
W C3
```
</pre>

![Первые две постановки на гобане 9x9](/docs/images/moves-first-two-light.png#gh-light-mode-only)
![Первые две постановки на гобане 9x9](/docs/images/moves-first-two-dark.png#gh-dark-mode-only)

Больше примеров использования смотрите в [examples.md](docs/ru/examples.md).

## Сборка проекта

См [build.md](/docs/ru/build.md)

## Замечания и предложения

Если вы нашли баг или у вас есть предложения по улучшению проекта - не стесняйтесь [заводить тикеты](https://github.com/dsokolov/goboard/issues)!

## Лицензия

Лицензия MIT - подробности см. в файле [LICENSE](LICENSE).
