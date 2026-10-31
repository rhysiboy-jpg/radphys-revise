// Explorer: rectification. The tube needs a steady one-way (DC) high voltage; rectifiers turn the transformer's AC into
// pulsating DC, and more pulses per cycle mean less ripple (lecture: X-ray Circuits, slides 10–14).
// Ripple = (peak − lowest) ÷ peak, computed from the waveform itself: 100% single-phase, 1 − cos 30° ≈ 13% six-pulse,
// 1 − cos 15° ≈ 3.4% twelve-pulse. High-frequency generators are typically about 1% or less.
import { svgEl as el } from "./util.js";

const F = 50;                                     // UK mains, Hz
const T_MS = 40;                                  // two cycles on screen
const P = { x0: 70, x1: 620, y0: 30, y1: 250 };   // plot area; voltage from −1 (bottom) to +1 (top)
const px = ms => P.x0 + (ms / T_MS) * (P.x1 - P.x0);
const py = v => P.y0 + ((1 - v) / 2) * (P.y1 - P.y0);
const phase = (ms, deg) => Math.sin(2 * Math.PI * F * ms / 1000 - (deg * Math.PI) / 180);

const MODES = {
  ac: { name: "No rectification (AC)", supply: "Single-phase AC", pulses: "–",
    v: ms => phase(ms, 0), parts: [],
    text: "Plain alternating current: half the time the voltage is reversed. The tube needs one-way current, cathode to anode, so this must be rectified." },
  half: { name: "Half-wave", supply: "Single-phase", pulses: "1",
    v: ms => Math.max(0, phase(ms, 0)), parts: [0],
    text: "Diodes suppress the negative half of each cycle, leaving one pulse per cycle. For half the time there is no voltage at all, so no X-rays." },
  full: { name: "Full-wave", supply: "Single-phase", pulses: "2",
    v: ms => Math.abs(phase(ms, 0)), parts: [0],
    text: "The negative half is turned the other way, giving two pulses per cycle. More uniform, but the voltage still falls to zero between pulses: 100% ripple." },
  six: { name: "Three-phase, six-pulse", supply: "Three-phase", pulses: "6",
    v: ms => Math.max(...[0, 120, 240].map(d => Math.abs(phase(ms, d)))), parts: [0, 120, 240],
    text: "Three supplies, each 120° behind the last, all full-wave rectified. The highest at each moment is used, so the voltage never falls far: about 13% ripple." },
  twelve: { name: "Three-phase, twelve-pulse", supply: "Three-phase", pulses: "12",
    v: ms => Math.max(...[0, 30, 60, 90, 120, 150].map(d => Math.abs(phase(ms, d)))), parts: [0, 30, 60, 90, 120, 150],
    text: "Two sets of three phases, offset by 30°, give twelve pulses per cycle: about 3–4% ripple, close to a steady DC." },
  hf: { name: "High-frequency", supply: "Inverter generator", pulses: "Thousands",
    v: ms => 1 - 0.005 * (1 + Math.sin(2 * Math.PI * 1000 * ms / 1000)), parts: [],
    text: "Most modern units convert the mains to a high frequency (kilohertz) before the transformer. Rectified and smoothed, it is almost steady: typically about 1% ripple or less." },
};

const MARKUP = `
<div class="grid">
  <div class="stage">
    <div class="modes" role="group" aria-label="Rectification" data-role="kinds"></div>
    <svg viewBox="0 0 640 300" role="img" aria-labelledby="rc-t rc-d">
      <title id="rc-t">Tube voltage against time</title>
      <desc id="rc-d" data-role="desc"></desc>
      <g class="axis" data-role="axis"></g>
      <g data-role="parts"></g>
      <path class="rc-ac" data-role="ac"/>
      <path class="rc-wave" data-role="wave"/>
      <g data-role="ripple"></g>
    </svg>
    <p class="legend"><span><i class="dash"></i>the AC supply</span><span><i class="run-key"></i>voltage across the tube</span><span><i class="part-key"></i>each phase, rectified</span></p>
  </div>
  <div class="panel">
    <div class="readouts">
      <div class="readout"><span>Ripple</span><b data-role="r-ripple"></b><span>(peak − lowest) ÷ peak</span></div>
      <div class="readout"><span>Pulses per cycle</span><b data-role="r-pulses"></b></div>
      <div class="readout"><span>Lowest voltage</span><b data-role="r-min"></b><span>as a share of the peak (kVp)</span></div>
      <div class="readout"><span>Supply</span><b data-role="r-supply"></b></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
    <div class="try">
      <h3>Try this</h3>
      <ol>
        <li><b>Start at AC, then half-wave.</b> The reversed half disappears: the tube only ever sees one direction.</li>
        <li><b>Go to full-wave.</b> Twice the pulses, but the voltage still drops to zero between them.</li>
        <li><b>Go to three-phase.</b> With three supplies overlapping, the voltage stays near the peak, so more of the exposure produces useful, high-energy X-rays.</li>
        <li><b>Compare the ripple.</b> Less ripple means a higher average photon energy for the same kVp, and more X-ray output for each mAs.</li>
      </ol>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = q => root.querySelector(`[data-role="${q}"]`);
  let mode = "ac", summaryTimer = null;
  $("kinds").innerHTML = Object.entries(MODES).map(([id, m]) => `<button type="button" data-mode="${id}">${m.name}</button>`).join("");

  // Axes, drawn once.
  const axis = $("axis");
  el("line", { x1: P.x0, y1: py(0), x2: P.x1, y2: py(0) }, axis);
  el("line", { x1: P.x0, y1: P.y0, x2: P.x0, y2: P.y1 }, axis);
  [0, 10, 20, 30, 40].forEach(ms => {
    el("line", { class: "grid-l", x1: px(ms), y1: P.y0, x2: px(ms), y2: P.y1 }, axis);
    el("text", { x: px(ms), y: P.y1 + 18, "text-anchor": "middle" }, axis).textContent = ms;
  });
  [[1, "peak"], [0, "0"], [-1, "−peak"]].forEach(([v, t]) => { el("text", { x: P.x0 - 8, y: py(v) + 4, "text-anchor": "end" }, axis).textContent = t; });
  el("line", { class: "kvline", x1: P.x0, y1: py(1), x2: P.x1, y2: py(1) }, axis);
  el("text", { class: "kvlabel", x: P.x0 + 6, y: py(1) - 6 }, axis).textContent = "kVp";
  el("text", { class: "ax-title", x: (P.x0 + P.x1) / 2, y: P.y1 + 42, "text-anchor": "middle" }, axis).textContent = "Time (ms) · 50 Hz mains, two cycles";

  const path = f => Array.from({ length: 801 }, (_, i) => { const ms = (i / 800) * T_MS; return `${i ? "L" : "M"}${px(ms).toFixed(1)} ${py(f(ms)).toFixed(1)}`; }).join(" ");
  $("ac").setAttribute("d", path(ms => phase(ms, 0)));

  function update() {
    const m = MODES[mode];
    root.querySelectorAll("[data-mode]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === mode));
    $("wave").setAttribute("d", path(m.v));
    const parts = $("parts");
    parts.innerHTML = "";
    if (m.parts.length > 1) m.parts.forEach(d => el("path", { class: "rc-part", d: path(ms => Math.abs(phase(ms, d))) }, parts));

    // Ripple from the waveform itself, over one full cycle.
    const vals = Array.from({ length: 2001 }, (_, i) => m.v((i / 2000) * 20));
    const hi = Math.max(...vals), lo = mode === "ac" ? Math.min(...vals) : Math.max(0, Math.min(...vals));
    const ripple = mode === "ac" ? null : (hi - lo) / hi;
    const g = $("ripple");
    g.innerHTML = "";
    if (ripple !== null) {
      const x = P.x1 - 6;
      el("path", { class: "rc-bracket", d: `M${x - 6} ${py(hi)} H${x} V${py(lo)} H${x - 6}` }, g);
      el("text", { class: "fxlabel", x: P.x1, y: P.y0 - 12, "text-anchor": "end" }, g).textContent = `ripple ${ripple < 0.02 ? "≈ 1%" : `${+(ripple * 100).toFixed(ripple < 0.1 ? 1 : 0)}%`}`;
    }
    $("r-ripple").textContent = ripple === null ? "Not DC" : ripple < 0.02 ? "About 1%" : `${+(ripple * 100).toFixed(ripple < 0.1 ? 1 : 0)}%`;
    $("r-pulses").textContent = m.pulses;
    $("r-min").textContent = mode === "ac" ? "Reverses" : `${Math.round(lo * 100)}%`;
    $("r-supply").textContent = m.supply;
    $("desc").textContent = `${m.name}. ${m.text}`;
    clearTimeout(summaryTimer);
    summaryTimer = setTimeout(() => { $("summary").textContent = m.text; }, 150);
  }

  root.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => { mode = b.dataset.mode; update(); }));
  update();
  return () => clearTimeout(summaryTimer);
}
