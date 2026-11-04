// Explorer: the electromagnetic spectrum. Slide from radio waves to gamma rays; wavelength, frequency and photon energy move
// together (E = hc/λ, f = c/λ). The ionising region (about 10 eV and above) and diagnostic X-rays (about 20–150 keV) are marked.
// Band edges are approximate: the bands blend into each other, and X-rays and gamma rays overlap, named by where they come from.
import { svgEl as el, keepInside } from "./util.js";

const C = 2.998e8, HC = 1239.84;                 // m/s; eV·nm
const L0 = 3, L1 = -12;                          // log10 of wavelength in metres, left (1 km) to right (1 pm)
const X0 = 40, X1 = 600;
const x = lg => X0 + ((L0 - lg) / (L0 - L1)) * (X1 - X0);
const BANDS = [                                  // [name, short name, log10 λ at the long end, at the short end]
  ["Radio", "Radio", 3, -0.5],
  ["Microwave", "Micro", -0.5, -3],
  ["Infrared", "IR", -3, Math.log10(700e-9)],
  ["Visible", "", Math.log10(700e-9), Math.log10(400e-9)],
  ["Ultraviolet", "UV", Math.log10(400e-9), -8],
];
const IONISE = Math.log10(HC / 10 * 1e-9);       // 10 eV, about 124 nm
const DX = [Math.log10(HC / 20e3 * 1e-9), Math.log10(HC / 150e3 * 1e-9)];   // 20 keV … 150 keV
const PRESETS = [
  ["FM radio", Math.log10(3)], ["Microwave oven", Math.log10(0.122)], ["Body heat (infrared)", Math.log10(10e-6)],
  ["Green light", Math.log10(550e-9)], ["UV-A (sunbed)", Math.log10(365e-9)], ["Diagnostic X-ray, 60 keV", Math.log10(HC / 60e3 * 1e-9)],
  ["Tc-99m gamma, 140 keV", Math.log10(HC / 140e3 * 1e-9)],
];
const PRE = [[1e-12, "p"], [1e-9, "n"], [1e-6, "µ"], [1e-3, "m"], [1, ""], [1e3, "k"]];
const fmtLen = m => { const [s, p] = PRE.filter(([s]) => m >= s * 0.9995).at(-1) || PRE[0]; return `${+(m / s).toPrecision(3)} ${p}m`; };
const fmtF = f => { const u = [[1e18, "EHz"], [1e15, "PHz"], [1e12, "THz"], [1e9, "GHz"], [1e6, "MHz"], [1e3, "kHz"], [1, "Hz"]].find(([s]) => f >= s); return `${+(f / u[0]).toPrecision(3)} ${u[1]}`; };
const fmtE = e => e >= 1e6 ? `${+(e / 1e6).toPrecision(3)} MeV` : e >= 1e3 ? `${+(e / 1e3).toPrecision(3)} keV` : e >= 0.01 ? `${+e.toPrecision(3)} eV` : (([m, p]) => `${m} × 10${[...p].map(c => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(c)]).join("")} eV`)(e.toExponential(1).split("e"));

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 640 300" role="img" aria-labelledby="em-t em-d">
      <title id="em-t">The electromagnetic spectrum</title>
      <desc id="em-d" data-role="desc"></desc>
      <defs><linearGradient id="em-vis" x1="0" x2="1">
        <stop offset="0" stop-color="#d33"/><stop offset="0.25" stop-color="#e90"/><stop offset="0.45" stop-color="#dd2"/>
        <stop offset="0.6" stop-color="#3a3"/><stop offset="0.8" stop-color="#27d"/><stop offset="1" stop-color="#83c"/></linearGradient></defs>
      <path class="em-wave" data-role="wave"/>
      <g data-role="bands"></g>
      <g class="axis" data-role="axis"></g>
      <line class="em-mark" data-role="mark" y1="46" y2="244"/>
      <text class="pane-t" data-role="mark-t" y="36"></text>
    </svg>
    <p class="scale-note">Logarithmic scale: each step is ten times shorter · band edges are approximate · the wave above is schematic</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><label for="em-s">Move along the spectrum</label><output for="em-s" data-role="band-o"></output></div>
        <input type="range" id="em-s" min="${-L0}" max="${-L1}" step="0.02" value="10.4">
        <small>Left: long wavelength, low energy. Right: short wavelength, high energy.</small>
      </div>
      <div class="slider">
        <div class="slider-top"><span class="label">Examples</span></div>
        <div class="modes" role="group" aria-label="Examples">${PRESETS.map(([n], i) => `<button type="button" data-pre="${i}">${n}</button>`).join("")}</div>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Wavelength</span><b data-role="r-l"></b></div>
      <div class="readout"><span>Frequency</span><b data-role="r-f"></b></div>
      <div class="readout"><span>Photon energy</span><b data-role="r-e"></b></div>
      <div class="readout"><span>Ionising?</span><b data-role="r-i"></b></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const sIn = root.querySelector("#em-s");
  let timer = null, exact = null;   // a preset keeps its exact wavelength; the slider moves in steps

  // Bands along a strip, then the overlapping X-ray and gamma bars beneath it.
  const bands = $("bands"), Y = 132, H = 44;
  BANDS.forEach(([name, short, a, b], i) => {
    el("rect", { class: name === "Visible" ? "em-vis" : `em-band em-b${i % 2}`, x: x(a), y: Y, width: x(b) - x(a), height: H, ...(name === "Visible" ? { fill: "url(#em-vis)" } : {}) }, bands);
    if (name !== "Visible") {
      const t = el("text", { class: "em-t", x: (x(a) + x(b)) / 2, y: Y + H / 2 + 4, "text-anchor": "middle" }, bands);
      el("tspan", { class: "wide-only" }, t).textContent = name;
      el("tspan", { class: "narrow-only" }, t).textContent = short;
    }
  });
  el("text", { class: "plane-t", x: x(Math.log10(400e-9)) - 2, y: Y + H + 32, "text-anchor": "end" }, bands).textContent = "visible ↑";
  el("rect", { class: "em-band em-x", x: x(-8), y: Y, width: x(-12) - x(-8), height: H / 2 }, bands);
  el("rect", { class: "em-band em-g", x: x(-10), y: Y + H / 2, width: x(-12) - x(-10), height: H / 2 }, bands);
  el("text", { class: "em-t", x: (x(-8) + x(-10)) / 2, y: Y + 15, "text-anchor": "middle" }, bands).textContent = "X-rays";
  el("text", { class: "em-t", x: (x(-10) + x(-12)) / 2, y: Y + H - 7, "text-anchor": "middle" }, bands).textContent = "gamma";
  // The ionising region, and diagnostic X-rays.
  el("rect", { class: "em-ion", x: x(IONISE), y: Y + H + 8, width: X1 - x(IONISE), height: 8, rx: 4 }, bands);
  const it = el("text", { class: "plane-t", x: x(IONISE) + 6, y: Y + H + 32 }, bands);
  it.textContent = "ionising";
  el("tspan", { class: "wide-only" }, it).textContent = " (≈ 10 eV and up)";
  el("tspan", {}, it).textContent = " →";
  el("line", { class: "em-dx", x1: x(DX[0]), x2: x(DX[1]), y1: Y + H + 46, y2: Y + H + 46 }, bands);
  el("text", { class: "plane-t", x: (x(DX[0]) + x(DX[1])) / 2, y: Y + H + 64, "text-anchor": "middle" }, bands).textContent = "diagnostic X-rays";
  // Axis: wavelength in metres, every three decades.
  const axis = $("axis");
  for (let lg = 3; lg >= -12; lg -= 3) {
    el("line", { x1: x(lg), x2: x(lg), y1: Y + H, y2: Y + H + 4 }, axis);
    el("text", { x: x(lg), y: Y - 14, "text-anchor": "middle" }, axis).textContent = fmtLen(10 ** lg);
  }
  el("text", { class: "ax-title", x: X0, y: 292 }, axis).textContent = "← lower energy";
  el("text", { class: "ax-title", x: X1, y: 292, "text-anchor": "end" }, axis).textContent = "higher energy →";

  const bandAt = lg => {
    if (lg < -8) return lg < -10 ? "X-ray or gamma ray" : "X-ray";
    return BANDS.find(([, , a, b]) => lg <= a && lg >= b)?.[0] || "Radio";
  };

  function update() {
    const lg = exact ?? -+sIn.value, m = 10 ** lg, e = HC / (m * 1e9), f = C / m, band = bandAt(lg), ion = lg <= IONISE;
    $("band-o").textContent = band;
    $("r-l").textContent = fmtLen(m);
    $("r-f").textContent = fmtF(f);
    $("r-e").textContent = fmtE(e);
    $("r-i").textContent = ion ? "Yes" : "No";
    const mx = x(lg);
    $("mark").setAttribute("x1", mx); $("mark").setAttribute("x2", mx);
    const mt = $("mark-t"); mt.setAttribute("x", mx); mt.setAttribute("text-anchor", "middle"); mt.textContent = band; keepInside(mt, 4, 636);
    // The wave: its drawn wavelength shrinks steadily from left to right of the slider, so the change can be seen.
    const wl = 6 + ((lg - L1) / (L0 - L1)) * 150;
    let d = "M40 66";
    for (let px = 40; px <= 600; px += 1.5) d += ` L${px} ${(66 - 14 * Math.sin(((px - 40) / wl) * 2 * Math.PI)).toFixed(1)}`;
    $("wave").setAttribute("d", d);
    root.querySelectorAll("[data-pre]").forEach(b => b.setAttribute("aria-pressed", Math.abs(PRESETS[+b.dataset.pre][1] - lg) < 0.011));
    const s = `${band}: wavelength ${fmtLen(m)}, frequency ${fmtF(f)}, photon energy ${fmtE(e)}. ` +
      (ion ? "Each photon has enough energy to remove an electron from an atom: ionising radiation." : "Each photon has too little energy to ionise.") +
      (lg < -10 ? " X-rays and gamma rays overlap here: X-rays come from electrons, gamma rays from the nucleus." : "");
    $("desc").textContent = `A strip of the spectrum from radio waves to gamma rays, marked at ${band}. ${s}`;
    clearTimeout(timer);
    timer = setTimeout(() => { $("summary").textContent = s; }, 250);
  }

  root.querySelectorAll("[data-pre]").forEach(b => b.addEventListener("click", () => { exact = PRESETS[+b.dataset.pre][1]; sIn.value = -exact; update(); }));
  sIn.addEventListener("input", () => { exact = null; update(); });
  root.querySelector(`[data-pre="5"]`).click();
  return () => clearTimeout(timer);
}
