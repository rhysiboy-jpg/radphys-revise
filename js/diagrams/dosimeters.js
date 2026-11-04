// Explorer: personal dosimeters. A film badge: radiation darkens the film behind each filter by a different amount, and the pattern
// shows the type and energy of the radiation. A TLD: radiation traps electrons in the crystal; heating releases them as light (the
// glow curve), and the total light is proportional to the dose. Reading the TLD empties the traps, so it can be reused.
// Darkening values and the glow curve are illustrative; the peak near 200 °C is typical of lithium fluoride.
import { svgEl as el, tween, reducedMotion } from "./util.js";

const FILTERS = ["Open window", "Thin plastic", "Thick plastic", "Aluminium", "Tin + lead", "Cadmium + lead"];
const SHORT = ["Open", "Thin", "Thick", "Al", "Sn+Pb", "Cd+Pb"];
const RADS = {
  lowx: { name: "Low-energy X-rays", d: [0.9, 0.88, 0.8, 0.45, 0.08, 0.08],
    text: "Strong darkening under the open window and plastics, much less under aluminium and almost none under the metal filters: low-energy photons are easily absorbed." },
  highx: { name: "High-energy gamma rays", d: [0.6, 0.6, 0.6, 0.58, 0.52, 0.52],
    text: "Nearly the same darkening under every filter: high-energy photons pass through all of them." },
  beta: { name: "Beta particles", d: [0.9, 0.5, 0.08, 0.02, 0, 0],
    text: "Darkening under the open window and thin plastic only: beta particles are stopped by thick plastic and metal." },
};
const DOSES = [0.5, 1, 2];
const TMAX = 300, GX0 = 340, GX1 = 620, GY0 = 40, GY1 = 250;
const glow = T => Math.exp(-(((T - 210) / 22) ** 2)) + 0.25 * Math.exp(-(((T - 150) / 14) ** 2));   // main peak and a smaller, earlier one
const AREA = (() => { let a = 0; for (let T = 0; T <= TMAX; T++) a += glow(T); return a; })();

const MARKUP = `
<div class="modes dm-tabs" role="group" aria-label="Dosimeter"><button type="button" data-tab="film">Film badge</button><button type="button" data-tab="tld">TLD</button></div>
<div class="grid" data-pane="film">
  <div class="stage">
    <svg viewBox="0 0 640 300" role="img" aria-labelledby="fb-t fb-d">
      <title id="fb-t">A film badge: the film behind six filters</title>
      <desc id="fb-d" data-role="fb-desc"></desc>
      <rect class="dm-holder" x="40" y="30" width="560" height="220" rx="16"/>
      <g data-role="windows"></g>
    </svg>
    <p class="scale-note">Schematic · the film is shown developed: darker means more radiation reached it · illustrative darkening</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider"><div class="slider-top"><span class="label">Radiation</span></div>
        <div class="modes" role="group" aria-label="Radiation">${Object.entries(RADS).map(([id, r]) => `<button type="button" data-rad="${id}">${r.name}</button>`).join("")}</div></div>
      <div class="slider"><div class="slider-top"><label for="fb-dose">Dose</label><output for="fb-dose" data-role="fd-o"></output></div>
        <input type="range" id="fb-dose" min="0" max="2" step="1" value="1"></div>
    </div>
    <p class="summary" data-role="fb-sum" aria-live="polite"></p>
  </div>
</div>
<div class="grid" data-pane="tld" hidden>
  <div class="stage">
    <svg viewBox="0 0 640 300" role="img" aria-labelledby="tl-t tl-d">
      <title id="tl-t">A TLD crystal being heated, and its glow curve</title>
      <desc id="tl-d" data-role="tl-desc"></desc>
      <rect class="dm-heater" x="60" y="190" width="200" height="22" rx="4"/>
      <rect class="dm-chip" data-role="chip" x="110" y="150" width="100" height="40" rx="6"/>
      <g data-role="traps"></g>
      <g data-role="light"></g>
      <text class="plane-t" x="160" y="236" text-anchor="middle" data-role="temp-t"></text>
      <g class="axis"><line x1="${GX0}" y1="${GY1}" x2="${GX1}" y2="${GY1}"/><line x1="${GX0}" y1="${GY0}" x2="${GX0}" y2="${GY1}"/>
        ${[0, 100, 200, 300].map(T => `<text x="${GX0 + (T / TMAX) * (GX1 - GX0)}" y="${GY1 + 18}" text-anchor="middle">${T}</text>`).join("")}
        <text class="ax-title" x="${(GX0 + GX1) / 2}" y="${GY1 + 40}" text-anchor="middle">Temperature (°C)</text>
        <text class="ax-title" x="${GX0 - 14}" y="${(GY0 + GY1) / 2}" text-anchor="middle" transform="rotate(-90 ${GX0 - 14} ${(GY0 + GY1) / 2})">Light</text></g>
      <path class="dm-glow-fill" data-role="fill"/>
      <path class="dm-glow" data-role="curve"/>
    </svg>
    <p class="scale-note">Schematic · lithium fluoride crystal · dots: electrons held in traps · illustrative glow curve</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider"><div class="slider-top"><label for="tl-dose">Dose received while worn</label><output for="tl-dose" data-role="td-o"></output></div>
        <input type="range" id="tl-dose" min="0" max="2" step="1" value="1"></div>
      <div class="controls"><button type="button" class="primary" data-role="wear">Wear it</button><button type="button" data-role="read">Heat and read</button></div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Electrons trapped</span><b data-role="r-trap"></b><span>each dot stands for many</span></div>
      <div class="readout"><span>Reading</span><b data-role="r-read">–</b><span>from the total light</span></div>
    </div>
    <p class="summary" data-role="tl-sum" aria-live="polite"></p>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  let tab = "film", rad = "lowx", alive = true, trapped = 0, reading = null, busy = false;
  const fdIn = root.querySelector("#fb-dose"), tdIn = root.querySelector("#tl-dose");

  // Film badge: six windows, each a filter over a patch of film.
  const wins = FILTERS.map((f, i) => {
    const x = 60 + i * 90;
    const film = el("rect", { class: "dm-film", x, y: 60, width: 76, height: 120, rx: 6 }, $("windows"));
    el("rect", { class: `dm-filter f${i}`, x: x + 4, y: 64, width: 68, height: 112, rx: 4 }, $("windows"));
    const t = el("text", { class: "dm-f-t", x: x + 38, y: 206 }, $("windows"));
    el("tspan", { class: "wide-only" }, t).textContent = f.split(" + ")[0];
    el("tspan", { class: "narrow-only" }, t).textContent = SHORT[i];
    if (f.includes(" + ")) el("tspan", { class: "wide-only", x: x + 38, dy: "1.2em" }, t).textContent = `+ ${f.split(" + ")[1]}`;
    return film;
  });

  function film() {
    const dose = DOSES[+fdIn.value], r = RADS[rad];
    root.querySelectorAll("[data-rad]").forEach(b => b.setAttribute("aria-pressed", b.dataset.rad === rad));
    $("fd-o").textContent = `${dose} mSv`;
    wins.forEach((w, i) => {
      const dark = 1 - Math.exp(-2.3 * r.d[i] * dose);     // the film saturates at high doses
      const g = Math.round(235 - 205 * dark);
      w.setAttribute("fill", `rgb(${g},${g},${g})`);
    });
    const s = `${r.name}, ${dose} mSv. ${r.text} Comparing the windows identifies the type and energy of the radiation; the overall darkness gives the dose.`;
    $("fb-desc").textContent = s;
    $("fb-sum").textContent = s;
  }

  // TLD: dots for trapped electrons; heating releases them as light, traced out as the glow curve.
  const gx = T => GX0 + (T / TMAX) * (GX1 - GX0);
  const dots = Array.from({ length: 40 }, (_, i) => el("circle", { class: "electron", r: 3, cx: 118 + (i % 10) * 9.5, cy: 158 + Math.floor(i / 10) * 8 }, $("traps")));
  function drawTraps() { dots.forEach((d, i) => d.style.display = i < Math.round(trapped * 20) ? "" : "none"); $("r-trap").textContent = trapped ? Math.round(trapped * 20) : "None"; }
  function drawGlow(Tnow, amount) {
    const peak = amount * 0.9 * (GY1 - GY0);
    let d = "", f = `M${gx(0)} ${GY1}`;
    for (let T = 0; T <= Tnow; T += 2) { const y = (GY1 - glow(T) * peak).toFixed(1); d += `${T ? "L" : "M"}${gx(T).toFixed(1)} ${y} `; f += ` L${gx(T).toFixed(1)} ${y}`; }
    f += ` L${gx(Tnow).toFixed(1)} ${GY1} Z`;
    $("curve").setAttribute("d", d); $("fill").setAttribute("d", Tnow > 0 ? f : "");
    $("temp-t").textContent = `${Math.round(Tnow)} °C`;
    $("chip").style.fill = Tnow > 120 ? "color-mix(in srgb, var(--heat) 30%, var(--surface))" : "";
  }
  function tld(msg) {
    $("td-o").textContent = `${DOSES[+tdIn.value]} mSv`;
    drawTraps();
    $("r-read").textContent = reading === null ? "–" : `${reading} mSv`;
    $("read").disabled = busy; $("wear").disabled = busy;
    const s = msg || (trapped ? "Electrons freed by the radiation are held in traps in the crystal. Heat it to read the dose." : "The crystal is empty. Wear it to record a dose.");
    $("tl-desc").textContent = s; $("tl-sum").textContent = s;
  }
  $("wear").addEventListener("click", () => {
    trapped = Math.min(2, trapped + DOSES[+tdIn.value] / 2); reading = null; drawGlow(0, 0);
    tld(`Worn and exposed to ${DOSES[+tdIn.value]} mSv: more electrons are now trapped. Heat it to read the dose.`);
  });
  $("read").addEventListener("click", async () => {
    const amount = trapped; busy = true; tld("Heating…");
    const total = trapped * 2;   // mSv, from the trapped charge
    const ok = await tween(reducedMotion() ? 0 : 2400, f => {
      const T = f * TMAX;
      // Electrons leave their traps as the glow curve passes.
      let released = 0; for (let t = 0; t <= T; t += 2) released += glow(t) * 2;
      trapped = amount * (1 - released / AREA);
      drawTraps(); drawGlow(T, amount / 2);
    }, () => alive);
    if (!ok) return;
    trapped = 0; busy = false; reading = +total.toFixed(1);
    tld(amount ? `The light given off as it heated is proportional to the dose: ${reading} mSv. Reading empties the traps, so the TLD can be reused. Read it again and it shows nothing.`
      : "No electrons were trapped, so there is no light: a reading of zero.");
  });
  tdIn.addEventListener("input", () => tld());

  function show() {
    root.querySelectorAll("[data-tab]").forEach(b => b.setAttribute("aria-pressed", b.dataset.tab === tab));
    root.querySelectorAll("[data-pane]").forEach(p => p.hidden = p.dataset.pane !== tab);
  }
  root.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => { tab = b.dataset.tab; show(); }));
  root.querySelectorAll("[data-rad]").forEach(b => b.addEventListener("click", () => { rad = b.dataset.rad; film(); }));
  fdIn.addEventListener("input", film);
  show(); film(); drawGlow(0, 0); tld();
  return () => { alive = false; };
}
