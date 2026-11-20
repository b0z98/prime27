/* PRIME27 — mise en cache pour un usage hors ligne (version hébergée uniquement). */
var CACHE = 'prime27-v7';
var FILES = ['./', 'index.html', 'css/app.css', 'js/figure.js', 'js/exercises.js', 'js/programs.js', 'js/app.js', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png', 'manifest.webmanifest'];
// seuls l'appli, ses polices et la bibliothèque Firebase sont mis en cache, jamais les échanges avec le compte en ligne
var ALLOWED = ['fonts.googleapis.com', 'fonts.gstatic.com', 'www.gstatic.com'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// réseau d'abord (pour recevoir les nouvelles séances), cache en secours
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var u = new URL(e.request.url);
  if (u.origin !== self.location.origin && ALLOWED.indexOf(u.hostname) < 0) return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone();
    caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () { return caches.match(e.request); }));
});
