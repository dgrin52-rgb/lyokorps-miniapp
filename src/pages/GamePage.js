import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';

const VIDEO_SRC = '/media/matrix.mp4';

const GamePage = () => {
  const navigate = useNavigate();

  const goToPrice = () => navigate('/pricelist');
  const returnToMainSite = () => navigate('/');

  // hover на таче “липнет” и даёт артефакты — отключаем hover эффекты
  const canHover = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches ?? false;
  }, []);

  // Состояния игры
  const [score, setScore] = useState(0);
  const [foundBugs, setFoundBugs] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStatus, setGameStatus] = useState('initial'); // initial, playing, win, lose, completed
  const [showConfetti, setShowConfetti] = useState(false);
  const [promoCode, setPromoCode] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [difficulty, setDifficulty] = useState('normal');
  const [specialBugs, setSpecialBugs] = useState([]);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [gameDecorations, setGameDecorations] = useState([]);
  const [binaryStreams, setBinaryStreams] = useState([]);

  const gameAreaRef = useRef(null);
  const maxGamesPerDevice = 1;

  // Настройки сложности
  const difficultySettings = {
    easy: { bugs: 3, time: 90, bugSize: 50, pointsMultiplier: 1, maxDiscount: 10, decorations: 5, binaryColumns: 8 },
    normal: { bugs: 5, time: 60, bugSize: 40, pointsMultiplier: 1.5, maxDiscount: 15, decorations: 8, binaryColumns: 12 },
    hard: { bugs: 7, time: 45, bugSize: 30, pointsMultiplier: 2, maxDiscount: 20, decorations: 12, binaryColumns: 16 },
    expert: { bugs: 10, time: 30, bugSize: 25, pointsMultiplier: 3, maxDiscount: 25, decorations: 15, binaryColumns: 20 },
  };

  // Типы багов
  const bugTypes = [
    { id: 1, name: 'Вирус', emoji: '🦠', mainColor: '#ffffff', glowColor: '#ff0000', accentColor: '#ff0000', points: 200, rare: false, type: 'virus' },
    { id: 2, name: 'Критическая ошибка', emoji: '💥', mainColor: '#ffffff', glowColor: '#ff3300', accentColor: '#ff6600', points: 250, rare: false, type: 'error' },
    { id: 3, name: 'Вредоносный код', emoji: '⚠️', mainColor: '#ffffff', glowColor: '#ff0000', accentColor: '#ff4444', points: 180, rare: false, type: 'malware' },
    { id: 4, name: 'Системный сбой', emoji: '❌', mainColor: '#ffffff', glowColor: '#ff0066', accentColor: '#ff0000ff', points: 220, rare: false, type: 'crash' },
    { id: 5, name: 'Троян', emoji: '🐴', mainColor: '#ffffff', glowColor: '#ff0000ff', accentColor: '#ff4322ff', points: 300, rare: true, type: 'trojan' },
    { id: 6, name: 'Шпионское ПО', emoji: '👁️', mainColor: '#ffffff', glowColor: '#ff2600ff', accentColor: '#ff2922ff', points: 350, rare: true, type: 'spyware' },
  ];

  // Декоративные элементы
  const decorationTypes = [
    { id: 1, emoji: '⚙️', color: '#00ff00', name: 'Шестеренка' },
    { id: 2, emoji: '🔧', color: '#0a570aff', name: 'Гаечный ключ' },
    { id: 3, emoji: '💿', color: '#218121ff', name: 'Диск' },
    { id: 4, emoji: '📱', color: '#008800', name: 'Телефон' },
    { id: 5, emoji: '🖥️', color: '#006600', name: 'Компьютер' },
  ];

  // ✅ Универсальный видео-фон для любой “карточки/окна”
  const VideoLayer = ({ opacity = 0.18, dark = 0.62, borderRadius = 20 }) => (
    <>
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src={VIDEO_SRC}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity,
          zIndex: 0,
          pointerEvents: 'none',
          borderRadius,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `rgba(0,0,0,${dark})`,
          zIndex: 0,
          pointerEvents: 'none',
          borderRadius,
        }}
      />
    </>
  );

  // Проверяем, играл ли уже пользователь
  useEffect(() => {
    const played = localStorage.getItem('techGamePlayed');
    const playedCount = localStorage.getItem('techGamesPlayedCount') || 0;
    const promoUsed = localStorage.getItem('techPromoUsed');

    if (played === 'true') {
      setGamesPlayed(parseInt(playedCount, 10));
      if (parseInt(playedCount, 10) >= maxGamesPerDevice) {
        setGameStatus('completed');
        setGameCompleted(true);
      }
    }

    if (promoUsed) setPromoCode(JSON.parse(promoUsed));
  }, []);

  // Промокоды
  const generatePromoCode = (difficultyLevel, timeSpent, scoreValue) => {
    const baseDiscount = difficultySettings[difficultyLevel].maxDiscount;
    let finalDiscount = baseDiscount;

    if (difficultyLevel === 'expert') {
      const maxTime = difficultySettings.expert.time;
      const timePercentage = (timeSpent / maxTime) * 100;
      const scorePercentage = (scoreValue / (difficultySettings.expert.bugs * 350)) * 100;
      if (timePercentage > 80 || scorePercentage < 50) finalDiscount = 15;
    }

    const codes = [
      { code: 'TECH10', discount: 10 },
      { code: 'MASTER15', discount: 15 },
      { code: 'BUG20', discount: 20 },
      { code: 'LYOKORPS25', discount: 25 },
    ];

    const exact = codes.find((c) => c.discount === finalDiscount);
    return exact || codes.reduce((p, c) => (Math.abs(c.discount - finalDiscount) < Math.abs(p.discount - finalDiscount) ? c : p));
  };

  // Генерация багов
  const generateBugs = useCallback(() => {
    const { bugs: bugCount, bugSize } = difficultySettings[difficulty];
    const bugsArr = [];
    const usedPositions = new Set();

    for (let i = 0; i < bugCount; i++) {
      let x, y;
      let attempts = 0;
      do {
        x = 10 + Math.random() * 80;
        y = 10 + Math.random() * 80;
        attempts++;
      } while (usedPositions.has(`${Math.floor(x)}-${Math.floor(y)}`) && attempts < 100);

      usedPositions.add(`${Math.floor(x)}-${Math.floor(y)}`);

      const isRare = Math.random() < 0.2;
      const availableTypes = bugTypes.filter((type) => type.rare === isRare);
      const bugType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

      bugsArr.push({
        id: Date.now() + i,
        type: bugType,
        x,
        y,
        found: false,
        blinking: Math.random() < 0.3,
        rotating: Math.random() < 0.2,
        pulsing: Math.random() < 0.4,
        size: bugSize * (isRare ? 1.3 : 1),
      });
    }

    return bugsArr;
  }, [difficulty]);

  // Генерация бинарных колонок
  const generateBinaryColumns = useCallback(() => {
    const { binaryColumns } = difficultySettings[difficulty];
    const columns = [];

    for (let i = 0; i < binaryColumns; i++) {
      const columnWidth = 100 / binaryColumns;
      const x = i * columnWidth + columnWidth / 2;
      const speed = 1 + Math.random() * 2;
      const charCount = 15 + Math.floor(Math.random() * 25);
      const delay = Math.random() * 5;

      let binaryString = '';
      for (let j = 0; j < charCount; j++) binaryString += Math.random() > 0.5 ? '1' : '0';

      columns.push({
        id: `column-${i}`,
        x,
        speed,
        binaryString,
        charCount,
        delay,
        opacity: 0.12 + Math.random() * 0.25,
        fontSize: 12 + Math.random() * 10,
      });
    }

    return columns;
  }, [difficulty]);

  // Генерация декораций
  const generateDecorations = useCallback(() => {
    const { decorations: decorationCount } = difficultySettings[difficulty];
    const decors = [];
    const usedPositions = new Set();

    for (let i = 0; i < decorationCount; i++) {
      let x, y;
      let attempts = 0;
      do {
        x = 5 + Math.random() * 90;
        y = 5 + Math.random() * 90;
        attempts++;
      } while (usedPositions.has(`${Math.floor(x)}-${Math.floor(y)}`) && attempts < 100);

      usedPositions.add(`${Math.floor(x)}-${Math.floor(y)}`);

      const decorationType = decorationTypes[Math.floor(Math.random() * decorationTypes.length)];
      const size = 20 + Math.random() * 15;

      decors.push({
        id: `decoration-${Date.now()}-${i}`,
        type: decorationType,
        x,
        y,
        size,
        pulsating: Math.random() < 0.5,
        rotating: Math.random() < 0.3,
        opacity: 0.12 + Math.random() * 0.22,
      });
    }

    return decors;
  }, [difficulty]);

  // Инициализация багов
  const [bugs, setBugs] = useState(() => generateBugs());

  // Инициализация колонок при старте игры
  useEffect(() => {
    if (gameStatus === 'playing') setBinaryStreams(generateBinaryColumns());
  }, [gameStatus, generateBinaryColumns]);

  // Таймер
  useEffect(() => {
    if (timeLeft > 0 && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        setTimeLeft((t) => t - 1);

        if (difficulty === 'expert' && timeLeft % 10 === 0 && timeLeft > 0) {
          const unfoundBugs = bugs.filter((b) => !b.found);
          if (unfoundBugs.length > 0) {
            const randomBug = unfoundBugs[Math.floor(Math.random() * unfoundBugs.length)];
            setBugs((prev) => prev.map((b) => (b.id === randomBug.id ? { ...b, found: true } : b)));
          }
        }
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (timeLeft === 0 && gameStatus === 'playing') setGameStatus('lose');
  }, [timeLeft, gameStatus, difficulty, bugs]);

  // Клик по багу
  const handleBugClick = (bugId) => {
    if (gameStatus !== 'playing') return;

    const now = Date.now();
    const timeDiff = now - lastClickTime;

    if (timeDiff < 500) setCombo((prev) => prev + 1);
    else setCombo(1);

    setLastClickTime(now);

    const updatedBugs = bugs.map((bug) => (bug.id === bugId ? { ...bug, found: true } : bug));
    setBugs(updatedBugs);

    const clickedBug = bugs.find((b) => b.id === bugId);
    setFoundBugs((prev) => [...prev, clickedBug]);

    const pointsMultiplier = difficultySettings[difficulty].pointsMultiplier;
    const comboMultiplier = 1 + combo * 0.1;
    const points = Math.floor(clickedBug.type.points * pointsMultiplier * comboMultiplier);
    setScore((prev) => prev + points);

    const remainingBugs = updatedBugs.filter((b) => !b.found);
    if (remainingBugs.length === 0) {
      const newGamesPlayed = gamesPlayed + 1;
      setGamesPlayed(newGamesPlayed);
      localStorage.setItem('techGamePlayed', 'true');
      localStorage.setItem('techGamesPlayedCount', newGamesPlayed.toString());

      if (!promoCode) {
        const timeSpent = difficultySettings[difficulty].time - timeLeft;
        const newPromo = generatePromoCode(difficulty, timeSpent, score + points);
        setPromoCode(newPromo);
        localStorage.setItem('techPromoUsed', JSON.stringify(newPromo));
      }

      setGameStatus('win');
      setShowConfetti(true);
      setGameCompleted(true);
    }
  };

  // Клик по декорации
  const handleDecorationClick = (decorationId) => {
    if (gameStatus !== 'playing') return;

    setGameDecorations((prev) => prev.map((d) => (d.id === decorationId ? { ...d, clicked: true } : d)));
    setTimeout(() => {
      setGameDecorations((prev) => prev.map((d) => (d.id === decorationId ? { ...d, clicked: false } : d)));
    }, 450);
  };

  // Подсказка
  const useHint = () => {
    if (hintsUsed >= 3 || gameStatus !== 'playing') return;

    const unfoundBugs = bugs.filter((b) => !b.found);
    if (unfoundBugs.length === 0) return;

    const randomBug = unfoundBugs[Math.floor(Math.random() * unfoundBugs.length)];
    setSpecialBugs((prev) => [...prev, { bugId: randomBug.id, type: 'hint', expires: Date.now() + 3000 }]);

    setHintsUsed((prev) => prev + 1);
    setScore((prev) => Math.max(0, prev - 50));

    setTimeout(() => {
      setSpecialBugs((prev) => prev.filter((sb) => sb.bugId !== randomBug.id));
    }, 3000);
  };

  // Начать игру
  const startGame = () => {
    if (gamesPlayed >= maxGamesPerDevice && gameCompleted) {
      setGameStatus('completed');
      return;
    }
    setShowRules(false);
    setGameStatus('playing');
    resetGame();
  };

  // Сброс игры
  const resetGame = () => {
    setBugs(generateBugs());
    setGameDecorations(generateDecorations());
    setBinaryStreams(generateBinaryColumns());
    setFoundBugs([]);
    setTimeLeft(difficultySettings[difficulty].time);
    setScore(0);
    setHintsUsed(0);
    setCombo(0);
    setSpecialBugs([]);
  };

  // Копировать промокод
  const copyPromoCode = () => {
    if (!promoCode) return;
    navigator.clipboard.writeText(promoCode.code);
    alert(`Промокод ${promoCode.code} скопирован в буфер обмена!`);
  };

  // Прогресс
  const progress = bugs.length > 0 ? (foundBugs.length / bugs.length) * 100 : 0;

  // Telegram
  const openTelegram = () => {
    const message = `Добрый день, мой промокод ${promoCode?.code} на скидку ${promoCode?.discount}%!`;
    window.open(`https://t.me/Lyokorps?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Фикс “кнопка не обрезана” — обёртка режет glow ровно
  const clippedButtonWrap = {
    width: '100%',
    maxWidth: '560px',
    margin: '0 auto',
    borderRadius: '18px',
    overflow: 'hidden',
    clipPath: 'inset(0 round 18px)',
  };

  const primaryButtonStyle = {
    width: '100%',
    border: 'none',
    color: 'white',
    padding: 'clamp(16px, 3.8vw, 22px) clamp(18px, 5vw, 46px)',
    borderRadius: '18px',
    fontSize: 'clamp(18px, 4.6vw, 26px)',
    fontWeight: 'bold',
    cursor: 'pointer',
    lineHeight: 1.1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    WebkitTapHighlightColor: 'transparent',
  };

  // Рендер бага
  const renderBugWithSpots = (bug) => {
    const spots = [];
    const spotCount = 8 + Math.floor(Math.random() * 8);

    for (let i = 0; i < spotCount; i++) {
      const angle = (i * (2 * Math.PI)) / spotCount;
      const distance = bug.size * 0.35 + Math.random() * bug.size * 0.1;
      const spotSize = 3 + Math.random() * 5;

      spots.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: spotSize,
        color: bug.type.accentColor,
      });
    }

    return (
      <motion.div
        key={bug.id}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: bug.blinking ? [1, 1.2, 1] : bug.pulsing ? [1, 1.1, 1] : 1,
          opacity: 1,
          rotate: bug.rotating ? 360 : 0,
        }}
        transition={{
          scale: bug.blinking ? { repeat: Infinity, duration: 0.8 } : bug.pulsing ? { repeat: Infinity, duration: 1.5 } : {},
          rotate: bug.rotating ? { repeat: Infinity, duration: 2 } : {},
        }}
        whileHover={canHover ? { scale: 1.25 } : undefined}
        whileTap={{ scale: 0.75 }}
        onClick={() => handleBugClick(bug.id)}
        style={{
          position: 'absolute',
          left: `${bug.x}%`,
          top: `${bug.y}%`,
          width: `${bug.size}px`,
          height: `${bug.size}px`,
          background: `radial-gradient(circle, ${bug.type.mainColor}, ${bug.type.mainColor}cc)`,
          borderRadius: '50%',
          cursor: 'pointer',
          border: `3px solid ${bug.type.glowColor}`,
          boxShadow: `0 0 30px ${bug.type.glowColor}, inset 0 0 20px ${bug.type.glowColor}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: `${bug.size * 0.3}px`,
          zIndex: 3,
          transform: 'translate(-50%, -50%)',
          overflow: 'visible',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {spots.map((spot, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${spot.x}px`,
              top: `${spot.y}px`,
              width: `${spot.size}px`,
              height: `${spot.size}px`,
              background: spot.color,
              borderRadius: '50%',
              boxShadow: `0 0 8px ${spot.color}`,
            }}
          />
        ))}

        <div style={{ position: 'relative', zIndex: 4, fontSize: `${bug.size * 0.4}px`, filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))' }}>
          {bug.type.emoji}
        </div>
      </motion.div>
    );
  };

  // Бинарная колонка
  const BinaryColumn = ({ column }) => (
    <div
      style={{
        position: 'absolute',
        left: `${column.x}%`,
        top: '-100px',
        fontFamily: 'monospace',
        fontSize: `${column.fontSize}px`,
        color: '#00ff00',
        opacity: column.opacity,
        textShadow: '0 0 8px #00ff00',
        whiteSpace: 'nowrap',
        zIndex: 1,
        pointerEvents: 'none',
        transform: 'translateX(-50%)',
        lineHeight: `${column.fontSize * 1.2}px`,
        writingMode: 'vertical-lr',
        textOrientation: 'mixed',
        animation: `fallVertical ${20 / column.speed}s linear infinite`,
        animationDelay: `${column.delay}s`,
      }}
    >
      {column.binaryString.split('').map((char, index) => (
        <div
          key={`${column.id}-${index}`}
          style={{
            color: char === '1' ? '#00ff00' : '#00aa00',
            opacity: 0.3 + (index / column.charCount) * 0.7,
            textShadow: char === '1' ? '0 0 10px #00ff00' : '0 0 5px #00aa00',
            marginBottom: '2px',
            display: 'block',
          }}
        >
          {char}
        </div>
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: 'calc(100vh - 70px)',
        padding: '20px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        background: '#000011',
      }}
    >
      {/* ✅ ВИДЕО-ФОН НА ВСЮ СТРАНИЦУ */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src={VIDEO_SRC}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.22,
          zIndex: 0,
          pointerEvents: 'none',
          filter: 'contrast(1.08) saturate(1.15)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.65), rgba(0,0,30,0.55))',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {showConfetti && (
        <Confetti recycle={false} numberOfPieces={200} onConfettiComplete={() => setShowConfetti(false)} />
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <motion.h1
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            style={{
              fontSize: '42px',
              background: 'linear-gradient(45deg, #00ff00, #00cc00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '15px',
              textShadow: '0 0 20px #00ff00',
            }}
          >
            🎮 КИБЕР-ВИРУСЫ
          </motion.h1>
        </div>

        {/* ✅ ОКНО ПРАВИЛ — тоже с видео */}
        {showRules && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'relative',
              border: '2px solid #00aaff',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '30px',
              maxWidth: '800px',
              marginLeft: 'auto',
              marginRight: 'auto',
              boxShadow: '0 0 30px rgba(0, 170, 255, 0.3)',
              overflow: 'hidden',
            }}
          >
            <VideoLayer opacity={0.16} dark={0.58} borderRadius={15} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <h2 style={{ color: '#00ff00', fontSize: '20px', margin: 0, textShadow: '0 0 10px #00ff00' }}>
                  📖 КИБЕР-ЗАДАЧА:
                </h2>
                <motion.button
                  whileHover={canHover ? { scale: 1.1 } : undefined}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowRules(false)}
                  style={{
                    background: 'rgba(255, 0, 0, 0.2)',
                    border: '1px solid #ff0000',
                    color: '#ff0000',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    boxShadow: '0 0 10px #ff0000',
                  }}
                >
                  ×
                </motion.button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div>
                  <p style={{ color: '#aaffff', marginBottom: '8px' }}>
                    <span style={{ color: '#00ff00' }}>🎯 ЦЕЛЬ:</span> Уничтожить все кибер-вирусы
                  </p>
                  <p style={{ color: '#aaffff', marginBottom: '8px' }}>
                    <span style={{ color: '#00ff00' }}>⚙️ ИГРА:</span> Кликайте на белые круги с точками
                  </p>
                </div>

                <div>
                  <p style={{ color: '#aaffff', marginBottom: '8px' }}>
                    <span style={{ color: '#00ff00' }}>💡 СКАНИРОВАНИЕ:</span> До 3-х раз (-50 очков)
                  </p>
                  <p style={{ color: '#aaffff', marginBottom: '8px' }}>
                    <span style={{ color: '#00ff00' }}>⚡ КОМБО:</span> Быстрые клики = больше очков
                  </p>
                </div>

                <div>
                  <p style={{ color: '#aaffff', marginBottom: '8px' }}>
                    <span style={{ color: '#00ff00' }}>🎁 НАГРАДА:</span> Промокод на скидку 10-25%
                  </p>
                  <p style={{ color: '#ff9999', fontSize: '14px', fontStyle: 'italic' }}>
                    ⚠️ 1 промокод = 1 устройство
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* INITIAL (окно стартовое) */}
        {gameStatus === 'initial' && !gameCompleted && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
            <div
              style={{
                position: 'relative',
                border: '3px solid #00aaff',
                borderRadius: '20px',
                padding: '40px',
                marginBottom: '30px',
                boxShadow: '0 0 50px rgba(0, 170, 255, 0.4)',
                overflow: 'hidden',
              }}
            >
              <VideoLayer opacity={0.18} dark={0.58} borderRadius={20} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: '28px', color: '#00ff00', marginBottom: '20px', textShadow: '0 0 15px #00ff00' }}>
                  ГОТОВЫ К КИБЕР-АТАКЕ?
                </h2>

                <p style={{ color: '#aaffff', fontSize: '18px', marginBottom: '30px', lineHeight: '1.6' }}>
                  Уничтожьте все вирусы в системе и получите кибер-промокод!
                </p>

                <div style={{ marginBottom: '25px' }}>
                  <p style={{ color: '#ffff99', marginBottom: '10px', textShadow: '0 0 5px #ffff00' }}>
                    УРОВЕНЬ СЛОЖНОСТИ:
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {Object.entries(difficultySettings).map(([key]) => (
                      <motion.button
                        key={`difficulty-${key}`}
                        whileHover={canHover ? { scale: 1.05 } : undefined}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDifficulty(key)}
                        style={{
                          background:
                            difficulty === key
                              ? key === 'easy'
                                ? 'linear-gradient(45deg, #ffffff, #cccccc)'
                                : key === 'normal'
                                ? 'linear-gradient(45deg, #00ff00, #009900)'
                                : key === 'hard'
                                ? 'linear-gradient(45deg, #0066ff, #0044cc)'
                                : 'linear-gradient(45deg, #9900ff, #6600cc)'
                              : 'rgba(0, 100, 200, 0.3)',
                          border:
                            difficulty === key
                              ? key === 'easy'
                                ? '2px solid #ffffff'
                                : key === 'normal'
                                ? '2px solid #00ff00'
                                : key === 'hard'
                                ? '2px solid #0066ff'
                                : '2px solid #9900ff'
                              : '1px solid #00aaff',
                          color: difficulty === key ? (key === 'easy' ? 'black' : 'white') : '#88ddff',
                          padding: '10px 20px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          minWidth: '100px',
                        }}
                      >
                        {key === 'easy' && '🤓 НОВИЧОК'}
                        {key === 'normal' && '😎 ХАКЕР'}
                        {key === 'hard' && '😤 ЭЛИТА'}
                        {key === 'expert' && '👨‍💻 КИБЕР'}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(0, 255, 0, 0.1)',
                    border: '1px solid #00ff00',
                    borderRadius: '10px',
                    padding: '15px',
                    marginBottom: '30px',
                    boxShadow: '0 0 20px rgba(0, 255, 0, 0.25)',
                  }}
                >
                  <p style={{ color: '#ffff99', fontSize: '14px' }}>
                    <strong>
                      ВЫБРАНО:{' '}
                      {difficulty === 'easy' ? 'НОВИЧОК' : difficulty === 'normal' ? 'ХАКЕР' : difficulty === 'hard' ? 'ЭЛИТА' : 'КИБЕР'}
                    </strong>
                    <br />
                    Вирусов: {difficultySettings[difficulty].bugs} • Время: {difficultySettings[difficulty].time} сек
                    <br />
                    МАКС. СКИДКА: <strong style={{ color: '#00ff00' }}>{difficultySettings[difficulty].maxDiscount}%</strong>
                  </p>
                </div>

                {/* ✅ фикс кнопки */}
                <div style={clippedButtonWrap}>
                  <motion.button
                    whileHover={canHover ? { scale: 1.02 } : undefined}
                    whileTap={{ scale: 0.98 }}
                    onClick={startGame}
                    style={{
                      ...primaryButtonStyle,
                      background: 'linear-gradient(45deg, #00ff00, #009900)',
                      boxShadow: '0 10px 30px rgba(0, 255, 0, 0.5)',
                    }}
                  >
                    🚀 ЗАПУСТИТЬ СКАНИРОВАНИЕ
                  </motion.button>
                </div>

                {!showRules && (
                  <button
                    onClick={() => setShowRules(true)}
                    style={{
                      marginTop: '16px',
                      background: 'transparent',
                      border: '1px solid #00aaff',
                      color: '#88ddff',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    📖 Показать задание
                  </button>
                )}
              </div>
            </div>

            <div style={{ border: '1px solid #ff0000', borderRadius: '10px', padding: '15px', boxShadow: '0 0 15px rgba(255, 0, 0, 0.25)', position: 'relative', overflow: 'hidden' }}>
              <VideoLayer opacity={0.12} dark={0.7} borderRadius={10} />
              <p style={{ position: 'relative', zIndex: 1, color: '#ff9999', fontSize: '14px', textAlign: 'center' }}>
                ⚠️ КИБЕР-ПРАВИЛО: 1 устройство = 1 промокод
              </p>
            </div>
          </motion.div>
        )}

        {/* PLAYING */}
        {gameStatus === 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="game-content">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {[
                { label: 'УНИЧТОЖЕНО', value: `${foundBugs.length}/${bugs.length}`, border: '#00ff00', bg: 'rgba(0,255,0,0.18)', color: '#00ff00' },
                { label: 'ОЧКИ', value: score, border: '#ffff00', bg: 'rgba(255,255,0,0.18)', color: '#ffff00' },
                { label: 'ВРЕМЯ', value: `${timeLeft}с`, border: '#ff0000', bg: 'rgba(255,0,0,0.18)', color: '#ff0000' },
                { label: 'КОМБО', value: `x${combo}`, border: '#ff00ff', bg: 'rgba(255,0,255,0.18)', color: '#ff00ff' },
              ].map((c) => (
                <div key={c.label} style={{ position: 'relative', overflow: 'hidden', borderRadius: '15px', padding: '12px 20px', minWidth: '110px', border: `2px solid ${c.border}`, boxShadow: `0 0 18px ${c.border}33` }}>
                  <VideoLayer opacity={0.12} dark={0.7} borderRadius={15} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#aaffff' }}>{c.label}</div>
                    <div style={{ fontSize: '24px', color: c.color, fontWeight: 'bold' }}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px', height: '10px', margin: '0 auto 20px', maxWidth: '600px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} style={{ height: '100%', background: 'linear-gradient(90deg, #00ff00, #00aa00)' }} />
            </div>

            {/* ✅ игровое поле (окно) с видео */}
            <div
              ref={gameAreaRef}
              style={{
                position: 'relative',
                border: '4px solid #00aaff',
                borderRadius: '20px',
                height: '500px',
                margin: '0 auto 30px',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 100px rgba(0, 100, 200, 0.45), 0 0 50px rgba(0, 170, 255, 0.5)',
              }}
            >
              <VideoLayer opacity={0.22} dark={0.55} borderRadius={20} />

              {binaryStreams.map((column) => (
                <BinaryColumn key={`binary-${column.id}`} column={column} />
              ))}

              {gameDecorations.map((decoration) => (
                <motion.div
                  key={`decoration-${decoration.id}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: decoration.pulsating ? [1, 1.1, 1] : 1,
                    opacity: decoration.opacity,
                    rotate: decoration.rotating ? 360 : 0,
                  }}
                  transition={{
                    scale: decoration.pulsating ? { repeat: Infinity, duration: 2 } : {},
                    rotate: decoration.rotating ? { repeat: Infinity, duration: 4 } : {},
                  }}
                  whileHover={canHover ? { scale: 1.15 } : undefined}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleDecorationClick(decoration.id)}
                  style={{
                    position: 'absolute',
                    left: `${decoration.x}%`,
                    top: `${decoration.y}%`,
                    width: `${decoration.size}px`,
                    height: `${decoration.size}px`,
                    background: `radial-gradient(circle, ${decoration.type.color}22, ${decoration.type.color}11)`,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: `2px solid ${decoration.type.color}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: `${decoration.type.color}aa`,
                    fontWeight: 'bold',
                    fontSize: `${decoration.size * 0.6}px`,
                    zIndex: 2,
                    transform: 'translate(-50%, -50%)',
                    textShadow: `0 0 10px ${decoration.type.color}`,
                  }}
                >
                  {decoration.type.emoji}
                </motion.div>
              ))}

              <AnimatePresence>
                {bugs.map((bug) => (!bug.found ? renderBugWithSpots(bug) : null))}
              </AnimatePresence>

              {specialBugs.map((special, index) => {
                const bug = bugs.find((b) => b.id === special.bugId);
                if (!bug || bug.found) return null;

                return (
                  <motion.div
                    key={`special-${index}`}
                    animate={{ boxShadow: ['0 0 40px #00ffff', '0 0 80px #00ffff', '0 0 40px #00ffff'] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{
                      position: 'absolute',
                      left: `${bug.x}%`,
                      top: `${bug.y}%`,
                      width: `${bug.size * 2.5}px`,
                      height: `${bug.size * 2.5}px`,
                      borderRadius: '50%',
                      border: '3px dashed #00ffff',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      zIndex: 2.5,
                    }}
                  />
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={canHover ? { scale: 1.03 } : undefined}
                whileTap={{ scale: 0.97 }}
                onClick={useHint}
                disabled={hintsUsed >= 3 || gameStatus !== 'playing'}
                style={{
                  background: hintsUsed >= 3 ? 'linear-gradient(45deg, #333, #555)' : 'linear-gradient(45deg, #ffff00, #ffaa00)',
                  border: 'none',
                  color: hintsUsed >= 3 ? '#aaa' : 'black',
                  padding: '12px 25px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: hintsUsed >= 3 ? 'not-allowed' : 'pointer',
                }}
              >
                🔍 Сканирование ({3 - hintsUsed})
              </motion.button>

              <motion.button
                whileHover={canHover ? { scale: 1.03 } : undefined}
                whileTap={{ scale: 0.97 }}
                onClick={goToPrice}
                style={{
                  background: 'linear-gradient(45deg, #00aaff, #0088cc)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 25px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                🏠 Выйти в меню
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* RESULT окна (win/lose/completed) — тоже с видео */}
        {(gameStatus === 'completed' || gameStatus === 'win' || gameStatus === 'lose') && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            key="game-result"
            style={{
              maxWidth: '520px',
              margin: '0 auto',
              border: gameStatus === 'win' ? '3px solid #00ff00' : '3px solid #ff0000',
              borderRadius: '20px',
              padding: '36px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: gameStatus === 'win' ? '0 0 50px rgba(0,255,0,0.35)' : '0 0 50px rgba(255,0,0,0.35)',
            }}
          >
            <VideoLayer opacity={0.18} dark={0.6} borderRadius={20} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {gameStatus === 'win' && (
                <>
                  <h1 style={{ fontSize: '36px', color: '#00ff00', marginBottom: '18px', textShadow: '0 0 20px #00ff00' }}>
                    🏆 СИСТЕМА ОЧИЩЕНА!
                  </h1>
                  <p style={{ color: '#aaffff', fontSize: '18px', marginBottom: '22px' }}>
                    Уничтожено {bugs.length} вирусов
                    <br />
                    Набрано <span style={{ color: '#ffff00', textShadow: '0 0 10px #ffff00' }}>{score}</span> очков
                  </p>

                  {promoCode && (
                    <>
                      <div style={{ border: '2px solid #ffff00', borderRadius: '15px', padding: '18px', marginBottom: '18px', background: 'rgba(0,0,0,0.35)' }}>
                        <p style={{ color: '#ffff99', marginBottom: '10px', fontSize: '16px' }}>🎁 КИБЕР-ПРОМОКОД:</p>
                        <div style={{ fontSize: '32px', color: '#ffff00', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '2px' }}>
                          {promoCode.code}
                        </div>
                        <p style={{ color: '#ffff99', marginTop: '10px' }}>Скидка {promoCode.discount}%</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <motion.button
                          whileHover={canHover ? { scale: 1.03 } : undefined}
                          whileTap={{ scale: 0.97 }}
                          onClick={copyPromoCode}
                          style={{ background: 'linear-gradient(45deg, #ffff00, #ffaa00)', border: 'none', color: 'black', padding: '14px 16px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          📋 Скопировать промокод
                        </motion.button>

                        <motion.button
                          whileHover={canHover ? { scale: 1.03 } : undefined}
                          whileTap={{ scale: 0.97 }}
                          onClick={openTelegram}
                          style={{ background: 'linear-gradient(45deg, #00aaff, #0088cc)', border: 'none', color: 'white', padding: '14px 16px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          💬 Использовать промокод в Telegram
                        </motion.button>

                        <button
                          onClick={goToPrice}
                          style={{ background: 'transparent', border: '2px solid #00aaff', color: '#88ddff', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}
                        >
                          🏠 Выйти в меню
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {gameStatus === 'lose' && (
                <>
                  <h1 style={{ fontSize: '36px', color: '#ff0000', marginBottom: '18px', textShadow: '0 0 20px #ff0000' }}>
                    💀 СИСТЕМА ЗАРАЖЕНА!
                  </h1>
                  <p style={{ color: '#ffaaaa', fontSize: '18px', marginBottom: '22px' }}>
                    Уничтожено {foundBugs.length} из {bugs.length} вирусов
                    <br />
                    Набрано <span style={{ color: '#ffff00' }}>{score}</span> очков
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <motion.button
                      whileHover={canHover ? { scale: 1.03 } : undefined}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setGameStatus('initial');
                        resetGame();
                      }}
                      style={{ background: 'linear-gradient(45deg, #ff0000, #cc0000)', border: 'none', color: 'white', padding: '14px 16px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      🔄 Повторное сканирование
                    </motion.button>

                    <button
                      onClick={goToPrice}
                      style={{ background: 'transparent', border: '2px solid #00aaff', color: '#88ddff', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}
                    >
                      🏠 Выйти в меню
                    </button>

                    <button
                      onClick={returnToMainSite}
                      style={{ background: 'transparent', border: '2px solid #666', color: '#999', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}
                    >
                      Вернуться на сайт
                    </button>
                  </div>
                </>
              )}

              {gameStatus === 'completed' && (
                <>
                  <h1 style={{ fontSize: '34px', color: '#ff0000', marginBottom: '18px', textShadow: '0 0 20px #ff0000' }}>
                    🎮 СИСТЕМА ЗАБЛОКИРОВАНА
                  </h1>
                  <p style={{ color: '#ffaaaa', fontSize: '18px', marginBottom: '22px', lineHeight: '1.6' }}>
                    Вы уже получили промокод с этого устройства.
                    <br />
                    <strong style={{ color: '#ff0000' }}>1 промокод = 1 устройство</strong>
                  </p>

                  {promoCode && (
                    <div style={{ border: '2px solid #ffff00', borderRadius: '15px', padding: '18px', marginBottom: '18px', background: 'rgba(0,0,0,0.35)' }}>
                      <p style={{ color: '#ffff99', marginBottom: '10px', fontSize: '16px' }}>Ваш промокод:</p>
                      <div style={{ fontSize: '32px', color: '#ffff00', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '2px' }}>
                        {promoCode.code}
                      </div>
                      <p style={{ color: '#ffff99', marginTop: '10px' }}>Скидка {promoCode.discount}%</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                      onClick={goToPrice}
                      style={{ background: 'transparent', border: '2px solid #00aaff', color: '#88ddff', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}
                    >
                      🏠 Выйти в меню
                    </button>

                    <button
                      onClick={returnToMainSite}
                      style={{ background: 'transparent', border: '2px solid #666', color: '#999', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}
                    >
                      Вернуться на сайт
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes fallVertical {
          0% { transform: translateX(-50%) translateY(-120px); }
          100% { transform: translateX(-50%) translateY(calc(100vh + 220px)); }
        }
      `}</style>
    </motion.div>
  );
};

export default GamePage;
