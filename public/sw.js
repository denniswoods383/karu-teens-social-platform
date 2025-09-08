const CACHE_NAME = 'karu-teens-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

const urlsToCache = [
  '/',
  '/feed',
  '/messages',
  '/comrades',
  '/marketplace',
  '/stories',
  '/offline.html',
  '/ui/karu_logo.png',
  '/manifest.json'
];

const staticAssets = [
  '/_next/static/css/',
  '/_next/static/js/',
  '/ui/',
  '/assets/'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Cache static assets
  if (staticAssets.some(path => url.pathname.startsWith(path))) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache => {
        return cache.match(request).then(response => {
          if (response) return response;
          return fetch(request).then(fetchResponse => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }
  
  // Network first for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }
  
  // Cache first for other requests
  event.respondWith(
    caches.match(request).then(response => {
      if (response) return response;
      return fetch(request).then(fetchResponse => {
        if (fetchResponse.status === 200) {
          const responseClone = fetchResponse.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return fetchResponse;
      }).catch(() => {
        if (request.destination === 'document') {
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