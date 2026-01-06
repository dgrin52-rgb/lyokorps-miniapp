import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PricelistPage = () => {
  const [activeTab, setActiveTab] = useState('chatbots');
  const [expandedService, setExpandedService] = useState(null);

  const pricelistData = {
    chatbots: {
      title: "🤖 ЧАТ-БОТЫ",
      subtitle: "Telegram, WhatsApp, ВКонтакте",
      description: "Цель: Автоматизация заявок, продаж, поддержки, ведения клиентов.",
      services: [
        {
          name: "Бот 'Под ключ'",
          description: "Анализ ЦА, создание и настройка бота на выбранной платформе, интеграция с CRM, платежкой, тестирование, инструкция.",
          timeline: "5-10 дней",
          price: "от 25 000 руб.",
          features: ["Анализ ЦА", "Настройка бота", "Интеграция с CRM", "Тестирование", "Инструкция"]
        },
        {
          name: "Доработка / исправление",
          description: "Исправление ошибок, добавление новых блоков в существующего бота.",
          timeline: "1-3 дня",
          price: "от 8 000 руб."
        },
        {
          name: "Интеграция с CRM/платежкой",
          description: "Настройка корректной передачи данных из бота в CRM и обработки статусов оплат.",
          timeline: "1-2 дня",
          price: "от 5 000 руб."
        },
        {
          name: "Техническая поддержка",
          description: "Консультации, мелкие правки, обновление контента.",
          timeline: "По запросу",
          price: "от 5 000 руб./мес"
        }
      ]
    },
    webinars: {
      title: "🎥 ВЕБИНАРЫ И АВТОВЕБИНАРЫ",
      subtitle: "Живые трансляции и автоматические продажи 24/7",
      description: "Цель: Проведение 'живых' онлайн-трансляций или настройка автоматического вебинара для продаж 24/7.",
      services: [
        {
          name: "Комплекс 'Живой вебинар'",
          description: "Подбор и настройка платформы, настройка комнаты ожидания, интеграция с формой регистрации, технический прогон, поддержка в день вебинара.",
          timeline: "Подготовка 1-2 дня + день вебинара",
          price: "от 15 000 руб./вебинар",
          features: ["Подбор платформы", "Технический прогон", "Поддержка в день вебинара"]
        },
        {
          name: "Автовебинар 'Под ключ'",
          description: "Запись и монтаж видео, создание вебинарной комнаты, настройка цепочки писем, триггеров, интеграция с платежной системой.",
          timeline: "7-14 дней",
          price: "от 30 000 руб."
        }
      ]
    },
    subscription: {
      title: "📅 АБОНЕМЕНТНОЕ ОБСЛУЖИВАНИЕ",
      subtitle: "Техподдержка для постоянных клиентов",
      description: "Идеально для постоянных клиентов и агентств.",
      services: [
        {
          name: "Базовый",
          description: "До 70 часов консультаций и мелких правок в месяц. Приоритет в очереди 24ч.",
          price: "25 000 руб./мес",
          features: ["До 70 часов", "Приоритет 24ч", "Консультации", "Мелкие правки"]
        },
        {
          name: "Бизнес",
          description: "До 150 часов работ. Полное покрытие всех систем: боты, лендинги, вебинары, CRM. Срочные задачи.",
          price: "60 000 руб./мес",
          features: ["До 150 часов", "Все системы", "Срочные задачи", "Полное покрытие"]
        }
      ]
    }
  };

  const handleOrderClick = (service) => {
    const message = `Здравствуйте! Хочу заказать услугу: "${service.name}"\nЦена: ${service.price}\nОписание: ${service.description}`;
    const telegramUrl = `https://t.me/Lyokorps?text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  const toggleServiceDetails = (index) => {
    setExpandedService(expandedService === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: 'calc(100vh - 70px)',
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
        padding: '30px 20px',
        color: 'white'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Заголовок */}
        <motion.h1
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          style={{
            fontSize: '42px',
            color: '#ff0000',
            textAlign: 'center',
            marginBottom: '10px',
            textShadow: '0 0 10px #ff0000'
          }}
        >
          📋 ПРАЙС-ЛИСТ
        </motion.h1>
        
        <p style={{
          textAlign: 'center',
          color: '#ff6666',
          fontSize: '18px',
          marginBottom: '40px'
        }}>
          Тех-лид / Digital-технолог | Последнее обновление: 25.11.2025
        </p>

        {/* Табы */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          {Object.keys(pricelistData).map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab
                  ? 'linear-gradient(45deg, #ff0000, #ff3333)'
                  : 'rgba(255, 0, 0, 0.1)',
                border: '2px solid #ff0000',
                color: activeTab === tab ? 'white' : '#ff0000',
                padding: '12px 24px',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s',
                minWidth: '150px'
              }}
            >
              {pricelistData[tab].title.split(' ')[0]}
            </motion.button>
          ))}
        </div>

        {/* Содержимое активного таба */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'rgba(255, 0, 0, 0.05)',
            border: '1px solid rgba(255, 0, 0, 0.2)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '30px'
          }}
        >
          <h2 style={{
            color: '#ff0000',
            fontSize: '32px',
            marginBottom: '10px'
          }}>
            {pricelistData[activeTab].title}
          </h2>
          
          <p style={{
            color: '#ff9999',
            fontSize: '18px',
            marginBottom: '20px'
          }}>
            {pricelistData[activeTab].subtitle}
          </p>
          
          <p style={{
            color: '#cccccc',
            fontSize: '16px',
            marginBottom: '30px',
            fontStyle: 'italic'
          }}>
            {pricelistData[activeTab].description}
          </p>

          {/* Список услуг */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {pricelistData[activeTab].services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
                onClick={() => toggleServiceDetails(index)}
                style={{
                  background: expandedService === index
                    ? 'rgba(255, 0, 0, 0.15)'
                    : 'rgba(255, 0, 0, 0.05)',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  borderRadius: '15px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{
                      color: '#ff0000',
                      fontSize: '20px',
                      marginBottom: '5px'
                    }}>
                      {service.name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      gap: '20px',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        background: 'rgba(255, 0, 0, 0.2)',
                        color: '#ff9999',
                        padding: '5px 15px',
                        borderRadius: '20px',
                        fontSize: '14px'
                      }}>
                        {service.timeline}
                      </span>
                      <span style={{
                        color: '#ff9900ff',
                        fontSize: '22px',
                        fontWeight: 'bold',
                        textShadow: '0 0 5px #ff8009ff'
                      }}>
                        {service.price}
                      </span>
                    </div>
                  </div>
                  
                  <motion.span
                    animate={{ rotate: expandedService === index ? 180 : 0 }}
                    style={{
                      color: '#ff0000',
                      fontSize: '24px',
                      transition: 'rotate 0.3s'
                    }}
                  >
                    ▼
                  </motion.span>
                </div>

                {/* Детали услуги */}
                {expandedService === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    style={{
                      marginTop: '20px',
                      borderTop: '1px solid rgba(255, 0, 0, 0.2)',
                      paddingTop: '20px'
                    }}
                  >
                    <p style={{
                      color: '#cccccc',
                      lineHeight: '1.6',
                      marginBottom: '20px'
                    }}>
                      {service.description}
                    </p>
                    
                    {service.features && (
                      <div style={{
                        background: 'rgba(255, 0, 0, 0.1)',
                        borderRadius: '10px',
                        padding: '15px',
                        marginBottom: '20px'
                      }}>
                        <h4 style={{
                          color: '#ff0000',
                          marginBottom: '10px'
                        }}>
                          Что входит:
                        </h4>
                        <ul style={{
                          listStyle: 'none',
                          padding: 0,
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '10px'
                        }}>
                          {service.features.map((feature, idx) => (
                            <li key={idx} style={{
                              color: '#ff9999',
                              padding: '5px 0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px'
                            }}>
                              <span style={{ color: '#ffd28eff' }}>✓</span> {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      gap: '15px',
                      flexWrap: 'wrap'
                    }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(service);
                        }}
                        style={{
                          background: 'linear-gradient(45deg, #ff0000, #ff3333)',
                          border: 'none',
                          color: 'white',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          flex: 1
                        }}
                      >
                        💬 Заказать в Telegram
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Условия */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'rgba(255, 0, 0, 0.05)',
            border: '1px solid rgba(255, 0, 0, 0.2)',
            borderRadius: '15px',
            padding: '25px',
            marginTop: '30px'
          }}
        >
          <h4 style={{
            color: '#ff0000',
            fontSize: '20px',
            marginBottom: '15px'
          }}>
            ℹ️ Важные условия:
          </h4>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            color: '#cccccc',
            lineHeight: '1.6'
          }}>
            <li style={{ padding: '8px 0', borderBottom: '1px solid rgba(255, 0, 0, 0.1)' }}>
              <strong style={{ color: '#ff9999' }}>Формат работы:</strong> 50% предоплаты, 50% по окончанию проекта.
            </li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid rgba(255, 0, 0, 0.1)' }}>
              <strong style={{ color: '#ff9999' }}>Сроки:</strong> Начинаются с момента предоставления всего контента и утверждения ТЗ.
            </li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid rgba(255, 0, 0, 0.1)' }}>
              <strong style={{ color: '#ff9999' }}>Технологии:</strong> GetCourse, Justclick, AmoCRM, ManyChat, Tilda, WordPress.
            </li>
            <li style={{ padding: '8px 0' }}>
              <strong style={{ color: '#ff9999' }}>Срочные задачи:</strong> +50% к стоимости за выполнение в течение 24 часов.
            </li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PricelistPage;
