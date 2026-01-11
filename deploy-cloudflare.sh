#!/bin/bash

echo "🚀 Деплой на Cloudflare Pages для ilearningedelweiss.uk"
echo "========================================================"
echo ""

# Проверяем наличие wrangler
if ! command -v wrangler &> /dev/null; then
    echo "📦 Установка Wrangler CLI..."
    npm install -g wrangler
fi

# Проверяем авторизацию
echo "🔐 Проверка авторизации в Cloudflare..."
wrangler whoami

if [ $? -ne 0 ]; then
    echo "⚠️  Вы не авторизованы. Запускаю авторизацию..."
    wrangler login
fi

echo ""
echo "📤 Загрузка сайта на Cloudflare Pages..."
echo ""

# Создаем временную директорию для деплоя
TEMP_DIR=$(mktemp -d)
cp -r . "$TEMP_DIR/" 2>/dev/null
cd "$TEMP_DIR"

# Удаляем ненужные файлы
rm -rf .git node_modules .DS_Store *.sh *.bat ssh-key.txt

# Деплоим
wrangler pages deploy . --project-name=ilearningedelweiss

echo ""
echo "✅ Деплой завершен!"
echo ""
echo "🌐 Ваш сайт будет доступен по адресу:"
echo "   https://ilearningedelweiss.uk"
echo ""
echo "💡 Не забудьте настроить кастомный домен в Cloudflare Pages:"
echo "   1. Перейдите в Workers & Pages → ilearningedelweiss"
echo "   2. Custom domains → Add custom domain"
echo "   3. Добавьте: ilearningedelweiss.uk и www.ilearningedelweiss.uk"
echo ""

