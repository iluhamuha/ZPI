# Жизнь после инсульта

Сайт нейропсихолога Людмилы Георгиевны Смирновой. Node.js + Express, статические HTML/CSS/JS файлы. Без баз данных и фреймворков.

## Требования

- Node.js 18+

## Локальный запуск

```bash
# 1. Установите зависимости
npm install

# 2. Скопируйте файл с переменными окружения и заполните его
cp .env.example .env

# 3. Запустите сервер
npm start
```

Сайт откроется на `http://localhost:3000`.

**Без Telegram** (переменные не заданы) заявки будут выводиться в консоль — сайт работает в полном объёме.

## Переменные окружения

| Переменная | Описание |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Токен бота, созданного через @BotFather |
| `TELEGRAM_CHAT_ID` | ID чата/канала для получения заявок |
| `PORT` | Порт сервера (по умолчанию 3000) |

## Деплой на Render

1. Создайте новый **Web Service** на [render.com](https://render.com)
2. Подключите ваш GitHub-репозиторий
3. Настройки:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. В разделе **Environment** добавьте переменные `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`
5. Нажмите **Deploy**

## Деплой на Railway

1. Создайте новый проект на [railway.app](https://railway.app)
2. Выберите **Deploy from GitHub repo**
3. В разделе **Variables** добавьте `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`
4. Railway автоматически определит `npm start` как команду запуска

## Структура проекта

```
├── server.js          # Express-сервер
├── public/
│   ├── css/style.css  # Стили
│   ├── js/main.js     # Скрипты (форма, лайтбокс)
│   ├── index.html     # Главная страница
│   ├── about.html     # Обо мне
│   ├── courses/       # Страницы курсов
│   └── articles/      # Статьи
├── .env.example
└── README.md
```

## Telegram: как настроить

1. Напишите [@BotFather](https://t.me/BotFather) и создайте бота командой `/newbot`
2. Скопируйте токен в `TELEGRAM_BOT_TOKEN`
3. Узнайте ваш `chat_id` через [@userinfobot](https://t.me/userinfobot)
4. Напишите боту хотя бы одно сообщение, чтобы он мог отвечать вам

## Замена плейсхолдеров

- **Фото** (на странице «Обо мне»): замените серый прямоугольник на реальное фото в тегах `<img>`
- **Дипломы**: загрузите фото дипломов в `public/img/diplomas/` и замените плейсхолдеры
- **Тексты курсов**: найдите комментарии `<!-- PLACEHOLDER -->` в HTML-файлах курсов
- **YouTube-видео**: замените `https://www.youtube.com/embed/XXXXXXXXXXXX` в статьях реальными ссылками
- **Email в футере**: найдите `info@example.com` и замените на реальный адрес
