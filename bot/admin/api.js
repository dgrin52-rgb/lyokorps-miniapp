const express = require('express');
const bodyParser = require('body-parser');
const { verifyTelegramInitData } = require('./verifyInitData');

function adminAuth({ BOT_TOKEN, ADMIN_ID }) {
  return (req, res, next) => {
    const initData = req.headers['x-telegram-init-data'];
    if (!initData) return res.status(401).json({ error: 'no_init_data' });

    const v = verifyTelegramInitData(initData, BOT_TOKEN);
    if (!v.ok) return res.status(401).json({ error: v.reason });

    if (!v.user?.id || Number(v.user.id) !== Number(ADMIN_ID)) {
      return res.status(403).json({ error: 'not_admin' });
    }

    req.adminUser = v.user;
    next();
  };
}

function makeAdminApi({ db, BOT_TOKEN, ADMIN_ID }) {
  const app = express();
  app.use(bodyParser.json({ limit: '5mb' }));

  app.get('/api/admin/me', adminAuth({ BOT_TOKEN, ADMIN_ID }), (req, res) => {
    res.json({ ok: true, admin: req.adminUser });
  });

  app.get('/api/admin/clients', adminAuth({ BOT_TOKEN, ADMIN_ID }), (req, res) => {
    const { q, source, status, limit = 50, offset = 0 } = req.query;
    const where = [];
    const args = [];

    if (q) {
      where.push('(username LIKE ? OR first_name LIKE ? OR last_name LIKE ?)');
      args.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (source) { where.push('source = ?'); args.push(source); }
    if (status) { where.push('status = ?'); args.push(status); }

    const sql = `
      SELECT tg_id, username, first_name, last_name, source, last_seen, status, notes
      FROM clients
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY last_seen DESC
      LIMIT ? OFFSET ?
    `;

    args.push(Number(limit), Number(offset));
    const items = db.prepare(sql).all(...args);
    res.json({ items });
  });

  app.patch('/api/admin/clients/:tgId', adminAuth({ BOT_TOKEN, ADMIN_ID }), (req, res) => {
    const tgId = Number(req.params.tgId);
    const { status, notes } = req.body || {};

    const client = db.prepare(`SELECT tg_id FROM clients WHERE tg_id=?`).get(tgId);
    if (!client) return res.status(404).json({ error: 'not_found' });

    if (status) {
      db.prepare(`UPDATE clients SET status=? WHERE tg_id=?`).run(String(status), tgId);
    }
    if (typeof notes === 'string') {
      db.prepare(`UPDATE clients SET notes=? WHERE tg_id=?`).run(notes, tgId);
    }
    res.json({ ok: true });
  });

  app.post('/api/admin/broadcasts', adminAuth({ BOT_TOKEN, ADMIN_ID }), (req, res) => {
    const { title, segment, content } = req.body || {};

    const seg = segment || {};
    const cnt = content || {};

    const created_at = Date.now();
    const r = db.prepare(`
      INSERT INTO broadcasts (title, segment_json, content_json, status, created_at)
      VALUES (?, ?, ?, 'draft', ?)
    `).run(
      title || null,
      JSON.stringify(seg),
      JSON.stringify(cnt),
      created_at
    );

    res.json({ id: r.lastInsertRowid });
  });

  app.post('/api/admin/broadcasts/:id/start', adminAuth({ BOT_TOKEN, ADMIN_ID }), (req, res) => {
    const id = Number(req.params.id);
    const b = db.prepare(`SELECT * FROM broadcasts WHERE id=?`).get(id);
    if (!b) return res.status(404).json({ error: 'not_found' });

    const segment = JSON.parse(b.segment_json);

    const where = ['status = "active"'];
    const args = [];

    if (segment.source) { where.push('source = ?'); args.push(segment.source); }
    if (segment.lastSeenDays) {
      const ms = Number(segment.lastSeenDays) * 24 * 60 * 60 * 1000;
      where.push('last_seen >= ?');
      args.push(Date.now() - ms);
    }

    const clients = db.prepare(`
      SELECT tg_id FROM clients
      WHERE ${where.join(' AND ')}
      ORDER BY last_seen DESC
    `).all(...args);

    const ins = db.prepare(`INSERT INTO broadcast_jobs (broadcast_id, tg_id, status) VALUES (?, ?, 'queued')`);
    const trx = db.transaction(() => clients.forEach(c => ins.run(id, c.tg_id)));
    trx();

    db.prepare(`UPDATE broadcasts SET status='running', started_at=? WHERE id=?`).run(Date.now(), id);

    res.json({ ok: true, total: clients.length });
  });

  app.get('/api/admin/broadcasts/:id/stats', adminAuth({ BOT_TOKEN, ADMIN_ID }), (req, res) => {
    const id = Number(req.params.id);
    const counts = db.prepare(`
      SELECT status, COUNT(*) as c
      FROM broadcast_jobs
      WHERE broadcast_id=?
      GROUP BY status
    `).all(id);

    res.json({ counts });
  });

  return app;
}

module.exports = { makeAdminApi };
