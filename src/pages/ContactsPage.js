import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ADMIN_ID = 7318342825; // твой Telegram user id

const ContactsPage = () => {
  const navigate = useNavigate();

  // определяем пользователя Telegram Mini App
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const isAdmin = tgUser?.id === ADMIN_ID;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: '',
    budget: '',
    message: '',
  });

  const styles = useMemo(() => {
    const cardBg = 'rgba(255, 0, 255, 0.06)';
    const cardBorder = '2px solid rgba(255, 0, 255, 0.28)';
    const inputBg = 'rgba(255, 255, 255, 0.08)';
    const inputBorder = '1px solid rgba(255, 0, 255, 0.5)';

    return {
      page: {
        minHeight: 'calc(100dvh - 70px)',
        background: 'linear-gradient(135deg, #000000 0%, #1a001a 50%, #000000 100%)',
        padding: '24px 16px',
        color: 'white',
        overflowX: 'hidden',
      },
      wrapper: {
        maxWidth: '1100px',
        margin: '0 auto',
      },
      title: {
        fontSize: 'clamp(28px, 5vw, 48px)',
        color: '#ff00ff',
        textAlign: 'center',
        marginBottom: '10px',
        textShadow: '0 0 15px #ff00ff',
        lineHeight: 1.1,
      },
      subtitle: {
        textAlign: 'center',
        fontSize: 'clamp(14px, 2.4vw, 20px)',
        color: '#ff88ff',
        marginBottom: '28px',
        lineHeight: 1.4,
      },
      grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '18px',
        alignItems: 'start',
      },
      card: {
        background: cardBg,
        border: cardBorder,
        borderRadius: '18px',
        padding: '18px',
        boxShadow: '0 0 22px rgba(255, 0, 255, 0.08)',
      },
      h2: {
        color: '#ff00ff',
        fontSize: 'clamp(18px, 2.6vw, 26px)',
        marginBottom: '14px',
      },
      infoList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      },
      infoItemLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
        color: '#ff88ff',
        background: 'rgba(255, 0, 255, 0.10)',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 0, 255, 0.22)',
        minWidth: 0,
      },
      infoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#ff88ff',
        background: 'rgba(255, 0, 255, 0.10)',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 0, 255, 0.22)',
        minWidth: 0,
      },
      infoMeta: {
        fontSize: '12px',
        color: '#ffaaff',
        lineHeight: 1.2,
      },
      infoValue: {
        fontSize: '16px',
        fontWeight: 'bold',
        lineHeight: 1.2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      techWrap: {
        marginTop: '16px',
      },
      techRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
      },
      techTag: {
        background: 'rgba(255, 0, 255, 0.20)',
        color: '#ffaaff',
        padding: '7px 12px',
        borderRadius: '999px',
        fontSize: '13px',
        border: '1px solid rgba(255,0,255,0.22)',
      },
      formCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      },
      twoCol: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '12px',
      },
      input: {
        width: '100%',
        boxSizing: 'border-box',
        background: inputBg,
        border: inputBorder,
        borderRadius: '12px',
        padding: '14px',
        color: 'white',
        fontSize: '16px',
        outline: 'none',
      },
      select: {
        width: '100%',
        boxSizing: 'border-box',
        background: inputBg,
        border: inputBorder,
        borderRadius: '12px',
        padding: '14px',
        color: 'white',
        fontSize: '16px',
        outline: 'none',
        cursor: 'pointer',
        appearance: 'none',
      },
      textarea: {
        width: '100%',
        boxSizing: 'border-box',
        background: inputBg,
        border: inputBorder,
        borderRadius: '12px',
        padding: '14px',
        color: 'white',
        fontSize: '16px',
        outline: 'none',
        resize: 'vertical',
        minHeight: '140px',
      },
      submit: {
        width: '100%',
        background: 'linear-gradient(45deg, #ff00ff, #ff33ff)',
        border: 'none',
        color: 'white',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '4px',
        boxShadow: '0 10px 30px rgba(255,0,255,0.22)',
      },
      hint: {
        textAlign: 'center',
        color: '#ffaaff',
        fontSize: '13px',
        marginTop: '10px',
        lineHeight: 1.35,
      },
      quickCard: {
        background: cardBg,
        border: cardBorder,
        borderRadius: '18px',
        padding: '18px',
        marginTop: '18px',
      },
      quickTitle: {
        color: '#ff00ff',
        marginBottom: '14px',
        textAlign: 'center',
        fontSize: '18px',
      },
      quickGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '12px',
      },
      quickBtn: (bg) => ({
        background: bg,
        color: 'white',
        padding: '14px',
        borderRadius: '12px',
        textAlign: 'center',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '15px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
      }),
      adminBtnWrap: {
        maxWidth: '1100px',
        margin: '0 auto 16px',
      },
      adminBtn: {
        width: '100%',
        background: 'linear-gradient(45deg, #ff00ff, #ff66ff)',
        border: 'none',
        borderRadius: '14px',
        padding: '14px',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 0 20px rgba(255,0,255,0.35)',
      },
    };
  }, []);

  const handleChange = (key) => (e) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  // Это просто открывает твою личку с заранее заполненным текстом
  const goTelegram = (text) => {
    const url = `https://t.me/Lyokorps?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const text = `📋 НОВАЯ ЗАЯВКА
👤 Имя: ${formData.name.trim()}
📞 Телефон: ${formData.phone.trim()}
📧 Email: ${formData.email.trim()}
📂 Проект: ${formData.projectType || 'Не указано'}
💰 Бюджет: ${formData.budget || 'Не указано'}

📝 Сообщение:
${formData.message.trim()}

🕒 ${new Date().toLocaleString()}`;

    goTelegram(text);

    setFormData({
      name: '',
      phone: '',
      email: '',
      projectType: '',
      budget: '',
      message: '',
    });
  };

  const openAdmin = () => {
    // если открыто как Telegram Mini App, просто переходим на роут внутри приложения
    navigate('/admin');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.page}>
      {/* Медиа-адаптация без “кривых” 2-колоночных полей на мобилках */}
      <style>{`
        @media (max-width: 900px) {
          .contacts-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          .contacts-2col { grid-template-columns: 1fr !important; }
          .contacts-quick { grid-template-columns: 1fr !important; }
        }
        /* чтобы option не был чёрным на чёрном в некоторых браузерах */
        select option { background: #120012; color: #ffffff; }
      `}</style>

      {/* КНОПКА АДМИНКИ: видна только тебе */}
      {isAdmin && (
        <div style={styles.adminBtnWrap}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAdmin}
            style={styles.adminBtn}
            title={`Admin: ${tgUser?.id || 'unknown'}`}
          >
            🛠 Открыть админку
          </motion.button>
        </div>
      )}

      <div style={styles.wrapper}>
        <motion.h1 initial={{ y: -30 }} animate={{ y: 0 }} style={styles.title}>
          📞 КОНТАКТЫ
        </motion.h1>

        <p style={styles.subtitle}>Свяжитесь со мной — обсудим ваш проект, сроки и бюджет</p>

        <div className="contacts-grid" style={styles.grid}>
          {/* Контактная информация */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            style={styles.card}
          >
            <h2 style={styles.h2}>📍 Контактная информация</h2>

            <div style={styles.infoList}>
              <motion.a
                whileHover={{ x: 8 }}
                href="https://t.me/Lyokorps"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.infoItemLink}
              >
                <span style={{ fontSize: 26, flex: '0 0 auto' }}>💬</span>
                <div style={{ minWidth: 0 }}>
                  <div style={styles.infoMeta}>Telegram</div>
                  <div style={styles.infoValue}>@Lyokorps</div>
                </div>
              </motion.a>

              <div style={styles.infoItem}>
                <span style={{ fontSize: 26, flex: '0 0 auto' }}>⏰</span>
                <div style={{ minWidth: 0 }}>
                  <div style={styles.infoMeta}>Режим работы</div>
                  <div style={styles.infoValue}>Пн–Пт: 10:00–19:00</div>
                </div>
              </div>

              <div style={styles.infoItem}>
                <span style={{ fontSize: 26, flex: '0 0 auto' }}>📍</span>
                <div style={{ minWidth: 0 }}>
                  <div style={styles.infoMeta}>Формат работы</div>
                  <div style={styles.infoValue}>Удалённо / Беларусь</div>
                </div>
              </div>
            </div>

            <div style={styles.techWrap}>
              <h3 style={{ color: '#ff00ff', marginBottom: 10 }}>🛠️ Технологии:</h3>
              <div style={styles.techRow}>
                {[
                  'SaleBot',
                  'Leadtex',
                  'AmoCRM',
                  'Botmother',
                  'Aimylogic',
                  'Tilda',
                  'PuzzleBot',
                  'Telegram API',
                ].map((tech) => (
                  <span key={tech} style={styles.techTag}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Форма */}
          <motion.form
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            onSubmit={handleSubmit}
            style={styles.card}
          >
            <h2 style={styles.h2}>✉️ Оставить заявку</h2>

            <div style={styles.formCol}>
              <div className="contacts-2col" style={styles.twoCol}>
                <input
                  type="text"
                  placeholder="Ваше имя *"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                  style={styles.input}
                />
                <input
                  type="tel"
                  placeholder="Телефон *"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  required
                  style={styles.input}
                />
              </div>

              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleChange('email')}
                required
                style={styles.input}
              />

              <div className="contacts-2col" style={styles.twoCol}>
                <select value={formData.projectType} onChange={handleChange('projectType')} style={styles.select}>
                  <option value="">Тип проекта</option>
                  <option value="chatbot">🤖 Чат-бот</option>
                  <option value="webinar">🎥 Вебинар/Автовебинар</option>
                  <option value="launch">🚀 Комплексный запуск</option>
                  <option value="support">💻 Техподдержка</option>
                  <option value="consult">🎯 Консультация</option>
                </select>

                <select value={formData.budget} onChange={handleChange('budget')} style={styles.select}>
                  <option value="">Бюджет проекта</option>
                  <option value="<25k">До 25 000 ₽</option>
                  <option value="25-50k">25 000 – 50 000 ₽</option>
                  <option value="50-100k">50 000 – 100 000 ₽</option>
                  <option value=">100k">Более 100 000 ₽</option>
                </select>
              </div>

              <textarea
                placeholder="Опишите ваш проект, задачи, сроки... *"
                value={formData.message}
                onChange={handleChange('message')}
                required
                style={styles.textarea}
              />

              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={styles.submit}>
                📤 Отправить заявку в Telegram
              </motion.button>

              <p style={styles.hint}>
                После отправки откроется Telegram с готовым сообщением — можно сразу продолжить диалог.
              </p>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  goTelegram('Здравствуйте! Хочу консультацию по проекту. Подскажите, когда удобно созвониться?')
                }
                style={{
                  ...styles.submit,
                  background: 'linear-gradient(45deg, #0088cc, #00aaff)',
                  marginTop: 0,
                }}
              >
                💬 Быстро: хочу консультацию
              </motion.button>
            </div>
          </motion.form>
        </div>

        {/* Быстрые действия */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} style={styles.quickCard}>
          <h3 style={styles.quickTitle}>🚀 Быстрые действия</h3>

          <div className="contacts-quick" style={styles.quickGrid}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => goTelegram('Привет! Хочу обсудить проект.')}
              style={styles.quickBtn('linear-gradient(45deg, #0088cc, #00aaff)')}
            >
              <span style={{ fontSize: 22 }}>💬</span>
              Написать в Telegram
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/game')}
              style={styles.quickBtn('linear-gradient(45deg, #00aa00, #00ff00)')}
            >
              <span style={{ fontSize: 22 }}>🎮</span>
              Получить скидку
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/pricelist')}
              style={styles.quickBtn('linear-gradient(45deg, #ff8800, #ffaa00)')}
            >
              <span style={{ fontSize: 22 }}>📋</span>
              Прайс-лист
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContactsPage;
