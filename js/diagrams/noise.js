// Explorer: quantum noise and DQE. Each pixel's count of absorbed photons varies at random (Poisson: the spread is the square root
// of the mean), so the signal-to-noise ratio rises with the square root of the photons absorbed. Processing sets the brightness,
// so a low dose shows as noise, not as a darker image. A detector with a higher DQE absorbs and uses more of the photons that reach
// it, so it reaches the same SNR with less dose. Photon numbers and DQE values are illustrative.
import { W, H, limb, grain } from "./limb.js";

const DETECTORS = { a: { name: "Higher DQE", dqe: 0.6 }, b: { name: "Lower DQE", dqe: 0.3 } };
const DOSES = [0.25, 0.5, 1, 2, 4];             // relative to the usual exposure
const N0 = 300;                                  // photons per pixel reaching the detector through soft tissue at dose 1 (illustrative)
const TISSUE = Math.exp(-2.6 * 0.44);            // transmission through muscle, the reference for the readouts

const MARKUP = `
<div class="grid">
  <div class="stage">
    <canvas class="xray" width="${W}" height="${H}" data-role="img"></canvas>
    <p class="scale-note">Simulated · cartoon limb, not a patient · brightness set by processing, as on a real system · illustrative photon numbers and DQE values</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><label for="nz-d">Dose (mAs)</label><output for="nz-d" data-role="d-o"></output></div>
        <input type="range" id="nz-d" min="0" max="${DOSES.length - 1}" step="1" value="2">
        <small>Relative to the usual exposure for this examination.</small>
      </div>
      <div class="slider">
        <div class="slider-top"><span class="label">Detector</span></div>
        <div class="modes" role="group" aria-label="Detector">${Object.entries(DETECTORS).map(([id, x]) => `<button type="button" data-det="${id}">${x.name} (${x.dqe})</button>`).join("")}</div>
      </div>
      <div class="controls"><button type="button" data-role="match">Same image, other detector</button></div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Photons absorbed per pixel</span><b data-role="r-n"></b><span>in soft tissue</span></div>
      <div class="readout"><span>Signal-to-noise ratio</span><b data-role="r-snr"></b><span>√ photons absorbed</span></div>
      <div class="readout"><span>Patient dose</span><b data-role="r-dose"></b><span>relative to usual</span></div>
      <div class="readout"><span>Image</span><b data-role="r-q"></b></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const dIn = root.querySelector("#nz-d");
  const ctx = $("img").getContext("2d"), pix = ctx.createImageData(W, H);
  const T = limb().map(w => Math.exp(-2.6 * w)), noise = grain(9);
  let det = "a", timer = null;

  function update() {
    const dose = DOSES[+dIn.value], q = DETECTORS[det].dqe;
    root.querySelectorAll("[data-det]").forEach(b => b.setAttribute("aria-pressed", b.dataset.det === det));
    // Photons absorbed in each pixel: mean N, spread √N. Shown on a scale set by the mean through soft tissue, as processing would.
    const k = N0 / TISSUE * dose * q, ref = N0 * dose * q, d = pix.data;
    for (let i = 0; i < W * H; i++) {
      const mean = k * T[i], n = Math.max(0, mean + Math.sqrt(mean) * noise[i]);
      const g = Math.round(Math.max(0, Math.min(1, 1 - (n / ref) * 0.42)) * 255);   // soft tissue mid-grey, air dark, bone light
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = g; d[i * 4 + 3] = 255;
    }
    ctx.putImageData(pix, 0, 0);
    const n = ref, snr = Math.sqrt(n);
    $("d-o").textContent = `× ${dose}`;
    $("r-n").textContent = Math.round(n);
    $("r-snr").textContent = snr.toFixed(1);
    $("r-dose").textContent = `× ${dose}`;
    $("r-q").textContent = snr >= 12 ? "Clean" : snr >= 8 ? "Some mottle" : "Grainy";
    const other = det === "a" ? "b" : "a", need = dose * (q / DETECTORS[other].dqe);
    $("match").textContent = `Same image on the ${DETECTORS[other].name.toLowerCase()} detector`;
    $("match").disabled = !DOSES.includes(need);
    const s = `${DETECTORS[det].name} detector (DQE ${q}) at ${dose} × the usual dose: about ${Math.round(n)} photons absorbed per pixel in soft tissue, so the signal-to-noise ratio is about ${snr.toFixed(1)}. ` +
      (snr < 8 ? "The image is grainy: processing has set the brightness, but it can't put back the information the missing photons would have carried. "
        : snr < 12 ? "Quantum mottle is visible in the soft tissue. " : "The image is clean. ") +
      `The ${DETECTORS[other].name.toLowerCase()} detector would need ${+need.toFixed(2)} × the dose for the same image.`;
    $("img").setAttribute("aria-label", `Simulated limb image. ${s}`);
    clearTimeout(timer);
    timer = setTimeout(() => { $("summary").textContent = s; }, 250);
  }

  $("match").addEventListener("click", () => {
    const q = DETECTORS[det].dqe; det = det === "a" ? "b" : "a";
    const need = DOSES[+dIn.value] * (q / DETECTORS[det].dqe), i = DOSES.indexOf(need);
    if (i >= 0) dIn.value = i;
    update();
  });
  root.querySelectorAll("[data-det]").forEach(b => b.addEventListener("click", () => { det = b.dataset.det; update(); }));
  dIn.addEventListener("input", update);
  update();
  return () => clearTimeout(timer);
}
