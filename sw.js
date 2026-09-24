/* paste.lucafchala.com service worker.
   - pastes.json and page navigations: network first, so an edit made in the
     dash shows up on the next visit; the cached copy is only an offline
     fallback.
   - Static assets (css/js/fonts/icon): stale-while-revalidate.
   Redirected, opaque or non-2xx responses are never cached. */
const CACHE = 'paste-v5';
const PRECACHE = [
    '/', '/paste.css', '/paste.js', '/list.js', '/theme.js', '/icon.svg',
    '/fonts/cormorant-garamond-latin.woff2', '/fonts/cormorant-garamond-italic-latin.woff2', '/fonts/jetbrains-mono-latin.woff2',
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

const cacheable = res => res && res.ok && res.type === 'basic' && !res.redirected;

function networkFirst(req) {
    return fetch(req).then(res => {
        if (cacheable(res)) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
    }).catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('/') : undefined)).then(hit => hit || Response.error()));
}

function staleWhileRevalidate(req) {
    return caches.open(CACHE).then(cache => cache.match(req).then(cached => {
        const fresh = fetch(req).then(res => { if (cacheable(res)) cache.put(req, res.clone()); return res; }).catch(() => cached || Response.error());
        return cached || fresh;
    }));
}

self.addEventListener('fetch', e => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;
    if (req.mode === 'navigate' || url.pathname === '/pastes.json') { e.respondWith(networkFirst(req)); return; }
    e.respondWith(staleWhileRevalidate(req));
});
