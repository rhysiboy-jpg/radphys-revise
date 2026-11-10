// Explorer: what happens when one electron reaches a tungsten atom in the target. The lecture's four interactions:
// outer-shell excitation and outer-shell ionisation (both heat), inner-shell ionisation (characteristic radiation, or an
// Auger electron), and braking (Bremsstrahlung).
// Simplified: one electron meeting one atom, where a real electron has many interactions on its way into the target. Shells are drawn as circles and the outer shells are summarised. Not to scale.
import { svgEl as el, wavy, tween, setLines } from "./util.js";
import { drawAtom, electron, moveTo, vacancy } from "./atom.js";

const W = { K: 69.5, L: 10.2, L2: 11.5, M: 1.8 }; // tungsten binding energies, keV (L3 is the sub-shell Kα comes from; L2 for the Auger estimate; M5 for the L-line)
const KA = +(W.K - W.L).toFixed(1);      // 59.3 keV
const LA = +(W.L - W.M).toFixed(1);      // 8.4 keV: the L-line from the M electron that fills the L-shell gap
const AUGER = Math.round(W.K - W.L - W.L2);   // a KLL Auger electron, roughly 48 keV
const YIELD = 95;                        // % of K-shell vacancies in tungsten that give a photon (fluorescence yield ≈ 0.95)
const CX = 330, CY = 214, RADII = [42, 72, 102], OUTER = 132;

// Bremsstrahlung: how close the electron passes the nucleus. Closer means a sharper turn and a bigger photon.
// Fractions are illustrative; the trend (closer → more energy, a direct hit → all of it) is the physics.
const CLOSE = [
  { label: "Far from the nucleus", b: 128, turn: 10, f: 0.08 },
  { label: "Fairly far", b: 96, turn: 24, f: 0.22 },
  { label: "Close", b: 66, turn: 46, f: 0.45 },
  { label: "Very close", b: 38, turn: 80, f: 0.75 },
  { label: "Direct hit on the nucleus (rare)", b: 0, turn: 0, f: 1 },
];
const MODES = { excite: "1 Excitation", ionise: "2 Outer ionisation", char: "3 Inner ionisation", brems: "4 Braking" };
const MODE_NAME = { excite: "Excitation (outer shell)", ionise: "Ionisation (outer shell)", char: "Ionisation (inner shell)", brems: "Electron braking" };

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 620 420" role="img" aria-labelledby="tgt-t tgt-d">
      <title id="tgt-t">An electron reaching a tungsten atom in the target</title>
      <desc id="tgt-d" data-role="desc"></desc>
      <g data-role="atom"></g>
      <g data-role="fx"></g>
      <text class="fxlabel el-t" x="16" y="404" data-role="inlabel"></text>
    </svg>
    <p class="scale-note">Schematic · not to scale · one tungsten atom (Z = 74), outer shells summarised</p>
  </div>
  <div class="panel">
    <div class="stepper">
      <div class="modes" role="group" aria-label="Interaction">${Object.entries(MODES).map(([k, v]) => `<button type="button" data-mode="${k}" aria-pressed="${k === "brems"}">${v}</button>`).join("")}</div>
      <div class="caption" data-role="caption" aria-live="polite"></div>
      <div class="controls">
        <button type="button" class="primary" data-role="fire">Fire an electron</button>
      </div>
    </div>
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><label for="tgt-kv">Tube voltage</label><output for="tgt-kv" data-role="kv-o"></output></div>
        <input type="range" id="tgt-kv" min="40" max="150" step="1" value="80">
        <small>Each electron arrives with this energy in keV.</small>
      </div>
      <div class="slider" data-role="after-row">
        <div class="slider-top"><span class="label">When the K-shell vacancy fills</span></div>
        <div class="modes" role="group" aria-label="When the K-shell vacancy fills">
          <button type="button" data-after="photon" aria-pressed="true">X-ray photon (about ${YIELD}%)</button>
          <button type="button" data-after="auger" aria-pressed="false">Auger electron (about ${100 - YIELD}%)</button>
        </div>
      </div>
      <div class="slider" data-role="close-row">
        <div class="slider-top"><label for="tgt-b">Path past the nucleus</label><output for="tgt-b" data-role="b-o"></output></div>
        <input type="range" id="tgt-b" min="0" max="4" step="1" value="2">
        <small>Bremsstrahlung only. Move right for a closer pass.</small>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Electron arrives with</span><b data-role="r-in"></b></div>
      <div class="readout"><span>X-ray photon</span><b data-role="r-ph"></b></div>
      <div class="readout"><span>Electron leaves with</span><b data-role="r-out"></b></div>
      <div class="readout"><span>How often</span><b data-role="r-often"></b></div>
    </div>
    <div class="try">
      <h3>Try this</h3>
      <ol>
        <li><b>Fire Bremsstrahlung at every distance.</b> Each one gives a different photon energy, which is why the spectrum is a continuous curve.</li>
        <li><b>Set a direct hit.</b> The photon takes all the electron's energy: this is the maximum photon energy, equal to the kVp.</li>
        <li><b>Characteristic below 70 kVp.</b> The electron can't remove a K-shell electron, so there's no 59 keV line.</li>
        <li><b>Compare 1 and 2.</b> Both end as heat: the two outer-shell interactions are why about 99% of the energy is lost as heat.</li>
        <li><b>Watch the second drop.</b> After the Kα photon, an M-shell electron fills the gap left in the L shell and gives out a weak ${LA} keV photon, too weak to leave the tube.</li>
        <li><b>Try the Auger electron.</b> The same energy that would make a 59 keV photon throws out an outer electron instead. In tungsten that happens only about 1 time in 20.</li>
      </ol>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const kvIn = root.querySelector("#tgt-kv"), bIn = root.querySelector("#tgt-b");
  const atomLayer = $("atom"), fx = $("fx");
  let alive = true, gen = 0, mode = "brems", after = "photon";
  let atom;
  drawScene();

  function drawScene() {
    atomLayer.innerHTML = ""; fx.innerHTML = "";
    atom = drawAtom(atomLayer, { cx: CX, cy: CY, counts: [2, 8, 18, 32, 12, 2], radii: RADII, outerR: OUTER, z: 74 });
  }
  const photon = (x1, y1, x2, y2, label, below, weak = false) => {
    const g = el("g", { opacity: 0 }, fx);
    el("path", { class: weak ? "photon weak" : "photon", d: wavy(x1, y1, x2, y2) }, g);
    el("text", { class: "fxlabel ph-t", x: x2 - 4, y: below ? y2 + 20 : y2 - 10, "text-anchor": "end" }, g).textContent = label;
    return g;
  };
  const along = (path, node) => t => { const p = path.getPointAtLength(t * path.getTotalLength()); moveTo(node, p.x, p.y); };

  // The outcome of firing with the current settings, used by the caption and readouts before and after firing.
  function outcome() {
    const kV = +kvIn.value, c = CLOSE[+bIn.value];
    if (mode === "excite") return {
      t: "1 · Excitation (outer shell)",
      d: `The electron gives a small amount of its energy to an outer-shell electron, lifting it to a higher level. That electron soon drops back, and the energy ends up as <b>heat</b>. The incident electron loses only a few electronvolts and carries on to do the same again, thousands of times.`,
      ph: "None: heat", out: `≈ ${kV} keV (tiny loss)`, often: "Very common" };
    if (mode === "ionise") return {
      t: "2 · Ionisation (outer shell)",
      d: `A larger share of energy goes to an outer-shell electron, enough to remove it from the atom. It may go on to ionise other atoms. A free electron fills the gap, releasing its excess energy as <b>heat</b>. Together with excitation, this is why about <b>99%</b> of the electrons' energy becomes heat in the target.`,
      ph: "None: heat", out: `≈ ${kV} keV (small loss)`, often: "Very common" };
    if (mode === "brems") {
      const e = +(kV * c.f).toFixed(1);
      return {
        t: c.b ? "Braking radiation" : "A direct hit on the nucleus",
        d: c.b
          ? `The electron passes ${c.label.toLowerCase()} and is pulled towards the positive nucleus. It slows and changes direction, and the energy it loses leaves as an X-ray photon of <b>${e} keV</b>. Closer passes mean sharper turns and higher-energy photons. <b>Bremsstrahlung</b> is German for "braking radiation".`
          : `Rarely, the electron is stopped dead by the nucleus. All of its ${kV} keV becomes one photon of <b>${kV} keV</b>: the highest energy any photon in the beam can have, which is why the maximum photon energy equals the kVp.`,
        ph: `${e} keV`, out: c.b ? `${+(kV - e).toFixed(1)} keV` : "Stopped", often: "Most of the X-ray beam" };
    }
    if (kV < W.K) return {
      t: "Not enough energy for the K shell",
      d: `The electron carries ${kV} keV, less than the <b>${W.K} keV</b> holding a tungsten K-shell electron. It cannot remove it, so there's no K-characteristic radiation. It can still remove L-shell electrons, but the resulting 8–12 keV photons are absorbed by the tube window and filtration.`,
      ph: "None from the K shell", out: `≈ ${kV} keV`, often: "Only above 69.5 kVp" };
    if (after === "auger") return {
      t: "3 · Inner ionisation, then an Auger electron",
      d: `The electron knocks out a K-shell electron and an L-shell electron drops into the vacancy, as before. This time the ${KA} keV of excess energy is not given out as a photon: it pushes out a loosely bound outer electron, an <b>Auger electron</b>, with roughly ${AUGER} keV. In heavy elements such as tungsten this happens only about ${100 - YIELD}% of the time; in light elements it is the usual outcome.`,
      ph: "None: an Auger electron instead", out: `${+(kV - W.K).toFixed(1)} keV or less`, often: `About ${100 - YIELD}% of K vacancies in tungsten` };
    return {
      t: "3 · Inner ionisation: characteristic radiation",
      d: `The electron carries ${kV} keV, more than the <b>${W.K} keV</b> K-shell binding energy, so it knocks a K-shell electron out of the atom. An L-shell electron drops into the vacancy and gives out the difference as a photon: ${W.K} − ${W.L} ≈ <b>${KA} keV</b> (Kα). The energy is the same every time, whatever the kVp, which is why it shows as a sharp line on the spectrum. The drop leaves a gap in the L shell, so the cascade carries on: an M-shell electron drops into it and gives out a much weaker <b>L-line</b> photon, ${W.L} − ${W.M} ≈ <b>${LA} keV</b>. Photons this weak are absorbed by the tube window and filtration, so only the K-lines show in the beam.`,
      ph: `${KA} keV (Kα), then ≈ ${LA} keV (L)`, out: `${+(kV - W.K).toFixed(1)} keV or less`, often: `A small part of the beam (about ${YIELD}% of K vacancies give a photon)` };
  }

  function describe(fired) {
    const o = outcome(), kV = +kvIn.value;
    $("kv-o").textContent = `${kV} kVp`;
    $("b-o").textContent = CLOSE[+bIn.value].label;
    $("close-row").hidden = mode !== "brems";
    $("after-row").hidden = mode !== "char";
    root.querySelectorAll("[data-after]").forEach(b => b.setAttribute("aria-pressed", b.dataset.after === after));
    $("caption").innerHTML = `<strong>${o.t}</strong><p>${fired ? "" : "Press Fire an electron to see this. "}${o.d}</p>`;
    $("r-in").textContent = `${kV} keV`;
    $("r-ph").textContent = o.ph;
    $("r-out").textContent = o.out;
    $("r-often").textContent = o.often;
    $("inlabel").textContent = `incoming electron: ${kV} keV`;
    $("desc").textContent = `A single tungsten atom with K, L and M shells. ${MODE_NAME[mode]}. ${$("caption").textContent}`;
  }

  async function fire() {
    const my = ++gen, ok = () => alive && gen === my;
    drawScene();
    describe(true);
    const kV = +kvIn.value;
    const e = electron(fx, 20, 0);
    let path;
    if (mode === "excite" || mode === "ionise") {
      const y = CY - OUTER + 10, target = atom.shells[2].dots[4];
      path = el("path", { class: "e-path", d: `M20 ${y} L${CX - 40} ${y} Q${CX} ${y - 4} 600 ${y - 34}` }, fx);
      await tween(1400, along(path, e), ok);
      if (!ok()) return;
      const tx = target._x, ty = target._y, ux = (tx - CX) / Math.hypot(tx - CX, ty - CY), uy = (ty - CY) / Math.hypot(tx - CX, ty - CY);
      const glow = el("circle", { class: "heat-glow", cx: tx, cy: ty, r: 16, opacity: 0 }, fx);
      if (mode === "excite") {
        // Lifted to a higher level, then back down: the energy ends as heat.
        await tween(600, t => moveTo(target, tx + ux * 22 * t, ty + uy * 22 * t), ok);
        if (!ok()) return;
        const lift = el("text", { class: "fxlabel", x: tx + ux * 22 + 14, y: ty + uy * 22 - 8 }, fx);
        lift.textContent = "excited";
        await tween(700, t => { moveTo(target, tx + ux * 22 * (1 - t), ty + uy * 22 * (1 - t)); glow.setAttribute("opacity", t * 0.5); }, ok);
        lift.remove();   // back in its shell
      } else {
        // Removed from the atom; a free electron fills the gap.
        const hole = vacancy(fx, tx, ty);
        await tween(900, t => { moveTo(target, tx + ux * 170 * t, ty + uy * 170 * t); hole.setAttribute("opacity", t); }, ok);
        if (!ok()) return;
        el("text", { class: "fxlabel", x: tx + ux * 170 - 12, y: ty + uy * 170 + 24, "text-anchor": "end" }, fx).textContent = "ejected electron";
        const free = electron(fx, 40, 40);
        await tween(900, t => { moveTo(free, 40 + (tx - 40) * t, 40 + (ty - 40) * t); glow.setAttribute("opacity", t * 0.5); }, ok);
        hole.remove();
      }
      if (!ok()) return;
      el("text", { class: "fxlabel", x: tx - 30, y: ty - 26, "text-anchor": "end" }, fx).textContent = "heat";
    } else if (mode === "brems") {
      const c = CLOSE[+bIn.value];
      if (!c.b) {
        path = el("path", { class: "e-path", d: `M20 ${CY} L${CX - 18} ${CY}` }, fx);
        await tween(1200, along(path, e), ok);
        if (!ok()) return;
        const ph = photon(CX + 4, CY - 10, 590, 40, `${kV} keV photon`);
        await tween(500, t => ph.setAttribute("opacity", t), ok);
      } else {
        const a = (c.turn * Math.PI) / 180, y0 = CY - c.b, L = 230;
        const x2 = CX + 50 + L * Math.cos(a), y2 = y0 + L * Math.sin(a);
        path = el("path", { class: "e-path", d: `M20 ${y0} L${CX - 70} ${y0} Q${CX + 10} ${y0} ${x2.toFixed(1)} ${y2.toFixed(1)}` }, fx);
        await tween(1500, along(path, e), ok);
        if (!ok()) return;
        const ph = photon(CX + 4, y0 - 8, 590, Math.max(30, y0 - 120), `${+(kV * c.f).toFixed(1)} keV photon`);
        await tween(500, t => ph.setAttribute("opacity", t), ok);
      }
    } else {
      const k = atom.shells[0].dots[0], l = atom.shells[1].dots[0];
      const kx = k._x, ky = k._y, lx = l._x, ly = l._y;
      path = el("path", { class: "e-path", d: `M20 ${ky} L${kx - 8} ${ky}` }, fx);
      await tween(1200, along(path, e), ok);
      if (!ok()) return;
      if (kV < W.K) {
        el("text", { class: "fxlabel el-t", x: kx - 14, y: ky - 16, "text-anchor": "end" }, fx).textContent = "not enough energy";
        return;
      }
      const hole = vacancy(fx, kx, ky);
      await tween(900, t => { moveTo(e, kx + t * 250, ky - t * 150); moveTo(k, kx + t * 230, ky - t * 110); hole.setAttribute("opacity", t); }, ok);
      if (!ok()) return;
      if (after === "photon") {
        const ph = photon(kx + 6, ky + 8, 600, 296, `Kα ${KA} keV`, true);   // ends high enough that its label clears the outer-shell note on a phone
        await tween(900, t => { moveTo(l, lx + (kx - lx) * t, ly + (ky - ly) * t); hole.setAttribute("cx", kx + (lx - kx) * t); hole.setAttribute("cy", ky + (ly - ky) * t); ph.setAttribute("opacity", t); }, ok);
        if (!ok()) return;
        // The cascade: an M electron fills the new L-shell gap, giving a weak L-line photon. The gap moves out to the M shell.
        const m = atom.shells[2].dots[0], mx = m._x, my = m._y;
        const lph = photon(lx - 6, ly - 6, 170, 52, `L-line ≈ ${LA} keV`, false, true);
        await tween(900, t => { moveTo(m, mx + (lx - mx) * t, my + (ly - my) * t); hole.setAttribute("cx", lx + (mx - lx) * t); hole.setAttribute("cy", ly + (my - ly) * t); lph.setAttribute("opacity", t); }, ok);
      } else {
        // The excess energy throws out an outer electron instead of making a photon.
        await tween(900, t => { moveTo(l, lx + (kx - lx) * t, ly + (ky - ly) * t); hole.setAttribute("cx", kx + (lx - kx) * t); hole.setAttribute("cy", ky + (ly - ky) * t); }, ok);
        if (!ok()) return;
        const out = atom.shells[2].dots[10], ox = out._x, oy = out._y;
        await tween(900, t => moveTo(out, ox + (590 - ox) * t, oy + (262 - oy) * t), ok);
        if (!ok()) return;
        setLines(el("text", { class: "fxlabel", x: 612, y: 296, "text-anchor": "end" }, fx), "Auger electron", `≈ ${AUGER} keV`);
      }
    }
  }

  root.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    root.querySelectorAll("[data-mode]").forEach(x => x.setAttribute("aria-pressed", x === b));
    gen++; drawScene(); describe(false);
  }));
  root.querySelectorAll("[data-after]").forEach(b => b.addEventListener("click", () => { after = b.dataset.after; gen++; drawScene(); describe(false); }));
  [kvIn, bIn].forEach(i => i.addEventListener("input", () => { gen++; drawScene(); describe(false); }));
  $("fire").addEventListener("click", fire);
  describe(false);

  return () => { alive = false; };
}

// It moves by itself (flowing photons or electrons), so the page offers a "Pause motion" button for it.
export const moving = true;
