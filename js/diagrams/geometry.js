// Explorer: focal spot and geometry. Rays from each edge of the focal spot pass the edges of an object and land on the
// detector: the full shadow (umbra) is edged by a part-shadow (penumbra), the geometric unsharpness.
//   magnification M = FRD ÷ (FRD − ORD);  penumbra = focal spot × ORD ÷ (FRD − ORD)
// (lecture: Modifying Exposure, slides 6–7; Exposure, slides 19–20). The focal spot is drawn 30 times larger than the
// object scale so the penumbra can be seen; the readouts use the true sizes.
import { svgEl as el } from "./util.js";

const OBJECT_MM = 40;                    // a 40 mm object, such as a small bone
const PX_PER_MM = 3;                     // horizontal drawing scale
const SPOT_X = 30;                       // focal spot exaggeration; keeps the drawn spot narrower than the object, as it is in reality
const CX = 230, YD = 282, V = 225 / 180;  // centre line, detector height (fixed: the tube moves), px per cm vertically
const SPOTS = { fine: 0.6, broad: 1.2 };

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 640 320" role="img" aria-labelledby="geo-t geo-d">
      <title id="geo-t">Focal spot, object and detector, with the umbra and penumbra of the object's shadow</title>
      <desc id="geo-d" data-role="desc"></desc>
      <g data-role="scene"></g>
    </svg>
    <p class="legend"><span><i class="umbra-key"></i>umbra: full shadow</span><span><i class="penumbra-key"></i>penumbra: part shadow</span><span><i class="dash geo"></i>rays from the edges of the focal spot</span></p>
    <p class="scale-note">Schematic · the focal spot is drawn 30 times larger than the object so the penumbra shows · readouts use true sizes</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><span class="label">Focal spot</span></div>
        <div class="modes" role="group" aria-label="Focal spot">
          <button type="button" data-spot="fine">Fine, 0.6 mm</button>
          <button type="button" data-spot="broad">Broad, 1.2 mm</button>
        </div>
      </div>
      <div class="slider">
        <div class="slider-top"><label for="geo-ord">Object–receptor distance (ORD)</label><output for="geo-ord" data-role="ord-o"></output></div>
        <input type="range" id="geo-ord" min="0" max="30" step="1">
      </div>
      <div class="slider">
        <div class="slider-top"><label for="geo-frd">Focus–receptor distance (FRD)</label><output for="geo-frd" data-role="frd-o"></output></div>
        <input type="range" id="geo-frd" min="90" max="180" step="5">
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Penumbra (geometric unsharpness)</span><b data-role="r-pen"></b><span>at each edge</span></div>
      <div class="readout"><span>Magnification</span><b data-role="r-mag"></b><span data-role="r-size"></span></div>
      <div class="readout"><span>Sharpness</span><b data-role="r-sharp"></b></div>
      <div class="readout"><span>mAs needed</span><b data-role="r-mas"></b><span>compared with 100 cm (inverse square law)</span></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
    <div class="try">
      <h3>Try this</h3>
      <ol>
        <li><b>Raise the ORD.</b> The shadow grows (magnification) and its edges blur (penumbra): keep the part close to the detector.</li>
        <li><b>Switch to the broad focus.</b> The penumbra doubles. The fine focus gives sharper detail but takes less tube loading.</li>
        <li><b>Set the ORD to 0.</b> With the object on the detector there is no penumbra and no magnification, whatever the focal spot.</li>
        <li><b>Lengthen the FRD.</b> Rays become closer to parallel, so both magnification and penumbra fall, but the mAs must rise to keep the same exposure. A chest X-ray at 180 cm uses this to keep the heart's size true.</li>
      </ol>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = q => root.querySelector(`[data-role="${q}"]`);
  const ordIn = root.querySelector("#geo-ord"), frdIn = root.querySelector("#geo-frd");
  let spot = "broad", summaryTimer = null;

  function update() {
    const f = SPOTS[spot], ord = +ordIn.value, frd = +frdIn.value, fod = frd - ord;
    const mag = frd / fod, pen = (f * ord) / fod;   // mm: ORD ÷ FOD has no units
    $("ord-o").textContent = `${ord} cm`;
    $("frd-o").textContent = `${frd} cm`;
    root.querySelectorAll("[data-spot]").forEach(b => b.setAttribute("aria-pressed", b.dataset.spot === spot));

    // Geometry in drawing units: focal spot half-width s, object half-width o, heights in px.
    const s = (f * SPOT_X * PX_PER_MM) / 2, o = (OBJECT_MM * PX_PER_MM) / 2;
    const yD = YD, YF = yD - frd * V, yO = yD - ord * V, k = (yD - yO) / (yO - YF || 1);
    // Where a ray from the spot edge at sx, through the object edge at ox, meets the detector.
    const hit = (sx, ox) => ox + (ox - sx) * k;
    const umbraL = hit(-s, -o), outerL = hit(s, -o), umbraR = hit(s, o), outerR = hit(-s, o);

    const g = $("scene");
    g.innerHTML = "";
    const label = (x, y, text, anchor = "start", cls = "fxlabel") => { el("text", { class: cls, x, y, "text-anchor": anchor }, g).textContent = text; };
    // Rays
    [[-s, -o, umbraL], [s, -o, outerL], [s, o, umbraR], [-s, o, outerR]].forEach(([sx, ox, dx]) =>
      el("path", { class: "geo-ray", d: `M${CX + sx} ${YF} L${CX + ox} ${yO} L${CX + dx} ${yD}` }, g));
    // Focal spot, object, detector
    el("rect", { class: "geo-spot", x: CX - s, y: YF - 6, width: 2 * s, height: 6 }, g);
    label(CX, YF - 14, `focal spot (${f} mm)`, "middle");
    el("rect", { class: "geo-object", x: CX - o, y: yO - 6, width: 2 * o, height: 6 }, g);
    if (ord >= 4) label(CX - o - 8, yO - 1, "object", "end");
    el("line", { class: "geo-detector", x1: 20, y1: yD + 1, x2: 430, y2: yD + 1 }, g);
    label(20, yD + 26, "detector");
    // Shadow on the detector
    el("rect", { class: "geo-penumbra", x: CX + outerL, y: yD + 2, width: Math.max(0, umbraL - outerL), height: 10 }, g);
    el("rect", { class: "geo-penumbra", x: CX + umbraR, y: yD + 2, width: Math.max(0, outerR - umbraR), height: 10 }, g);
    el("rect", { class: "geo-umbra", x: CX + umbraL, y: yD + 2, width: Math.max(0, umbraR - umbraL), height: 10 }, g);
    // Dimension lines on the right
    // Dimension lines: ORD just right of the drawing, labelled outward; FRD at the far right, labelled inward, so neither line crosses a label.
    const dim = (x, y1, y2, text, side) => {
      el("path", { class: "geo-dim", d: `M${x - 5} ${y1} H${x + 5} M${x} ${y1} V${y2} M${x - 5} ${y2} H${x + 5}` }, g);
      label(side === "right" ? x + 12 : x - 12, (y1 + y2) / 2 + 4, text, side === "right" ? "start" : "end");
    };
    dim(626, YF, yD, `FRD ${frd} cm`, "left");
    if (ord > 0) dim(445, yO, yD, `ORD ${ord} cm`, "right");

    const sharp = pen < 0.05 ? "Very sharp" : pen < 0.15 ? "Sharp" : pen < 0.3 ? "Some blur at edges" : "Visibly unsharp";
    $("r-pen").textContent = ord === 0 ? "None" : `${pen < 0.1 ? pen.toFixed(3) : pen.toFixed(2)} mm`;
    $("r-mag").textContent = `× ${mag.toFixed(2)}`;
    $("r-size").textContent = `a ${OBJECT_MM} mm object images at ${(OBJECT_MM * mag).toFixed(1)} mm`;
    $("r-sharp").textContent = sharp;
    $("r-mas").textContent = `× ${((frd / 100) ** 2).toFixed(2)}`;

    const sentence = `Focal spot ${f} mm, ORD ${ord} cm, FRD ${frd} cm: magnification ${mag.toFixed(2)}, ` +
      (ord === 0 ? "and no penumbra, because the object is on the detector." : `and a penumbra of ${pen < 0.1 ? pen.toFixed(3) : pen.toFixed(2)} mm at each edge.`);
    $("desc").textContent = sentence;
    clearTimeout(summaryTimer);
    summaryTimer = setTimeout(() => { $("summary").textContent = sentence; }, 250);
  }

  root.querySelectorAll("[data-spot]").forEach(b => b.addEventListener("click", () => { spot = b.dataset.spot; update(); }));
  ordIn.addEventListener("input", update);
  frdIn.addEventListener("input", update);
  ordIn.value = 10; frdIn.value = 100;
  update();
  return () => clearTimeout(summaryTimer);
}
