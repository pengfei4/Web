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

// ========== 用户管理 API（仅管理员） ==========

// 获取所有用户
router.get('/api/admin/users', adminOnly, (req, res) => {
  try {
    const users = queryAll('SELECT id, username, role, created_at FROM users ORDER BY id');
    res.json({ success: true, users });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 创建用户
router.post('/api/admin/users', adminOnly, (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !username.trim()) {
    return res.status(400).json({ error: '用户名不能为空' });
  }
  if (username.trim().length < 2 || username.trim().length > 20) {
    return res.status(400).json({ error: '用户名长度需在 2-20 个字符之间' });
  }
  if (!password || password.length < 4) {
    return res.status(400).json({ error: '密码长度至少 4 位' });
  }
  const existing = queryOne('SELECT id FROM users WHERE username = ?', [username.trim()]);
  if (existing) {
    return res.status(400).json({ error: '用户名已存在' });
  }
  try {
    runSQL('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username.trim(), password, role || 'user']);
    const idRow = queryOne('SELECT last_insert_rowid() AS id');
    res.json({ success: true, id: idRow ? idRow.id : null });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 更新用户信息（用户名、角色）
router.put('/api/admin/users/:id', adminOnly, (req, res) => {
  const { username, role } = req.body;
  const userId = parseInt(req.params.id);
  if (!userId || userId < 1) {
    return res.status(400).json({ error: '无效的用户ID' });
  }
  if (!username || !username.trim()) {
    return res.status(400).json({ error: '用户名不能为空' });
  }
  if (username.trim().length < 2 || username.trim().length > 20) {
    return res.status(400).json({ error: '用户名长度需在 2-20 个字符之间' });
  }
  const existing = queryOne('SELECT id FROM users WHERE username = ? AND id != ?', [username.trim(), userId]);
  if (existing) {
    return res.status(400).json({ error: '用户名已被其他用户使用' });
  }
  // 检查目标用户是否为唯一管理员
  const targetUser = queryOne('SELECT role FROM users WHERE id = ?', [userId]);
  if (targetUser && targetUser.role === 'admin') {
    const adminCount = queryOne('SELECT COUNT(*) as cnt FROM users WHERE role = ?', ['admin']);
    if (adminCount && adminCount.cnt <= 1) {
      return res.status(400).json({ error: '唯一的管理员账号不能修改' });
    }
  }
  try {
    runSQL('UPDATE users SET username = ?, role = ? WHERE id = ?',
      [username.trim(), role || 'user', userId]);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 修改用户密码
router.put('/api/admin/users/:id/password', adminOnly, (req, res) => {
  const { password } = req.body;
  const userId = parseInt(req.params.id);
  if (!userId || userId < 1) {
    return res.status(400).json({ error: '无效的用户ID' });
  }
  if (!password || password.length < 4) {
    return res.status(400).json({ error: '密码长度至少 4 位' });
  }
  // 检查目标用户是否为唯一管理员
  const targetUser = queryOne('SELECT role FROM users WHERE id = ?', [userId]);
  if (targetUser && targetUser.role === 'admin') {
    const adminCount = queryOne('SELECT COUNT(*) as cnt FROM users WHERE role = ?', ['admin']);
    if (adminCount && adminCount.cnt <= 1) {
      return res.status(400).json({ error: '唯一的管理员账号不能修改' });
    }
  }
  try {
    runSQL('UPDATE users SET password = ? WHERE id = ?', [password, userId]);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 删除用户
router.delete('/api/admin/users/:id', adminOnly, (req, res) => {
  const userId = parseInt(req.params.id);
  if (!userId || userId < 1) {
    return res.status(400).json({ error: '无效的用户ID' });
  }
  if (req.session.user && req.session.user.id === userId) {
    return res.status(400).json({ error: '不能删除自己的账号' });
  }
  try {
    const user = queryOne('SELECT id, role FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    // 如果要删除的是管理员，检查是否为最后一个管理员
    if (user.role === 'admin') {
      const adminCount = queryOne('SELECT COUNT(*) as cnt FROM users WHERE role = ?', ['admin']);
      if (adminCount && adminCount.cnt <= 1) {
        return res.status(400).json({ error: '至少需要保留一个管理员账号，无法删除' });
      }
    }
    runSQL('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
