# Настройка DNS записей для Cloudflare Pages

## После создания проекта в Cloudflare Pages:

### 1. Получите URL вашего Pages проекта
После деплоя вы увидите URL вида: `ilearningedelweiss.pages.dev`

### 2. Вернитесь в DNS Records (где вы сейчас находитесь)

### 3. Добавьте CNAME запись для корневого домена:

Нажмите кнопку **"Add record"** и заполните:

- **Type**: Выберите `CNAME`
- **Name**: Введите `@` (символ собаки) или оставьте пустым
- **Target**: Введите `ilearningedelweiss.pages.dev` (URL вашего Pages проекта)
- **Proxy status**: Включите (оранжевое облако должно быть активно)
- **TTL**: Auto

Нажмите **"Save"**

### 4. Добавьте CNAME запись для www (опционально):

- **Type**: `CNAME`
- **Name**: `www`
- **Target**: `ilearningedelweiss.pages.dev`
- **Proxy status**: Включите (оранжевое облако)
- **TTL**: Auto

Нажмите **"Save"**

## Важно:

- После добавления записей подождите 1-2 минуты
- HTTPS включится автоматически
- Сайт будет доступен по адресу: https://ilearningedelweiss.uk

