![GoBoard](./docs/images/goboard_logo.png)

# GoBoard

GoBoard is a plugin for [Obsidian](https://obsidian.md/) that renders [Go game](https://en.wikipedia.org/wiki/Go_(game)) diagrams (also known as Weiqi or Baduk).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.10.1-green.svg)
![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22goboard%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)

## Installation

Currently, the GoBoard plugin is available for beta testing through [BRAT](https://github.com/TfTHacker/obsidian42-brat).

1. If you don't have BRAT yet, [install it](https://obsidian.md/plugins?search=BRAT).
1. In the BRAT plugin settings, add the repository `https://github.com/dsokolov/goboard`, following the [instructions](https://github.com/TfTHacker/obsidian42-brat).
1. Done, now you can draw diagrams!

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
```gboard
size 9x9
B G7
W C3
```
</pre>

![First two moves on 9x9 goban (light theme)](/docs/images/moves-first-two-light.png#gh-light-mode-only)
![First two moves on 9x9 goban (dark theme)](/docs/images/moves-first-two-dark.png#gh-dark-mode-only)

For more usage examples, see [examples.md](docs/examples.md).

## Building the project

Build the project, including copying the distribution to the development vault:

```
npm run build
```

Running tests:

```
npm test
```

Running linter:

```
npm run lint
```

Updating test baselines:

```
npm run update-baseline
```

Updating documentation images:

```
npm run update-docs
```

## Issues and suggestions

If you found a bug or have suggestions for improvement - don't hesitate to [create issues](https://github.com/dsokolov/goboard/issues)!

## License

MIT License - see the [LICENSE](LICENSE) file for details.
