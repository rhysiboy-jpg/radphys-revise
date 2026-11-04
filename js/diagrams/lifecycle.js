// Stepper: the life of an X-ray system, followed through its tube output. Acceptance testing checks the specification and safety;
// commissioning records the baseline; routine tests compare later results with it. A slow drift crosses the remedial level
// (act, but it may stay in use under a risk assessment); a sudden fault crosses the suspension level (remove from use at once).
// After repair it is retested. Levels for output consistency follow the QA lecture (IPEM Report 91): remedial ±20%, suspension ±50%.
// The results themselves are illustrative.
import { svgEl as el } from "./util.js";

const REM = 20, SUS = 50, TMAX = 24;
const STORIES = {
  drift: { name: "Gradual drift", steps: [
    { t: 0, v: null, title: "Installed", text: "A new X-ray room is installed. It can't be used on patients until it has been tested." },
    { t: 0, v: 3, kind: "acc", title: "Acceptance test", text: "Does it meet the <b>purchase specification</b>, and is it <b>safe</b>? Yes: it can be handed over." },
    { t: 0.5, v: 0, kind: "base", title: "Commissioning", text: "Its performance is measured while it works well, and recorded as the <b>baseline</b>. Every later result is compared with this." },
    { t: 4, v: -3, title: "Routine test", text: "Output is within 3% of baseline: no action. The result is <b>recorded</b>." },
    { t: 8, v: -8, title: "Routine test", text: "Output has fallen 8% from baseline. Still within tolerance, but the trend is worth watching." },
    { t: 12, v: -14, title: "Routine test", text: "Down 14%: a <b>gradual deterioration</b>, which is exactly what routine testing exists to catch." },
    { t: 16, v: -23, kind: "rem", title: "Remedial level crossed", text: "Down 23%: beyond the <b>remedial level</b>. Action is needed, but after a <b>risk assessment</b> the room may stay in use while a repair is arranged." },
    { t: 17, v: null, kind: "fix", title: "Repair", text: "The engineer replaces the faulty part." },
    { t: 17.5, v: -1, kind: "base", title: "Retest after repair", text: "A test after the repair confirms the fault has been put right: back within 1% of baseline. Recorded." },
    { t: 22, v: -2, title: "Routine test", text: "Routine testing carries on, compared with the baseline." },
  ] },
  fault: { name: "Sudden fault", steps: [
    { t: 0, v: 2, kind: "acc", title: "Acceptance test", text: "The new room meets its specification and is safe." },
    { t: 0.5, v: 0, kind: "base", title: "Commissioning", text: "The <b>baseline</b> is recorded." },
    { t: 4, v: 2, title: "Routine test", text: "Within tolerance. Recorded." },
    { t: 8, v: -1, title: "Routine test", text: "Within tolerance. Recorded." },
    { t: 10, v: -55, kind: "sus", title: "Suspension level crossed", text: "Output has fallen 55%: beyond the <b>suspension level</b>. The room is <b>removed from clinical use immediately</b>: images would be inadequate or doses wrong." },
    { t: 11, v: null, kind: "fix", title: "Repair", text: "The fault is found and repaired." },
    { t: 11.5, v: 1, kind: "base", title: "Retest after repair", text: "Retested before it goes back into use: within 1% of baseline. Recorded, and the room returns to clinical use." },
    { t: 16, v: 0, title: "Routine test", text: "Routine testing carries on." },
  ] },
};
const GX0 = 70, GX1 = 620, GY0 = 24, GY1 = 280, VMIN = -65, VMAX = 30;
const gx = t => GX0 + (t / TMAX) * (GX1 - GX0), gy = v => GY0 + ((VMAX - v) / (VMAX - VMIN)) * (GY1 - GY0);

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 640 330" role="img" aria-labelledby="lc-t lc-d">
      <title id="lc-t">Tube output test results over two years, against the remedial and suspension levels</title>
      <desc id="lc-d" data-role="desc"></desc>
      <rect class="lc-sus" x="${GX0}" y="${gy(-SUS)}" width="${GX1 - GX0}" height="${GY1 - gy(-SUS)}"/>
      <rect class="lc-rem" x="${GX0}" y="${gy(-REM)}" width="${GX1 - GX0}" height="${gy(-SUS) - gy(-REM)}"/>
      <rect class="lc-rem" x="${GX0}" y="${GY0}" width="${GX1 - GX0}" height="${gy(REM) - GY0}"/>
      <text class="plane-t" x="${GX0 + 6}" y="${gy(-REM) + 14}">remedial level (−${REM}%)</text>
      <text class="plane-t" x="${GX0 + 6}" y="${gy(-SUS) + 14}">suspension level (−${SUS}%)</text>
      <line class="lc-base" x1="${GX0}" y1="${gy(0)}" x2="${GX1}" y2="${gy(0)}"/>
      <text class="plane-t" x="${GX1 - 4}" y="${gy(0) - 6}" text-anchor="end">baseline</text>
      <g class="axis">
        <line x1="${GX0}" y1="${GY1}" x2="${GX1}" y2="${GY1}"/><line x1="${GX0}" y1="${GY0}" x2="${GX0}" y2="${GY1}"/>
        ${[0, 6, 12, 18, 24].map(t => `<text x="${gx(t)}" y="${GY1 + 16}" text-anchor="middle">${t}</text>`).join("")}
        ${[20, 0, -20, -50].map(v => `<text x="${GX0 - 6}" y="${gy(v) + 4}" text-anchor="end">${v > 0 ? "+" : ""}${v}%</text>`).join("")}
        <text class="ax-title" x="${(GX0 + GX1) / 2}" y="${GY1 + 38}" text-anchor="middle">Months since installation</text>
      </g>
      <path class="lc-line" data-role="line"/>
      <g data-role="pts"></g>
    </svg>
    <p class="scale-note">Tube output consistency, change from baseline · levels from the QA lecture (IPEM Report 91) · illustrative results</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider"><div class="slider-top"><span class="label">Story</span></div>
        <div class="modes" role="group" aria-label="Story">${Object.entries(STORIES).map(([id, s]) => `<button type="button" data-story="${id}">${s.name}</button>`).join("")}</div></div>
    </div>
    <div class="part-card" aria-live="polite"><p class="eyebrow" data-role="step-n"></p><h3 data-role="step-t"></h3><p data-role="step-x"></p></div>
    <div class="controls stepper"><button type="button" data-role="back">Back</button><button type="button" class="primary" data-role="next">Next</button></div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  let story = "drift", i = 0;
  function update() {
    const S = STORIES[story].steps, cur = S[i];
    root.querySelectorAll("[data-story]").forEach(b => b.setAttribute("aria-pressed", b.dataset.story === story));
    const shown = S.slice(0, i + 1).filter(s => s.v !== null);
    $("line").setAttribute("d", shown.map((s, k) => `${k ? "L" : "M"}${gx(s.t).toFixed(1)} ${gy(s.v).toFixed(1)}`).join(" "));
    const g = $("pts"); g.innerHTML = "";
    shown.forEach(s => el("circle", { class: `lc-pt ${s.kind || ""}${s === cur ? " now" : ""}`, cx: gx(s.t), cy: gy(s.v), r: s === cur ? 7 : 5 }, g));
    if (cur.kind === "fix") el("text", { class: "lc-fix", x: gx(cur.t), y: GY0 + 16 }, g).textContent = "repair";
    $("step-n").textContent = `Step ${i + 1} of ${S.length}${cur.v !== null ? ` · month ${cur.t} · ${cur.v > 0 ? "+" : cur.v < 0 ? "−" : ""}${Math.abs(cur.v)}% from baseline` : ` · month ${cur.t}`}`;
    $("step-t").textContent = cur.title;
    $("step-x").innerHTML = cur.text;
    $("back").disabled = i === 0;
    $("next").textContent = i === S.length - 1 ? "Start again" : "Next";
    $("desc").textContent = `Graph of tube output against time. ${cur.title}: ${cur.text.replace(/<[^>]+>/g, "")}`;
  }
  root.querySelectorAll("[data-story]").forEach(b => b.addEventListener("click", () => { story = b.dataset.story; i = 0; update(); }));
  $("next").addEventListener("click", () => { i = i === STORIES[story].steps.length - 1 ? 0 : i + 1; update(); });
  $("back").addEventListener("click", () => { i = Math.max(0, i - 1); update(); });
  update();
}
