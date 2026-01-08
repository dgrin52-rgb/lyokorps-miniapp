const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

function initDb() {
  const dbPath = path.join(__dirname, '..', 'storage', 'db.sqlite');
  const schemaPath = path.join(__dirname, 'schema.sql');

  fs.mkdirSync(path.join(__dirname, '..', 'storage'), { recursive: true });

  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);

  return db;
}

module.exports = { initDb };
