import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  // Для HashRouter активный путь чаще всего лежит в hash
  const currentPath =
    (location.hash && location.hash.replace(/^#/, '')) || location.pathname || '/';

  const isActive = (path) => currentPath === path;

  // Telegram WebApp safe area + iOS/Android/desktop
  const [safeTop, setSafeTop] = useState(0);

  useEffect(() => {
    const getSafeTop = () => {
      // Telegram WebApp может отдавать CSS переменные safe-area
      // На iOS Safari работают env(safe-area-inset-top)
      // Тут берем максимум из возможных вариантов
      const cssVar =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--tg-safe-area-inset-top'),
          10
        ) || 0;

      // Фоллбек: попробуем прочитать env через временный элемент
      let envTop = 0;
      try {
        const probe = document.createElement('div');
        probe.style.cssText =
          'position:fixed;top:0;left:0;height:constant(safe-area-inset-top);height:env(safe-area-inset-top);';
        document.body.appendChild(probe);
        const h = Math.round(probe.getBoundingClientRect().height);
        document.body.removeChild(probe);
        envTop = Number.isFinite(h) ? h : 0;
      } catch {
        envTop = 0;
      }

      // Telegram WebApp header (если есть)
      const tgTop =
        (window.Telegram &&
          window.Telegram.WebApp &&
          window.Telegram.WebApp.viewportStableHeight &&
          0) ||
        0;

      setSafeTop(Math.max(cssVar, envTop, tgTop, 0));
    };

    getSafeTop();
    window.addEventListener('resize', getSafeTop);
    return () => window.removeEventListener('resize', getSafeTop);
  }, []);

  const styles = useMemo(() => {
    const navStyle = {
      background: '#0a0a0a',
      padding: `calc(10px + ${safeTop}px) 12px 10px`,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: '2px solid #ff0000',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(255, 0, 0, 0.25)',
    };

    const logoStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      textDecoration: 'none',
      flex: '0 0 auto',
      minWidth: 0,
    };

    const logoTextStyle = {
      color: '#ff0000',
      fontSize: '16px',
      fontWeight: '900',
      textShadow: '0 0 5px rgba(255,0,0,0.7)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '46vw',
    };

    const navLinksStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '8px',
      flex: '1 1 auto',
      flexWrap: 'wrap',
    };

    const linkStyle = (active) => ({
      color: active ? '#000' : '#fff',
      textDecoration: 'none',
      padding: '9px 12px',
      borderRadius: '12px',
      transition: 'all 0.2s ease',
      background: active ? '#ff0000' : 'transparent',
      border: active ? '1px solid #ff0000' : '1px solid rgba(255,0,0,0.9)',
      fontWeight: '800',
      fontSize: '13px',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
    });

    // Мобилка (TG, Android, iPhone): делаем кнопки в 2 ряда, чтобы не ломало
    const mobileWrapStyle = {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: '8px',
      marginTop: '10px',
    };

    const mobileLinkStyle = (active) => ({
      ...linkStyle(active),
      width: '100%',
      textAlign: 'center',
      padding: '10px 8px',
      borderRadius: '12px',
      fontSize: '12px',
    });

    return {
      navStyle,
      logoStyle,
      logoTextStyle,
      navLinksStyle,
      linkStyle,
      mobileWrapStyle,
      mobileLinkStyle,
    };
  }, [safeTop]);

  // Простая проверка "мобилка" без зависимостей
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
  }, []);

  return (
    <nav style={styles.navStyle}>
      <Link to="/" style={styles.logoStyle}>
        <span style={{ color: '#ff0000', fontSize: '26px', lineHeight: 1 }}>⚡</span>
        <div style={styles.logoTextStyle}>LYOKORPS TECH</div>
      </Link>

      {!isMobile ? (
        <div style={styles.navLinksStyle}>
          <Link to="/" style={styles.linkStyle(isActive('/'))}>
            Главная
          </Link>
          <Link to="/pricelist" style={styles.linkStyle(isActive('/pricelist'))}>
            Прайс-лист
          </Link>
          <Link to="/game" style={styles.linkStyle(isActive('/game'))}>
            Игра
          </Link>
          <Link to="/contacts" style={styles.linkStyle(isActive('/contacts'))}>
            Контакты
          </Link>
        </div>
      ) : (
        <div style={styles.mobileWrapStyle}>
          <Link to="/" style={styles.mobileLinkStyle(isActive('/'))}>
            Главная
          </Link>
          <Link to="/pricelist" style={styles.mobileLinkStyle(isActive('/pricelist'))}>
            Прайс-лист
          </Link>
          <Link to="/game" style={styles.mobileLinkStyle(isActive('/game'))}>
            Игра
          </Link>
          <Link to="/contacts" style={styles.mobileLinkStyle(isActive('/contacts'))}>
            Контакты
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
