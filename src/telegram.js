// src/telegram.js

export const tg = window.Telegram?.WebApp || null;

export function initTelegram() {
  if (!tg) {
    console.warn('Telegram WebApp API не найден (не в Telegram)');
    return;
  }

  tg.ready();
  tg.expand();

  console.log('Telegram Mini App инициализирован');
  console.log('initDataUnsafe:', tg.initDataUnsafe);
}

export function isTelegram() {
  return !!tg;
}

export function openTelegramLink(url) {
  if (tg) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, '_blank');
  }
}
