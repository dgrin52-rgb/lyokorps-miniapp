// src/App.js

import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PricelistPage from './pages/PricelistPage';
import GamePage from './pages/GamePage';
import ContactsPage from './pages/ContactsPage';
import TelegramFloat from './components/TelegramFloat';
import AdminPage from "./pages/AdminPage";

import { initTelegram } from './telegram';

function App() {
  useEffect(() => {
    initTelegram();
  }, []);

  return (
    <Router>
      <div
        style={{
          minHeight: '100dvh',
          background: '#000000',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          position: 'relative',
          color: 'white',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pricelist" element={<PricelistPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/admin" element={<AdminPage />} />

        </Routes>

        <TelegramFloat />
      </div>
    </Router>
  );
}

export default App;
