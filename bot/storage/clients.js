function getStartPayload(ctx) {
  const text = ctx.message?.text || '';
  if (!text.startsWith('/start')) return null;
  const parts = text.split(' ');
  return parts[1] || null;
}

function upsertClient(db, ctx) {
  const u = ctx.from;
  if (!u?.id) return;

  const payload = getStartPayload(ctx);
  const source = payload || null;

  db.prepare(`
    INSERT INTO clients (tg_id, username, first_name, last_name, source, last_seen, status)
    VALUES (?, ?, ?, ?, COALESCE(?, source), ?, 'active')
    ON CONFLICT(tg_id) DO UPDATE SET
      username=excluded.username,
      first_name=excluded.first_name,
      last_name=excluded.last_name,
      source=COALESCE(excluded.source, clients.source),
      last_seen=excluded.last_seen
  `).run(
    u.id,
    u.username || null,
    u.first_name || null,
    u.last_name || null,
    source,
    Date.now()
  );
}

module.exports = { upsertClient };
