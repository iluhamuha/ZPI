import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ── In-memory rate limiting (no external libs) ──────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip) {
  const now = Date.now();
  const prev = (rateLimitMap.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (prev.length >= RATE_LIMIT_MAX) return true;
  prev.push(now);
  rateLimitMap.set(ip, prev);
  return false;
}

// ── Telegram ─────────────────────────────────────────────────────────────────
function sendTelegram(token, chatId, text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ chat_id: chatId, text });
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () =>
        res.statusCode >= 200 && res.statusCode < 300
          ? resolve(data)
          : reject(new Error(`Telegram ${res.statusCode}: ${data}`))
      );
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── POST /api/apply ──────────────────────────────────────────────────────────
app.post('/api/apply', async (req, res) => {
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'unknown';

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Слишком много запросов. Пожалуйста, попробуйте позже.' });
  }

  const { name, email, message, course, honeypot } = req.body;

  // Honeypot anti-spam: bots fill hidden fields, humans don't
  if (honeypot) {
    return res.json({ ok: true });
  }

  // Validation
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Пожалуйста, укажите ваше имя.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'Пожалуйста, укажите корректный email.' });
  }

  const date = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  const text = [
    'Новая заявка.',
    `Курс: ${course || '—'}`,
    `Имя: ${name.trim()}`,
    `Email: ${email.trim()}`,
    `Сообщение: ${message.trim()}`,
    `Дата: ${date}`,
  ].join('\n');

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Dev mode: log and succeed
    console.log('[ЗАЯВКА]\n' + text);
    return res.json({ ok: true });
  }

  try {
    await sendTelegram(token, chatId, text);
    res.json({ ok: true });
  } catch (err) {
    console.error('[Telegram ошибка]', err.message);
    // Succeed silently so the user isn't confused by Telegram issues
    res.json({ ok: true });
  }
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  const file404 = path.join(__dirname, 'public', '404.html');
  res.status(404).sendFile(file404, err => {
    if (err) res.status(404).send('404 — страница не найдена');
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
