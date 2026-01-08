// src/pages/HomePage.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { openTelegramLink } from '../telegram';

const MotionLink = motion(Link);

const HomePage = () => {
  const [activeService, setActiveService] = useState(null);
  const navigate = useNavigate();

  // Telegram WebApp (в браузере tg будет undefined, это ок)
  const tg = window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;

  // твой админский id
  const isAdmin = tgUser?.id === 7318342825;

  const services = [
    {
      icon: '🤖',
      title: 'Чат-боты',
      desc: 'Telegram, WhatsApp, ВКонтакте',
      details:
        'Разработка чат-ботов под продажи, запись клиентов, поддержку и автоматизацию. Сценарии, кнопки, интеграции, аналитика.',
      color: '#ff3333',
    },
    {
      icon: '🎥',
      title: 'Автовебинары',
      desc: 'Продажи 24/7',
      details:
        'Настройка автовебинаров под ключ: платформа, оплаты, доступы, догрев, аналитика. Чтобы система продавала без тебя.',
      color: '#ff5555',
    },
    {
      icon: '🚀',
      title: 'Комплексные запуски',
      desc: 'Онлайн-курсы, марафоны',
      details:
        'Полная техническая часть запуска: лендинг, оплаты, доступы, рассылки, вебинары, интеграции и контроль.',
      color: '#ff7777',
    },
    {
      icon: '💻',
      title: 'Техподдержка',
      desc: 'Абонентское обслуживание',
      details:
        'Постоянная техподдержка проектов: правки, доработки, интеграции, стабильность и быстрые реакции.',
      color: '#ff9999',
    },
  ];

  const openService = (service) => setActiveService(service);
  const closeService = () => setActiveService(null);

  const goToTelegram = (serviceTitle) => {
    const text = `Привет! Хочу консультацию: ${serviceTitle}. Расскажи, стоимость и сроки.`;
    openTelegramLink(`https://t.me/Lyokorps?text=${encodeURIComponent(text)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        minHeight: 'calc(100dvh - 70px)',
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      {/* Заголовок */}
      <h1
        style={{
          fontSize: '42px',
          color: '#ff0000',
          textShadow: '0 0 20px #ff0000',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <motion.span
          animate={{
            y: [0, -6, -2, -8, 0],
            rotate: [-2, 1.5, -1, 2, -2],
            scaleY: [1, 1.1, 0.95, 1.15, 1],
            filter: [
              'drop-shadow(0 0 6px rgba(255,80,0,0.6))',
              'drop-shadow(0 0 14px rgba(255,120,0,0.9))',
              'drop-shadow(0 0 10px rgba(255,60,0,0.7))',
              'drop-shadow(0 0 18px rgba(255,150,0,1))',
              'drop-shadow(0 0 6px rgba(255,80,0,0.6))',
            ],
          }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          whileHover={{
            scale: 1.08,
            filter: 'drop-shadow(0 0 22px rgba(255,140,0,1))',
          }}
          whileTap={{
            scale: 0.95,
            filter: 'drop-shadow(0 0 26px rgba(255,170,0,1))',
          }}
          style={{
            display: 'inline-block',
            transformOrigin: '50% 100%',
          }}
          aria-hidden="true"
        >
          🔥
        </motion.span>

        <span>ТЕХНИЧЕСКИЙ СПЕЦИАЛИСТ</span>
      </h1>

      {/* Админка (видна только админу) */}
      {isAdmin && (
        <MotionLink
          to="/admin"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            margin: '0 auto 18px',
            display: 'block',
            background: 'linear-gradient(45deg, #ff00ff, #ff66ff)',
            border: 'none',
            borderRadius: 14,
            padding: '12px 16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#000',
            fontSize: 14,
            boxShadow: '0 0 20px rgba(255,0,255,0.35)',
            minWidth: 240,
            textAlign: 'center',
          }}
          title={`Admin: ${tgUser?.id ?? 'no-user'}`}
        >
          🛠 Админка
        </MotionLink>
      )}

      <p
        style={{
          fontSize: '18px',
          color: '#ff7777',
          marginBottom: '18px',
        }}
      >
        Автовебинары • Чат-боты • Комплексные запуски
      </p>

      {/* CTA блок */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          margin: '10px auto 28px',
          maxWidth: 900,
        }}
      >
        <button
          onClick={() => goToTelegram('обсуждение проекта')}
          style={{
            background: '#ff0000',
            border: 'none',
            borderRadius: 14,
            padding: '14px 18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#000',
            fontSize: 16,
            boxShadow: '0 0 20px rgba(255,0,0,0.35)',
            minWidth: 220,
          }}
        >
          Написать в Telegram
        </button>

        <button
          onClick={() => navigate('/pricelist')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,0,0,0.8)',
            borderRadius: 14,
            padding: '14px 18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#fff',
            fontSize: 16,
            minWidth: 220,
          }}
        >
          Узнать стоимость
        </button>
      </motion.div>

      {/* Карточки */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        {services.map((service, index) => (
          <motion.div
            key={index}
            onClick={() => openService(service)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: '#000',
              border: `2px solid ${service.color}`,
              borderRadius: 18,
              padding: 24,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 46 }}>{service.icon}</div>
            <h3 style={{ color: service.color, marginTop: 12 }}>{service.title}</h3>
            <p style={{ color: '#ccc', fontSize: 14 }}>{service.desc}</p>
            <div style={{ marginTop: 10, fontSize: 12, color: '#888' }}>
              Нажми, чтобы подробнее
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom sheet */}
      <AnimatePresence>
        {activeService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeService}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 2000,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 600,
                background: '#0a0a0a',
                borderRadius: '20px 20px 0 0',
                padding: 20,
                border: `2px solid ${activeService.color}`,
                borderBottom: 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <h3 style={{ color: activeService.color, margin: 0 }}>
                  {activeService.icon} {activeService.title}
                </h3>
                <button
                  onClick={closeService}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: 'white',
                    borderRadius: 10,
                    padding: '6px 10px',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              <p style={{ color: '#ddd', margin: '12px 0 18px', lineHeight: 1.5 }}>
                {activeService.details}
              </p>

              <button
                onClick={() => goToTelegram(activeService.title)}
                style={{
                  width: '100%',
                  background: activeService.color,
                  border: 'none',
                  borderRadius: 12,
                  padding: 14,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  color: '#000',
                }}
              >
                Написать в Telegram
              </button>

              <button
                onClick={closeService}
                style={{
                  width: '100%',
                  marginTop: 10,
                  background: 'transparent',
                  border: '1px solid #555',
                  borderRadius: 12,
                  padding: 12,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Закрыть
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HomePage;
