// Explorer: image processing. The raw detector values depend on the exposure; histogram analysis finds the values of interest
// using the expected histogram for the selected body part, rescales them to a standard range, and a look-up table (LUT) gives the
// contrast for that body part. The model is deliberately simple: the expected histogram is reduced to "the anatomy lies between
// these two percentiles of the pixel values", which is enough to show why the right body part and good collimation matter.
// The percentiles and look-up tables are illustrative, not any manufacturer's.
// Convention as in the windowing explorer: higher exposure shows darker.
import { svgEl as el, keepInside } from "./util.js";
import { W, H, limb, grain } from "./limb.js";

const PARTS = {
  forearm: { name: "Forearm (correct)", lo: 0.5, hi: 92, gamma: 0.8,
    why: "The forearm model expects the anatomy in the lower part of the histogram, with a little unattenuated beam above it." },
  chest: { name: "Chest PA (wrong)", lo: 45, hi: 99.5, gamma: 1,
    why: "The chest model expects the lungs, the darkest part of a chest image, to be the main anatomy, so it treats the highest values as the region of interest." },
};
const EXPOSURES = { low: { name: "Half", e: 0.5 }, ok: { name: "Correct", e: 1 }, high: { name: "Double", e: 2 } };
const COLL = { x0: 30, x1: 330, y0: 52, y1: 188 };   // the collimated field
const CX0 = 50, CX1 = 620, CY0 = 30, CY1 = 124, BINS = 120, VLO = 0.02, VMAX = 3;
const frac = v => Math.max(0, Math.min(1, Math.log(Math.max(v, VLO) / VLO) / Math.log(VMAX / VLO)));   // a log scale, so a change of exposure slides the histogram
const cx = v => CX0 + frac(v) * (CX1 - CX0);

const MARKUP = `
<div class="grid">
  <div class="stage">
    <canvas class="xray" width="${W}" height="${H}" data-role="img"></canvas>
    <svg viewBox="0 0 640 156" role="img" aria-labelledby="pr-t pr-d">
      <title id="pr-t">Histogram of raw pixel values and the range chosen as the anatomy</title>
      <desc id="pr-d" data-role="desc"></desc>
      <rect class="win-band" data-role="band" y="${CY0}" height="${CY1 - CY0}"/>
      <g data-role="hist"></g>
      <g class="axis"><line x1="${CX0}" y1="${CY1}" x2="${CX1}" y2="${CY1}"/>
        <text class="ax-title" x="${(CX0 + CX1) / 2}" y="${CY1 + 22}" text-anchor="middle">Raw pixel value (log scale)</text>
        <text class="ax-title" x="20" y="${(CY0 + CY1) / 2}" text-anchor="middle" transform="rotate(-90 20 ${(CY0 + CY1) / 2})">Pixels</text></g>
      <text class="peak-t" data-role="band-t" y="18" text-anchor="middle">range treated as anatomy</text>
    </svg>
    <p class="scale-note">Simulated · cartoon limb, not a patient · illustrative: a simplified histogram analysis · shaded band: the values rescaled to fill the grey scale</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider"><div class="slider-top"><span class="label">Show</span></div>
        <div class="modes" role="group" aria-label="Show"><button type="button" data-view="raw">Raw data</button><button type="button" data-view="proc">Processed</button></div></div>
      <div class="slider"><div class="slider-top"><span class="label">Exposure (mAs)</span></div>
        <div class="modes" role="group" aria-label="Exposure">${Object.entries(EXPOSURES).map(([id, x]) => `<button type="button" data-exp="${id}">${x.name}</button>`).join("")}</div></div>
      <div class="slider"><div class="slider-top"><span class="label">Body part selected</span></div>
        <div class="modes" role="group" aria-label="Body part">${Object.entries(PARTS).map(([id, x]) => `<button type="button" data-part="${id}">${x.name}</button>`).join("")}</div></div>
      <div class="slider"><div class="slider-top"><span class="label">Collimation</span></div>
        <div class="modes" role="group" aria-label="Collimation"><button type="button" data-coll="1">Collimated</button><button type="button" data-coll="0">Open field</button></div></div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Brightness</span><b data-role="r-b"></b></div>
      <div class="readout"><span>Contrast in the anatomy</span><b data-role="r-c"></b></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const st = { view: "proc", exp: "ok", part: "forearm", coll: 1 };
  const ctx = $("img").getContext("2d"), pix = ctx.createImageData(W, H);
  const att = limb(), noise = grain(5);
  const inField = i => { const x = i % W, y = Math.floor(i / W); return x >= COLL.x0 && x < COLL.x1 && y >= COLL.y0 && y < COLL.y1; };
  const BONE = [], SOFT = [];   // sample pixels for the contrast readout
  att.forEach((w, i) => { if (inField(i)) { if (w >= 0.95) BONE.push(i); else if (w > 0.4 && w < 0.5) SOFT.push(i); } });
  let timer = null;

  function update() {
    const e = EXPOSURES[st.exp].e, P = PARTS[st.part];
    for (const [k, v] of Object.entries(st)) root.querySelectorAll(`[data-${k}]`).forEach(b => b.setAttribute("aria-pressed", b.dataset[k] === String(v)));
    // Raw values: transmitted exposure, with quantum noise that grows as the exposure falls. Outside the collimated field, nothing.
    const raw = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) {
      const out = st.coll && !inField(i);
      const m = out ? 0.02 * e : e * Math.exp(-2.6 * att[i]);
      raw[i] = Math.max(0, m + noise[i] * 0.025 * Math.sqrt(m));
    }
    // Histogram analysis: the anatomy range from the expected percentiles, using only the exposed field (systems find the edges).
    const vals = [];
    for (let i = 0; i < W * H; i++) if (!st.coll || inField(i)) vals.push(raw[i]);
    vals.sort((a, b) => a - b);
    const pct = p => vals[Math.min(vals.length - 1, Math.floor((p / 100) * vals.length))];
    const lo = pct(P.lo), hi = pct(P.hi) * 1.3;   // a little headroom above the expected top of the anatomy
    const lut = v => { const t = Math.max(0, Math.min(1, (v - lo) / (hi - lo))); return 1 - t ** (1 / P.gamma); };   // 1 white … 0 black
    const shade = st.view === "raw" ? v => 1 - Math.max(0, Math.min(1, v / 1.1)) : lut;   // raw: a fixed scale set for the correct exposure
    const d = pix.data;
    for (let i = 0; i < W * H; i++) {
      const g = Math.round(shade(raw[i]) * 255);
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = g; d[i * 4 + 3] = 255;
    }
    ctx.putImageData(pix, 0, 0);

    // Histogram of the raw values, with the band chosen as anatomy.
    const counts = new Array(BINS).fill(0);
    raw.forEach((v, i) => { if (!st.coll || inField(i)) counts[Math.min(BINS - 1, Math.floor(frac(v) * BINS))]++; });   // the unexposed border is left out, as the system does
    const top = Math.sqrt(Math.max(...counts)), bw = (CX1 - CX0) / BINS, g = $("hist");
    g.innerHTML = "";
    counts.forEach((n, i) => { const h = (Math.sqrt(n) / top) * (CY1 - CY0); if (h > 0.3) el("rect", { class: "hist-bar", x: (CX0 + i * bw).toFixed(1), y: (CY1 - h).toFixed(1), width: (bw - 0.5).toFixed(1), height: h.toFixed(1) }, g); });
    const bx0 = cx(lo), bx1 = cx(hi);
    $("band").setAttribute("x", bx0.toFixed(1)); $("band").setAttribute("width", Math.max(2, bx1 - bx0).toFixed(1));
    $("band").style.display = $("band-t").style.display = st.view === "proc" ? "" : "none";
    $("band-t").setAttribute("x", ((bx0 + bx1) / 2).toFixed(1));
    if (st.view === "proc") keepInside($("band-t"), 4, 636);

    // Readouts: mean shade of soft tissue for brightness; bone against soft tissue for contrast.
    const mean = ids => ids.reduce((s, i) => s + shade(raw[i]), 0) / ids.length;
    const soft = mean(SOFT), diff = mean(BONE) - soft;
    $("r-b").textContent = soft > 0.75 ? "Too light" : soft < 0.2 ? "Too dark" : "About right";
    $("r-c").textContent = diff > 0.4 ? "Good" : diff > 0.2 ? "Reduced" : "Poor";
    const s = st.view === "raw"
      ? `Raw data on a fixed scale. ${e === 1 ? "At the correct exposure it looks about right, but flat." : e < 1 ? "Half the exposure: the whole image is too light." : "Double the exposure: the whole image is too dark."} Processing will rescale it.`
      : `Processed with the ${P.name.split(" (")[0].toLowerCase()} model${st.coll ? "" : " and an open field"}. ` +
        (st.part === "chest" ? `${P.why} Bone and soft tissue fall below that range, so they all show almost white, with very little contrast.`
          : !st.coll ? "Lots of unattenuated beam around the limb pushes the top of the range up into the air values, so the anatomy is squeezed into a few shades of grey."
          : `The anatomy's values are rescaled to fill the grey scale, so the image looks the same at any exposure${e < 1 ? ", though the lower exposure leaves more noise" : ""}.`);
    $("img").setAttribute("aria-label", `Simulated limb image. ${s}`);
    $("desc").textContent = s;
    clearTimeout(timer);
    timer = setTimeout(() => { $("summary").textContent = s; }, 250);
  }

  for (const k of Object.keys(st)) root.querySelectorAll(`[data-${k}]`).forEach(b => b.addEventListener("click", () => {
    st[k] = k === "coll" ? +b.dataset[k] : b.dataset[k]; update();
  }));
  update();
  return () => clearTimeout(timer);
}
