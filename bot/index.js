require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { initDb } = require('./db');
const { upsertClient } = require('./storage/clients');
const { makeAdminApi } = require('./admin/api');
const { startBroadcastWorker } = require('./admin/broadcastWorker');


const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;
const ADMIN_ID = process.env.ADMIN_ID ? Number(process.env.ADMIN_ID) : null;
const CHANNEL_ID = process.env.CHANNEL_ID ? String(process.env.CHANNEL_ID) : null;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not found in .env');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const db = initDb();

// чтобы бот вообще никогда не падал
bot.catch((err) => console.error('🔥 bot.catch:', err));
process.on('unhandledRejection', (e) => console.error('🔥 unhandledRejection:', e));
process.on('uncaughtException', (e) => console.error('🔥 uncaughtException:', e));
bot.use(async (ctx, next) => {
  try { upsertClient(db, ctx); } catch (e) { console.error('upsertClient', e); }
  return next();
});


const state = {}; // state[chatId] = { step, name, service, budget, comment, lastBotMessageId }

// ---------- helpers ----------
async function safeDelete(ctx, chatId, messageId) {
  if (!messageId) return;
  try {
    await ctx.telegram.deleteMessage(chatId, messageId);
  } catch (_) {}
}

async function sendClean(ctx, text, extra = {}) {
  const chatId = ctx.chat.id;

  if (state[chatId]?.lastBotMessageId) {
    await safeDelete(ctx, chatId, state[chatId].lastBotMessageId);
  }

  const msg = await ctx.reply(text, extra);

  state[chatId] = {
    ...(state[chatId] || {}),
    lastBotMessageId: msg.message_id,
  };

  return msg;
}

function mainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🧠 Разобраться, нужен ли мне бот', 'need_bot')],
    [Markup.button.callback('🔍 Кейсы и решения', 'price')],
    [Markup.button.callback('💬 Сразу написать Даше', 'form_start')],
    [Markup.button.callback('🎮 Игра + бонус', 'game')],
  ]);
}

function priceMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📊 Аналитика и источники заявок', 'case_analytics')],
    [Markup.button.callback('💳 Клуб по подписке', 'case_club')],
    [Markup.button.callback('🧩 Mini App внутри Telegram', 'case_miniapp')],
    [Markup.button.callback('🔙 В главное меню', 'back_main')],
  ]);
}

async function notifyAdmin(text) {
  // тебе в личку
  if (ADMIN_ID) {
    try {
      await bot.telegram.sendMessage(ADMIN_ID, text);
    } catch (e) {
      console.error('❌ send to ADMIN_ID failed:', e?.response?.description || e.message);
    }
  } else {
    console.warn('⚠️ ADMIN_ID is missing, skip sending to admin');
  }

  // в канал
  if (CHANNEL_ID) {
    try {
      await bot.telegram.sendMessage(CHANNEL_ID, text);
    } catch (e) {
      console.error('❌ send to CHANNEL_ID failed:', e?.response?.description || e.message);
    }
  }
}

// ---------- start ----------
bot.start(async (ctx) => {
  await sendClean(
    ctx,
`Привет 🤍

Я — бот Дарьи.
Здесь можно спокойно разобраться:
— нужен ли тебе чат-бот
— какую задачу он может решить
— и как это может выглядеть именно для твоего проекта

Без спешки и без «впаривания».
С чего начнём?`,
    mainMenu()
  );
});

// ---------- back to main ----------
bot.action('back_main', async (ctx) => {
  await ctx.answerCbQuery();
  await sendClean(ctx, '🔙 В главное меню', mainMenu());
});

// ---------- need bot ----------
bot.action('need_bot', async (ctx) => {
  await ctx.answerCbQuery();

  await sendClean(
    ctx,
`Давай честно 🙂

Боты нужны не всем.
Чаще всего ко мне приходят, когда появляется вот это 👇

Что откликается больше всего?`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📩 Много однотипных сообщений', 'need_msgs')],
      [Markup.button.callback('💸 Теряются заявки / клиенты', 'need_leads')],
      [Markup.button.callback('🧑‍💻 Хочу меньше рутины', 'need_routine')],
      [Markup.button.callback('🤷 Не понимаю, что можно автоматизировать', 'need_unknown')],
      [Markup.button.callback('🔙 В главное меню', 'back_main')],
    ])
  );
});

function needFollowupKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔍 Посмотреть кейсы', 'price')],
    [Markup.button.callback('💬 Обсудить мою ситуацию', 'form_start')],
    [Markup.button.callback('🔙 Назад', 'need_bot')],
  ]);
}

bot.action('need_msgs', async (ctx) => {
  await ctx.answerCbQuery();
  await sendClean(
    ctx,
`Понимаю.

Это как раз та ситуация,
где бот реально разгружает голову.

Обычно он:
• отвечает на частые вопросы
• собирает заявки
• передаёт сложные случаи человеку

Хочешь посмотреть, как это выглядит на реальных примерах?`,
    needFollowupKeyboard()
  );
});

bot.action('need_leads', async (ctx) => {
  await ctx.answerCbQuery();
  await sendClean(
    ctx,
`О, это боль 😅

Когда заявки «теряются», обычно помогает связка:
• понятный путь внутри бота
• сбор ключевых данных
• фиксация источника/этапа
• уведомления и автоматическая передача дальше

Хочешь посмотреть примеры или обсудим твою ситуацию?`,
    needFollowupKeyboard()
  );
});

bot.action('need_routine', async (ctx) => {
  await ctx.answerCbQuery();
  await sendClean(
    ctx,
`Да 🙌

Если хочется меньше рутины,
бот может:
• брать на себя одинаковые ответы
• собирать данные без переписок
• автоматизировать доступы/оплаты/напоминания
• выдавать материалы и инструкции

Показать кейсы или обсудим твой проект?`,
    needFollowupKeyboard()
  );
});

bot.action('need_unknown', async (ctx) => {
  await ctx.answerCbQuery();
  await sendClean(
    ctx,
`Нормально 🙂

Часто задача формулируется так:
«хочу меньше хаоса — но не понимаю, с чего начать».

Мы можем:
• разложить процессы по полочкам
• найти точки, где теряется время/деньги
• собрать простую систему, которая реально помогает

Пойдём в кейсы или напишешь Даше пару вводных?`,
    needFollowupKeyboard()
  );
});

// ---------- game ----------
bot.action('game', async (ctx) => {
  await ctx.answerCbQuery();

  await sendClean(
    ctx,
    '🎮 Игра + бонус 👇',
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Открыть', WEB_APP_URL || 'https://example.com')],
      [Markup.button.callback('🔙 В главное меню', 'back_main')],
    ])
  );
});

// ---------- cases (was price) ----------
bot.action('price', async (ctx) => {
  await ctx.answerCbQuery();

  await sendClean(
    ctx,
`Здесь не витрина и не «посмотрите, как красиво».

Это примеры того, как я думаю и собираю системы,
когда бизнесу нужно меньше хаоса и больше ясности.

Выбирай, что откликается 👇`,
    priceMenu()
  );
});

// ----- CASE 1: analytics -----
bot.action('case_analytics', async (ctx) => {
  await ctx.answerCbQuery();

  await sendClean(
    ctx,
`📊 КЕЙС — Аналитика и источники заявок

📌 Задача

Онлайн-мероприятие с трафиком из разных источников:
• партнёры
• менеджеры
• реклама
• сайт

Нужно понимать не «примерно»,
а в цифрах:
— кто привёл людей
— что реально работает
— куда масштабироваться`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👉 Как решили', 'case_analytics_how')],
      [Markup.button.callback('🔙 Назад к кейсам', 'price')],
    ])
  );
});

bot.action('case_analytics_how', async (ctx) => {
  await ctx.answerCbQuery();

  await sendClean(
    ctx,
`🛠 Решение

Регистрация ведёт в одного Telegram-бота,
но у каждого источника — своя стартовая ссылка.

Бот:
• сохраняет источник прихода
• присваивает кодовое слово
• учитывает партнёров и менеджеров
• собирает статистику автоматически`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📈 Что в итоге', 'case_analytics_result')],
      [Markup.button.callback('🔙 Назад к кейсу', 'case_analytics')],
    ])
  );
});

bot.action('case_analytics_result', async (ctx) => {
  await ctx.answerCbQuery();

  await sendClean(
    ctx,
`📊 Результат

По одной команде можно получить отчёт:

Екатерина — 12
Менеджеры ОП — 1
Партнёры — 33
Сайт — 14
Реклама — 73

Всего зарегистрировано: 200

И важный момент:
эта статистика автоматически приходит в инфо-канал каждый день в 12:00.`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🤯 Хочу так же', 'form_start')],
      [Markup.button.callback('🔍 Другой кейс', 'price')],
    ])
  );
});

// ----- CASE 2: club -----
bot.action('case_club', async (ctx) => {
  await ctx.answerCbQuery();

  await sendClean(
    ctx,
`💳 КЕЙС — Клуб по подписке

📌 Задача

Закрытый Telegram-клуб:
• платный доступ
• подписка
• регулярные списания

Без ручного добавления
и без контроля «кто оплатил, а кто нет».`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👉 Как решили', 'case_club_how')],
      [Markup.button.callback('🔙 Назад к кейсам', 'price')],
    ])
  );
});

bot.action('case_club_how', async (ctx) => {
  await ctx.answerCbQuery();

  await sendClean(
    ctx,
`🛠 Решение

Бот:
• принимает оплату
• автоматически добавляет в закрытый канал
• отслеживает срок подписки
• сам удаляет, если оплата не продлена

Всё работает без участия администратора.`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📈 Что в итоге', 'case_club_result')],
      [Markup.button.callback('🔙 Назад к кейсу', 'case_club')],
    ])
  );
});

bot.action('case_club_result', async (ctx) => {
  await ctx.answerCbQuery();

  await sendClean(
    ctx,
`📊 Результат

• нет ручной рутины
• нет ошибок с доступами
• владелец думает о контенте, а не о списках

Система работает 24/7 и масштабируется без боли.`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🤯 Хочу так же', 'form_start')],
      [Markup.button.callback('🔍 Другой кейс', 'price')],
    ])
  );
});

// ----- CASE 3: mini app -----
bot.action('case_miniapp', async (ctx) => {
  await ctx.answerCbQuery();

  await sendClean(
    ctx,
`🧩 КЕЙС — Mini App внутри Telegram

📌 Задача

Сделать не просто бота,
а пространство внутри Telegram,
где можно хранить контент и развивать логику.

Без сайтов и лишних переходов.`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👉 Как решили', 'case_miniapp_how')],
      [Markup.button.callback('🔙 Назад к кейсам', 'price')],
    ])
  );
});

bot.action('case_miniapp_how', async (ctx) => {
  await ctx.answerCbQuery();

  await sendClean(
    ctx,
`🛠 Решение

Внутрь бота встроено Telegram Mini App.

Это уже не сценарий сообщений, а:
• отдельный интерфейс
• собственная логика
• код, написанный вручную

Мини-приложение живёт прямо внутри Telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👀 Что внутри', 'case_miniapp_inside')],
      [Markup.button.callback('🔙 Назад к кейсу', 'case_miniapp')],
    ])
  );
});

bot.action('case_miniapp_inside', async (ctx) => {
  await ctx.answerCbQuery();

  await sendClean(
    ctx,
`⚙️ Возможности:
• навигация по разделам
• библиотека знаний
• динамическое обновление контента
• задел под рост проекта

Скрытая фраза:
Этот мини-апп — мой личный эксперимент.
Я собираю здесь всё, что считаю по-настоящему ценным.`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Открыть мини-приложение', WEB_APP_URL || 'https://example.com')],
      [Markup.button.callback('🔙 Назад', 'case_miniapp_how')],
      [Markup.button.callback('🤯 Хочу такой формат', 'form_start')],
    ])
  );
});

// ---------- form (write Dasha) ----------
bot.action('form_start', async (ctx) => {
  await ctx.answerCbQuery();

  const chatId = ctx.chat.id;
  state[chatId] = { ...(state[chatId] || {}), step: 'name' };

  await sendClean(
    ctx,
`Я передам Даше пару вводных,
чтобы она сразу поняла контекст 🙂

Как тебя зовут?`
  );
});

/**
 * Оставлено как есть (функции/хэндлер) — просто больше не используем кнопки service_ в текущем сценарии.
 * Если захочешь — можно будет задействовать их под отдельную ветку.
 */
bot.action(/service_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const chatId = ctx.chat.id;

  const map = {
    bot: 'Чат-бот',
    webinar: 'Автовебинар',
    funnel: 'Воронка продаж',
  };

  state[chatId] = {
    ...(state[chatId] || {}),
    service: map[ctx.match[1]] || 'Не указано',
    step: 'budget',
  };

  await sendClean(ctx, '💰 Укажи бюджет (или напиши "не знаю")');
});

bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const s = state[chatId];
  if (!s?.step) return;

  try {
    if (s.step === 'name') {
      s.name = ctx.message.text.trim();
      s.step = 'service';
      await sendClean(ctx, 'Чем занимаешься / проект?');
      return;
    }

    // "service" используем как "проект"
    if (s.step === 'service') {
      s.service = ctx.message.text.trim();
      s.step = 'budget';
      await sendClean(ctx, 'Что сейчас хочется упростить?');
      return;
    }

    // "budget" используем как "что упростить"
    if (s.step === 'budget') {
      s.budget = ctx.message.text.trim();
      s.step = 'comment';
      await sendClean(ctx, 'Если хочешь — добавь детали (или напиши «-») 👇');
      return;
    }

    if (s.step === 'comment') {
      s.comment = ctx.message.text.trim();
      s.step = null;

      const text =
`📩 НОВОЕ СООБЩЕНИЕ ДАШЕ

👤 Имя: ${s.name || '-'}
🧩 Проект / чем занимается: ${s.service || '-'}
🧠 Что хочется упростить: ${s.budget || '-'}
📝 Детали:
${s.comment || '-'}

👤 TG: @${ctx.from.username || 'не указан'}
🆔 ID: ${ctx.from.id}`;

      await notifyAdmin(text);

      await sendClean(
        ctx,
`Спасибо 🤍
Даша посмотрит и напишет тебе лично.

Иногда в процессе разговора оказывается,
что бот не нужен
или нужен совсем другой формат.

И это нормально 🙂`,
        Markup.inlineKeyboard([
          [Markup.button.callback('💬 Обсудить мою задачу', 'https://t.me/Lyokorps?text=%D0%94%D0%B0%D1%88%2C%20%D0%B4%D0%BE%D0%B1%D1%80%D1%8B%D0%B9%20%D0%B4%D0%B5%D0%BD%D1%8C%2C%20%D1%85%D0%BE%D1%87%D1%83%20%D0%BA%D0%BE%D0%B5%20%D1%87%D1%82%D0%BE%20%D0%BE%D0%B1%D1%81%D1%83%D0%B4%D0%B8%D1%82%D1%8C') ],
          [Markup.button.callback('🔙 В главное меню', 'back_main')],

        ])
      );

      // чистим шаги, но оставляем lastBotMessageId
      state[chatId] = { lastBotMessageId: state[chatId]?.lastBotMessageId };
      return;
    }
  } catch (e) {
    console.error('text handler error:', e);
    await sendClean(ctx, '⚠️ Упс, что-то сломалось. Давай заново 👇', mainMenu());
    state[chatId] = { lastBotMessageId: state[chatId]?.lastBotMessageId };
  }
});

// ---------- launch ----------
bot.launch()

  .then(() => console.log('🤖 Бот запущен'))
  .catch((e) => console.error('❌ launch error:', e));
  const API_PORT = process.env.API_PORT ? Number(process.env.API_PORT) : 3001;

const app = makeAdminApi({ db, BOT_TOKEN, ADMIN_ID });
app.listen(API_PORT, () => console.log(`🛡️ Admin API on http://localhost:${API_PORT}`));

startBroadcastWorker({ db, bot });


process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
