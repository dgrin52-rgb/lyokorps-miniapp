// bot/server.js
require("dotenv").config();
const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID ? Number(process.env.ADMIN_ID) : null;
const PORT = process.env.PORT || 5000;

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN missing in bot/.env");
  process.exit(1);
}
if (!ADMIN_ID) {
  console.warn("⚠️ ADMIN_ID missing in bot/.env (admin check will be skipped)");
}

// --- Telegram initData validation (WebApp) ---
function validateInitData(initData, botToken) {
  if (!initData) return { ok: false, reason: "no initData" };

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false, reason: "no hash" };

  params.delete("hash");

  // data_check_string is sorted by key
  const pairs = [];
  [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([k, v]) => pairs.push(`${k}=${v}`));

  const dataCheckString = pairs.join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const ok = computedHash === hash;
  return { ok, reason: ok ? "" : "bad hash" };
}

function getTgUserFromInitData(initData) {
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// --- CORS ---
// Важно: Telegram WebView иногда не присылает Origin. Поэтому:
// - если Origin нет → пропускаем
// - если Origin есть → проверяем белый список
const ALLOWED_ORIGINS = new Set([
  "https://lyokorps.ru",
  "https://www.lyokorps.ru",
  "https://lyokorps-miniapp-sac.vercel.app",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin) {
    // без Origin: часто Telegram WebView / некоторые запросы
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else {
    // если хочешь жёстче: можно блокировать. Сейчас просто не ставим заголовок.
    // return res.status(403).json({ ok: false, error: "CORS blocked", origin });
  }

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Telegram-Init-Data, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// --- middleware auth ---
function requireAdmin(req, res, next) {
  const initData = req.header("X-Telegram-Init-Data") || "";
  const check = validateInitData(initData, BOT_TOKEN);
  if (!check.ok) {
    return res
      .status(401)
      .json({ ok: false, error: "initData invalid", reason: check.reason });
  }

  const user = getTgUserFromInitData(initData);
  if (!user?.id) {
    return res.status(401).json({ ok: false, error: "no user in initData" });
  }

  if (ADMIN_ID && user.id !== ADMIN_ID) {
    return res
      .status(403)
      .json({ ok: false, error: "not admin", user_id: user.id });
  }

  req.tgUser = user;
  next();
}

// --- routes ---
app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/", (req, res) => {
  res.type("text").send("OK. Use /api/admin/*");
});

app.get("/api/admin/me", requireAdmin, (req, res) => {
  res.json({
    ok: true,
    admin: {
      id: req.tgUser.id,
      username: req.tgUser.username,
      first_name: req.tgUser.first_name,
    },
  });
});

// заглушки, чтобы UI не падал
app.get("/api/admin/clients", requireAdmin, (req, res) => {
  res.json({ ok: true, items: [] });
});

app.post("/api/admin/broadcasts", requireAdmin, (req, res) => {
  res.json({ ok: true, id: "demo-broadcast-id" });
});

app.post("/api/admin/broadcasts/:id/start", requireAdmin, (req, res) => {
  res.json({ ok: true });
});

app.get("/api/admin/broadcasts/:id/stats", requireAdmin, (req, res) => {
  res.json({
    ok: true,
    counts: [
      { status: "queued", c: 0 },
      { status: "sent", c: 0 },
      { status: "fail", c: 0 },
    ],
  });
});

app.listen(PORT, () => console.log(`✅ API server on http://localhost:${PORT}`));
