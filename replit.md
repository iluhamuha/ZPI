# Жизнь после инсульта

Сайт нейропсихолога Людмилы Георгиевны Смирновой. Помощь людям, перенёсшим инсульт, и их близким.

## Run & Operate

- `pnpm --filter @workspace/life-after-stroke run dev` — запустить сайт (порт 23558)
- `pnpm --filter @workspace/api-server run dev` — запустить API-сервер (порт 5000)

## Stack

- Node.js 24, plain ES modules (type: "module")
- Express 5 — сервер + статика + /api/apply маршрут
- Чистый HTML/CSS/JS фронтенд — без React, без сборщиков
- Telegram Bot API — уведомления о заявках
- In-memory rate limiting + honeypot антиспам

## Where things live

- `artifacts/life-after-stroke/server.js` — Express-сервер
- `artifacts/life-after-stroke/public/` — все HTML/CSS/JS файлы
- `artifacts/life-after-stroke/public/css/style.css` — единая таблица стилей
- `artifacts/life-after-stroke/public/js/main.js` — форма, меню, лайтбокс
- `artifacts/life-after-stroke/.env.example` — шаблон переменных окружения
- `artifacts/life-after-stroke/README.md` — инструкции по запуску и деплою

## Site structure

```
/               → public/index.html          (Главная)
/about.html     → public/about.html          (Обо мне)
/courses/       → public/courses/*.html      (3 курса)
/articles/      → public/articles/*.html     (4 статьи + список)
```

## Environment Variables

| Переменная | Описание |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Токен бота Telegram (необязательно — без него заявки логируются в консоль) |
| `TELEGRAM_CHAT_ID` | ID чата для получения заявок |
| `PORT` | Порт (автоматически 23558 в Replit) |

## Deploy to Render / Railway

See `artifacts/life-after-stroke/README.md` — build: `npm install`, start: `npm start`.

## User preferences

- Язык сайта — только русский
- Никакого React, Next.js, сборщиков, баз данных
- Деплой на Render или Railway, не Replit
- Порт из process.env.PORT
