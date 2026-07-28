import { Router, type IRouter } from "express";
import https from "https";

const router: IRouter = Router();

// ── In-memory rate limiting ──────────────────────────────────────────────────
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const prev = (rateLimitMap.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (prev.length >= RATE_LIMIT_MAX) return true;
  prev.push(now);
  rateLimitMap.set(ip, prev);
  return false;
}

// ── Telegram ─────────────────────────────────────────────────────────────────
function sendTelegram(token: string, chatId: string, text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ chat_id: chatId, text });
    const options = {
      hostname: "api.telegram.org",
      path: `/bot${token}/sendMessage`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };
    const req = https.request(options, res => {
      let data = "";
      res.on("data", (chunk: string) => (data += chunk));
      res.on("end", () =>
        res.statusCode && res.statusCode >= 200 && res.statusCode < 300
          ? resolve()
          : reject(new Error(`Telegram ${res.statusCode}: ${data}`))
      );
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── POST /api/apply ──────────────────────────────────────────────────────────
router.post("/apply", async (req, res) => {
  const ip =
    (String(req.headers["x-forwarded-for"] || "")).split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Слишком много запросов. Пожалуйста, попробуйте позже." });
  }

  const { name, email, course, website } = req.body as Record<string, string>;

  // Honeypot anti-spam
  if (website) {
    return res.json({ ok: true });
  }

  if (!name?.trim()) {
    return res.status(400).json({ error: "Пожалуйста, укажите ваше имя." });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "Пожалуйста, укажите корректный email." });
  }

  const date = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
  const text = [
    "Новая заявка.",
    `Курс: ${course || "—"}`,
    `Имя: ${name.trim()}`,
    `Email: ${email.trim()}`,
    `Дата: ${date}`,
  ].join("\n");

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log("[ЗАЯВКА]\n" + text);
    return res.json({ ok: true });
  }

  try {
    await sendTelegram(token, chatId, text);
    res.json({ ok: true });
  } catch (err) {
    console.error("[Telegram ошибка]", (err as Error).message);
    res.json({ ok: true });
  }
});

export default router;
