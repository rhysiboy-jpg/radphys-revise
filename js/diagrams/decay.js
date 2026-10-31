// Builder: radioactive decay. Pick a decay, work out the daughter's mass number A and atomic number Z, then check it.
// Follows the Radioactivity lecture (slides 27–39) with reference physics where the slides differ:
// positron annihilation gives two 511 keV photons travelling in opposite directions, and electron capture emits a neutrino
// and characteristic X-rays as the inner-shell vacancy fills, rather than a gamma ray.
import { svgEl as el } from "./util.js";

const SYMBOL = ",H,He,Li,Be,B,C,N,O,F,Ne,Na,Mg,Al,Si,P,S,Cl,Ar,K,Ca,Sc,Ti,V,Cr,Mn,Fe,Co,Ni,Cu,Zn,Ga,Ge,As,Se,Br,Kr,Rb,Sr,Y,Zr,Nb,Mo,Tc,Ru,Rh,Pd,Ag,Cd,In,Sn,Sb,Te,I,Xe,Cs,Ba,La,Ce,Pr,Nd,Pm,Sm,Eu,Gd,Tb,Dy,Ho,Er,Tm,Yb,Lu,Hf,Ta,W,Re,Os,Ir,Pt,Au,Hg,Tl,Pb,Bi,Po,At,Rn,Fr,Ra,Ac,Th,Pa,U".split(",");

// dA, dZ: the change from parent to daughter. Examples are real decays.
const DECAYS = {
  alpha: { name: "Alpha (α)", parent: [226, 88], m: "", dA: -4, dZ: -2, out: "an alpha particle (a helium nucleus: 2 protons and 2 neutrons)",
    why: "The nucleus is too big. It ejects 2 protons and 2 neutrons together, so A falls by 4 and Z by 2: a new element.",
    props: "Heavy and doubly charged: strongly ionising but stopped by paper or thin plastic, so unsuitable for imaging." },
  minus: { name: "Beta-minus (β⁻)", parent: [131, 53], m: "", dA: 0, dZ: 1, out: "an electron (β⁻) and an antineutrino",
    why: "Too many neutrons. A neutron becomes a proton and the nucleus ejects an electron, so Z rises by 1 and A stays the same.",
    props: "Range of a few cm in air, stopped by a few mm of plastic or aluminium; absorbed in tissue, so used for treatment (I-131 for the thyroid), not imaging." },
  plus: { name: "Beta-plus (β⁺)", parent: [18, 9], m: "", dA: 0, dZ: -1, out: "a positron (β⁺) and a neutrino",
    why: "Too many protons. A proton becomes a neutron and the nucleus ejects a positron, so Z falls by 1 and A stays the same.",
    props: "The positron meets an electron within a millimetre or so and both are annihilated, giving two 511 keV photons in opposite directions. PET detects that pair." },
  ec: { name: "Electron capture", parent: [123, 53], m: "", dA: 0, dZ: -1, out: "a neutrino, then characteristic X-rays",
    why: "Too many protons. The nucleus pulls in one of its own inner-shell electrons, which joins a proton to make a neutron: Z falls by 1, A stays the same.",
    props: "The empty K-shell place is filled from an outer shell, giving characteristic X-rays. I-123 decays this way and is used for thyroid imaging." },
  gamma: { name: "Gamma (γ), from a metastable state", parent: [99, 43], m: "m", dA: 0, dZ: 0, out: "a 140 keV gamma photon",
    why: "Tc-99m is an excited (metastable) state of Tc-99. It sheds the extra energy as a gamma photon, so A and Z do not change.",
    props: "A pure gamma emitter with a 6-hour half-life: penetrating enough to detect outside the body, with little dose. It comes from Mo-99 (β⁻ decay) in a generator." },
};

// Nuclide notation, A above Z to the left of the symbol. Built from markup: Unicode sub- and superscript digits
// make browsers fall back to another font for the whole symbol.
const nuclide = (A, Z, m = "") => `<span class="iso"><span class="iso-az"><span>${A}${m}</span><span>${Z}</span></span>${SYMBOL[Z] ?? "?"}</span>`;
const plain = (A, Z, m = "") => `${SYMBOL[Z] ?? "?"}-${A}${m}`;   // for screen readers: "Ra-226"

const MARKUP = `
<div class="grid">
  <div class="stage">
    <div class="modes" role="group" aria-label="Type of decay" data-role="kinds"></div>
    <svg viewBox="0 0 640 260" role="img" aria-labelledby="dec-t dec-d">
      <title id="dec-t">The decay, drawn</title>
      <desc id="dec-d" data-role="desc"></desc>
      <g data-role="scene"></g>
    </svg>
    <p class="equation" data-role="eq" aria-live="polite"></p>
    <p class="scale-note">Schematic · not to scale</p>
  </div>
  <div class="panel">
    <div class="stepper">
      <div class="step-meta"><span class="eyebrow">Work out the daughter</span></div>
      <p data-role="task"></p>
      <div class="nuc-build">
        <div class="field"><span class="label" id="dec-a-l">Mass number A</span>
          <div class="num-step" role="group" aria-labelledby="dec-a-l"><button type="button" data-d="A-1" aria-label="A down one">−</button><output data-role="a"></output><button type="button" data-d="A+1" aria-label="A up one">+</button></div></div>
        <div class="field"><span class="label" id="dec-z-l">Atomic number Z</span>
          <div class="num-step" role="group" aria-labelledby="dec-z-l"><button type="button" data-d="Z-1" aria-label="Z down one">−</button><output data-role="z"></output><button type="button" data-d="Z+1" aria-label="Z up one">+</button></div></div>
        <div class="field"><span class="label">Element</span><b class="nuc-sym" data-role="sym"></b></div>
      </div>
      <div class="controls">
        <button type="button" class="primary" data-role="check">Check</button>
        <button type="button" data-role="show">Show me</button>
      </div>
      <div class="feedback" data-role="fb" hidden></div>
    </div>
    <details class="try">
      <summary><h3>The rules</h3></summary>
      <table class="rules">
        <thead><tr><th>Decay</th><th>A</th><th>Z</th><th>Emitted</th></tr></thead>
        <tbody>
          <tr><td>Alpha</td><td>−4</td><td>−2</td><td>helium nucleus (2p + 2n)</td></tr>
          <tr><td>Beta-minus</td><td>same</td><td>+1</td><td>electron, antineutrino</td></tr>
          <tr><td>Beta-plus</td><td>same</td><td>−1</td><td>positron, neutrino</td></tr>
          <tr><td>Electron capture</td><td>same</td><td>−1</td><td>neutrino, characteristic X-rays</td></tr>
          <tr><td>Gamma</td><td>same</td><td>same</td><td>gamma photon</td></tr>
        </tbody>
      </table>
    </details>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  let kind = "alpha", A = 0, Z = 0, solved = false;

  $("kinds").innerHTML = Object.entries(DECAYS).map(([id, d]) => `<button type="button" data-kind="${id}">${d.name.split(",")[0]}</button>`).join("");

  // The picture: parent nucleus on the left, what leaves it on the right; the daughter appears once solved.
  function scene() {
    const s = $("scene"), d = DECAYS[kind];
    s.innerHTML = "";
    // The label: the symbol, with A above Z to its left.
    const nucleus = (x, y, r, [nA, nZ, m = ""]) => {
      const g = el("g", {}, s);
      el("circle", { class: "nucleus", cx: x, cy: y, r }, g);
      el("text", { class: "dec-nuc-t", x: x - 6, y, "text-anchor": "start" }, g).textContent = SYMBOL[nZ] ?? "?";
      el("text", { class: "dec-az", x: x - 9, y: y - 2, "text-anchor": "end" }, g).textContent = `${nA}${m}`;
      el("text", { class: "dec-az", x: x - 9, y: y + 2, "text-anchor": "end", "dominant-baseline": "hanging" }, g).textContent = nZ;
      return g;
    };
    const [pA, pZ] = d.parent;
    el("text", { class: "pane-t", x: 140, y: 30 }, s).textContent = solved ? "Daughter" : "Parent";
    nucleus(140, 130, 58, solved ? [pA + d.dA, pZ + d.dZ] : [pA, pZ, d.m]);
    const arrow = (x1, y1, x2, y2, cls) => el("path", { class: cls, d: `M${x1} ${y1} L${x2} ${y2}` }, s);
    const label = (x, y, text, anchor = "start") => { el("text", { class: "fxlabel", x, y, "text-anchor": anchor }, s).textContent = text; };
    if (kind === "alpha") {
      arrow(200, 130, 420, 130, "dec-track");
      el("circle", { class: "nucleus", cx: 450, cy: 130, r: 20 }, s);
      el("text", { class: "dec-alpha", x: 450, y: 130 }, s).textContent = "α";
      label(450, 176, "alpha particle", "middle");
    } else if (kind === "minus" || kind === "plus") {
      arrow(200, 110, kind === "plus" ? 458 : 430, kind === "plus" ? 82 : 70, "dec-track");
      el("circle", { class: "e-dot", cx: kind === "plus" ? 470 : 444, cy: kind === "plus" ? 80 : 68, r: 9 }, s);
      el("text", { class: "e-sign", x: kind === "plus" ? 470 : 444, y: kind === "plus" ? 80 : 68 }, s).textContent = kind === "minus" ? "−" : "+";
      if (kind === "minus") label(462, 60, "electron (β⁻)"); else label(330, 62, "positron (β⁺)", "middle");
      arrow(200, 150, 400, 200, "dec-nu");
      label(410, 214, kind === "minus" ? "antineutrino" : "neutrino");
      if (kind === "plus") {
        // Annihilation with an electron: two 511 keV photons, opposite directions.
        // They meet near (500, 95): two photons leave back to back along one line.
        el("circle", { class: "e-dot", cx: 532, cy: 100, r: 9 }, s);
        el("text", { class: "e-sign", x: 532, y: 100 }, s).textContent = "−";
        el("path", { class: "photon", d: "M494 84 L460 20" }, s);
        el("path", { class: "photon", d: "M506 106 L560 208" }, s);
        label(454, 22, "511 keV", "end");
        label(566, 228, "511 keV", "middle");
      }
    } else if (kind === "ec") {
      el("circle", { class: "shell", cx: 140, cy: 130, r: 84 }, s);
      el("circle", { class: "vacancy", cx: 140, cy: 46, r: 8 }, s);
      label(236, 56, "K-shell electron pulled in");
      arrow(140, 56, 140, 84, "dec-track");
      arrow(200, 150, 400, 200, "dec-nu");
      label(410, 214, "neutrino");
      el("path", { class: "photon", d: "M226 110 L380 88" }, s);
      label(390, 92, "characteristic X-ray");
    } else {
      el("path", { class: "photon", d: "M200 130 L390 130" }, s);
      label(400, 134, "140 keV gamma");
    }
    $("desc").textContent = `${d.name}: ${plain(pA, pZ, d.m)} emits ${d.out}.`;
  }

  function show() {
    const d = DECAYS[kind], [pA, pZ] = d.parent;
    root.querySelectorAll("[data-kind]").forEach(b => b.setAttribute("aria-pressed", b.dataset.kind === kind));
    $("task").innerHTML = `<b>${nuclide(pA, pZ, d.m)}</b> decays by ${d.name.toLowerCase().replace(/ \(.*\)/, "")}, emitting ${d.out}. Set A and Z for the daughter.`;
    $("a").textContent = A; $("z").textContent = Z;
    $("sym").textContent = `${SYMBOL[Z] ?? "?"}`;
    $("eq").innerHTML = solved ? `${nuclide(pA, pZ, d.m)} → ${nuclide(pA + d.dA, pZ + d.dZ)} + ${kind === "alpha" ? nuclide(4, 2) : kind === "minus" ? "β⁻ + antineutrino" : kind === "plus" ? "β⁺ + neutrino" : kind === "ec" ? "neutrino (after capturing an electron)" : "γ"}` : `${nuclide(pA, pZ, d.m)} → ?`;
    scene();
  }

  function start(next) {
    kind = next; solved = false;
    [A, Z] = DECAYS[kind].parent;
    $("fb").hidden = true;
    show();
  }

  function check(reveal = false) {
    const d = DECAYS[kind], [pA, pZ] = d.parent, tA = pA + d.dA, tZ = pZ + d.dZ;
    const ok = A === tA && Z === tZ;
    if (reveal) { A = tA; Z = tZ; }
    const fb = $("fb");
    fb.innerHTML = reveal || ok
      ? `<p class="verdict ${reveal && !ok ? "self" : "good"}">${reveal && !ok ? "Here it is" : "Right"}: ${nuclide(tA, tZ)}</p><div class="why"><p>${d.why}</p><p>${d.props}</p></div>`
      : `<p class="verdict bad">Not quite</p><div class="why"><p>${A !== tA ? `A should ${d.dA ? `change by ${d.dA}` : "stay the same"}. ` : ""}${Z !== tZ ? `Z should ${d.dZ ? `change by ${d.dZ > 0 ? "+" : ""}${d.dZ}` : "stay the same"}. ` : ""}Think about what leaves the nucleus: ${d.out}.</p></div>`;
    fb.hidden = false;
    solved = ok || reveal;
    show();
  }

  root.querySelectorAll("[data-kind]").forEach(b => b.addEventListener("click", () => start(b.dataset.kind)));
  root.querySelectorAll("[data-d]").forEach(b => b.addEventListener("click", () => {
    const [k, step] = [b.dataset.d[0], +b.dataset.d.slice(1)];
    if (k === "A") A = Math.max(1, A + step); else Z = Math.max(1, Math.min(92, Z + step));
    solved = false; $("fb").hidden = true;
    show();
  }));
  $("check").addEventListener("click", () => check(false));
  $("show").addEventListener("click", () => check(true));
  start("alpha");
}
