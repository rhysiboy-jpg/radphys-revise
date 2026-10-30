// Explorer: the photoelectric effect and Compton scatter, side by side, stepped together.
import { svgEl as el, wavy, tween } from "./util.js";
import { drawAtom, vacancy } from "./atom.js";

// Effective atomic number, the atom drawn for it, and its K, L (L3) and M (M5) binding energies in keV.
const MATERIALS = {
  tissue: { name: "Soft tissue", zEff: 7.4,  atom: "oxygen",  counts: [2, 6],                K: 0.53, L: 0.007, M: null },
  bone:   { name: "Bone",        zEff: 13.8, atom: "calcium", counts: [2, 8, 8, 2],          K: 4.04, L: 0.35,  M: 0.03 },
  iodine: { name: "Iodine contrast", zEff: 53, atom: "iodine", counts: [2, 8, 18, 18, 7],    K: 33.2, L: 4.56,  M: 0.62 },
  lead:   { name: "Lead",        zEff: 82,   atom: "lead",    counts: [2, 8, 18, 32, 18, 4], K: 88.0, L: 13.0,  M: 2.48 },
};
const ME = 511;   // electron rest energy, keV
const r1 = v => +v.toFixed(1);
// Compton: scattered photon energy, and the recoil electron's direction (below the original path).
const scattered = (E, deg) => E / (1 + (E / ME) * (1 - Math.cos((deg * Math.PI) / 180)));
const recoilAngle = (E, deg) => deg === 0 ? 90 : (Math.atan(1 / ((1 + E / ME) * Math.tan((deg * Math.PI) / 360))) * 180) / Math.PI;
// Illustrative share of photoelectric vs Compton from the Z³/E³ rule, set so soft tissue crosses over at about 25 keV.
const peShare = (Z, E) => { const r = (Z / 7.4) ** 3 * (25 / E) ** 3; return r / (1 + r); };

const L_CX = 160, R_CX = 480, CY = 196, RADII = [28, 50, 72], OUTER = 94;

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 640 380" role="img" aria-labelledby="pec-t pec-d">
      <title id="pec-t">Photoelectric effect and Compton scatter, side by side</title>
      <desc id="pec-d" data-role="desc"></desc>
      <rect class="pane" x="6" y="6" width="306" height="368" rx="10"/>
      <rect class="pane" x="328" y="6" width="306" height="368" rx="10"/>
      <text class="pane-t" x="${L_CX}" y="34">Photoelectric effect</text>
      <text class="pane-t" x="${R_CX}" y="34">Compton scatter</text>
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
      <p data-role="share-note"></p>
      <p class="scale-note">Illustrative, from the Z³/E³ rule. Ignores absorption edges and other interactions.</p>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const eIn = root.querySelector("#pec-e"), mIn = root.querySelector("#pec-m"), aIn = root.querySelector("#pec-a");
  const scene = $("scene");
  let alive = true, gen = 0, step = 0;

  function numbers() {
    const E = +eIn.value, m = MATERIALS[mIn.value], deg = +aIn.value;
    const shell = E >= m.K ? "K" : "L", bind = shell === "K" ? m.K : m.L;
    const Es = scattered(E, deg);
    return { E, m, deg, shell, bind, peKE: E - bind, char: shell === "K" ? m.K - m.L : m.M != null ? m.L - m.M : null, Es, Ee: E - Es, phi: recoilAngle(E, deg), share: peShare(m.zEff, E) };
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
      if (at(1) === 1) el("text", { class: "fxlabel el-t", x: ix + 112, y: iy - 98, "text-anchor": "end" }, fx).textContent = `photoelectron ${r1(n.peKE)} keV`;
    }
    if (at(2) && n.char !== null && lA.shells[shellIx + 1]) {
      const l = lA.shells[shellIx + 1].dots[0], lx = l._x, ly = l._y;
      l.setAttribute("transform", `translate(${lx + (ix - lx) * at(2)} ${ly + (iy - ly) * at(2)})`);
      photon(fx, ix + 6, iy + 10, 270, 330, `${r1(n.char)} keV`, at(2), "end");
    }
    if (at(3)) {
      note(fx, L_CX, 362, "Photon absorbed: adds contrast and patient dose", at(3));
    }

    // Compton: the photon hands part of its energy to an outer electron and carries on in a new direction.
    const outerShell = rA.shells[rA.shells.length - 1], oe = outerShell.dots[0], ox = oe._x, oy = oe._y;
    photon(fx, 342, oy, ox - 10, oy, `${n.E} keV`, at(1) ? 0.3 : 1, "start", true);
    if (at(1)) {
      const phi = (n.phi * Math.PI) / 180, L = 110 * at(1);
      oe.setAttribute("transform", `translate(${ox + L * Math.cos(phi)} ${oy + L * Math.sin(phi)})`);
      if (at(1) === 1) el("text", { class: "fxlabel el-t", x: Math.min(ox + 110 * Math.cos(phi), 600), y: oy + 110 * Math.sin(phi) + 22, "text-anchor": "middle" }, fx).textContent = `recoil electron ${r1(n.Ee)} keV`;
    }
    if (at(2)) {
      const th = (n.deg * Math.PI) / 180, L = 110;
      const x2 = Math.max(342, Math.min(624, ox + L * Math.cos(th))), y2 = Math.max(70, oy - L * Math.sin(th));
      photon(fx, ox + 4, oy, x2, y2, `${r1(n.Es)} keV`, at(2), x2 > 560 ? "end" : "start");
    }
    if (at(3)) note(fx, R_CX, 362, "Scatter: fogs the image, dose to staff", at(3));
  }

  const STEP_TEXT = n => [
    { t: "A photon arrives", d: `Two ${n.E} keV photons approach atoms of ${n.m.name.toLowerCase()} (${n.m.atom} is drawn). On the left it meets a tightly bound <b>inner-shell</b> electron; on the right a loosely bound <b>outer-shell</b> electron.` },
    { t: "The interaction", d: `<b>Photoelectric:</b> the photon is <b>completely absorbed</b>. Its energy frees the ${n.shell}-shell electron (binding energy ${r1(n.bind) || n.bind} keV), which leaves as a <b>photoelectron</b> with the rest: ${n.E} − ${n.bind} ≈ ${r1(n.peKE)} keV.${n.shell === "L" ? ` The photon has less than the ${n.m.K} keV needed for the K shell, so it takes an L-shell electron instead.` : ""} <b>Compton:</b> the photon gives <b>part</b> of its energy to the outer electron, which recoils with ${r1(n.Ee)} keV.` },
    { t: "What comes out", d: `<b>Photoelectric:</b> ${n.char !== null ? `an outer electron fills the vacancy, giving a characteristic photon of about ${r1(n.char)} keV${n.char < 5 ? ", too weak to travel far: it is absorbed close by" : ""}.` : "an outer electron fills the vacancy, giving low-energy characteristic radiation that is absorbed close by."} No photon carries on. <b>Compton:</b> the photon carries on with less energy (${r1(n.Es)} keV) in a new direction, ${n.deg}° from its path. Larger angles take more energy from the photon.` },
    { t: "What it means", d: `<b>Photoelectric:</b> absorbed photons never reach the detector, and tissues absorb by different amounts, so this effect gives the image its <b>contrast</b>. All the photon's energy stays in the patient as <b>dose</b>. <b>Compton:</b> scattered photons travel in random directions. Those that reach the detector add <b>fog</b> and reduce contrast; those that leave the patient are the main source of <b>dose to staff</b>.` },
  ];

  const cap = $("caption"), back = $("back"), next = $("next");
  function describe() {
    const n = numbers(), st = STEP_TEXT(n)[step];
    $("e-o").textContent = `${n.E} keV`;
    $("a-o").textContent = `${n.deg}°`;
    $("count").textContent = `Step ${step} of 3`;
    [...$("dots").children].forEach((d, i) => d.classList.toggle("on", i < step));
    cap.innerHTML = `<strong>${st.t}</strong><p>${st.d}</p>`;
    back.disabled = step === 0; next.disabled = step === 3;
    $("r-pe").textContent = `${r1(n.peKE)} keV (${n.shell} shell)`;
    $("r-ch").textContent = n.char !== null ? `≈ ${r1(n.char)} keV` : "Too weak to matter";
    $("r-sc").textContent = `${r1(n.Es)} keV at ${n.deg}°`;
    $("r-re").textContent = `${r1(n.Ee)} keV`;
    const pe = Math.round(n.share * 20) * 5, co = 100 - pe;
    $("b-pe").style.width = `${pe}%`; $("b-co").style.width = `${co}%`;
    $("s-pe").textContent = `${pe}%`; $("s-co").textContent = `${co}%`;
    $("share-note").textContent = pe > 55
      ? `In ${n.m.name.toLowerCase()} at ${n.E} keV the photoelectric effect is more likely. It falls steeply as energy rises and rises steeply with atomic number.`
      : pe < 45
        ? `In ${n.m.name.toLowerCase()} at ${n.E} keV Compton scatter is more likely. Compton depends little on atomic number, so it dominates in soft tissue at most diagnostic energies.`
        : `In ${n.m.name.toLowerCase()} at ${n.E} keV the two are about equally likely.`;
    $("desc").textContent = `Two panels. Left: photoelectric effect. Right: Compton scatter. ${cap.textContent}`;
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
  [eIn, mIn, aIn].forEach(i => i.addEventListener("input", () => jumpTo(step)));
  jumpTo(0);

  return () => { alive = false; };
}
