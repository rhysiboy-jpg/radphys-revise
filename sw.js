// Offline support: serves saved copies when there's no connection, and refreshes them in the background when there is.
// Change VERSION to force every device to drop its old copies.
const VERSION = "radphys-revise-v1";
const CORE = [
  "./", "index.html", "css/app.css", "manifest.webmanifest", "icons/icon.svg",
  "js/app.js", "js/config.js", "js/content.js", "js/csv.js", "js/quiz.js", "js/store.js",
  "js/diagrams/util.js", "js/diagrams/tube.js", "js/diagrams/spectrum.js",
  "content/topics.json", "content/calculations.js", "content/01-atomic-structure.csv",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const saved = await cache.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request).then(res => {
      if (res.ok || res.type === "opaque") cache.put(e.request, res.clone());
      return res;
    }).catch(() => saved);
    return saved || fresh;
  }));
});
