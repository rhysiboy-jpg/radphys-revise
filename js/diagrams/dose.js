// Explorer: the dose ladder. Typical effective doses for common examinations, as time of natural background radiation and
// lifetime risk, with a plain-language explanation for a patient.
// Data: UKHSA, "Patient dose information: guidance" (updated 28 September 2026), the same table as the Dose lecture, slide 47.
// Background periods and risks are UKHSA's own figures, not recalculated here.
// It opens on "Guess first": students estimate six doses before they see the ladder, because surveys find dose estimation is
// students' weakest area and their confidence runs ahead of their knowledge. "Explore the ladder" shows every dose.

const BACKGROUND = 2.1;   // mSv a year, UK average (UKHSA; regional averages 1.5–7.5)

// risk: N in "1 in N"; "few" stands for "1 in a few million". lt: the dose is "less than" the value shown.
const XRAY = [
  ["Limbs and joints (except hip)", 0.01, "< 1.5 days", "few", true],
  ["Teeth (single bitewing)", 0.01, "< 1.5 days", "few", true],
  ["Teeth (panoramic)", 0.01, "1.5 days", 2e6],
  ["Chest (single PA)", 0.02, "3 days", 1e6],
  ["Skull", 0.07, "11 days", 3e5],
  ["Cervical spine (neck)", 0.08, "2 weeks", 2e5],
  ["Hip", 0.3, "7 weeks", 67000],
  ["Thoracic spine", 0.7, "4 months", 30000],
  ["Pelvis", 0.7, "4 months", 30000],
  ["Abdomen", 0.7, "4 months", 30000],
  ["Lumbar spine", 1.3, "7 months", 15000],
  ["Barium swallow", 1.5, "8 months", 13000],
  ["IVU (kidneys and bladder)", 2.5, "14 months", 8000],
  ["Barium meal", 3, "16 months", 6700],
  ["Barium follow-through", 3, "16 months", 6700],
  ["Barium enema", 7, "3.2 years", 3000],
  ["CT head", 2, "1 year", 10000],
  ["CT chest", 8, "3.6 years", 2500],
  ["CT abdomen and pelvis", 10, "4.5 years", 2000],
];
const NM = [
  ["Lung ventilation (Kr-81m)", 0.1, "2.4 weeks", 2e5],
  ["Lung perfusion (Tc-99m)", 1, "6 months", 20000],
  ["Kidney scan (Tc-99m)", 1, "6 months", 20000],
  ["Thyroid scan (Tc-99m)", 1, "6 months", 20000],
  ["Bone scan (Tc-99m)", 4, "2 years", 5000],
  ["Dynamic cardiac (Tc-99m)", 6, "2.7 years", 3300],
  ["Myocardial perfusion (Tl-201)", 18, "8 years", 1100],
];
// For comparison: a year of background, and the IRR17 annual dose limits.
const MARKS = [
  ["Public dose limit, a year (IRR17)", 1],
  ["UK natural background, a year", BACKGROUND],
  ["Employee dose limit, a year (IRR17)", 20],
];
const toRow = kind => ([name, mSv, period, risk, lt = false]) => ({ kind, name, mSv, period, risk, lt });
const SETS = {
  xray: { name: "X-ray and CT", rows: XRAY.map(toRow("exam")) },
  nm: { name: "Nuclear medicine", rows: NM.map(toRow("exam")) },
};
const AGES = {
  adult: { name: "Adult, 16 to 69", f: 1 },
  child: { name: "Child", f: 2 },
  older: { name: "70 and over", f: 1 / 5 },
};

// Bars on a log scale, from 0.003 to 30 mSv.
const LO = Math.log10(0.003), HI = Math.log10(30);
const pos = mSv => ((Math.log10(mSv) - LO) / (HI - LO)) * 100;

// Guess first: a spread of examinations from a few days of background to several years.
const GUESS = ["Chest (single PA)", "Hip", "Lumbar spine", "CT head", "Barium enema", "CT abdomen and pelvis"];
const GUESS_START = 420;   // where the slider rests: about 0.1 mSv, which is none of the six answers
const fromSlider = v => 10 ** (LO + (v / 1000) * (HI - LO));
const fmtDose = m => `${m >= 1 ? +m.toPrecision(2) : +m.toPrecision(1)} mSv`;
// Natural background time for a dose, in rough words (for the student's own estimate; the answers use UKHSA's wording).
function bgWords(mSv) {
  const days = (mSv / BACKGROUND) * 365;
  if (days < 1.5) return "about a day";
  if (days < 14) return `about ${Math.round(days)} days`;
  if (days < 61) return `about ${Math.round(days / 7)} weeks`;
  if (days < 548) return `about ${Math.round(days / 30.4)} months`;
  return `about ${+(days / 365).toFixed(days < 3650 ? 1 : 0)} years`;
}

const sig2 = n => { const p = 10 ** (Math.floor(Math.log10(n)) - 1); return Math.round(n / p) * p; };
function riskText(risk, f) {
  if (risk === "few") return f > 1 ? "about 1 in a million" : f < 1 ? "less than 1 in 10 million" : "1 in a few million";
  const n = sig2(risk / f);
  const words = n === 1e6 ? "a million" : n >= 1e6 ? `${+(n / 1e6).toFixed(1)} million` : n.toLocaleString("en-GB");
  return `${f === 1 ? "" : "about "}1 in ${words}`;
}

const MARKUP = `
<div class="grid">
  <div class="stage">
    <div class="modes" role="group" aria-label="Mode">
      <button type="button" data-mode="guess">Guess first</button>
      <button type="button" data-mode="explore">Explore the ladder</button>
    </div>
    <div data-role="guess-view" class="dose-guess">
      <p class="eyebrow" data-role="g-n"></p>
      <h3 data-role="g-exam"></h3>
      <p>What is its typical effective dose for an adult? Slide to your estimate, then check.</p>
      <div class="slider">
        <div class="slider-top"><label for="dose-guess">Your estimate</label><output for="dose-guess" data-role="g-o"></output></div>
        <input type="range" id="dose-guess" min="0" max="1000" step="1" data-answer>
        <small data-role="g-bg"></small>
      </div>
      <div class="controls">
        <button type="button" class="primary" data-role="g-check">Check</button>
        <button type="button" class="primary" data-role="g-next" hidden>Next examination</button>
      </div>
      <div class="feedback" data-role="g-fb" aria-live="polite" hidden></div>
    </div>
    <div data-role="ladder-view" hidden>
      <div class="modes" role="group" aria-label="Examinations">
        ${Object.entries(SETS).map(([id, s]) => `<button type="button" data-set="${id}">${s.name}</button>`).join("")}
      </div>
      <div class="ladder-scale" aria-hidden="true">${[0.01, 0.1, 1, 10].map(v => `<span style="left:${pos(v)}%">${v} mSv</span>`).join("")}</div>
      <ol class="ladder" data-role="ladder"></ol>
      <p class="scale-note">Typical effective doses for an average adult (UKHSA). Bars on a log scale: each step is ten times the dose. Dashed rows are for comparison.</p>
    </div>
  </div>
  <div class="panel">
    <div class="part-card" data-role="g-results">
      <p class="eyebrow">Your estimates</p>
      <p>To help: natural background in the UK is ${BACKGROUND} mSv a year, and the public dose limit is 1 mSv a year.</p>
      <ol class="guess-log" data-role="g-log"></ol>
      <p data-role="g-sum" aria-live="polite"></p>
    </div>
    <div class="part-card" data-role="card" aria-live="polite"></div>
    <div class="sliders" data-role="age-row">
      <div class="slider">
        <div class="slider-top"><label for="dose-age">Patient's age</label></div>
        <select id="dose-age" class="select">${Object.entries(AGES).map(([id, a]) => `<option value="${id}">${a.name}</option>`).join("")}</select>
        <small>Risk is about twice as high for children and about five times lower over 70 (UKHSA).</small>
      </div>
    </div>
    <div class="try guide" data-role="explain">
      <h3>Explaining dose to a patient</h3>
      <ol>
        <li><b>Compare with background.</b> Everyone receives natural radiation from the ground, the air and space: ${BACKGROUND} mSv a year on average in the UK.</li>
        <li><b>Give the risk honestly, in proportion.</b> Most plain films add a very small risk; CT and fluoroscopy add more.</li>
        <li><b>Say why it is worth it.</b> The examination has been justified: the benefit of the answer outweighs the risk (IR(ME)R).</li>
        <li><b>Say how you keep it low.</b> Collimation, the right exposure first time, and no repeats that are not needed (ALARP).</li>
      </ol>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const ageIn = root.querySelector("#dose-age"), list = $("ladder");
  let set = "xray", selected = null;

  function rows() {
    return [...SETS[set].rows, ...MARKS.map(([name, mSv]) => ({ kind: "mark", name, mSv }))].sort((a, b) => a.mSv - b.mSv || (a.kind === "mark") - (b.kind === "mark"));
  }

  function draw() {
    root.querySelectorAll("[data-set]").forEach(b => b.setAttribute("aria-pressed", b.dataset.set === set));
    list.innerHTML = "";
    rows().forEach(r => {
      const li = document.createElement("li");
      const value = `${r.lt ? "< " : ""}${r.mSv} mSv`;
      if (r.kind === "mark") {
        li.className = "rung mark";
        li.innerHTML = `<span class="rung-name">${r.name}</span><span class="rung-bar"><i style="width:${pos(r.mSv)}%"></i></span><span class="rung-v">${value}</span>`;
      } else {
        li.className = "rung";
        li.innerHTML = `<button type="button" aria-pressed="${r === selected}"><span class="rung-name">${r.name}</span><span class="rung-bar"><i style="width:${pos(r.lt ? r.mSv * 0.6 : r.mSv)}%"${r.lt ? ' class="lt"' : ""}></i></span><span class="rung-v">${value}<small>${r.period}</small></span></button>`;
        const btn = li.querySelector("button");
        btn.addEventListener("click", () => {
          selected = r;
          list.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === btn));
          card();
          reveal();
        });
      }
      list.appendChild(li);
    });
  }

  function card() {
    const c = $("card");
    if (!selected) {
      c.innerHTML = `<p class="eyebrow">Explain it</p><h3>Choose an examination</h3><p>Tap any row to see its dose, the matching time of natural background radiation, the risk, and a way of putting it to a patient.</p>`;
      return;
    }
    const r = selected, age = AGES[ageIn.value], risk = riskText(r.risk, age.f);
    const who = ageIn.value === "adult" ? "" : ` for ${ageIn.value === "child" ? "a child" : "a patient over 70"}`;
    c.innerHTML = `<p class="eyebrow">Explain it</p><h3>${r.name}</h3>
      <dl class="facts">
        <div><dt>Typical effective dose</dt><dd>${r.lt ? "less than " : ""}${r.mSv} mSv</dd></div>
        <div><dt>Natural background</dt><dd>${r.period}</dd></div>
        <div><dt>Extra lifetime risk of fatal cancer${who}</dt><dd>${risk}</dd></div>
      </dl>
      <p class="tip"><b>To the patient:</b> "This gives about the same radiation as ${r.period.replace("< ", "less than ")} of the natural background we all live with. It adds an extra lifetime risk of fatal cancer of around ${risk.replace(/^about /, "")}. The information it gives your doctor outweighs that risk."</p>`;
  }

  // On a phone the card sits below the whole ladder, so bring it into view after a tap.
  function reveal() {
    const c = $("card"), r = c.getBoundingClientRect();
    if (r.top < 0 || r.top > innerHeight - 120) requestAnimationFrame(() => c.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));   // after the new card has laid out
  }

  // Guess first
  const gIn = root.querySelector("#dose-guess");
  let order = [], round = 0, results = [], mode = "guess", moved = false;
  function startGuess() {
    order = GUESS.map(n => SETS.xray.rows.find(x => x.name === n)).sort(() => Math.random() - 0.5);
    round = 0; results = [];
    $("g-log").innerHTML = "";
    $("g-sum").textContent = "";
    showRound();
  }
  function showRound() {
    const e = order[round];
    $("g-n").textContent = `Examination ${round + 1} of ${order.length}`;
    $("g-exam").textContent = e.name;
    // Nothing counts as an estimate until the student moves the slider, so leaving it alone can't score.
    gIn.value = GUESS_START; gIn.disabled = false; moved = false;
    showGuess();
    $("g-check").hidden = false;
    $("g-check").disabled = true;
    $("g-next").hidden = true;
    $("g-fb").hidden = true;
  }
  function showGuess() {
    if (!moved) { $("g-o").textContent = "–"; $("g-bg").textContent = "Move the slider to make your estimate."; return; }
    const m = fromSlider(+gIn.value);
    $("g-o").textContent = fmtDose(m);
    $("g-bg").textContent = `That would be ${bgWords(m)} of natural background.`;
  }
  function check() {
    const e = order[round], guess = fromSlider(+gIn.value), ratio = guess / e.mSv, off = Math.max(ratio, 1 / ratio);
    const how = off <= 2 ? ["good", "Close"] : off <= 5 ? ["self", "In the right range"] : ["bad", "Some way off"];
    const dir = off <= 1.15 ? "spot on" : `${off >= 10 ? sig2(off).toLocaleString("en-GB") : +off.toFixed(1)} times too ${ratio > 1 ? "high" : "low"}`;
    results.push({ off, high: ratio > 1 });
    gIn.disabled = true;
    $("g-check").hidden = true;
    const last = round === order.length - 1;
    $("g-next").textContent = last ? "Play again" : "Next examination";
    $("g-next").hidden = false;
    $("g-fb").innerHTML = `<p class="verdict ${how[0]}">${how[1]}</p><div class="why"><p>Typical dose: <b>${e.mSv} mSv</b>, about ${e.period} of natural background, with an extra lifetime risk of fatal cancer of ${riskText(e.risk, 1)} (UKHSA). Your estimate, ${fmtDose(guess)}, was ${dir}.</p></div>`;
    $("g-fb").hidden = false;
    const li = document.createElement("li");
    li.innerHTML = `<span>${e.name}</span><span>you ${fmtDose(guess)} · actual ${e.mSv} mSv</span>`;
    $("g-log").appendChild(li);
    $("g-next").focus();
    if (last) {
      const close = results.filter(x => x.off <= 2).length, low = results.filter(x => x.off > 2 && !x.high).length, high = results.filter(x => x.off > 2 && x.high).length;
      $("g-sum").innerHTML = `<b>${close} of ${results.length}</b> within a factor of 2.` +
        (low > high ? " You tended to <b>underestimate</b>, as most people do, especially for CT." : high > low ? " You tended to <b>overestimate</b>: plain films give less than many people think." : "") +
        " Now choose <b>Explore the ladder</b> to see every examination.";
    }
  }
  function setMode(m) {
    mode = m;
    root.querySelectorAll("[data-mode]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === mode));
    const guessing = mode === "guess";
    $("guess-view").hidden = !guessing;
    $("g-results").hidden = !guessing;
    $("ladder-view").hidden = guessing;
    ["card", "age-row", "explain"].forEach(k => { $(k).hidden = guessing; });
    if (guessing && !order.length) startGuess();
  }
  gIn.addEventListener("input", () => { moved = true; $("g-check").disabled = false; showGuess(); });
  $("g-check").addEventListener("click", check);
  $("g-next").addEventListener("click", () => { if (round === order.length - 1) startGuess(); else { round++; showRound(); } gIn.focus(); });
  root.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));

  root.querySelectorAll("[data-set]").forEach(b => b.addEventListener("click", () => { set = b.dataset.set; selected = null; draw(); card(); }));
  ageIn.addEventListener("change", card);
  draw();
  card();
  setMode(mode);
}
