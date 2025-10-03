# GoBoard

Obsidian plugin for rendering Go game diagrams from markdown code blocks using `goboard` language identifier.

## Features

- Render Go game diagrams from markdown code blocks
- Customizable board appearance through settings
- Support for different board sizes (9x9, 13x13, 19x19)
- Configurable stone colors, board colors, and line thickness
- Optional coordinate display
- Settings panel accessible through Obsidian's plugin settings

## Settings

The plugin includes a comprehensive settings panel where you can configure:

- **Board Size**: Default board size (9x9, 13x13, or 19x19)
- **Stone Size Ratio**: Size of stones relative to cell size (0.1-1.0)
- **Line Width**: Thickness of board lines (0.5-3.0)
- **Background Color**: Color of the board background
- **Line Color**: Color of the board lines
- **Black Stone Color**: Color of black stones
- **White Stone Color**: Color of white stones
- **Show Coordinates**: Toggle coordinate display on/off
- **Coordinates Color**: Color of coordinate labels
- **Coordinates Font Size**: Font size of coordinate labels (8-20)

## Usage

Use the `goboard` language identifier in markdown code blocks:

````markdown
```goboard
size 19x19
coordinates on
B D4
W Q16
B K10
```
````
