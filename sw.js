// QR Magic Service Worker v1
const CACHE = 'qrmagic-v1';
const ASSETS = [
  '/', '/index.html', '/landing.html', '/dashboard.html',
  '/create.html', '/codes.html', '/analytics.html',
  '/settings.html', '/step1-auth.html', '/legal.html',
  '/styles.css', '/manifest.json', '/mascot.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network first for API calls, cache first for assets
  if(e.request.url.includes('supabase.co') || e.request.url.includes('unpkg') || e.request.url.includes('cdnjs')) {
    return; // let external requests pass through
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        if(res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
