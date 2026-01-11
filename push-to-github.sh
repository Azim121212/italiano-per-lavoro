#!/bin/bash

echo "📤 Попытка загрузки проекта на GitHub..."
echo ""

# Проверяем подключение
echo "🔍 Проверка SSH подключения..."
ssh -T git@github.com 2>&1 | grep -q "successfully authenticated" && echo "✅ SSH подключение работает!" || echo "⚠️  SSH ключ еще не добавлен или репозиторий не создан"

echo ""
echo "📤 Загрузка проекта..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ✅ ✅ УСПЕХ! Проект загружен!"
    echo ""
    echo "🌐 Следующие шаги:"
    echo "   1. Перейдите: https://github.com/Azim121212/italiano-per-lavoro/settings/pages"
    echo "   2. Source: main → / (root)"
    echo "   3. Save"
    echo ""
    echo "🌐 Ваш сайт будет доступен:"
    echo "   https://azim121212.github.io/italiano-per-lavoro/"
else
    echo ""
    echo "❌ Не удалось загрузить"
    echo ""
    echo "Убедитесь что:"
    echo "   1. SSH ключ добавлен: https://github.com/settings/ssh"
    echo "   2. Репозиторий создан: https://github.com/Azim121212/italiano-per-lavoro"
    echo ""
    echo "SSH ключ для добавления:"
    cat ~/.ssh/id_ed25519.pub
fi


