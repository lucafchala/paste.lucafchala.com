const CACHE = 'paste-v2';
const PRECACHE = ['/', '/index.html', '/icon.svg'];

function normalizeUrl(url) {
    const u = new URL(url);
    if (u.pathname !== '/' && u.pathname.endsWith('/')) {
        u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
}

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    const key = normalizeUrl(e.request.url);
    e.respondWith(
        caches.open(CACHE).then(cache =>
            cache.match(key).then(cached => {
                const fresh = fetch(e.request).then(res => {
                    if (res.ok && res.type !== 'opaqueredirect') cache.put(key, res.clone());
                    return res;
                }).catch(() => cached);
                return cached || fresh;
            })
        )
    );
});
