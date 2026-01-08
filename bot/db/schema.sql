PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS clients (
  tg_id INTEGER PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  source TEXT,
  last_seen INTEGER,
  status TEXT DEFAULT 'active',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS client_tags (
  tg_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (tg_id, tag_id),
  FOREIGN KEY (tg_id) REFERENCES clients(tg_id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS broadcasts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  segment_json TEXT NOT NULL,
  content_json TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at INTEGER NOT NULL,
  started_at INTEGER,
  finished_at INTEGER
);

CREATE TABLE IF NOT EXISTS broadcast_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  broadcast_id INTEGER NOT NULL,
  tg_id INTEGER NOT NULL,
  status TEXT DEFAULT 'queued',
  error TEXT,
  sent_at INTEGER,
  FOREIGN KEY (broadcast_id) REFERENCES broadcasts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_clients_last_seen ON clients(last_seen);
CREATE INDEX IF NOT EXISTS idx_clients_source ON clients(source);
CREATE INDEX IF NOT EXISTS idx_jobs_bid ON broadcast_jobs(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON broadcast_jobs(status);
