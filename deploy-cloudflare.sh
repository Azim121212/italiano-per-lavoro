#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Деплой на Cloudflare Pages для ilearningedelweiss.uk${NC}"
echo "========================================================"
echo ""

# Получаем путь к проекту
PROJECT_DIR="/Users/azimzanryskulov/Downloads/IN"
cd "$PROJECT_DIR" || {
    echo -e "${RED}❌ Ошибка: не удалось перейти в директорию проекта${NC}"
    exit 1
}

# Проверяем, что мы в правильной директории
if [ ! -f "index.html" ]; then
    echo -e "${RED}❌ Ошибка: index.html не найден${NC}"
    echo "Убедитесь, что вы находитесь в корневой директории проекта"
    exit 1
fi

# Проверяем наличие git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git не найден. Установите Git${NC}"
    exit 1
fi

# Проверяем наличие npm/node
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm не найден. Установите Node.js и npm${NC}"
    exit 1
fi

# Проверяем авторизацию через npx wrangler
echo -e "${BLUE}🔐 Проверка авторизации в Cloudflare...${NC}"
if ! npx wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Вы не авторизованы. Запускаю авторизацию...${NC}"
    npx wrangler login
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Ошибка авторизации${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}📝 Проверка изменений в Git...${NC}"

# Проверяем статус git
if [ -d ".git" ]; then
    # Проверяем есть ли изменения
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}📦 Обнаружены изменения. Добавляю в Git...${NC}"
        
        # Добавляем все изменения
        git add .
        
        # Создаем коммит с текущей датой и временем
        COMMIT_MSG="Обновление сайта $(date '+%Y-%m-%d %H:%M:%S')"
        git commit -m "$COMMIT_MSG"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Изменения закоммичены${NC}"
        else
            echo -e "${YELLOW}⚠️  Нет изменений для коммита или ошибка коммита${NC}"
        fi
    else
        echo -e "${GREEN}✅ Нет изменений для коммита${NC}"
    fi
    
    # Пушим изменения
    echo -e "${BLUE}📤 Отправка изменений в Git...${NC}"
    git push origin main 2>/dev/null || git push origin master 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Ошибка при push в Git (продолжаем деплой)${NC}"
    }
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Изменения отправлены в Git${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Git репозиторий не инициализирован (продолжаем деплой)${NC}"
fi

echo ""
echo -e "${BLUE}📤 Загрузка сайта на Cloudflare Pages...${NC}"
echo ""

# Деплоим напрямую из текущей директории
npx wrangler pages deploy . --project-name=ilearningedelweiss

DEPLOY_STATUS=$?

if [ $DEPLOY_STATUS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Деплой завершен успешно!${NC}"
    echo ""
    echo -e "${BLUE}🌐 Ваш сайт будет доступен по адресу:${NC}"
    echo "   https://ilearningedelweiss.pages.dev"
    echo "   https://ilearningedelweiss.uk (после настройки домена)"
    echo ""
    echo -e "${YELLOW}💡 Настройка кастомного домена:${NC}"
    echo "   1. Перейдите: https://dash.cloudflare.com/workers-and-pages"
    echo "   2. Выберите проект: ilearningedelweiss"
    echo "   3. Custom domains → Add custom domain"
    echo "   4. Добавьте: ilearningedelweiss.uk"
    echo "   5. Добавьте: www.ilearningedelweiss.uk (опционально)"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Ошибка при деплое${NC}"
    exit 1
fi

