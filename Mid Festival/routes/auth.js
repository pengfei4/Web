/**
 * 认证路由 - 登录/注册/登出
 */
const express = require('express');
const router = express.Router();
const { queryOne, runSQL } = require('../db');
const { redirectIfAuth } = require('../middleware/auth');

// 登录页
router.get('/login', redirectIfAuth, (req, res) => {
  res.render('login', { error: null, success: null });
});

// 登录提交
router.post('/login', redirectIfAuth, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render('login', { error: '请输入用户名和密码', success: null });
  }
  const user = queryOne('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
  if (user) {
    req.session.user = { id: user.id, username: user.username, role: user.role || 'user' };
    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    return res.redirect(returnTo);
  }
  // 检查用户是否存在
  const exists = queryOne('SELECT id FROM users WHERE username = ?', [username]);
  if (exists) {
    res.render('login', { error: '密码错误，请重试', success: null });
  } else {
    res.render('login', { error: '该用户不存在，请先注册', success: null });
  }
});

// 注册页
router.get('/register', redirectIfAuth, (req, res) => {
  res.render('register', { error: null, success: null });
});

// 注册提交
router.post('/register', redirectIfAuth, (req, res) => {
  const { username, password, password2 } = req.body;
  if (!username || !password) {
    return res.render('register', { error: '请填写所有字段', success: null });
  }
  if (username.length < 2 || username.length > 20) {
    return res.render('register', { error: '用户名需2-20个字符', success: null });
  }
  if (password.length < 4) {
    return res.render('register', { error: '密码至少4位', success: null });
  }
  if (password !== password2) {
    return res.render('register', { error: '两次密码不一致', success: null });
  }
  // 检查用户名是否已存在
  const exists = queryOne('SELECT id FROM users WHERE username = ?', [username]);
  if (exists) {
    return res.render('register', { error: '该用户名已被注册', success: null });
  }
  // 创建用户（默认角色 user）
  runSQL('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, 'user']);
  // 自动登录
  const user = queryOne('SELECT id, username FROM users WHERE username = ?', [username]);
  req.session.user = { id: user.id, username: user.username, role: 'user' };
  const returnTo = req.session.returnTo || '/';
  delete req.session.returnTo;
  res.redirect(returnTo);
});

// 登出
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
