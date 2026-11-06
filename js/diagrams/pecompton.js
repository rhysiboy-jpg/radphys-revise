// Explorer: how X-ray photons interact with matter (lecture: Interactions with Matter). Two views:
//   Interactions: the photoelectric effect beside Compton or coherent scatter, stepped together, with how likely each is;
//   Attenuation: attenuation per gram against photon energy for four materials, with the K-edges of iodine and lead.
// Energies use the full Compton formula; likelihoods and attenuation come from NIST XCOM reference data (xcom.js).
import { svgEl as el, wavy, tween, setLines, keepInside } from "./util.js";
import { drawAtom, vacancy } from "./atom.js";
import { mu, curve, EDGES } from "./xcom.js";

// Effective atomic number, the atom drawn for it, and its K, L (L3) and M (M5) binding energies in keV.
const MATERIALS = {
  tissue: { name: "Soft tissue", zEff: 7.4,  atom: "oxygen",  counts: [2, 6],                K: 0.53, L: 0.007, M: null },
  bone:   { name: "Bone",        zEff: 13.8, atom: "calcium", counts: [2, 8, 8, 2],          K: 4.04, L: 0.35,  M: 0.03 },
  iodine: { name: "Iodine contrast", zEff: 53, atom: "iodine", counts: [2, 8, 18, 18, 7],    K: 33.2, L: 4.56,  M: 0.62 },
  lead:   { name: "Lead",        zEff: 82,   atom: "lead",    counts: [2, 8, 18, 32, 18, 4], K: 88.0, L: 13.0,  M: 2.48 },
};
const SHORT = { tissue: "Soft tissue", bone: "Bone", iodine: "Iodine", lead: "Lead" };
const ME = 511;   // electron rest energy, keV
const COH_DEG = 20;   // coherent scatter is drawn at one small angle
const r1 = v => +v.toFixed(1);
// Compton: scattered photon energy, and the recoil electron's direction (below the original path).
const scattered = (E, deg) => E / (1 + (E / ME) * (1 - Math.cos((deg * Math.PI) / 180)));
const recoilAngle = (E, deg) => deg === 0 ? 90 : (Math.atan(1 / ((1 + E / ME) * Math.tan((deg * Math.PI) / 360))) * 180) / Math.PI;
// A photon frees a K electron only above the K binding energy (at exactly the edge it cannot, as in the XCOM data).
const reachesK = (E, m) => E > m.K;
// "× 2.3" below ten, "× 21" above.
const times = x => (x >= 9.95 ? Math.round(x) : +x.toFixed(1)).toLocaleString("en-GB");
const sig3 = x => +x.toPrecision(3);

const L_CX = 160, R_CX = 480, CY = 196, RADII = [28, 50, 72], OUTER = 94;
const RIGHT = { compton: "Compton scatter", coherent: "Coherent scatter" };

const TRY = [
  "Move the photon energy from <b>30 to 35 keV</b> and watch iodine jump at its K-edge.",
  "Compare <b>bone with soft tissue</b> at 30 keV, then at 100 keV. The gap narrows: this is why contrast falls as kVp rises.",
  "<b>Split soft tissue into parts.</b> Where do the photoelectric and Compton lines cross?",
  "<b>Split lead into parts</b> and cross 88 keV. Which part jumps?",
  "Look at the <b>coherent</b> part of any material. Is it ever the largest?",
];

const MARKUP = `
<div class="modes view-modes" role="group" aria-label="View">
  <button type="button" data-view="int">Interactions</button>
  <button type="button" data-view="att">Attenuation and K-edges</button>
</div>
<div data-role="v-int">
<div class="grid">
  <div class="stage">
    <svg class="pec-svg" viewBox="0 0 640 380" role="img" aria-labelledby="pec-t pec-d">
      <title id="pec-t">The photoelectric effect beside Compton or coherent scatter</title>
      <desc id="pec-d" data-role="desc"></desc>
      <rect class="pane" x="6" y="6" width="306" height="368" rx="10"/>
      <rect class="pane" x="328" y="6" width="306" height="368" rx="10"/>
      <text class="pane-t" x="${L_CX}" y="34">Photoelectric effect</text>
      <text class="pane-t" x="${R_CX}" y="34" data-role="rt"></text>
      <g data-role="scene"></g>
    </svg>
    <p class="scale-note">Schematic · not to scale · one atom of the chosen material in each panel</p>
  </div>
  <div class="panel">
    <div class="stepper">
      <div class="step-meta">
        <span class="eyebrow" data-role="count"></span>
        <div class="dots" data-role="dots" aria-hidden="true"><i></i><i></i><i></i></div>
      </div>
      <div class="caption" data-role="caption" aria-live="polite"></div>
      <div class="controls">
        <button type="button" data-role="back">Back</button>
        <button type="button" data-role="next" class="primary">Next</button>
        <button type="button" data-role="reset">Start again</button>
      </div>
    </div>
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><label for="pec-e">Photon energy</label><output for="pec-e" data-role="e-o"></output></div>
        <input type="range" id="pec-e" min="20" max="150" step="1" value="60">
      </div>
      <div class="slider">
        <div class="slider-top"><label for="pec-m">Material</label></div>
        <select id="pec-m" class="select">${Object.entries(MATERIALS).map(([k, m]) => `<option value="${k}">${m.name} (Z ≈ ${m.zEff})</option>`).join("")}</select>
      </div>
      <div class="slider">
        <div class="slider-top"><span class="label">Right-hand panel</span></div>
        <div class="modes" role="group" aria-label="Right-hand panel">${Object.entries(RIGHT).map(([k, t]) => `<button type="button" data-right="${k}">${t}</button>`).join("")}</div>
      </div>
      <div class="slider" data-role="a-row">
        <div class="slider-top"><label for="pec-a">Compton scatter angle</label><output for="pec-a" data-role="a-o"></output></div>
        <input type="range" id="pec-a" min="0" max="180" step="5" value="60">
        <small>0° carries straight on; 180° bounces straight back.</small>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Photoelectron</span><b data-role="r-pe"></b></div>
      <div class="readout"><span>Characteristic photon</span><b data-role="r-ch"></b></div>
      <div class="readout"><span>Scattered photon</span><b data-role="r-sc"></b></div>
      <div class="readout"><span>Recoil electron</span><b data-role="r-re"></b></div>
    </div>
    <div class="summary share">
      <h3>Which is more likely?</h3>
      <div class="share-row"><span>Photoelectric</span><div class="share-bar"><i data-role="b-pe"></i></div><b data-role="s-pe"></b></div>
      <div class="share-row"><span>Compton</span><div class="share-bar"><i class="alt" data-role="b-co"></i></div><b data-role="s-co"></b></div>
      <div class="share-row"><span>Coherent</span><div class="share-bar"><i class="alt2" data-role="b-coh"></i></div><b data-role="s-coh"></b></div>
      <p data-role="share-note"></p>
      <p class="scale-note">Share of interactions in the chosen material, from NIST XCOM reference data. Pair production needs more than 1,022 keV, so it never happens at these energies.</p>
    </div>
  </div>
</div>
</div>
<div data-role="v-att" class="att-view" hidden>
<div class="grid">
  <div class="stage">
    <svg class="att-svg" viewBox="0 0 640 400" role="img" aria-labelledby="att-t att-d">
      <title id="att-t">Attenuation per gram against photon energy, with K-edges</title>
      <desc id="att-d" data-role="att-desc"></desc>
      <defs><clipPath id="att-clip"><rect data-role="att-cliprect"/></clipPath></defs>
      <g class="axis" data-role="att-axes"></g>
      <g data-role="att-curves" clip-path="url(#att-clip)"></g>
      <g data-role="att-marks"></g>
    </svg>
    <div class="legend" data-role="att-legend"></div>
    <p class="scale-note">Attenuation per gram of material (mass attenuation coefficient, cm²/g), on log scales. NIST XCOM reference data. Bone is also about twice as dense as soft tissue, so per centimetre it attenuates about twice as much again.</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><label for="att-e">Photon energy</label><output for="att-e" data-role="att-e-o"></output></div>
        <input type="range" id="att-e" min="20" max="150" step="1" value="60">
      </div>
      <div class="slider">
        <div class="slider-top"><span class="label">Show</span></div>
        <div class="modes" role="group" aria-label="Materials shown">${Object.entries(SHORT).map(([k, t]) => `<button type="button" data-show="${k}">${t}</button>`).join("")}</div>
      </div>
      <div class="slider">
        <div class="slider-top"><label for="att-p">Split into parts</label></div>
        <select id="att-p" class="select"><option value="">Totals only</option>${Object.entries(SHORT).map(([k, t]) => `<option value="${k}">${t}</option>`).join("")}</select>
        <small>Shows how the photoelectric effect, Compton scatter and coherent scatter add up to one material's total.</small>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Soft tissue</span><b data-role="a-tissue"></b><span>per gram</span></div>
      <div class="readout"><span>Bone</span><b data-role="a-bone"></b><span>soft tissue, per gram</span></div>
      <div class="readout"><span>Iodine</span><b data-role="a-iodine"></b><span>soft tissue, per gram</span></div>
      <div class="readout"><span>Lead</span><b data-role="a-lead"></b><span>soft tissue, per gram</span></div>
    </div>
    <p class="summary" data-role="att-sum" aria-live="polite"></p>
    <div class="try">
      <h3>Try this</h3>
      <ol>${TRY.map(t => `<li>${t}</li>`).join("")}</ol>
    </div>
  </div>
</div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const eIn = root.querySelector("#pec-e"), mIn = root.querySelector("#pec-m"), aIn = root.querySelector("#pec-a");
  const attE = root.querySelector("#att-e"), partsIn = root.querySelector("#att-p");
  const scene = $("scene");
  let alive = true, gen = 0, step = 0, right = "compton", view = "int";
  const shown = new Set(Object.keys(SHORT));

  function numbers() {
    const E = +eIn.value, key = mIn.value, m = MATERIALS[key], deg = right === "coherent" ? COH_DEG : +aIn.value;
    const shell = reachesK(E, m) ? "K" : "L", bind = shell === "K" ? m.K : m.L;
    const Es = right === "coherent" ? E : scattered(E, deg);
    const x = mu(key, E);
    return { E, key, m, deg, shell, bind, peKE: E - bind, char: shell === "K" ? m.K - m.L : m.M != null ? m.L - m.M : null, Es, Ee: E - Es, phi: recoilAngle(E, deg), x };
  }

  const photon = (g, x1, y1, x2, y2, label, o = 1, anchor = "start", atStart = false) => {
    const p = el("g", { opacity: o }, g);
    el("path", { class: "photon", d: wavy(x1, y1, x2, y2) }, p);
    if (label) el("text", { class: "fxlabel ph-t", x: atStart ? x1 : x2 + (anchor === "end" ? -4 : 6), y: (atStart ? y1 : y2) - 10, "text-anchor": atStart ? "start" : anchor }, p).textContent = label;
    return p;
  };
  const note = (g, x, y, text, o = 1) => { const t = el("text", { class: "pane-note", x, y, opacity: o }, g); t.textContent = text; return t; };

  // Draws the whole scene for step s, with t (0 to 1) as the transition from step s − 1.
  function draw(s, t = 1) {
    const n = numbers(), m = n.m;
    scene.innerHTML = "";
    const lA = drawAtom(scene, { cx: L_CX, cy: CY, counts: m.counts, radii: RADII, outerR: OUTER, label: false });
    const rA = drawAtom(scene, { cx: R_CX, cy: CY, counts: m.counts, radii: RADII, outerR: OUTER, label: false });
    const fx = el("g", {}, scene);
    const at = k => (s > k ? 1 : s === k ? t : 0);   // how far through step k we are

    // Photoelectric: the photon is absorbed by an inner electron (K, or L if the photon can't free a K electron).
    const shellIx = n.shell === "K" ? 0 : 1;
    const inner = lA.shells[shellIx].dots[0], ix = inner._x, iy = inner._y;
    photon(fx, 20, iy, ix - 10, iy, `${n.E} keV`, 1 - at(1), "start", true);
    if (at(1)) {
      vacancy(fx, ix, iy).setAttribute("opacity", at(1));
      inner.setAttribute("transform", `translate(${ix + 100 * at(1)} ${iy - 80 * at(1)})`);
      if (at(1) === 1) setLines(el("text", { class: "fxlabel el-t", x: ix + 86, y: iy - 98, "text-anchor": "end" }, fx), "photoelectron", `${r1(n.peKE)} keV`);
    }
    if (at(2) && n.char !== null && lA.shells[shellIx + 1]) {
      const l = lA.shells[shellIx + 1].dots[0], lx = l._x, ly = l._y;
      l.setAttribute("transform", `translate(${lx + (ix - lx) * at(2)} ${ly + (iy - ly) * at(2)})`);
      photon(fx, ix + 6, iy + 10, 270, 330, `${r1(n.char)} keV`, at(2), "end");
    }
    if (at(3)) note(fx, L_CX, 362, "Photon absorbed: adds contrast and patient dose", at(3));

    if (right === "compton") {
      // Compton: the photon hands part of its energy to an outer electron and carries on in a new direction.
      const outerShell = rA.shells[rA.shells.length - 1], oe = outerShell.dots[0], ox = oe._x, oy = oe._y;
      photon(fx, 342, oy, ox - 10, oy, at(1) ? null : `${n.E} keV`, at(1) ? 0.3 : 1, "start", true);   // the faded incoming photon drops its label, which would sit under the scattered one
      if (at(1)) {
        const phi = (n.phi * Math.PI) / 180, L = 110 * at(1);
        oe.setAttribute("transform", `translate(${ox + L * Math.cos(phi)} ${oy + L * Math.sin(phi)})`);
        if (at(1) === 1) setLines(el("text", { class: "fxlabel el-t", x: Math.min(ox + 110 * Math.cos(phi), 600), y: oy + 110 * Math.sin(phi) + 22, "text-anchor": "middle" }, fx), "recoil electron", `${r1(n.Ee)} keV`);
      }
      if (at(2)) {
        const th = (n.deg * Math.PI) / 180, L = 110;
        const x2 = Math.max(342, Math.min(624, ox + L * Math.cos(th))), y2 = Math.max(84, oy - L * Math.sin(th));
        photon(fx, ox + 4, oy, x2, y2, `${r1(n.Es)} keV`, at(2), x2 > 560 ? "end" : "start");
      }
      if (at(3)) note(fx, R_CX, 362, "Scatter: fogs the image, dose to staff", at(3));
    } else {
      // Coherent: the whole atom takes up the photon, its electrons vibrate together, and it sends out
      // a photon of the same energy a little way off the original path. No electron leaves.
      const inX = R_CX - 40;
      photon(fx, 342, CY, inX, CY, at(1) ? null : `${n.E} keV`, at(1) ? 0.3 : 1, "start", true);
      const glow = at(1) * (1 - at(2));
      if (glow) {
        el("circle", { class: "coh-ring", cx: R_CX, cy: CY, r: OUTER + 6, opacity: glow }, fx);
        const wob = s === 1 && t < 1 ? 2.5 * Math.sin(t * Math.PI * 10) : 0;   // the electrons vibrate as the photon arrives
        if (wob) for (const sh of rA.shells) for (const d of sh.dots) d.setAttribute("transform", `translate(${d._x + wob} ${d._y})`);
      }
      if (at(2)) {
        const th = (COH_DEG * Math.PI) / 180, x1 = R_CX + 40 * Math.cos(th), y1 = CY - 40 * Math.sin(th);
        const x2 = 622, y2 = y1 - (x2 - x1) * Math.tan(th);
        photon(fx, x1, y1, x2, y2, `${n.E} keV`, at(2), "end");
      }
      if (at(3)) note(fx, R_CX, 362, "Same energy, new direction: no ionisation", at(3));
    }
    // Each label stays inside its own pane, however large the text has grown.
    for (const label of fx.querySelectorAll(".fxlabel")) {
      const left = +label.getAttribute("x") < 320;
      keepInside(label, left ? 12 : 334, left ? 306 : 628);
    }
  }

  const PE_TEXT = n => [
    `On the left it meets a tightly bound <b>inner-shell</b> electron`,
    `<b>Photoelectric:</b> the photon is <b>completely absorbed</b>. Its energy frees the ${n.shell}-shell electron (binding energy ${r1(n.bind) || n.bind} keV), which leaves as a <b>photoelectron</b> with the rest: ${n.E} − ${n.bind} ≈ ${r1(n.peKE)} keV.${n.shell === "L" ? ` The photon has no more than the ${n.m.K} keV needed for the K shell, so it takes an L-shell electron instead.` : ""}`,
    `<b>Photoelectric:</b> ${n.char !== null ? `an outer electron fills the vacancy, giving a characteristic photon of about ${r1(n.char)} keV${n.char < 5 ? ", too weak to travel far: it is absorbed close by" : ""}.` : "an outer electron fills the vacancy, giving low-energy characteristic radiation that is absorbed close by."} No photon carries on.`,
    `<b>Photoelectric:</b> absorbed photons never reach the detector, and tissues absorb by different amounts, so this effect gives the image its <b>contrast</b>. All the photon's energy stays in the patient as <b>dose</b>.`,
  ];
  const RIGHT_TEXT = {
    compton: n => [
      `on the right a loosely bound <b>outer-shell</b> electron.`,
      `<b>Compton:</b> the photon gives <b>part</b> of its energy to the outer electron, which recoils with ${r1(n.Ee)} keV.`,
      `<b>Compton:</b> the photon carries on with less energy (${r1(n.Es)} keV) in a new direction, ${n.deg}° from its path. Larger angles take more energy from the photon.`,
      `<b>Compton:</b> scattered photons travel in random directions. Those that reach the detector add <b>fog</b> and reduce contrast; those that leave the patient are the main source of <b>dose to staff</b>.`,
    ],
    coherent: n => [
      `on the right it meets the <b>atom as a whole</b>. This is coherent scatter, also called unmodified scatter.`,
      `<b>Coherent:</b> the photon's energy is taken up for an instant by the atom's electrons, which vibrate together. <b>No electron is freed.</b>`,
      `<b>Coherent:</b> the atom gives the energy straight back as a photon of the <b>same energy</b> (${n.E} keV), usually only a small angle from its path.`,
      `<b>Coherent:</b> no ionisation, so almost no dose. The slightly deflected photons add a little <b>fog</b>. In ${n.m.name.toLowerCase()} at ${n.E} keV it is ${pct(n.x.coh / n.x.total)}% of interactions; it matters most at low energies.`,
    ],
  };
  const TITLES = ["A photon arrives", "The interaction", "What comes out", "What it means"];
  const pct = f => Math.round(f * 100);

  const cap = $("caption"), back = $("back"), next = $("next");
  function describe() {
    const n = numbers(), pe = PE_TEXT(n), rt = RIGHT_TEXT[right](n);
    const d = step === 0
      ? `Two ${n.E} keV photons approach atoms of ${n.m.name.toLowerCase()} (${n.m.atom} is drawn). ${pe[0]}; ${rt[0]}`
      : `${pe[step]} ${rt[step]}`;
    $("e-o").textContent = `${n.E} keV`;
    $("a-o").textContent = `${n.deg}°`;
    $("rt").textContent = RIGHT[right];
    $("a-row").hidden = right !== "compton";
    root.querySelectorAll("[data-right]").forEach(b => b.setAttribute("aria-pressed", b.dataset.right === right));
    $("count").textContent = `Step ${step} of 3`;
    [...$("dots").children].forEach((dot, i) => dot.classList.toggle("on", i < step));
    cap.innerHTML = `<strong>${TITLES[step]}</strong><p>${d}</p>`;
    back.disabled = step === 0; next.disabled = step === 3;
    $("r-pe").textContent = `${r1(n.peKE)} keV (${n.shell} shell)`;
    $("r-ch").textContent = n.char !== null ? `≈ ${r1(n.char)} keV` : "Too weak to matter";
    $("r-sc").textContent = right === "compton" ? `${r1(n.Es)} keV at ${n.deg}°` : `${n.E} keV, energy unchanged`;
    $("r-re").textContent = right === "compton" ? `${r1(n.Ee)} keV` : "None: no electron freed";

    // Shares of interactions from the reference data, rounded to whole percentages that add to 100.
    const peS = pct(n.x.pe / n.x.total), cohS = pct(n.x.coh / n.x.total), coS = 100 - peS - cohS;
    for (const [k, v] of [["pe", peS], ["co", coS], ["coh", cohS]]) { $(`b-${k}`).style.width = `${v}%`; $(`s-${k}`).textContent = `${v}%`; }
    const where = `In ${n.m.name.toLowerCase()} at ${n.E} keV`;
    let msg = Math.abs(peS - coS) <= 6
      ? `${where} the photoelectric effect and Compton scatter are about equally likely.`
      : peS > coS
        ? `${where} the photoelectric effect is most likely. It falls steeply as energy rises and rises steeply with atomic number.`
        : `${where} Compton scatter is most likely. Compton depends little on atomic number, so it dominates in soft tissue above about 27 keV.`;
    const edge = EDGES[n.key];
    if (edge && n.E > edge && n.E <= edge + 10) msg += ` The photon is just above the K-edge (${r1(edge)} keV), so it can now free K-shell electrons: the photoelectric effect jumps.`;
    else if (edge && n.E <= edge && n.E >= edge - 8) msg += ` The photon is just below the K-edge (${r1(edge)} keV), so it can't yet free K-shell electrons. Move above ${Math.floor(edge)} keV and watch the photoelectric share jump.`;
    $("share-note").textContent = msg;
    $("desc").textContent = `Two panels. Left: photoelectric effect. Right: ${RIGHT[right].toLowerCase()}. ${cap.textContent}`;
  }

  let animating = false;
  function jumpTo(s) { gen++; animating = false; step = s; draw(step); describe(); }
  async function forward() {
    if (animating) jumpTo(step);
    if (step >= 3) return;
    const my = ++gen;
    step++; describe();
    animating = true;
    await tween(1100, t => draw(step, t), () => alive && gen === my);
    if (gen === my) animating = false;
  }
  back.addEventListener("click", () => jumpTo(Math.max(0, step - 1)));
  next.addEventListener("click", forward);
  $("reset").addEventListener("click", () => jumpTo(0));
  [mIn, aIn].forEach(i => i.addEventListener("input", () => jumpTo(step)));
  eIn.addEventListener("input", () => { attE.value = eIn.value; jumpTo(step); });
  root.querySelectorAll("[data-right]").forEach(b => b.addEventListener("click", () => { right = b.dataset.right; jumpTo(0); }));

  // ---------- Attenuation view ----------
  const PX0 = 76, PX1 = 620, PY0 = 60, PY1 = 340, EMIN = 20, EMAX = 150;
  let yLo = 0.1;
  const Y_HI = 100;
  const sx = E => PX0 + (Math.log(E / EMIN) / Math.log(EMAX / EMIN)) * (PX1 - PX0);
  const sy = v => PY1 - (Math.log10(v / yLo) / Math.log10(Y_HI / yLo)) * (PY1 - PY0);
  const path = pts => pts.map(([E, v], i) => `${i ? "L" : "M"}${sx(E).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");
  const colour = k => `var(--m-${k})`;
  // Where each material's name sits: just above its curve at energy E, to the right, where the curve falls away.
  const LABEL_AT = { tissue: [25, "above"], bone: [25, "above"], iodine: [40, "above"], lead: [110, "above"] };
  const PART_NAMES = { pe: "photoelectric", inc: "Compton", coh: "coherent" };
  const cliprect = $("att-cliprect");
  cliprect.setAttribute("x", PX0); cliprect.setAttribute("y", PY0 - 1); cliprect.setAttribute("width", PX1 - PX0); cliprect.setAttribute("height", PY1 - PY0 + 2);

  function drawAttAxes() {
    const axes = $("att-axes");
    axes.innerHTML = "";
    for (const E of [20, 30, 40, 50, 60, 80, 100, 150]) {
      el("line", { class: "grid-l", x1: sx(E), y1: PY0, x2: sx(E), y2: PY1 }, axes);
      el("text", { x: sx(E), y: PY1 + 18, "text-anchor": "middle" }, axes).textContent = E;
    }
    for (let p = Math.round(Math.log10(yLo)); p <= 2; p++) {
      const v = 10 ** p, y = sy(v);
      el("line", { class: "grid-l", x1: PX0, y1: y, x2: PX1, y2: y }, axes);
      el("text", { ...(v === yLo ? { class: "wide-only" } : {}), x: PX0 - 8, y: y + 4, "text-anchor": "end" }, axes).textContent = v.toLocaleString("en-GB", { maximumFractionDigits: 3 });
    }
    el("path", { d: `M${PX0} ${PY0} V${PY1} H${PX1}`, fill: "none" }, axes);
    el("text", { class: "ax-title", x: (PX0 + PX1) / 2, y: PY1 + 44, "text-anchor": "middle" }, axes).textContent = "Photon energy (keV)";
    el("text", { class: "ax-title wide-only", x: 14, y: (PY0 + PY1) / 2, "text-anchor": "middle", transform: `rotate(-90 14 ${(PY0 + PY1) / 2})` }, axes).textContent = "Attenuation per gram (cm²/g)";
  }

  function updateAtt() {
    const E = +attE.value, split = partsIn.value;
    if (split) shown.add(split);
    yLo = split ? 0.001 : 0.1;
    $("att-e-o").textContent = `${E} keV`;
    root.querySelectorAll("[data-show]").forEach(b => b.setAttribute("aria-pressed", shown.has(b.dataset.show)));
    drawAttAxes();

    const curves = $("att-curves"), marks = $("att-marks");
    curves.innerHTML = ""; marks.innerHTML = "";
    for (const k of Object.keys(SHORT)) {
      if (!shown.has(k)) continue;
      const faded = split && split !== k;
      if (split === k) for (const part of ["coh", "inc", "pe"]) el("path", { class: `att-curve part ${part}`, d: path(curve(k, part)), style: `stroke:${colour(k)}` }, curves);
      el("path", { class: `att-curve${faded ? " faded" : ""}`, d: path(curve(k, "total")), style: `stroke:${colour(k)}` }, curves);
    }
    // K-edges: a dotted line at each shown material's edge, named in the top row.
    for (const [k, edge] of Object.entries(EDGES)) {
      if (!shown.has(k)) continue;
      el("line", { class: "edge-l", x1: sx(edge), y1: PY0, x2: sx(edge), y2: PY1 }, marks);
      el("text", { class: "edge-t wide-only", x: sx(edge), y: 22, "text-anchor": "middle" }, marks).textContent = `${SHORT[k]} K-edge, ${edge.toFixed(1)} keV`;
      el("text", { class: "edge-t narrow-only", x: sx(edge), y: 22, "text-anchor": "middle" }, marks).textContent = `${SHORT[k]} K-edge`;   // the energies would touch on a phone
    }
    // The chosen energy: a dashed line, named in the second row, with a dot where it meets each shown total.
    const mx = sx(E);
    el("line", { class: "e-mark", x1: mx, y1: PY0, x2: mx, y2: PY1 }, marks);
    const near = mx < PX0 + 40 ? "start" : mx > PX1 - 40 ? "end" : "middle";
    el("text", { class: "mark-t", x: mx, y: PY0 - 12, "text-anchor": near }, marks).textContent = `${E} keV`;
    for (const k of Object.keys(SHORT)) if (shown.has(k)) el("circle", { class: "att-dot", cx: mx, cy: sy(mu(k, E).total), r: 4.5, style: `fill:${colour(k)}` }, marks);
    // Material names beside their curves.
    for (const k of Object.keys(SHORT)) {
      if (!shown.has(k)) continue;
      const [lE, side] = LABEL_AT[k], v = mu(k, lE).total;
      el("text", { class: "att-label", x: sx(lE) + (side === "above" ? 3 : -3), y: sy(v) + (side === "above" ? -8 : 17), "text-anchor": side === "above" ? "start" : "end" }, marks).textContent = SHORT[k];
    }

    // Legend: line styles (the parts) when split, otherwise the marks.
    const swatch = cls => `<svg class="key-swatch" viewBox="0 0 28 8" aria-hidden="true"><line class="att-curve ${cls}" x1="2" y1="4" x2="26" y2="4" style="stroke:${colour(split)}"/></svg>`;
    $("att-legend").innerHTML = split
      ? `<span>${swatch("")}${SHORT[split]}, total</span>` +
        Object.entries(PART_NAMES).map(([p, nm]) => `<span>${swatch(`part ${p}`)}${nm}</span>`).join("")
      : `<span><i class="edge-key"></i>K-edge</span><span><i class="e-key"></i>chosen energy</span>`;

    // Readouts, against soft tissue.
    const t = mu("tissue", E).total;
    $("a-tissue").textContent = `${sig3(t)} cm²/g`;
    for (const k of ["bone", "iodine", "lead"]) $(`a-${k}`).textContent = `× ${times(mu(k, E).total / t)}`;

    // What it means at this energy.
    const ratio = (k, e) => mu(k, e).total / mu("tissue", e).total;
    let s = `At ${E} keV bone attenuates ${times(ratio("bone", E))} times as much as soft tissue per gram`;
    s += E >= 40 ? `, down from ${times(ratio("bone", 30))} times at 30 keV. As energy rises, the photoelectric effect (which depends strongly on atomic number) fades and Compton scatter (which barely does) takes over, so bone and soft tissue look more alike: less contrast.` : `. At low energies the photoelectric effect dominates, and it depends strongly on atomic number, so contrast is high.`;
    const iJump = mu("iodine", EDGES.iodine + 0.001).total / mu("iodine", EDGES.iodine).total;
    const pbJump = mu("lead", EDGES.lead + 0.001).total / mu("lead", EDGES.lead).total;
    if (E <= 33) s += ` Iodine is below its K-edge (33.2 keV): its photons can't yet free K-shell electrons. Just above the edge, iodine attenuates about ${times(iJump)} times more.`;
    else if (E <= 50) s += ` Just above its K-edge (33.2 keV), iodine attenuates ${times(ratio("iodine", E))} times as much as soft tissue per gram. This is why iodine contrast shows up best when many of the beam's photons are just above 33 keV.`;
    else if (E < 75) s += ` Iodine attenuates ${times(ratio("iodine", E))} times as much as soft tissue per gram here, less than just above its K-edge at 33.2 keV.`;
    else s += ` Lead absorbs strongly across the whole diagnostic range because of its high atomic number, which is why it is used for shielding. Just above its K-edge (88.0 keV) it attenuates about ${times(pbJump)} times more than just below.`;
    $("att-sum").textContent = s;
    $("att-desc").textContent = `Log-log graph of attenuation per gram against photon energy from 20 to 150 keV for ${[...shown].map(k => SHORT[k].toLowerCase()).join(", ")}. Each falls as energy rises; iodine jumps at 33.2 keV and lead at 88.0 keV. ${s}`;
  }

  attE.addEventListener("input", () => { eIn.value = attE.value; updateAtt(); });
  partsIn.addEventListener("input", updateAtt);
  root.querySelectorAll("[data-show]").forEach(b => b.addEventListener("click", () => {
    const k = b.dataset.show;
    if (shown.has(k) && shown.size > 1) { shown.delete(k); if (partsIn.value === k) partsIn.value = ""; }
    else shown.add(k);
    updateAtt();
  }));

  function setView(v) {
    view = v;
    $("v-int").hidden = v !== "int"; $("v-att").hidden = v !== "att";
    root.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", b.dataset.view === v));
    if (v === "att") updateAtt(); else jumpTo(step);
  }
  root.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => setView(b.dataset.view)));
  setView("int");

  return () => { alive = false; };
}

// It moves by itself (flowing photons or electrons), so the page offers a "Pause motion" button for it.
export const moving = true;
