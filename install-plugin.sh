#!/bin/bash

# Скрипт для установки плагина GoBoard в Obsidian

OBSIDIAN_PLUGINS_DIR="$HOME/Library/Application Support/obsidian/plugins"
PLUGIN_NAME="goboard"
SOURCE_DIR="plugin-dist"
TARGET_DIR="$OBSIDIAN_PLUGINS_DIR/$PLUGIN_NAME"

echo "Установка плагина GoBoard в Obsidian..."

# Создаем директорию плагинов, если её нет
mkdir -p "$OBSIDIAN_PLUGINS_DIR"

# Удаляем старую версию плагина, если есть
if [ -d "$TARGET_DIR" ]; then
    echo "Удаляем старую версию плагина..."
    rm -rf "$TARGET_DIR"
fi

# Копируем новую версию
echo "Копируем плагин в $TARGET_DIR..."
cp -r "$SOURCE_DIR" "$TARGET_DIR"

echo "Плагин установлен! Теперь:"
echo "1. Перезапустите Obsidian"
echo "2. Перейдите в Settings → Community plugins"
echo "3. Включите плагин 'GoBoard'"
echo "4. Откройте файл с диаграммой Го и протестируйте"
