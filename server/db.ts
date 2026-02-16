import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB file
const dbPath = path.join(__dirname, '../game.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[SQLite] Error:', err);
  } else {
    console.log('[SQLite] Database connected at:', dbPath);
  }
});

// Initialize Schema
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    mmr INTEGER DEFAULT 1000,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    avatar_id INTEGER DEFAULT 1,
    coins INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_id TEXT NOT NULL,
    type TEXT NOT NULL,
    is_equipped BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, item_id)
  );
`;

db.exec(SCHEMA, (err) => {
  if (err) {
    console.error('[SQLite] Schema Error:', err);
  } else {
    // Migration: Check if coins column exists
    db.all("PRAGMA table_info(users)", (err, rows: any[]) => {
      if (err) return;
      
      const hasCoins = rows.some(r => r.name === 'coins');
      if (!hasCoins) {
        console.log('[SQLite] Migrating: Adding coins column...');
        db.run("ALTER TABLE users ADD COLUMN coins INTEGER DEFAULT 0", (err) => {
            if (err) console.error('[SQLite] Migration Failed:', err);
            else console.log('[SQLite] Migration Success: coins added.');
        });
      }

      const hasAvatar = rows.some(r => r.name === 'avatar_id');
      if (!hasAvatar) {
        console.log('[SQLite] Migrating: Adding avatar_id column...');
        db.run("ALTER TABLE users ADD COLUMN avatar_id INTEGER DEFAULT 1", (err) => {
            if (err) console.error('[SQLite] Migration Failed:', err);
            else console.log('[SQLite] Migration Success: avatar_id added.');
        });
      }

      const hasEquippedTable = rows.some(r => r.name === 'equipped_table');
      if (!hasEquippedTable) {
        console.log('[SQLite] Migrating: Adding equipped_table column...');
        db.run("ALTER TABLE users ADD COLUMN equipped_table TEXT DEFAULT 'default'", (err) => {
            if (err) console.error('[SQLite] Migration Failed:', err);
            else console.log('[SQLite] Migration Success: equipped_table added.');
        });
      }

      const hasEquippedCard = rows.some(r => r.name === 'equipped_card');
      if (!hasEquippedCard) {
        console.log('[SQLite] Migrating: Adding equipped_card column...');
        db.run("ALTER TABLE users ADD COLUMN equipped_card TEXT DEFAULT 'classic'", (err) => {
            if (err) console.error('[SQLite] Migration Failed:', err);
            else console.log('[SQLite] Migration Success: equipped_card added.');
        });
      }
    });
  }
});

// Async wrappers using promisify
export const get = promisify(db.get.bind(db)) as any;
export const run = promisify(db.run.bind(db)) as any;
export const all = promisify(db.all.bind(db)) as any;

export { db };
