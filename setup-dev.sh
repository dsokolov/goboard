#!/bin/bash

# Скрипт для настройки среды разработки плагина Obsidian Go
# Создает символическую ссылку и настраивает dev-vault

set -e  # Остановить выполнение при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Настройка среды разработки для Obsidian Go Plugin${NC}"

# Получить абсолютный путь к проекту
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEV_VAULT_DIR="$PROJECT_DIR/dev-vault"
PLUGINS_DIR="$DEV_VAULT_DIR/.obsidian/plugins"
PLUGIN_LINK="$PLUGINS_DIR/obsidian-go-plugin"

echo -e "${YELLOW}📁 Проект: $PROJECT_DIR${NC}"
echo -e "${YELLOW}📁 Dev Vault: $DEV_VAULT_DIR${NC}"

# Проверить существование dev-vault
if [ ! -d "$DEV_VAULT_DIR" ]; then
    echo -e "${RED}❌ Папка dev-vault не найдена!${NC}"
    echo -e "${YELLOW}💡 Создайте структуру проекта сначала${NC}"
    exit 1
fi

# Создать папку plugins если не существует
if [ ! -d "$PLUGINS_DIR" ]; then
    echo -e "${YELLOW}📁 Создаю папку plugins...${NC}"
    mkdir -p "$PLUGINS_DIR"
fi

# Удалить существующую ссылку если есть
if [ -L "$PLUGIN_LINK" ] || [ -d "$PLUGIN_LINK" ]; then
    echo -e "${YELLOW}🗑️  Удаляю существующую ссылку...${NC}"
    rm -rf "$PLUGIN_LINK"
fi

# Создать символическую ссылку
echo -e "${YELLOW}🔗 Создаю символическую ссылку...${NC}"
ln -s "$PROJECT_DIR" "$PLUGIN_LINK"

# Проверить создание ссылки
if [ -L "$PLUGIN_LINK" ]; then
    echo -e "${GREEN}✅ Символическая ссылка создана успешно!${NC}"
    echo -e "${GREEN}   $PLUGIN_LINK -> $PROJECT_DIR${NC}"
else
    echo -e "${RED}❌ Ошибка создания символической ссылки${NC}"
    exit 1
fi

# Проверить наличие основных файлов плагина
echo -e "${YELLOW}🔍 Проверяю файлы плагина...${NC}"

REQUIRED_FILES=("manifest.json" "styles.css")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$PROJECT_DIR/$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${RED}❌ Отсутствуют файлы:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo -e "${RED}   - $file${NC}"
    done
    echo -e "${YELLOW}💡 Создайте недостающие файлы перед сборкой${NC}"
fi

# Проверить package.json и предложить установку зависимостей
if [ -f "$PROJECT_DIR/package.json" ]; then
    if [ ! -d "$PROJECT_DIR/node_modules" ]; then
        echo -e "${YELLOW}📦 Зависимости не установлены${NC}"
        echo -e "${YELLOW}💡 Запустите: npm install${NC}"
    else
        echo -e "${GREEN}✅ Зависимости установлены${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Настройка завершена!${NC}"
echo ""
echo -e "${YELLOW}📋 Следующие шаги:${NC}"
echo -e "${YELLOW}1. Установите зависимости: npm install${NC}"
echo -e "${YELLOW}2. Соберите плагин: npm run build${NC}"
echo -e "${YELLOW}3. Откройте папку dev-vault в Obsidian как vault${NC}"
echo -e "${YELLOW}4. Установите плагин 'Hot Reload' в Obsidian${NC}"
echo -e "${YELLOW}5. Включите ваш плагин в настройках${NC}"
echo ""
echo -e "${GREEN}🔗 Dev Vault: $DEV_VAULT_DIR${NC}"
