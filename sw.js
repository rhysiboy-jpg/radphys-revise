// Offline support: saves a copy of every file, and serves the saved copies when there's no connection.
// Change VERSION to force every device to drop its old copies.
const VERSION = "radphys-revise-v53";
// The app itself: every page, script and diagram. tools/validate.mjs checks nothing is missing from this list.
const CORE = [
  "./", "index.html", "css/app.css", "css/fonts.css", "fonts/figtree-latin.woff2", "fonts/figtree-latin-ext.woff2",
  "fonts/noto-sans-latin.woff2", "fonts/noto-sans-latin-ext.woff2", "fonts/noto-sans-greek.woff2", "manifest.webmanifest", "icons/icon.svg", "js/app.js", "js/config.js", "js/content.js",
  "js/csv.js", "js/quiz.js", "js/store.js", "js/diagrams/util.js", "js/diagrams/atom.js", "js/diagrams/tube.js",
  "js/diagrams/spectrum.js", "js/diagrams/bohr.js", "js/diagrams/target.js", "js/diagrams/pecompton.js", "js/diagrams/xcom.js",
  "js/figures.js", "js/lessons.js", "js/critique.js", "js/diagrams/isl.js", "js/diagrams/limb.js", "js/diagrams/console.js",
  "js/diagrams/windowing.js", "js/diagrams/dose.js", "js/diagrams/sorter.js", "js/diagrams/cell.js",
  "js/diagrams/doseresponse.js", "js/diagrams/population.js", "js/diagrams/tissues.js", "js/diagrams/justify.js",
  "js/diagrams/dosechoices.js", "js/diagrams/halflife.js", "js/diagrams/decay.js", "js/diagrams/transformer.js",
  "js/diagrams/rectification.js", "js/diagrams/detectors.js", "js/diagrams/geometry.js", "js/diagrams/qa.js",
  "js/diagrams/lifecycle.js", "js/diagrams/qasort.js", "js/diagrams/nuclides.js", "js/diagrams/consent.js",
  "js/diagrams/areas.js", "js/diagrams/dutyholders.js", "js/diagrams/regulations.js", "js/diagrams/dosimeters.js",
  "js/diagrams/gasdetector.js", "js/diagrams/dap.js", "js/diagrams/aec.js", "js/diagrams/noise.js", "js/diagrams/processing.js",
  "js/diagrams/digitise.js", "js/diagrams/xcircuit.js", "js/diagrams/ohm.js", "js/diagrams/conductors.js",
  "js/diagrams/emspectrum.js", "js/diagrams/energy.js", "js/diagrams/sortkit.js", "content/topics.json", "content/calculations.js",
];

// The content (question spreadsheets and lessons) is read from topics.json, so a new topic file is saved for offline use
// without anyone having to list it here.
async function contentFiles() {
  try {
    const topics = await (await fetch("content/topics.json", { cache: "no-cache" })).json();
    return topics.flatMap(t => [...(t.files || []), ...(t.lessons ? [t.lessons] : [])]);
  } catch { return []; }
}

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(CORE);
    await cache.addAll(await contentFiles());
    await self.skipWaiting();
  })());
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
