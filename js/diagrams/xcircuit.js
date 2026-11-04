// Explorer: the X-ray circuit as a block diagram. Three linked circuits: primary (low voltage, the radiographer's controls),
// secondary (high voltage: step-up transformer and rectifiers) and filament (step-down transformer, sets the mA).
// Tap a part to read about it, or choose a setting to light up the parts that carry it out. Simplified: one rectifier block,
// no meters, and the kVp and mA selectors drawn at their effect (autotransformer, filament control).
import { svgEl as el } from "./util.js";

const PARTS = [
  { id: "mains", name: "Mains supply", c: "p", x: 20, y: 70, w: 92,
    text: "The incoming supply from the hospital's electrical system, at a few hundred volts AC. Everything else is built from it." },
  { id: "switch", name: "Main switch and fuses", short: "Main switch", c: "p", x: 128, y: 70, w: 92,
    text: "Connects the generator to the mains and protects it: fuses or circuit breakers cut the supply if too much current flows." },
  { id: "auto", name: "Auto­transformer (kVp selector)", short: "Auto-transformer", c: "p", x: 236, y: 70, w: 104,
    text: "A transformer with one winding and many tappings. Choosing a tapping sets the voltage fed to the step-up transformer, so this is where the <b>kVp is selected</b>. It also feeds the filament circuit." },
  { id: "timer", name: "Timer and exposure switch", short: "Timer", c: "p", x: 356, y: 70, w: 92,
    text: "The exposure switch starts the exposure (after prep) and the timer, or the AEC, ends it, by switching the supply to the step-up transformer on and off on the low-voltage side." },
  { id: "stepup", name: "Step-up transformer", short: "Step-up", c: "s", x: 486, y: 70, w: 100,
    text: "Many more turns on its secondary coil than its primary, so it raises the voltage from hundreds of volts to the <b>kilovolts</b> the tube needs. The current falls in the same proportion." },
  { id: "rect", name: "Rectifiers", short: "Rectifiers", c: "s", x: 486, y: 170, w: 100,
    text: "Diodes that let current flow one way only, turning the alternating supply into a one-way supply. The cathode then stays negative and the anode positive, so electrons always cross the tube the right way." },
  { id: "tube", name: "X-ray tube", short: "X-ray tube", c: "s", x: 486, y: 270, w: 100,
    text: "The high voltage accelerates electrons from the hot filament (cathode, negative) to the target (anode, positive), producing X-rays." },
  { id: "ma", name: "mA selector (filament control)", short: "mA selector", c: "f", x: 236, y: 270, w: 104,
    text: "Sets the current through the filament circuit, and so how hot the filament gets. This is how the <b>mA is selected</b>: a hotter filament releases more electrons by thermionic emission." },
  { id: "stepdown", name: "Step-down transformer", short: "Step-down", c: "f", x: 356, y: 270, w: 104,
    text: "Fewer turns on its secondary coil, giving a <b>low voltage</b> (about 12 V) and a <b>high current</b> (about 5 A) to heat the filament." },
];
const CIRCUITS = {
  p: { name: "Primary circuit", note: "low voltage", x: 10, y: 34, w: 450, h: 102 },
  s: { name: "Secondary circuit", note: "high voltage", x: 472, y: 34, w: 128, h: 300 },
  f: { name: "Filament circuit", note: "low voltage, high current", x: 212, y: 234, w: 258, h: 100 },
};
const WIRES = [["mains", "switch"], ["switch", "auto"], ["auto", "timer"], ["timer", "stepup"], ["stepup", "rect"], ["rect", "tube"], ["auto", "ma"], ["ma", "stepdown"], ["stepdown", "tube"]];
const SETTINGS = {
  kv: { name: "Select the kVp", parts: ["auto", "stepup", "rect", "tube"],
    text: "The <b>kVp</b> is <b>selected in the primary circuit</b>, at the autotransformer, and <b>produced in the secondary circuit</b>: the step-up transformer multiplies the chosen voltage up to kilovolts, and the rectifiers keep it one-way across the tube." },
  ma: { name: "Select the mA", parts: ["auto", "ma", "stepdown", "tube"],
    text: "The <b>mA</b> is set through the <b>filament circuit</b>: the selector sets the filament current, the step-down transformer supplies it at low voltage and high current, and the hotter filament releases more electrons." },
  time: { name: "Set the time", parts: ["timer"],
    text: "The <b>timer</b> (or the AEC) sets how long the high voltage is applied. It switches the low-voltage side, which is safer and simpler than switching kilovolts." },
  expose: { name: "Prep and expose", parts: ["mains", "switch", "auto", "timer", "stepup", "rect", "tube", "ma", "stepdown"],
    text: "<b>Prep</b> heats the filament (filament circuit) and spins the anode. <b>Exposure</b> closes the exposure switch: the primary circuit feeds the step-up transformer, the rectified high voltage crosses the tube, and X-rays are made until the timer ends the exposure." },
};
const byId = Object.fromEntries(PARTS.map(p => [p.id, p]));
const H = 44, mid = p => [p.x + p.w / 2, p.y + H / 2];

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 610 344" role="img" aria-labelledby="xc-t xc-d">
      <title id="xc-t">Block diagram of the X-ray circuit</title>
      <desc id="xc-d" data-role="desc"></desc>
      <g data-role="regions"></g>
      <g data-role="wires"></g>
      <g data-role="parts"></g>
    </svg>
    <ul class="key" data-role="key">${PARTS.map((p, i) => `<li><button type="button" data-part="${p.id}"><span class="num">${i + 1}</span>${p.name}</button></li>`).join("")}</ul>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><span class="label">Follow a setting</span></div>
        <div class="modes" role="group" aria-label="Settings">${Object.entries(SETTINGS).map(([id, s]) => `<button type="button" data-set="${id}">${s.name}</button>`).join("")}</div>
      </div>
    </div>
    <div class="part-card" aria-live="polite">
      <p class="eyebrow" data-role="eyebrow"></p>
      <h3 data-role="title"></h3>
      <p data-role="text"></p>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  Object.entries(CIRCUITS).forEach(([id, c]) => {
    el("rect", { class: `xc-region xc-${id}`, x: c.x, y: c.y, width: c.w, height: c.h, rx: 10 }, $("regions"));
    const t = el("text", { class: "xc-region-t", x: c.x + 10, y: c.y + 18 }, $("regions"));
    t.textContent = c.name.split(" ")[0];
    // The secondary region is narrow: its note goes on a line of its own, below the parts.
    el("tspan", { class: "wide-only" }, t).textContent = id === "s" ? " circuit" : ` circuit: ${c.note}`;
    if (id === "s") el("text", { class: "xc-region-t wide-only", x: c.x + 10, y: c.y + c.h - 8 }, $("regions")).textContent = c.note;
  });
  const wires = WIRES.map(([a, b]) => {
    const [ax, ay] = mid(byId[a]), [bx, by] = mid(byId[b]);
    // Horizontal then vertical, so the lines run like a circuit diagram.
    const d = ay === by ? `M${ax} ${ay} L${bx} ${by}` : ax === bx ? `M${ax} ${ay} L${bx} ${by}` : `M${ax} ${ay} L${ax} ${by} L${bx} ${by}`;
    return { a, b, n: el("path", { class: "xc-wire", d }, $("wires")) };
  });
  const nodes = PARTS.map((p, i) => {
    const g = el("g", { class: "xc-part", "data-part": p.id }, $("parts"));
    el("rect", { x: p.x, y: p.y, width: p.w, height: H, rx: 8 }, g);
    const t = el("text", { class: "xc-t wide-only", x: p.x + p.w / 2, y: p.y + H / 2 + 4 }, g);
    t.textContent = p.short || p.name;
    const b = el("g", { class: "badge narrow-only" }, g);
    el("circle", { cx: p.x + p.w / 2, cy: p.y + H / 2 }, b);
    el("text", { x: p.x + p.w / 2, y: p.y + H / 2 }, b).textContent = i + 1;
    g.addEventListener("click", () => pickPart(p.id));
    return g;
  });

  function light(ids) {
    nodes.forEach((g, i) => g.classList.toggle("on", ids.includes(PARTS[i].id)));
    wires.forEach(w => w.n.classList.toggle("on", ids.includes(w.a) && ids.includes(w.b)));
  }
  function pickPart(id) {
    const p = byId[id], i = PARTS.indexOf(p);
    root.querySelectorAll("[data-part]").forEach(b => b.tagName === "BUTTON" && b.setAttribute("aria-pressed", b.dataset.part === id));
    root.querySelectorAll("[data-set]").forEach(b => b.setAttribute("aria-pressed", false));
    light([id]);
    $("eyebrow").textContent = `${i + 1} · ${CIRCUITS[p.c].name} (${CIRCUITS[p.c].note})`;
    $("title").textContent = p.name;
    $("text").innerHTML = p.text;
  }
  function pickSet(id) {
    const s = SETTINGS[id];
    root.querySelectorAll("[data-set]").forEach(b => b.setAttribute("aria-pressed", b.dataset.set === id));
    root.querySelectorAll("button[data-part]").forEach(b => b.setAttribute("aria-pressed", false));
    light(s.parts);
    $("eyebrow").textContent = "Follow a setting";
    $("title").textContent = s.name;
    $("text").innerHTML = s.text;
  }
  root.querySelectorAll("button[data-part]").forEach(b => b.addEventListener("click", () => pickPart(b.dataset.part)));
  root.querySelectorAll("[data-set]").forEach(b => b.addEventListener("click", () => pickSet(b.dataset.set)));
  $("desc").textContent = "Primary circuit along the top: mains supply, main switch, autotransformer and timer, feeding the step-up transformer. " +
    "Secondary circuit on the right: step-up transformer, rectifiers and the X-ray tube. Filament circuit along the bottom: the mA selector and step-down transformer, feeding the tube's filament.";
  pickSet("kv");
}
