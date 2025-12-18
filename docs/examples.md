# GoBoard Usage Examples

## Creating an empty goban

To create an empty goban (Go board), simply create a code block in an Obsidian note, specifying `goboard` as the syntax, for example

<!-- goboard: empty-board-default -->
<pre>
```goboard
```
</pre>

![Empty goban diagram with default settings](/docs/images/empty-board-default-light.png#gh-light-mode-only)
![Empty goban diagram with default settings](/docs/images/empty-board-default-dark.png#gh-dark-mode-only)

## Board size

By default, the goban size is 19x19. To explicitly specify the size, use `size <height>x<width>`. For example:

<!-- goboard: empty-board-9x9 -->
<pre>
```goboard
size 9x9
```
</pre>

![Empty 9x9 goban diagram](/docs/images/empty-board-9x9-light.png#gh-light-mode-only)
![Empty 9x9 goban diagram](/docs/images/empty-board-9x9-dark.png#gh-dark-mode-only)

## Placing a single stone

To place a single stone, use `<B|W> <coordinate>`, where `B` is a black stone and `W` is a white stone. For example placing a black stone at san-san:

<!-- goboard: one-stone -->
<pre>
```goboard
size 9x9
B C3
```
</pre>

![Placing a single stone](/docs/images/one-stone-light.png#gh-light-mode-only)
![Placing a single stone](/docs/images/one-stone-dark.png#gh-dark-mode-only)

## Placing a group of stones

For brevity, you can place multiple stones in one line. Coordinates are written separated by commas (will create several separate stones or groups), by hyphens (will create a wall or dense rectangular group), or a combination of these methods. For example, let's place three black stones in a row, several separately, and arrange white stones in two rectangles.


<!-- goboard: group-of-stones -->
<pre>
```goboard
size 13x13
B C3-C5, C7, C9
W A9-B7,D8-E6
```
</pre>

![Placing a group of stones](/docs/images/group-of-stones-light.png#gh-light-mode-only)
![Placing a group of stones](/docs/images/group-of-stones-dark.png#gh-dark-mode-only)

## Move numbering

Each placed stone can be marked with a natural number: `<B|W>[(number)] <coordinate>`. For example placing at hoshi and attacking at san-san:

<!-- goboard: mark-numbers-two-stones -->
<pre>
```goboard
size 9x9
B(1) D4
W(2) C3
```
</pre>

![Move numbering on stones](/docs/images/mark-numbers-two-stones-light.png#gh-light-mode-only)
![Move numbering on stones](/docs/images/mark-numbers-two-stones-dark.png#gh-dark-mode-only)

## Letter marks

You can mark goban points (both with stones and without) with letters. The mark must be a single letter (A-Z) and is always displayed in uppercase. The following formats are supported:

- `(A) <coordinate>` — mark on an empty cell
- `B(A) <coordinate>` — black stone with a letter mark
- `W(B) <coordinate>` — white stone with a letter mark

Example:

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

![Letter marks](/docs/images/mark-letter-light.png#gh-light-mode-only)
![Letter marks](/docs/images/mark-letter-dark.png#gh-dark-mode-only)

## Displaying coordinates

To control coordinate display, use the `coordinates <on, off, top, left, bottom, right>` parameter. For example:

<!-- goboard: coordinates-all -->
<pre>
```goboard
size 9x9
coordinates on
```
</pre>

![All coordinates are displayed](/docs/images/coordinates-all-light.png#gh-light-mode-only)
![All coordinates are displayed](/docs/images/coordinates-all-dark.png#gh-dark-mode-only)

<!-- goboard: coordinates-off -->
<pre>
```goboard
size 9x9
coordinates off
```
</pre>

![No coordinates are displayed](/docs/images/coordinates-off-light.png#gh-light-mode-only)
![No coordinates are displayed](/docs/images/coordinates-off-dark.png#gh-dark-mode-only)

<!-- goboard: coordinates-left-bottom -->
<pre>
```goboard
size 9x9
coordinates left, bottom
```
</pre>

![Coordinates only on the left and bottom](/docs/images/coordinates-left-bottom-light.png#gh-light-mode-only)
![Coordinates only on the left and bottom](/docs/images/coordinates-left-bottom-dark.png#gh-dark-mode-only)

If the `coordinates` value is not specified, coordinates will be displayed according to the default settings from the plugin settings.

## Viewport (visible area)

If you don't need to display the entire goban diagram (for example, only a small position in the corner is being considered), you can use the `viewport <coordinate1>-<coordinate2>` parameter:

<!-- goboard: viewport-two-stones -->
<pre>
```goboard
size 19x19
viewport A1-F5
B C4
W E3
```
</pre>

![Viewport (visible area)](/docs/images/viewport-two-stones-light.png#gh-light-mode-only)
![Viewport (visible area)](/docs/images/viewport-two-stones-dark.png#gh-dark-mode-only)
