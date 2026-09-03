# VKU Field Survey PWA

Offline-first campus facility inspection app (**Mini-Project 1**). Inspectors capture facility condition, optional photo, and GPS without network, then sync to Cloudflare **D1** (SQLite) when online.

**Live:** [https://vku-field-survey-pwa.tranlam2005tk.workers.dev](https://vku-field-survey-pwa.tranlam2005tk.workers.dev)

## Stack

| Layer | Tech |
|-------|------|
| UI | React 19, TypeScript, Vite, Tailwind, Lucide, Motion |
| Worker | Cloudflare Workers + static assets |
| Database | Cloudflare D1 (`surveys`, `preferences`) |
| PWA | `manifest.webmanifest` + Service Worker (`public/sw.js`) |
| i18n | English / Vietnamese (locale stored in D1 per device) |

## Features

- Installable PWA (standalone) with install button + iOS/browser install hints
- Offline queue: pending writes in `localStorage`, flush to D1 when online
- Inspection form: facility, building, category, condition (`good` \| `fair` \| `poor` \| `critical`), notes, photo, GPS
- Records list with search, filters, view / edit / duplicate / delete
- Language switcher **EN \| VI** (cached locally, persisted to D1 `preferences`)
- Notifications + App Badge for queued items

## Setup

```bash
npm install
npm run dev
```

PWA install / Service Worker run in **production** only:

```bash
npm run build
npm run preview
```

### D1 schema

```bash
npm run d1:migrate
```

Applies [`schema.sql`](./schema.sql) to the remote D1 database (`CREATE TABLE IF NOT EXISTS` is safe to re-run).

### Deploy

```bash
npm run deploy
```

Requires Wrangler logged in and a D1 binding in [`wrangler.jsonc`](./wrangler.jsonc).

## API

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/surveys` | List surveys from D1 |
| `POST` | `/api/surveys/sync` | Upsert one survey |
| `DELETE` | `/api/surveys/:id` | Delete survey |
| `GET` | `/api/preferences?deviceId=` | Read locale |
| `PUT` | `/api/preferences` | Save `{ deviceId, locale }` |

## 5 PWA criteria

1. **Installable** — web manifest, icons, `display: standalone`, install UI
2. **Offline-first** — Cache API app shell + offline queue until D1 is reachable
3. **Fast & responsive** — Cache-First shell, mobile layout, large tap targets
4. **Engaging** — notifications when queued offline; Badging API for queue count
5. **Secure** — Service Worker only on HTTPS / localhost

## PWA vs native

| Feature | Progressive Web App | Native Mobile App |
|---------|---------------------|-------------------|
| Distribution | Direct URL | App stores |
| App Store fee | 0% | 15% – 30% |
| Updates | Instant (Service Worker) | Store review |
| Bundle size | Small (web assets) | Larger native binaries |
| Hardware | Camera, GPS, storage | Full device APIs |
| Offline | Cache API + local queue → D1 | Local SQLite / files |

## Service Worker lifecycle

```
Register (main.tsx, production)
        ↓
Install  → pre-cache App Shell
        ↓
Activate → purge old cache versions
        ↓
Fetch    → caching strategies below
```

## Five caching strategies (`public/sw.js`)

1. **Cache-First** — app shell (HTML, JS, CSS, icons, navigations)
2. **Network-First** — `/api/*` with offline JSON fallback
3. **Stale-While-Revalidate** — `manifest.webmanifest`, `version.json`
4. **Cache-Only** — `/offline.html`
5. **Network-Only** — `/auth/*` (pass-through, never cached)

## Data model

Surveys live in D1 table `surveys`. While offline, upserts/deletes wait in `localStorage` (`vku-d1-pending`) and a snapshot (`vku-d1-snapshot`) until sync.

Locale preference: D1 table `preferences` keyed by `device_id`.

## Demo (zero network)

1. Open the HTTPS URL and install to the home screen.
2. Enable Airplane mode (or DevTools → Network → Offline).
3. Submit an inspection — status stays **queued**.
4. Go online → auto-sync or tap **Sync queue**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run deploy` | Build + `wrangler deploy` |
| `npm run d1:migrate` | Apply `schema.sql` to remote D1 |

## Docs

- [`docs/TECHNICAL_REPORT.md`](docs/TECHNICAL_REPORT.md)
- Printable HTML: [`docs/report.html`](docs/report.html)
