// Explorer: one in a million (lecture: Cellular Effects of Radiation, slides 11–12). A grid of people, each given the same dose;
// the expected number of radiation-induced fatal cancers light up at random, and a fresh run lights up different people.
// Risk: about 5% per Sv (1 in 20,000 per mSv), the basis of UKHSA's patient risk figures (a chest X-ray is about 1 in a million).
// The lecture's leukaemia example (risk factor 2 × 10⁻³ per Sv) is offered as its own preset. The optional background
// shows that about 1 in 4 deaths in the UK are from cancer anyway (Cancer Research UK).
// Guess first (on by default): after the opening run, each new dose or group asks how many cases to expect before showing
// them, so students commit to an estimate. The bands are powers of ten, because the point is the order of magnitude.
import { token } from "./util.js";

const RISK_PER_MSV = 0.05 / 1000;
const BACKGROUND = 2.1;      // mSv a year, UK average natural background (as in the dose ladder)
const CXR = 0.02;            // mSv, chest PA (UKHSA)
const POPS = [1000, 10000, 100000, 1000000];
const DOSES = [
  { id: "cxr", name: "One chest X-ray", phrase: "one chest X-ray", mSv: 0.02 },
  { id: "bg", name: "A year of natural background", phrase: "a year of natural background", mSv: 2.1 },
  { id: "ct", name: "CT abdomen and pelvis", phrase: "a CT abdomen and pelvis", mSv: 10 },
  { id: "limit", name: "A year at the employee dose limit", phrase: "a year at the employee dose limit", mSv: 20 },
  { id: "lecture", name: "Lecture example: leukaemia at 20 mSv", phrase: "20 mSv (the lecture's leukaemia example)", mSv: 20, risk: 2e-3 / 1000, pop: 1000000 },
];
const BANDS = [
  { id: 0, text: "Less than 1", test: e => e < 1 },
  { id: 1, text: "1 to 9", test: e => e >= 1 && e < 10 },
  { id: 2, text: "10 to 99", test: e => e >= 10 && e < 100 },
  { id: 3, text: "100 to 999", test: e => e >= 100 && e < 1000 },
  { id: 4, text: "1,000 or more", test: e => e >= 1000 },
];
const SIZE = 1000;   // the canvas is drawn at 1000 × 1000 and scaled to fit

const fmtN = n => n.toLocaleString("en-GB");
const oneIn = p => { const n = 1 / p, mag = 10 ** Math.floor(Math.log10(n)); return `1 in ${fmtN(Math.round(n / mag) * mag)}`; };
// A Poisson draw: how many cases this run, when the expected number is m.
function poisson(m) {
  if (m > 50) return Math.max(0, Math.round(m + Math.sqrt(m) * Math.sqrt(-2 * Math.log(Math.random() + 1e-12)) * Math.cos(2 * Math.PI * Math.random())));
  let k = 0, p = Math.exp(-m), s = p;
  const u = Math.random();
  while (u > s && k < 1000) { k++; p *= m / k; s += p; }
  return k;
}

const MARKUP = `
<div class="grid">
  <div class="stage">
    <canvas class="pop-canvas" width="${SIZE}" height="${SIZE}" role="img" data-role="canvas"></canvas>
    <div class="legend"><span><i class="pop-key"></i>a person</span><span><i class="pop-key case"></i>radiation-induced fatal cancer</span><span data-role="legend-bg" hidden><i class="pop-key bg"></i>dies of cancer anyway</span></div>
    <p class="scale-note">Each dot is one person. Risk figures assume risk in proportion to dose, however small (the linear no-threshold model): they are for planning protection, not a prediction for any one person.</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><span class="label">Each person receives</span></div>
        <div class="modes" role="group" aria-label="Each person receives">${DOSES.map(d => `<button type="button" data-dose="${d.id}">${d.name}</button>`).join("")}</div>
      </div>
      <div class="slider" data-role="pop-row">
        <div class="slider-top"><span class="label">People</span></div>
        <div class="modes" role="group" aria-label="People">${POPS.map(p => `<button type="button" data-pop="${p}">${fmtN(p)}</button>`).join("")}</div>
      </div>
      <label class="check-row"><input type="checkbox" data-role="guess-on" checked> Guess before each result</label>
      <label class="check-row"><input type="checkbox" data-role="bg"> Show deaths from cancer that would happen anyway</label>
      <div class="controls"><button type="button" class="primary" data-role="again">Run again</button></div>
    </div>
    <fieldset class="pop-guess" data-role="guess" hidden>
      <legend data-role="guess-q"></legend>
      <div class="controls">${BANDS.map(b => `<button type="button" data-band="${b.id}">${b.text}</button>`).join("")}</div>
    </fieldset>
    <div class="feedback" data-role="guess-fb" aria-live="polite" hidden></div>
    <div class="readouts">
      <div class="readout"><span>Risk to each person</span><b data-role="r-risk"></b><span data-role="r-risk-s"></span></div>
      <div class="readout"><span>Expected cases</span><b data-role="r-exp"></b><span data-role="r-exp-s"></span></div>
      <div class="readout"><span>This run</span><b data-role="r-run"></b><span>different people each time</span></div>
      <div class="readout"><span>The same dose as</span><b data-role="r-eq"></b><span data-role="r-eq-s"></span></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const canvas = $("canvas"), ctx = canvas.getContext("2d");
  let dose = DOSES[0], pop = 1000000, cases = 0;   // opens on one chest X-ray each: about one case in a million
  let waiting = false;                             // a guess is due before this result shows
  const css = name => token(root, name);

  function draw() {
    const cols = Math.ceil(Math.sqrt(pop)), rows = Math.ceil(pop / cols), cell = SIZE / cols;
    const ink = css("--muted"), hit = css("--photon"), sheet = css("--surface"), bgCol = css("--line");
    ctx.fillStyle = sheet; ctx.fillRect(0, 0, SIZE, SIZE);
    const showBg = $("bg").checked;
    // Everyone: dots for small groups, a fine texture for large ones.
    if (cell >= 4) {
      for (let i = 0; i < pop; i++) {
        const x = (i % cols + 0.5) * cell, y = (Math.floor(i / cols) + 0.5) * cell;
        ctx.fillStyle = showBg && (i * 2654435761 % 4294967296) / 4294967296 < 0.25 ? bgCol : ink;
        ctx.beginPath(); ctx.arc(x, y, cell * 0.32, 0, 2 * Math.PI); ctx.fill();
      }
    } else {
      ctx.globalAlpha = 0.55; ctx.fillStyle = ink; ctx.fillRect(0, 0, SIZE, (rows / Math.ceil(SIZE / cell)) * SIZE); ctx.globalAlpha = 1;
      if (showBg) {   // a quarter of the people, as a lighter speckle
        ctx.fillStyle = bgCol;
        for (let i = 0; i < Math.min(pop, 250000) / 4; i++) ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 2, 2);
      }
    }
    if (waiting) return;
    // The cases, drawn large enough to find even among a million.
    ctx.fillStyle = hit; ctx.strokeStyle = sheet; ctx.lineWidth = 3;
    const r = Math.max(cell * 0.45, cases <= 20 ? 22 : cases <= 200 ? 10 : 5);   // a lone case is easy to find, even on a phone; hundreds stay apart
    for (let k = 0; k < cases; k++) {
      const i = Math.floor(Math.random() * pop), x = (i % cols + 0.5) * cell, y = (Math.floor(i / cols) + 0.5) * cell;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    }
  }

  function update(rerun = true) {
    const risk = (dose.risk ?? RISK_PER_MSV) * dose.mSv, expected = risk * pop;
    if (rerun) cases = poisson(expected);
    $("guess").hidden = !waiting;
    $("again").disabled = waiting;
    root.querySelectorAll("[data-dose]").forEach(b => b.setAttribute("aria-pressed", b.dataset.dose === dose.id));
    root.querySelectorAll("[data-pop]").forEach(b => { b.setAttribute("aria-pressed", +b.dataset.pop === pop); b.disabled = !!dose.pop; });
    $("legend-bg").hidden = !$("bg").checked;
    $("r-risk").textContent = oneIn(risk);
    $("r-risk-s").textContent = dose.risk ? "of radiation-induced leukaemia (lecture's risk factor)" : "of a fatal cancer (about 5% per Sv)";
    $("r-exp").textContent = expected >= 10 ? fmtN(Math.round(expected)) : expected >= 0.1 ? String(+expected.toFixed(1)) : `${+expected.toPrecision(1)}`;
    $("r-exp-s").textContent = `among ${fmtN(pop)} people`;
    $("r-run").textContent = fmtN(cases);
    const cxr = dose.mSv / CXR, days = (dose.mSv / BACKGROUND) * 365;
    $("r-eq").textContent = dose.id === "cxr" ? `${Math.round(days)} days` : `${fmtN(Math.round(cxr))} chest X-rays`;
    $("r-eq-s").textContent = dose.id === "cxr" ? "of natural background" : `or ${days >= 730 ? `${+(days / 365).toFixed(1)} years` : `${Math.round(days)} days`} of natural background`;
    const anyway = Math.round(pop / 4);
    $("summary").innerHTML = (dose.risk
      ? `Slide 12's example: a million people each receiving the employee annual limit (20 mSv), with a leukaemia risk factor of 2 × 10<sup>−3</sup> per Sv, gives about <b>40</b> cases, 1 in 25,000. That is about 1,000 chest X-rays each (the slide says 400, using an older chest dose).`
      : expected < 1
        ? `On average <b>fewer than one</b> of these ${fmtN(pop)} people would develop a fatal cancer from this dose. Run it again: sometimes nobody, occasionally one. Nobody can say in advance who.`
        : `On average about <b>${$("r-exp").textContent}</b> of these ${fmtN(pop)} people would develop a fatal cancer from this dose, but nobody can say in advance who. That is what makes the effect stochastic.`)
      + ($("bg").checked ? ` For comparison, about <b>${fmtN(anyway)}</b> of them would die of cancer anyway (about 1 in 4 UK deaths, Cancer Research UK).` : "");
    canvas.setAttribute("aria-label", `${fmtN(pop)} people, each receiving ${dose.phrase} (${dose.mSv} mSv). ${fmtN(cases)} highlighted as radiation-induced cases this run; about ${$("r-exp").textContent} expected.`);
    if (waiting) {
      // Hide everything that gives the answer away; the dose comparison stays, as a clue.
      ["r-risk", "r-exp", "r-run"].forEach(k => { $(k).textContent = "?"; });
      $("guess-q").textContent = `Guess first: among ${fmtN(pop)} people each receiving ${dose.phrase}, how many radiation-induced cases would you expect?`;
      $("summary").textContent = "Make a guess to see the result.";
      canvas.setAttribute("aria-label", `${fmtN(pop)} people, each receiving ${dose.phrase} (${dose.mSv} mSv). Make a guess to see the cases.`);
    }
    draw();
  }
  // A new dose or group: ask for a guess first, if that's switched on.
  function choose() {
    waiting = $("guess-on").checked && !root.hasAttribute("data-setting-up");   // a copied link opens on its result
    $("guess-fb").hidden = true;
    update();
    // On a phone the question sits below the controls, out of sight: bring it into view.
    if (waiting) requestAnimationFrame(() => { const g = $("guess"), r = g.getBoundingClientRect(); if (r.bottom > innerHeight || r.top < 0) g.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" }); });
  }
  function guess(id) {
    const expected = (dose.risk ?? RISK_PER_MSV) * dose.mSv * pop, truth = BANDS.find(b => b.test(expected)), right = truth.id === id;
    const exp = expected >= 10 ? fmtN(Math.round(expected)) : +expected.toPrecision(1);
    const far = Math.abs(truth.id - id);
    $("guess-fb").innerHTML = `<p class="verdict ${right ? "good" : "bad"}">${right ? "Right" : far === 1 ? "Close: one step out" : `${far} steps out: ${["", "", "a hundred", "a thousand", "ten thousand"][far]} times ${id > truth.id ? "too many" : "too few"}`}</p><div class="why"><p>Expected: <b>${exp}</b> (${truth.text.toLowerCase()}). The risk to each person times the number of people: ${oneIn((dose.risk ?? RISK_PER_MSV) * dose.mSv)} × ${fmtN(pop)}.</p></div>`;
    $("guess-fb").hidden = false;
    waiting = false;
    update(false);
  }

  root.querySelectorAll("[data-dose]").forEach(b => b.addEventListener("click", () => {
    dose = DOSES.find(d => d.id === b.dataset.dose);
    if (dose.pop) pop = dose.pop;
    choose();
  }));
  root.querySelectorAll("[data-pop]").forEach(b => b.addEventListener("click", () => { pop = +b.dataset.pop; choose(); }));
  root.querySelectorAll("[data-band]").forEach(b => b.addEventListener("click", () => guess(+b.dataset.band)));
  $("guess-on").addEventListener("change", () => { if (!$("guess-on").checked && waiting) { waiting = false; update(false); } });
  $("bg").addEventListener("change", () => update(false));
  $("again").addEventListener("click", () => { if (!waiting) update(); });
  // Redraw when the theme changes, so the dots take the new colours.
  const mo = new MutationObserver(() => draw());
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  update();
  return () => mo.disconnect();
}
