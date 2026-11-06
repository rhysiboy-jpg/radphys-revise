// Explorer: the inverse square law. Move the detector; the same photons spread over a larger area, so intensity falls with distance².
import { svgEl as el, motionPaused } from "./util.js";

const DMIN = 50, DMAX = 300, GRID = 12, PHOTONS = GRID * GRID;
const SX0 = 44, SX1 = 400, SY = 176;                       // side view: source at SX0, distances up to DMAX at SX1
const sx = d => SX0 + (d / DMAX) * (SX1 - SX0);
const half = d => (sx(d) - SX0) * 0.36;                   // half-height of the beam at distance d
const FX = 530, FY = 176, FMAX = 96;                        // front view: centre and half-size of the beam at DMAX
const fside = d => (FMAX * d) / DMAX;                       // half-size of the beam square at distance d
const PATCH = fside(100);                                   // a fixed patch, the beam's size at 100 cm
const WORDS = { 2: "twice", 3: "three times", 4: "four times", 5: "five times", 6: "six times" };

// Photon positions on a regular 12 × 12 grid inside a unit square, so the count in the patch is exact at 2, 3, 4 and 6 times the distance.
const SPOTS = Array.from({ length: PHOTONS }, (_, i) => [((i % GRID) + 0.5) / GRID * 2 - 1, (Math.floor(i / GRID) + 0.5) / GRID * 2 - 1]);

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 650 360" role="img" aria-labelledby="isl-title isl-desc">
      <title id="isl-title">Inverse square law: a beam spreading with distance</title>
      <desc id="isl-desc" data-role="desc"></desc>
      <text class="pane-t" x="${(SX0 + SX1) / 2}" y="26">Side view</text>
      <text class="pane-t" x="${FX}" y="26">Front view<tspan class="wide-only"> at the detector</tspan></text>
      <g data-role="side"></g>
      <g data-role="front"></g>
    </svg>
    <p class="scale-note">Schematic · a point source with nothing absorbing the beam · 144 photons drawn</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><label for="isl-d">Distance from the source</label><output for="isl-d" data-role="d-o"></output></div>
        <input type="range" id="isl-d" min="${DMIN}" max="${DMAX}" step="10" value="200">
        <small data-role="ref-note"></small>
      </div>
      <div class="slider">
        <div class="slider-top"><label for="isl-mas">mAs at the reference distance</label></div>
        <input type="number" id="isl-mas" class="select" min="0.5" max="500" step="0.5" value="10" inputmode="decimal">
      </div>
      <div class="controls">
        <button type="button" data-role="ref">Set as reference</button>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Beam area</span><b data-role="r-area"></b></div>
      <div class="readout"><span>Intensity</span><b data-role="r-int"></b></div>
      <div class="readout"><span>Photons through the patch</span><b data-role="r-patch"></b></div>
      <div class="readout"><span>mAs for the same exposure</span><b data-role="r-mas"></b></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
    <div class="try">
      <h3>Try this</h3>
      <ol>
        <li><b>Double the distance.</b> The beam covers four times the area, so each part gets a quarter of the photons.</li>
        <li><b>Think of yourself as the detector.</b> Stepping back from 1 m to 2 m from a source quarters your dose: distance is one of time, distance and shielding.</li>
        <li><b>Use the mAs rule.</b> To keep the same exposure at a new distance, mAs₂ = mAs₁ × (d₂ ÷ d₁)².</li>
      </ol>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const dIn = root.querySelector("#isl-d"), masIn = root.querySelector("#isl-mas");
  const side = $("side"), front = $("front");
  let ref = 100, alive = true, summaryTimer = null;

  // Side view: source, beam edges, rays carrying moving photons, the reference plane (dashed) and the detector.
  const beam = el("polygon", { class: "beam" }, side);
  const rays = Array.from({ length: 7 }, (_, i) => el("line", { class: "ray", x1: SX0, y1: SY }, side));
  const refPlane = el("rect", { class: "plane ref", width: 8, rx: 2 }, side);
  const refLabel = el("text", { class: "plane-t", "text-anchor": "middle" }, side);
  const plane = el("rect", { class: "plane", width: 8, rx: 2 }, side);
  const planeLabel = el("text", { class: "plane-t", "text-anchor": "middle" }, side);
  el("circle", { class: "source", cx: SX0, cy: SY, r: 7 }, side);
  el("text", { class: "plane-t", x: SX0, y: SY + 30, "text-anchor": "middle" }, side).textContent = "source";
  const movers = Array.from({ length: 14 }, (_, i) => ({ n: el("circle", { class: "mover", r: 3 }, side), ray: i % 7, p: (i * 0.53) % 1 }));
  // Distance scale along the bottom.
  for (let d = 0; d <= DMAX; d += 50) {
    el("line", { class: "tick", x1: sx(d), y1: 320, x2: sx(d), y2: 326 }, side);
    const tick = el("text", { class: d % 100 ? "tick-t wide-only" : "tick-t", x: sx(d), y: 342, "text-anchor": "middle" }, side);
    tick.textContent = d;
    if (d === DMAX) el("tspan", { class: "narrow-only" }, tick).textContent = " cm";   // on a phone the unit joins the last label
  }
  el("line", { class: "tick", x1: SX0, y1: 320, x2: SX1, y2: 320 }, side);
  el("text", { class: "tick-t wide-only", x: SX1 + 6, y: 324 }, side).textContent = "cm";

  // Front view: the beam's square, the fixed patch, and the photons.
  const square = el("rect", { class: "front-beam" }, front);
  const patch = el("rect", { class: "patch", x: FX - PATCH, y: FY - PATCH, width: PATCH * 2, height: PATCH * 2 }, front);
  const dots = SPOTS.map(() => el("circle", { class: "spot", r: 1.9 }, front));
  const patchLabel = el("text", { class: "plane-t", x: FX, y: FY + FMAX + 26, "text-anchor": "middle" }, front);
  patchLabel.textContent = "fixed patch";
  el("tspan", { class: "wide-only" }, patchLabel).textContent = ": beam size at 100 cm";

  const ratioWords = r => {
    if (Math.abs(r - 1) < 1e-9) return "the same as";
    const k = Math.round(r), inv = Math.round(1 / r);
    if (Math.abs(r - k) < 1e-9 && WORDS[k]) return `${WORDS[k]}`;
    if (Math.abs(1 / r - inv) < 1e-9 && inv > 1) return inv === 2 ? "half" : `a ${["", "", "half", "third", "quarter", "fifth", "sixth"][inv]} of`;
    return `${+r.toFixed(2)} ×`;
  };

  function update() {
    const d = +dIn.value, r = d / ref, area = r * r, mas1 = Math.max(0, +masIn.value || 0);
    $("d-o").textContent = `${d} cm`;
    $("ref-note").textContent = `Reference distance: ${ref} cm (dashed).`;
    const x = sx(d), h = half(d);
    beam.setAttribute("points", `${SX0},${SY} ${x},${SY - h} ${x},${SY + h}`);
    rays.forEach((ray, i) => { ray.setAttribute("x2", x); ray.setAttribute("y2", SY - h + (2 * h * i) / 6); });
    plane.setAttribute("x", x - 4); plane.setAttribute("y", SY - h - 6); plane.setAttribute("height", 2 * h + 12);
    planeLabel.setAttribute("x", x); planeLabel.setAttribute("y", SY - h - 14); planeLabel.innerHTML = `<tspan class="wide-only">detector </tspan>${d} cm`;
    const rx = sx(ref), rh = half(ref);
    refPlane.setAttribute("x", rx - 4); refPlane.setAttribute("y", SY - rh - 6); refPlane.setAttribute("height", 2 * rh + 12);
    refLabel.setAttribute("x", rx); refLabel.setAttribute("y", SY + rh + 22); refLabel.textContent = `reference ${ref} cm`;
    refPlane.style.display = refLabel.style.display = ref === d ? "none" : "";

    const s = fside(d);
    square.setAttribute("x", FX - s); square.setAttribute("y", FY - s); square.setAttribute("width", 2 * s); square.setAttribute("height", 2 * s);
    let inPatch = 0;
    SPOTS.forEach(([u, v], i) => {
      const px = FX + u * s, py = FY + v * s;
      dots[i].setAttribute("cx", px.toFixed(1)); dots[i].setAttribute("cy", py.toFixed(1));
      if (Math.abs(px - FX) <= PATCH + 0.01 && Math.abs(py - FY) <= PATCH + 0.01) inPatch++;
    });

    const intensity = 1 / area, mas2 = mas1 * area;
    $("r-area").textContent = `× ${+area.toFixed(2)}`;
    $("r-int").textContent = intensity >= 1 ? `× ${+intensity.toFixed(2)}` : `÷ ${+area.toFixed(2)}`;
    $("r-patch").textContent = `${inPatch} of ${PHOTONS}`;
    $("r-mas").textContent = `${+mas2.toFixed(1)} mAs`;

    const sentence = r === 1
      ? `The detector is at the reference distance, ${ref} cm. Move it to compare.`
      : `At ${d} cm the detector is ${ratioWords(r)} the reference distance of ${ref} cm. The same photons spread over ${+area.toFixed(2)} times the area, so the intensity is ${intensity >= 1 ? `${+intensity.toFixed(2)} times` : `1/${+area.toFixed(2)} of`} what it was: (${ref} ÷ ${d})² = ${+intensity.toFixed(3)}. To keep the same exposure: ${mas1} × (${d} ÷ ${ref})² = ${+mas2.toFixed(1)} mAs.`;
    clearTimeout(summaryTimer);
    summaryTimer = setTimeout(() => { $("summary").textContent = sentence; }, 250);
    $("desc").textContent = `A point source on the left with the beam spreading to a detector. ${sentence}`;
  }

  // Photons travelling out along the rays and stopping at the detector.
  function frame(t) {
    if (!alive) return;
    const d = +dIn.value, x = sx(d), h = half(d), still = motionPaused();
    movers.forEach(m => {
      const p = still ? m.p : (m.p + t * 0.00035) % 1;
      const y2 = SY - h + (2 * h * m.ray) / 6;
      m.n.setAttribute("cx", (SX0 + (x - SX0) * p).toFixed(1));
      m.n.setAttribute("cy", (SY + (y2 - SY) * p).toFixed(1));
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  dIn.addEventListener("input", update);
  masIn.addEventListener("input", update);
  $("ref").addEventListener("click", () => { ref = +dIn.value; update(); });
  update();

  return () => { alive = false; clearTimeout(summaryTimer); };
}

// It moves by itself (flowing photons or electrons), so the page offers a "Pause motion" button for it.
export const moving = true;
