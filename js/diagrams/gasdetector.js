// Explorer: gas-filled detectors. The classic curve of ion pairs collected against the voltage across the detector, for an event
// that deposits more energy and one that deposits less. In the ionisation chamber region every primary ion pair is collected and
// nothing more, so the signal is proportional to the energy deposited: good for measuring dose. In the Geiger–Müller region each
// event sets off an avalanche along the whole wire, so every event gives the same large pulse: very sensitive, but it only counts.
// The curve's shape is schematic; the voltages are not given because they depend on the detector.
import { svgEl as el } from "./util.js";

const REGIONS = [
  { to: 0.12, name: "Recombination", short: "Not used", use: "", text: "The voltage is too low to pull the ions apart before many recombine, so only some are collected." },
  { to: 0.35, name: "Ionisation chamber", short: "Measuring dose", use: "DAP meters, AEC chambers, calibration", text: "Every ion pair made by the radiation is collected, and no more. The signal is proportional to the energy deposited, and a small change in voltage hardly matters." },
  { to: 0.6, name: "Proportional", short: "Counting", use: "specialised counters", text: "The electrons gain enough energy to ionise more gas: each event is multiplied, but the pulse is still proportional to the energy deposited." },
  { to: 0.68, name: "Limited proportionality", short: "Not used", use: "", text: "The multiplication grows so large that pulses from big and small events start to merge." },
  { to: 0.9, name: "Geiger–Müller", short: "Counting", use: "detecting radiation and contamination", text: "Each event sets off an avalanche along the whole wire, so every pulse is the same size whatever started it. Very sensitive for counting, but it can't measure dose accurately." },
  { to: 1, name: "Continuous discharge", short: "Avoided", use: "it damages the detector", text: "The gas breaks down and conducts continuously, with or without radiation." },
];
const BIG = 5, SMALL = 3;                         // log10 of the primary ion pairs for the two events
function logN(v, p) {
  if (v < 0.12) return p + Math.log10(Math.max(1e-3, 1 - Math.exp(-v / 0.03)));
  if (v < 0.35) return p;
  if (v < 0.6) return p + (4 * (v - 0.35)) / 0.25;
  if (v < 0.68) return p + 4 + (9 - (p + 4)) * ((v - 0.6) / 0.08);
  if (v < 0.9) return 9 + (0.5 * (v - 0.68)) / 0.22;
  return 9.5 + ((v - 0.9) / 0.1) * 1.5;
}
const GX0 = 70, GX1 = 620, GY0 = 30, GY1 = 260, LMAX = 11;
const gx = v => GX0 + v * (GX1 - GX0), gy = l => GY1 - (Math.max(0, l) / LMAX) * (GY1 - GY0);
const curve = p => Array.from({ length: 201 }, (_, i) => i / 200).map((v, i) => `${i ? "L" : "M"}${gx(v).toFixed(1)} ${gy(logN(v, p)).toFixed(1)}`).join(" ");
const big = n => n >= 1e6 ? `${(n / 10 ** Math.floor(Math.log10(n))).toFixed(1)} × 10${String(Math.floor(Math.log10(n))).split("").map(c => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c]).join("")}` : Math.round(n).toLocaleString("en-GB");

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 640 320" role="img" aria-labelledby="gd-t gd-d">
      <title id="gd-t">Ion pairs collected against the voltage across a gas-filled detector</title>
      <desc id="gd-d" data-role="desc"></desc>
      <g data-role="bands"></g>
      <g class="axis">
        <line x1="${GX0}" y1="${GY1}" x2="${GX1}" y2="${GY1}"/><line x1="${GX0}" y1="${GY0}" x2="${GX0}" y2="${GY1}"/>
        ${[0, 3, 6, 9].map(l => `<text x="${GX0 - 8}" y="${gy(l) + 4}" text-anchor="end">10${"⁰³⁶⁹"[l / 3]}</text>`).join("")}
        <text class="ax-title" x="${(GX0 + GX1) / 2}" y="${GY1 + 44}" text-anchor="middle">Voltage across the detector →</text>
        <text class="ax-title" x="22" y="${(GY0 + GY1) / 2}" text-anchor="middle" transform="rotate(-90 22 ${(GY0 + GY1) / 2})">Ion pairs collected (log)</text>
      </g>
      <path class="gd-big" d="${curve(BIG)}"/>
      <path class="gd-small" d="${curve(SMALL)}"/>
      <line class="em-mark" data-role="mark" y1="${GY0}" y2="${GY1}"/>
      <circle class="gd-pt big" data-role="pb" r="5"/><circle class="gd-pt small" data-role="ps" r="5"/>
    </svg>
    <p class="legend"><span><i class="gd-key-big"></i>an event depositing more energy</span><span><i class="gd-key-small"></i>an event depositing less</span></p>
    <p class="scale-note">Schematic curve · log scale on the vertical axis · the voltages depend on the detector</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><label for="gd-v">Voltage across the detector</label><output for="gd-v" data-role="v-o"></output></div>
        <input type="range" id="gd-v" min="0.02" max="0.98" step="0.01" value="0.24">
      </div>
      <div class="slider">
        <div class="slider-top"><span class="label">Jump to</span></div>
        <div class="modes" role="group" aria-label="Jump to"><button type="button" data-go="0.24">Ionisation chamber</button><button type="button" data-go="0.79">Geiger–Müller</button></div>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Larger event</span><b data-role="r-big"></b><span>ion pairs collected</span></div>
      <div class="readout"><span>Smaller event</span><b data-role="r-small"></b><span>ion pairs collected</span></div>
      <div class="readout"><span>Can it tell them apart?</span><b data-role="r-apart"></b></div>
      <div class="readout"><span>Used for</span><b data-role="r-use"></b><span data-role="r-use-s"></span></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const vIn = root.querySelector("#gd-v");
  let timer = null, from = 0;
  REGIONS.forEach((r, i) => {
    el("rect", { class: `gd-band b${i % 2}`, x: gx(from), y: GY0, width: gx(r.to) - gx(from), height: GY1 - GY0 }, $("bands"));
    const t = el("text", { class: "gd-num", x: (gx(from) + gx(r.to)) / 2, y: GY1 + 20 }, $("bands"));
    t.textContent = ["I", "II", "III", "IV", "V", "VI"][i];
    from = r.to;
  });

  function update() {
    const v = +vIn.value, r = REGIONS.find(x => v <= x.to), i = REGIONS.indexOf(r);
    const nb = 10 ** logN(v, BIG), ns = 10 ** logN(v, SMALL);
    $("v-o").textContent = r.name;
    $("mark").setAttribute("x1", gx(v)); $("mark").setAttribute("x2", gx(v));
    $("pb").setAttribute("cx", gx(v)); $("pb").setAttribute("cy", gy(logN(v, BIG)));
    $("ps").setAttribute("cx", gx(v)); $("ps").setAttribute("cy", gy(logN(v, SMALL)));
    root.querySelectorAll("[data-go]").forEach(b => b.setAttribute("aria-pressed", REGIONS.find(x => +b.dataset.go <= x.to) === r));
    $("r-big").textContent = big(nb); $("r-small").textContent = big(ns);
    const ratio = nb / ns;
    $("r-apart").textContent = ratio > 50 ? "Yes" : ratio > 1.5 ? "Partly" : "No";
    $("r-use").textContent = r.short; $("r-use-s").textContent = r.use;
    const s = `Region ${["I", "II", "III", "IV", "V", "VI"][i]}, ${r.name.toLowerCase()}. ${r.text}`;
    $("desc").textContent = `Curves of ion pairs collected against voltage for a larger and a smaller event. Marked at ${s}`;
    clearTimeout(timer);
    timer = setTimeout(() => { $("summary").textContent = s; }, 250);
  }
  root.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => { vIn.value = b.dataset.go; update(); }));
  vIn.addEventListener("input", update);
  update();
  return () => clearTimeout(timer);
}
