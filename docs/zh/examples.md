# GoBoard 使用示例

语言:&nbsp;[English](../en/examples.md)&nbsp;•&nbsp;[Русский](../ru/examples.md)&nbsp;•&nbsp;**中文**

## 创建空棋盘

要创建空棋盘（围棋棋盘），只需在 Obsidian 笔记中创建一个代码块，指定 `goboard` 作为语法，例如

<!-- goboard: empty-board-default -->
<pre>
```goboard
```
</pre>

![使用默认设置的空棋盘图](/docs/images/empty-board-default-light.png#gh-light-mode-only)
![使用默认设置的空棋盘图](/docs/images/empty-board-default-dark.png#gh-dark-mode-only)

## 棋盘大小

默认情况下，棋盘大小为 19x19。要明确指定大小，请使用 `size <高度>x<宽度>`。例如：

<!-- goboard: empty-board-9x9 -->
<pre>
```goboard
size 9x9
```
</pre>

![9x9 空棋盘图](/docs/images/empty-board-9x9-light.png#gh-light-mode-only)
![9x9 空棋盘图](/docs/images/empty-board-9x9-dark.png#gh-dark-mode-only)

## 放置单个棋子

要放置单个棋子，请使用 `<B|W> <坐标>`，其中 `B` 是黑子，`W` 是白子。例如在三三位置放置黑子：

<!-- goboard: one-stone -->
<pre>
```goboard
size 9x9
B C3
```
</pre>

![放置单个棋子](/docs/images/one-stone-light.png#gh-light-mode-only)
![放置单个棋子](/docs/images/one-stone-dark.png#gh-dark-mode-only)

## 放置一组棋子

为了简洁，可以在一行中放置多个棋子。坐标用逗号分隔（将创建几个单独的棋子或组），用连字符分隔（将创建一堵墙或密集的矩形组），或这些方法的组合。例如，让我们在一行中放置三个黑子，几个单独放置，并将白子排列成两个矩形。

<!-- goboard: group-of-stones -->
<pre>
```goboard
size 13x13
B C3-C5, C7, C9
W A9-B7,D8-E6
```
</pre>

![放置一组棋子](/docs/images/group-of-stones-light.png#gh-light-mode-only)
![放置一组棋子](/docs/images/group-of-stones-dark.png#gh-dark-mode-only)

## 着法编号

每个放置的棋子都可以用自然数标记：`<B|W>[(数字)] <坐标>`。例如在星位放置，在三三攻击：

<!-- goboard: mark-numbers-two-stones -->
<pre>
```goboard
size 9x9
B(1) D4
W(2) C3
```
</pre>

![棋子上的着法编号](/docs/images/mark-numbers-two-stones-light.png#gh-light-mode-only)
![棋子上的着法编号](/docs/images/mark-numbers-two-stones-dark.png#gh-dark-mode-only)

## 字母标记

您可以用字母标记棋盘上的点（有棋子或没有棋子）。标记必须是单个字母（A-Z），并且始终以大写显示。支持以下格式：

- `(A) <坐标>` — 空单元格上的标记
- `B(A) <坐标>` — 带字母标记的黑子
- `W(B) <坐标>` — 带字母标记的白子

示例：

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

![字母标记](/docs/images/mark-letter-light.png#gh-light-mode-only)
![字母标记](/docs/images/mark-letter-dark.png#gh-dark-mode-only)

## 显示坐标

要控制坐标显示，请使用 `coordinates <on, off, top, left, bottom, right>` 参数。例如：

<!-- goboard: coordinates-all -->
<pre>
```goboard
size 9x9
coordinates on
```
</pre>

![显示所有坐标](/docs/images/coordinates-all-light.png#gh-light-mode-only)
![显示所有坐标](/docs/images/coordinates-all-dark.png#gh-dark-mode-only)

<!-- goboard: coordinates-off -->
<pre>
```goboard
size 9x9
coordinates off
```
</pre>

![不显示任何坐标](/docs/images/coordinates-off-light.png#gh-light-mode-only)
![不显示任何坐标](/docs/images/coordinates-off-dark.png#gh-dark-mode-only)

<!-- goboard: coordinates-left-bottom -->
<pre>
```goboard
size 9x9
coordinates left, bottom
```
</pre>

![仅在左侧和底部显示坐标](/docs/images/coordinates-left-bottom-light.png#gh-light-mode-only)
![仅在左侧和底部显示坐标](/docs/images/coordinates-left-bottom-dark.png#gh-dark-mode-only)

如果未指定 `coordinates` 值，坐标将根据插件设置中的默认设置显示。

## 视口（可见区域）

如果不需要显示整个棋盘图（例如，只考虑角落中的小位置），可以使用 `viewport <坐标1>-<坐标2>` 参数：

<!-- goboard: viewport-two-stones -->
<pre>
```goboard
size 19x19
viewport A1-F5
B C4
W E3
```
</pre>

![视口（可见区域）](/docs/images/viewport-two-stones-light.png#gh-light-mode-only)
![视口（可见区域）](/docs/images/viewport-two-stones-dark.png#gh-dark-mode-only)
