# 月满中华 · 情系中秋 — 项目总结

## 项目概述

**「月满中华 · 情系中秋」** 是一个以中秋节为主题的非物质文化遗产专题网站。围绕中秋文化，涵盖节日起源、民间习俗、神话传说、美食文化、诗词鉴赏、中秋图集、祝福寄语等多个维度，以数据库驱动的方式呈现丰富的中秋文化内容。

- **版本**：2.0.0（数据库驱动版）
- **技术路线**：Node.js + Express 服务端渲染，纯原生前端（无框架）

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 运行时 | Node.js |
| Web 框架 | Express 4.21 |
| 模板引擎 | EJS 3.1 |
| 数据库 | SQLite（通过 sql.js 1.11 编译为 WebAssembly） |
| 会话管理 | express-session 1.18（内存存储，24 小时过期） |
| 前端 | 原生 HTML / CSS / JavaScript，零外部依赖 |
| 动画 | CSS Animations + Canvas API |

---

## 项目结构

```
Mid Festival/
├── server.js              # 主入口，Express 配置与路由挂载
├── db.js                  # 数据库初始化、建表、迁移、查询辅助
├── seed.js                # 种子数据脚本
├── migrate.js             # 历史迁移脚本
├── package.json           # 项目依赖与脚本
├── start.bat              # Windows 启动脚本
├── stop.bat               # Windows 停止脚本
├── routes/
│   ├── pages.js           # 页面路由（13 条 GET 路由）
│   ├── auth.js            # 认证路由（登录/注册/登出）
│   └── api.js             # API 路由（祝福语 + 管理后台 CRUD）
├── middleware/
│   └── auth.js            # 认证中间件
├── views/                 # 15 个 EJS 模板
│   ├── index.ejs          # 首页
│   ├── login.ejs          # 登录页
│   ├── register.ejs       # 注册页
│   ├── origin.ejs         # 节日起源
│   ├── customs.ejs        # 民间习俗
│   ├── legends.ejs        # 神话传说
│   ├── food.ejs           # 美食文化
│   ├── poetry.ejs         # 诗词鉴赏列表
│   ├── poetry-detail.ejs  # 诗词深度赏析
│   ├── fame-detail.ejs    # 名人详情
│   ├── craft-detail.ejs   # 匠心手作详情
│   ├── gallery.ejs        # 中秋图集
│   ├── blessing.ejs       # 祝福寄语
│   ├── admin.ejs          # 管理后台
│   └── admin-users.ejs    # 用户管理
├── public/
│   ├── css/               # 5 个样式表（约 3300 行）
│   │   ├── common.css     # 公共样式：变量、导航、页脚
│   │   ├── index.css      # 首页专属样式
│   │   ├── pages.css      # 二级页面通用样式
│   │   ├── animations.css # 关键帧动画库
│   │   └── icons.css      # 纯 CSS 图标系统
│   ├── js/                # 9 个脚本（约 3300 行）
│   │   ├── common.js      # 导航、滚动、光标特效、hover 爆发
│   │   ├── index.js       # 首页 Canvas 动画、倒计时
│   │   ├── particles.js   # 粒子系统引擎
│   │   ├── moon-journey.js# 全站月亮动态背景引擎
│   │   ├── parallax.js    # 视差滚动
│   │   ├── origin.js      # 节日起源页面交互
│   │   ├── food.js        # 美食文化页面交互
│   │   ├── blessing.js    # 祝福寄语表单
│   │   └── audio-player.js# 音频播放器
│   ├── images/            # 图片资源目录
│   └── audio/             # 音频资源目录
├── css/                   # public/css/ 副本
├── js/                    # public/js/ 副本
└── data/
    └── data.db            # SQLite 数据库文件（含全部数据）
```

---

## 数据库设计

共 **28 张表**，涵盖内容管理与用户系统。

### 核心内容表（20 张）

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `site_config` | 网站配置（标题、页脚文字等） | key, value |
| `eras` | 节日起源时代卡片（上古→当代） | era_key, sort_order, icon, name, desc_html, quotes_json |
| `poems` | 诗词数据（14 首经典中秋诗词） | anchor, title, author, dynasty_tag, content, excerpt, author_bio, theme_analysis, insight_quote |
| `poem_lines` | 诗词逐行解析 | poem_id, sort_order, verse_line, explanation |
| `custom_categories` | 习俗分类（敬天礼月/灯火祈福/饮食文化/游艺民俗） | name, anchor, subtitle |
| `customs` | 习俗条目（12 项） | category_id, anchor, icon, name, card_desc |
| `custom_details` | 习俗详情选项卡（每项 5 个选项卡） | custom_id, tab_key, tab_label, content |
| `legend_systems` | 传说体系（汉族神话/民间传说/东亚传说） | name, anchor, sys_key, subtitle |
| `legends` | 传说故事（9 则：嫦娥奔月、吴刚伐桂等） | system_id, anchor, icon, title, brief, moral_theme |
| `legend_details` | 传说详情选项卡（每则 6 个选项卡） | legend_id, tab_key, tab_label, content |
| `food_timeline` | 美食历史时间线 | sort_order, icon, era, event, description |
| `regional_foods` | 地方特色食品 | icon, region, name, description, is_featured |
| `craft_steps` | 月饼制作五步工序 | step_number, icon, name, anchor, description |
| `food_customs` | 饮食习俗（拜月供品、桂花酒等） | icon, title, content |
| `celebrities` | 美食相关历史名人（6 位） | anchor, icon, name, era_tag, bio, food_name, food_desc |
| `mooncake_types` | 月饼种类（广式、苏式等 6 种） | icon, name, description, tags_json, stats_json |
| `gallery_items` | 图集项目 | icon, title, category |
| `world_midautumn` | 世界各地中秋习俗 | flag, country, local_name, description |
| `heritage_milestones` | 非遗保护里程碑 | year_label, title, description |
| `food_tags` | 美食标签 | icon, name |

### 首页内容表（6 张）

| 表名 | 说明 |
|------|------|
| `homepage_timeline` | 首页时间轴 |
| `homepage_legends` | 首页传说卡片 |
| `homepage_customs` | 首页习俗卡片 |
| `homepage_mooncakes` | 首页月饼展示 |
| `homepage_poems` | 首页诗词摘录 |
| `homepage_gallery` | 首页图集预览 |

### 用户与交互表（2 张）

| 表名 | 说明 |
|------|------|
| `users` | 用户表（id, username, password, role, created_at） |
| `blessings` | 用户祝福寄语 |
| `quick_blessings` | 快捷祝福模板 |

---

## 路由总览

### 页面路由（13 条 GET）

| 路径 | 权限 | 对应视图 | 说明 |
|------|------|---------|------|
| `/` | 公开 | index.ejs | 首页（10 个内容板块） |
| `/origin` | 需登录 | origin.ejs | 节日起源（10 个时代卡片） |
| `/customs` | 需登录 | customs.ejs | 民间习俗（4 类 × 12 项） |
| `/legends` | 需登录 | legends.ejs | 神话传说（3 体系 × 9 则） |
| `/food` | 需登录 | food.ejs | 美食文化（6 大模块） |
| `/poetry` | 需登录 | poetry.ejs | 诗词鉴赏列表（14 首） |
| `/poetry/:anchor` | 需登录 | poetry-detail.ejs | 诗词深度赏析 |
| `/fame/:anchor` | 需登录 | fame-detail.ejs | 名人详情 |
| `/craft/:anchor` | 需登录 | craft-detail.ejs | 匠心手作详情（5 步） |
| `/gallery` | 需登录 | gallery.ejs | 中秋图集 |
| `/blessing` | 需登录 | blessing.ejs | 祝福寄语 |
| `/admin` | 管理员 | admin.ejs | 管理后台（28 张表 CRUD） |
| `/admin/users` | 管理员 | admin-users.ejs | 用户管理 |

### 认证路由（3 路径 × 5 操作）

| 路径 | 方法 | 说明 |
|------|------|------|
| `/login` | GET | 显示登录页面 |
| `/login` | POST | 处理登录提交 |
| `/register` | GET | 显示注册页面 |
| `/register` | POST | 处理注册提交 |
| `/logout` | GET | 销毁会话并登出 |

### 管理 API（8 条，仅管理员）

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/admin/table/:table` | GET | 查询表结构与数据 |
| `/api/admin/table/:table` | POST | 新增记录 |
| `/api/admin/table/:table/:id` | PUT | 更新记录 |
| `/api/admin/table/:table/:id` | DELETE | 删除记录 |
| `/api/admin/users` | GET/POST | 用户列表与创建 |
| `/api/admin/users/:id` | PUT | 更新用户信息 |
| `/api/admin/users/:id/password` | PUT | 修改密码 |
| `/api/admin/users/:id` | DELETE | 删除用户 |

### 公开 API（4 条）

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/blessings` | GET | 获取祝福列表 |
| `/api/blessings` | POST | 提交祝福 |
| `/api/quick-blessings` | GET | 获取快捷祝福 |
| `/api/blessings/stats` | GET | 祝福数量统计 |

---

## 认证与权限

| 项目 | 说明 |
|------|------|
| 会话机制 | express-session，服务端内存存储，24 小时过期 |
| 加密方式 | 明文存储（未使用哈希） |
| 用户角色 | `admin`（管理员）/ `user`（普通用户） |
| 默认管理员 | 用户名 `admin`，密码 `admin123` |
| `requireAuth` | 未登录用户重定向至 `/login`，登录后返回原页面 |
| `redirectIfAuth` | 已登录用户访问登录/注册页时自动跳转首页 |
| `adminOnly` | 非管理员返回 403 禁止访问 |

> 首页为公开页面，其余所有内容页面均需登录后才能访问。管理后台仅限管理员访问。

---

## 种子数据规模

| 类别 | 数量 | 详情 |
|------|------|------|
| 时代卡片 | 10 个 | 上古→商周→秦汉→魏晋→唐→宋→元→明→清→当代 |
| 诗词 | 14 首 | 苏轼、张九龄、杜甫、李白、王建、张若虚、晏殊、辛弃疾、刘禹锡、李朴、纳兰性德、曹松等 |
| 诗词逐行解析 | 覆盖全部 14 首 | 每行配有详细注释 |
| 习俗分类 | 4 类 | 敬天礼月、灯火祈福、饮食文化、游艺民俗 |
| 习俗条目 | 12 项 | 每项含 5 个详情选项卡（历史渊源/民俗流程/地域差异/文化寓意/当代传承） |
| 传说体系 | 3 个 | 中华汉族神话、中华民间传说、东亚月亮传说 |
| 传说故事 | 9 则 | 嫦娥奔月、吴刚伐桂、玉兔捣药、月饼起义、月下老人、天狗食月、辉夜姬、韩国月兔、阿贵与榕树 |
| 美食时间线 | 6 个节点 | 从上古到明清的月饼发展史 |
| 地方特色食品 | 8 种 | 各地特色月饼与中秋食品 |
| 制作步骤 | 5 步 | 制皮→制馅→包馅→压模→烘烤 |
| 饮食习俗 | 6 项 | 拜月供品、桂花佳酿、中秋啜螺、分饼之仪、赏月宴饮、团圆饭仪 |
| 美食名人 | 6 位 | 苏轼、杨贵妃、朱元璋、乾隆、慈禧、张大千 |
| 月饼类型 | 6 种 | 广式、苏式、京式、潮式、滇式、冰皮 |
| 图集项目 | 12 项 | 按分类排列 |
| 世界各地中秋 | 4 国 | 日本、韩国、越南、新加坡 |
| 非遗里程碑 | 3 项 | 国家级非遗认定历程 |
| 首页各模块 | 42 条 | 时间轴、传说、习俗、月饼、诗词、图集 |
| 快捷祝福 | 15 条 | 预设祝福语模板 |

---

## 视觉特效系统

### 粒子引擎（`particles.js`）
- 星空闪烁粒子
- 孔明灯漂浮上升动画
- 桂花花瓣飘落效果
- 烟花爆炸粒子
- 水面月亮倒影

### 月亮旅程（`moon-journey.js`）
- 每个页面独立配置天空渐变颜色
- 月亮在视口中的位置随页面变化
- 辉光强度、花瓣密度、孔明灯生成概率、星星密度逐页设定
- 首页分 5 个阶段呈现月亮旅程

### 光标特效（`common.js`）
- 鼠标跟随金色光晕（经过按钮/卡片时自动放大）
- 光标拖尾粒子（根据移动速度动态生成，五色粒子池）
- Hover 爆发效果（悬停交互元素时粒子四散）

### 动画系统（`animations.css`）
- **入场动画**：fadeInUp、fadeInDown、fadeInScale
- **滚动揭示**：scrollReveal（元素进入视口时淡入上移）
- **循环动画**：float（漂浮）、drift（漂移）、glow（呼吸发光）、sparkle（闪烁）
- **特殊动画**：logoPulse（Logo 脉冲）、moonPulse（月亮脉冲）、typewriter（打字机效果）
- **卡片动画**：craftPulse（手作步骤脉冲）

### 视差系统
- 元素级视差位移（`parallax.js`）
- 全局背景随鼠标微动（`common.js` 中的 `initBgParallax`）

### 首页专属特效（`index.js`）
- Canvas Hero 区域动态动画
- 中秋节倒计时翻牌效果（目标日期 2026-09-25）
- 月相展示仪表盘
- 逐字打字机入场动画

---

## 设计系统

### 主题色

| 变量名 | 色值 | 说明 |
|--------|------|------|
| `--deep-blue` | `#0a0e27` | 页面主背景（深蓝夜空） |
| `--mid-blue` | `#141836` | 次级背景 |
| `--night-blue` | `#1a1f4a` | 卡片背景 |
| `--moon-gold` | `#f5d27a` | 月光金（标题、强调色） |
| `--moon-glow` | `#fef5d7` | 月光白（高亮文字） |
| `--warm-orange` | `#e8734a` | 暖橙（点缀色） |
| `--lantern-red` | `#d4453b` | 灯笼红（按钮、强调） |
| `--osmanthus-yellow` | `#f0c75e` | 桂花黄（辅助金色） |
| `--dark-gold` | `#c9a96e` | 暗金（边框、次要元素） |
| `--jade-white` | `#fefef0` | 玉白（文字色） |

### 字体体系

| 用途 | 字体栈 |
|------|--------|
| 标题 | `STKaiti`（华文楷体）、`KaiTi`（楷体） |
| 正文 | `Microsoft YaHei`（微软雅黑）、`PingFang SC` |
| 诗词 | `STLiti`（华文隶书）、`LiSu`（隶书） |
| 装饰 | `STXingkai`（华文行楷） |

### 图标方案
- **Emoji**：页面中大量使用，作为装饰图标
- **CSS 图标**（`icons.css`）：使用 CSS `mask` + SVG 实现纯色图标，支持 `currentColor` 继承

---

## 页面功能详情

### 首页
十大板块依次布局：Hero 全屏入口 → 中秋倒计时 → 节日介绍 → 节日起源预览 → 神话传说卡片 → 民间习俗预览 → 美食文化展示 → 诗词摘录 → 中秋图集 → 非遗传承 → 世界各地中秋 → 祝福寄语

### 节日起源
- 10 个时代卡片（上古时期→商周→秦汉→魏晋南北朝→唐代→宋代→元代→明代→清代→近现代）
- SVG 曲线时间轴，沿曲线排列
- "穿针引线"交互：滚动时抛物线依次穿过卡片，卡片从折叠态展开为详读态
- 每张卡片含古籍引用（如《周礼》《东京梦华录》等）

### 民间习俗
- 4 大分类选项卡：敬天礼月、灯火祈福、饮食文化、游艺民俗
- 12 项习俗，每项点击展开 5 个详情选项卡：
  - 历史渊源 → 民俗流程 → 地域差异 → 文化寓意 → 当代传承
- 习俗包括：赏月、祭月、观潮、燃灯、烧塔、舞火龙、玩花灯、吃月饼、赏桂饮酒、博饼、兔儿爷、走月亮

### 神话传说
- 3 大传说体系：中华汉族神话、中华民间传说、东亚月亮传说
- 9 则故事，每则以翻转卡片呈现：
  - **正面**：图标 + 故事名 + 概要
  - **背面**：寓意主题 + 关键人物 + 详情选项卡（传说起源/故事情节/文化象征/艺术再现/比较研究/现代传承）
- 体系筛选功能：点击标签仅显示对应体系的传说

### 美食文化（6 大模块）
1. **美食历史时间线**：从上古"太牢祭月"到明清"中秋月饼"的演变
2. **地方特色美食**：各地代表性中秋食品
3. **匠心手作**：月饼制作五步工序（制皮→制馅→包馅→压模→烘烤），每步可点击进入独立详情页
4. **饮食习俗**：拜月供品、桂花佳酿、分饼仪式等
5. **名人典故**：历史上与中秋美食相关的 6 位名人（苏轼、杨贵妃、朱元璋等），点击可跳转详情
6. **月饼种类**：广式、苏式、京式、潮式、滇式、冰皮月饼的详细介绍

### 诗词鉴赏
- **列表页**：14 首诗词以分栏卡片展示，悬停展开诗词正文预览
- **详情页**：每首含完整诗词原文、作者生平、逐行解析、情感主题分析、历史文化背景、历代名家评语
- 粘性子导航可在各诗词间快速跳转

### 匠心手作（5 个独立详情页）
| 步骤 | 锚点 | 核心内容 |
|------|------|---------|
| 制皮 | `/craft/zhipi` | 原料配比、揉制工艺、关键技巧 |
| 制馅 | `/craft/zhixian` | 经典馅料分类、炒制火候、核心要点 |
| 包馅 | `/craft/baoxian` | 皮馅比例、包馅手法、技艺传承 |
| 压模 | `/craft/yamo` | 模具种类、压模手法、文化意蕴 |
| 烘烤 | `/craft/hongkao` | 烘烤流程、回油原理、火候掌控 |

### 中秋图集
- 分类筛选（月景、灯笼、美食、民俗）
- 网格展示，悬停显示标题浮层
- 点击放大查看（Lightbox 灯箱效果）

### 祝福寄语
- 祝福提交表单（文字 + 匿名/署名）
- 快捷祝福一键选择
- 祝福卡片墙展示（最近 50 条）
- Canvas 孔明灯动画背景

### 管理后台
- **数据管理**：全部 28 张表以卡片形式展示，每张表可展开查看/搜索数据，支持新增/编辑/删除记录
- **用户管理**：独立页面，创建/编辑/删除用户，修改密码
- **安全保护**：不能删除自己，不能删除最后一个管理员

---

## 交互设计

| 功能 | 说明 |
|------|------|
| 导航栏 | 固定顶部，滚动后背景加深，当前页高亮，含用户登录状态与登出下拉菜单 |
| 登录交互 | 未登录显示"登录"按钮，已登录显示头像+用户名，悬停下拉"退出登录" |
| 页面过渡 | 整页淡入淡出加载动画（月光脉冲） |
| 滚动进度条 | 页面顶部细线显示阅读进度 |
| 滚动揭示 | 元素进入视口时以淡入+上移动画呈现 |
| 返回顶部 | 滚动超过 600px 后显示浮动按钮 |
| 移动端适配 | 768px 和 550px 两个响应式断点，汉堡菜单，触摸设备自动禁用光标特效 |
| 右键/复制保护 | 全站禁用右键菜单、文字选择和复制快捷键 |

---

## 兼容性

- **桌面端**：Chrome / Edge / Firefox 全功能支持
- **移动端**：响应式布局适配，触摸设备自动降级（禁用光标跟随特效）
- **最低要求**：浏览器需支持 CSS Grid、Flexbox、IntersectionObserver、Canvas API
