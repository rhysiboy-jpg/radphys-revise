// Explorer: potential difference, current and resistance. A simple circuit: set the voltage, and the length and thickness of
// the wire. Resistance rises with length and falls with thickness; the current follows Ohm's law (I = V / R), shown as a
// straight line through the origin; the energy turned to heat each second is V × I. Values are illustrative.
import { svgEl as el, reducedMotion } from "./util.js";

const THICK = { thin: { name: "Thin", area: 1, h: 6 }, medium: { name: "Medium", area: 2, h: 11 }, thick: { name: "Thick", area: 4, h: 18 } };
const K = 6;                                   // ohms for one unit of length at the thinnest wire
const VMAX = 12, IMAX = 8;
// The loop: battery on the left, the test wire on the top, the ammeter on the bottom.
const LOOP = "M70 200 L70 70 L330 70 L330 230 L70 230 Z";
const GX0 = 410, GX1 = 620, GY0 = 50, GY1 = 230;
const gx = v => GX0 + (v / VMAX) * (GX1 - GX0), gy = i => GY1 - (i / IMAX) * (GY1 - GY0);

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 640 290" role="img" aria-labelledby="oh-t oh-d">
      <title id="oh-t">A circuit with a battery, a wire and an ammeter, and a graph of current against voltage</title>
      <desc id="oh-d" data-role="desc"></desc>
      <path class="oh-loop" d="${LOOP}"/>
      <rect class="oh-heat" data-role="heat" y="0" rx="6"/>
      <rect class="oh-wire" data-role="wire" rx="3"/>
      <text class="plane-t" data-role="wire-t" y="52" text-anchor="middle"></text>
      <g data-role="flow"></g>
      <rect class="oh-batt-gap" x="58" y="128" width="24" height="18"/>
      <line class="oh-cell" x1="52" y1="128" x2="88" y2="128"/>
      <line class="oh-cell short" x1="60" y1="146" x2="80" y2="146"/>
      <text class="ev-sign" x="100" y="122">+</text>
      <text class="ev-sign" x="100" y="166">−</text>
      <text class="plane-t" x="40" y="142" text-anchor="end" data-role="v-t"></text>
      <circle class="oh-meter" cx="200" cy="230" r="20"/>
      <text class="cd-sign oh-a" x="200" y="231">A</text>
      <text class="plane-t" x="200" y="272" text-anchor="middle" data-role="i-t"></text>
      <g class="axis">
        <line x1="${GX0}" y1="${GY1}" x2="${GX1}" y2="${GY1}"/>
        <line x1="${GX0}" y1="${GY0}" x2="${GX0}" y2="${GY1}"/>
        ${[0, 4, 8, 12].map(v => `<text x="${gx(v)}" y="${GY1 + 18}" text-anchor="middle">${v}</text>`).join("")}
        ${[0, 4, 8].map(i => `<text x="${GX0 - 8}" y="${gy(i) + 4}" text-anchor="end">${i}</text>`).join("")}
        <text class="ax-title" x="${(GX0 + GX1) / 2}" y="${GY1 + 40}" text-anchor="middle">Voltage (V)</text>
        <text class="ax-title" x="${GX0 - 30}" y="${(GY0 + GY1) / 2}" text-anchor="middle" transform="rotate(-90 ${GX0 - 30} ${(GY0 + GY1) / 2})">Current (A)</text>
      </g>
      <line class="oh-line" data-role="line"/>
      <circle class="oh-pt" data-role="pt" r="6"/>
    </svg>
    <p class="scale-note">Illustrative values · the wire is kept at a constant temperature · blue dots: electrons, flowing from − to +</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><label for="oh-v">Potential difference</label><output for="oh-v" data-role="v-o"></output></div>
        <input type="range" id="oh-v" min="0" max="${VMAX}" step="1" value="6">
      </div>
      <div class="slider">
        <div class="slider-top"><label for="oh-l">Length of wire</label><output for="oh-l" data-role="l-o"></output></div>
        <input type="range" id="oh-l" min="1" max="4" step="1" value="2">
      </div>
      <div class="slider">
        <div class="slider-top"><span class="label">Thickness of wire</span></div>
        <div class="modes" role="group" aria-label="Thickness">${Object.entries(THICK).map(([id, t]) => `<button type="button" data-t="${id}">${t.name}</button>`).join("")}</div>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Resistance</span><b data-role="r-r"></b></div>
      <div class="readout"><span>Current</span><b data-role="r-i"></b><span>I = V ÷ R</span></div>
      <div class="readout"><span>Charge passing each second</span><b data-role="r-c"></b><span>1 A = 1 coulomb per second</span></div>
      <div class="readout"><span>Energy turned to heat</span><b data-role="r-p"></b><span>joules each second (V × I)</span></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const vIn = root.querySelector("#oh-v"), lIn = root.querySelector("#oh-l");
  let thick = "thin", alive = true, timer = null, phase = 0, last = performance.now();
  const loop = el("path", { d: LOOP, fill: "none", stroke: "none" }, $("flow"));
  const LEN = loop.getTotalLength();
  const dots = Array.from({ length: 22 }, (_, i) => ({ p: i / 22, n: el("circle", { class: "electron", r: 4 }, $("flow")) }));
  const fmt = x => +x.toFixed(2);

  function state() {
    const V = +vIn.value, L = +lIn.value, R = (K * L) / THICK[thick].area, I = V / R;
    return { V, L, R, I, P: V * I };
  }
  function update() {
    const { V, L, R, I, P } = state(), t = THICK[thick];
    root.querySelectorAll("[data-t]").forEach(b => b.setAttribute("aria-pressed", b.dataset.t === thick));
    $("v-o").textContent = `${V} V`; $("l-o").textContent = `${L} m`;
    // The test wire on the top of the loop: longer and thicker as chosen, glowing with the heat it gives off.
    const w = 40 + L * 50, x = 200 - w / 2;
    Object.entries({ x, y: 70 - t.h / 2, width: w, height: t.h }).forEach(([k, v]) => $("wire").setAttribute(k, v));
    Object.entries({ x: x - 8, y: 70 - t.h / 2 - 8, width: w + 16, height: t.h + 16 }).forEach(([k, v]) => $("heat").setAttribute(k, v));
    $("heat").style.opacity = Math.min(0.75, P / 70).toFixed(2);
    $("wire-t").setAttribute("x", 200); $("wire-t").textContent = `${L} m, ${t.name.toLowerCase()}: ${fmt(R)} Ω`;
    $("v-t").textContent = `${V} V`;
    $("i-t").textContent = `${fmt(I)} A`;
    $("r-r").textContent = `${fmt(R)} Ω`; $("r-i").textContent = `${fmt(I)} A`;
    $("r-c").textContent = `${fmt(I)} C`; $("r-p").textContent = `${fmt(P)} W`;
    // Ohm's law line for this wire: a straight line through the origin, its slope set by the resistance.
    const vEnd = Math.min(VMAX, IMAX * R);
    Object.entries({ x1: gx(0), y1: gy(0), x2: gx(vEnd), y2: gy(vEnd / R) }).forEach(([k, v]) => $("line").setAttribute(k, v.toFixed(1)));
    $("pt").setAttribute("cx", gx(V).toFixed(1)); $("pt").setAttribute("cy", gy(I).toFixed(1));
    const s = `${V} V across a ${L} m ${t.name.toLowerCase()} wire with a resistance of ${fmt(R)} Ω drives a current of ${fmt(I)} A (${fmt(I)} coulombs each second). ` +
      `The wire turns ${fmt(P)} J of energy into heat every second. Double the voltage and the current doubles: the graph is a straight line through the origin.`;
    $("desc").textContent = s;
    clearTimeout(timer);
    timer = setTimeout(() => { $("summary").textContent = s; }, 250);
    move(0);
  }
  // Electrons go round the loop from the negative terminal, at a speed that follows the current.
  function move(dt) {
    phase = (phase + dt * 0.00004 * state().I) % 1;
    dots.forEach(d => {
      const pt = loop.getPointAtLength(((d.p - phase + 1) % 1) * LEN);   // from − (bottom of the battery) round the bottom, up and over the top
      d.n.setAttribute("cx", pt.x.toFixed(1)); d.n.setAttribute("cy", pt.y.toFixed(1));
    });
  }
  function frame(now) {
    if (!alive) return;
    move(Math.min(50, now - last)); last = now;
    requestAnimationFrame(frame);
  }
  if (!reducedMotion()) requestAnimationFrame(frame);

  vIn.addEventListener("input", update); lIn.addEventListener("input", update);
  root.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => { thick = b.dataset.t; update(); }));
  update();
  return () => { alive = false; clearTimeout(timer); };
}
