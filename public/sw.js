// public/sw.js  —  Math7-9 Service Worker
// Strategy:
//   • App shell (HTML / JS / CSS / icons) → Cache-first, update in background
//   • API calls (Volcano Engine / Ark) → Network-only (never cache AI responses)

const CACHE_NAME = 'math79-v1';
const PRECACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ── Install: pre-cache the app shell ──────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ── Activate: delete old caches ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first for static assets, network-only for API ───────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept AI API calls or cross-origin requests
  if (
    url.hostname.includes('ark.cn-beijing') ||
    url.hostname.includes('volcengine') ||
    url.hostname.includes('anthropic') ||
    url.origin !== self.location.origin
  ) {
    return; // let browser handle normally
  }

  // For navigation requests return cached index.html (SPA fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }

  // Cache-first for everything else (JS, CSS, fonts, icons)
  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return resp;
      });
      return cached || network;
    })
  );
});
