// Minimaler Service Worker — nur damit Chrome die App als installierbare PWA erkennt.
// Kein Caching: Anfragen gehen direkt durchs Netzwerk (immer aktuelle Version).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
