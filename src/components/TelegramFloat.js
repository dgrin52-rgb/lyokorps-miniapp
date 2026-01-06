import React from 'react';
import { motion } from 'framer-motion';
import { openTelegramLink } from '../telegram';

const TelegramFloat = () => {
  return (
    <motion.div
      onClick={() => openTelegramLink('https://t.me/Lyokorps')}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1 }}
      whileHover={{
        scale: 1.1,
        boxShadow: '0 0 30px rgba(0, 136, 204, 1)',
        rotate: [0, 10, -10, 10, 0],
      }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: 'linear-gradient(135deg, #0088cc, #00aaff)',
        color: 'white',
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '34px',
        boxShadow: '0 5px 25px rgba(0, 136, 204, 0.7)',
        zIndex: 9999,
        cursor: 'pointer',
        border: '3px solid white',
      }}
    >
      💬
    </motion.div>
  );
};

export default TelegramFloat;
