// src/pages/AdminPage.js
import React, { useEffect, useMemo, useState } from "react";

function getInitData() {
  return window.Telegram?.WebApp?.initData || "";
}

const API_BASE = process.env.REACT_APP_API_BASE || "";

async function api(path, options = {}) {
  const initData = getInitData();

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Telegram-Init-Data": initData,
        ...(options.headers || {}),
      },
    });

    const text = await res.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // если сервер вернул HTML/текст вместо JSON (частая причина "пустой админки")
      return {
        ok: false,
        error: "NON_JSON_RESPONSE",
        status: res.status,
        raw: text.slice(0, 300),
      };
    }

    if (!res.ok) {
      return { ok: false, status: res.status, ...data };
    }

    return data;
  } catch (e) {
    return { ok: false, error: "NETWORK_ERROR", message: String(e) };
  }
}

export default function AdminPage() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState("");

  const [title, setTitle] = useState("Рассылка");
  const [mediaType, setMediaType] = useState("photo");
  const [mediaValue, setMediaValue] = useState(""); // file_id или url
  const [caption, setCaption] = useState("Привет! 👾");
  const [btnText, setBtnText] = useState("Открыть");
  const [btnUrl, setBtnUrl] = useState("");
  const [segmentSource, setSegmentSource] = useState("");
  const [lastSeenDays, setLastSeenDays] = useState("");

  const [broadcastId, setBroadcastId] = useState(null);
  const [stats, setStats] = useState([]);

  // немного "телеграм-диагностики"
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user || null;
  const initDataLen = (window.Telegram?.WebApp?.initData || "").length;

  useEffect(() => {
    (async () => {
      setError("");

      const r = await api("/api/admin/me");

      if (!r?.ok) {
        const hint =
          r?.error === "NON_JSON_RESPONSE"
            ? `Сервер вернул не JSON (status ${r?.status}). Скорее всего нет backend /api/* на этом домене.`
            : r?.error === "NETWORK_ERROR"
            ? `Сеть/домен недоступен: ${r?.message || ""}`
            : "Нет доступа или неверные настройки.";

        setError(
          `Нет доступа к админке.\n${hint}\n\n` +
            `Диагностика:\n` +
            `- tgUser.id: ${tgUser?.id ?? "—"}\n` +
            `- initData length: ${initDataLen}\n` +
            `- API_BASE: ${API_BASE || "(пусто)"}\n` +
            (r?.raw ? `- raw: ${r.raw}` : "")
        );
        return;
      }

      setMe(r.admin || r.me || r.user || { ok: true });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadClients() {
    setError("");
    const params = new URLSearchParams();
    if (q) params.set("q", q);

    const r = await api("/api/admin/clients?" + params.toString());
    if (!r?.ok && r?.items == null) {
      setError("Не удалось загрузить клиентов.");
      setClients([]);
      return;
    }
    setClients(r.items || []);
  }

  useEffect(() => {
    if (me) loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  async function createBroadcast() {
    setError("");

    if (!mediaValue.trim()) {
      setError("Укажи media value: file_id или url");
      return;
    }

    const buttons = [];
    if (btnText.trim() && btnUrl.trim()) {
      buttons.push([{ text: btnText.trim(), url: btnUrl.trim() }]);
    }

    const segment = {};
    if (segmentSource.trim()) segment.source = segmentSource.trim();
    if (String(lastSeenDays).trim()) segment.lastSeenDays = Number(lastSeenDays);

    const content = {
      type: mediaType,
      value: mediaValue.trim(),
      caption: caption || "",
      buttons,
    };

    const r = await api("/api/admin/broadcasts", {
      method: "POST",
      body: JSON.stringify({ title, segment, content }),
    });

    if (!r?.id) {
      setError("Не удалось создать рассылку");
      return;
    }
    setBroadcastId(r.id);
  }

  async function startBroadcast() {
    setError("");
    if (!broadcastId) return;

    const r = await api(`/api/admin/broadcasts/${broadcastId}/start`, {
      method: "POST",
    });
    if (!r?.ok) setError("Не удалось запустить рассылку");
    await refreshStats();
  }

  async function refreshStats() {
    if (!broadcastId) return;
    const r = await api(`/api/admin/broadcasts/${broadcastId}/stats`);
    setStats(r.counts || []);
  }

  const statsText = useMemo(() => {
    if (!stats.length) return "";
    return stats.map((s) => `${s.status}: ${s.c}`).join(" | ");
  }, [stats]);

  if (error) {
    return (
      <div style={{ padding: 16, fontFamily: "system-ui", color: "#fff" }}>
        <h2 style={{ marginTop: 0 }}>Админка</h2>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "rgba(255,0,0,0.12)",
            border: "1px solid rgba(255,0,0,0.35)",
            borderRadius: 12,
            padding: 12,
          }}
        >
          {error}
        </pre>
      </div>
    );
  }

  if (!me) {
    return (
      <div style={{ padding: 16, fontFamily: "system-ui", color: "#fff" }}>
        Загрузка...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 16,
        fontFamily: "system-ui",
        display: "grid",
        gap: 16,
        color: "#fff",
      }}
    >
      <h2 style={{ margin: 0 }}>Админка</h2>

      <div style={{ fontSize: 13, opacity: 0.85 }}>
        tgUser.id: <b>{tgUser?.id ?? "—"}</b> | initData:{" "}
        <b>{initDataLen}</b> chars | API_BASE:{" "}
        <b>{API_BASE || "(пусто)"}</b>
      </div>

      <div
        style={{
          padding: 12,
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 12,
          background: "rgba(0,0,0,0.35)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Клиенты</h3>

        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск username/имя"
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              outline: "none",
            }}
          />
          <button
            onClick={loadClients}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,0,0,0.35)",
              background: "rgba(255,0,0,0.15)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Обновить
          </button>
        </div>

        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>
          Всего в списке: {clients.length}
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {clients.map((c) => (
            <div
              key={c.tg_id}
              style={{
                padding: 10,
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div>
                <b>{c.first_name || "Без имени"}</b> @{c.username || "no_username"}
              </div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                id: {c.tg_id} | source: {c.source || "-"} | status: {c.status} |{" "}
                last_seen:{" "}
                {c.last_seen ? new Date(c.last_seen).toLocaleString() : "—"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: 12,
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 12,
          background: "rgba(0,0,0,0.35)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Рассылка с медиа</h3>

        <div style={{ display: "grid", gap: 8 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название"
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              outline: "none",
            }}
          />

          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              outline: "none",
            }}
          >
            <option value="photo">photo</option>
            <option value="video">video</option>
            <option value="document">document</option>
            <option value="animation">animation</option>
          </select>

          <input
            value={mediaValue}
            onChange={(e) => setMediaValue(e.target.value)}
            placeholder="media value: file_id или URL"
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              outline: "none",
            }}
          />

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="caption"
            rows={4}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              outline: "none",
              resize: "vertical",
            }}
          />

          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
            <input
              value={btnText}
              onChange={(e) => setBtnText(e.target.value)}
              placeholder="Текст кнопки"
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                outline: "none",
              }}
            />
            <input
              value={btnUrl}
              onChange={(e) => setBtnUrl(e.target.value)}
              placeholder="URL кнопки"
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
            <input
              value={segmentSource}
              onChange={(e) => setSegmentSource(e.target.value)}
              placeholder="Фильтр source (опц.)"
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                outline: "none",
              }}
            />
            <input
              value={lastSeenDays}
              onChange={(e) => setLastSeenDays(e.target.value)}
              placeholder="Был за N дней (опц.)"
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={createBroadcast}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,0,255,0.35)",
                background: "rgba(255,0,255,0.18)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              1) Создать
            </button>

            <button
              onClick={startBroadcast}
              disabled={!broadcastId}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,0,0,0.35)",
                background: broadcastId ? "rgba(255,0,0,0.18)" : "rgba(255,255,255,0.06)",
                color: "#fff",
                cursor: broadcastId ? "pointer" : "not-allowed",
                fontWeight: 800,
                opacity: broadcastId ? 1 : 0.6,
              }}
            >
              2) Запустить
            </button>

            <button
              onClick={refreshStats}
              disabled={!broadcastId}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                cursor: broadcastId ? "pointer" : "not-allowed",
                fontWeight: 800,
                opacity: broadcastId ? 1 : 0.6,
              }}
            >
              Статус
            </button>
          </div>

          <div style={{ fontSize: 13, opacity: 0.9 }}>
            broadcastId: <b>{broadcastId || "-"}</b>{" "}
            {statsText ? `| ${statsText}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
