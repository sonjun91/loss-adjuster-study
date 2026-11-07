const CACHE_NAME = "loss-adjuster-study-3f80a2e8d62f";
const APP_FILES = ["./index.html", "./manifest.webmanifest", "./app-icon.svg", "./app-icon-192.png", "./app-icon-512.png"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("loss-adjuster-study-") && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy)));
        return response;
      }
      return caches.match("./index.html").then(cached => cached || response);
    }).catch(() => caches.match("./index.html")));
    return;
  }
  const asset = APP_FILES.find(path => new URL(path, self.location.href).href === event.request.url);
  if (asset) event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
