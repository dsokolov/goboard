# 安装

语言:&nbsp;[English](../en/installation.md)&nbsp;•&nbsp;[Русский](../ru/installation.md)&nbsp;•&nbsp;**中文**

如何安装 GoBoard 插件？有几种方法可以实现。

## 通过 Obsidian 应用程序（推荐）

1. 在 Obsidian 应用程序中，打开社区插件设置：`Settings -> Community plugins`。
2. 如果尚未完成，需要启用第三方插件支持 `Turn on community plugins`。
3. 点击 `Browse` 进入插件选择页面。
4. 在搜索栏中输入 `GoBoard`。
5. 选择插件，点击 `Install`，安装完成后点击 `Enable`。
6. 完成！现在可以绘制棋谱图了！

## 使用 BRAT

如果由于某种原因，通过 Obsidian 界面安装不适合您，
您可以通过 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 安装 GoBoard。

1. 确保您已安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat)。如果没有，请[安装它](https://obsidian.md/plugins?search=BRAT)。
2. 在 BRAT 插件设置中，添加仓库 `https://github.com/dsokolov/goboard`，按照[说明](https://github.com/TfTHacker/obsidian42-brat)操作。
3. 完成！现在可以绘制棋谱图了！

## 手动安装

1. 选择一个[合适的发布版本](https://github.com/dsokolov/goboard/releases)，从中下载 3 个文件：`main.js`、`manifest.json` 和 `styles.css`。
2. 将这些文件复制到您的仓库中，放在目录 `<仓库根目录>/.obsidian/plugins/goboard/` 中。如果这些目录不存在，请创建它们。
3. 在 Obsidian 设置中，启用社区插件支持（如果尚未启用）。
4. 在插件列表中找到并启用 `GoBoard`。可能需要重启 Obsidian。
5. 完成！现在可以绘制棋谱图了！
