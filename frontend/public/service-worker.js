// Deliberately does NOTHING but pass every request straight through to the
// network - no cache.put, no cache.match, ever. Its only purpose is
// satisfying Chrome's installability requirement for beforeinstallprompt to
// fire (a registered service worker with a fetch handler), which is what
// actually lets the "התקנת האפליקציה" button in InstallApp.jsx do a real
// one-tap install on Android instead of falling back to manual instructions.
//
// This project fixed a real "stuck on a stale deploy" bug caused by missing
// HTTP cache headers (see nginx.conf/Caddyfile, 2026-09-08/09) - a caching
// service worker would risk reintroducing exactly that class of bug at a
// layer even harder to reason about than plain HTTP caching. Precisely
// because this one never caches anything, every request it handles behaves
// identically to there being no service worker at all - it cannot make any
// page look stale.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Navigation requests (a real page load/reload, or launching the
  // installed PWA icon) carry request.mode === 'navigate'. Re-fetching such
  // a request via fetch(event.request) is spec-disallowed - Chrome quietly
  // tolerates it, but Safari/WebKit enforces the spec and throws, which
  // broke the entire page load on iPhone (both plain Safari and the
  // installed app - 2026-09-13/14, reported via Keren's iPhone). Since this
  // worker never caches anything anyway, there's nothing gained by
  // intercepting navigations - skip respondWith and let the browser fetch
  // them itself, exactly as if there were no service worker for this
  // request at all.
  if (event.request.mode === 'navigate') {
    return;
  }
  event.respondWith(fetch(event.request));
});
