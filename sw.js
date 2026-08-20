const CACHE_NAME = 'apexflow-pwa-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './js/tailwindcss.js',
  './js/supabase.js',
  './js/jspdf.umd.min.js',
  './js/qrcode.min.js'
];

// Install: Caches core local app shell strictly
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: Cleans up old cache versions
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Serve from cache, fallback to network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
