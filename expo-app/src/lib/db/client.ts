import * as SQLite from 'expo-sqlite'

export const db = SQLite.openDatabaseSync('mta.db')

export function initDatabase(): void {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS qualifications (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT    UNIQUE NOT NULL,
      name        TEXT    NOT NULL,
      category    TEXT    NOT NULL,
      qual_type   TEXT    NOT NULL DEFAULT 'qualification',
      pathway     TEXT,
      summary     TEXT,
      official_url TEXT,
      is_favourite INTEGER NOT NULL DEFAULT 0,
      last_viewed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sections (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      qualification_id  INTEGER NOT NULL REFERENCES qualifications(id),
      title             TEXT    NOT NULL,
      sort_order        INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS checklist_items (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id      INTEGER NOT NULL REFERENCES sections(id),
      prompt          TEXT    NOT NULL,
      detail          TEXT,
      sort_order      INTEGER NOT NULL DEFAULT 0,
      is_coaching_item INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_ratings (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id          INTEGER UNIQUE NOT NULL REFERENCES checklist_items(id),
      rating_value     INTEGER CHECK(rating_value BETWEEN 1 AND 5),
      confidence_value INTEGER CHECK(confidence_value BETWEEN 1 AND 5),
      notes            TEXT    NOT NULL DEFAULT '',
      tags             TEXT    NOT NULL DEFAULT '[]',
      needs_coaching   INTEGER NOT NULL DEFAULT 0,
      updated_at       TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS progress_snapshots (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      qualification_id INTEGER NOT NULL REFERENCES qualifications(id),
      score            REAL    NOT NULL,
      completion       REAL    NOT NULL,
      label            TEXT,
      created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)
}
