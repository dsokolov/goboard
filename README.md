![GoBoard](./docs/images/goboard_logo.png)

# GoBoard

GoBoard is a plugin for [Obsidian](https://obsidian.md/) that renders [Go game](https://en.wikipedia.org/wiki/Go_(game)) diagrams (also known as Weiqi or Baduk).

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/github/v/release/dsokolov/goboard)](https://github.com/dsokolov/goboard/releases/latest)
[![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%230b7dbe&label=downloads&query=%24%5B%22goboard%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=goboard)

Language:&nbsp;**English**&nbsp;•&nbsp;[Русский](README-ru.md)&nbsp;•&nbsp;[中文](README-zh.md)

## Installation

If you don't have Obsidian installed yet - [download it](https://obsidian.md/download).

To install [click here](https://obsidian.md/plugins?id=goboard), or follow these steps:

1. In the Obsidian application, open the community plugins settings: `Settings -> Community plugins`.
2. If you haven't done this yet, you'll need to enable support for third-party plugins `Turn on community plugins`.
3. Go to plugin selection by clicking `Browse`.
4. In the search bar, enter `GoBoard`.
5. Select the plugin, click `Install`, and after installation is complete - `Enable`.
6. Done, now you can draw diagrams!

Other installation methods are described in [installation.md](./docs/en/installation.md)

## Usage

Diagrams are drawn based on [markdown code blocks](https://www.codecademy.com/resources/docs/markdown/code-blocks) with the `goboard` syntax specified.

For example, the following code will draw an empty 9x9 goban:

<!-- goboard: empty-board-9x9 -->
<pre>
```goboard
size 9x9
```
</pre>

![Empty 9x9 goban (light theme)](/docs/images/empty-board-9x9-light.png#gh-light-mode-only)
![Empty 9x9 goban (dark theme)](/docs/images/empty-board-9x9-dark.png#gh-dark-mode-only)

To place stones on the diagram, use `B <position>` and `W <position>` for black and white stones respectively. For example:

<!-- goboard: moves-first-two -->
<pre>
```goboard
size 9x9
B G7
W C3
```
</pre>

![First two moves on 9x9 goban (light theme)](/docs/images/moves-first-two-light.png#gh-light-mode-only)
![First two moves on 9x9 goban (dark theme)](/docs/images/moves-first-two-dark.png#gh-dark-mode-only)

For more usage examples, see [examples.md](docs/en/examples.md).

## Building the project

See [build.md](/docs/en/build.md)

## Issues and suggestions

If you found a bug or have suggestions for improvement - don't hesitate to [create issues](https://github.com/dsokolov/goboard/issues)!

## License

MIT License - see the [LICENSE](LICENSE) file for details.
