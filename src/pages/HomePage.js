import React from 'react';
import { motion } from 'framer-motion';

const HomePage = () => {
  const services = [
    { icon: '🤖', title: 'Чат-боты', desc: 'Telegram, WhatsApp, ВКонтакте', color: '#ff3333' },
    { icon: '🎥', title: 'Автовебинары', desc: 'Продажи 24/7', color: '#ff5555' },
    { icon: '🚀', title: 'Комплексные запуски', desc: 'Онлайн-курсы, марафоны', color: '#ff7777' },
    { icon: '💻', title: 'Техподдержка', desc: 'Абонентское обслуживание', color: '#ff9999' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        minHeight: 'calc(100vh - 70px)',
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
        padding: '50px 20px',
        textAlign: 'center'
      }}
    >
      {/* Анимированный заголовок */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h1 style={{
          fontSize: '52px',
          color: '#ff0000',
          textShadow: '0 0 15px #ff0000, 0 0 30px #ff0000',
          marginBottom: '20px',
          letterSpacing: '2px'
        }}>
          🔥 ТЕХНИЧЕСКИЙ СПЕЦИАЛИСТ
        </h1>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '300px' }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #ff0000, transparent)',
            margin: '0 auto 30px'
          }}
        />
      </motion.div>

      {/* Описание */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p style={{
          fontSize: '26px',
          color: '#ffffff',
          maxWidth: '900px',
          margin: '0 auto 50px',
          lineHeight: '1.6'
        }}>
          <span style={{
            color: '#ff0000',
            fontWeight: 'bold',
            textShadow: '0 0 10px #ff0000'
          }}>
            Тех-лид / Digital-технолог
          </span>
          <br />
          <span style={{ fontSize: '20px', color: '#ff6666' }}>
            Автовебинары • Чат-боты • Комплексные запуски
          </span>
        </p>
      </motion.div>

      {/* Карточки услуг */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: 'spring' }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '25px',
          maxWidth: '1100px',
          margin: '0 auto'
        }}
      >
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 30px #ff0000',
              y: -10
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: `linear-gradient(145deg, ${service.color}10, #000000)`,
              border: `2px solid ${service.color}`,
              padding: '25px',
              borderRadius: '20px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              fontSize: '50px',
              marginBottom: '15px',
              filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))'
            }}>
              {service.icon}
            </div>
            <h3 style={{
              margin: '15px 0',
              color: service.color,
              fontSize: '22px',
              textShadow: '0 0 5px currentColor'
            }}>
              {service.title}
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#cccccc',
              lineHeight: '1.4'
            }}>
              {service.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Призыв к действию */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          marginTop: '60px',
          padding: '30px',
          background: 'rgba(255, 0, 0, 0.1)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 0, 0, 0.3)',
          maxWidth: '800px',
          margin: '60px auto 0'
        }}
      >
        <h2 style={{
          color: '#ff0000',
          fontSize: '28px',
          marginBottom: '20px'
        }}>
          🎯 Почему выбирают меня?
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          textAlign: 'left'
        }}>
          <div>
            <div style={{ color: '#ff6666', fontWeight: 'bold', marginBottom: '5px' }}>✅ Обширный опыт</div>
            <div style={{ color: '#cccccc', fontSize: '14px' }}>В digital и технической реализации</div>
          </div>
          <div>
            <div style={{ color: '#ff6666', fontWeight: 'bold', marginBottom: '5px' }}>⚡ Быстро и четко</div>
            <div style={{ color: '#cccccc', fontSize: '14px' }}>Соблюдение сроков и ТЗ</div>
          </div>
          <div>
            <div style={{ color: '#ff6666', fontWeight: 'bold', marginBottom: '5px' }}>🎯 Решение проблем</div>
            <div style={{ color: '#cccccc', fontSize: '14px' }}>Технические и бизнес-задачи</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;