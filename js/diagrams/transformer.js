// Explorer: the transformer. An alternating current in the primary winding makes a changing magnetic field in the iron core,
// which induces an alternating voltage in the secondary. Vs ÷ Vp = Ns ÷ Np; in an ideal transformer power is unchanged,
// so the current changes the other way (lecture: X-ray Circuits, slides 7–9, 17–19).
import { svgEl as el } from "./util.js";

const RATIOS = [1 / 50, 1 / 20, 1 / 10, 1 / 5, 1 / 2, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
const PRESETS = {
  filament: { name: "Filament (step-down)", ratio: 1 / 20, vp: 230 },
  hv: { name: "High voltage (step-up)", ratio: 500, vp: 230 },
  same: { name: "1 : 1", ratio: 1, vp: 230 },
};
// Core and coils.
const CORE = { x0: 190, x1: 450, y0: 50, y1: 250, t: 34 };
const PRIMARY_DRAWN = 6;

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 640 300" role="img" aria-labelledby="tr-t tr-d">
      <title id="tr-t">A transformer: primary and secondary windings on an iron core</title>
      <desc id="tr-d" data-role="desc"></desc>
      <rect class="core" x="${CORE.x0}" y="${CORE.y0}" width="${CORE.x1 - CORE.x0}" height="${CORE.y1 - CORE.y0}" rx="6"/>
      <rect class="core-hole" x="${CORE.x0 + CORE.t}" y="${CORE.y0 + CORE.t}" width="${CORE.x1 - CORE.x0 - 2 * CORE.t}" height="${CORE.y1 - CORE.y0 - 2 * CORE.t}" rx="3"/>
      <path class="flux" d="M${CORE.x0 + CORE.t / 2} ${CORE.y0 + CORE.t / 2} H${CORE.x1 - CORE.t / 2} V${CORE.y1 - CORE.t / 2} H${CORE.x0 + CORE.t / 2} Z"/>
      <text class="fxlabel wide-only" x="320" y="${CORE.y0 + CORE.t + 26}" text-anchor="middle">changing magnetic</text>
      <text class="fxlabel wide-only" x="320" y="${CORE.y0 + CORE.t + 44}" text-anchor="middle">field in the iron core</text>
      <text class="fxlabel narrow-only" x="320" y="150" text-anchor="middle">magnetic field</text>
      <g data-role="coils"></g>
      <text class="pane-t" x="${CORE.x0 + CORE.t / 2}" y="28">Primary</text>
      <text class="pane-t" x="${CORE.x1 - CORE.t / 2}" y="28">Secondary</text>
      <g data-role="io"></g>
    </svg>
    <p class="scale-note">Schematic · not to scale · ideal transformer (no losses) · voltages are rms</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><span class="label">Transformer</span></div>
        <div class="modes" role="group" aria-label="Transformer presets">
          ${Object.entries(PRESETS).map(([id, p]) => `<button type="button" data-preset="${id}">${p.name}</button>`).join("")}
        </div>
      </div>
      <div class="slider">
        <div class="slider-top"><label for="tr-ratio">Turns ratio, secondary : primary</label><output for="tr-ratio" data-role="ratio-o"></output></div>
        <input type="range" id="tr-ratio" min="0" max="${RATIOS.length - 1}" step="1">
      </div>
      <div class="slider">
        <div class="slider-top"><label for="tr-vp">Primary voltage</label><output for="tr-vp" data-role="vp-o"></output></div>
        <input type="range" id="tr-vp" min="100" max="400" step="10">
        <small>Set by the autotransformer, which is how the kVp is selected.</small>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Secondary voltage</span><b data-role="r-vs"></b></div>
      <div class="readout"><span>Type</span><b data-role="r-type"></b></div>
      <div class="readout"><span>Secondary current</span><b data-role="r-is"></b><span>compared with the primary</span></div>
      <div class="readout"><span>Power</span><b>Unchanged</b><span>voltage × current is the same on both sides</span></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
    <div class="try">
      <h3>Try this</h3>
      <ol>
        <li><b>Choose High voltage.</b> 500 secondary turns for every primary turn lift 230 V to about 115 kV for the tube, and the current falls 500 times.</li>
        <li><b>Choose Filament.</b> The step-down transformer gives about 12 V and 20 times the current: enough to heat the filament.</li>
        <li><b>Move the primary voltage.</b> With the turns fixed, the output follows the input. That is how the autotransformer selects the kVp.</li>
      </ol>
    </div>
  </div>
</div>`;

const fmtV = v => v >= 1000 ? `${+(v / 1000).toFixed(v >= 10000 ? 0 : 1)} kV` : `${+v.toFixed(v < 10 ? 1 : 0)} V`;
const fmtRatio = r => r >= 1 ? `${r} : 1` : `1 : ${Math.round(1 / r)}`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = q => root.querySelector(`[data-role="${q}"]`);
  const ratioIn = root.querySelector("#tr-ratio"), vpIn = root.querySelector("#tr-vp");
  let summaryTimer = null;

  // A winding drawn as loops around one limb of the core. Turns beyond 30 are not drawn individually.
  function coil(g, xc, n) {
    const top = CORE.y0 + 18, bottom = CORE.y1 - 18, step = (bottom - top) / n, w = CORE.t / 2 + 10;
    let d = "";
    for (let i = 0; i < n; i++) {
      const y = top + i * step;
      d += `M${xc - w} ${(y).toFixed(1)} C${xc - w} ${(y - 6).toFixed(1)} ${xc + w} ${(y - 6).toFixed(1)} ${xc + w} ${(y + step / 2).toFixed(1)} `;
    }
    el("path", { class: "winding", d }, g);
  }

  function update() {
    const r = RATIOS[+ratioIn.value], vp = +vpIn.value, vs = vp * r;
    $("ratio-o").textContent = fmtRatio(r);
    $("vp-o").textContent = `${vp} V`;
    root.querySelectorAll("[data-preset]").forEach(b => { const p = PRESETS[b.dataset.preset]; b.setAttribute("aria-pressed", p.ratio === r && p.vp === vp); });

    const coils = $("coils");
    coils.innerHTML = "";
    const ns = Math.max(2, Math.min(30, Math.round(PRIMARY_DRAWN * r)));
    const np = r < 1 ? Math.max(PRIMARY_DRAWN, Math.min(30, Math.round(2 / r))) : PRIMARY_DRAWN;
    coil(coils, CORE.x0 + CORE.t / 2, r < 1 ? np : PRIMARY_DRAWN);
    coil(coils, CORE.x1 - CORE.t / 2, r < 1 ? 2 : ns);

    const io = $("io");
    io.innerHTML = "";
    const lead = (x1, x2, y) => el("path", { class: "lead-wire", d: `M${x1} ${y} H${x2}` }, io);
    lead(40, CORE.x0 - 14, 110); lead(40, CORE.x0 - 14, 190);
    lead(CORE.x1 + 14, 600, 110); lead(CORE.x1 + 14, 600, 190);
    const label = (x, y, text, anchor, wide = "") => {
      const t = el("text", { class: "fxlabel", x, y, "text-anchor": anchor }, io);
      t.textContent = text;
      if (wide) el("tspan", { class: "wide-only" }, t).textContent = wide;
    };
    label(40, 150, `${vp} V`, "start", " AC in");   // a phone shows just the voltages
    label(600, 150, fmtV(vs), "end", " AC out");
    label(CORE.x0 + CORE.t / 2, CORE.y1 + 28, r < 1 ? `${Math.round(1 / r)} × the turns` : r > 1 ? "fewer turns" : "same turns", "middle");
    label(CORE.x1 - CORE.t / 2, CORE.y1 + 28, r > 1 ? `${r} × the turns` : r < 1 ? "fewer turns" : "same turns", "middle");

    const type = r > 1 ? "Step-up" : r < 1 ? "Step-down" : "Isolation (1 : 1)";
    $("r-vs").textContent = fmtV(vs);
    $("r-type").textContent = type;
    $("r-is").textContent = r === 1 ? "The same" : r > 1 ? `÷ ${r}` : `× ${Math.round(1 / r)}`;

    const sentence = `${type} transformer, turns ratio ${fmtRatio(r)}: ${vp} V on the primary gives ${fmtV(vs)} on the secondary, ` +
      (r === 1 ? "with the same current." : r > 1 ? `and the current falls ${r} times, so the power stays the same.` : `and the current rises ${Math.round(1 / r)} times, so the power stays the same.`) +
      (r >= 200 ? " This is the high-voltage transformer that supplies the tube." : r <= 1 / 10 ? " This is the kind of transformer that supplies the filament." : "");
    $("desc").textContent = sentence;
    clearTimeout(summaryTimer);
    summaryTimer = setTimeout(() => { $("summary").textContent = sentence; }, 250);
  }

  const setTo = p => { ratioIn.value = RATIOS.indexOf(p.ratio); vpIn.value = p.vp; update(); };
  ratioIn.addEventListener("input", update);
  vpIn.addEventListener("input", update);
  root.querySelectorAll("[data-preset]").forEach(b => b.addEventListener("click", () => setTo(PRESETS[b.dataset.preset])));
  setTo(PRESETS.hv);
  return () => clearTimeout(summaryTimer);
}

// It moves by itself (flowing photons or electrons), so the page offers a "Pause motion" button for it.
export const moving = true;
