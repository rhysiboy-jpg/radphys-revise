// Explorer: the rotating-anode X-ray tube. Step-through exposure plus tappable numbered parts.
import { svgEl as el, wavy, reducedMotion } from "./util.js";

const PARTS = [
  { id: "filament", name: "Filament", bx: 210, by: 190, lx: 176, ly: 222,
    text: "A coil of tungsten wire in the cathode. The filament current (about 5 A at 12 V, from a step-down transformer) heats it until electrons escape from its surface. This is <b>thermionic emission</b>. A hotter filament releases more electrons, so filament temperature controls the <b>tube current (mA)</b>.",
    tip: "<b>Why tungsten?</b> High melting point (3422 °C) and it can be drawn into fine wire. Many tubes have two filaments, for broad and fine focus." },
  { id: "cup", name: "Focusing cup", bx: 128, by: 182, lx: 142, ly: 202,
    text: "A metal cup around the filament, held at the same negative potential. It repels the electrons and squeezes them into a narrow beam aimed at the focal spot.",
    tip: "<b>Exam tip:</b> the filament and focusing cup together make up the <b>cathode</b> assembly." },
  { id: "target", name: "Target and focal spot", bx: 404, by: 276, lx: 450, ly: 240,
    text: "A tungsten (often tungsten–rhenium) track on the bevelled edge of the anode. The bevel faces the cathode and is angled towards the window, typically at around 12–16° (the <b>target angle</b>). The electrons stop here. Around <b>99% of their energy becomes heat</b> and only about <b>1% becomes X-rays</b>. The focal spot is the area the electrons actually strike.",
    tip: "<b>Why tungsten?</b> High atomic number (Z = 74) gives efficient X-ray production, and its high melting point survives the heat. A smaller focal spot gives a sharper image but tolerates less heat." },
  { id: "anode", name: "Rotating anode", bx: 462, by: 50, lx: 466, ly: 88,
    text: "A disc connected to the positive high voltage. It spins at about 3,000 rpm, or about 9,000 rpm in high-speed tubes, so the electrons strike a moving ring of target rather than one spot. Spreading the heat this way allows much higher exposures without melting the target.",
    tip: "<b>Remember:</b> the anode starts spinning when the radiographer presses <b>prep</b>, before any X-rays are made." },
  { id: "rotor", name: "Rotor", bx: 578, by: 170, lx: 578, ly: 170,
    text: "A copper cylinder on the anode stem, inside the vacuum. The stator's magnetic field turns it, and it turns the anode. It runs on bearings.",
    tip: "<b>Link:</b> rotor and stator together form an <b>induction motor</b>." },
  { id: "stator", name: "Stator", bx: 664, by: 54, lx: 618, ly: 54,
    text: "Electromagnet coils outside the envelope, around the rotor. A changing magnetic field drives the rotor through the glass, with no physical connection across the vacuum.",
    tip: "<b>Why outside?</b> Keeping the coils out of the vacuum protects the vacuum and keeps their electrical supply simple." },
  { id: "envelope", name: "Envelope (vacuum)", bx: 300, by: 96, lx: 300, ly: 96,
    text: "A sealed borosilicate glass (or metal-ceramic) container holding a <b>vacuum</b>. Electrons can then travel from cathode to anode without colliding with gas molecules, and the hot filament cannot oxidise. It also supports and insulates the electrodes.",
    tip: "<b>Link:</b> the glass also absorbs some low-energy X-rays, so it contributes to <b>inherent filtration</b>." },
  { id: "window", name: "Window", bx: 524, by: 306, lx: 490, ly: 292,
    text: "A thinner part of the envelope where the useful beam leaves the tube. Together with the glass and oil, it forms the tube's <b>inherent filtration</b>, about 1 mm aluminium equivalent.",
    tip: "<b>Remember:</b> inherent filtration is built into the tube and cannot be removed." },
  { id: "filter", name: "Added filtration", bx: 532, by: 352, lx: 500, ly: 344,
    text: "Aluminium sheets at the tube port. They absorb the <b>low-energy photons</b>, which would only be absorbed in the patient's skin, adding dose without reaching the image receptor. This raises the beam's mean energy (<b>beam hardening</b>).",
    tip: "<b>Exam tip:</b> general radiography needs <b>at least 2.5 mm Al equivalent</b> total filtration (inherent + added)." },
  { id: "housing", name: "Housing and oil", bx: 72, by: 60, lx: 72, ly: 60,
    text: "A metal casing <b>lined with lead</b> to absorb <b>leakage radiation</b>, the X-rays heading in directions other than the window. The space is filled with <b>oil</b>, which insulates against the high voltage and carries heat away from the envelope.",
    tip: "<b>Link to protection:</b> leakage radiation is limited by regulation, which is why the housing matters to IRR17 compliance." },
];

const STEPS = [
  { t: "The tube at rest", d: "Press Next to follow one exposure, from prep to beam." },
  { t: "Prep 1: heating the filament", d: "The filament current heats the filament. Electrons are released by <b>thermionic emission</b> and gather in a cloud around it (the <b>space charge</b>). Filament temperature sets the tube current (mA)." },
  { t: "Prep 2: the anode spins up", d: "The stator's magnetic field turns the rotor, and the anode disc spins up to speed. No X-rays yet." },
  { t: "Exposure: kV is applied", d: "The high voltage is switched on: cathode negative, anode positive. Electrons accelerate across the vacuum, and the focusing cup narrows them onto the focal spot. <b>kV sets how much energy each electron carries.</b>" },
  { t: "Electrons hit the target", d: "The electrons stop in the tungsten target. About <b>99%</b> of their energy becomes <b>heat</b>, spread around the spinning track. Only about <b>1%</b> becomes <b>X-ray photons</b>, which leave in all directions. Those heading the wrong way are absorbed by the lead-lined housing." },
  { t: "The useful beam", d: "Photons heading for the window pass out of the tube. The aluminium filter removes the low-energy ones, which would only add skin dose. What's left is the <b>useful beam</b> sent towards the patient." },
];

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg class="tube-svg" viewBox="0 0 760 440" role="img" aria-labelledby="tube-t tube-d">
      <title id="tube-t">Schematic of a rotating-anode X-ray tube</title>
      <desc id="tube-d">Side view. Cathode with filament and focusing cup on the left, rotating tungsten anode disc in the centre-right with its bevelled target facing the cathode and angled towards the window, rotor and stator on the right, all inside a vacuum envelope within an oil-filled, lead-lined housing. The useful beam leaves downwards through the window and aluminium filter.</desc>
      <defs>
        <radialGradient id="g-fil"><stop offset="0" stop-color="var(--heat)" stop-opacity="0.95"/><stop offset="1" stop-color="var(--heat)" stop-opacity="0"/></radialGradient>
        <radialGradient id="g-heat"><stop offset="0" stop-color="var(--heat)" stop-opacity="1"/><stop offset="0.5" stop-color="var(--heat)" stop-opacity="0.55"/><stop offset="1" stop-color="var(--heat)" stop-opacity="0"/></radialGradient>
      </defs>
      <g class="part" data-part="housing">
        <rect class="oil" x="30" y="30" width="700" height="300" rx="36"/>
        <rect class="housing" x="30" y="30" width="700" height="300" rx="36"/>
        <rect class="port" x="410" y="324" width="80" height="12"/>
      </g>
      <g class="part" data-part="envelope"><rect class="glass" x="100" y="70" width="540" height="220" rx="60"/></g>
      <g class="part" data-part="window">
        <rect class="hit" x="408" y="280" width="86" height="22"/>
        <line class="window" x1="414" y1="290" x2="488" y2="290"/>
      </g>
      <g class="part" data-part="filter"><rect class="al" x="402" y="336" width="96" height="12" rx="2"/></g>
      <path class="wire" d="M36 232 H140"/>
      <path class="wire" d="M616 170 H724"/>
      <text class="pol" x="70" y="222">−</text>
      <text class="pol" x="684" y="160">+</text>
      <g class="part" data-part="cup"><path class="cup" d="M140 200 H180 V214 H166 V250 H180 V264 H140 Z"/></g>
      <g class="part" data-part="filament">
        <rect class="hit" x="160" y="212" width="26" height="40"/>
        <circle class="fx fx-1" cx="174" cy="232" r="22" fill="url(#g-fil)"/>
        <path class="coil" d="M170 217 l7 3 l-7 3 l7 3 l-7 3 l7 3 l-7 3 l7 3 l-7 3 l7 3 l-7 3"/>
      </g>
      <g class="part" data-part="anode">
        <polygon class="disc" points="458,90 484,90 484,250 458,250 446,206 446,134"/>
        <rect class="stem" x="484" y="164" width="56" height="12"/>
      </g>
      <g class="part" data-part="target">
        <line class="hit" x1="446" y1="206" x2="458" y2="250" stroke="transparent" stroke-width="24"/>
        <line class="track" x1="447" y1="209" x2="457" y2="247"/>
        <line class="track" x1="457" y1="93" x2="447" y2="131"/>
      </g>
      <g class="part" data-part="rotor">
        <rect class="rotor" x="540" y="136" width="76" height="68" rx="6"/>
        <path d="M556 136 V204 M572 136 V204 M588 136 V204 M604 136 V204" stroke="var(--lead)" stroke-width="1" opacity="0.5"/>
      </g>
      <g class="part" data-part="stator">
        <rect class="stator" x="540" y="44" width="76" height="20" rx="3"/>
        <rect class="stator" x="540" y="296" width="76" height="20" rx="3"/>
        <path class="stator-coil" d="M548 48 V60 M560 48 V60 M572 48 V60 M584 48 V60 M596 48 V60 M608 48 V60 M548 300 V312 M560 300 V312 M572 300 V312 M584 300 V312 M596 300 V312 M608 300 V312"/>
      </g>
      <g class="fx fx-2" aria-hidden="true">
        <path class="spin" d="M506 148 A12 26 0 1 0 506 192"/>
        <polygon class="spin-head" points="500,190 512,196 502,200"/>
      </g>
      <g data-role="cloud" class="fx fx-1" aria-hidden="true"></g>
      <g data-role="stream" class="fx fx-3" aria-hidden="true"></g>
      <g class="fx fx-3" aria-hidden="true"><text class="fxlabel el-t" x="250" y="216">electrons →</text></g>
      <g class="fx fx-4" aria-hidden="true">
        <circle cx="453" cy="232" r="30" fill="url(#g-heat)"/>
        <text class="fxlabel heat-t" x="330" y="268">≈99% heat</text>
      </g>
      <g data-role="strays" class="fx fx-4" aria-hidden="true"></g>
      <g class="fx fx-5" aria-hidden="true"><polygon class="beam" points="453,236 387,436 519,436"/></g>
      <g data-role="useful" class="fx fx-5" aria-hidden="true"></g>
      <g class="fx fx-5" aria-hidden="true"><text class="fxlabel ph-t" x="526" y="420">useful beam</text></g>
      <g data-role="badges"></g>
    </svg>
    <p class="scale-note">Schematic · not to scale · cathode (−) left, anode (+) right</p>
  </div>
  <div class="panel">
    <div class="stepper">
      <div class="step-meta">
        <span class="eyebrow" data-role="count">Step 0 of 5</span>
        <div class="dots" data-role="dots" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      </div>
      <div class="caption" data-role="caption" aria-live="polite"></div>
      <div class="controls">
        <button type="button" data-role="back">Back</button>
        <button type="button" data-role="next" class="primary">Next</button>
        <button type="button" data-role="play">Play</button>
        <button type="button" data-role="reset">Start again</button>
      </div>
    </div>
    <div>
      <h3 style="margin-bottom:8px">Parts</h3>
      <ul class="key" data-role="key"></ul>
    </div>
    <div class="part-card" data-role="card" aria-live="polite"></div>
  </div>
</div>`;

const EMPTY_CARD = '<p class="eyebrow">Part detail</p><p>Tap a number on the diagram or a part above.</p>';

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const tube = root.querySelector("svg");
  const key = $("key"), card = $("card");
  card.innerHTML = EMPTY_CARD;

  // Parts
  let selected = null;
  function selectPart(id) {
    selected = selected === id ? null : id;
    tube.classList.toggle("has-sel", !!selected);
    tube.querySelectorAll(".part, .badge").forEach(n => n.classList.toggle("sel", n.dataset.part === selected));
    key.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.part === selected));
    if (!selected) { card.innerHTML = EMPTY_CARD; return; }
    const i = PARTS.findIndex(p => p.id === selected), p = PARTS[i];
    card.innerHTML = `<p class="eyebrow">Part ${i + 1} of ${PARTS.length}</p><h3>${p.name}</h3><p>${p.text}</p><p class="tip">${p.tip}</p>`;
  }
  const badges = $("badges");
  PARTS.forEach((p, i) => {
    const g = el("g", { class: "badge", "data-part": p.id, "aria-hidden": "true" }, badges);
    if (p.lx !== p.bx || p.ly !== p.by) el("line", { x1: p.bx, y1: p.by, x2: p.lx, y2: p.ly }, g);
    el("circle", { cx: p.bx, cy: p.by, r: 13 }, g);
    el("text", { x: p.bx, y: p.by }, g).textContent = i + 1;
    g.addEventListener("click", () => selectPart(p.id));
    const li = document.createElement("li");
    li.innerHTML = `<button type="button" aria-pressed="false" data-part="${p.id}"><span class="num">${i + 1}</span>${p.name}</button>`;
    li.firstChild.addEventListener("click", () => selectPart(p.id));
    key.appendChild(li);
  });
  tube.querySelectorAll(".part").forEach(g => g.addEventListener("click", () => selectPart(g.dataset.part)));

  // Photons
  const cross = (g, x, y) => el("path", { class: "stop", d: `M${x - 6} ${y - 6} L${x + 6} ${y + 6} M${x + 6} ${y - 6} L${x - 6} ${y + 6}` }, g);
  const strays = $("strays");
  [[392, 36], [300, 324], [330, 36]].forEach(([x, y]) => { el("path", { class: "photon weak", d: wavy(450, 228, x, y) }, strays); cross(strays, x, y); });
  const useful = $("useful");
  [[421, 432], [455, 432], [489, 432]].forEach(([x, y]) => el("path", { class: "photon", d: wavy(453, 240, x, y) }, useful));
  el("path", { class: "photon weak", d: wavy(453, 240, 473, 334, 3, 9) }, useful); cross(useful, 473, 336);

  // Electrons
  const cloudDots = Array.from({ length: 9 }, (_, i) => ({ n: el("circle", { class: "electron", r: 3 }, $("cloud")), a: (i / 9) * Math.PI * 2, r: 8 + (i % 3) * 4 }));
  const N = 11;
  const streamDots = Array.from({ length: N }, (_, i) => ({ n: el("circle", { class: "electron", r: 3.2 }, $("stream")), p: i / N, off: ((i * 7) % 5 - 2) * 3 }));
  const X0 = 184, X1 = 450, Y = 232;
  let running = true;
  function frame(t) {
    if (!running) return;
    const still = reducedMotion();
    cloudDots.forEach((d, i) => {
      const a = d.a + (still ? 0 : t * 0.0015 * (i % 2 ? 1 : -1));
      d.n.setAttribute("cx", (190 + Math.cos(a) * d.r * 0.7).toFixed(1));
      d.n.setAttribute("cy", (Y + Math.sin(a) * d.r).toFixed(1));
    });
    streamDots.forEach(d => {
      const p = still ? d.p : (d.p + t * 0.00045) % 1;
      d.n.setAttribute("cx", (X0 + (X1 - X0) * p).toFixed(1));
      d.n.setAttribute("cy", (Y + d.off * (1 - p)).toFixed(1));   // beam narrows towards the focal spot
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Stepper
  let step = 0, timer = null;
  const cap = $("caption"), count = $("count"), back = $("back"), next = $("next"), play = $("play");
  const dots = [...$("dots").children];
  function render() {
    for (let i = 1; i <= 5; i++) tube.classList.toggle("on-" + i, step >= i);
    // Every step is laid out in the same grid cell, hidden, so the caption keeps the tallest step's height
    // and the controls below never jump as the text changes.
    const block = (s, hide) => `<div class="cap-step${hide ? " sizer" : ""}"${hide ? ' aria-hidden="true"' : ""}><strong>${s.t}</strong><p>${s.d}</p></div>`;
    cap.innerHTML = block(STEPS[step], false) + STEPS.map(s => block(s, true)).join("");
    count.textContent = `Step ${step} of 5`;
    dots.forEach((d, i) => d.classList.toggle("on", i < step));
    back.disabled = step === 0;
    next.disabled = step === 5;
  }
  const go = s => { step = Math.max(0, Math.min(5, s)); render(); };
  const stop = () => { clearInterval(timer); timer = null; play.textContent = "Play"; };
  back.addEventListener("click", () => { stop(); go(step - 1); });
  next.addEventListener("click", () => { stop(); go(step + 1); });
  $("reset").addEventListener("click", () => { stop(); go(0); });
  play.addEventListener("click", () => {
    if (timer) { stop(); return; }
    if (step === 5) go(0);
    play.textContent = "Pause";
    go(step + 1);
    timer = setInterval(() => { if (step >= 5) { stop(); return; } go(step + 1); }, 5000);
  });
  render();

  return () => { running = false; clearInterval(timer); };
}
