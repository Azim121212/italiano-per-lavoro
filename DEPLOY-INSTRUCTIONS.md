# Инструкция по деплою на Cloudflare Pages

## Домен: ilearningedelweiss.uk

## Способ 1: Через веб-интерфейс Cloudflare (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Подготовка файлов
1. Файл `site-deploy.zip` уже создан в корне проекта
2. Или создайте ZIP вручную, исключив: `.git`, `node_modules`, `.DS_Store`, `.sh`, `.bat` файлы

### Шаг 2: Создание проекта в Cloudflare Pages
1. Войдите в Cloudflare Dashboard: https://dash.cloudflare.com
2. Перейдите в **Workers & Pages**
3. Нажмите **Create application** → **Pages** → **Upload assets**
4. Назовите проект: `ilearningedelweiss`
5. Загрузите файл `site-deploy.zip`
6. Нажмите **Deploy site**

### Шаг 3: Подключение домена
1. После деплоя перейдите в настройки проекта
2. Откройте вкладку **Custom domains**
3. Нажмите **Set up a custom domain**
4. Введите: `ilearningedelweiss.uk`
5. Добавьте также: `www.ilearningedelweiss.uk`
6. Cloudflare автоматически настроит DNS записи

### Шаг 4: Настройка DNS (если домен не в Cloudflare)
Если домен куплен у другого регистратора:
1. В Cloudflare Dashboard добавьте сайт: **Websites** → **Add a Site**
2. Введите домен: `ilearningedelweiss.uk`
3. Выберите бесплатный план
4. Cloudflare покажет DNS-серверы
5. Обновите DNS-серверы у вашего регистратора домена

## Способ 2: Через Wrangler CLI

### Установка Wrangler
```bash
npm install -g wrangler
# или локально:
npx wrangler
```

### Авторизация
```bash
wrangler login
```

### Деплой
```bash
# Убедитесь, что вы в корне проекта
cd /Users/azimzanryskulov/Downloads/IN

# Деплой
npx wrangler pages deploy . --project-name=ilearningedelweiss
```

## Способ 3: Через GitHub (автоматический деплой)

1. В Cloudflare Pages выберите **Connect to Git**
2. Подключите ваш GitHub репозиторий: `Azim121212/italiano-per-lavoro`
3. Настройки:
   - **Build command**: (оставьте пустым, т.к. статический сайт)
   - **Build output directory**: `/` (корень)
4. Нажмите **Save and Deploy**

## После деплоя

1. Подождите 1-2 минуты для распространения DNS
2. Проверьте сайт: https://ilearningedelweiss.uk
3. HTTPS включен автоматически

## Обновление сайта

- **Веб-интерфейс**: Загрузите новый ZIP файл
- **GitHub**: Просто сделайте `git push` - сайт обновится автоматически
- **Wrangler CLI**: Запустите команду деплоя снова

## Важные файлы

- `_redirects` - настройки редиректов для SPA
- `wrangler.toml` - конфигурация для Wrangler CLI

