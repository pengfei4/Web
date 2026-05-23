# 中秋网站 — 项目进度清单

> 最后更新: 2026-05-22

## 一、项目概览

| 维度 | 状态 |
|------|------|
| 技术架构 | Node.js + Express + SQLite + EJS |
| 数据库 | data/data.db（sql.js，27张表） |
| 总页面数 | 10（全部 EJS 模板化） |
| 认证系统 | Session 登录保护（首页公开，其他需登录） |
| 数据驱动 | 所有内容从数据库读取，改数据库=改页面 |

## 二、项目结构

```
D:\zqjie\中秋网站\
├── server.js              ← Express 主入口
├── package.json           ← 依赖配置
├── db.js                  ← 数据库连接/初始化/查询
├── seed.js                ← 数据填充（node seed.js）
├── routes/
│   ├── pages.js           ← 页面路由（EJS渲染）
│   ├── auth.js            ← 登录/登出
│   └── api.js             ← 祝福API
├── middleware/
│   └── auth.js            ← 认证中间件
├── views/
│   ├── login.ejs          ← 登录页
│   ├── index.ejs          ← 首页（公开）
│   ├── origin.ejs         ← 节日起源
│   ├── customs.ejs        ← 民间习俗
│   ├── legends.ejs        ← 神话传说
│   ├── food.ejs           ← 美食文化
│   ├── poetry.ejs         ← 诗词鉴赏
│   ├── poetry-detail.ejs  ← 诗词详情
│   ├── fame-detail.ejs    ← 名人详情
│   ├── gallery.ejs        ← 中秋图集
│   └── blessing.ejs       ← 祝福寄语
├── public/                ← 静态资源
│   ├── css/
│   ├── js/
│   ├── images/
│   └── audio/
├── data/
│   └── data.db            ← SQLite 数据库
└── *.html                 ← 原始静态文件（保留作参考）
```

## 三、数据库表（27张）

| 表名 | 内容 | 记录数 |
|------|------|--------|
| users | 管理员用户 | 1 |
| site_config | 网站配置 | 5 |
| eras | 时代卡片 | 10 |
| poems | 诗词 | 14 |
| poem_lines | 诗词逐行解析 | 60+ |
| custom_categories | 习俗分类 | 4 |
| customs | 习俗 | 12 |
| custom_details | 习俗详情标签页 | 60 |
| legend_systems | 传说文化体系 | 3 |
| legends | 传说 | 9 |
| legend_details | 传说详情标签页 | 54 |
| food_timeline | 美食历史时间线 | 6 |
| regional_foods | 地域美食 | 8 |
| craft_steps | 制作步骤 | 5 |
| food_customs | 饮食礼俗 | 6 |
| celebrities | 名人与食 | 6 |
| mooncake_types | 月饼博览 | 6 |
| gallery_items | 图集 | 12 |
| world_midautumn | 世界中秋 | 4 |
| heritage_milestones | 非遗里程碑 | 3 |
| blessings | 祝福寄语 | 用户生成 |
| quick_blessings | 快速祝福模板 | 15 |
| food_tags | 首页美食标签 | 8 |
| homepage_* | 首页各区块数据 | 若干 |

## 四、页面路由

| 路径 | 页面 | 权限 |
|------|------|------|
| `/` | 首页 | 公开 |
| `/login` | 登录 | 公开 |
| `/origin` | 节日起源 | 需登录 |
| `/customs` | 民间习俗 | 需登录 |
| `/legends` | 神话传说 | 需登录 |
| `/food` | 美食文化 | 需登录 |
| `/poetry` | 诗词鉴赏 | 需登录 |
| `/poetry/:anchor` | 诗词详情 | 需登录 |
| `/fame/:anchor` | 名人详情 | 需登录 |
| `/gallery` | 中秋图集 | 需登录 |
| `/blessing` | 祝福寄语 | 需登录 |

## 五、API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/blessings` | 获取祝福列表 |
| POST | `/api/blessings` | 创建祝福 |
| GET | `/api/blessings/stats` | 祝福统计 |

## 六、启动与停止

### 一键启动（三种方式）

| 方式 | 操作 | 说明 |
|------|------|------|
| 双击 `start.bat` | 资源管理器中双击 | 最简单，自动检测端口、安装依赖、初始化数据库 |
| 命令行 | `node server.js` 或 `npm start` | 开发常用 |
| 首次运行 | 自动调用 seed.js 填充数据库 | 创建27张表、400+条数据 |

### 一键停止（两种方式）

| 方式 | 操作 | 说明 |
|------|------|------|
| 双击 `stop.bat` | 资源管理器中双击 | 查找端口3000的进程并终止 |
| 命令行 | `npm stop` | 同上 |

### 启停流程

```
双击 start.bat
    ↓
检查端口3000是否占用 → 占用则提示先运行 stop.bat
    ↓ 未占用
检查 node_modules 是否存在 → 不存在则 npm install
    ↓ 存在
检查 data/data.db 是否存在 → 不存在则自动 node seed.js
    ↓ 存在
启动 Node.js 服务器 → http://localhost:3000
    ↓
双击 stop.bat → 终止端口3000进程 → 端口释放
```

## 七、数据驱动验证

修改 `data/data.db` 中的任意数据 → 刷新浏览器 → 页面内容同步变化。无需修改 HTML 代码。
