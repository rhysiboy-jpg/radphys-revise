// Explorer: what happens when one electron reaches a tungsten atom in the target. Heat, Bremsstrahlung or characteristic radiation.
import { svgEl as el, wavy, tween } from "./util.js";
import { drawAtom, electron, moveTo, vacancy } from "./atom.js";

const W = { K: 69.5, L: 10.2 };           // tungsten binding energies, keV (L3, the sub-shell Kα comes from)
const KA = +(W.K - W.L).toFixed(1);      // 59.3 keV
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
const MODES = { heat: "Heat", brems: "Bremsstrahlung", char: "Characteristic" };

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
      </ol>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const kvIn = root.querySelector("#tgt-kv"), bIn = root.querySelector("#tgt-b");
  const atomLayer = $("atom"), fx = $("fx");
  let alive = true, gen = 0, mode = "brems";
  let atom;
  drawScene();

  function drawScene() {
    atomLayer.innerHTML = ""; fx.innerHTML = "";
    atom = drawAtom(atomLayer, { cx: CX, cy: CY, counts: [2, 8, 18, 32, 12, 2], radii: RADII, outerR: OUTER, z: 74 });
  }
  const photon = (x1, y1, x2, y2, label, below) => {
    const g = el("g", { opacity: 0 }, fx);
    el("path", { class: "photon", d: wavy(x1, y1, x2, y2) }, g);
    el("text", { class: "fxlabel ph-t", x: x2 - 4, y: below ? y2 + 20 : y2 - 10, "text-anchor": "end" }, g).textContent = label;
    return g;
  };
  const along = (path, node) => t => { const p = path.getPointAtLength(t * path.getTotalLength()); moveTo(node, p.x, p.y); };

  // The outcome of firing with the current settings, used by the caption and readouts before and after firing.
  function outcome() {
    const kV = +kvIn.value, c = CLOSE[+bIn.value];
    if (mode === "heat") return {
      t: "Interaction with an outer-shell electron",
      d: `The electron passes through the outer shells and nudges an outer electron, exciting or ionising it. It loses only a few tens of electronvolts and carries on to do the same again, thousands of times. Each small loss ends up as <b>heat</b>. This is why about <b>99%</b> of the electrons' energy becomes heat in the target.`,
      ph: "None", out: `≈ ${kV} keV (tiny loss)`, often: "Almost every interaction" };
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
    return {
      t: "Characteristic radiation",
      d: `The electron carries ${kV} keV, more than the <b>${W.K} keV</b> K-shell binding energy, so it knocks a K-shell electron out of the atom. An L-shell electron drops into the vacancy and gives out the difference as a photon: ${W.K} − ${W.L} ≈ <b>${KA} keV</b> (Kα). The energy is the same every time, whatever the kVp, which is why it shows as a sharp line on the spectrum.`,
      ph: `${KA} keV (Kα)`, out: `${+(kV - W.K).toFixed(1)} keV or less`, often: "A small part of the beam" };
  }

  function describe(fired) {
    const o = outcome(), kV = +kvIn.value;
    $("kv-o").textContent = `${kV} kVp`;
    $("b-o").textContent = CLOSE[+bIn.value].label;
    $("close-row").hidden = mode !== "brems";
    $("caption").innerHTML = `<strong>${o.t}</strong><p>${fired ? "" : "Press Fire an electron to see this. "}${o.d}</p>`;
    $("r-in").textContent = `${kV} keV`;
    $("r-ph").textContent = o.ph;
    $("r-out").textContent = o.out;
    $("r-often").textContent = o.often;
    $("inlabel").textContent = `incoming electron: ${kV} keV`;
    $("desc").textContent = `A single tungsten atom with K, L and M shells. ${MODES[mode]}. ${$("caption").textContent}`;
  }

  async function fire() {
    const my = ++gen, ok = () => alive && gen === my;
    drawScene();
    describe(true);
    const kV = +kvIn.value;
    const e = electron(fx, 20, 0);
    let path;
    if (mode === "heat") {
      const y = CY - OUTER + 10, target = atom.shells[2].dots[4];
      path = el("path", { class: "e-path", d: `M20 ${y} L${CX - 40} ${y} Q${CX} ${y - 4} 600 ${y - 34}` }, fx);
      await tween(1400, along(path, e), ok);
      if (!ok()) return;
      const glow = el("circle", { class: "heat-glow", cx: target._x, cy: target._y, r: 22, opacity: 0 }, fx);
      el("text", { class: "fxlabel heat-t", x: target._x - 30, y: target._y - 26, "text-anchor": "end" }, fx).textContent = "heat";
      const tx = target._x, ty = target._y, ux = (tx - CX) / Math.hypot(tx - CX, ty - CY), uy = (ty - CY) / Math.hypot(tx - CX, ty - CY);
      await tween(600, t => { glow.setAttribute("opacity", t * 0.8); moveTo(target, tx + ux * 18 * t, ty + uy * 18 * t); }, ok);   // the outer electron is pushed up a level
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
      const ph = photon(kx + 6, ky + 8, 590, 330, `Kα ${KA} keV`, true);
      await tween(900, t => { moveTo(l, lx + (kx - lx) * t, ly + (ky - ly) * t); hole.setAttribute("cx", kx + (lx - kx) * t); hole.setAttribute("cy", ky + (ly - ky) * t); ph.setAttribute("opacity", t); }, ok);
    }
  }

  root.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    root.querySelectorAll("[data-mode]").forEach(x => x.setAttribute("aria-pressed", x === b));
    gen++; drawScene(); describe(false);
  }));
  [kvIn, bIn].forEach(i => i.addEventListener("input", () => { gen++; drawScene(); describe(false); }));
  $("fire").addEventListener("click", fire);
  describe(false);

  return () => { alive = false; };
}
