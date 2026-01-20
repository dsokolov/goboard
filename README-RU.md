![GoBoard](./docs/images/goboard_logo.png)

# GoBoard

GoBoard - это плагин для [Obsidian](https://obsidian.md/), рисующий диаграммы [игры Го](https://ru.wikipedia.org/wiki/%D0%93%D0%BE) (так же известна как Вэйци или Падук).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.10.1-green.svg)
![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22goboard%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)

## Установка

В настоящее время плагин GoBoard доступен для бета-теста через [BRAT](https://github.com/TfTHacker/obsidian42-brat).

1. Если у вас ещё нет BRAT, [установитье его](https://obsidian.md/plugins?search=BRAT).
1. В настройках плагина BRAT добавьте репозиторий `https://github.com/dsokolov/goboard`, следуя [инструкции](https://github.com/TfTHacker/obsidian42-brat).
1. Готово, теперь можно рисовать диаграммы!

## Использование

Диаграммы рисуются на основе [markdown codeblock](https://www.codecademy.com/resources/docs/markdown/code-blocks) с указанием синтаксиса `goboard`.

Для примера, следующий код нарисует пустой гобан 9х9:

<!-- goboard: empty-board-9x9 -->
<pre>
```goboard
size 9x9
```
</pre>

![Пустой гобан 9x9](/docs/images/empty-board-9x9-light.png#gh-light-mode-only)
![Пустой гобан 9x9](/docs/images/empty-board-9x9-dark.png#gh-dark-mode-only)

Для размещения камней на диаграмме используйте `B <position>` и `W <position>` для чёрных и белых камней соотвественно. Например:

<!-- goboard: moves-first-two -->
<pre>
```gboard
size 9x9
B G7
W C3
```
</pre>

![Первые две постановки на гобане 9x9](/docs/images/moves-first-two-light.png#gh-light-mode-only)
![Первые две постановки на гобане 9x9](/docs/images/moves-first-two-dark.png#gh-dark-mode-only)

Больше примеров использования смотрите в [examples-ru.md](docs/examples-ru.md).

## Сборка проекта

Собрать проект, включая копирование дистрибутива в хранилище для разработки

```
npm run build
```

Запуск тестов

```
npm test
```

Запуск линтера

```
npm run lint
```

Обновления бейзлайна тестов

```
npm run update-baseline
```

Обновление картинок в документации

```
npm run update-docs
```

## Замечания и предложения

Если вы нашли баг или есть предложения по улучшению - не стасняйтесь [заводить тикеты](https://github.com/dsokolov/goboard/issues)!

## Лицензия

Лицензия MIT - подробности см. в файле [LICENSE](LICENSE).
