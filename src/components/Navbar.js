import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  const navStyle = {
    background: '#0a0a0a',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #ff0000',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(255, 0, 0, 0.3)'
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none'
  };

  const logoTextStyle = {
    color: '#ff0000',
    fontSize: '22px',
    fontWeight: 'bold',
    textShadow: '0 0 5px #ff0000'
  };

  const navLinksStyle = {
    display: 'flex',
    gap: '20px'
  };

  const linkStyle = (active) => ({
    color: active ? '#000' : '#fff',
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    transition: 'all 0.3s',
    background: active ? '#ff0000' : 'transparent',
    border: active ? 'none' : '1px solid #ff0000',
    fontWeight: 'bold',
    fontSize: '16px'
  });

  return (
    <nav style={navStyle}>
      <Link to="/" style={logoStyle}>
        <span style={{ 
          color: '#ff0000', 
          fontSize: '28px',
          animation: 'pulse 2s infinite'
        }}>
          ⚡
        </span>
        <div style={logoTextStyle}>
          LYOKORPS TECH
        </div>
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