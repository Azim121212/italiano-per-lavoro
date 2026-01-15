#!/bin/bash

# Упрощенный скрипт деплоя на Cloudflare Pages
# Использование: ./deploy.sh

PROJECT_DIR="/Users/azimzanryskulov/Downloads/IN"
cd "$PROJECT_DIR" || exit 1

echo "🚀 Деплой на Cloudflare Pages"
echo ""

# Git commit и push
if [ -d ".git" ]; then
    echo "📝 Коммит изменений..."
    git add . 2>/dev/null
    git commit -m "Обновление сайта $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null
    echo "📤 Push в Git..."
    git push origin main 2>/dev/null || git push origin master 2>/dev/null
fi

# Проверка Wrangler
if ! command -v wrangler &> /dev/null; then
    echo "📦 Установка Wrangler..."
    npm install -g wrangler || {
        echo "❌ Ошибка: установите Node.js и npm"
        exit 1
    }
fi

# Авторизация
wrangler whoami &> /dev/null || wrangler login

# Деплой
echo "📤 Загрузка на Cloudflare Pages..."
npx wrangler pages deploy . --project-name=ilearningedelweiss

echo ""
echo "✅ Готово! Сайт: https://ilearningedelweiss.pages.dev"

