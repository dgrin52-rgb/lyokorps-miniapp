import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const currentPath = useMemo(() => {
    const hashPath = location.hash ? location.hash.replace(/^#/, '') : '';
    return hashPath || location.pathname || '/';
  }, [location.hash, location.pathname]);

  const isActive = (path) => currentPath === path;

  const linkClass = (path) =>
    `navbar__link ${isActive(path) ? 'navbar__link--active' : ''}`;

  const [tgId, setTgId] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;

    if (user?.id) setTgId(user.id);
  }, []);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">
        <span style={{ color: '#ff0000', fontSize: '26px', lineHeight: 1 }}>⚡</span>
        <div className="navbar__logoText">LYOKORPS TECH</div>
      </Link>

      <div className="navbar__links">
        <Link to="/" className={linkClass('/')}>Главная</Link>
        <Link to="/pricelist" className={linkClass('/pricelist')}>Прайс</Link>
        <Link to="/game" className={linkClass('/game')}>Игра</Link>
        <Link to="/contacts" className={linkClass('/contacts')}>Контакты</Link>
      </div>

      <div className="navbar__tgid">Ваш TG ID: {tgId ?? '—'}</div>
    </nav>
  );
};

export default Navbar;
