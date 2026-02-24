// src/pages/GamePage.js
import React, { useMemo, useState } from "react";

function getInitData() {
  return window.Telegram?.WebApp?.initData || "";
}

const API_BASE = process.env.REACT_APP_API_BASE || "";

const discounts = [5, 10, 15, 20, 25];

function pickDiscount() {
  return discounts[Math.floor(Math.random() * discounts.length)];
}

export default function GamePage() {
  const [spinning, setSpinning] = useState(false);
  const [discount, setDiscount] = useState(null);
  const [deg, setDeg] = useState(0);

  const [name, setName] = useState("");
  const [tg, setTg] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  const title = useMemo(
    () => (discount ? `Скидка ${discount}%` : "Крути и забирай скидку"),
    [discount]
  );

  async function spin() {
    if (spinning) return;
    setSpinning(true);

    const d = pickDiscount();
    setDiscount(d);

    const idx = discounts.indexOf(d);
    const step = 360 / discounts.length;
    const target = 360 * 5 + idx * step;
    setDeg((prev) => prev + target);

    setTimeout(() => setSpinning(false), 2500);
  }

  function validateForm() {
    const tgOk = tg.trim().length >= 3;
    const phoneOk = phone.trim().length >= 6;
    return tgOk || phoneOk;
  }

  async function submit() {
    if (!discount) return;

    if (!validateForm()) {
      alert("Укажи ник в TG или телефон, иначе мы тебя не найдём 🙂");
      return;
    }

    const payload = {
      discount,
      name: name.trim(),
      tg: tg.trim(),
      phone: phone.trim(),
      initData: getInitData(),
    };

    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/api/visa-spin/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Не улетело. Проверь сервер/токен.");
        return;
      }

      alert("Заявка улетела. Жди ответ 💜");

      setName("");
      setTg("");
      setPhone("");
    } catch (e) {
      alert("Ошибка сети/сервера. Проверь API_BASE и backend.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <h1 style={styles.title}>VISA SPIN</h1>

        <div style={styles.text}>
          Крути колесо и забирай скидку на тех-часть. Твой спин — мой подгон.
          <div style={{ opacity: 0.8, marginTop: 8 }}>
            Скидка выпадает от 5% до 25%
          </div>
        </div>

        <div style={styles.stage}>
          <div
            style={{
              ...styles.wheel,
              transform: `rotate(-${deg}deg)`,
              transition: spinning
                ? "transform 2.5s cubic-bezier(.12,.78,.12,1)"
                : "none",
            }}
          >
            {discounts.map((d, i) => (
              <div
                key={d}
                style={{
                  ...styles.slice,
                  transform: `rotate(${
                    i * (360 / discounts.length)
                  }deg) skewY(-30deg)`,
                }}
              >
                {d}%
              </div>
            ))}
          </div>

          <div style={styles.pointer} />
        </div>

        <button style={styles.btn} onClick={spin} disabled={spinning}>
          {spinning ? "Крутим..." : "ГАЗ"}
        </button>

        <div style={styles.result}>
          <div style={{ fontSize: 18, marginTop: 16 }}>{title}</div>

          {discount && (
            <div style={{ opacity: 0.85, marginTop: 6 }}>
              Красава, ты выиграл скидку {discount}% на тех-часть
            </div>
          )}
        </div>

        {discount && (
          <div style={styles.form}>
            <div style={styles.formTitle}>Забрать скидку</div>

            <input
              style={styles.input}
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Ник в TG (например, @username)"
              value={tg}
              onChange={(e) => setTg(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Телефон"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button style={styles.btn2} onClick={submit} disabled={sending}>
              {sending ? "Отправляем..." : "Отправить"}
            </button>

            <div style={styles.hint}>
              Достаточно ника в TG или телефона.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100dvh - 70px)",
    background: "linear-gradient(135deg, #000000 0%, #1a001a 50%, #000000 100%)",
    padding: "24px 16px",
    color: "white",
  },
  wrapper: { maxWidth: 900, margin: "0 auto", textAlign: "center" },
  title: {
    fontSize: "clamp(28px, 5vw, 48px)",
    color: "#c0c0c0",
    textShadow: "0 0 15px #7b2cff",
    margin: "10px 0 10px",
    letterSpacing: 1,
  },
  text: { opacity: 0.9, marginBottom: 18 },
  stage: {
    position: "relative",
    width: 320,
    height: 320,
    margin: "18px auto 10px",
  },
  wheel: {
    width: 320,
    height: 320,
    borderRadius: "50%",
    border: "8px solid #7b2cff",
    boxShadow: "0 0 25px rgba(123,44,255,0.35)",
    position: "relative",
    overflow: "hidden",
    background: "#12001f",
  },
  slice: {
    position: "absolute",
    width: "50%",
    height: "50%",
    top: "50%",
    left: "50%",
    transformOrigin: "0 0",
    background: "#2b0045",
    border: "1px solid rgba(123,44,255,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    userSelect: "none",
  },
  pointer: {
    position: "absolute",
    top: -2,
    left: "50%",
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    borderLeft: "12px solid transparent",
    borderRight: "12px solid transparent",
    borderBottom: "22px solid #c0c0c0",
    filter: "drop-shadow(0 0 8px rgba(192,192,192,0.5))",
  },
  btn: {
    background: "#7b2cff",
    color: "white",
    border: "none",
    padding: "14px 42px",
    fontSize: 18,
    borderRadius: 14,
    cursor: "pointer",
    marginTop: 10,
  },
  btn2: {
    background: "#7b2cff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    fontSize: 16,
    borderRadius: 12,
    cursor: "pointer",
    marginTop: 10,
    width: 260,
  },
  result: { minHeight: 60 },
  form: {
    marginTop: 16,
    padding: 14,
    border: "1px solid rgba(123,44,255,0.5)",
    borderRadius: 14,
  },
  formTitle: { fontSize: 18, marginBottom: 10 },
  input: {
    width: 260,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #3b0061",
    background: "#0b0014",
    color: "white",
    margin: "6px auto",
    display: "block",
    outline: "none",
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.75,
  },
};