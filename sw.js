// Offline support: saves a copy of every file, and serves the saved copies when there's no connection.
// Change VERSION to force every device to drop its old copies.
const VERSION = "radphys-revise-v21";
const CORE = [
  "./", "index.html", "css/app.css", "manifest.webmanifest", "icons/icon.svg",
  "js/app.js", "js/config.js", "js/content.js", "js/csv.js", "js/quiz.js", "js/store.js",
  "js/diagrams/util.js", "js/diagrams/atom.js", "js/diagrams/tube.js", "js/diagrams/spectrum.js",
  "js/diagrams/bohr.js", "js/diagrams/target.js", "js/diagrams/pecompton.js", "js/diagrams/isl.js", "js/diagrams/limb.js", "js/diagrams/console.js", "js/diagrams/windowing.js", "js/diagrams/dose.js", "js/diagrams/sorter.js", "js/diagrams/halflife.js", "js/diagrams/decay.js", "js/diagrams/transformer.js", "js/diagrams/rectification.js",
  "content/topics.json", "content/calculations.js", "content/01-atomic-structure.csv", "content/02-electricity-circuits.csv", "content/03-x-ray-production.csv", "content/04-effects-of-radiation.csv", "content/05-interactions-with-matter.csv", "content/06-digital-image-formation.csv", "content/07-exposure-image-quality.csv", "content/08-dosimetry-dose-control.csv", "content/09-radiation-protection-legislation.csv", "content/10-radioactivity.csv", "content/11-qa-qc.csv",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Network first: online visitors always get the latest files (and the saved copies are refreshed);
// the saved copies are used only when the network fails.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(VERSION).then(cache =>
    fetch(e.request)
      .then(res => {
        if (res.ok || res.type === "opaque") cache.put(e.request, res.clone());
        return res;
      })
      .catch(async () => (await cache.match(e.request, { ignoreSearch: true })) || Response.error())
  ));
});
