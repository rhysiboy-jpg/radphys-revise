// Explorer: the Bohr atom. Pick an element, then step through excitation or ionisation and the characteristic X-ray that follows.
import { svgEl as el, wavy, tween, lerp, keepInside } from "./util.js";
import { drawAtom, moveTo, vacancy } from "./atom.js";

// Binding energies in keV. L and M are the sub-shells (L3, M5) that give the strongest K and L lines.
// Sources: standard X-ray data tables (Bearden & Burr); carbon L and calcium M are outer valence levels.
const ELEMENTS = {
  C:  { name: "Carbon",   z: 6,  counts: [2, 4],                K: 0.284, L: 0.011, M: null, where: "in soft tissue" },
  Ca: { name: "Calcium",  z: 20, counts: [2, 8, 8, 2],          K: 4.04,  L: 0.35,  M: 0.03, where: "in bone" },
  I:  { name: "Iodine",   z: 53, counts: [2, 8, 18, 18, 7],     K: 33.2,  L: 4.56,  M: 0.62, where: "in contrast media", lecture: { L: 5.1, M: 1 } },
  W:  { name: "Tungsten", z: 74, counts: [2, 8, 18, 32, 12, 2], K: 69.5,  L: 10.2,  M: 1.81, where: "in the X-ray tube target", lecture: { L: 11.5, M: 2.5 } },
  Pb: { name: "Lead",     z: 82, counts: [2, 8, 18, 32, 18, 4], K: 88.0,  L: 13.0,  M: 2.48, where: "in lead aprons and shielding", lecture: { L: 15, M: 3.8 } },
};
const kev = v => v == null ? "–" : v >= 10 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v.toFixed(v < 0.1 ? 3 : 2);

const CX = 250, CY = 214, RADII = [52, 92, 132], OUTER = 168;
const MODES = { excite: "Excitation", ionise: "Ionisation" };

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 560 420" role="img" aria-labelledby="bohr-t bohr-d">
      <title id="bohr-t">Bohr model of an atom</title>
      <desc id="bohr-d" data-role="desc"></desc>
      <text class="atom-state" data-role="state" x="16" y="28"></text>
      <g data-role="atom"></g>
      <g data-role="fx"></g>
    </svg>
    <p class="scale-note">Schematic · not to scale · real shells are not circles · outer shells summarised</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><label for="bohr-el">Element</label></div>
        <select id="bohr-el" class="select">${Object.entries(ELEMENTS).map(([k, e]) => `<option value="${k}"${k === "W" ? " selected" : ""}>${e.name} (Z = ${e.z})</option>`).join("")}</select>
        <small data-role="where"></small>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>K-shell binding energy</span><b data-role="r-k"></b></div>
      <div class="readout"><span>L-shell binding energy</span><b data-role="r-l"></b></div>
      <div class="readout"><span>M-shell binding energy</span><b data-role="r-m"></b></div>
      <div class="readout"><span>Characteristic Kα (K − L)</span><b data-role="r-ka"></b></div>
    </div>
    <p class="scale-note" data-role="lecture-note"></p>
    <div class="stepper">
      <div class="modes" role="group" aria-label="Interaction">${Object.entries(MODES).map(([k, v]) => `<button type="button" data-mode="${k}" aria-pressed="${k === "ionise"}">${v}</button>`).join("")}</div>
      <div class="step-meta">
        <span class="eyebrow" data-role="count"></span>
        <div class="dots" data-role="dots" aria-hidden="true"></div>
      </div>
      <div class="caption" data-role="caption" aria-live="polite"></div>
      <div class="controls">
        <button type="button" data-role="back">Back</button>
        <button type="button" data-role="next" class="primary">Next</button>
        <button type="button" data-role="reset">Start again</button>
      </div>
    </div>
    <div class="try">
      <h3>Try this</h3>
      <ol>
        <li><b>Change the element.</b> Binding energy rises with atomic number: a lead K-shell electron is held over 300 times more tightly than a carbon one.</li>
        <li><b>Compare tungsten with the spectrum explorer.</b> Its Kα energy here (about 59 keV) is the sharp line on the X-ray spectrum.</li>
        <li><b>Try excitation, then ionisation.</b> Only ionisation leaves a charged atom, because only then does an electron leave altogether.</li>
      </ol>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const select = root.querySelector("#bohr-el");
  const atomLayer = $("atom"), fx = $("fx");
  let alive = true, gen = 0;
  let key = "W", mode = "ionise", step = 0;
  let atom, actors;

  const pos = (s, i) => {
    const a = -Math.PI / 2 + (i / (ELEMENTS[key].counts[s] || 1)) * Math.PI * 2 + s * 0.35;
    return [CX + RADII[s] * Math.cos(a), CY + RADII[s] * Math.sin(a)];
  };
  const photon = (x1, y1, x2, y2, label, small, labelAtStart) => {
    const g = el("g", { opacity: 0 }, fx);
    el("path", { class: small ? "photon weak" : "photon", d: wavy(x1, y1, x2, y2) }, g);
    const t = el("text", { class: "fxlabel ph-t", x: labelAtStart ? x1 : x2 + 6, y: labelAtStart ? y1 - 12 : y2 + 4 }, g);
    t.textContent = label;
    keepInside(t, 8, 552);
    return g;
  };

  // Each step: enter() adds its photons and labels, at(t) moves things from the previous step (t = 0) to this one (t = 1).
  function stepsFor() {
    const e = ELEMENTS[key];
    const kL = (e.K - e.L);
    if (mode === "excite") {
      const [lx, ly] = pos(1, 0), mr = RADII[2], a = Math.atan2(ly - CY, lx - CX);
      const mx = CX + mr * Math.cos(a), my = CY + mr * Math.sin(a);
      let inGlow, outPh;
      return [
        { t: "The atom at rest", state: "Neutral atom",
          d: `${e.name} has ${e.z} protons and ${e.z} electrons. Electrons fill the shells nearest the nucleus first. The K shell is closest, so its electrons are held most tightly: they have the highest <b>binding energy</b>.` },
        { t: "Energy is absorbed", state: "Excited atom",
          d: `An L-shell electron absorbs some energy, but <b>less than its binding energy</b> (${kev(e.L)} keV). It cannot leave the atom, so it moves up to a shell further out. The atom is now <b>excited</b>, but still neutral.`,
          enter() { inGlow = photon(20, 60, lx - 12, ly - 8, "energy in", true, true); },
          at(t) { inGlow.setAttribute("opacity", t); moveTo(actors.L, lerp(lx, mx, t), lerp(ly, my, t)); } },
        { t: "Back to the normal state", state: "Neutral atom",
          d: `The electron drops back to the L shell almost at once. It gives out the energy it absorbed as <b>low-energy radiation</b> (visible light or ultraviolet) or as <b>heat</b>. No ion is formed. In an X-ray tube target, this is where most of the electrons' energy goes.`,
          enter() { inGlow.setAttribute("opacity", 0.25); outPh = photon(lx + 10, ly - 6, 470, 70, "light or heat", true); },
          at(t) { outPh.setAttribute("opacity", t); moveTo(actors.L, lerp(mx, lx, t), lerp(my, ly, t)); } },
      ];
    }
    const [kx, ky] = pos(0, 0), [lx, ly] = pos(1, 0), [mx, my] = pos(2, 0);
    let inPh, hole, kPh, lPh;
    const hasM = !!e.counts[2];
    return [
      { t: "The atom at rest", state: "Neutral atom",
        d: `${e.name} has ${e.z} protons and ${e.z} electrons. The K-shell electrons are held most tightly: their binding energy is <b>${kev(e.K)} keV</b>.` },
      { t: "An electron is ejected", state: "Positive ion (+)",
        d: `A K-shell electron absorbs <b>more than ${kev(e.K)} keV</b>. That is enough to overcome its binding energy, so it leaves the atom altogether. The atom now has one more proton than electrons: it is a <b>positive ion</b>, with a vacancy in the K shell.`,
        enter() { inPh = photon(20, ky - 40, kx - 12, ky - 4, "energy in", false, true); hole = vacancy(fx, kx, ky); hole.setAttribute("opacity", 0); },
        at(t) { inPh.setAttribute("opacity", t); hole.setAttribute("opacity", t); moveTo(actors.K, lerp(kx, 520, t), lerp(ky, 26, t)); } },
      { t: "The vacancy is filled", state: "Positive ion (+)",
        d: `An L-shell electron drops into the K-shell vacancy. It gives out the difference in binding energy as an X-ray photon: ${kev(e.K)} − ${kev(e.L)} ≈ <b>${kev(kL)} keV</b>. This is <b>characteristic radiation</b> (Kα): its energy is characteristic of ${e.name.toLowerCase()}.${kL < 1 ? " At under 1 keV it is absorbed almost at once, close to where it was made." : ""}`,
        enter() { inPh.setAttribute("opacity", 0.25); kPh = photon(kx + 8, ky + 4, 470, 120, `Kα ≈ ${kev(kL)} keV`); },
        at(t) { kPh.setAttribute("opacity", t); moveTo(actors.L, lerp(lx, kx, t), lerp(ly, ky, t)); hole.setAttribute("cx", lerp(kx, lx, t)); hole.setAttribute("cy", lerp(ky, ly, t)); } },
      { t: "A cascade outwards", state: "Positive ion (+)",
        d: hasM
          ? `The new vacancy in the L shell is filled from the M shell, giving a lower-energy photon (${kev(e.L)} − ${kev(e.M)} ≈ ${kev(e.L - e.M)} keV), and so on outwards. The atom stays a positive ion until it captures a free electron.`
          : `${e.name} has no M-shell electrons to fill the L-shell vacancy. The atom stays a positive ion until it captures a free electron.`,
        enter() { kPh.setAttribute("opacity", 0.35); if (hasM) lPh = photon(mx + 8, my, 480, 300, `≈ ${kev(e.L - e.M)} keV`, true); },
        at(t) {
          if (!hasM) return;
          lPh.setAttribute("opacity", t); moveTo(actors.M, lerp(mx, lx, t), lerp(my, ly, t));
          hole.setAttribute("cx", lerp(lx, mx, t)); hole.setAttribute("cy", lerp(ly, my, t));
        } },
    ];
  }

  let steps = [];
  function build() {
    gen++;
    const e = ELEMENTS[key];
    atomLayer.innerHTML = ""; fx.innerHTML = "";
    atom = drawAtom(atomLayer, { cx: CX, cy: CY, counts: e.counts, radii: RADII, outerR: OUTER, z: e.z, showEmpty: true });
    actors = { K: atom.shells[0]?.dots[0], L: atom.shells[1]?.dots[0], M: atom.shells[2]?.dots[0] };
    steps = stepsFor();
  }
  function jumpTo(s) {
    build();
    for (let k = 1; k <= s; k++) { steps[k].enter?.(); steps[k].at?.(1); }
    step = s; render();
  }
  let animating = false;
  async function forward() {
    if (animating) jumpTo(step);   // finish the previous move at once before starting the next
    if (step >= steps.length - 1) return;
    const my = ++gen, s = steps[++step];
    render();
    s.enter?.();
    animating = true;
    await tween(1100, t => s.at?.(t), () => alive && gen === my);
    if (gen === my) animating = false;
  }

  const cap = $("caption"), count = $("count"), back = $("back"), next = $("next"), dotsBox = $("dots");
  function render() {
    const e = ELEMENTS[key], last = steps.length - 1, s = steps[step];
    dotsBox.innerHTML = "<i></i>".repeat(last);
    [...dotsBox.children].forEach((d, i) => d.classList.toggle("on", i < step));
    count.textContent = `${MODES[mode]} · step ${step} of ${last}`;
    cap.innerHTML = `<strong>${s.t}</strong><p>${s.d}</p>`;
    $("state").textContent = `${e.name}: ${s.state.toLowerCase()}`;
    $("desc").textContent = `Bohr model of ${e.name.toLowerCase()} with K, L and M shells around a nucleus of ${e.z} protons. ${cap.textContent}`;
    back.disabled = step === 0; next.disabled = step === last;
  }
  function showElement() {
    const e = ELEMENTS[key];
    $("where").textContent = `Z = ${e.z}. Found ${e.where}.`;
    $("r-k").textContent = `${kev(e.K)} keV`;
    $("r-l").textContent = `${kev(e.L)} keV`;
    $("r-m").textContent = e.M == null ? "No M electrons" : `${kev(e.M)} keV`;
    $("r-ka").textContent = `≈ ${kev(e.K - e.L)} keV`;
    $("lecture-note").textContent = e.lecture
      ? `Lecture tables give ${e.name.toLowerCase()} L ≈ ${e.lecture.L} keV and M ≈ ${e.lecture.M} keV: averages across each shell's sub-shells. The values here are the sub-shells the main X-ray lines come from, which is why Kα comes out at about ${kev(e.K - e.L)} keV.`
      : "L and M values are for the sub-shells the main X-ray lines come from.";
  }

  select.addEventListener("change", () => { key = select.value; showElement(); jumpTo(0); });
  root.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    root.querySelectorAll("[data-mode]").forEach(x => x.setAttribute("aria-pressed", x === b));
    jumpTo(0);
  }));
  back.addEventListener("click", () => jumpTo(Math.max(0, step - 1)));
  next.addEventListener("click", forward);
  $("reset").addEventListener("click", () => jumpTo(0));

  showElement();
  jumpTo(0);
  return () => { alive = false; };
}

// It moves by itself (flowing photons or electrons), so the page offers a "Pause motion" button for it.
export const moving = true;
