import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  // Для HashRouter активный путь чаще всего лежит в hash
  const currentPath =
    (location.hash && location.hash.replace(/^#/, '')) || location.pathname || '/';

  const isActive = (path) => currentPath === path;

  const linkClass = (path) =>
    `navbar__link ${isActive(path) ? 'navbar__link--active' : ''}`;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">
        <span style={{ color: '#ff0000', fontSize: '26px', lineHeight: 1 }}>⚡</span>
        <div className="navbar__logoText">LYOKORPS TECH</div>
      </Link>

      <div className="navbar__links">
        <Link to="/" className={linkClass('/')}>Главная</Link>
        <Link to="/pricelist" className={linkClass('/pricelist')}>Прайс-лист</Link>
        <Link to="/game" className={linkClass('/game')}>Игра</Link>
        <Link to="/contacts" className={linkClass('/contacts')}>Контакты</Link>
      </div>
    </nav>
  );
};

export default Navbar;
