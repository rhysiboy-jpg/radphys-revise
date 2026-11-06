// Explorer: window level and width. The cartoon limb as 12-bit pixel values, its histogram, and the look-up table (LUT)
// that turns pixel values into shades of grey. Moving the window changes only the display, never the stored data.
// Convention, as in the lecture (Formation of an Image, slide 37): the pixel value follows the exposure reaching the detector,
// so air is high and bone low, higher values show darker, and raising the window level makes the image brighter.
import { svgEl as el } from "./util.js";
import { W, H, limb, grain, blur, MATERIAL } from "./limb.js";

const MAX = 4095, BINS = 128;
const pv = w => 3900 - 3150 * w;                          // attenuation (0 air … 1 cortex) to pixel value
const TISSUES = [                                          // named for the readouts, from least to most exposure
  { name: "cortical bone", v: pv(MATERIAL.cortex) },
  { name: "marrow spots", v: pv(MATERIAL.spot) },
  { name: "bone marrow", v: pv(MATERIAL.marrow) },
  { name: "muscle", v: pv(MATERIAL.muscle) },
  { name: "fat", v: pv(MATERIAL.fat) },
  { name: "air", v: pv(MATERIAL.air) },
];
const PRESETS = {
  full: { name: "Full range", wl: 2048, ww: 4096 },
  bone: { name: "Bone", wl: 1400, ww: 1500 },
  soft: { name: "Soft tissue", wl: 2640, ww: 500 },
};

// Chart geometry: histogram on top, the LUT's grey strip below it, pixel value along the bottom.
const CX0 = 56, CX1 = 616, CY0 = 18, CY1 = 150, STRIP = 14;
const cx = v => CX0 + (v / MAX) * (CX1 - CX0);

const MARKUP = `
<div class="grid">
  <div class="stage">
    <canvas class="xray" width="${W}" height="${H}" role="img" tabindex="0" data-role="img"></canvas>
    <svg viewBox="0 0 640 238" role="img" aria-labelledby="win-t win-d">
      <title id="win-t">Histogram of pixel values with the window and look-up table</title>
      <desc id="win-d" data-role="desc"></desc>
      <g data-role="hist"></g>
      <rect class="win-band" data-role="band" y="${CY0}" height="${CY1 - CY0}"/>
      <g data-role="strip" shape-rendering="crispEdges"></g>
      <polyline class="lut" data-role="lut"/>
      <g class="axis" data-role="axis"></g>
      <g data-role="peaks"></g>
    </svg>
    <p class="legend"><span><i class="lut-key"></i>look-up table: the shade shown for each pixel value (higher = whiter)</span><span><i class="band-key"></i>the window</span></p>
    <p class="scale-note">Simulated image · cartoon limb, not a real patient · 12-bit pixel values (0–4095) · tap the image to read a pixel, or select it and use the arrow keys</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><label for="win-wl">Window level</label><output for="win-wl" data-role="wl-o"></output></div>
        <input type="range" id="win-wl" min="0" max="4096" step="2">
        <small>The centre of the window: sets brightness.</small>
      </div>
      <div class="slider">
        <div class="slider-top"><label for="win-ww">Window width</label><output for="win-ww" data-role="ww-o"></output></div>
        <input type="range" id="win-ww" min="50" max="4096" step="2">
        <small>The range of pixel values spread across black to white: sets contrast.</small>
      </div>
      <div class="slider">
        <div class="slider-top"><span class="label">Presets</span></div>
        <div class="modes" role="group" aria-label="Window presets">
          ${Object.entries(PRESETS).map(([id, p]) => `<button type="button" data-preset="${id}">${p.name}</button>`).join("")}
        </div>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Shown white</span><b data-role="r-white"></b><span data-role="r-white-s"></span></div>
      <div class="readout"><span>Shown black</span><b data-role="r-black"></b><span data-role="r-black-s"></span></div>
      <div class="readout"><span>In the window</span><b data-role="r-in"></b></div>
      <div class="readout"><span>Pixel values per grey shade</span><b data-role="r-step"></b><span>256 shades of grey</span></div>
      <div class="readout"><span>Tapped pixel</span><b data-role="r-pick">–</b><span data-role="r-pick-s" aria-live="polite">tap the image, or use the arrow keys</span></div>
      <div class="readout"><span>Stored data</span><b>Unchanged</b><span>windowing alters only the display</span></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
    <div class="try">
      <h3>Try this</h3>
      <ol>
        <li><b>Raise the window level.</b> The image gets brighter: more pixel values now sit below the window and show white.</li>
        <li><b>Narrow the window width.</b> Contrast rises, and anything outside the window clips to plain white or black.</li>
        <li><b>Choose Soft tissue.</b> The fat layer under the skin appears, while the bone turns plain white.</li>
        <li><b>Choose Bone.</b> The marrow spots and the crack stand out, while soft tissue goes dark.</li>
        <li><b>Watch the histogram.</b> It never changes: windowing alters the look-up table, not the data.</li>
      </ol>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const wlIn = root.querySelector("#win-wl"), wwIn = root.querySelector("#win-ww");
  const canvas = $("img"), ctx = canvas.getContext("2d"), pixels = ctx.createImageData(W, H);
  let summaryTimer = null;

  // The stored image: pixel values with a little quantum noise, rounded to whole 12-bit values.
  const map = blur(limb(), 1), noise = grain(7);   // a slight blur, as any detector has, so edges are not stepped
  const data = Uint16Array.from(map, (w, i) => Math.max(0, Math.min(MAX, Math.round(pv(w) + 35 * noise[i]))));

  // Histogram, drawn once: windowing never changes it. Square-root heights so the small bone peaks still show beside air.
  const counts = new Array(BINS).fill(0);
  data.forEach(v => { counts[Math.min(BINS - 1, Math.floor((v / (MAX + 1)) * BINS))]++; });
  const top = Math.sqrt(Math.max(...counts)), bw = (CX1 - CX0) / BINS;
  counts.forEach((n, i) => {
    const h = (Math.sqrt(n) / top) * (CY1 - CY0);
    if (h > 0.2) el("rect", { class: "hist-bar", x: (CX0 + i * bw).toFixed(1), y: (CY1 - h).toFixed(1), width: (bw - 0.6).toFixed(1), height: h.toFixed(1) }, $("hist"));
  });
  [["bone", (pv(MATERIAL.cortex) + pv(MATERIAL.marrow)) / 2], ["soft tissue", (pv(MATERIAL.fat) + pv(MATERIAL.muscle)) / 2], ["air", pv(MATERIAL.air)]]
    .forEach(([name, v]) => { el("text", { class: "peak-t", x: cx(v), y: CY0 - 4, "text-anchor": "middle" }, $("peaks")).textContent = name; });
  // Axis: pixel value along the bottom, under the grey strip.
  const axis = $("axis"), sy = CY1 + 6 + STRIP;
  el("line", { x1: CX0, y1: CY1, x2: CX1, y2: CY1 }, axis);
  [0, 1024, 2048, 3072, 4095].forEach(v => {
    el("line", { x1: cx(v), y1: sy, x2: cx(v), y2: sy + 5 }, axis);
    el("text", { ...(v % 2048 && v !== 4095 ? { class: "wide-only" } : {}), x: cx(v), y: sy + 20, "text-anchor": "middle" }, axis).textContent = v;   // a phone shows 0, 2048 and 4095
  });
  el("text", { class: "ax-title", x: (CX0 + CX1) / 2, y: sy + 48, "text-anchor": "middle" }, axis).textContent = "Pixel value (exposure at the detector)";
  el("text", { class: "ax-title", x: 14, y: (CY0 + CY1) / 2, "text-anchor": "middle", transform: `rotate(-90 14 ${(CY0 + CY1) / 2})` }, axis).textContent = "Pixels";
  // The grey strip: what shade each pixel value is shown as. Rebuilt with the window.
  const STEPS = 112, strip = $("strip"), cells = Array.from({ length: STEPS }, (_, i) =>
    el("rect", { x: (CX0 + (i * (CX1 - CX0)) / STEPS).toFixed(1), y: CY1 + 6, width: ((CX1 - CX0) / STEPS + 0.6).toFixed(1), height: STRIP }, strip));
  el("rect", { class: "strip-edge", x: CX0, y: CY1 + 6, width: CX1 - CX0, height: STRIP }, strip);

  const grey = (v, wl, ww) => 1 - Math.max(0, Math.min(1, (v - (wl - ww / 2)) / ww));   // 1 white … 0 black
  const name = v => TISSUES.reduce((a, b) => (Math.abs(b.v - v) < Math.abs(a.v - v) ? b : a)).name;
  const clampV = v => Math.max(0, Math.min(MAX, Math.round(v)));

  function update() {
    const wl = +wlIn.value, ww = +wwIn.value, lo = wl - ww / 2, hi = wl + ww / 2;
    $("wl-o").textContent = wl;
    $("ww-o").textContent = ww;
    root.querySelectorAll("[data-preset]").forEach(b => { const p = PRESETS[b.dataset.preset]; b.setAttribute("aria-pressed", p.wl === wl && p.ww === ww); });

    const d = pixels.data;
    for (let i = 0; i < W * H; i++) {
      const g = Math.round(grey(data[i], wl, ww) * 255);
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = g; d[i * 4 + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
    if (cursor) mark();

    $("band").setAttribute("x", cx(Math.max(0, lo)));
    $("band").setAttribute("width", Math.max(1, cx(Math.min(MAX, hi)) - cx(Math.max(0, lo))));
    cells.forEach((c, i) => { const g = Math.round(grey(((i + 0.5) / STEPS) * MAX, wl, ww) * 255); c.setAttribute("fill", `rgb(${g},${g},${g})`); });
    // The LUT line: high on the chart where the shade is white, low where it is black.
    const ly = g => CY1 - g * (CY1 - CY0);
    const pts = [[0, grey(0, wl, ww)], [Math.max(0, lo), grey(Math.max(0, lo), wl, ww)], [Math.min(MAX, hi), grey(Math.min(MAX, hi), wl, ww)], [MAX, grey(MAX, wl, ww)]];
    $("lut").setAttribute("points", pts.map(([v, g]) => `${cx(v).toFixed(1)},${ly(g).toFixed(1)}`).join(" "));

    const below = TISSUES.filter(t => t.v < lo).map(t => t.name), above = TISSUES.filter(t => t.v > hi).map(t => t.name), inside = TISSUES.filter(t => t.v >= lo && t.v <= hi).map(t => t.name);
    const list = a => !a.length ? "nothing" : a.length === 1 ? a[0] : `${a.slice(0, -1).join(", ")} and ${a.at(-1)}`;
    $("r-white").textContent = lo > 0 ? `Below ${clampV(lo)}` : "Nothing";
    $("r-white-s").textContent = list(below);
    $("r-black").textContent = hi < MAX ? `Above ${clampV(hi)}` : "Nothing";
    $("r-black-s").textContent = list(above);
    $("r-in").textContent = inside.length ? list(inside) : "No tissue";
    $("r-step").textContent = +(ww / 256).toFixed(1);

    const sentence = `Window level ${wl}, width ${ww}: pixel values from ${clampV(lo)} to ${clampV(hi)} are spread from white to black. ` +
      (inside.length ? `Differences within ${list(inside)} are visible. ` : "No tissue falls inside the window. ") +
      (below.length ? `${list(below)[0].toUpperCase()}${list(below).slice(1)} show${below.length === 1 ? "s" : ""} plain white. ` : "") +
      (above.length ? `${list(above)[0].toUpperCase()}${list(above).slice(1)} show${above.length === 1 ? "s" : ""} plain black.` : "");
    canvas.setAttribute("aria-label", `Simulated image of a cartoon limb. ${sentence}`);
    $("desc").textContent = `Histogram with peaks for bone, soft tissue and air. ${sentence}`;
    clearTimeout(summaryTimer);
    summaryTimer = setTimeout(() => { $("summary").textContent = sentence; }, 250);
  }

  // Reading a pixel: by tapping, or (WCAG 2.1.1) by selecting the image and moving a marker with the arrow keys.
  let cursor = null;
  function mark() {
    const [x, y] = cursor;
    ctx.strokeStyle = getComputedStyle(root).getPropertyValue("--dg-accent").trim() || "#0B6A88";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 5, y - 5, 11, 11);
  }
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    readAt(Math.floor(((e.clientX - r.left) / r.width) * W), Math.floor(((e.clientY - r.top) / r.height) * H));
  }
  function readAt(x, y) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    cursor = [x, y];
    update();
    const v = data[y * W + x], wl = +wlIn.value, ww = +wwIn.value, g = grey(v, wl, ww);
    $("r-pick").textContent = v;
    $("r-pick-s").textContent = `${name(v)}, shown ${g >= 1 ? "white" : g <= 0 ? "black" : g < 1 / 3 ? "dark grey" : g < 2 / 3 ? "mid grey" : "light grey"}`;
  }

  const setWindow = (wl, ww) => { wlIn.value = wl; wwIn.value = ww; update(); };
  wlIn.addEventListener("input", update);
  wwIn.addEventListener("input", update);
  root.querySelectorAll("[data-preset]").forEach(b => b.addEventListener("click", () => { const p = PRESETS[b.dataset.preset]; setWindow(p.wl, p.ww); }));
  canvas.addEventListener("click", pick);
  canvas.addEventListener("keydown", e => {
    const step = e.shiftKey ? 20 : 4, [x, y] = cursor || [W / 2, H / 2];
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (!moves[e.key]) return;
    e.preventDefault();
    readAt(Math.max(0, Math.min(W - 1, x + moves[e.key][0])), Math.max(0, Math.min(H - 1, y + moves[e.key][1])));
  });
  setWindow(PRESETS.full.wl, PRESETS.full.ww);
  return () => clearTimeout(summaryTimer);
}
