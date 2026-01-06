import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ContactsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: '',
    budget: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = `📋 НОВАЯ ЗАЯВКА:
👤 Имя: ${formData.name}
📞 Телефон: ${formData.phone}
📧 Email: ${formData.email}
📂 Проект: ${formData.projectType || 'Не указано'}
💰 Бюджет: ${formData.budget || 'Не указано'}
📝 Сообщение:
${formData.message}

Дата: ${new Date().toLocaleString()}`;
    
    window.open(`https://t.me/Lyokorps?text=${encodeURIComponent(text)}`, '_blank');
    
    setFormData({
      name: '', phone: '', email: '',
      projectType: '', budget: '', message: ''
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: 'calc(100vh - 70px)',
        background: 'linear-gradient(135deg, #000000 0%, #1a001a 50%, #000000 100%)',
        padding: '30px 20px',
        color: 'white'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.h1
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          style={{
            fontSize: '48px',
            color: '#ff00ff',
            textAlign: 'center',
            marginBottom: '10px',
            textShadow: '0 0 15px #ff00ff'
          }}
        >
          📞 КОНТАКТЫ
        </motion.h1>
        
        <p style={{ 
          textAlign: 'center', 
          fontSize: '20px',
          color: '#ff88ff',
          marginBottom: '50px'
        }}>
          Свяжитесь со мной для обсуждения вашего проекта
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px'
        }}>
          {/* Контактная информация */}
          <motion.div
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'rgba(255, 0, 255, 0.05)',
              border: '2px solid rgba(255, 0, 255, 0.3)',
              borderRadius: '20px',
              padding: '30px'
            }}
          >
            <h2 style={{ 
              color: '#ff00ff', 
              fontSize: '28px',
              marginBottom: '25px'
            }}>
              📍 Контактная информация
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <motion.a
                whileHover={{ x: 10 }}
                href="https://t.me/Lyokorps"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  textDecoration: 'none',
                  color: '#ff88ff',
                  background: 'rgba(255, 0, 255, 0.1)',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 0, 255, 0.2)'
                }}
              >
                <span style={{ fontSize: '28px' }}>💬</span>
                <div>
                  <div style={{ fontSize: '14px', color: '#ffaaff' }}>Telegram</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>@Lyokorps</div>
                </div>
              </motion.a>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                color: '#ff88ff',
                background: 'rgba(255, 0, 255, 0.1)',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 0, 255, 0.2)'
              }}>
                <span style={{ fontSize: '28px' }}>⏰</span>
                <div>
                  <div style={{ fontSize: '14px', color: '#ffaaff' }}>Режим работы</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Пн-Пт: 10:00 - 19:00</div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                color: '#ff88ff',
                background: 'rgba(255, 0, 255, 0.1)',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 0, 255, 0.2)'
              }}>
                <span style={{ fontSize: '28px' }}>📍</span>
                <div>
                  <div style={{ fontSize: '14px', color: '#ffaaff' }}>Формат работы</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Удаленно / Беларусь</div>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ color: '#ff00ff', marginBottom: '15px' }}>🛠️ Технологии:</h3>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '10px'
              }}>
                {['SaleBot', 'Leadtex', 'AmoCRM', 'Botmother', 'Aimylogic', 'Tilda', 'PuzzleBot', 'Telegram API'].map((tech) => (
                  <span
                    key={tech}
                    style={{
                      background: 'rgba(255, 0, 255, 0.2)',
                      color: '#ffaaff',
                      padding: '8px 15px',
                      borderRadius: '20px',
                      fontSize: '14px'
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Форма обратной связи */}
          <motion.form
            initial={{ x: 50 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            style={{
              background: 'rgba(255, 0, 255, 0.05)',
              border: '2px solid rgba(255, 0, 255, 0.3)',
              borderRadius: '20px',
              padding: '30px'
            }}
          >
            <h2 style={{ 
              color: '#ff00ff', 
              fontSize: '28px',
              marginBottom: '25px'
            }}>
              ✉️ Оставить заявку
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input
                  type="text"
                  placeholder="Ваше имя *"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 0, 255, 0.5)',
                    borderRadius: '10px',
                    padding: '15px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <input
                  type="tel"
                  placeholder="Телефон *"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 0, 255, 0.5)',
                    borderRadius: '10px',
                    padding: '15px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 0, 255, 0.5)',
                  borderRadius: '10px',
                  padding: '15px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 0, 255, 0.5)',
                    borderRadius: '10px',
                    padding: '15px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Тип проекта</option>
                  <option value="chatbot">🤖 Чат-бот</option>
                  <option value="webinar">🎥 Вебинар/Автовебинар</option>
                  <option value="launch">🚀 Комплексный запуск</option>
                  <option value="support">💻 Техподдержка</option>
                  <option value="consult">🎯 Консультация</option>
                </select>
                
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 0, 255, 0.5)',
                    borderRadius: '10px',
                    padding: '15px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Бюджет проекта</option>
                  <option value="<25k">До 25 000 ₽</option>
                  <option value="25-50k">25 000 - 50 000 ₽</option>
                  <option value="50-100k">50 000 - 100 000 ₽</option>
                  <option value=">100k">Более 100 000 ₽</option>
                </select>
              </div>
              
              <textarea
                placeholder="Опишите ваш проект, задачи, сроки... *"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
                rows="6"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 0, 255, 0.5)',
                  borderRadius: '10px',
                  padding: '15px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
              
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'linear-gradient(45deg, #ff00ff, #ff33ff)',
                  border: 'none',
                  color: 'white',
                  padding: '18px',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                📤 Отправить заявку в Telegram
              </motion.button>
              
              <p style={{ 
                textAlign: 'center', 
                color: '#ffaaff',
                fontSize: '14px',
                marginTop: '15px'
              }}>
                После отправки откроется чат в Telegram для продолжения обсуждения
              </p>
            </div>
          </motion.form>
        </div>

        {/* Быстрые действия */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            background: 'rgba(255, 0, 255, 0.05)',
            border: '2px solid rgba(255, 0, 255, 0.3)',
            borderRadius: '20px',
            padding: '30px',
            marginTop: '40px'
          }}
        >
          <h3 style={{ color: '#ff00ff', marginBottom: '20px', textAlign: 'center' }}>
            🚀 Быстрые действия
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://t.me/Lyokorps"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(45deg, #0088cc, #00aaff)',
                color: 'white',
                padding: '15px',
                borderRadius: '10px',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '24px' }}>💬</span>
              Написать в Telegram
            </motion.a>
            
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#game"
              onClick={() => window.location.hash = '#game'}
              style={{
                background: 'linear-gradient(45deg, #00aa00, #00ff00)',
                color: 'white',
                padding: '15px',
                borderRadius: '10px',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '24px' }}>🎮</span>
              Получить скидку 10%
            </motion.a>
            
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#pricelist"
              onClick={() => window.location.hash = '#pricelist'}
              style={{
                background: 'linear-gradient(45deg, #ff8800, #ffaa00)',
                color: 'white',
                padding: '15px',
                borderRadius: '10px',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '24px' }}>📋</span>
              Посмотреть прайс-лист
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContactsPage;
