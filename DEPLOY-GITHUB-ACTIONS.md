# Настройка автоматического деплоя через GitHub Actions

## Шаг 1: Получите API токен Cloudflare

1. Перейдите: https://dash.cloudflare.com/profile/api-tokens
2. Нажмите **"Create Token"**
3. Используйте шаблон: **"Edit Cloudflare Workers"** или создайте кастомный:
   - **Permissions**: 
     - Account → Cloudflare Pages → Edit
   - **Account Resources**: 
     - Include → All accounts
4. Скопируйте токен (он показывается только один раз!)

## Шаг 2: Получите Account ID

1. В Cloudflare Dashboard выберите любой домен
2. В правой панели найдите **"Account ID"**
3. Скопируйте его

## Шаг 3: Добавьте секреты в GitHub

1. Перейдите: https://github.com/Azim121212/italiano-per-lavoro/settings/secrets/actions
2. Нажмите **"New repository secret"**
3. Добавьте два секрета:

   **Секрет 1:**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: (ваш API токен из шага 1)

   **Секрет 2:**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: (ваш Account ID из шага 2)

## Шаг 4: Запушьте изменения

Файл `.github/workflows/deploy-cloudflare.yml` уже создан в проекте.

Просто сделайте:
```bash
git add .github/workflows/deploy-cloudflare.yml
git commit -m "Добавлен GitHub Actions для автоматического деплоя"
git push origin main
```

## После этого:

- Каждый `git push` будет автоматически деплоить сайт на Cloudflare Pages
- Проверить статус деплоя можно в GitHub: Actions → Deploy to Cloudflare Pages

