/* Service worker for UG-Chinese Teaching Command Centre PWA.
   Provides offline caching of the app shell so the installed app launches without network,
   and enables the install prompt. Notifications are fired from the page via the Notification API. */
const CACHE = 'tcc-shell-v1';
const SHELL = [
  '.',
  'most updated 2.html',
  'pwa-icon-192.png',
  'pwa-icon-512.png'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL).catch(function(){}); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  // Network-first for navigation, cache fallback when offline
  if(e.request.mode === 'navigate'){
    e.respondWith(fetch(e.request).catch(function(){ return caches.match('most updated 2.html'); }));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(function(resp){
        var copy = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy).catch(function(){}); });
        return resp;
      }).catch(function(){ return hit; });
    })
  );
});
