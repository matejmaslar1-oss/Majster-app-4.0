const CACHE_NAME = 'majster-cache-v77';
const APP_URL = './index.html';

// Pri inštalácii nové verzie stiahni appku vždy čerstvo zo servera (nie z HTTP cache prehliadača).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => fetch(new Request(APP_URL, { cache: 'reload' })).then((r) => (r && r.ok ? cache.put(APP_URL, r) : null)))
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

// Appka sa otvára OKAMŽITE z uloženej kópie (funguje aj bez internetu a pri slabom signáli).
// Na pozadí sa potichu skontroluje, či na serveri nie je novšia verzia, a uloží sa na ďalšie otvorenie.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // Len vlastné súbory appky - cudzie požiadavky (napr. cloud záloha) sa nikdy neukladajú do cache
  if (new URL(req.url).origin !== self.location.origin) return;
  const isNav = req.mode === 'navigate';
  const key = isNav ? APP_URL : req;
  const netReq = isNav ? new Request(APP_URL, { cache: 'no-cache' }) : new Request(req, { cache: 'no-cache' });
  const update = fetch(netReq).then(async (resp) => {
    if (resp && resp.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(key, resp.clone());
    }
    return resp;
  });
  update.catch(() => {});
  event.waitUntil(update.catch(() => {}));
  event.respondWith((async () => {
    const cached = await caches.match(key, { cacheName: CACHE_NAME, ignoreSearch: true });
    if (cached) return cached;
    try {
      const resp = await update;
      if (resp) return resp;
    } catch (e) { /* offline a nič v cache */ }
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
