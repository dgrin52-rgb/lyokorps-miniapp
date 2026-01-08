const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function sendByContent(bot, tg_id, content) {
  const { type, value, caption, buttons } = content || {};

  const extra = {};
  if (caption) extra.caption = caption;
  if (buttons?.length) extra.reply_markup = { inline_keyboard: buttons };

  if (type === 'photo') return bot.telegram.sendPhoto(tg_id, value, extra);
  if (type === 'video') return bot.telegram.sendVideo(tg_id, value, extra);
  if (type === 'document') return bot.telegram.sendDocument(tg_id, value, extra);
  if (type === 'animation') return bot.telegram.sendAnimation(tg_id, value, extra);

  return bot.telegram.sendMessage(tg_id, caption || ' ', extra);
}

function startBroadcastWorker({ db, bot, tickMs = 900, batchSize = 10 }) {
  let busy = false;

  setInterval(async () => {
    if (busy) return;
    busy = true;

    try {
      const jobs = db.prepare(`
        SELECT j.id as job_id, j.tg_id, j.broadcast_id, b.content_json
        FROM broadcast_jobs j
        JOIN broadcasts b ON b.id = j.broadcast_id
        WHERE j.status='queued' AND b.status='running'
        ORDER BY j.id ASC
        LIMIT ?
      `).all(batchSize);

      for (const job of jobs) {
        const content = JSON.parse(job.content_json || '{}');

        try {
          await sendByContent(bot, job.tg_id, content);
          db.prepare(`UPDATE broadcast_jobs SET status='sent', sent_at=? WHERE id=?`)
            .run(Date.now(), job.job_id);

          await sleep(60);
        } catch (e) {
          const msg = String(e?.description || e?.message || e);

          if (msg.includes('bot was blocked') || msg.includes('user is deactivated')) {
            db.prepare(`UPDATE clients SET status='blocked' WHERE tg_id=?`).run(job.tg_id);
          }

          if (msg.includes('Too Many Requests') && e?.parameters?.retry_after) {
            const s = Number(e.parameters.retry_after);
            await sleep((s + 1) * 1000);
          }

          db.prepare(`UPDATE broadcast_jobs SET status='failed', error=? WHERE id=?`)
            .run(msg.slice(0, 500), job.job_id);
        }
      }

      db.prepare(`
        UPDATE broadcasts
        SET status='finished', finished_at=?
        WHERE status='running'
          AND NOT EXISTS (
            SELECT 1 FROM broadcast_jobs
            WHERE broadcast_id=broadcasts.id AND status='queued'
          )
      `).run(Date.now());

    } finally {
      busy = false;
    }
  }, tickMs);
}

module.exports = { startBroadcastWorker };
