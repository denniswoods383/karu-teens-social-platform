const CACHE_NAME = 'karu-teens-v1';
const urlsToCache = [
  '/',
  '/feed',
  '/messages',
  '/comrades',
  '/marketplace',
  '/stories',
  '/offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/ui/karu_logo.png',
    badge: '/ui/karu_logo.png'
  };
  
  event.waitUntil(
    self.registration.showNotification('Karu Teens', options)
  );
});