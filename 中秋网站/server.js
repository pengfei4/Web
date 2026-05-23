/**
 * 中秋节网站 - 主服务器入口（一键启动）
 * 首次运行自动填充数据库
 */
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { initDB, getDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'data.db');

// 中间件
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'mid-autumn-festival-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// 静态资源
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/audio', express.static(path.join(__dirname, 'public', 'audio')));

// 视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 路由
const pagesRouter = require('./routes/pages');
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');

app.use(authRouter);
app.use(apiRouter);
app.use(pagesRouter);

// 启动
async function start() {
  // 确保 data 目录存在
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 首次运行：自动填充数据库
  if (!fs.existsSync(DB_PATH)) {
    console.log('首次运行，正在填充数据库（约需30秒）……');
    try {
      execSync('node seed.js', { cwd: __dirname, stdio: 'inherit' });
    } catch (e) {
      console.error('数据库初始化失败，尝试手动运行: node seed.js');
      process.exit(1);
    }
  }

  // 初始化数据库连接
  await initDB();

  app.listen(PORT, () => {
    console.log('═══════════════════════════════════');
    console.log('  月满中华 · 情系中秋');
    console.log('  http://localhost:' + PORT);
    console.log('  首页公开访问');
    console.log('  管理员: admin / admin123');
    console.log('═══════════════════════════════════');
  });
}

start().catch(err => {
  console.error('启动失败:', err);
  process.exit(1);
});
