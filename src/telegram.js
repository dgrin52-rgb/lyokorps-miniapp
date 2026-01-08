// src/telegram.js

export function getTg() {
  // безопасно даже если window почему-то отсутствует
  return (typeof window !== 'undefined' && window.Telegram?.WebApp) ? window.Telegram.WebApp : null;
}

export function initTelegram() {
  const tg = getTg();

  if (!tg) {
    console.warn('Telegram WebApp API не найден (не в Telegram)');
    return null;
  }

  try {
    tg.ready?.();
    tg.expand?.();

    // визуальная часть (тоже безопасно)
    tg.setHeaderColor?.('#000000');
    tg.setBackgroundColor?.('#000000');

    console.log('Telegram Mini App инициализирован');
    console.log('initDataUnsafe:', tg.initDataUnsafe);
  } catch (e) {
    console.error('Ошибка инициализации Telegram WebApp:', e);
  }

  return tg;
}

export function isTelegram() {
  return !!getTg();
}

export function openTelegramLink(url) {
  const tg = getTg();
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
