// Explorer: charge, conductors and insulators. Left, two charges that attract or repel. Right, a strip of material with a
// voltage across it: in a conductor the loosely bound outer electrons drift towards the positive end; in an insulator they stay
// with their atoms. Each material is linked to where it is found in the X-ray tube and circuit.
import { svgEl as el, reducedMotion, motionPaused } from "./util.js";

const MATERIALS = {
  copper: { name: "Copper", cond: true, where: "Circuit wiring and transformer windings, and the anode's copper stem, which conducts heat away." },
  tungsten: { name: "Tungsten", cond: true, where: "The filament and the target. It conducts, and its very high melting point survives the heat." },
  glass: { name: "Glass", cond: false, where: "The tube envelope. It holds the vacuum and insulates the cathode from the anode." },
  oil: { name: "Transformer oil", cond: false, where: "Around the tube insert and in the high-voltage transformer: it insulates against the high voltage and carries heat away." },
  rubber: { name: "Rubber", cond: false, where: "Insulation around the high-voltage cables, so the kilovolts stay inside the conductor." },
};
const MX0 = 270, MX1 = 610, MY0 = 110, MY1 = 230;          // the strip of material
const ATOMS = [];
for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) ATOMS.push([MX0 + 24 + c * 42 + (r % 2) * 14, MY0 + 22 + r * 38]);

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 640 300" role="img" aria-labelledby="cd-t cd-d">
      <title id="cd-t">Charges, and electrons in a conductor and an insulator</title>
      <desc id="cd-d" data-role="desc"></desc>
      <text class="pane-t" x="120" y="30">Two charges</text>
      <g data-role="pair"></g>
      <text class="pane-t" x="${(MX0 + MX1) / 2}" y="30" data-role="mat-t"></text>
      <rect class="cd-strip" x="${MX0}" y="${MY0}" width="${MX1 - MX0}" height="${MY1 - MY0}" rx="8"/>
      <g data-role="atoms"></g>
      <g data-role="electrons"></g>
      <g data-role="battery"></g>
      <text class="plane-t" x="${(MX0 + MX1) / 2}" y="268" text-anchor="middle" data-role="state-t"></text>
    </svg>
    <p class="scale-note">Schematic · grey circles: atoms (nucleus and inner electrons) · blue: outer electrons</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><span class="label">Left charge</span></div>
        <div class="modes" role="group" aria-label="Left charge"><button type="button" data-a="+">Positive</button><button type="button" data-a="-">Negative</button></div>
      </div>
      <div class="slider">
        <div class="slider-top"><span class="label">Right charge</span></div>
        <div class="modes" role="group" aria-label="Right charge"><button type="button" data-b="+">Positive</button><button type="button" data-b="-">Negative</button></div>
      </div>
      <div class="slider">
        <div class="slider-top"><span class="label">Material</span></div>
        <div class="modes" role="group" aria-label="Material">${Object.entries(MATERIALS).map(([id, m]) => `<button type="button" data-m="${id}">${m.name}</button>`).join("")}</div>
      </div>
      <div class="slider">
        <div class="slider-top"><span class="label">Voltage across the material</span></div>
        <div class="modes" role="group" aria-label="Voltage"><button type="button" data-v="0">Off</button><button type="button" data-v="1">On</button></div>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>The two charges</span><b data-role="r-pair"></b></div>
      <div class="readout"><span>This material is</span><b data-role="r-type"></b><span data-role="r-why"></span></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const st = { a: "-", b: "-", m: "copper", v: 1 };
  let alive = true, timer = null;

  ATOMS.forEach(([x, y]) => el("circle", { class: "cd-atom", cx: x, cy: y, r: 9 }, $("atoms")));
  // One outer electron per atom; in a conductor it wanders free, in an insulator it stays in orbit.
  const es = ATOMS.map(([x, y], i) => ({ hx: x, hy: y, x, y, a: i * 1.7, n: el("circle", { class: "electron", r: 4.5 }, $("electrons")) }));
  const bat = $("battery");
  const minus = el("text", { class: "ev-sign", x: MX0 - 16, y: (MY0 + MY1) / 2 + 7 }, bat); minus.textContent = "−";
  const plus = el("text", { class: "ev-sign", x: MX1 + 16, y: (MY0 + MY1) / 2 + 7 }, bat); plus.textContent = "+";

  function drawPair() {
    const g = $("pair"); g.innerHTML = "";
    const same = st.a === st.b, ax = same ? 70 : 88, bx = same ? 170 : 152, y = 150;
    [[ax, st.a], [bx, st.b]].forEach(([x, s]) => {
      el("circle", { class: s === "+" ? "cd-pos" : "electron", cx: x, cy: y, r: 20 }, g);
      el("text", { class: "cd-sign", x, y: y + 1 }, g).textContent = s === "+" ? "+" : "−";
    });
    // Force arrows on each charge: outward if alike, inward if opposite.
    const arr = (x, dir) => el("path", { class: "cd-force", d: `M${x} ${y} l${dir * 34} 0 m${-dir * 8} -6 l${dir * 8} 6 l${-dir * 8} 6` }, g);
    if (same) { arr(ax - 22, -1); arr(bx + 22, 1); } else { arr(ax - 56, 1); arr(bx + 56, -1); }
    el("text", { class: "pane-note", x: 120, y: 210 }, g).textContent = same ? "Like charges repel" : "Unlike charges attract";
  }

  function update() {
    const m = MATERIALS[st.m];
    root.querySelectorAll("[data-a]").forEach(b => b.setAttribute("aria-pressed", b.dataset.a === st.a));
    root.querySelectorAll("[data-b]").forEach(b => b.setAttribute("aria-pressed", b.dataset.b === st.b));
    root.querySelectorAll("[data-m]").forEach(b => b.setAttribute("aria-pressed", b.dataset.m === st.m));
    root.querySelectorAll("[data-v]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.v === st.v));
    drawPair();
    $("mat-t").textContent = m.name;
    bat.style.display = st.v ? "" : "none";
    const flow = m.cond && st.v;
    $("state-t").textContent = !st.v ? "No voltage: electrons move at random, with no overall flow"
      : flow ? "Electrons drift towards the positive end: a current flows" : "Electrons held by their atoms: no current flows";
    $("r-pair").textContent = st.a === st.b ? "Repel" : "Attract";
    $("r-type").textContent = m.cond ? "A conductor" : "An insulator";
    $("r-why").textContent = m.cond ? "outer electrons loosely bound, free to move" : "electrons tightly bound to their atoms";
    if (!m.cond) es.forEach(e => { e.x = e.hx; e.y = e.hy; });
    const s = `${st.a === st.b ? "Like charges repel" : "Unlike charges attract"}. ${m.name} is ${m.cond ? "a conductor: its outer electrons are loosely bound and free to move" : "an insulator: its electrons are held tightly by their atoms"}` +
      `${st.v ? (m.cond ? ", so with a voltage across it they drift towards the positive end and a current flows." : ", so even with a voltage across it no current flows.") : "."} In X-ray equipment: ${m.where}`;
    $("desc").textContent = s;
    clearTimeout(timer);
    timer = setTimeout(() => { $("summary").textContent = s; }, 250);
    place(0);
  }

  function place(dt) {
    const m = MATERIALS[st.m];
    es.forEach((e, i) => {
      if (m.cond) {
        // Free electrons: a random jiggle, plus a steady drift to the right (towards +) when the voltage is on.
        e.x += (Math.sin(e.a * 3.1) * 0.6 + (st.v ? 0.9 : 0)) * dt * 0.06;
        e.y += Math.cos(e.a * 2.3) * 0.5 * dt * 0.06;
        e.a += dt * 0.004;
        if (e.x > MX1 - 6) e.x = MX0 + 6;
        if (e.x < MX0 + 6) e.x = MX1 - 6;
        e.y = Math.max(MY0 + 6, Math.min(MY1 - 6, e.y));
      } else {
        e.a += dt * 0.004;
        e.x = e.hx + 15 * Math.cos(e.a + i);
        e.y = e.hy + 15 * Math.sin(e.a + i);
      }
      e.n.setAttribute("cx", e.x.toFixed(1)); e.n.setAttribute("cy", e.y.toFixed(1));
    });
  }
  let last = performance.now();
  function frame(now) {
    if (!alive) return;
    if (!motionPaused()) place(Math.min(50, now - last));
    last = now;
    requestAnimationFrame(frame);
  }
  if (!reducedMotion()) requestAnimationFrame(frame);

  root.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => { st.a = b.dataset.a; update(); }));
  root.querySelectorAll("[data-b]").forEach(b => b.addEventListener("click", () => { st.b = b.dataset.b; update(); }));
  root.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => { st.m = b.dataset.m; es.forEach(e => { e.x = e.hx + 10; e.y = e.hy + 10; }); update(); }));
  root.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => { st.v = +b.dataset.v; update(); }));
  update();
  return () => { alive = false; clearTimeout(timer); };
}

// It moves by itself (flowing photons or electrons), so the page offers a "Pause motion" button for it.
export const moving = true;
