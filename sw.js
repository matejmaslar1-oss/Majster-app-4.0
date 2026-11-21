const CACHE_NAME = 'majster-cache-v67';
const APP_URL = './index.html';
const NETWORK_TIMEOUT_MS = 3000;

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

// Najprv sieť (vždy čerstvá verzia), ale ak neodpovie do 3 s alebo si offline,
// použije sa uložená kópia - appka sa tak nezasekne pri slabom signáli.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const req = event.request;
  const net = fetch(req).then((response) => {
    if (response && response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
    }
    return response;
  });
  net.catch(() => {});
  event.waitUntil(net.catch(() => {}));
  event.respondWith((async () => {
    try {
      return await Promise.race([
        net,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT_MS)),
      ]);
    } catch (e) {
      const cached = await caches.match(req);
      if (cached) return cached;
      return net;
    }
  })());
});
