// Explorer: detectors. Follow one X-ray photon to a pixel value in CR, indirect DR and direct DR, and see how far the
// signal spreads across neighbouring pixels (lectures: Formation of an Image, slides 6–25; Image Production, slides 6–8).
// Schematic: layer thicknesses and the spread are illustrative, but the order of sharpness is right:
// direct (charge drifts straight along the field) > structured CsI (needles guide the light) > unstructured Gd₂O₂S.
import { svgEl as el, wavy } from "./util.js";

const X0 = 60, X1 = 420, HIT = 240;                     // detector extent and where the photon lands
const PIX = { x0: HIT - 3.5 * 26, w: 26, n: 7, y: 248 };           // the pixel row under the hit
const pixX = i => PIX.x0 + i * PIX.w;

const MODES = {
  cr: {
    name: "CR", full: "Computed radiography", spread: 1.1, light: "Yes: released by a laser in the reader", reader: "Yes: a separate plate reader",
    chain: "X-ray → trapped electrons → laser → light → photomultiplier → signal → ADC",
    steps: [
      ["Exposure: the latent image", "The X-ray photon is absorbed by the storage phosphor. Electrons are trapped in intermediate energy levels, and the number trapped is proportional to the radiation absorbed: the latent image."],
      ["Reading: the laser", "In the reader the plate is scanned line by line by a finely focused laser. Its energy releases the trapped electrons, and as they fall back they give out light."],
      ["The photomultiplier", "A light guide carries the light to a photomultiplier tube, which turns it into an electrical signal and amplifies it."],
      ["Digitising", "An analogue-to-digital converter samples the signal and quantises it: each pixel gets a value, built up pixel by pixel and line by line."],
      ["Erasing", "Bright light releases any electrons still trapped, and the plate is ready to use again."],
    ],
  },
  indirect: {
    name: "Indirect DR", full: "Indirect digital radiography", spread: null, light: "Yes: made by the scintillator", reader: "No: read out in the detector",
    chain: "X-ray → light (scintillator) → charge (a-Si photodiode) → TFT → ADC",
    steps: [
      ["The scintillator", "The X-ray photon is absorbed in the scintillator, caesium iodide (CsI) or gadolinium oxysulphide (Gd₂O₂S), which gives out a burst of light."],
      ["Light spreads", "On its way down, the light spreads sideways. Structured CsI grows in needles that guide the light straight down; unstructured Gd₂O₂S lets it spread, blurring the image."],
      ["Photodiodes", "A thin layer of amorphous silicon (a-Si), divided into pixels, acts as photodiodes: each turns the light that reaches it into an electrical charge."],
      ["Read-out", "Thin-film transistors (TFTs) read each pixel's charge in turn; it is amplified and converted to a digital value. No separate reader is needed."],
    ],
  },
  direct: {
    name: "Direct DR", full: "Direct digital radiography", spread: 0.35, light: "None", reader: "No: read out in the detector",
    chain: "X-ray → charge (a-Se photoconductor) → TFT → ADC",
    steps: [
      ["The electric field", "Before the exposure, a voltage is applied across the layer of amorphous selenium (a-Se), setting up an electric field through it."],
      ["X-rays to charge", "The X-ray photon is absorbed in the selenium and frees electrical charge directly, in proportion to the radiation. No light is made."],
      ["Straight down", "The field pulls the charge straight down to the pixel beneath, so it hardly spreads: the sharpest of the three."],
      ["Read-out", "Each pixel's charge is stored in a capacitor and read by its thin-film transistor (TFT), then amplified and converted to a digital value."],
    ],
  },
};
const SCINT = { csi: { name: "Structured CsI", spread: 0.7 }, gos: { name: "Unstructured Gd₂O₂S", spread: 1.9 } };

const MARKUP = `
<div class="grid">
  <div class="stage">
    <div class="modes" role="group" aria-label="Detector" data-role="kinds"></div>
    <svg viewBox="0 0 640 300" role="img" aria-labelledby="det-t det-d">
      <title id="det-t">A detector in cross-section, from X-ray photon to pixel values</title>
      <desc id="det-d" data-role="desc"></desc>
      <g data-role="scene"></g>
    </svg>
    <p class="scale-note">Schematic · cross-section · not to scale · spread across pixels is illustrative</p>
  </div>
  <div class="panel">
    <div class="stepper">
      <div class="step-meta"><span class="eyebrow" data-role="count"></span><div class="dots" data-role="dots" aria-hidden="true"></div></div>
      <div class="caption" aria-live="polite"><strong data-role="cap-t"></strong><p data-role="cap-d"></p></div>
      <div class="controls">
        <button type="button" data-role="back">Back</button>
        <button type="button" class="primary" data-role="next">Next</button>
      </div>
    </div>
    <div class="sliders" data-role="scint-box">
      <div class="slider">
        <div class="slider-top"><span class="label">Scintillator</span></div>
        <div class="modes" role="group" aria-label="Scintillator">
          ${Object.entries(SCINT).map(([id, s]) => `<button type="button" data-scint="${id}">${s.name}</button>`).join("")}
        </div>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Light produced?</span><b data-role="r-light"></b></div>
      <div class="readout"><span>Separate reader?</span><b data-role="r-reader"></b></div>
      <div class="readout"><span>Signal in the central pixel</span><b data-role="r-centre"></b><span>the rest spreads to its neighbours</span></div>
      <div class="readout"><span>Sharpness</span><b data-role="r-sharp"></b></div>
    </div>
    <p class="summary" data-role="chain"></p>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = q => root.querySelector(`[data-role="${q}"]`);
  let mode = "cr", step = 0, scint = "csi";
  $("kinds").innerHTML = Object.entries(MODES).map(([id, m]) => `<button type="button" data-mode="${id}">${m.name}</button>`).join("");

  const spreadOf = () => MODES[mode].spread ?? SCINT[scint].spread;
  // Share of the signal in each pixel: a Gaussian of width σ (in pixels) around the centre, normalised.
  function shares() {
    const s = spreadOf(), mid = (PIX.n - 1) / 2;
    const w = Array.from({ length: PIX.n }, (_, i) => Math.exp(-((i - mid) ** 2) / (2 * s * s)));
    const sum = w.reduce((a, b) => a + b, 0);
    return w.map(v => v / sum);
  }

  function scene() {
    const s = $("scene"), m = MODES[mode], last = step === m.steps.length - 1;
    s.innerHTML = "";
    // Each layer is named to its right; a phone shows the short name.
    const layer = (y0, y1, cls, name, on, short = name) => {
      el("rect", { class: `det-layer ${cls}${on ? " on" : ""}`, x: X0, y: y0, width: X1 - X0, height: y1 - y0 }, s);
      const t = el("text", { class: "det-t", x: X1 + 8, y: (y0 + y1) / 2 + 4 }, s);
      el("tspan", { class: "wide-only" }, t).textContent = name;
      el("tspan", { class: "narrow-only" }, t).textContent = short;
    };
    const label = (x, y, text, anchor = "start") => { el("text", { class: "fxlabel", x, y, "text-anchor": anchor }, s).textContent = text; };
    const photonIn = yEnd => { el("path", { class: "photon", d: wavy(HIT, 6, HIT, yEnd, 4, 12) }, s); label(HIT + 12, 22, "X-ray photon"); };
    let hitY = 110, bottom = 170;

    if (mode === "cr") {
      layer(56, 66, "det-coat", "protective layer", false, "coat");
      layer(66, 150, "det-phosphor", "storage phosphor", step === 0 || step === 1, "phosphor");
      layer(150, 170, "det-support", "support", false);
      if (step === 0) { photonIn(hitY); for (let i = 0; i < 9; i++) el("circle", { class: "trap", cx: HIT - 16 + (i % 3) * 16, cy: hitY - 12 + Math.floor(i / 3) * 12, r: 3.2 }, s); label(HIT - 30, hitY + 34, "trapped electrons", "end"); }
      if (step >= 1 && step <= 3) {
        el("path", { class: "laser", d: `M${X0 - 40} 30 L${HIT} ${hitY}` }, s); label(X0 - 36, 24, "laser");
        el("path", { class: "light-ray", d: `M${HIT} ${hitY - 8} L${HIT + 110} 28` }, s);
        label(HIT + 66, 74, "light");
      }
      if (step >= 2 && step <= 3) { el("rect", { class: "det-box", x: HIT + 112, y: 8, width: 92, height: 34, rx: 6 }, s); label(HIT + 158, 30, "PMT", "middle"); }
      if (step === 4) { el("rect", { class: "erase", x: X0, y: 66, width: X1 - X0, height: 84 }, s); label(HIT, 40, "bright light erases the plate", "middle"); }
      bottom = 170;
    } else if (mode === "indirect") {
      const gos = scint === "gos";
      layer(56, 150, gos ? "det-scint-gos" : "det-scint", gos ? "Gd₂O₂S (powder)" : "CsI (needles)", step <= 1, gos ? "Gd₂O₂S" : "CsI");
      layer(150, 176, "det-asi", "a-Si photodiodes, TFTs", step >= 2, "a-Si, TFT");
      if (!gos) for (let x = X0 + 6; x < X1; x += 9) el("line", { class: "needle", x1: x, y1: 58, x2: x, y2: 148 }, s);
      else for (let i = 0; i < 160; i++) el("circle", { class: "grain", cx: X0 + 4 + ((i * 37) % (X1 - X0 - 8)), cy: 60 + ((i * 53) % 86), r: 1.6 }, s);
      photonIn(hitY);
      if (step >= 0) el("circle", { class: "flash", cx: HIT, cy: hitY, r: 7 }, s);
      if (step >= 1) {
        const half = spreadOf() * PIX.w * 1.4;
        el("path", { class: "light-cone", d: `M${HIT} ${hitY} L${HIT - half} 150 L${HIT + half} 150 Z` }, s);
        label(HIT - half - 8, 140, "light", "end");
      }
      bottom = 176;
    } else {
      layer(52, 60, "det-electrode", "top electrode", step === 0, "electrode");
      layer(60, 150, "det-se", "a-Se photoconductor", step === 1 || step === 2, "a-Se");
      layer(150, 176, "det-tft", "TFT charge collectors", step === 3, "TFTs");
      for (let x = X0 + 30; x < X1; x += 60) el("path", { class: "field", d: `M${x} 64 V146` }, s);
      if (step === 0) label(X0 + 4, 40, "electric field across the selenium");
      if (step >= 1) { photonIn(hitY); for (let i = 0; i < 6; i++) el("circle", { class: "e-dot", cx: HIT - 6 + (i % 2) * 12, cy: hitY + (step >= 2 ? 22 : 0) + Math.floor(i / 2) * 9 - 9, r: 4 }, s); }
      if (step >= 2) { el("path", { class: "drift", d: `M${HIT} ${hitY + 18} V148` }, s); label(HIT + 14, 136, "charge drifts straight down"); }
      bottom = 176;
    }

    // Pixel row and the share of the signal each pixel receives; shown once the signal reaches the pixels.
    const show = mode === "cr" ? step >= 3 : mode === "indirect" ? step >= 2 : step >= 2;
    const sh = shares();
    el("text", { class: "det-t", x: PIX.x0 - 8, y: PIX.y + 6, "text-anchor": "end" }, s).textContent = "pixels";
    sh.forEach((v, i) => {
      el("rect", { class: "pixel", x: pixX(i) + 1, y: PIX.y - 10, width: PIX.w - 2, height: 20, style: show ? `fill-opacity:${(0.12 + 0.88 * v / Math.max(...sh)).toFixed(2)}` : "" }, s);
      if (show) el("rect", { class: "pix-bar", x: pixX(i) + 4, y: PIX.y - 16 - 40 * v / Math.max(...sh) - 4, width: PIX.w - 8, height: 40 * v / Math.max(...sh) }, s);
    });
    if (mode !== "cr" || step >= 3) el("path", { class: "dec-nu", d: `M${HIT} ${bottom} V${PIX.y - 62}` }, s);
    if (show && last) label(pixX(PIX.n) + 8, PIX.y + 6, "→ pixel values");
  }

  function update() {
    const m = MODES[mode], n = m.steps.length;
    step = Math.min(step, n - 1);
    root.querySelectorAll("[data-mode]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === mode));
    root.querySelectorAll("[data-scint]").forEach(b => b.setAttribute("aria-pressed", b.dataset.scint === scint));
    $("scint-box").hidden = mode !== "indirect";
    $("count").textContent = `${m.full} · step ${step + 1} of ${n}`;
    $("dots").innerHTML = m.steps.map((_, i) => `<i${i <= step ? ' class="on"' : ""}></i>`).join("");
    $("cap-t").textContent = m.steps[step][0];
    $("cap-d").textContent = m.steps[step][1];
    $("back").disabled = step === 0;
    $("next").disabled = step === n - 1;
    const sh = shares(), centre = sh[(PIX.n - 1) / 2], s = spreadOf();
    $("r-light").textContent = m.light;
    $("r-reader").textContent = m.reader;
    $("r-centre").textContent = `${Math.round(centre * 100)}%`;
    $("r-sharp").textContent = s < 0.5 ? "Sharpest: no light spread" : s < 1 ? "Sharp: light guided" : s < 1.5 ? "Good: some laser-light scatter" : "Softer: light spreads";
    $("chain").textContent = m.chain;
    $("desc").textContent = `${m.full}, step ${step + 1}: ${m.steps[step][0]}. ${m.steps[step][1]}`;
    scene();
  }

  root.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => { mode = b.dataset.mode; step = 0; update(); }));
  root.querySelectorAll("[data-scint]").forEach(b => b.addEventListener("click", () => { scint = b.dataset.scint; update(); }));
  $("back").addEventListener("click", () => { step = Math.max(0, step - 1); update(); });
  $("next").addEventListener("click", () => { step++; update(); });
  update();
}

// It moves by itself (flowing photons or electrons), so the page offers a "Pause motion" button for it.
export const moving = true;
