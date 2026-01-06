// src/App.js

import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PricelistPage from './pages/PricelistPage';
import GamePage from './pages/GamePage';
import ContactsPage from './pages/ContactsPage';
import TelegramFloat from './components/TelegramFloat';

import { initTelegram } from './telegram';

function App() {
  useEffect(() => {
    initTelegram();
  }, []);

  return (
    <Router>
      <div
        style={{
          minHeight: '100vh',
          background: '#000000',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          position: 'relative',
          color: 'white',
        }}
      >
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pricelist" element={<PricelistPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/contacts" element={<ContactsPage />} />
        </Routes>

        <TelegramFloat />
      </div>
    </Router>
  );
}

export default App;
