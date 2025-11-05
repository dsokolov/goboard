# Примеры использования GoBoard

## Создание пустого гобана

Для создания пустого гобана (поля для игры Го), достаточно в заметке Obsidian создать блок кода, указав в качестве синтаксиса `goboard`, например

<!-- goboard: empty-board-default -->
<pre>
```goboard
```
</pre>

![Диаграмма пустого гобана с настройками по умолчанию](/docs/images/empty-board-default-light.png#gh-light-mode-only)
![Диаграмма пустого гобана с настройками по умолчанию](/docs/images/empty-board-default-dark.png#gh-dark-mode-only)

## Размер гобана

По-умолчанию размер гобана 19x19. Для явного указания размера используйте `size <высота>x<ширина>`. Например:

<!-- goboard: empty-board-9x9 -->
<pre>
```goboard
size 9x9
```
</pre>

![Диаграмма пустого гобана размером 9x9](/docs/images/empty-board-9x9-light.png#gh-light-mode-only)
![Диаграмма пустого гобана размером 9x9](/docs/images/empty-board-9x9-dark.png#gh-dark-mode-only)

## Постановка одного камня

Для постановки единичного камня используйте `<B|W> <координата>`, где `B` - чёрный камень, `W` - белый камень. Например постановка чёрного камня в сан-сан:

<!-- goboard: one-stone -->
<pre>
```goboard
size 9x9
B C3
```
</pre>

![Постановка одного камня](/docs/images/one-stone-light.png#gh-light-mode-only)
![Постановка одного камня](/docs/images/one-stone-dark.png#gh-dark-mode-only)

## Постановка группы камней

Для краткости записи, можно одной строкой поставить сразу несколько камней. Координаты записываются через запятую (будет несколько отдельных камней или групп), через дефис (будет стена или плотная прямоугольная группа) либо комбинацией этих способов. Например, поставим три чёрных камня в ряд, несколько отдельно а белые выложим двумя прямоугольниками.


<!-- goboard: group-of-stones -->
<pre>
```goboard
size 13x13
B C3-C5, C7, C9
W A9-B7,D8-E6
```
</pre>

![Постановка группы камней](/docs/images/group-of-stones-light.png#gh-light-mode-only)
![Постановка группы камней](/docs/images/group-of-stones-dark.png#gh-dark-mode-only)

## Нумерация постановок

Каждый поставленный камень можно отмечать натуральным числом: `<B|W>[(число)] <координата>`. Например постановка в хоси и атака в сан-сан:

<!-- goboard: mark-numbers-two-stones -->
<pre>
```goboard
size 9x9
B(1) D4
W(2) C3
```
</pre>

![Нумерация постановок камней](/docs/images/mark-numbers-two-stones-light.png#gh-light-mode-only)
![Нумерация постановок камней](/docs/images/mark-numbers-two-stones-dark.png#gh-dark-mode-only)

## Метки-буквы

Есть возможность отмечать пункты гобана (как с камнями, так и без) буквами. Метка должна быть одной буквой (A-Z) и всегда отображается заглавной. Поддерживаются следующие форматы:

- `(A) <координата>` — метка на пустой клетке
- `B(A) <координата>` — черный камень с буквенной меткой
- `W(B) <координата>` — белый камень с буквенной меткой

Пример:

<!-- goboard: mark-letter -->
<pre>
```goboard
size 9x9
B D4
(A) C3
(B) C7
(C) D3 
```
</pre>

## Область видимости (viewport)

Если нет необходимости отображать всю диаграмму гобана (например, рассматривается только небольшая позиция в углу), то можно использовать параметр `viewport <координата1>-<координата2>`:

<!-- goboard: viewport-two-stones -->
<pre>
```goboard
size 19x19
viewport A1-F5
B C4
W E3
```
</pre>

![Область видимости](/docs/images/viewport-two-stones-light.png#gh-light-mode-only)
![Область видимости](/docs/images/viewport-two-stones-dark.png#gh-dark-mode-only)
