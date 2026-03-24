const CACHE_NAME = 'pro-pong-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/graphics.js',
  './js/physics.js',
  './js/ui.js',
  './js/audio.js',
  './js/data.js',
  './manifest.json',
  'https://unpkg.com/three@0.128.0/build/three.module.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force activation
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
             console.log('Clearing old cache:', key);
             return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});