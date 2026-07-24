const CACHE_NAME = 'majster-cache-v5';
const APP_URL = './index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(['./', APP_URL]))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first: appka sa vždy otvorí okamžite z uloženej verzie (rýchlo aj bez
// signálu). Na pozadí si potichu skúsi stiahnuť novšiu verziu pre nabudúce,
// bez toho aby čakala na pomalú/slabú sieť pri samotnom otváraní appky.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const backgroundUpdate = fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
        .catch(() => cached);
      return cached || backgroundUpdate;
    })
  );
});
