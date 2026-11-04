// Explorer: digitisation. Sampling sets the matrix (how many pixels); quantisation gives each pixel one of 2^bits grey values.
// A profile along one row shows the smooth detector signal against its sampled, stepped copy. A bar pattern whose stripes get
// finer to the right shows aliasing once the sampling is too coarse. Each pixel takes the signal at its centre (point sampling),
// which makes aliasing easy to see; real detectors average over each pixel, which reduces it. Matrices here are far smaller than
// a real detector's (a few thousand pixels across, 12–16 bits) so the effects can be seen.
import { svgEl as el } from "./util.js";
import { W, H, limb } from "./limb.js";

const MATRICES = [360, 180, 90, 45, 24];
const BITS = [1, 2, 3, 4, 8];
const FOV = 360;                        // mm across the field of view, so 1 mm per pixel at full size
const ROW = 112;                        // the profile row: through the bone's knobs and marrow
const PX0 = 40, PX1 = 620, PY0 = 16, PY1 = 116;
const px = x => PX0 + (x / W) * (PX1 - PX0), py = s => PY1 - s * (PY1 - PY0);

// The bar pattern: stripes whose spacing shrinks steadily from left to right.
function bars() {
  const m = new Float32Array(W * H);
  for (let x = 0; x < W; x++) {
    const phase = 2 * Math.PI * (x / 26 + (x * x) / 2600);    // local frequency rises along x
    const v = Math.sin(phase) > 0 ? 0.85 : 0.15;
    for (let y = 0; y < H; y++) m[y * W + x] = v;
  }
  return m;
}
// Signal: 0 (no exposure) … 1 (full exposure). For the limb, the transmitted exposure, so air is high and bone low.
const IMAGES = { limb: limb().map(w => Math.exp(-2.6 * w)), bars: bars() };

const MARKUP = `
<div class="grid">
  <div class="stage">
    <canvas class="xray" width="${W}" height="${H}" data-role="img"></canvas>
    <svg viewBox="0 0 640 150" role="img" aria-labelledby="dg-t dg-d">
      <title id="dg-t">Signal along one row: smooth, and as stored</title>
      <desc id="dg-d" data-role="desc"></desc>
      <g class="axis"><line x1="${PX0}" y1="${PY1}" x2="${PX1}" y2="${PY1}"/><line x1="${PX0}" y1="${PY0}" x2="${PX0}" y2="${PY1}"/>
        <text class="ax-title" x="${(PX0 + PX1) / 2}" y="140" text-anchor="middle">Position along the marked row</text>
        <text class="ax-title" x="16" y="${(PY0 + PY1) / 2}" text-anchor="middle" transform="rotate(-90 16 ${(PY0 + PY1) / 2})">Signal</text></g>
      <path class="dg-analogue" data-role="ana"/>
      <path class="dg-digital" data-role="dig"/>
    </svg>
    <p class="legend"><span><i class="dg-key-a"></i>signal reaching the detector</span><span><i class="dg-key-d"></i>stored pixel values</span></p>
    <p class="scale-note">Simulated · cartoon limb, not a patient · each pixel takes the signal at its centre · real detectors use far more pixels and bits</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><span class="label">Image</span></div>
        <div class="modes" role="group" aria-label="Image"><button type="button" data-img="limb">Limb</button><button type="button" data-img="bars">Bar pattern</button></div>
      </div>
      <div class="slider">
        <div class="slider-top"><label for="dg-m">Sampling: pixels across</label><output for="dg-m" data-role="m-o"></output></div>
        <input type="range" id="dg-m" min="0" max="${MATRICES.length - 1}" step="1" value="0">
        <small>Fewer samples: a smaller matrix and larger pixels.</small>
      </div>
      <div class="slider">
        <div class="slider-top"><label for="dg-b">Quantisation: bit depth</label><output for="dg-b" data-role="b-o"></output></div>
        <input type="range" id="dg-b" min="0" max="${BITS.length - 1}" step="1" value="${BITS.length - 1}">
        <small>Fewer bits: fewer shades of grey.</small>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Matrix</span><b data-role="r-m"></b></div>
      <div class="readout"><span>Pixel size</span><b data-role="r-px"></b><span>for a ${FOV / 10} cm field of view</span></div>
      <div class="readout"><span>Shades of grey</span><b data-role="r-g"></b></div>
      <div class="readout"><span>Image size</span><b data-role="r-kb"></b></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const mIn = root.querySelector("#dg-m"), bIn = root.querySelector("#dg-b");
  const ctx = $("img").getContext("2d"), pix = ctx.createImageData(W, H);
  let img = "limb", timer = null;

  function update() {
    const n = MATRICES[+mIn.value], bits = BITS[+bIn.value], levels = 2 ** bits, src = IMAGES[img];
    const step = W / n, rows = Math.round(H / step);
    root.querySelectorAll("[data-img]").forEach(b => b.setAttribute("aria-pressed", b.dataset.img === img));
    // Sample at each pixel's centre, quantise, and paint the block. Higher exposure shows darker, as on a radiograph.
    const q = s => Math.min(levels - 1, Math.floor(s * levels)) / (levels - 1);
    const sampled = (x, y) => {
      const cx = Math.min(W - 1, Math.floor((Math.floor(x / step) + 0.5) * step)), cy = Math.min(H - 1, Math.floor((Math.floor(y / step) + 0.5) * step));
      return q(src[cy * W + cx]);
    };
    const d = pix.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const g = Math.round((img === "limb" ? 1 - sampled(x, y) : sampled(x, y)) * 255), i = (y * W + x) * 4;
      d[i] = d[i + 1] = d[i + 2] = g; d[i + 3] = 255;
    }
    // Mark the profile row.
    for (let x = 0; x < W; x += 2) { const i = (ROW * W + x) * 4; d[i] = 230; d[i + 1] = 60; d[i + 2] = 60; }
    ctx.putImageData(pix, 0, 0);

    let a = "", g = "";
    for (let x = 0; x < W; x++) a += `${x ? "L" : "M"}${px(x).toFixed(1)} ${py(src[ROW * W + x]).toFixed(1)} `;
    for (let k = 0; k < n; k++) {
      const v = py(sampled(k * step, ROW)).toFixed(1);
      g += `${k ? "L" : "M"}${px(k * step).toFixed(1)} ${v} L${px(Math.min(W, (k + 1) * step)).toFixed(1)} ${v} `;
    }
    $("ana").setAttribute("d", a); $("dig").setAttribute("d", g);

    const kb = (n * rows * bits) / 8 / 1024;
    $("m-o").textContent = n; $("b-o").textContent = `${bits} bit${bits > 1 ? "s" : ""}`;
    $("r-m").textContent = `${n} × ${rows}`;
    $("r-px").textContent = `${+(FOV / n).toFixed(1)} mm`;
    $("r-g").textContent = levels;
    $("r-kb").textContent = kb < 1 ? `${Math.round(kb * 1024)} bytes` : `${+kb.toFixed(1)} kB`;
    const s = `A ${n} × ${rows} matrix with ${bits}-bit pixels: ${+(FOV / n).toFixed(1)} mm pixels and ${levels} shades of grey. ` +
      (img === "bars"
        ? (n >= 360 ? "Every stripe is reproduced, right up to the finest. " : "On the right the stripes are finer than the pixels can sample: they vanish or turn into false, wider stripes. This is aliasing. ")
        : (n <= 45 ? "Fine detail such as the crack and the marrow spots is lost in the large pixels. " : n <= 90 ? "Edges become stepped and the finest detail is going. " : "Fine detail is reproduced. ")) +
      (levels <= 4 ? "With so few grey levels, smooth changes become bands." : levels <= 16 ? "Smooth changes show as visible steps of grey." : "The grey steps are too fine to see.");
    $("img").setAttribute("aria-label", `Simulated ${img === "limb" ? "limb" : "bar pattern"}. ${s}`);
    $("desc").textContent = s;
    clearTimeout(timer);
    timer = setTimeout(() => { $("summary").textContent = s; }, 250);
  }

  root.querySelectorAll("[data-img]").forEach(b => b.addEventListener("click", () => { img = b.dataset.img; update(); }));
  mIn.addEventListener("input", update); bIn.addEventListener("input", update);
  update();
  return () => clearTimeout(timer);
}
