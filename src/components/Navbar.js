import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  // Для HashRouter активный путь чаще всего лежит в hash
  const currentPath =
    (location.hash && location.hash.replace(/^#/, '')) ||
    location.pathname ||
    '/';

  const isActive = (path) => currentPath === path;

  const linkClass = (path) =>
    `navbar__link ${isActive(path) ? 'navbar__link--active' : ''}`;

  // --- TELEGRAM DATA ---
  const [tgId, setTgId] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    try {
      tg?.ready?.();
    } catch (e) {}

    const user = tg?.initDataUnsafe?.user;
    if (user?.id) {
      setTgId(user.id);
    }
  }, []);
  // ---------------------

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">
        <span style={{ color: '#ff0000', fontSize: '26px', lineHeight: 1 }}>
          ⚡
        </span>
        <div className="navbar__logoText">LYOKORPS TECH</div>
      </Link>

      <div className="navbar__links">
        <Link to="/" className={linkClass('/')}>Главная</Link>
        <Link to="/pricelist" className={linkClass('/pricelist')}>Прайс-лист</Link>
        <Link to="/game" className={linkClass('/game')}>Игра</Link>
        <Link to="/contacts" className={linkClass('/contacts')}>Контакты</Link>
      </div>

      {/* TG ID — для диагностики */}
      <div
        style={{
          marginLeft: 'auto',
          padding: '6px 10px',
          borderRadius: 10,
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,0,0,0.6)',
          color: '#ff4444',
          fontSize: 12,
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
        }}
      >
        Ваш TG ID: {tgId ?? '—'}
      </div>
    </nav>
  );
};

export default Navbar;
