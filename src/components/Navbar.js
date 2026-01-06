import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  // Для HashRouter активный путь чаще всего лежит в hash
  const currentPath =
    (location.hash && location.hash.replace(/^#/, '')) || location.pathname || '/';

  const isActive = (path) => currentPath === path;

  const navStyle = {
    background: '#0a0a0a',
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    borderBottom: '2px solid #ff0000',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(255, 0, 0, 0.3)',
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    flex: '0 0 auto',
  };

  const logoTextStyle = {
    color: '#ff0000',
    fontSize: '18px',
    fontWeight: 'bold',
    textShadow: '0 0 5px #ff0000',
    whiteSpace: 'nowrap',
  };

  const navLinksStyle = {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: '1 1 240px',
  };

  const linkStyle = (active) => ({
    color: active ? '#000' : '#fff',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '10px',
    transition: 'all 0.2s',
    background: active ? '#ff0000' : 'transparent',
    border: active ? 'none' : '1px solid #ff0000',
    fontWeight: 'bold',
    fontSize: '14px',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  });

  return (
    <nav style={navStyle}>
      <Link to="/" style={logoStyle}>
        <span
          style={{
            color: '#ff0000',
            fontSize: '26px',
            lineHeight: 1,
          }}
        >
          ⚡
        </span>
        <div style={logoTextStyle}>LYOKORPS TECH</div>
      </Link>

      <div style={navLinksStyle}>
        <Link to="/" style={linkStyle(isActive('/'))}>
          Главная
        </Link>
        <Link to="/pricelist" style={linkStyle(isActive('/pricelist'))}>
          Прайс-лист
        </Link>
        <Link to="/game" style={linkStyle(isActive('/game'))}>
          Игра
        </Link>
        <Link to="/contacts" style={linkStyle(isActive('/contacts'))}>
          Контакты
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
