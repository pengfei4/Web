/**
 * API 路由 - 祝福寄语 + 管理后台CRUD
 */
const express = require('express');
const router = express.Router();
const { queryAll, queryOne, runSQL, saveDB } = require('../db');
const { adminOnly } = require('../middleware/auth');

// ========== 祝福寄语 ==========
router.get('/api/blessings', (req, res) => {
  const blessings = queryAll('SELECT * FROM blessings ORDER BY id DESC LIMIT 50');
  res.json(blessings);
});

router.post('/api/blessings', (req, res) => {
  const { text, author } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: '祝福内容不能为空' });
  }
  runSQL('INSERT INTO blessings (text, author) VALUES (?, ?)', [text.trim(), author || '匿名']);
  const count = queryAll('SELECT COUNT(*) as cnt FROM blessings')[0].cnt;
  res.json({ success: true, count });
});

router.get('/api/quick-blessings', (req, res) => {
  const blessings = queryAll('SELECT * FROM quick_blessings');
  res.json(blessings);
});

router.get('/api/blessings/stats', (req, res) => {
  const blessingCount = queryAll('SELECT COUNT(*) as cnt FROM blessings')[0].cnt;
  res.json({ blessingCount });
});

// ========== 管理后台 CRUD（仅管理员） ==========

// 安全表名白名单
const ALLOWED_TABLES = [
  'users','site_config','eras','poems','poem_lines',
  'custom_categories','customs','custom_details',
  'legend_systems','legends','legend_details',
  'food_timeline','regional_foods','craft_steps','food_customs',
  'celebrities','mooncake_types','gallery_items',
  'world_midautumn','heritage_milestones','food_tags',
  'homepage_poems','homepage_legends','homepage_customs',
  'homepage_mooncakes','homepage_gallery','homepage_timeline',
  'blessings','quick_blessings'
];

function safeTable(name) {
  if (ALLOWED_TABLES.includes(name)) return name;
  return null;
}

// 获取表结构
router.get('/api/admin/table/:table', adminOnly, (req, res) => {
  const table = safeTable(req.params.table);
  if (!table) return res.status(400).json({ error: '无效的表名' });
  const columns = queryAll("PRAGMA table_info(\"" + table + "\")");
  const rows = queryAll("SELECT * FROM \"" + table + "\" LIMIT 500");
  res.json({ columns: columns.map(c => c.name), rows });
});

// 创建记录
router.post('/api/admin/table/:table', adminOnly, (req, res) => {
  const table = safeTable(req.params.table);
  if (!table) return res.status(400).json({ error: '无效的表名' });
  const { columns, values } = req.body;
  if (!columns || !values || columns.length === 0) {
    return res.status(400).json({ error: '缺少数据' });
  }
  const placeholders = columns.map(() => '?').join(',');
  const colNames = columns.map(c => '"' + c + '"').join(',');
  try {
    runSQL("INSERT INTO \"" + table + "\" (" + colNames + ") VALUES (" + placeholders + ")", values);
    const idRow = queryOne("SELECT last_insert_rowid() AS id");
    res.json({ success: true, id: idRow ? idRow.id : null });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 更新记录
router.put('/api/admin/table/:table/:id', adminOnly, (req, res) => {
  const table = safeTable(req.params.table);
  if (!table) return res.status(400).json({ error: '无效的表名' });
  const { columns, values } = req.body;
  if (!columns || !values || columns.length === 0) {
    return res.status(400).json({ error: '缺少数据' });
  }
  const setClause = columns.map(c => '"' + c + '" = ?').join(',');
  try {
    runSQL("UPDATE \"" + table + "\" SET " + setClause + " WHERE id = ?", [...values, req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 删除记录
router.delete('/api/admin/table/:table/:id', adminOnly, (req, res) => {
  const table = safeTable(req.params.table);
  if (!table) return res.status(400).json({ error: '无效的表名' });
  try {
    runSQL("DELETE FROM \"" + table + "\" WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
