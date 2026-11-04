// Explorer: ESD and DAP. The exposure factors set the dose in the beam; collimation sets the field size. Opening the field leaves the
// skin dose unchanged but raises the dose–area product (DAP), which tracks the total radiation put into the patient. DAP is the
// same wherever it is measured along the beam: the dose falls with distance squared as the area grows with distance squared.
// ESD includes backscatter from the patient (×1.35 here); DAP is measured in the beam before it reaches the patient.
// The dose values and the reference level are illustrative, not a national DRL.
import { svgEl as el } from "./util.js";

const FSD = 80, FCD = 16;                    // focus to skin and focus to DAP chamber, cm
const BSF = 1.35;                            // backscatter factor
const DRL = 1.5;                             // illustrative reference level, Gy cm²
const FY = 30, SKY = 270, PX = 260;          // focal spot and skin in the drawing; beam axis at x = PX
const yAt = d => FY + (d / FSD) * (SKY - FY);
const half = (d, side) => (side / 2) * (d / FSD) * 4.6;   // drawn half-width of the beam at distance d for a field `side` cm at the skin

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 640 330" role="img" aria-labelledby="dap-t dap-d">
      <title id="dap-t">Side view of the beam from the tube, through the DAP chamber, to the patient</title>
      <desc id="dap-d" data-role="desc"></desc>
      <polygon class="beam" data-role="beam"/>
      <rect class="dap-coll" data-role="coll-l" height="10"/><rect class="dap-coll" data-role="coll-r" height="10"/>
      <rect class="dap-chamber" x="${PX - 110}" y="${yAt(FCD) - 7}" width="220" height="14" rx="4"/>
      <text class="plane-t" x="${PX + 120}" y="${yAt(FCD) + 4}">DAP meter</text>
      <rect class="dap-patient" x="${PX - 200}" y="${SKY}" width="400" height="44" rx="14"/>
      <text class="plane-t" x="${PX + 120}" y="${SKY - 8}">skin: ESD</text>
      <circle class="source" cx="${PX}" cy="${FY}" r="7"/>
      <text class="plane-t" x="${PX + 14}" y="${FY + 4}">focal spot</text>
      <line class="dap-plane" data-role="plane" x1="${PX - 210}" x2="${PX + 210}"/>
    </svg>
    <p class="scale-note">Schematic, not to scale · focus–skin ${FSD} cm, DAP meter ${FCD} cm from the focus · illustrative doses and reference level</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><label for="dap-e">Exposure (mAs)</label><output for="dap-e" data-role="e-o"></output></div>
        <input type="range" id="dap-e" min="0.5" max="2" step="0.25" value="1">
        <small>Sets the dose in the beam.</small>
      </div>
      <div class="slider">
        <div class="slider-top"><label for="dap-s">Field size at the skin</label><output for="dap-s" data-role="s-o"></output></div>
        <input type="range" id="dap-s" min="10" max="40" step="1" value="24">
        <small>Collimation: a square field, for simplicity.</small>
      </div>
      <div class="slider">
        <div class="slider-top"><span class="label">Measure dose × area at</span></div>
        <div class="modes" role="group" aria-label="Measuring plane"><button type="button" data-at="${FCD}">The DAP meter</button><button type="button" data-at="${FSD}">The skin</button></div>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Dose at this plane</span><b data-role="r-dose"></b></div>
      <div class="readout"><span>Beam area at this plane</span><b data-role="r-area"></b></div>
      <div class="readout"><span>DAP</span><b data-role="r-dap"></b><span data-role="r-drl"></span></div>
      <div class="readout"><span>ESD</span><b data-role="r-esd"></b><span>includes backscatter</span></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const eIn = root.querySelector("#dap-e"), sIn = root.querySelector("#dap-s");
  let at = FCD, timer = null;
  const set = (n, a) => Object.entries(a).forEach(([k, v]) => n.setAttribute(k, typeof v === "number" ? v.toFixed(1) : v));

  function update() {
    const e = +eIn.value, side = +sIn.value, skin = 2 * e;          // incident air kerma at the skin, mGy
    const dose = skin * (FSD / at) ** 2, sideAt = side * (at / FSD), area = sideAt ** 2;
    const dap = (skin / 1000) * side * side;                        // Gy cm², the same at any plane
    root.querySelectorAll("[data-at]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.at === at));
    $("e-o").textContent = `× ${e}`;
    $("s-o").textContent = `${side} × ${side} cm`;
    const hs = half(FSD, side), hc = half(FCD * 0.55, side);   // the collimator blades sit above the DAP meter
    set($("beam"), { points: `${PX},${FY} ${PX - hs},${SKY} ${PX + hs},${SKY}` });
    set($("coll-l"), { x: PX - hc - 60, y: yAt(FCD * 0.55) - 5, width: 60 });
    set($("coll-r"), { x: PX + hc, y: yAt(FCD * 0.55) - 5, width: 60 });
    set($("plane"), { y1: yAt(at), y2: yAt(at) });
    $("r-dose").textContent = `${+dose.toFixed(1)} mGy`;
    $("r-area").textContent = `${+area.toFixed(1)} cm²`;
    $("r-dap").textContent = `${dap.toFixed(2)} Gy cm²`;
    $("r-drl").textContent = dap > DRL ? `above the reference level (${DRL})` : `within the reference level (${DRL})`;
    $("r-esd").textContent = `${(skin * BSF).toFixed(1)} mGy`;
    const s = `The exposure gives ${skin.toFixed(1)} mGy in the beam at the skin (an ESD of ${(skin * BSF).toFixed(1)} mGy with backscatter). ` +
      `With a ${side} × ${side} cm field the DAP is ${dap.toFixed(2)} Gy cm². ` +
      `At the ${at === FCD ? "DAP meter the dose is higher but the beam is smaller" : "skin the dose is lower but the beam is larger"}: ${+dose.toFixed(1)} mGy × ${+area.toFixed(1)} cm² gives the same DAP. ` +
      (side >= 30 ? "Opening the field hasn't changed the skin dose, but far more tissue is irradiated: the DAP shows it." : "");
    $("desc").textContent = s;
    clearTimeout(timer);
    timer = setTimeout(() => { $("summary").textContent = s; }, 250);
  }
  root.querySelectorAll("[data-at]").forEach(b => b.addEventListener("click", () => { at = +b.dataset.at; update(); }));
  eIn.addEventListener("input", update); sIn.addEventListener("input", update);
  update();
  return () => clearTimeout(timer);
}
