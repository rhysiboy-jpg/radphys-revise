// Explorer: the exposure console. Set kVp, mAs, focal spot, grid and distance; a simulated image of a cartoon limb shows
// brightness, contrast, noise and sharpness, with the exposure index (EI) and patient dose alongside.
// The model is illustrative and right in its trends, not a simulation of any real system:
//   detector signal ∝ mAs × kVp⁵ ÷ FRD² (so +15% kVp doubles it: the 15% rule), less what the grid absorbs;
//   patient entrance dose ∝ mAs × kVp² ÷ (FRD − thickness)², which matches the "Higher or lower?" lecture doses;
//   contrast falls as kVp rises and as scatter rises; noise ∝ 1 ÷ √(detector signal);
//   geometric unsharpness = focal spot × ORD ÷ (FRD − ORD), exaggerated so it shows on screen.

import { W, H, limb, grain as noiseField, blur } from "./limb.js";

const MAS = [0.5, 0.63, 0.8, 1, 1.25, 1.6, 2, 2.5, 3.2, 4, 5, 6.3, 8, 10, 12.5, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160];
export const EI_TARGET = 300, EI_LOW = 240, EI_HIGH = 380;     // an illustrative departmental range (deviation index ±1)
const MA = { fine: 250, broad: 500 };                    // illustrative tube current limits for each focal spot
const SPOT = { fine: 0.6, broad: 1.2 };                  // focal spot sizes in mm, as in the lecture

// Suggested settings for each body part. t: thickness (cm), ord: object–receptor distance (cm).
export const PARTS = {
  hand: { name: "Hand, PA", t: 3, kv: 55, mas: 2.5, grid: false, spot: "fine", ord: 1 },
  knee: { name: "Knee, AP", t: 11, kv: 65, mas: 8, grid: false, spot: "fine", ord: 4 },
  pelvis: { name: "Pelvis, AP", t: 20, kv: 75, mas: 32, grid: true, spot: "broad", ord: 8 },
};
export const FRD0 = 100;

// "What do I do?" (lecture: Exposure, slides 29–34). Factors are multipliers on the body part's suggested setting.
const CASES = [
  { part: "knee", kv: 1.3, mas: 1 / 3.7, answer: "kv",
    why: "The EI is in range, but the image is dark with little contrast. Too much kVp: the photons have too much energy, so the limb attenuates too little of the beam. Reprocess to improve the contrast, and next time use a <b>lower kVp</b>. With AEC, check the anatomy is centred over the chamber." },
  { part: "hand", kv: 1, mas: 3, answer: "mas",
    why: "The image looks fine, but the EI is above range. Too much mAs means too much dose for no gain. Next time <b>reduce the mAs</b>: ALARP." },
  { part: "pelvis", kv: 1.25, mas: 2, answer: "both",
    why: "The EI is above range and the image is too dark: too much mAs <b>and</b> too much kVp. Reprocess to improve the image, and next time <b>reduce both</b>." },
  { part: "knee", kv: 1.25, mas: 1 / 10, answer: "more",
    why: "The EI is below range and the image is dark and grainy: not enough mAs and too much kVp. If too little information reached the detector, reprocessing <b>will not</b> rescue it. Next time <b>increase the exposure</b>." },
  { part: "hand", kv: 1, mas: 1 / 3.5, answer: "more",
    why: "The EI is below range. The image may look acceptable at a glance, but it is grainy, and fine bone detail can be lost. Not enough quanta reached the detector: next time <b>increase the mAs</b>." },
];
// "Higher or lower?" (lecture: Modifying Exposure, slides 8–10). The first three settings and doses are the lecture's own;
// the rest are estimated from dose ∝ kVp² × mAs, calibrated to those three (k is their average).
const ESD_K = 1.55e-5;
const LADDER = [
  { kv: 120, mas: 6, esd: 1.4 },
  { kv: 60, mas: 141, esd: 7.6 },
  { kv: 75, mas: 36, esd: 3.2 },
  { kv: 86, mas: 18, note: "This is the 15% rule: about the same EI, roughly a third less dose." },
  { kv: 88, mas: 18, note: "A 2 kVp change barely alters the image, but the dose still creeps up." },
  { kv: 70, mas: 40, note: "Lower kVp needs much more mAs to reach the detector, and that costs dose." },
  { kv: 70, mas: 20, note: "Same kVp, half the mAs: half the dose, and a noisier image." },
  { kv: 96, mas: 8, note: "High kVp with low mAs gives the lowest dose here, but look at the contrast." },
].map(r => ({ ...r, esd: r.esd ?? +(ESD_K * r.kv ** 2 * r.mas).toFixed(1), estimated: r.esd == null }));

const CHOICES = [
  { id: "kv", text: "Lower the kVp" },
  { id: "mas", text: "Reduce the mAs" },
  { id: "both", text: "Reduce both kVp and mAs" },
  { id: "more", text: "Increase the mAs" },
];

const MARKUP = `
<div class="grid">
  <div class="stage">
    <canvas class="xray" width="${W}" height="${H}" role="img" data-role="img"></canvas>
    <p class="scale-note">Simulated image · cartoon limb, not a real patient · illustrative, not to scale</p>
  </div>
  <div class="panel">
    <div class="modes" role="group" aria-label="Mode">
      <button type="button" data-mode="explore" aria-pressed="true">Explore</button>
      <button type="button" data-mode="cases" aria-pressed="false">What do I do?</button>
      <button type="button" data-mode="hol" aria-pressed="false">Higher or lower?</button>
    </div>
    <div data-role="explore" class="panel">
      <div class="sliders">
        <div class="slider">
          <div class="slider-top"><label for="con-part">Body part</label></div>
          <select id="con-part" class="select">${Object.entries(PARTS).map(([id, p]) => `<option value="${id}">${p.name}</option>`).join("")}</select>
        </div>
        <div class="slider">
          <div class="slider-top"><label for="con-kv">Tube voltage</label><output for="con-kv" data-role="kv-o"></output></div>
          <input type="range" id="con-kv" min="40" max="125" step="1">
        </div>
        <div class="slider">
          <div class="slider-top"><label for="con-mas">mAs</label><output for="con-mas" data-role="mas-o"></output></div>
          <input type="range" id="con-mas" min="0" max="${MAS.length - 1}" step="1">
        </div>
        <div class="slider">
          <div class="slider-top"><label for="con-frd">Focus–receptor distance (FRD)</label><output for="con-frd" data-role="frd-o"></output></div>
          <input type="range" id="con-frd" min="90" max="180" step="5">
        </div>
        <div class="slider">
          <div class="slider-top"><span class="label">Focal spot</span></div>
          <div class="modes" role="group" aria-label="Focal spot">
            <button type="button" data-spot="fine">Fine, 0.6 mm</button>
            <button type="button" data-spot="broad">Broad, 1.2 mm</button>
          </div>
        </div>
        <div class="slider">
          <div class="slider-top"><span class="label">Anti-scatter grid</span></div>
          <div class="modes" role="group" aria-label="Anti-scatter grid">
            <button type="button" data-grid="out">Out</button>
            <button type="button" data-grid="in">In</button>
          </div>
        </div>
        <div class="controls">
          <button type="button" data-role="rule">Try the 15% rule</button>
          <button type="button" data-role="reset">Back to suggested</button>
        </div>
      </div>
    </div>
    <div data-role="cases" class="panel" hidden>
      <div class="stepper">
        <div class="step-meta"><span class="eyebrow" data-role="case-n"></span></div>
        <p data-role="case-q"></p>
        <fieldset data-role="case-opts"><legend class="eyebrow">What should you do next time?</legend></fieldset>
        <div data-role="case-fb" class="feedback" hidden></div>
        <div class="controls">
          <button type="button" class="primary" data-role="case-next">Next scenario</button>
          <button type="button" data-role="case-load" hidden>Fix it in the console</button>
        </div>
      </div>
    </div>
    <div data-role="hol" class="panel" hidden>
      <div class="stepper">
        <div class="step-meta"><span class="eyebrow" data-role="hol-n"></span><span class="eyebrow" data-role="hol-score"></span></div>
        <p data-role="hol-q"></p>
        <div class="controls" data-role="hol-btns">
          <button type="button" data-guess="higher">Higher dose</button>
          <button type="button" data-guess="lower">Lower dose</button>
        </div>
        <div data-role="hol-fb" class="feedback" hidden></div>
        <div class="controls"><button type="button" class="primary" data-role="hol-next" hidden>Next</button></div>
      </div>
    </div>
    <div class="readouts" data-role="readouts">
      <div class="readout"><span>Exposure index (EI)</span><b data-role="r-ei"></b><span data-role="r-ei-s"></span></div>
      <div class="readout"><span>Patient dose</span><b data-role="r-dose"></b><span>compared with the suggested setting</span></div>
      <div class="readout" data-role="r-q1"><span>Brightness</span><b data-role="r-bright"></b></div>
      <div class="readout" data-role="r-q2"><span>Contrast</span><b data-role="r-con"></b></div>
      <div class="readout" data-role="r-q3"><span>Noise</span><b data-role="r-noise"></b></div>
      <div class="readout" data-role="r-q4"><span>Sharpness</span><b data-role="r-sharp"></b></div>
      <div class="readout" data-role="r-q5"><span>Exposure time</span><b data-role="r-time"></b><span data-role="r-time-s"></span></div>
      <div class="readout" data-role="r-q6"><span>EI target range</span><b>${EI_LOW}–${EI_HIGH}</b><span>illustrative</span></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
    <div class="try" data-role="try">
      <h3>Try this</h3>
      <ol>
        <li><b>Halve the mAs, then halve it again.</b> The image stays just as bright, because a digital system adjusts it, but it gets grainier and the EI falls.</li>
        <li><b>Use the 15% rule.</b> Raise kVp by 15% and halve the mAs: the EI barely moves, the dose falls by about a third, and contrast drops a little.</li>
        <li><b>Take the grid out for the pelvis.</b> Scatter floods the image and contrast falls. Put it back and the mAs has to rise.</li>
        <li><b>Switch to the broad focus.</b> Fine detail softens, most on the pelvis, where the ORD is larger.</li>
      </ol>
    </div>
  </div>
</div>`;


// Everything the console shows, from the settings s = { part, kv, mas, frd, spot, grid }.
export function model(s) {
  const p = PARTS[s.part];
  const scatter = t => t / (t + 5);                       // scatter fraction without a grid, rising with thickness
  const withGrid = (sf, grid) => grid ? { sf: (sf * 0.12) / (sf * 0.12 + (1 - sf) * 0.7), pass: sf * 0.12 + (1 - sf) * 0.7 } : { sf, pass: 1 };
  const sf0 = scatter(p.t), now = withGrid(sf0, s.grid), ref = withGrid(sf0, p.grid);
  const det = (s.mas / p.mas) * (s.kv / p.kv) ** 5 * (FRD0 / s.frd) ** 2 * (now.pass / ref.pass);
  const dose = (s.mas / p.mas) * (s.kv / p.kv) ** 2 * ((FRD0 - p.t) / (s.frd - p.t)) ** 2;
  const contrast = (p.kv / s.kv) ** 1.3 * ((1 - now.sf) / (1 - ref.sf));
  const level = 0.5 - 0.28 * Math.tanh((s.kv - p.kv) / (0.35 * p.kv));   // higher kVp: darker, over-penetrated; +15% only a little
  const noise = Math.min(0.35, 0.045 / Math.sqrt(det));
  const unsharp = (SPOT[s.spot] * p.ord) / (s.frd - p.ord);              // mm
  const time = s.mas / MA[s.spot];                                        // s
  return { det, ei: Math.round(EI_TARGET * det), dose, contrast, level, noise, unsharp, blur: 0.6 + 20 * unsharp, time };
}

const words = {
  ei: ei => ei < EI_LOW ? "Below range" : ei > EI_HIGH ? "Above range" : "Within range",
  bright: l => l > 0.6 ? "Light: under-penetrated" : l < 0.38 ? "Dark: over-penetrated" : "Good",
  con: c => c > 1.2 ? "High" : c < 0.8 ? "Low" : "Good",
  noise: n => n <= 0.05 ? "Low" : n <= 0.075 ? "Some grain" : "Grainy",
  sharp: b => b <= 1.7 ? "Sharp" : b <= 2.8 ? "Slightly soft" : "Unsharp",
};

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const partIn = root.querySelector("#con-part"), kvIn = root.querySelector("#con-kv"), masIn = root.querySelector("#con-mas"), frdIn = root.querySelector("#con-frd");
  const canvas = $("img"), ctx = canvas.getContext("2d"), pixels = ctx.createImageData(W, H);
  const map = limb(), grain = noiseField();
  const blurred = new Map();
  let s = {}, mode = "explore", caseIx = 0, summaryTimer = null;

  const masIndex = v => MAS.reduce((best, m, i) => Math.abs(Math.log(m / v)) < Math.abs(Math.log(MAS[best] / v)) ? i : best, 0);
  const fmtMas = v => (v < 10 ? +v.toFixed(2) : Math.round(v)).toString();

  function render(m) {
    const k = Math.round(m.blur * 2) / 2;
    if (!blurred.has(k)) blurred.set(k, blur(map, k));
    const w = blurred.get(k), d = pixels.data, c = 0.95 * m.contrast;
    for (let i = 0; i < W * H; i++) {
      const v = Math.max(0, Math.min(1, m.level + c * (w[i] - 0.45) + m.noise * grain[i]));
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = Math.round(v * 255);
      d[i * 4 + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
  }

  function setSettings(next) {
    s = { ...s, ...next };
    partIn.value = s.part; kvIn.value = s.kv; masIn.value = masIndex(s.mas); frdIn.value = s.frd;
    update();
  }
  const suggested = part => { const p = PARTS[part]; return { part, kv: p.kv, mas: p.mas, frd: FRD0, spot: p.spot, grid: p.grid }; };

  function update() {
    const m = model(s), p = PARTS[s.part];
    $("kv-o").textContent = `${s.kv} kVp`;
    $("mas-o").textContent = `${fmtMas(s.mas)} mAs`;
    $("frd-o").textContent = `${s.frd} cm`;
    root.querySelectorAll("[data-spot]").forEach(b => b.setAttribute("aria-pressed", b.dataset.spot === s.spot));
    root.querySelectorAll("[data-grid]").forEach(b => b.setAttribute("aria-pressed", (b.dataset.grid === "in") === s.grid));
    render(m);

    const inCase = mode !== "explore";
    $("r-ei").textContent = m.ei;
    $("r-ei-s").textContent = words.ei(m.ei);
    $("r-dose").textContent = `× ${m.dose < 10 ? +m.dose.toFixed(2) : Math.round(m.dose)}`;
    $("r-bright").textContent = words.bright(m.level);
    $("r-con").textContent = words.con(m.contrast);
    $("r-noise").textContent = words.noise(m.noise);
    $("r-sharp").textContent = words.sharp(m.blur);
    $("r-time").textContent = m.time < 1 ? `${Math.round(m.time * 1000)} ms` : `${+m.time.toFixed(1)} s`;
    $("r-time-s").textContent = `at ${MA[s.spot]} mA${m.time > 0.2 ? ": risk of movement" : ""}`;
    // In a scenario the student judges the image themselves, so the quality words are hidden; the dose game has its own numbers.
    $("readouts").hidden = mode === "hol";
    ["r-q1", "r-q2", "r-q3", "r-q4", "r-q5", "r-q6"].forEach(r => { $(r).hidden = inCase; });

    const look = [words.bright(m.level).split(":")[0].toLowerCase(), `${words.con(m.contrast).toLowerCase()} contrast`, words.noise(m.noise).toLowerCase() === "low" ? "little noise" : words.noise(m.noise).toLowerCase(), words.sharp(m.blur).toLowerCase()];
    canvas.setAttribute("aria-label", inCase
      ? `Simulated ${p.name.toLowerCase()} image. Exposure index ${m.ei}.`
      : `Simulated ${p.name.toLowerCase()} image at ${s.kv} kVp and ${fmtMas(s.mas)} mAs: brightness ${look[0]}, ${look[1]}, ${look[2]}, ${look[3]}.`);
    if (!inCase) {
      const sentence = `${p.name} at ${s.kv} kVp, ${fmtMas(s.mas)} mAs, ${s.frd} cm, ${s.spot} focus, grid ${s.grid ? "in" : "out"}. ` +
        `EI ${m.ei} (${words.ei(m.ei).toLowerCase()}), patient dose ${m.dose < 10 ? +m.dose.toFixed(2) : Math.round(m.dose)} times the suggested setting.` +
        (p.grid !== s.grid ? (s.grid ? " A grid on a part this thin adds dose for little gain." : " Without the grid, scatter lowers the contrast.") : "");
      clearTimeout(summaryTimer);
      summaryTimer = setTimeout(() => { $("summary").textContent = sentence; }, 250);
    }
  }

  // Scenarios
  function showCase() {
    const c = CASES[caseIx], p = PARTS[c.part];
    $("case-n").textContent = `Scenario ${caseIx + 1} of ${CASES.length} · ${p.name}`;
    $("case-q").textContent = "Look at the image and the exposure index. What went wrong?";
    const fs = $("case-opts");
    fs.querySelectorAll(".opt").forEach(n => n.remove());
    fs.classList.remove("locked");
    CHOICES.forEach(ch => {
      const label = document.createElement("label");
      label.className = "opt";
      label.innerHTML = `<input type="radio" name="con-case" value="${ch.id}"><span>${ch.text}</span><span class="tagline"></span>`;
      label.querySelector("input").addEventListener("change", () => answer(ch.id));
      fs.appendChild(label);
    });
    $("case-fb").hidden = true;
    $("case-load").hidden = true;
    $("summary").textContent = "";
    const base = suggested(c.part);
    setSettings({ ...base, kv: Math.round(base.kv * c.kv), mas: MAS[masIndex(base.mas * c.mas)] });
  }
  function answer(id) {
    const c = CASES[caseIx], fs = $("case-opts");
    if (fs.classList.contains("locked")) return;
    fs.classList.add("locked");
    fs.querySelectorAll(".opt").forEach(o => {
      const v = o.querySelector("input").value;
      o.querySelector("input").disabled = true;
      if (v === c.answer) { o.classList.add("is-correct"); o.querySelector(".tagline").textContent = "Correct answer"; }
      else if (v === id) { o.classList.add("is-wrong"); o.querySelector(".tagline").textContent = "Your answer"; }
    });
    const fb = $("case-fb");
    fb.innerHTML = `<p class="verdict ${id === c.answer ? "good" : "bad"}">${id === c.answer ? "Right" : "Not quite"}</p><div class="why"><p>${c.why}</p></div>`;
    fb.hidden = false;
    $("case-load").hidden = false;
  }

  // Higher or lower: a pelvis, broad focus, grid in, as in the lecture's examples.
  let rung = 0, score = 0;
  const pelvisAt = r => setSettings({ ...suggested("pelvis"), kv: r.kv, mas: MAS[masIndex(r.mas)] });
  const ratio = v => (v >= 10 ? Math.round(v) : +v.toFixed(2));
  function showRung() {
    const a = LADDER[rung], b = LADDER[rung + 1];
    $("hol-n").textContent = `Round ${rung + 1} of ${LADDER.length - 1} · Pelvis, AP`;
    $("hol-score").textContent = `Score ${score}`;
    $("hol-q").innerHTML = `Now: <b>${a.kv} kVp, ${a.mas} mAs</b>, entrance surface dose <b>${a.esd} mGy</b>.<br>Next: <b>${b.kv} kVp, ${b.mas} mAs</b>. Will the dose be higher or lower?`;
    $("hol-btns").hidden = false;
    $("hol-fb").hidden = true;
    $("hol-next").hidden = true;
    $("summary").textContent = "";
    pelvisAt(a);
  }
  function guess(g) {
    const a = LADDER[rung], b = LADDER[rung + 1], truth = b.esd > a.esd ? "higher" : "lower";
    if (g === truth) score++;
    pelvisAt(b);
    const kvF = (b.kv / a.kv) ** 2, masF = b.mas / a.mas, m = model(s);
    $("hol-btns").hidden = true;
    $("hol-fb").innerHTML = `<p class="verdict ${g === truth ? "good" : "bad"}">${g === truth ? "Right" : "Not quite"}: ${truth}, ${b.esd} mGy${b.estimated ? " (estimated)" : ""}</p>` +
      `<div class="why"><p>kVp × ${ratio(b.kv / a.kv)} multiplies the dose by about ${ratio(kvF)} (dose follows kVp²). mAs × ${ratio(masF)} multiplies it by ${ratio(masF)}. Together: about × ${ratio(kvF * masF)}.${b.note ? " " + b.note : ""}</p>` +
      `<p>At ${b.kv} kVp and ${b.mas} mAs the EI is ${m.ei}, ${words.ei(m.ei).toLowerCase()}.</p></div>`;
    $("hol-fb").hidden = false;
    const last = rung + 1 === LADDER.length - 1;
    $("hol-score").textContent = `Score ${score}`;
    $("hol-next").textContent = last ? `Play again (you scored ${score} of ${LADDER.length - 1})` : "Next";
    $("hol-next").hidden = false;
  }

  function setMode(next) {
    mode = next;
    root.querySelectorAll("[data-mode]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === mode));
    $("explore").hidden = mode !== "explore";
    $("cases").hidden = mode !== "cases";
    $("hol").hidden = mode !== "hol";
    $("try").hidden = mode !== "explore";
    if (mode === "cases") showCase();
    else if (mode === "hol") { rung = 0; score = 0; showRung(); }
    else update();
  }

  partIn.addEventListener("change", () => setSettings(suggested(partIn.value)));
  kvIn.addEventListener("input", () => setSettings({ kv: +kvIn.value }));
  masIn.addEventListener("input", () => setSettings({ mas: MAS[+masIn.value] }));
  frdIn.addEventListener("input", () => setSettings({ frd: +frdIn.value }));
  root.querySelectorAll("[data-spot]").forEach(b => b.addEventListener("click", () => setSettings({ spot: b.dataset.spot })));
  root.querySelectorAll("[data-grid]").forEach(b => b.addEventListener("click", () => setSettings({ grid: b.dataset.grid === "in" })));
  $("reset").addEventListener("click", () => setSettings(suggested(s.part)));
  $("rule").addEventListener("click", () => setSettings({ kv: Math.min(125, Math.round(s.kv * 1.15)), mas: MAS[Math.max(0, masIndex(s.mas / 2))] }));
  root.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
  $("case-next").addEventListener("click", () => { caseIx = (caseIx + 1) % CASES.length; showCase(); });
  $("case-load").addEventListener("click", () => setMode("explore"));
  root.querySelectorAll("[data-guess]").forEach(b => b.addEventListener("click", () => guess(b.dataset.guess)));
  $("hol-next").addEventListener("click", () => {
    if (rung + 1 === LADDER.length - 1) { rung = 0; score = 0; } else rung++;
    showRung();
  });

  setSettings(suggested("knee"));
  return () => clearTimeout(summaryTimer);
}
