const crypto = require('crypto');

function parseInitData(initData) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([k,v]) => `${k}=${v}`)
    .join('\n');

  return { hash, dataCheckString, params };
}

function verifyTelegramInitData(initData, botToken) {
  const { hash, dataCheckString, params } = parseInitData(initData);
  if (!hash) return { ok: false, reason: 'no_hash' };

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computed = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computed !== hash) return { ok: false, reason: 'bad_hash' };

  const userRaw = params.get('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  return { ok: true, user };
}

module.exports = { verifyTelegramInitData };
