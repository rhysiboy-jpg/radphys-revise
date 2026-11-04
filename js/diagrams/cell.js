// Explorer: inside the cell (lecture: Cellular Effects of Radiation, slides 5–7). Follow one X-ray photon from ionisation
// to free radicals, then to recombination (no harm) or DNA damage, and on to the cell's fate. "Fire 1,000" tallies outcomes
// at random to show that harm is a matter of chance. Schematic; the tally's proportions are illustrative, not measured rates.
import { svgEl as el, wavy, tween, setLines } from "./util.js";
import { electron, moveTo } from "./atom.js";

const P = { x: 200, y: 196 };                         // where the photon ionises a water molecule
const E1 = { x: 288, y: 116 };                        // where the freed electron comes to rest (indirect paths)
const R1 = { x: 168, y: 160 }, R2 = { x: 232, y: 236 }; // the two free radicals
const WATER = [[200, 196], [150, 252], [258, 148], [150, 138], [262, 274], [116, 196]];
const DNA = { x0: 298, x1: 482, y: 206, amp: 19, k: 17 };
const yA = x => DNA.y + DNA.amp * Math.sin((x - DNA.x0) / DNA.k), yB = x => DNA.y - DNA.amp * Math.sin((x - DNA.x0) / DNA.k);
const D = { x: 356, y: yA(356) };                      // the break in the DNA

const PATHS = { recombine: "Ions recombine", indirect: "Free radical reaches the DNA", direct: "Electron hits the DNA" };
const FATES = { repair: "Repaired", death: "Cell dies", mutation: "Survives with a mutation" };
// Illustrative shares of 1,000 photon interactions in a cell. The order is the point: most come to nothing, a surviving mutation is rare.
const TALLY = [["none", "No lasting harm", 0.988], ["death", "Cell dies", 0.011], ["mutation", "Survives with a mutation", 0.001]];

const H2O = (g, x, y, cls = "") => {
  el("circle", { class: `h2o-o ${cls}`, cx: x, cy: y, r: 9 }, g);
  el("circle", { class: `h2o-h ${cls}`, cx: x - 11, cy: y + 8, r: 5 }, g);
  el("circle", { class: `h2o-h ${cls}`, cx: x + 11, cy: y + 8, r: 5 }, g);
};
// "H₂O⁺" built from tspans: Unicode sub- and superscripts fall back to a serif font.
const waterIon = t => {
  el("tspan", {}, t).textContent = "H";
  el("tspan", { class: "sub", dy: 4 }, t).textContent = "2";
  el("tspan", { dy: -4 }, t).textContent = "O";
  el("tspan", { class: "sub", dy: -6 }, t).textContent = "+";
  return t;
};

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg class="cell-svg" viewBox="0 0 640 380" role="img" aria-labelledby="cell-t cell-d">
      <title id="cell-t">An X-ray photon passing into a cell, with water molecules and the DNA in the nucleus</title>
      <desc id="cell-d" data-role="desc"></desc>
      <g data-role="scene"></g>
    </svg>
    <p class="scale-note">Schematic · not to scale · real cells hold billions of water molecules</p>
  </div>
  <div class="panel">
    <div class="stepper">
      <div class="step-meta">
        <span class="eyebrow" data-role="count"></span>
        <div class="dots" data-role="dots" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
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
        <div class="slider-top"><span class="label">After ionisation</span></div>
        <div class="modes" role="group" aria-label="After ionisation">${Object.entries(PATHS).map(([k, t]) => `<button type="button" data-path="${k}">${t}</button>`).join("")}</div>
      </div>
      <div class="slider" data-role="fate-row">
        <div class="slider-top"><span class="label">If the DNA is damaged</span></div>
        <div class="modes" role="group" aria-label="If the DNA is damaged">${Object.entries(FATES).map(([k, t]) => `<button type="button" data-fate="${k}">${t}</button>`).join("")}</div>
      </div>
    </div>
    <div class="summary share">
      <h3>Fire 1,000 photons</h3>
      <p>Which event will cause harm can't be predicted: each one is down to chance.</p>
      ${TALLY.map(([k, t]) => `<div class="share-row"><span>${t}</span><div class="share-bar"><i data-role="b-${k}"></i></div><b data-role="n-${k}">0</b></div>`).join("")}
      <div class="controls"><button type="button" class="primary" data-role="fire">Fire 1,000 photons</button><button type="button" data-role="clear">Clear</button></div>
      <p data-role="tally-note" aria-live="polite"></p>
      <p class="scale-note">Illustrative proportions. Bars are on a log scale so that rare outcomes still show.</p>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const scene = $("scene");
  let alive = true, gen = 0, step = 0, path = "indirect", fate = "repair";
  const counts = { none: 0, death: 0, mutation: 0 };

  function draw(s, t = 1) {
    scene.innerHTML = "";
    const at = k => (s > k ? 1 : s === k ? t : 0);
    const dna = path !== "recombine" && at(3) === 1, dies = dna && fate === "death" && at(4);
    // The cell, its nucleus and the DNA.
    el("ellipse", { class: `cell${dies ? " dying" : ""}`, cx: 320, cy: 196, rx: 290, ry: 168, opacity: dies ? 1 - 0.5 * at(4) : 1 }, scene);
    el("ellipse", { class: "cell-nucleus", cx: 390, cy: 202, rx: 118, ry: 82 }, scene);
    el("text", { class: "fxlabel wide-only", x: 390, y: 150, "text-anchor": "middle" }, scene).textContent = "nucleus";
    const broken = dna && !(fate === "repair" && at(4) === 1);
    const strand = (f, cls, gap) => {
      let d = "";
      for (let x = DNA.x0; x <= DNA.x1; x += 2) {
        const inGap = gap && Math.abs(x - D.x) < 5;
        d += inGap ? "" : `${d && !d.endsWith(" ") ? "L" : "M"}${x} ${f(x).toFixed(1)}`;
        if (inGap && !d.endsWith(" ")) d += " ";
      }
      el("path", { class: cls, d }, scene);
    };
    for (let x = DNA.x0 + 5; x < DNA.x1; x += 9) el("line", { class: "dna-rung", x1: x, y1: yA(x), x2: x, y2: yB(x) }, scene);
    strand(yA, "dna", broken);
    strand(yB, "dna dna-b", false);
    el("text", { class: "fxlabel", x: DNA.x1 - 4, y: DNA.y - 32, "text-anchor": "end" }, scene).textContent = "DNA";
    if (dna && fate === "mutation" && at(4)) {
      el("path", { class: "dna-mut", d: `M${D.x - 18} ${yA(D.x - 18)} Q${D.x} ${D.y + 10} ${D.x + 18} ${yA(D.x + 18)}`, opacity: at(4) }, scene);
    }
    if (broken) el("path", { class: "dna-break", d: `M${D.x - 7} ${D.y - 12} l5 7 l-5 4 l7 6 l-3 7` }, scene);
    // Water in the cytoplasm.
    WATER.forEach(([x, y], i) => { if (!(i === 0 && at(1) && !(path === "recombine" && at(3) === 1))) H2O(scene, x, y); });
    const fx = el("g", {}, scene);

    // 0: the photon arrives.
    const ph = el("g", { opacity: 1 - at(1) }, fx);
    el("path", { class: "photon", d: wavy(18, P.y, P.x - 12, P.y) }, ph);
    el("text", { class: "fxlabel ph-t", x: 22, y: P.y - 12 }, ph).textContent = "X-ray photon";
    // 1: ionisation. An electron leaves the water molecule: an ion pair.
    if (at(1)) {
      const endE = path === "direct" && at(3) ? { x: E1.x + (D.x - 6 - E1.x) * at(3), y: E1.y + (D.y - 4 - E1.y) * at(3) } : E1;
      el("path", { class: "e-path", d: `M${P.x} ${P.y} L${E1.x} ${E1.y}${path === "direct" && at(3) ? ` L${endE.x} ${endE.y}` : ""}`, opacity: at(1) }, fx);
      const e = electron(fx, P.x, P.y);
      moveTo(e, P.x + (E1.x - P.x) * Math.min(1, at(1)), P.y + (E1.y - P.y) * Math.min(1, at(1)));
      if (path === "direct" && at(3)) moveTo(e, endE.x, endE.y);
      if (s === 1 && t === 1) {
        H2O(fx, P.x, P.y, "ion");
        waterIon(el("text", { class: "fxlabel", x: P.x - 4, y: P.y + 32, "text-anchor": "middle" }, fx));
        el("text", { class: "fxlabel wide-only", x: P.x - 4, y: P.y + 50, "text-anchor": "middle" }, fx).textContent = "an ion pair";   // the caption says it on a phone
        el("text", { class: "fxlabel el-t", x: E1.x + 10, y: E1.y - 10 }, fx).textContent = "freed electron";
      }
    }
    // 2: the ion breaks up into free radicals.
    if (at(2) && !(path === "recombine" && at(3) === 1)) {
      const back = path === "recombine" ? at(3) : 0;
      const pos = (R, k) => ({ x: P.x + (R.x - P.x) * at(2) * (1 - back), y: P.y + (R.y - P.y) * at(2) * (1 - back) });
      let r1 = pos(R1), r2 = pos(R2);
      if (path === "indirect" && at(3)) r1 = { x: R1.x + (D.x - 10 - R1.x) * at(3), y: R1.y + (D.y - R1.y) * at(3) };
      el("circle", { class: "radical", cx: r1.x, cy: r1.y, r: 11 }, fx);
      el("circle", { class: "radical", cx: r2.x, cy: r2.y, r: 8 }, fx);
      if (s === 2 && t === 1) {
        el("text", { class: "fxlabel", x: r1.x - 14, y: r1.y + 4, "text-anchor": "end" }, fx).textContent = "OH•";
        el("text", { class: "fxlabel", x: r2.x + 14, y: r2.y + 4 }, fx).textContent = "H•";
        el("text", { class: "fxlabel wide-only", x: P.x, y: 330, "text-anchor": "middle" }, fx).textContent = "free radicals: highly reactive";
      }
    }
    // 3 and 4: the outcome.
    if (at(3) === 1) {
      const lbl = (x, y, a, ...lines) => setLines(el("text", { class: "fxlabel", x, y, "text-anchor": a }, fx), ...lines);
      if (path === "recombine") lbl(P.x, P.y + 36, "middle", "water again:", "no harm");
      else if (!at(4)) lbl(D.x, D.y + 50, "middle", "DNA strand broken");
      else if (fate === "repair") lbl(D.x, D.y + 50, "middle", "repaired");
      else if (fate === "death") lbl(320, 360, "middle", "the cell dies");
      else lbl(D.x, D.y + 50, "middle", "changed gene,", "copied when it divides");
    }
  }

  const STEP = () => {
    const recomb = path === "recombine";
    return [
      { t: "An X-ray photon enters a cell", d: "Most of a cell is water, so the photon is far more likely to meet a water molecule than the DNA. Press Next to follow it." },
      { t: "Ionisation", d: "The photon gives its energy to an electron, which is thrown out of the water molecule. This leaves an <b>ion pair</b>: a positive ion and a free electron. The fast electron goes on to ionise more molecules along its track." },
      { t: "Free radicals", d: "Within about 10<sup>−11</sup> s the ionised water breaks its chemical bonds and forms <b>free radicals</b>, such as OH• and H•. They are highly reactive and will bond with almost anything nearby." },
      recomb
        ? { t: "The ions recombine: no harm", d: "Many ions simply <b>recombine</b>, forming the same molecules as before. If the atoms end up as they were before irradiation, <b>no harm</b> has been done. Most interactions end like this." }
        : path === "indirect"
          ? { t: "Indirect action: a radical reaches the DNA", d: "A free radical bonds where it shouldn't, here breaking a strand of the DNA. This is <b>indirect action</b>: the radiation acts through the water. About two-thirds of the DNA damage X-rays cause happens this way." }
          : { t: "Direct action: the electron hits the DNA", d: "The fast electron itself ionises the DNA and breaks a strand. This is <b>direct action</b>. It is less common with X-rays than indirect action, because the DNA is a small target among so much water." },
      recomb
        ? { t: "Nothing more happens", d: "The cell carries on as normal. Choose another path above to see what happens when the DNA is damaged." }
        : fate === "repair"
          ? { t: "The cell repairs the damage", d: "Cells have enzymes that mend broken DNA, and most single-strand breaks are repaired correctly. The cell carries on as normal." }
          : fate === "death"
            ? { t: "The cell dies", d: "If the damage is too great to repair, the cell dies, often when it next tries to divide. One cell dying doesn't matter. Only when <b>enough cells die</b> does an organ stop working: a <b>deterministic</b> effect, which needs a large dose." }
            : { t: "The cell survives with a mutation", d: "If the DNA is repaired wrongly, the cell may survive with a changed gene and pass it on each time it divides. Years later this might lead to cancer, or to a heritable effect if it is in an ovum or sperm cell: a <b>stochastic</b> effect. It is rare, and down to chance." },
    ];
  };

  const cap = $("caption"), back = $("back"), next = $("next");
  function describe() {
    const st = STEP()[step];
    $("count").textContent = `Step ${step} of 4`;
    [...$("dots").children].forEach((d, i) => d.classList.toggle("on", i < step));
    cap.innerHTML = `<strong>${st.t}</strong><p>${st.d}</p>`;
    back.disabled = step === 0; next.disabled = step === 4;
    root.querySelectorAll("[data-path]").forEach(b => b.setAttribute("aria-pressed", b.dataset.path === path));
    root.querySelectorAll("[data-fate]").forEach(b => b.setAttribute("aria-pressed", b.dataset.fate === fate));
    $("fate-row").hidden = path === "recombine";
    $("desc").textContent = `A cell with water molecules in its cytoplasm and DNA in its nucleus. ${cap.textContent}`;
  }

  let animating = false;
  function jumpTo(s) { gen++; animating = false; step = s; draw(step); describe(); }
  async function forward() {
    if (animating) jumpTo(step);
    if (step >= 4) return;
    const my = ++gen;
    step++; describe();
    animating = true;
    await tween(1000, t => draw(step, t), () => alive && gen === my);
    if (gen === my) animating = false;
  }
  back.addEventListener("click", () => jumpTo(Math.max(0, step - 1)));
  next.addEventListener("click", forward);
  $("reset").addEventListener("click", () => jumpTo(0));
  root.querySelectorAll("[data-path]").forEach(b => b.addEventListener("click", () => { path = b.dataset.path; jumpTo(Math.min(step, 2)); }));
  root.querySelectorAll("[data-fate]").forEach(b => b.addEventListener("click", () => { fate = b.dataset.fate; jumpTo(step === 4 ? 4 : step); }));

  // The tally: each press adds 1,000 random outcomes.
  function showTally() {
    const total = counts.none + counts.death + counts.mutation;
    const logW = n => (n ? Math.max(2, (Math.log10(n + 1) / Math.log10(Math.max(total, 10) + 1)) * 100) : 0);
    for (const [k] of TALLY) { $(`b-${k}`).style.width = `${logW(counts[k])}%`; $(`n-${k}`).textContent = counts[k].toLocaleString("en-GB"); }
    $("tally-note").textContent = !total ? "" : counts.mutation
      ? `${total.toLocaleString("en-GB")} photons: ${counts.mutation.toLocaleString("en-GB")} left a cell with a mutation. Fire again and the number changes: that is chance at work.`
      : `${total.toLocaleString("en-GB")} photons and no surviving mutation yet. It's rare, but not impossible: fire again.`;
  }
  $("fire").addEventListener("click", () => {
    for (let i = 0; i < 1000; i++) { const r = Math.random(); counts[r < TALLY[2][2] ? "mutation" : r < TALLY[2][2] + TALLY[1][2] ? "death" : "none"]++; }
    showTally();
  });
  $("clear").addEventListener("click", () => { counts.none = counts.death = counts.mutation = 0; showTally(); });

  jumpTo(0);
  showTally();
  return () => { alive = false; };
}
