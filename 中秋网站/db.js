/**
 * 数据库连接与初始化
 * 使用 sql.js (SQLite compiled to WebAssembly)
 */
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'data.db');

let SQL = null;
let db = null;

// 加载或创建数据库
async function initDB() {
  SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
    createTables();
    saveDB();
  }
  return db;
}

function getDB() {
  if (!db) throw new Error('数据库未初始化，请先调用 initDB()');
  return db;
}

function saveDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function createTables() {
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TEXT DEFAULT (datetime('now','localtime'))
  )`);

  db.run(`CREATE TABLE site_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE eras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    era_key TEXT UNIQUE NOT NULL,
    sort_order INTEGER NOT NULL,
    icon TEXT NOT NULL,
    badge TEXT NOT NULL,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    desc_html TEXT NOT NULL,
    quotes_json TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE poems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anchor TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    short_title TEXT NOT NULL,
    author TEXT NOT NULL,
    dynasty_tag TEXT NOT NULL,
    dynasty_full TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    author_bio TEXT NOT NULL,
    theme_analysis TEXT NOT NULL,
    historical_bg TEXT NOT NULL,
    insight_quote TEXT NOT NULL,
    quote_source TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE poem_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    poem_id INTEGER NOT NULL,
    sort_order INTEGER NOT NULL,
    verse_line TEXT NOT NULL,
    explanation TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE custom_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    anchor TEXT UNIQUE NOT NULL,
    subtitle TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE customs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    anchor TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL,
    name TEXT NOT NULL,
    badge TEXT NOT NULL,
    card_desc TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE custom_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    custom_id INTEGER NOT NULL,
    tab_key TEXT NOT NULL,
    tab_label TEXT NOT NULL,
    content TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE legend_systems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    anchor TEXT UNIQUE NOT NULL,
    sys_key TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE legends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    system_id INTEGER NOT NULL,
    anchor TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    brief TEXT NOT NULL,
    moral_theme TEXT NOT NULL,
    key_characters TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE legend_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    legend_id INTEGER NOT NULL,
    tab_key TEXT NOT NULL,
    tab_label TEXT NOT NULL,
    content TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE food_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sort_order INTEGER NOT NULL,
    icon TEXT NOT NULL,
    era TEXT NOT NULL,
    event TEXT NOT NULL,
    description TEXT NOT NULL,
    quote TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE regional_foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT NOT NULL,
    region TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    is_featured INTEGER DEFAULT 0,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE craft_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    step_number INTEGER NOT NULL,
    icon TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE food_customs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE celebrities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anchor TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL,
    name TEXT NOT NULL,
    era_tag TEXT NOT NULL,
    story_title TEXT NOT NULL,
    story TEXT NOT NULL,
    bio TEXT NOT NULL,
    food_name TEXT NOT NULL,
    food_desc TEXT NOT NULL,
    historical_bg TEXT NOT NULL,
    cultural_meaning TEXT NOT NULL,
    related_stories TEXT NOT NULL,
    quote_text TEXT NOT NULL,
    quote_source TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE mooncake_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    tags_json TEXT NOT NULL,
    stats_json TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE gallery_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE world_midautumn (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flag TEXT NOT NULL,
    country TEXT NOT NULL,
    local_name TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE heritage_milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_label TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE food_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT NOT NULL,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE homepage_poems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE homepage_legends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE homepage_customs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE homepage_mooncakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE homepage_gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT NOT NULL,
    label TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE homepage_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT NOT NULL,
    year_label TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE blessings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    author TEXT DEFAULT '匿名',
    created_at TEXT DEFAULT (datetime('now','localtime'))
  )`);

  db.run(`CREATE TABLE quick_blessings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL
  )`);
}

// 查询辅助函数
function queryAll(sql, params = []) {
  if (params.length === 0) {
    const results = db.exec(sql);
    if (!results || results.length === 0) return [];
    const rows = [];
    const cols = results[0].columns;
    for (const row of results[0].values) {
      const obj = {};
      cols.forEach((c, i) => { obj[c] = row[i]; });
      rows.push(obj);
    }
    return rows;
  }
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function runSQL(sql, params = []) {
  db.run(sql, params);
  saveDB();
}

function insertAndGetId(sql, params = []) {
  db.run(sql, params);
  saveDB();
  const result = db.exec('SELECT last_insert_rowid() as id');
  if (result && result.length > 0 && result[0].values.length > 0) {
    return result[0].values[0][0];
  }
  return null;
}

module.exports = { initDB, getDB, saveDB, queryAll, queryOne, runSQL, insertAndGetId };
