self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
  );
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests to network directly without caching
  event.respondWith(fetch(event.request));
});
