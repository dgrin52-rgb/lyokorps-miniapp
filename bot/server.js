// bot/server.js
require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID ? Number(process.env.ADMIN_ID) : null;

// === sanity ===
if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN missing in bot/.env or Render env");
  process.exit(1);
}
if (!ADMIN_ID) {
  console.warn("⚠️ ADMIN_ID missing (admin will always fail)");
}

// === DB ===
const db = new Database(process.env.SQLITE_PATH || "./storage/db.sqlite");
db.pragma("journal_mode = WAL");

// Create tables if missing
db.exec(`
CREATE TABLE IF NOT EXISTS clients (
  tg_id INTEGER PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  source TEXT,
  status TEXT DEFAULT 'active', -- active|banned
  created_at TEXT DEFAULT (datetime('now')),
  last_seen TEXT
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tg_id INTEGER,
  username TEXT,
  first_name TEXT,
  text TEXT,
  status TEXT DEFAULT 'new', -- new|in_work|done|trash
  admin_note TEXT DEFAULT '',
  source TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pricelist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS broadcasts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  segment_json TEXT NOT NULL,
  content_json TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- draft|queued|sending|done|failed
  created_at TEXT DEFAULT (datetime('now')),
  started_at TEXT,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS broadcast_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  broadcast_id INTEGER NOT NULL,
  tg_id INTEGER NOT NULL,
  status TEXT DEFAULT 'queued', -- queued|sent|fail
  error TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_clients_source ON clients(source);
CREATE INDEX IF NOT EXISTS idx_clients_last_seen ON clients(last_seen);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_broadcast_jobs_bid ON broadcast_jobs(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_jobs_status ON broadcast_jobs(status);
`);

// === Telegram initData validation (WebApp) ===
function validateInitData(initData, botToken) {
  if (!initData) return { ok: false, reason: "no initData" };

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false, reason: "no hash" };

  params.delete("hash");

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

// CORS (если фронт и бэк на разных доменах)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Telegram-Init-Data");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Admin auth middleware
function requireAdmin(req, res, next) {
  const initData = req.header("X-Telegram-Init-Data") || "";
  const check = validateInitData(initData, BOT_TOKEN);
  if (!check.ok) return res.status(401).json({ ok: false, error: "initData invalid", reason: check.reason });

  const user = getTgUserFromInitData(initData);
  if (!user?.id) return res.status(401).json({ ok: false, error: "no user in initData" });

  if (ADMIN_ID && user.id !== ADMIN_ID) {
    return res.status(403).json({ ok: false, error: "not admin", user_id: user.id });
  }

  req.tgUser = user;
  next();
}

// === helpers ===
function now() {
  return new Date().toISOString();
}

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// === Admin: me ===
app.get("/api/admin/me", requireAdmin, (req, res) => {
  res.json({
    ok: true,
    admin: { id: req.tgUser.id, username: req.tgUser.username, first_name: req.tgUser.first_name },
  });
});

// === Admin: clients ===
app.get("/api/admin/clients", requireAdmin, (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  const source = String(req.query.source || "").trim();
  const status = String(req.query.status || "").trim();
  const lastSeenDays = req.query.lastSeenDays ? Number(req.query.lastSeenDays) : null;

  let where = "1=1";
  const params = {};

  if (q) {
    where += " AND (lower(username) LIKE @q OR lower(first_name) LIKE @q OR cast(tg_id as text) LIKE @qExact)";
    params.q = `%${q}%`;
    params.qExact = `%${q}%`;
  }
  if (source) {
    where += " AND source = @source";
    params.source = source;
  }
  if (status) {
    where += " AND status = @status";
    params.status = status;
  }
  if (Number.isFinite(lastSeenDays) && lastSeenDays !== null) {
    // last_seen >= now - N days
    where += " AND last_seen IS NOT NULL AND datetime(last_seen) >= datetime('now', @shift)";
    params.shift = `-${lastSeenDays} days`;
  }

  const stmt = db.prepare(`
    SELECT tg_id, username, first_name, last_name, source, status, created_at, last_seen
    FROM clients
    WHERE ${where}
    ORDER BY datetime(last_seen) DESC NULLS LAST, datetime(created_at) DESC
    LIMIT 500
  `);

  res.json({ ok: true, items: stmt.all(params) });
});

app.put("/api/admin/clients/:tgId/status", requireAdmin, (req, res) => {
  const tgId = Number(req.params.tgId);
  const status = String(req.body.status || "").trim();
  if (!tgId) return res.status(400).json({ ok: false, error: "bad tgId" });
  if (!["active", "banned"].includes(status)) return res.status(400).json({ ok: false, error: "bad status" });

  const upd = db.prepare(`UPDATE clients SET status=@status WHERE tg_id=@tg_id`).run({ status, tg_id: tgId });
  res.json({ ok: true, changed: upd.changes });
});

// === Admin: leads ===
app.get("/api/admin/leads", requireAdmin, (req, res) => {
  const status = String(req.query.status || "").trim(); // optional
  const q = String(req.query.q || "").trim().toLowerCase();

  let where = "1=1";
  const params = {};

  if (status) {
    where += " AND status = @status";
    params.status = status;
  }
  if (q) {
    where += " AND (lower(username) LIKE @q OR lower(first_name) LIKE @q OR lower(text) LIKE @q)";
    params.q = `%${q}%`;
  }

  const stmt = db.prepare(`
    SELECT id, tg_id, username, first_name, text, status, admin_note, source, created_at, updated_at
    FROM leads
    WHERE ${where}
    ORDER BY datetime(created_at) DESC
    LIMIT 500
  `);

  res.json({ ok: true, items: stmt.all(params) });
});

app.put("/api/admin/leads/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const status = req.body.status != null ? String(req.body.status) : null;
  const admin_note = req.body.admin_note != null ? String(req.body.admin_note) : null;

  const allowed = ["new", "in_work", "done", "trash"];
  if (!id) return res.status(400).json({ ok: false, error: "bad id" });
  if (status !== null && !allowed.includes(status)) return res.status(400).json({ ok: false, error: "bad status" });

  const lead = db.prepare(`SELECT * FROM leads WHERE id=?`).get(id);
  if (!lead) return res.status(404).json({ ok: false, error: "not found" });

  const newStatus = status ?? lead.status;
  const newNote = admin_note ?? lead.admin_note;

  db.prepare(`
    UPDATE leads
    SET status=@status, admin_note=@admin_note, updated_at=@updated_at
    WHERE id=@id
  `).run({ status: newStatus, admin_note: newNote, updated_at: now(), id });

  res.json({ ok: true });
});

// === Admin: pricelist ===
app.get("/api/admin/pricelist", requireAdmin, (req, res) => {
  const items = db
    .prepare(
      `SELECT id, section, title, price, description, sort, is_active
       FROM pricelist
       ORDER BY section ASC, sort ASC, id ASC`
    )
    .all();

  res.json({ ok: true, items });
});

app.post("/api/admin/pricelist", requireAdmin, (req, res) => {
  const section = String(req.body.section || "").trim();
  const title = String(req.body.title || "").trim();
  const price = String(req.body.price || "").trim();
  const description = String(req.body.description || "");
  const sort = Number.isFinite(Number(req.body.sort)) ? Number(req.body.sort) : 0;
  const is_active = req.body.is_active === 0 ? 0 : 1;

  if (!section || !title || !price) return res.status(400).json({ ok: false, error: "section/title/price required" });

  const r = db
    .prepare(
      `INSERT INTO pricelist(section,title,price,description,sort,is_active)
       VALUES(@section,@title,@price,@description,@sort,@is_active)`
    )
    .run({ section, title, price, description, sort, is_active });

  res.json({ ok: true, id: r.lastInsertRowid });
});

app.put("/api/admin/pricelist/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: "bad id" });

  const row = db.prepare(`SELECT * FROM pricelist WHERE id=?`).get(id);
  if (!row) return res.status(404).json({ ok: false, error: "not found" });

  const next = {
    section: req.body.section != null ? String(req.body.section).trim() : row.section,
    title: req.body.title != null ? String(req.body.title).trim() : row.title,
    price: req.body.price != null ? String(req.body.price).trim() : row.price,
    description: req.body.description != null ? String(req.body.description) : row.description,
    sort: req.body.sort != null ? Number(req.body.sort) : row.sort,
    is_active: req.body.is_active != null ? (Number(req.body.is_active) ? 1 : 0) : row.is_active,
  };

  db.prepare(
    `UPDATE pricelist
     SET section=@section, title=@title, price=@price, description=@description, sort=@sort, is_active=@is_active
     WHERE id=@id`
  ).run({ ...next, id });

  res.json({ ok: true });
});

app.delete("/api/admin/pricelist/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: "bad id" });
  const r = db.prepare(`DELETE FROM pricelist WHERE id=?`).run(id);
  res.json({ ok: true, changed: r.changes });
});

// === Admin: broadcasts (DB only, sending will be in worker next step) ===
app.post("/api/admin/broadcasts", requireAdmin, (req, res) => {
  const title = String(req.body.title || "").trim() || "Рассылка";
  const segment = req.body.segment || {};
  const content = req.body.content || {};

  if (!content?.type || !content?.value) {
    return res.status(400).json({ ok: false, error: "content.type and content.value required" });
  }

  const r = db
    .prepare(
      `INSERT INTO broadcasts(title, segment_json, content_json, status)
       VALUES(@title, @segment_json, @content_json, 'draft')`
    )
    .run({
      title,
      segment_json: JSON.stringify(segment || {}),
      content_json: JSON.stringify(content || {}),
    });

  res.json({ ok: true, id: r.lastInsertRowid });
});

app.get("/api/admin/broadcasts/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare(`SELECT * FROM broadcasts WHERE id=?`).get(id);
  if (!row) return res.status(404).json({ ok: false, error: "not found" });

  res.json({
    ok: true,
    item: {
      ...row,
      segment: safeJsonParse(row.segment_json, {}),
      content: safeJsonParse(row.content_json, {}),
    },
  });
});

app.post("/api/admin/broadcasts/:id/start", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const b = db.prepare(`SELECT * FROM broadcasts WHERE id=?`).get(id);
  if (!b) return res.status(404).json({ ok: false, error: "not found" });

  // Mark as queued. Worker будет подхватывать queued/sending
  db.prepare(
    `UPDATE broadcasts SET status='queued', started_at=@started_at WHERE id=@id`
  ).run({ started_at: now(), id });

  res.json({ ok: true });
});

app.get("/api/admin/broadcasts/:id/stats", requireAdmin, (req, res) => {
  const id = Number(req.params.id);

  const counts = db
    .prepare(
      `SELECT status, COUNT(*) as c
       FROM broadcast_jobs
       WHERE broadcast_id=?
       GROUP BY status`
    )
    .all(id);

  const b = db.prepare(`SELECT status FROM broadcasts WHERE id=?`).get(id);

  res.json({ ok: true, broadcast_status: b?.status || "?", counts });
});

// === Admin: stats ===
app.get("/api/admin/stats/overview", requireAdmin, (req, res) => {
  const totalClients = db.prepare(`SELECT COUNT(*) as c FROM clients`).get().c;
  const totalLeads = db.prepare(`SELECT COUNT(*) as c FROM leads`).get().c;

  const bySource = db
    .prepare(
      `SELECT COALESCE(source,'(none)') as source, COUNT(*) as c
       FROM clients
       GROUP BY COALESCE(source,'(none)')
       ORDER BY c DESC`
    )
    .all();

  const leadsByStatus = db
    .prepare(
      `SELECT status, COUNT(*) as c
       FROM leads
       GROUP BY status
       ORDER BY c DESC`
    )
    .all();

  res.json({ ok: true, totalClients, totalLeads, bySource, leadsByStatus });
});

// === health/root ===
app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/", (req, res) => res.type("text").send("OK. Use /api/admin/*"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ API server on http://localhost:${PORT}`));
