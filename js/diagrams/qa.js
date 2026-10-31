// Checker: QA test results against remedial and suspension levels. Levels are as given in the QA and QC lecture, which
// cites IPEM Report 91; departments may set their own. A result counts as beyond a level when it is more than that level.
// Remedial: action is needed, but the unit may stay in use under a risk assessment. Suspension: remove from clinical use.
import { svgEl as el } from "./util.js";

// rem, sus: levels in the test's unit (sus null: no suspension level). max: end of the scale.
// pm: the result can go either way (±); fall: only a fall from baseline counts.
const TESTS = {
  light: { name: "Light beam and X-ray field alignment", unit: "cm", what: "misalignment on any side, at 1 m from the focal spot", rem: 1, sus: 3, max: 4, step: 0.1, often: "Every 1–2 months",
    how: "The light-beam edges are marked on a detector and an exposure is made; the X-ray field is compared with the light field." },
  outRep: { pm: true, name: "Tube output: repeatability", unit: "%", what: "difference from the mean when the same exposure is repeated", rem: 10, sus: 20, max: 30, step: 1, often: "Every 1–2 months",
    how: "An ionisation chamber at a known distance measures dose per mAs for repeated exposures." },
  outCon: { pm: true, name: "Tube output: consistency", unit: "%", what: "change from the baseline output", rem: 20, sus: 50, max: 70, step: 1, often: "Every 1–2 months",
    how: "Output is compared with the baseline set at commissioning." },
  kv: { name: "Tube kVp accuracy", unit: "kVp", what: "difference between measured and set kVp", kv: true, max: 20, step: 0.5, often: "Every 1–2 years",
    how: "An electronic kV meter measures the tube voltage across a range of settings." },
  aec: { pm: true, name: "AEC: mAs and DDI against baseline", unit: "%", what: "change in mAs or detector dose indicator from baseline, 1 mm copper in the beam", rem: 25, sus: 50, max: 70, step: 1, often: "Every 1–3 months",
    how: "1 mm copper is imaged under AEC control and the mAs and DDI are recorded." },
  aecRep: { pm: true, name: "AEC repeatability", unit: "%", what: "difference from the mean of repeated AEC exposures", rem: 20, sus: null, max: 40, step: 1, often: "Annually",
    how: "Repeated exposures with the same AEC settings; the mAs and DDI are compared." },
  aecRepro: { pm: true, name: "AEC reproducibility", unit: "%", what: "change from baseline across a range of kVp and thicknesses", rem: 30, sus: 60, max: 80, step: 1, often: "Annually",
    how: "Like the consistency test, but over a wider range of tube voltages and phantom thicknesses." },
  ddi: { pm: true, name: "Detector dose indicator (DDI)", unit: "%", what: "change from baseline in repeatability and reproducibility", rem: 10, sus: 20, max: 30, step: 1, often: "Annually",
    how: "Known exposures are made and the DDI readings compared with baseline." },
  res: { fall: true, name: "Limiting spatial resolution", unit: "%", what: "fall in resolution from baseline", rem: 25, sus: null, max: 50, step: 1, often: "Every 4–6 months",
    how: "A lead bar-pattern test object shows the finest detail the system can resolve." },
  lowCon: { name: "Low-contrast sensitivity", unit: "groups", what: "contrast detail groups lost from baseline (Leeds test object)", rem: 2, sus: null, max: 5, step: 1, often: "Every 4–6 months",
    how: "A Leeds test object checks that low-contrast details can still be seen." },
  unif: { name: "Measured uniformity", unit: "%", what: "standard deviation of five regions ÷ their mean", rem: 5, sus: null, max: 15, step: 0.5, often: "Annually",
    how: "An image with no object in the field; regions in each quadrant and the centre are compared." },
  dark: { pm: true, name: "Dark noise", unit: "%", what: "change in noise from baseline, with no or very low exposure", rem: 50, sus: null, max: 80, step: 1, often: "Annually",
    how: "An image taken with no exposure shows the system's own noise." },
};
const KV_SET = [60, 80, 120];

// kVp: remedial ±5% or ±5 kV, suspension ±10% or ±10 kV, whichever is greater at the set kVp.
const levels = (t, kvSet) => t.kv ? { rem: Math.max(5, 0.05 * kvSet), sus: Math.max(10, 0.1 * kvSet) } : { rem: t.rem, sus: t.sus };
const verdictOf = (v, L) => L.sus !== null && v > L.sus ? "sus" : v > L.rem ? "rem" : "ok";
const VERDICT = {
  ok: { name: "Within tolerance", text: "No action needed. Record the result." },
  rem: { name: "Remedial level", text: "Action is needed. The unit may stay in use for now, based on a risk assessment, with an agreed timescale for repair and any restrictions on use." },
  sus: { name: "Suspension level", text: "Remove the equipment from clinical use immediately, and repeat the test in case of error." },
};

const B = { x0: 20, x1: 620, y: 40, h: 40 };   // the scale bar

const MARKUP = `
<div class="grid">
  <div class="stage">
    <div class="modes" role="group" aria-label="Mode">
      <button type="button" data-mode="explore" aria-pressed="true">Explore the levels</button>
      <button type="button" data-mode="quiz" aria-pressed="false">Test me</button>
    </div>
    <svg viewBox="0 0 640 130" role="img" aria-labelledby="qa-t qa-d">
      <title id="qa-t">The measured result on a scale of tolerance, remedial and suspension levels</title>
      <desc id="qa-d" data-role="desc"></desc>
      <g data-role="bar"></g>
    </svg>
    <div class="part-card">
      <p class="eyebrow" data-role="often"></p>
      <h3 data-role="name"></h3>
      <p data-role="how"></p>
    </div>
    <p class="scale-note">Levels as given in the QA and QC lecture, from IPEM Report 91. Your department's protocol may differ.</p>
  </div>
  <div class="panel">
    <div class="sliders" data-role="explore">
      <div class="slider">
        <div class="slider-top"><label for="qa-test">Test</label></div>
        <select id="qa-test" class="select">${Object.entries(TESTS).map(([id, t]) => `<option value="${id}">${t.name}</option>`).join("")}</select>
      </div>
      <div class="slider" data-role="kv-box">
        <div class="slider-top"><span class="label">Set kVp</span></div>
        <div class="modes" role="group" aria-label="Set kVp">${KV_SET.map(k => `<button type="button" data-kv="${k}">${k} kVp</button>`).join("")}</div>
      </div>
      <div class="slider">
        <div class="slider-top"><label for="qa-v">Measured result</label><output for="qa-v" data-role="v-o"></output></div>
        <input type="range" id="qa-v" min="0">
        <small data-role="what"></small>
      </div>
    </div>
    <div class="stepper" data-role="quiz" hidden>
      <div class="step-meta"><span class="eyebrow" data-role="q-n"></span><span class="eyebrow" data-role="q-score"></span></div>
      <p data-role="q-text"></p>
      <div class="controls" data-role="q-btns">
        ${Object.entries(VERDICT).map(([id, v]) => `<button type="button" data-answer="${id}">${v.name}</button>`).join("")}
      </div>
      <div class="feedback" data-role="q-fb" hidden></div>
      <div class="controls"><button type="button" class="primary" data-role="q-next" hidden>Next result</button></div>
    </div>
    <div class="readouts" data-role="readouts">
      <div class="readout"><span>Verdict</span><b data-role="r-verdict"></b></div>
      <div class="readout"><span>Remedial level</span><b data-role="r-rem"></b></div>
      <div class="readout"><span>Suspension level</span><b data-role="r-sus"></b></div>
      <div class="readout"><span>Tested</span><b data-role="r-often"></b></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = q => root.querySelector(`[data-role="${q}"]`);
  const testIn = root.querySelector("#qa-test"), vIn = root.querySelector("#qa-v");
  let kvSet = 80, mode = "explore", quiz = null, asked = 0, score = 0;

  const num = (v, t) => +v.toFixed(t.step < 1 ? 1 : 0);
  const fmt = (v, t) => t.unit === "%" ? `${t.pm ? "± " : ""}${num(v, t)}%${t.fall ? " lower" : ""}` : `${num(v, t)} ${t.unit}`;
  const levelText = (v, t) => v === null ? "None" : t.unit === "%" ? (t.fall ? `A fall of more than ${+v.toFixed(1)}%` : `More than ${t.pm ? "± " : ""}${+v.toFixed(1)}%`) : `More than ${+v.toFixed(1)} ${t.unit}`;

  function bar(t, L, v, hideVerdict) {
    const g = $("bar");
    g.innerHTML = "";
    const x = val => B.x0 + (Math.min(val, t.max) / t.max) * (B.x1 - B.x0);
    const zone = (a, b, cls, name) => {
      if (b <= a) return;
      el("rect", { class: `qa-zone ${cls}`, x: x(a), y: B.y, width: x(b) - x(a), height: B.h }, g);
      el("text", { class: "qa-zone-t", x: (x(a) + x(b)) / 2, y: B.y + B.h / 2 + 4, "text-anchor": "middle" }, g).textContent = name;
    };
    zone(0, L.rem, "ok", "Within");
    zone(L.rem, L.sus ?? t.max, "rem", "Remedial");
    if (L.sus !== null) zone(L.sus, t.max, "sus", "Suspend");
    [0, L.rem, L.sus, t.max].filter(n => n !== null).forEach(n => {
      el("line", { class: "qa-tick", x1: x(n), y1: B.y + B.h, x2: x(n), y2: B.y + B.h + 6 }, g);
      el("text", { class: "tick-t", x: x(n), y: B.y + B.h + 22, "text-anchor": n === 0 ? "start" : n === t.max ? "end" : "middle" }, g).textContent = `${+n.toFixed(1)}${n === t.max ? (t.unit === "%" ? "%" : ` ${t.unit}`) : ""}`;   // the unit rides on the last number
    });
    // The measured result
    el("path", { class: "qa-marker", d: `M${x(v)} ${B.y - 4} V${B.y + 7} M${x(v)} ${B.y + B.h - 7} V${B.y + B.h + 4}` }, g);   // notches, so the zone name stays readable
    el("path", { class: "qa-pointer", d: `M${x(v) - 7} ${B.y - 16} L${x(v) + 7} ${B.y - 16} L${x(v)} ${B.y - 5} Z` }, g);
    // The label hangs off whichever side of the marker has room, so it never runs off the end of the bar.
    const at = (x(v) - B.x0) / (B.x1 - B.x0), anchor = at > 0.66 ? "end" : at < 0.34 ? "start" : "middle";
    el("text", { class: "fxlabel", x: x(v) + (anchor === "end" ? 10 : anchor === "start" ? -10 : 0), y: B.y - 22, "text-anchor": anchor }, g).textContent = `measured ${fmt(v, t)}`;
    if (hideVerdict) g.querySelectorAll(".qa-zone-t").forEach(n => n.setAttribute("opacity", 0));
  }

  function show(t, L, v, hideVerdict = false) {
    const verdict = verdictOf(v, L);
    $("often").textContent = t.often;
    $("name").textContent = t.name;
    $("how").textContent = t.how;
    $("what").textContent = `Measured as the ${t.what}.`;
    $("r-rem").textContent = levelText(L.rem, t);
    $("r-sus").textContent = L.sus === null ? "None: a subjective test" : levelText(L.sus, t);
    $("r-often").textContent = t.often;
    $("r-verdict").textContent = hideVerdict ? "?" : VERDICT[verdict].name;
    bar(t, L, v, hideVerdict);
    $("desc").textContent = `${t.name}: measured ${fmt(v, t)}. Remedial level ${levelText(L.rem, t).toLowerCase()}, suspension level ${L.sus === null ? "none" : levelText(L.sus, t).toLowerCase()}.${hideVerdict ? "" : ` ${VERDICT[verdict].name}.`}`;
    $("summary").textContent = hideVerdict ? "" : `${VERDICT[verdict].name}. ${VERDICT[verdict].text}` +
      (t.kv ? ` At ${kvSet} kVp the levels are ${L.rem} kV and ${L.sus} kV: ±5% and ±10%, or 5 and 10 kV, whichever is greater.` : "") +
      (L.sus === null ? " This test has no suspension level, because judging image quality is partly subjective." : "");
    return verdict;
  }

  function explore() {
    const t = TESTS[testIn.value], L = levels(t, kvSet);
    $("kv-box").hidden = !t.kv;
    root.querySelectorAll("[data-kv]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.kv === kvSet));
    vIn.max = t.max; vIn.step = t.step;
    $("v-o").textContent = fmt(+vIn.value, t);
    show(t, L, +vIn.value);
  }

  // Test me: a random test and result, kept clear of the exact levels so every answer is unambiguous.
  function newQuestion() {
    const ids = Object.keys(TESTS), id = ids[Math.floor(Math.random() * ids.length)], t = TESTS[id];
    const set = t.kv ? KV_SET[Math.floor(Math.random() * KV_SET.length)] : kvSet, L = levels(t, set);
    const bands = [[0, L.rem], [L.rem, L.sus ?? t.max], ...(L.sus !== null ? [[L.sus, t.max]] : [])];
    const [a, b] = bands[Math.floor(Math.random() * bands.length)], pad = (b - a) * 0.15;
    const v = Math.round((a + pad + Math.random() * (b - a - 2 * pad)) / t.step) * t.step;
    quiz = { t, L, v, set };
    asked++;
    $("q-n").textContent = `Result ${asked}`;
    $("q-score").textContent = `Score ${score} of ${asked - 1}`;
    $("q-text").innerHTML = `<b>${t.name}</b>${t.kv ? ` at ${set} kVp` : ""}: the ${t.what} is <b>${fmt(v, t)}</b>. What is the verdict?`;
    $("q-btns").hidden = false; $("q-fb").hidden = true; $("q-next").hidden = true;
    kvSet = set;
    show(t, L, v, true);
  }
  function answer(id) {
    const right = verdictOf(quiz.v, quiz.L);
    if (id === right) score++;
    $("q-btns").hidden = true;
    $("q-fb").innerHTML = `<p class="verdict ${id === right ? "good" : "bad"}">${id === right ? "Right" : "Not quite"}: ${VERDICT[right].name.toLowerCase()}</p>`;
    $("q-fb").hidden = false; $("q-next").hidden = false;
    $("q-score").textContent = `Score ${score} of ${asked}`;
    show(quiz.t, quiz.L, quiz.v);
  }

  function setMode(next) {
    mode = next;
    root.querySelectorAll("[data-mode]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === mode));
    $("explore").hidden = mode !== "explore";
    $("quiz").hidden = mode !== "quiz";
    if (mode === "quiz") { asked = 0; score = 0; newQuestion(); } else explore();
  }

  testIn.addEventListener("change", () => { vIn.value = 0; explore(); });
  vIn.addEventListener("input", explore);
  root.querySelectorAll("[data-kv]").forEach(b => b.addEventListener("click", () => { kvSet = +b.dataset.kv; explore(); }));
  root.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
  root.querySelectorAll("[data-answer]").forEach(b => b.addEventListener("click", () => answer(b.dataset.answer)));
  $("q-next").addEventListener("click", newQuestion);
  testIn.value = "light";
  explore();                 // sets the slider range for the test first
  vIn.value = 0.6;
  explore();
}
