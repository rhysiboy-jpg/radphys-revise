// Simulator: automatic exposure control. Three ionisation chambers sit between the patient and the detector; the selected ones
// measure the radiation reaching them and end the exposure when their average reaches a calibrated amount. The radiographer picks
// the chambers under the anatomy of interest. Because the exposure ends at a set amount, the dose at the detector under the chosen
// chambers is always the same: a larger patient just takes longer. The wrong chambers, or metal over a chamber, give the wrong
// exposure to the anatomy that matters. If the chambers receive almost nothing, the guard (back-up) timer ends the exposure.
// Transmissions, mAs and the guard-timer limit are illustrative.
import { svgEl as el, tween, reducedMotion } from "./util.js";

const EXAMS = {
  chest: { name: "PA chest", mas: 3, roi: "the lungs", right: ["L", "R"],
    T: { L: 1, C: 0.22, R: 1 }, roiT: 1 },
  spine: { name: "AP lumbar spine", mas: 25, roi: "the spine", right: ["C"],
    T: { L: 0.55, C: 0.25, R: 0.55 }, roiT: 0.25 },
};
const BUILDS = { slim: { name: "Slim", k: 1.6 }, avg: { name: "Average", k: 1 }, large: { name: "Large", k: 0.5 } };
const GUARD = 5;                                  // the guard timer ends the exposure at 5 × the usual mAs (illustrative)
const CH = { L: { x: 215, y: 110 }, C: { x: 300, y: 205 }, R: { x: 385, y: 110 } };
const CW = 56, CHH = 62;

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 640 330" role="img" aria-labelledby="aec-t aec-d">
      <title id="aec-t">AEC chambers over the patient, seen from the X-ray tube</title>
      <desc id="aec-d" data-role="desc"></desc>
      <rect class="aec-det" x="120" y="20" width="400" height="300" rx="10"/>
      <g data-role="body"></g>
      <g data-role="chambers"></g>
      <text class="plane-t" x="320" y="14" text-anchor="middle">Detector, with the AEC chambers in front of it</text>
    </svg>
    <p class="scale-note">Schematic, seen from the tube · chambers filled: selected · the bar in each chamber shows the radiation it has measured · illustrative values</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider"><div class="slider-top"><span class="label">Examination</span></div>
        <div class="modes" role="group" aria-label="Examination">${Object.entries(EXAMS).map(([id, x]) => `<button type="button" data-exam="${id}">${x.name}</button>`).join("")}</div></div>
      <div class="slider"><div class="slider-top"><span class="label">Chambers selected</span></div>
        <div class="modes" role="group" aria-label="Chambers"><button type="button" data-ch="L">Left</button><button type="button" data-ch="C">Centre</button><button type="button" data-ch="R">Right</button></div></div>
      <div class="slider"><div class="slider-top"><span class="label">Patient build</span></div>
        <div class="modes" role="group" aria-label="Build">${Object.entries(BUILDS).map(([id, x]) => `<button type="button" data-build="${id}">${x.name}</button>`).join("")}</div></div>
      <div class="slider"><div class="slider-top"><span class="label">Over the centre chamber</span></div>
        <div class="modes" role="group" aria-label="Over the centre chamber"><button type="button" data-extra="none">Nothing extra</button><button type="button" data-extra="metal">Metal implant</button><button type="button" data-extra="lead">Lead (QA test)</button></div></div>
      <div class="controls"><button type="button" class="primary" data-role="go">Expose</button></div>
    </div>
    <div class="readouts">
      <div class="readout"><span>mAs used</span><b data-role="r-mas">–</b><span data-role="r-mas-s"></span></div>
      <div class="readout"><span>Exposure to the anatomy</span><b data-role="r-roi">–</b><span data-role="r-roi-s"></span></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const st = { exam: "chest", build: "avg", extra: "none", sel: new Set(["L", "R"]) };
  let alive = true, run = 0;

  // The chambers, each with a bar that fills as it measures radiation.
  const chambers = Object.fromEntries(Object.entries(CH).map(([k, c]) => {
    const g = el("g", { class: "aec-ch" }, $("chambers"));
    const box = el("rect", { x: c.x - CW / 2, y: c.y - CHH / 2, width: CW, height: CHH, rx: 6 }, g);
    const bar = el("rect", { class: "aec-bar", x: c.x - CW / 2 + 6, width: CW - 12, rx: 3 }, g);
    const lbl = el("text", { class: "aec-ch-t", x: c.x, y: c.y + CHH / 2 + 16 }, g);
    lbl.textContent = { L: "Left", C: "Centre", R: "Right" }[k];
    return [k, { g, box, bar }];
  }));
  const setBar = (k, f) => { const b = chambers[k].bar, h = Math.min(1, f) * (CHH - 12); b.setAttribute("y", (CH[k].y + CHH / 2 - 6 - h).toFixed(1)); b.setAttribute("height", h.toFixed(1)); };

  function drawBody() {
    const g = $("body"); g.innerHTML = "";
    if (st.exam === "chest") {
      el("path", { class: "aec-skin", d: "M200 300 C180 220 170 120 210 60 L430 60 C470 120 460 220 440 300 Z" }, g);
      el("path", { class: "aec-lung", d: "M300 80 C250 80 205 130 200 250 C230 262 280 262 300 250 Z" }, g);
      el("path", { class: "aec-lung", d: "M340 80 C390 80 435 130 440 250 C410 262 360 262 340 250 Z" }, g);
      for (let y = 66; y < 300; y += 18) el("rect", { class: "aec-bone", x: 308, y, width: 24, height: 14, rx: 3 }, g);
      el("text", { class: "plane-t", x: 160, y: 170, "text-anchor": "middle" }, g).textContent = "lung";
    } else {
      el("path", { class: "aec-skin", d: "M180 300 C170 200 175 110 190 40 L450 40 C465 110 470 200 460 300 Z" }, g);
      for (let y = 46; y < 300; y += 36) el("rect", { class: "aec-bone", x: 296, y, width: 48, height: 28, rx: 5 }, g);
      el("path", { class: "aec-bone", d: "M190 270 C230 240 270 250 296 300 L200 300 Z" }, g);
      el("path", { class: "aec-bone", d: "M450 270 C410 240 370 250 344 300 L440 300 Z" }, g);
      el("text", { class: "plane-t", x: 152, y: 170, "text-anchor": "middle" }, g).textContent = "soft tissue";
    }
    if (st.extra === "metal") el("rect", { class: "aec-metal", x: CH.C.x - 14, y: CH.C.y - 36, width: 28, height: 72, rx: 4 }, g);
    if (st.extra === "lead") el("rect", { class: "aec-lead", x: CH.C.x - CW / 2 - 4, y: CH.C.y - CHH / 2 - 4, width: CW + 8, height: CHH + 8, rx: 6 }, g);
  }

  // Signal rate at each chamber: tissue transmission × patient build, cut by metal or lead over the centre.
  const rate = k => {
    const E = EXAMS[st.exam];
    let t = E.T[k] * BUILDS[st.build].k;
    if (k === "C" && st.extra === "metal") t *= 0.08;
    if (k === "C" && st.extra === "lead") t *= 0.001;
    return t;
  };

  function sync() {
    for (const k of ["exam", "build", "extra"]) root.querySelectorAll(`[data-${k}]`).forEach(b => b.setAttribute("aria-pressed", b.dataset[k] === st[k]));
    root.querySelectorAll("[data-ch]").forEach(b => b.setAttribute("aria-pressed", st.sel.has(b.dataset.ch)));
    Object.entries(chambers).forEach(([k, c]) => { c.g.classList.toggle("on", st.sel.has(k)); setBar(k, 0); });
    $("go").disabled = !st.sel.size;
    drawBody();
    $("r-mas").textContent = "–"; $("r-mas-s").textContent = ""; $("r-roi").textContent = "–"; $("r-roi-s").textContent = "";
    $("summary").textContent = st.sel.size ? "Press Expose." : "Select at least one chamber.";
    $("desc").textContent = `${EXAMS[st.exam].name}, ${BUILDS[st.build].name.toLowerCase()} build, with the ${[...st.sel].map(k => ({ L: "left", C: "centre", R: "right" })[k]).join(" and ")} chamber${st.sel.size > 1 ? "s" : ""} selected.`;
  }

  async function expose() {
    const id = ++run, E = EXAMS[st.exam], sel = [...st.sel];
    const mean = sel.reduce((s, k) => s + rate(k), 0) / sel.length;
    const usual = 1 / (E.roiT * 1);                                // time to reach the set amount for an average patient, correct chambers
    let t = 1 / mean, guard = false;
    if (t > GUARD * usual) { t = GUARD * usual; guard = true; }
    const rel = t / usual, mas = E.mas * rel;
    const roi = E.roiT * BUILDS[st.build].k * t;                   // exposure reaching the detector under the anatomy, 1 = right
    $("go").disabled = true;
    await tween(reducedMotion() ? 0 : Math.min(2600, 700 + 450 * rel), f => {
      if (id !== run) return;
      sel.forEach(k => setBar(k, rate(k) * t * f));
    }, () => alive && id === run);
    if (!alive || id !== run) return;
    $("go").disabled = false;
    $("r-mas").textContent = `${+mas.toFixed(1)} mAs`;
    $("r-mas-s").textContent = guard ? "ended by the guard timer" : "ended by the AEC";
    const verdict = roi > 1.6 ? "Too much" : roi < 0.6 ? "Too little" : "About right";
    $("r-roi").textContent = verdict;
    $("r-roi-s").textContent = `× ${+roi.toFixed(1)} of the intended amount`;
    const ideal = sel.length === E.right.length && E.right.every(k => sel.includes(k));
    const are = E.roi.endsWith("s") ? "are" : "is";
    let why;
    if (st.extra === "lead" && sel.includes("C") && guard) why = "With lead over the chamber it measures almost nothing, so the AEC never reaches its set amount. The guard timer has ended the exposure, as it should: this is how it is tested.";
    else if (st.extra === "metal" && sel.includes("C")) why = `The metal over the centre chamber absorbs most of the radiation, so the AEC keeps going far too long${guard ? ", until the guard timer stops it" : ""}: the rest of the image is overexposed and the patient gets extra dose.`;
    else if (guard) why = "The selected chambers measured too little to end the exposure, so the guard timer stopped it.";
    else if (verdict === "About right" && ideal) why = `The chambers lie under ${E.roi}, so ${E.roi} ${E.roi.endsWith("s") ? "get" : "gets"} the intended exposure.${st.build !== "avg" ? ` A ${BUILDS[st.build].name.toLowerCase()} patient just needs ${st.build === "large" ? "a longer" : "a shorter"} exposure: the AEC adjusts the mAs.` : ""}`;
    else if (verdict === "About right") why = `Not every chamber chosen lies under ${E.roi}, so the exposure is a little ${roi > 1 ? "high" : "low"}. Choose only the chambers under the anatomy of interest.`;
    else if (roi > 1) why = `The chambers chosen sit under denser tissue than ${E.roi}, so the AEC runs too long: ${E.roi} ${are} overexposed and the dose is higher than needed.`;
    else why = `The chambers chosen sit under thinner tissue than ${E.roi}, so the AEC ends too soon: ${E.roi} ${are} underexposed and noisy.`;
    $("summary").textContent = `${+mas.toFixed(1)} mAs. ${why}`;
  }

  root.querySelectorAll("[data-exam]").forEach(b => b.addEventListener("click", () => { run++; st.exam = b.dataset.exam; st.sel = new Set(EXAMS[st.exam].right); st.extra = "none"; sync(); }));
  root.querySelectorAll("[data-build]").forEach(b => b.addEventListener("click", () => { run++; st.build = b.dataset.build; sync(); }));
  root.querySelectorAll("[data-extra]").forEach(b => b.addEventListener("click", () => { run++; st.extra = b.dataset.extra; sync(); }));
  root.querySelectorAll("[data-ch]").forEach(b => b.addEventListener("click", () => { run++; const k = b.dataset.ch; st.sel.has(k) ? st.sel.delete(k) : st.sel.add(k); sync(); }));
  $("go").addEventListener("click", expose);
  sync();
  return () => { alive = false; };
}
