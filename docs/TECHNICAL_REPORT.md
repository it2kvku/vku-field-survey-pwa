# Technical Report — VKU Field Survey PWA

**Mini-Project 1 · Offline-first campus facility inspection**  
Tran Lam · Student developer (DEX / it2kvku) · September 2026

---

## 1. Goal

Campus facility teams need to inspect classrooms, labs, and utilities in buildings where Wi-Fi is weak or absent. A native store app is slow to update and expensive to distribute. This project ships a **Progressive Web App** that:

- installs to the home screen as a standalone app,
- captures inspection forms with **zero network**,
- stores structured records in **IndexedDB**,
- queues submissions until HTTPS connectivity returns.

The app is a production-style demo: there is no mandatory backend. When the device is online, queued records are marked **synced** (a real VKU API would replace `src/api/sync.ts`).

## 2. Mapping the five PWA criteria

| Criterion | Implementation in this project |
|-----------|--------------------------------|
| **Installable** | `public/manifest.webmanifest` (`display: standalone`, theme `#1e3a5f`, maskable SVG icons). `beforeinstallprompt` exposes an **Install app** button. |
| **Offline-first** | `public/sw.js` pre-caches the App Shell on `install`. IndexedDB holds surveys independently of Cache API. |
| **Fast & responsive** | Cache-First navigations boot from disk after the first visit. CSS uses a 720px column, 4-tab nav, and 44px-class tap targets. |
| **Engaging** | Notification permission; local notification when a record is queued offline; `navigator.setAppBadge(queuedCount)`. |
| **Secure** | Service Worker registers only in production (`import.meta.env.PROD`) over HTTPS or localhost. |

## 3. Architecture

```
UI (src/app.ts)
    ↓ save / list
IndexedDB  (surveys object store)
    ↓ queue status = queued
Service Worker fetch + optional Background Sync tag `sync-surveys`
    ↓ online
sync.ts  → mark status = synced
```

**App Shell** = `index.html`, hashed JS/CSS (cached on first fetch), icons, manifest, `offline.html`.

**Structured data** stays out of Cache API. Photos are resized to JPEG data URLs (~960px) so blobs remain small enough for IndexedDB.

## 4. Service Worker lifecycle

1. **Register** — `src/main.ts` calls `navigator.serviceWorker.register('/sw.js')` after `load` in production builds.
2. **Install** — `cache.addAll` of `/`, `/index.html`, `/offline.html`, icons, manifest, `version.json`. `skipWaiting()` activates immediately.
3. **Activate** — caches whose names do not start with `vku-survey-v1` are deleted. `clients.claim()` takes control of open tabs.
4. **Fetch** — GET requests are routed to one of five strategies (below). POST sync is never intercepted for caching.

Background Sync (`sync` event, tag `sync-surveys`) posts `SYNC_SURVEYS` to clients. Push handlers are stubbed for the *Engaging* criterion (a real push key is not bundled).

## 5. Five caching strategies

| Strategy | Route | Behaviour |
|----------|-------|-----------|
| Cache-First | navigations, `.js`, `.css`, `.svg`, `.html` | Cache hit returns immediately; miss fetches and stores. |
| Network-First | `/api/*` | Try network; on failure return cached JSON or `503 { offline: true }`. |
| Stale-While-Revalidate | `*.webmanifest`, `/version.json` | Instant stale body; background refresh. |
| Cache-Only | `/offline.html` | Never hits the network. |
| Network-Only | `/auth/*` | Handler returns without `respondWith` — browser default, no cache. |

This matches the course model: shell is stale-safe; live data prefers the network; tokens must not be cached.

## 6. IndexedDB schema

- **Database:** `vku-field-survey` (version 1)
- **Store:** `surveys`, `keyPath: id`
- **Indexes:** `status`, `createdAt`

Record fields: facility, building, inspector, date, category, condition, notes, optional `photoDataUrl`, `gpsLat` / `gpsLng`, `status` (`draft` unused in UI, `queued`, `synced`), timestamps.

Offline submit → `status: queued` + badge increment + optional notification.  
`window` `online` event or **Sync queue** → `syncAllQueued` then `markSurveySynced`.

## 7. Security and limits

- Service Workers **cannot** register on plain HTTP except localhost.
- Camera / GPS require user permission; both are optional so a form still saves if denied.
- This demo does not persist auth tokens. Hardware such as BLE/NFC is out of scope (native advantage in the comparison table).

## 8. Build, test, deploy

```bash
npm install
npm run typecheck
npm run build
npm run preview     # test SW locally
npm run deploy      # Cloudflare Workers, HTTPS
```

**Offline test:** Chrome DevTools → Application → Service Workers (ensure activated) → Network → Offline → submit a form → confirm IndexedDB row in Application → IndexedDB. Restore network and confirm status becomes `synced`.

## 9. Conclusion

VKU Field Survey is a small PWA that still exercises the full course stack: manifest installability, five Cache API strategies, IndexedDB as the system of record, and HTTPS delivery. It is appropriate as Mini-Project 1: a field form that remains usable when the campus network does not.
