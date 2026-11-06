// Explorer: the electronvolt. An electron accelerated across a chosen tube voltage gains that many electronvolts, so 80 kV
// gives 80 keV, the highest photon energy the tube can make. At the target about 99% becomes heat and about 1% X-rays.
// A prefix ladder below links the units used across the module (µGy, mSv, keV, kV, mA, MBq).
import { svgEl as el, wavy, reducedMotion, motionPaused } from "./util.js";

const EV = 1.602e-19;            // joules in one electronvolt
const CX = 96, AX = 544, Y = 120; // cathode and anode faces, and the electron's path
const PREFIXES = [
  { p: "µ", name: "micro", pow: -6, rel: "1 µGy is a millionth of a gray; 1,000 µGy make 1 mGy.", ex: "The dose reaching a detector for one image is a few microgray." },
  { p: "m", name: "milli", pow: -3, rel: "1 mSv is a thousandth of a sievert; 1,000 mSv make 1 Sv.", ex: "A chest X-ray is about 0.02 mSv; tube currents are set in milliamperes (mA)." },
  { p: "", name: "(none)", pow: 0, rel: "", ex: "V, A, Gy, Sv, Bq and J are the units themselves, before any prefix." },
  { p: "k", name: "kilo", pow: 3, rel: "1 keV is 1,000 eV; 1 kV is 1,000 V.", ex: "An 80 kV tube voltage gives electrons, and so photons, up to 80 keV." },
  { p: "M", name: "mega", pow: 6, rel: "1 MBq is 1,000,000 Bq: a million decays every second.", ex: "Nuclear medicine activities are given in megabecquerels." },
];
const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
const sup = n => String(n).split("").map(c => SUP[c]).join("");
const sci = x => { const e = Math.floor(Math.log10(x)); return `${(x / 10 ** e).toFixed(2)} × 10${sup(e)}`; };

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 640 250" role="img" aria-labelledby="ev-t ev-d">
      <title id="ev-t">An electron accelerated from cathode to anode</title>
      <desc id="ev-d" data-role="desc"></desc>
      <rect class="ev-gap" x="${CX}" y="40" width="${AX - CX}" height="160" rx="8"/>
      <rect class="ev-cathode" x="${CX - 22}" y="50" width="22" height="140" rx="4"/>
      <rect class="ev-anode" x="${AX}" y="50" width="22" height="140" rx="4"/>
      <text class="ev-sign" x="${CX - 11}" y="34">−</text>
      <text class="ev-sign" x="${AX + 11}" y="34">+</text>
      <text class="plane-t" x="${CX - 11}" y="218" text-anchor="middle">cathode</text>
      <text class="plane-t" x="${AX + 11}" y="218" text-anchor="middle">anode</text>
      <text class="pane-t" x="${(CX + AX) / 2}" y="26" data-role="kv-t"></text>
      <rect class="ev-track" x="${CX}" y="170" width="${AX - CX}" height="8" rx="4"/>
      <rect class="ev-fill" data-role="fill" x="${CX}" y="170" height="8" rx="4"/>
      <text class="plane-t" x="${CX + 4}" y="194" data-role="gain-t"></text>
      <g data-role="hit"></g>
      <circle class="electron" data-role="e" cy="${Y}" r="9"/>
      <text class="e-sign" data-role="e-s" y="${Y}">−</text>
    </svg>
    <p class="scale-note">Schematic · the gap is drawn wide · the electron starts at rest at the cathode</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><label for="ev-kv">Tube voltage</label><output for="ev-kv" data-role="kv-o"></output></div>
        <input type="range" id="ev-kv" min="1" max="150" step="1" value="80">
        <small>The potential difference the electron is accelerated through.</small>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Energy gained</span><b data-role="r-kev"></b><span data-role="r-ev"></span></div>
      <div class="readout"><span>In joules</span><b data-role="r-j"></b><span>1 eV = 1.6 × 10⁻¹⁹ J</span></div>
      <div class="readout"><span>Highest X-ray photon energy</span><b data-role="r-max"></b><span>all of one electron's energy</span></div>
      <div class="readout"><span>At the target</span><b>≈ 99% heat</b><span>≈ 1% X-rays</span></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
  </div>
</div>
<section class="prefix-box">
  <h3>Prefixes on the units</h3>
  <div class="modes" role="group" aria-label="Prefixes">${PREFIXES.map((x, i) => `<button type="button" data-p="${i}">${x.p || "–"} <span class="muted">${x.name}</span></button>`).join("")}</div>
  <p class="summary" data-role="prefix" aria-live="polite"></p>
</section>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const kvIn = root.querySelector("#ev-kv");
  let alive = true, pos = 0, last = performance.now(), timer = null;

  function update() {
    const kv = +kvIn.value, ev = kv * 1000, j = ev * EV;
    $("kv-o").textContent = `${kv} kV`;
    $("kv-t").textContent = `${kv} kV across the tube`;
    $("r-kev").textContent = `${kv} keV`;
    $("r-ev").textContent = `${ev.toLocaleString("en-GB")} eV`;
    $("r-j").textContent = `${sci(j)} J`;
    $("r-max").textContent = `${kv} keV`;
    const s = `Accelerated through ${kv} kV, each electron gains ${kv} keV (${ev.toLocaleString("en-GB")} eV, or ${sci(j)} J). ` +
      `That is the most energy one X-ray photon can carry, so the spectrum ends at ${kv} keV. Most of the energy becomes heat in the target.`;
    $("desc").textContent = s;
    clearTimeout(timer);
    timer = setTimeout(() => { $("summary").textContent = s; }, 250);
  }

  // The electron speeds up across the gap; the bar shows the energy it has gained so far. At the anode it gives up its energy,
  // nearly always as heat, and now and then as an X-ray photon.
  const hit = $("hit"), e = $("e"), es = $("e-s");
  let flashes = 0;
  function place(p) {
    const x = CX + 9 + p * (AX - CX - 18);
    e.setAttribute("cx", x.toFixed(1)); es.setAttribute("x", x.toFixed(1));
    $("fill").setAttribute("width", Math.max(0, p * (AX - CX)).toFixed(1));
    $("gain-t").textContent = `energy gained: ${Math.round(p * +kvIn.value)} keV`;
  }
  function arrive() {
    hit.innerHTML = "";
    flashes++;
    if (flashes % 5 === 0) {
      el("path", { class: "photon", d: wavy(AX, Y, AX - 120, Y + 70, 4, 11) }, hit);
      el("text", { class: "plane-t", x: AX - 130, y: Y + 92, "text-anchor": "middle" }, hit).textContent = "X-ray (≈ 1%)";
    } else {
      el("circle", { class: "ev-heat", cx: AX, cy: Y, r: 16 }, hit);
      el("text", { class: "plane-t", x: AX - 24, y: Y - 24, "text-anchor": "end" }, hit).textContent = "heat (≈ 99%)";
    }
  }
  function frame(now) {
    if (!alive) return;
    const dt = Math.min(50, now - last); last = now;
    if (!motionPaused()) {
      // Uniform field: constant acceleration, so position grows with time²; a higher voltage crosses faster.
      pos += dt * 0.0007 * Math.sqrt(+kvIn.value / 80);
      if (pos >= 1) { pos = 0; arrive(); }
      place(pos * pos);   // distance ∝ t², and energy ∝ distance in a uniform field
    }
    requestAnimationFrame(frame);
  }
  place(0);
  if (reducedMotion()) place(1); else requestAnimationFrame(frame);

  root.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => {
    const x = PREFIXES[+b.dataset.p];
    root.querySelectorAll("[data-p]").forEach(o => o.setAttribute("aria-pressed", o === b));
    $("prefix").innerHTML = `<b>${x.p ? `${x.p} (${x.name}) = × 10${sup(x.pow)}.` : "No prefix: × 1."}</b> ${x.rel} ${x.ex}`;
  }));
  root.querySelector('[data-p="1"]').click();
  kvIn.addEventListener("input", update);
  update();
  return () => { alive = false; clearTimeout(timer); };
}

// It moves by itself (flowing photons or electrons), so the page offers a "Pause motion" button for it.
export const moving = true;
