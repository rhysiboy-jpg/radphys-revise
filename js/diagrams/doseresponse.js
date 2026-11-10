// Explorer: "may" vs "will" (lecture: Cellular Effects of Radiation, slides 8–9 and 17–19). One dose drives four small graphs:
// the chance and the severity of a stochastic effect (cancer) and of a deterministic effect. Students can predict each
// shape before revealing it.
//   Stochastic: chance of a fatal cancer about 5% per Sv (the basis of UKHSA's patient risk figures), no threshold;
//   severity does not depend on dose.
//   Deterministic: whole body (the lecture's table, in Gy), skin (ICRP 85 fluoroscopy skin-injury thresholds) or the lens
//   of the eye (ICRP 118 cataract threshold, 0.5 Gy). Chance is zero below the threshold, then rises steeply; severity steps up.
import { svgEl as el } from "./util.js";

const RISK_PER_MSV = 0.05 / 1000;       // fatal cancer, about 5% per Sv
const EFFECTS = {
  body: { name: "Whole body, all at once", max: 25, steps: [
    [1, "Temporary drop in blood counts, which recovers"],
    [5, "Death within weeks from bone marrow failure, without treatment"],
    [10, "Death within days from damage to the gut lining"],
    [20, "Death within hours from damage to the nervous system"] ] },
  skin: { name: "Skin", max: 20, steps: [
    [2, "Early, temporary reddening (erythema)"],
    [3, "Temporary hair loss"],
    [6, "Main erythema"],
    [7, "Permanent hair loss"],
    [10, "Dry peeling (desquamation)"],
    [15, "Moist peeling and breakdown of the skin"] ] },
  lens: { name: "Lens of the eye", max: 2, steps: [[0.5, "Cataract, which may develop years later"]] },
};
const PRESETS = [["Chest X-ray", 0.02], ["A year's background", 2.1], ["CT abdomen and pelvis", 10], ["Employee annual limit", 20], ["1 Gy", 1000], ["5 Gy", 5000], ["20 Gy", 20000]];
const SHAPES = { rise: "Starts at zero and rises steadily", flat: "Flat: the same at any dose", threshold: "Nothing until a threshold, then rises" };
const PANELS = [
  { id: "sc", title: "Stochastic: chance", answer: "rise", x0: 56, y0: 44 },
  { id: "dc", title: "Deterministic: chance", answer: "threshold", x0: 372, y0: 44 },
  { id: "ss", title: "Stochastic: severity", answer: "flat", x0: 56, y0: 236 },
  { id: "ds", title: "Deterministic: severity", answer: "threshold", x0: 372, y0: 236 },
];
let PW = 236;
const PH = 120;
const WIDE = { sc: [56, 44], dc: [372, 44], ss: [56, 236], ds: [372, 236] };

const LO = Math.log10(0.01), HI = Math.log10(20000);   // slider runs from 0.01 mSv to 20 Gy on a log scale
const toDose = v => 10 ** (LO + (v / 1000) * (HI - LO));
const toSlider = d => Math.round(((Math.log10(d) - LO) / (HI - LO)) * 1000);
const fmt = mSv => mSv >= 1000 ? `${+(mSv / 1000).toPrecision(2)} Gy` : mSv >= 1 ? `${+mSv.toPrecision(2)} mSv` : `${+mSv.toPrecision(1)} mSv`;
const oneIn = p => { const n = 1 / p, mag = 10 ** Math.floor(Math.log10(n)); return `1 in ${(Math.round(n / mag) * mag).toLocaleString("en-GB")}`; };

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg class="dr-svg" viewBox="0 0 640 400" role="img" aria-labelledby="dr-t dr-d">
      <title id="dr-t">Chance and severity against dose, for stochastic and deterministic effects</title>
      <desc id="dr-d" data-role="desc"></desc>
      <g data-role="frames"></g>
      <g data-role="curves"></g>
      <g data-role="marks"></g>
    </svg>
    <p class="scale-note" data-role="note"></p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><label for="dr-dose">Dose, received all at once</label><output for="dr-dose" data-role="dose-o"></output></div>
        <input type="range" id="dr-dose" min="0" max="1000" step="1">
        <div class="modes" role="group" aria-label="Example doses">${PRESETS.map(([n, d]) => `<button type="button" data-preset="${d}">${n}</button>`).join("")}</div>
      </div>
      <div class="slider">
        <div class="slider-top"><span class="label">Deterministic effect on</span></div>
        <div class="modes" role="group" aria-label="Deterministic effect on">${Object.entries(EFFECTS).map(([k, e]) => `<button type="button" data-effect="${k}">${e.name}</button>`).join("")}</div>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Stochastic: chance of a fatal cancer</span><b data-role="r-st"></b><span data-role="r-st-s"></span></div>
      <div class="readout"><span>Deterministic</span><b data-role="r-de"></b><span data-role="r-de-s"></span></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
    <div class="summary predict" data-role="predict">
      <h3>Predict first</h3>
      <p>The curves are hidden. What shape is each graph?</p>
      <div class="match-list">${PANELS.map(p => `<div class="match-row" data-panel="${p.id}">
        <label for="dr-p-${p.id}">${p.title}</label>
        <select id="dr-p-${p.id}" class="select" data-answer><option value="">Choose…</option>${Object.entries(SHAPES).map(([k, t]) => `<option value="${k}">${t}</option>`).join("")}</select>
        <span class="tagline"></span></div>`).join("")}</div>
      <div class="controls"><button type="button" class="primary" data-role="reveal">Reveal the graphs</button><button type="button" data-role="hide" hidden>Hide and try again</button></div>
      <p data-role="score" aria-live="polite"></p>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const doseIn = root.querySelector("#dr-dose");
  let effect = "body", revealed = false, dose = 0.02;   // the exact dose: a preset sets it exactly, the slider only approximately
  doseIn.value = toSlider(dose);

  // Each panel: dose across (0 to the panel's maximum), chance or severity up (0 to 1).
  const maxOf = id => id[0] === "s" ? 1000 : EFFECTS[effect].max * 1000;      // stochastic panels run to 1 Sv
  const px = (p, d) => p.x0 + Math.min(1, d / maxOf(p.id)) * PW, py = (p, v) => p.y0 + PH - v * PH;
  const steps = () => EFFECTS[effect].steps;
  const value = (id, d) => {
    const T = steps()[0][0] * 1000;
    if (id === "sc") return Math.min(1, d / 1000);                         // 5% at 1 Sv fills the panel
    if (id === "ss") return 0.55;
    if (id === "dc") return d < T ? 0 : 1 - Math.exp(-(((d - T) / (0.35 * T)) ** 2));
    return steps().filter(([g]) => d >= g * 1000).length / steps().length;  // severity steps up at each listed dose
  };

  function frames() {
    const g = $("frames");
    g.innerHTML = "";
    for (const p of PANELS) {
      el("text", { class: "dr-title", x: p.x0, y: p.y0 - 12 }, g).textContent = p.title;
      el("path", { class: "dr-axis", d: `M${p.x0} ${p.y0} V${p.y0 + PH} H${p.x0 + PW}` }, g);
      el("text", { class: "dr-ax", x: p.x0 + PW, y: p.y0 + PH + 18, "text-anchor": "end" }, g).textContent = `dose → ${p.id[0] === "s" ? "1 Sv" : `${EFFECTS[effect].max} Gy`}`;
      el("text", { class: "dr-ax", x: p.x0 + 2, y: p.y0 + PH + 18 }, g).textContent = "0";
      if (p.id === "sc") el("text", { class: "dr-ax", x: p.x0 - 6, y: p.y0 + 4, "text-anchor": "end" }, g).textContent = "5%";
      if (p.id === "dc") el("text", { class: "dr-ax", x: p.x0 - 6, y: p.y0 + 4, "text-anchor": "end" }, g).textContent = "100%";
    }
  }

  function curves() {
    const g = $("curves");
    g.innerHTML = "";
    g.setAttribute("opacity", revealed ? 1 : 0);
    for (const p of PANELS) {
      const max = maxOf(p.id), pts = [];
      if (p.id === "ds") {
        // A staircase: severity steps up at each listed dose.
        let d = `M${p.x0} ${py(p, 0)}`;
        steps().forEach(([gy], i) => { const x = px(p, gy * 1000); d += ` H${x} V${py(p, (i + 1) / steps().length)}`; });
        d += ` H${p.x0 + PW}`;
        el("path", { class: "dr-curve", d }, g);
        steps().forEach(([gy], i) => {
          const x = px(p, gy * 1000), y = py(p, (i + 1) / steps().length);
          el("circle", { class: "dr-pin", cx: x, cy: y, r: 4 }, g);
          el("text", { class: "dr-ax", x: x - 4, y: y - 6, "text-anchor": "end" }, g).textContent = gy;
        });
      } else {
        for (let i = 0; i <= 120; i++) { const d = (i / 120) * max; pts.push([px(p, d), py(p, value(p.id, d))]); }
        el("path", { class: "dr-curve", d: pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") }, g);
      }
      if (p.id === "dc" || p.id === "ds") {
        const x = px(p, steps()[0][0] * 1000);
        el("line", { class: "dr-threshold", x1: x, y1: p.y0, x2: x, y2: p.y0 + PH }, g);
        if (p.id === "dc") el("text", { class: "dr-ax", x: x + 4, y: p.y0 + PH - 6 }, g).textContent = "threshold";
      }
    }
  }

  function update() {
    const d = dose, E = EFFECTS[effect], T = E.steps[0][0] * 1000;
    $("dose-o").textContent = fmt(d);
    root.querySelectorAll("[data-effect]").forEach(b => b.setAttribute("aria-pressed", b.dataset.effect === effect));
    root.querySelectorAll("[data-preset]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.preset === d));
    // The dose marker in each panel, with a dot on the curve once revealed.
    const g = $("marks");
    g.innerHTML = "";
    for (const p of PANELS) {
      const over = d > maxOf(p.id), x = px(p, d);
      el("line", { class: "dr-mark", x1: x, y1: p.y0, x2: x, y2: p.y0 + PH }, g);
      if (revealed) el("circle", { class: "dr-dot", cx: x, cy: py(p, value(p.id, Math.min(d, maxOf(p.id)))), r: 5 }, g);
      if (over) el("text", { class: "dr-ax", x: p.x0 + PW - 4, y: p.y0 + 14, "text-anchor": "end" }, g).textContent = "off the scale →";
    }
    const p = d * RISK_PER_MSV;
    $("r-st").textContent = d > 1000 ? "Not estimated" : oneIn(p);
    $("r-st-s").textContent = d > 1000 ? "risk figures apply to low doses; at this dose deterministic effects come first" : "the chance rises with dose; the effect is no worse";
    const passed = E.steps.filter(([gy]) => d >= gy * 1000);
    $("r-de").textContent = passed.length ? passed[passed.length - 1][1] : "No effect";
    $("r-de-s").textContent = passed.length ? `above the ${fmt(passed[passed.length - 1][0] * 1000)} threshold` : `the ${fmt(T)} threshold is ${T / d >= 2 ? `${Math.round(T / d).toLocaleString("en-GB")} times` : "more than"} this dose`;
    $("summary").innerHTML = d < T
      ? `At ${fmt(d)} a stochastic effect <b>may</b> occur: the chance is small but never zero. A deterministic effect <b>will not</b> occur: the dose is below its threshold. This is why every exposure must be justified, even though diagnostic doses never reach the thresholds.`
      : `At ${fmt(d)} the threshold is passed, so the deterministic effect <b>will</b> occur, and more dose makes it worse. Doses like this are met in radiotherapy, long interventional procedures or accidents, not in diagnostic radiography.`;
    $("note").textContent = `Stochastic panels run to 1 Sv; deterministic panels to ${E.max} Gy. For X-rays, 1 mSv of effective dose corresponds to about 1 mGy. Thresholds are absorbed doses in Gy (the lecture table lists them in Sv). Curve shapes are schematic.`;
    $("desc").textContent = `Four graphs of chance and severity against dose. Dose ${fmt(d)}. Stochastic chance ${$("r-st").textContent}. Deterministic: ${$("r-de").textContent}.`;
  }

  function redraw() { frames(); curves(); update(); }

  // Predict, then reveal and mark.
  const rows = [...root.querySelectorAll("[data-panel]")];
  $("reveal").addEventListener("click", () => {
    revealed = true;
    let right = 0;
    rows.forEach(r => {
      const p = PANELS.find(x => x.id === r.dataset.panel), sel = r.querySelector("select"), ok = sel.value === p.answer;
      if (ok) right++;
      sel.disabled = true;
      r.classList.toggle("is-correct", ok); r.classList.toggle("is-wrong", !ok);
      r.querySelector(".tagline").textContent = ok ? "Right" : `It's: ${SHAPES[p.answer].toLowerCase()}`;
    });
    $("score").textContent = `${right} of 4 right. ${right === 4 ? "Spot on." : "Compare your answers with the graphs."}`;
    $("reveal").hidden = true; $("hide").hidden = false;
    redraw();
  });
  $("hide").addEventListener("click", () => {
    revealed = false;
    rows.forEach(r => { const sel = r.querySelector("select"); sel.disabled = false; sel.value = ""; r.classList.remove("is-correct", "is-wrong"); r.querySelector(".tagline").textContent = ""; });
    $("score").textContent = "";
    $("reveal").hidden = false; $("hide").hidden = true;
    redraw();
  });

  doseIn.addEventListener("input", () => { dose = toDose(+doseIn.value); update(); });
  root.querySelectorAll("[data-preset]").forEach(b => b.addEventListener("click", () => { dose = +b.dataset.preset; doseIn.value = toSlider(dose); update(); }));
  root.querySelectorAll("[data-effect]").forEach(b => b.addEventListener("click", () => { effect = b.dataset.effect; redraw(); }));

  // A phone gets the four graphs in one column, stochastic first, so their labels have room.
  const svg = root.querySelector(".dr-svg");
  let narrow = null;
  function layout() {
    const n = svg.getBoundingClientRect().width < 460;
    if (n === narrow) return false;
    narrow = n;
    PW = n ? 250 : 236;
    svg.setAttribute("viewBox", n ? "0 0 320 712" : "0 0 640 400");
    ["sc", "ss", "dc", "ds"].forEach((id, i) => {
      const p = PANELS.find(x => x.id === id);
      [p.x0, p.y0] = n ? [50, 36 + i * 172] : WIDE[id];
    });
    return true;
  }
  const ro = new ResizeObserver(() => { if (layout()) redraw(); });
  ro.observe(svg);
  layout();
  redraw();
  return () => ro.disconnect();
}
