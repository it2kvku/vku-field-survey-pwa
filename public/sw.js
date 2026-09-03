/**
 * VKU Field Survey — Service Worker
 *
 * Lifecycle:
 *   Register (main.tsx) → Install (pre-cache app shell) → Activate (purge old caches) → Fetch (strategies)
 *
 * Caching strategies used:
 *   - Cache-First:     App shell (HTML, CSS, JS, icons)
 *   - Network-First:   /api/* live sync endpoints
 *   - Stale-While-Revalidate: manifest & version checks
 *   - Cache-Only:      offline fallback page
 *   - Network-Only:    auth / transactional (not implemented — pass-through)
 */

const CACHE_VERSION = 'vku-survey-v7'
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`

const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/icon-192.svg',
  '/icon-512.svg',
  '/version.json'
]

// ─── Install: pre-cache app shell ───────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// ─── Activate: remove deprecated cache versions ───────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ─── Strategy helpers ─────────────────────────────────────────────────────────

/** Cache-First — app shell assets */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(APP_SHELL_CACHE)
    cache.put(request, response.clone())
  }
  return response
}

/** Network-First — live API data with offline fallback */
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response(JSON.stringify({ offline: true, error: 'Network unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

/** Stale-While-Revalidate — return cache instantly, update in background */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  const cached = await cache.match(request)

  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => null)

  return cached ?? networkFetch ?? caches.match('/')
}

/** Cache-Only — restricted to pre-cached offline assets */
async function cacheOnly(request) {
  const cached = await caches.match(request)
  return cached ?? new Response('Offline asset not found', { status: 404 })
}

// ─── Fetch: route requests to the right strategy ──────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (!url.protocol.startsWith('http')) return

  // Network-Only: skip caching for auth-like paths
  if (url.pathname.startsWith('/auth/')) return

  // Network-First: API sync endpoints
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
    return
  }

  // Stale-While-Revalidate: manifest & version metadata
  if (url.pathname.endsWith('.webmanifest') || url.pathname === '/version.json') {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  // Cache-Only: explicit offline fallback
  if (url.pathname === '/offline.html') {
    event.respondWith(cacheOnly(request))
    return
  }

  // Cache-First: app shell (HTML, JS, CSS, icons, SPA navigation)
  if (
    request.mode === 'navigate' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/'
  ) {
    event.respondWith(
      cacheFirst(request).catch(() => caches.match('/') ?? cacheOnly(request))
    )
    return
  }

  // Default: stale-while-revalidate for everything else
  event.respondWith(staleWhileRevalidate(request))
})

// ─── Background sync placeholder (for queued survey submissions) ──────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-surveys') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'SYNC_SURVEYS' }))
      })
    )
  }
})

// ─── Push notifications (Engaging PWA criterion) ─────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {
    title: 'VKU Field Survey',
    body: 'You have pending inspections to sync.'
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      tag: 'vku-survey-sync'
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(self.clients.openWindow('/'))
})
