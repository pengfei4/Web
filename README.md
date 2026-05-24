# Mid-Autumn Festival — Intangible Cultural Heritage Website

**月满中华 · 情系中秋** — A database-driven thematic website showcasing the Mid-Autumn Festival as a Chinese national intangible cultural heritage.

---

## Project Overview

The Mid-Autumn Festival is one of China's four great traditional festivals (alongside Spring Festival, Qingming, and Dragon Boat). Recognized as a **National Intangible Cultural Heritage** in 2006 and a public holiday in 2008, the festival embodies themes of family reunion, moon worship, and harvest celebration spanning over 3,000 years of history.

This website presents the festival's rich cultural tapestry across 10 pages covering origins, customs, legends, food, poetry, gallery, and interactive blessings — all backed by a SQLite database and rendered server-side with EJS templates.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express |
| Template Engine | EJS |
| Database | SQLite via sql.js (WebAssembly, zero-install) |
| Auth | express-session (cookie-based) |
| Frontend | Vanilla HTML5 / CSS3 / JavaScript (no framework) |

---

## Quick Start

```bash
# Install dependencies
npm install

# Start the server (auto-seeds the database on first run)
npm start
```

Or simply **double-click `start.bat`** on Windows — it handles port checks, dependency install, and database initialization automatically.

The server starts at **http://localhost:3000**.

| Default account | |
|-----------------|-----|
| Username | `admin` |
| Password | `admin123` |

To stop: double-click `stop.bat` or run `npm stop`.

---

## Pages

| Route | Title | Access |
|-------|-------|--------|
| `/` | Home (12-section single-page scroll) | Public |
| `/login` | Login / Register | Public |
| `/origin` | Origins & History — 10-era scrollable timeline | Auth required |
| `/customs` | Folk Customs — 12 flip cards + 4 category tabs | Auth required |
| `/legends` | Myths & Legends — 9 tales across 3 cultural systems | Auth required |
| `/food` | Food Culture — 6 modules (timeline, regions, craft, etc.) | Auth required |
| `/poetry` | Poetry — 14 classic Mid-Autumn poems | Auth required |
| `/poetry/:anchor` | Poem Deep-dive — line-by-line analysis | Auth required |
| `/fame/:anchor` | Celebrity Profiles — 6 historical figures & food stories | Auth required |
| `/gallery` | Gallery — 12 items with category filtering | Auth required |
| `/blessing` | Blessing Wall — send floating lantern wishes | Auth required |
| `/admin` | Admin Panel — browse all 27 database tables | Admin only |

---

## Project Structure

```
Mid Festival/
├── server.js                 # Express entry point
├── package.json
├── db.js                     # SQLite connection, query helpers, schema
├── seed.js                   # Database seeder (27 tables, 400+ records)
├── start.bat / stop.bat      # One-click start/stop scripts
├── routes/
│   ├── pages.js              # All page routes (EJS rendering)
│   ├── auth.js               # Login / register / logout
│   └── api.js                # Blessing CRUD API
├── middleware/
│   └── auth.js               # Session auth guard
├── views/                    # EJS templates (11 files)
│   ├── index.ejs, login.ejs, register.ejs
│   ├── origin.ejs, customs.ejs, legends.ejs
│   ├── food.ejs, poetry.ejs, poetry-detail.ejs
│   ├── fame-detail.ejs, gallery.ejs, blessing.ejs
│   └── admin.ejs
├── public/
│   ├── css/                  # 4 stylesheets
│   ├── js/                   # 8 scripts
│   ├── images/
│   └── audio/
├── data/
│   └── data.db               # SQLite database (auto-created on first run)
└── *.html                    # Original static files (kept for reference)
```

---

## Database (27 Tables, 400+ Records)

| Category | Tables | Sample Data |
|----------|--------|-------------|
| Config & Users | `site_config`, `users` | Site settings, admin account |
| Origins | `eras` | 10 eras from antiquity to present |
| Customs | `custom_categories`, `customs`, `custom_details` | 4 categories, 12 customs, 60 detail tabs |
| Legends | `legend_systems`, `legends`, `legend_details` | 3 cultural systems, 9 legends, 54 detail tabs |
| Food | `food_timeline`, `regional_foods`, `craft_steps`, `food_customs`, `celebrities`, `mooncake_types` | Timeline, 8 regions, 5 craft steps, 6 food customs, 6 celebrities, 6 mooncake types |
| Poetry | `poems`, `poem_lines` | 14 poems, 60+ line-by-line annotations |
| Homepage | `homepage_timeline`, `homepage_legends`, `homepage_customs`, `homepage_mooncakes`, `homepage_poems`, `homepage_gallery`, `food_tags` | Content blocks for index page sections |
| Gallery | `gallery_items` | 12 gallery entries across 4 categories |
| World | `world_midautumn` | 4 countries (Japan, Korea, Vietnam, Singapore) |
| Heritage | `heritage_milestones` | 3 milestones (2006, 2008, global) |
| Blessings | `blessings`, `quick_blessings` | User-submitted wishes + 15 templates |

---

## APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/blessings` | List all blessings |
| `POST` | `/api/blessings` | Submit a new blessing |
| `GET` | `/api/blessings/stats` | Blessing count & stats |

---

## Data-Driven Architecture

All page content is stored in `data/data.db`. To update any content — text, images, poetry, legends — simply modify the database. Pages refresh to reflect changes immediately. No HTML editing required.

---

## Current Progress

### Completed
- [x] Node.js + Express + SQLite backend with auto-seeding
- [x] All 10 pages migrated to EJS templates with database queries
- [x] Session-based authentication (login / register / logout)
- [x] Role-based access control (admin vs user)
- [x] Blessing submission API with persistent storage
- [x] Admin panel for browsing all 27 tables
- [x] One-click Windows start/stop batch scripts
- [x] Original static HTML preserved as reference

### Planned
- [ ] Replace emoji placeholders in gallery with real Mid-Autumn images
- [ ] Search/filter for poetry (by dynasty, author)
- [ ] Background music / sound effects on legend pages
- [ ] Food timeline drag-to-scroll interaction
- [ ] Mobile performance optimization (particle system downgrade)
- [ ] PWA offline support

---

## Development Notes

- **First run**: `server.js` detects missing `data/data.db` and automatically runs `node seed.js` to create and populate the database (~30 seconds).
- **Modifying data**: Run `node seed.js` to re-seed from scratch (this wipes existing data).
- **Static originals**: The root `*.html` files are the original static version kept for reference. The live site serves from `views/*.ejs` templates.
- **Database**: sql.js runs SQLite entirely in-memory and persists to disk. No external database installation required.
