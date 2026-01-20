![GoBoard](./docs/images/goboard_logo.png)

# GoBoard

GoBoard 是一个用于 [Obsidian](https://obsidian.md/) 的插件，用于渲染 [围棋](https://zh.wikipedia.org/wiki/%E5%9B%B4%E6%A3%8B)（也称为 Weiqi 或 Baduk）的棋谱图。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/github/v/release/dsokolov/goboard)](https://github.com/dsokolov/goboard/releases/latest)
[![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22goboard%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=goboard)

语言:&nbsp;[English](README.md)&nbsp;•&nbsp;[Русский](README-ru.md)&nbsp;•&nbsp;**中文**

## 安装

如果您还没有安装 Obsidian - [请下载它](https://obsidian.md/download)。

要安装 [请点击这里](https://obsidian.md/plugins?id=goboard)，或按照以下步骤操作：

1. 在 Obsidian 应用程序中，打开社区插件设置：`Settings -> Community plugins`。
2. 如果尚未完成，需要启用第三方插件支持 `Turn on community plugins`。
3. 点击 `Browse` 进入插件选择页面。
4. 在搜索栏中输入 `GoBoard`。
5. 选择插件，点击 `Install`，安装完成后点击 `Enable`。
6. 完成！现在可以绘制棋谱图了！

其他安装方法请参阅 [installation.md](./docs/zh/installation.md)

## 使用方法

棋谱图基于指定了 `goboard` 语法的 [markdown 代码块](https://www.codecademy.com/resources/docs/markdown/code-blocks) 绘制。

例如，以下代码将绘制一个空的 9x9 棋盘：

<!-- goboard: empty-board-9x9 -->
<pre>
```goboard
size 9x9
```
</pre>

![空的 9x9 棋盘（浅色主题）](/docs/images/empty-board-9x9-light.png#gh-light-mode-only)
![空的 9x9 棋盘（深色主题）](/docs/images/empty-board-9x9-dark.png#gh-dark-mode-only)

要在棋谱图上放置棋子，请使用 `B <位置>` 和 `W <位置>` 分别表示黑子和白子。例如：

<!-- goboard: moves-first-two -->
<pre>
```goboard
size 9x9
B G7
W C3
```
</pre>

![9x9 棋盘上的前两步](/docs/images/moves-first-two-light.png#gh-light-mode-only)
![9x9 棋盘上的前两步](/docs/images/moves-first-two-dark.png#gh-dark-mode-only)

更多使用示例，请参阅 [examples.md](docs/zh/examples.md)。

## 构建项目

请参阅 [build.md](/docs/zh/build.md)

## 问题与建议

如果您发现了错误或有改进建议，请随时[创建问题](https://github.com/dsokolov/goboard/issues)！

## 许可证

MIT 许可证 - 详细信息请参阅 [LICENSE](LICENSE) 文件。
