/**
 * 页面路由 - 所有页面渲染
 */
const express = require('express');
const router = express.Router();
const { queryAll, queryOne } = require('../db');
const { requireAuth, adminOnly } = require('../middleware/auth');

// 公共导航数据
function getNav() {
  return [
    { href: '/', label: '首页' },
    { href: '/origin', label: '节日起源' },
    { href: '/customs', label: '民间习俗' },
    { href: '/legends', label: '神话传说' },
    { href: '/food', label: '美食文化' },
    { href: '/poetry', label: '诗词鉴赏' },
    { href: '/gallery', label: '中秋图集' },
    { href: '/blessing', label: '祝福寄语' },
    { href: '/admin', label: '⚙ 管理' }
  ];
}

function getSiteConfig() {
  const configs = queryAll('SELECT key, value FROM site_config');
  const config = {};
  configs.forEach(c => { config[c.key] = c.value; });
  return config;
}

// ========== 首页（公开） ==========
router.get('/', (req, res) => {
  const config = getSiteConfig();
  const nav = getNav();
  const user = req.session.user || null;
  const hpTimeline = queryAll('SELECT * FROM homepage_timeline ORDER BY sort_order');
  const hpLegends = queryAll('SELECT * FROM homepage_legends ORDER BY sort_order');
  const hpCustoms = queryAll('SELECT * FROM homepage_customs ORDER BY sort_order');
  const hpMooncakes = queryAll('SELECT * FROM homepage_mooncakes ORDER BY sort_order');
  const hpPoems = queryAll('SELECT * FROM homepage_poems ORDER BY sort_order');
  const hpGallery = queryAll('SELECT * FROM homepage_gallery ORDER BY sort_order');
  const foodTags = queryAll('SELECT * FROM food_tags ORDER BY sort_order');
  const heritage = queryAll('SELECT * FROM heritage_milestones ORDER BY sort_order');
  const world = queryAll('SELECT * FROM world_midautumn ORDER BY sort_order');
  res.render('index', { config, nav, user, hpTimeline, hpLegends, hpCustoms, hpMooncakes, hpPoems, hpGallery, foodTags, heritage, world });
});

// ========== 节日起源（需登录） ==========
router.get('/origin', requireAuth, (req, res) => {
  const config = getSiteConfig();
  const nav = getNav();
  const user = req.session.user;
  const eras = queryAll('SELECT * FROM eras ORDER BY sort_order');
  eras.forEach(e => e.quotes = JSON.parse(e.quotes_json));
  res.render('origin', { config, nav, user, eras, currentPage: 'origin' });
});

// ========== 民间习俗（需登录） ==========
router.get('/customs', requireAuth, (req, res) => {
  const config = getSiteConfig();
  const nav = getNav();
  const user = req.session.user;
  const categories = queryAll('SELECT * FROM custom_categories ORDER BY sort_order');
  const customs = queryAll('SELECT * FROM customs ORDER BY sort_order');
  // Attach details to each custom
  customs.forEach(c => {
    c.details = queryAll('SELECT * FROM custom_details WHERE custom_id = ? ORDER BY id', [c.id]);
  });
  // Attach customs to each category
  categories.forEach(cat => {
    cat.customs = customs.filter(c => c.category_id === cat.id);
  });
  res.render('customs', { config, nav, user, categories, customs, currentPage: 'customs' });
});

// ========== 神话传说（需登录） ==========
router.get('/legends', requireAuth, (req, res) => {
  const config = getSiteConfig();
  const nav = getNav();
  const user = req.session.user;
  const systems = queryAll('SELECT * FROM legend_systems ORDER BY sort_order');
  const legends = queryAll('SELECT l.*, ls.sys_key FROM legends l JOIN legend_systems ls ON l.system_id = ls.id ORDER BY l.sort_order');
  legends.forEach(l => {
    l.details = queryAll('SELECT * FROM legend_details WHERE legend_id = ? ORDER BY id', [l.id]);
  });
  systems.forEach(sys => {
    sys.legends = legends.filter(l => l.system_id === sys.id);
  });
  res.render('legends', { config, nav, user, systems, legends, currentPage: 'legends' });
});

// ========== 美食文化（需登录） ==========
router.get('/food', requireAuth, (req, res) => {
  const config = getSiteConfig();
  const nav = getNav();
  const user = req.session.user;
  const timeline = queryAll('SELECT * FROM food_timeline ORDER BY sort_order');
  const regionalFoods = queryAll('SELECT * FROM regional_foods ORDER BY sort_order');
  const craftSteps = queryAll('SELECT * FROM craft_steps ORDER BY step_number');
  const foodCustoms = queryAll('SELECT * FROM food_customs ORDER BY sort_order');
  const celebrities = queryAll('SELECT * FROM celebrities ORDER BY sort_order');
  const mooncakeTypes = queryAll('SELECT * FROM mooncake_types ORDER BY sort_order');
  mooncakeTypes.forEach(m => {
    m.tags = JSON.parse(m.tags_json);
    m.stats = JSON.parse(m.stats_json);
  });
  res.render('food', { config, nav, user, timeline, regionalFoods, craftSteps, foodCustoms, celebrities, mooncakeTypes, currentPage: 'food' });
});

// ========== 诗词鉴赏（需登录） ==========
router.get('/poetry', requireAuth, (req, res) => {
  const config = getSiteConfig();
  const nav = getNav();
  const user = req.session.user;
  const poems = queryAll('SELECT id, anchor, short_title, title, author, dynasty_tag, excerpt FROM poems ORDER BY id');
  res.render('poetry', { config, nav, user, poems, currentPage: 'poetry' });
});

// ========== 诗词详情（需登录） ==========
router.get('/poetry/:anchor', requireAuth, (req, res) => {
  const config = getSiteConfig();
  const nav = getNav();
  const user = req.session.user;
  const poem = queryOne('SELECT * FROM poems WHERE anchor = ?', [req.params.anchor]);
  if (!poem) return res.status(404).send('诗词未找到');
  poem.lines = queryAll('SELECT * FROM poem_lines WHERE poem_id = ? ORDER BY sort_order', [poem.id]);
  const allPoems = queryAll('SELECT id, anchor, short_title FROM poems ORDER BY id');
  res.render('poetry-detail', { config, nav, user, poem, allPoems, currentPage: 'poetry' });
});

// ========== 名人详情（需登录） ==========
router.get('/fame/:anchor', requireAuth, (req, res) => {
  const config = getSiteConfig();
  const nav = getNav();
  const user = req.session.user;
  const celebrity = queryOne('SELECT * FROM celebrities WHERE anchor = ?', [req.params.anchor]);
  if (!celebrity) return res.status(404).send('名人未找到');
  const allCelebrities = queryAll('SELECT anchor, name FROM celebrities ORDER BY sort_order');
  res.render('fame-detail', { config, nav, user, celebrity, allCelebrities, currentPage: 'food' });
});

// ========== 匠心手作详情（需登录） ==========
router.get('/craft/:anchor', requireAuth, (req, res) => {
  const config = getSiteConfig();
  const nav = getNav();
  const user = req.session.user;
  const step = queryOne('SELECT * FROM craft_steps WHERE anchor = ?', [req.params.anchor]);
  if (!step) return res.status(404).send('步骤未找到');
  const allSteps = queryAll('SELECT anchor, name, step_number FROM craft_steps ORDER BY step_number');
  res.render('craft-detail', { config, nav, user, step, allSteps, currentPage: 'food' });
});

// ========== 中秋图集（需登录） ==========
router.get('/gallery', requireAuth, (req, res) => {
  const config = getSiteConfig();
  const nav = getNav();
  const user = req.session.user;
  const items = queryAll('SELECT * FROM gallery_items ORDER BY sort_order');
  res.render('gallery', { config, nav, user, items, currentPage: 'gallery' });
});

// ========== 祝福寄语（需登录） ==========
router.get('/blessing', requireAuth, (req, res) => {
  const config = getSiteConfig();
  const nav = getNav();
  const user = req.session.user;
  const blessings = queryAll('SELECT * FROM blessings ORDER BY id DESC LIMIT 50');
  const quickBlessings = queryAll('SELECT * FROM quick_blessings');
  const stats = {
    blessingCount: queryAll('SELECT COUNT(*) as cnt FROM blessings')[0].cnt,
    lanternCount: queryAll('SELECT COUNT(*) as cnt FROM blessings')[0].cnt
  };
  res.render('blessing', { config, nav, user, blessings, quickBlessings, stats, currentPage: 'blessing' });
});

// ========== 管理后台（需登录） ==========
router.get('/admin', adminOnly, (req, res) => {
  const config = getSiteConfig();
  const nav = getNav();
  const user = req.session.user;

  // 获取所有表名
  const tables = queryAll("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");

  // 获取每张表的数据
  const tableData = {};
  tables.forEach(t => {
    const name = t.name;
    const columns = queryAll("PRAGMA table_info(" + name + ")");
    const rows = queryAll("SELECT * FROM \"" + name + "\" LIMIT 200");
    tableData[name] = { columns: columns.map(c => c.name), rows, count: rows.length };
  });

  res.render('admin', { config, nav, user, tables: tables.map(t => t.name), tableData, currentPage: 'admin' });
});

// ========== 用户管理页面（仅管理员） ==========
router.get('/admin/users', adminOnly, (req, res) => {
  const config = getSiteConfig();
  const nav = getNav();
  const user = req.session.user;
  const users = queryAll('SELECT id, username, role, created_at FROM users ORDER BY id');
  const adminCount = queryOne('SELECT COUNT(*) as cnt FROM users WHERE role = ?', ['admin']);
  res.render('admin-users', { config, nav, user, users, adminCount: adminCount ? adminCount.cnt : 0, currentPage: 'admin' });
});

module.exports = router;
