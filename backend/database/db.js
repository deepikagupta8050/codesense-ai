const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

// ─────────────────────────────────────────
// DATABASE DIRECTORY
// ─────────────────────────────────────────

const dbDir = __dirname

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, {
    recursive: true
  })
}

// ─────────────────────────────────────────
// DATABASE
// ─────────────────────────────────────────

const db = new Database(
  path.join(dbDir, 'codesense.db')
)

// ─────────────────────────────────────────
// PERFORMANCE
// ─────────────────────────────────────────

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ─────────────────────────────────────────
// USERS TABLE
// ─────────────────────────────────────────

db.exec(`

CREATE TABLE IF NOT EXISTS users (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  name TEXT NOT NULL,

  email TEXT NOT NULL UNIQUE,

  password TEXT NOT NULL,

  avatar TEXT,

  github_token TEXT,

  github_username TEXT,

  github_avatar TEXT,

  github_connected INTEGER DEFAULT 0,

  created_at TEXT DEFAULT (datetime('now'))
);

`)

// ─────────────────────────────────────────
// REVIEWS TABLE
// ─────────────────────────────────────────

db.exec(`

CREATE TABLE IF NOT EXISTS reviews (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  user_id INTEGER NOT NULL,

  filename TEXT DEFAULT 'untitled',

  language TEXT DEFAULT 'Unknown',

  code TEXT NOT NULL,

  review TEXT NOT NULL,

  score INTEGER DEFAULT 0,

  severity TEXT DEFAULT 'Info',

  bugs_count INTEGER DEFAULT 0,

  security_count INTEGER DEFAULT 0,

  fixed_code TEXT,

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
);

`)

// ─────────────────────────────────────────
// CHAT MESSAGES
// ─────────────────────────────────────────

db.exec(`

CREATE TABLE IF NOT EXISTS chat_messages (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  user_id INTEGER NOT NULL,

  role TEXT NOT NULL,

  content TEXT NOT NULL,

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
);

`)

// ─────────────────────────────────────────
// SECURITY SCANS
// ─────────────────────────────────────────

db.exec(`

CREATE TABLE IF NOT EXISTS security_scans (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  user_id INTEGER NOT NULL,

  filename TEXT DEFAULT 'untitled',

  code TEXT NOT NULL,

  result TEXT NOT NULL,

  critical INTEGER DEFAULT 0,

  high INTEGER DEFAULT 0,

  medium INTEGER DEFAULT 0,

  low INTEGER DEFAULT 0,

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
);

`)

// ─────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────

db.exec(`

CREATE TABLE IF NOT EXISTS settings (

  user_id INTEGER PRIMARY KEY,

  theme TEXT DEFAULT 'dark',

  ai_model TEXT DEFAULT 'llama-3.3-70b-versatile',

  language_pref TEXT DEFAULT 'auto',

  auto_review INTEGER DEFAULT 1,

  ai_suggestions INTEGER DEFAULT 1,

  code_explanations INTEGER DEFAULT 1,

  email_notifications INTEGER DEFAULT 1,

  pr_review_alerts INTEGER DEFAULT 1,

  security_alerts INTEGER DEFAULT 1,

  weekly_summary INTEGER DEFAULT 0,

  notifications INTEGER DEFAULT 1,

  preferred_languages TEXT DEFAULT 'JavaScript,Python,TypeScript',

  github_connected INTEGER DEFAULT 0,

  github_token TEXT,

  github_username TEXT,

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
);

`)

// ─────────────────────────────────────────
// REPORTS TABLE
// ─────────────────────────────────────────

db.exec(`

CREATE TABLE IF NOT EXISTS reports (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  user_id INTEGER,

  title TEXT,

  type TEXT DEFAULT 'review',

  content TEXT,

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
);

`)

// ─────────────────────────────────────────
// GITHUB REPOSITORIES
// ─────────────────────────────────────────

db.exec(`

CREATE TABLE IF NOT EXISTS github_repositories (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  user_id INTEGER,

  repo_name TEXT,

  repo_url TEXT,

  private INTEGER DEFAULT 0,

  synced INTEGER DEFAULT 1,

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
);

`)

// ─────────────────────────────────────────
// PULL REQUEST REVIEWS
// ─────────────────────────────────────────

db.exec(`

CREATE TABLE IF NOT EXISTS pr_reviews (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  user_id INTEGER,

  repo_name TEXT,

  pr_number INTEGER,

  pr_title TEXT,

  review TEXT,

  ai_score INTEGER DEFAULT 0,

  security_issues INTEGER DEFAULT 0,

  bugs_found INTEGER DEFAULT 0,

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
);

`)

// ─────────────────────────────────────────
// ANALYTICS CACHE
// ─────────────────────────────────────────

db.exec(`

CREATE TABLE IF NOT EXISTS analytics (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  user_id INTEGER,

  total_reviews INTEGER DEFAULT 0,

  total_security_scans INTEGER DEFAULT 0,

  total_pr_reviews INTEGER DEFAULT 0,

  avg_ai_score INTEGER DEFAULT 0,

  updated_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
);

`)

// ─────────────────────────────────────────
// READY
// ─────────────────────────────────────────

console.log(
  '✅ SQLite database ready → database/codesense.db'
)

module.exports = db