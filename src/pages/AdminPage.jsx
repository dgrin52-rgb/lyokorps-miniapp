import React, { useEffect, useMemo, useState } from "react";

function getInitData() {
  return window.Telegram?.WebApp?.initData || "";
}

async function api(path, options = {}) {
  const initData = getInitData();
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
      ...(options.headers || {}),
    },
  });
  return res.json();
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

  useEffect(() => {
    (async () => {
      const r = await api("/api/admin/me");
      if (!r?.ok) {
        setError("Нет доступа. Проверь ADMIN_ID и что открываешь админку из Telegram.");
        return;
      }
      setMe(r.admin);
    })();
  }, []);

  async function loadClients() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const r = await api("/api/admin/clients?" + params.toString());
    setClients(r.items || []);
  }

  useEffect(() => {
    if (me) loadClients();
    // eslint-disable-next-line
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
    if (lastSeenDays) segment.lastSeenDays = Number(lastSeenDays);

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
    const r = await api(`/api/admin/broadcasts/${broadcastId}/start`, { method: "POST" });
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
    return stats.map(s => `${s.status}: ${s.c}`).join(" | ");
  }, [stats]);

  if (error) {
    return <div style={{ padding: 16, fontFamily: "system-ui" }}>{error}</div>;
  }

  if (!me) {
    return <div style={{ padding: 16, fontFamily: "system-ui" }}>Загрузка...</div>;
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui", display: "grid", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Админка</h2>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
        <h3 style={{ marginTop: 0 }}>Клиенты</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск username/имя" style={{ flex: 1, padding: 8 }} />
          <button onClick={loadClients} style={{ padding: "8px 12px" }}>Обновить</button>
        </div>

        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>Всего в списке: {clients.length}</div>

        <div style={{ display: "grid", gap: 8 }}>
          {clients.map(c => (
            <div key={c.tg_id} style={{ padding: 10, border: "1px solid #eee", borderRadius: 12 }}>
              <div><b>{c.first_name || "Без имени"}</b> @{c.username || "no_username"}</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>
                id: {c.tg_id} | source: {c.source || "-"} | status: {c.status} | last_seen: {new Date(c.last_seen).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
        <h3 style={{ marginTop: 0 }}>Рассылка с медиа</h3>

        <div style={{ display: "grid", gap: 8 }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название" style={{ padding: 8 }} />

          <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} style={{ padding: 8 }}>
            <option value="photo">photo</option>
            <option value="video">video</option>
            <option value="document">document</option>
            <option value="animation">animation</option>
          </select>

          <input value={mediaValue} onChange={(e) => setMediaValue(e.target.value)} placeholder="media value: file_id или URL" style={{ padding: 8 }} />
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="caption" rows={4} style={{ padding: 8 }} />

          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
            <input value={btnText} onChange={(e) => setBtnText(e.target.value)} placeholder="Текст кнопки" style={{ padding: 8 }} />
            <input value={btnUrl} onChange={(e) => setBtnUrl(e.target.value)} placeholder="URL кнопки" style={{ padding: 8 }} />
          </div>

          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
            <input value={segmentSource} onChange={(e) => setSegmentSource(e.target.value)} placeholder="Фильтр source (опц.)" style={{ padding: 8 }} />
            <input value={lastSeenDays} onChange={(e) => setLastSeenDays(e.target.value)} placeholder="Был за N дней (опц.)" style={{ padding: 8 }} />
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={createBroadcast} style={{ padding: "8px 12px" }}>1) Создать</button>
            <button onClick={startBroadcast} disabled={!broadcastId} style={{ padding: "8px 12px" }}>
              2) Запустить
            </button>
            <button onClick={refreshStats} disabled={!broadcastId} style={{ padding: "8px 12px" }}>
              Статус
            </button>
          </div>

          <div style={{ fontSize: 13, opacity: 0.85 }}>
            broadcastId: {broadcastId || "-"} {statsText ? `| ${statsText}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
