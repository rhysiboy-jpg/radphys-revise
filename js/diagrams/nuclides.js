// Predict: the chart of nuclides. Stable nuclei lie along a band: N ≈ Z for light nuclei, with proportionally more neutrons as they
// get heavier. Pick a nuclide, predict how it decays from where it sits against the band, then see the decay drawn on a close-up
// of the chart. The band is drawn from a smooth fit to the stable nuclei (Z ≈ A ÷ (1.98 + 0.0155 A^⅔)), so it is approximate.
import { svgEl as el } from "./util.js";

const NUCS = [
  { id: "c12", pos: "On the band", name: "Carbon-12", s: "C-12", Z: 6, N: 6, mode: "stable", d: null, why: "Six protons and six neutrons: on the band of stability, so it doesn't decay." },
  { id: "c14", pos: "Too many neutrons", name: "Carbon-14", s: "C-14", Z: 6, N: 8, mode: "bm", d: ["N-14", 7, 7], why: "Two more neutrons than carbon-12: too many neutrons. A neutron becomes a proton, giving nitrogen-14." },
  { id: "f18", pos: "Too many protons", name: "Fluorine-18", s: "F-18", Z: 9, N: 9, mode: "bp", d: ["O-18", 8, 10], why: "Too few neutrons for a stable fluorine. A proton becomes a neutron by positron emission (mostly), giving oxygen-18. The positrons are used in PET." },
  { id: "mo99", pos: "Too many neutrons", name: "Molybdenum-99", s: "Mo-99", Z: 42, N: 57, mode: "bm", d: ["Tc-99m", 43, 56], why: "Neutron-rich: beta-minus decay turns a neutron into a proton, giving technetium-99m, as in a technetium generator." },
  { id: "tc99m", pos: "Excited (metastable)", name: "Technetium-99m", s: "Tc-99m", Z: 43, N: 56, mode: "gamma", d: ["Tc-99", 43, 56], why: "An excited (metastable) nucleus. It loses energy as a 140 keV gamma ray, with no change in Z or A." },
  { id: "i131", pos: "Too many neutrons", name: "Iodine-131", s: "I-131", Z: 53, N: 78, mode: "bm", d: ["Xe-131", 54, 77], why: "Below the band: too many neutrons. Beta-minus decay gives xenon-131." },
  { id: "i123", pos: "Too many protons", name: "Iodine-123", s: "I-123", Z: 53, N: 70, mode: "bp", d: ["Te-123", 52, 71], why: "Above the band: too many protons. It decays by electron capture, giving tellurium-123." },
  { id: "tl201", pos: "Too many protons", name: "Thallium-201", s: "Tl-201", Z: 81, N: 120, mode: "bp", d: ["Hg-201", 80, 121], why: "Proton-rich: it decays by electron capture to mercury-201, with characteristic X-rays as the shell vacancy fills." },
  { id: "pb208", pos: "On the band", name: "Lead-208", s: "Pb-208", Z: 82, N: 126, mode: "stable", d: null, why: "On the band, and one of the heaviest stable nuclei: it has 44 more neutrons than protons." },
  { id: "ra226", pos: "Too heavy", name: "Radium-226", s: "Ra-226", Z: 88, N: 138, mode: "a", d: ["Rn-222", 86, 136], why: "Beyond lead there are no stable nuclei: too heavy. Alpha decay removes 2 protons and 2 neutrons, giving radon-222." },
  { id: "u238", pos: "Too heavy", name: "Uranium-238", s: "U-238", Z: 92, N: 146, mode: "a", d: ["Th-234", 90, 144], why: "Very heavy: alpha decay gives thorium-234, the first step of a long decay chain." },
];
const MODES = { bm: "Beta-minus", bp: "Beta-plus or electron capture", a: "Alpha", gamma: "Gamma only", stable: "Stable" };
const CX0 = 50, CX1 = 380, CY0 = 20, CY1 = 290, NMAX = 150, ZMAX = 100;
const cx = n => CX0 + (n / NMAX) * (CX1 - CX0), cy = z => CY1 - (z / ZMAX) * (CY1 - CY0);
const zStable = A => A / (1.98 + 0.0155 * A ** (2 / 3));
const IX = 512, IY = 160, CELL = 30;               // the close-up, centred on the chosen nuclide

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 640 330" role="img" aria-labelledby="nu-t nu-d">
      <title id="nu-t">Chart of nuclides: protons against neutrons, with the band of stability</title>
      <desc id="nu-d" data-role="desc"></desc>
      <g class="axis">
        <line x1="${CX0}" y1="${CY1}" x2="${CX1}" y2="${CY1}"/><line x1="${CX0}" y1="${CY0}" x2="${CX0}" y2="${CY1}"/>
        ${[0, 50, 100, 150].map(n => `<text x="${cx(n)}" y="${CY1 + 16}" text-anchor="middle">${n}</text>`).join("")}
        ${[0, 50, 100].map(z => `<text x="${CX0 - 6}" y="${cy(z) + 4}" text-anchor="end">${z}</text>`).join("")}
        <text class="ax-title" x="${(CX0 + CX1) / 2}" y="${CY1 + 36}" text-anchor="middle">Neutrons (N)</text>
        <text class="ax-title" x="16" y="${(CY0 + CY1) / 2}" text-anchor="middle" transform="rotate(-90 16 ${(CY0 + CY1) / 2})">Protons (Z)</text>
      </g>
      <line class="nu-nz" x1="${cx(0)}" y1="${cy(0)}" x2="${cx(100)}" y2="${cy(100)}"/>
      <text class="plane-t" x="${cx(88)}" y="${cy(96)}">N = Z</text>
      <path class="nu-band" data-role="band"/>
      <g data-role="dots"></g>
      <g data-role="inset"></g>
    </svg>
    <p class="legend"><span><i class="nu-key"></i>band of stability (approximate)</span></p>
    <p class="scale-note">Stable nuclei lie along the band · above it: too many protons · below it: too many neutrons · beyond lead (Z = 82): too heavy · close-up: neutrons across, protons up</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider"><div class="slider-top"><span class="label">Choose a nuclide</span></div>
        <div class="modes" role="group" aria-label="Nuclide">${NUCS.map(n => `<button type="button" data-nuc="${n.id}">${n.s}</button>`).join("")}</div></div>
      <div class="slider"><div class="slider-top"><span class="label">How will it decay?</span></div>
        <div class="modes" role="group" aria-label="Prediction">${Object.entries(MODES).map(([id, m]) => `<button type="button" data-mode="${id}">${m}</button>`).join("")}</div></div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Protons, neutrons</span><b data-role="r-zn"></b></div>
      <div class="readout"><span>Against the band</span><b data-role="r-pos"></b></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  let nuc = NUCS[3], guess = null;
  // The band: the fit line for A from 2 to 209, drawn thick.
  let d = "";
  for (let A = 2; A <= 209; A++) { const z = zStable(A); d += `${A > 2 ? "L" : "M"}${cx(A - z).toFixed(1)} ${cy(z).toFixed(1)} `; }
  $("band").setAttribute("d", d);
  const dots = NUCS.map(n => el("circle", { class: "nu-dot", cx: cx(n.N), cy: cy(n.Z), r: 4 }, $("dots")));

  function inset(show) {
    const g = $("inset"); g.innerHTML = "";
    el("text", { class: "pane-t", x: IX, y: 64 }, g).textContent = show && nuc.d ? `${nuc.s} → ${nuc.d[0]}` : nuc.s;
    // A 5 × 5 patch of the chart around the nuclide: one square per nuclide, neutrons across, protons up.
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
      el("rect", { class: "nu-cell", x: IX + i * CELL - CELL / 2, y: IY - j * CELL - CELL / 2, width: CELL, height: CELL }, g);
    }
    el("rect", { class: "nu-me", x: IX - CELL / 2, y: IY - CELL / 2, width: CELL, height: CELL }, g);
    if (show && nuc.d) {
      const [name, Z, N] = nuc.d, x = IX + (N - nuc.N) * CELL, y = IY - (Z - nuc.Z) * CELL;
      if (nuc.mode === "gamma") {
        el("path", { class: "photon", d: `M${IX + 6} ${IY - 6} q 14 -30 34 -40` }, g);
        el("text", { class: "plane-t", x: IX + 44, y: IY - 48 }, g).textContent = "γ";
      } else {
        el("rect", { class: "nu-daughter", x: x - CELL / 2, y: y - CELL / 2, width: CELL, height: CELL }, g);
        el("line", { class: "nu-arrow", x1: IX, y1: IY, x2: x - Math.sign(x - IX) * 6, y2: y - Math.sign(y - IY) * 6 }, g);
      }
    }
  }

  function update() {
    root.querySelectorAll("[data-nuc]").forEach(b => b.setAttribute("aria-pressed", b.dataset.nuc === nuc.id));
    root.querySelectorAll("[data-mode]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === guess));
    dots.forEach((dt, i) => dt.classList.toggle("on", NUCS[i] === nuc));
    $("r-zn").textContent = `Z = ${nuc.Z}, N = ${nuc.N}`;
    $("r-pos").textContent = nuc.pos;
    inset(guess !== null);
    const s = guess === null ? `${nuc.name}: ${nuc.Z} protons and ${nuc.N} neutrons. Where does it sit against the band? Predict how it decays.`
      : `${guess === nuc.mode ? "Right" : `Not quite: ${MODES[nuc.mode].toLowerCase()}`}. ${nuc.why}`;
    $("summary").textContent = s;
    $("desc").textContent = `Chart of nuclides with the band of stability. ${nuc.name} is marked. ${s}`;
  }
  root.querySelectorAll("[data-nuc]").forEach(b => b.addEventListener("click", () => { nuc = NUCS.find(n => n.id === b.dataset.nuc); guess = null; update(); }));
  root.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => { guess = b.dataset.mode; update(); }));
  update();
}
