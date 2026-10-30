// Explorer: the X-ray spectrum. Sliders for kV, mA and filtration drive a live photon-number spectrum.
import { svgEl as el } from "./util.js";

// Aluminium mass attenuation coefficients (cm²/g), NIST XCOM; log-log interpolation.
const AL = [[10, 26.2], [15, 7.96], [20, 3.44], [30, 1.128], [40, 0.5685], [50, 0.3681], [60, 0.2778], [80, 0.2018], [100, 0.1704], [150, 0.1378]];
function muAl(E) {
  if (E <= 10) return AL[0][1] * Math.pow(E / 10, -3);
  for (let i = 1; i < AL.length; i++) if (E <= AL[i][0]) {
    const [a, fa] = AL[i - 1], [b, fb] = AL[i], t = Math.log(E / a) / Math.log(b / a);
    return Math.exp(Math.log(fa) + t * Math.log(fb / fa));
  }
  return AL[AL.length - 1][1];
}
const K_EDGE = 69.5, KA = 59, KB = 67.5, DE = 0.5, EMAX = 150;

// Kramers' continuum N(E) ∝ mA·(kV − E)/E, filtered by aluminium, plus tungsten K-lines above the K-edge.
function spectrum(kV, mA, mmAl) {
  const pts = [];
  for (let E = DE; E <= EMAX + 1e-9; E += DE) {
    let n = E < kV ? (mA * (kV - E)) / E : 0;
    if (kV > K_EDGE) {
      const s = mA * 3.6 * Math.pow((kV - K_EDGE) / K_EDGE, 1.6);
      if (Math.abs(E - KA) < 0.01) n += s;
      if (Math.abs(E - KB) < 0.01) n += s * 0.25;
    }
    pts.push([E, n * Math.exp(-muAl(E) * 2.7 * (mmAl / 10))]);
  }
  return pts;
}
const REF = Math.max(...spectrum(70, 200, 2.5).map(p => p[1])) / 100;   // 70 kV, 200 mA, 2.5 mm Al peaks at 100
const relSpectrum = (k, m, f) => spectrum(k, m, f).map(([E, v]) => [E, v / REF]);
const stats = pts => {
  let tot = 0, w = 0, mx = 0;
  for (const [E, v] of pts) { tot += v; w += E * v; mx = Math.max(mx, v); }
  return { tot, mean: tot ? w / tot : 0, max: mx };
};

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 640 370" role="img" aria-labelledby="spec-t spec-d">
      <title id="spec-t">X-ray spectrum graph</title>
      <desc id="spec-d" data-role="desc">Relative number of photons plotted against photon energy in keV.</desc>
      <g class="axis" data-role="axes"></g>
      <path class="pinned" data-role="pinned" d=""/>
      <path class="spec-area" data-role="area" d=""/>
      <path class="curve" data-role="curve" d=""/>
      <line class="kvline" data-role="kvline" x1="0" y1="20" x2="0" y2="310"/>
      <text class="kvlabel" data-role="kvlabel" x="0" y="16"></text>
      <g data-role="linelabels"></g>
      <g data-role="meanmark"><polygon class="meanmark" points="0,0 0,0 0,0"/><text class="meanlabel" x="0" y="0"></text></g>
    </svg>
    <div class="legend"><span><i></i>current settings</span><span data-role="legend-pin" hidden><i class="dash"></i>pinned for comparison</span></div>
    <p class="scale-note">Illustrative: tungsten target, constant-potential generator. The vertical scale adjusts itself, so read the axis numbers when comparing.</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><label for="spec-kv">Tube voltage</label><output for="spec-kv" data-role="kv-o">80 kVp</output></div>
        <input type="range" id="spec-kv" min="40" max="150" step="1" value="80">
        <small>Sets the energy of each electron, so the highest photon energy.</small>
      </div>
      <div class="slider">
        <div class="slider-top"><label for="spec-ma">Tube current</label><output for="spec-ma" data-role="ma-o">200 mA</output></div>
        <input type="range" id="spec-ma" min="50" max="500" step="25" value="200">
        <small>Sets how many electrons cross the tube each second.</small>
      </div>
      <div class="slider">
        <div class="slider-top"><label for="spec-fl">Total filtration</label><output for="spec-fl" data-role="fl-o">2.5 mm Al</output></div>
        <input type="range" id="spec-fl" min="1" max="6" step="0.5" value="2.5">
        <small>Inherent plus added filtration, in aluminium equivalent.</small>
      </div>
      <div class="controls">
        <button type="button" data-role="pin">Pin for comparison</button>
        <button type="button" data-role="unpin" disabled>Clear pinned</button>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Maximum photon energy</span><b data-role="r-max"></b></div>
      <div class="readout"><span>Mean photon energy</span><b data-role="r-mean"></b></div>
      <div class="readout"><span>Characteristic K-lines</span><b data-role="r-lines"></b></div>
      <div class="readout"><span>Photons vs pinned</span><b data-role="r-pin">–</b></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
    <div class="try">
      <h3>Try this</h3>
      <ol>
        <li><b>Drop the kVp below 70.</b> The sharp lines vanish: electrons no longer carry the 69.5 keV needed to eject a tungsten K-shell electron.</li>
        <li><b>Pin, then double the mA.</b> Same shape and same maximum energy, twice the photons.</li>
        <li><b>Pin, then add filtration.</b> The low-energy end is cut away, the mean energy rises and there are fewer photons overall. This is beam hardening.</li>
      </ol>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const kv = root.querySelector("#spec-kv"), ma = root.querySelector("#spec-ma"), fl = root.querySelector("#spec-fl");

  const PX0 = 60, PX1 = 620, PY0 = 26, PY1 = 310;
  const sx = E => PX0 + (E / EMAX) * (PX1 - PX0);
  let yMax = 100;
  const sy = v => PY1 - (v / yMax) * (PY1 - PY0);
  const NICE = []; for (let p = 0; p <= 4; p++) for (const m of [1, 2, 5]) NICE.push(m * 10 ** p);
  const toPath = pts => pts.map(([E, v], i) => `${i ? "L" : "M"}${sx(E).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");

  const axes = $("axes");
  function drawAxes() {
    axes.innerHTML = "";
    for (let E = 0; E <= EMAX; E += 25) {
      el("line", { class: "grid-l", x1: sx(E), y1: PY0, x2: sx(E), y2: PY1 }, axes);
      el("text", { x: sx(E), y: PY1 + 18, "text-anchor": "middle" }, axes).textContent = E;
    }
    for (let i = 0; i <= 4; i++) {
      const v = (yMax * i) / 4, y = sy(v);
      el("line", { class: "grid-l", x1: PX0, y1: y, x2: PX1, y2: y }, axes);
      el("text", { x: PX0 - 8, y: y + 4, "text-anchor": "end" }, axes).textContent = yMax < 20 ? +v.toFixed(1) : Math.round(v);
    }
    el("path", { d: `M${PX0} ${PY0} V${PY1} H${PX1}`, fill: "none" }, axes);
    el("text", { class: "ax-title", x: (PX0 + PX1) / 2, y: PY1 + 44, "text-anchor": "middle" }, axes).textContent = "Photon energy (keV)";
    el("text", { class: "ax-title", x: 14, y: (PY0 + PY1) / 2, "text-anchor": "middle", transform: `rotate(-90 14 ${(PY0 + PY1) / 2})` }, axes).textContent = "Relative number of photons";
  }

  let pinned = null, summaryTimer = null;
  function update() {
    const K = +kv.value, M = +ma.value, F = +fl.value;
    $("kv-o").textContent = `${K} kVp`;
    $("ma-o").textContent = `${M} mA`;
    $("fl-o").textContent = `${F.toFixed(1)} mm Al`;

    const pts = relSpectrum(K, M, F), s = stats(pts);
    const need = Math.max(s.max, pinned ? pinned.stats.max : 0) * 1.08;
    if (need > yMax || need < yMax * 0.3) yMax = NICE.find(n => n >= need) || NICE[NICE.length - 1];
    drawAxes();

    $("curve").setAttribute("d", toPath(pts));
    $("area").setAttribute("d", `${toPath(pts)} L${sx(EMAX)} ${PY1} L${sx(DE)} ${PY1} Z`);
    $("pinned").setAttribute("d", pinned ? toPath(pinned.pts) : "");
    $("legend-pin").hidden = !pinned;

    const x = sx(K), kvlabel = $("kvlabel");
    $("kvline").setAttribute("x1", x); $("kvline").setAttribute("x2", x);
    kvlabel.setAttribute("x", Math.min(x, PX1 - 4)); kvlabel.setAttribute("text-anchor", x > PX1 - 90 ? "end" : "middle");
    kvlabel.textContent = `max = ${K} keV`;

    const lineLabels = $("linelabels");
    lineLabels.innerHTML = "";
    const hasLines = K > K_EDGE;
    if (hasLines) {
      const va = pts.find(p => Math.abs(p[0] - KA) < 0.01)[1], vb = pts.find(p => Math.abs(p[0] - KB) < 0.01)[1];
      el("text", { class: "linelabel", x: sx(KA) - 6, y: Math.max(sy(va) - 6, PY0 + 12), "text-anchor": "end" }, lineLabels).textContent = "Kα";
      el("text", { class: "linelabel", x: sx(KB) + 6, y: Math.max(sy(vb) - 6, PY0 + 12) }, lineLabels).textContent = "Kβ";
    }

    const mx = sx(s.mean), meanG = $("meanmark"), mt = meanG.querySelector("text");
    meanG.querySelector("polygon").setAttribute("points", `${mx},${PY1 - 1} ${mx - 6},${PY1 - 11} ${mx + 6},${PY1 - 11}`);
    mt.setAttribute("x", mx); mt.setAttribute("y", PY1 - 15); mt.setAttribute("text-anchor", "middle"); mt.textContent = "mean";

    $("r-max").textContent = `${K} keV`;
    $("r-mean").textContent = `≈ ${Math.round(s.mean)} keV`;
    $("r-lines").innerHTML = hasLines ? '<span class="pill yes">Present</span>' : '<span class="pill no">Absent</span>';
    $("r-pin").textContent = pinned ? `× ${(s.tot / pinned.stats.tot).toFixed(2)}` : "–";

    const frac = s.mean / K;
    const sentence = `At ${K} kVp, ${M} mA and ${F.toFixed(1)} mm Al the highest photon energy is ${K} keV and the mean is about ${Math.round(s.mean)} keV (${frac < 0.42 ? "a little under" : frac > 0.58 ? "a little over" : "about"} half the kVp). ` +
      (hasLines
        ? "Tungsten's K-characteristic lines appear at about 59 keV (Kα) and 67 keV (Kβ), because the electrons now carry more than the 69.5 keV needed to eject a K-shell electron."
        : "There are no K-characteristic lines: the electrons carry less than the 69.5 keV needed to eject a tungsten K-shell electron.");
    clearTimeout(summaryTimer);
    summaryTimer = setTimeout(() => { $("summary").textContent = sentence; }, 250);
    $("desc").textContent = "Relative number of photons against photon energy. " + sentence;
  }
  [kv, ma, fl].forEach(i => i.addEventListener("input", update));
  const pinBtn = $("pin"), unpinBtn = $("unpin");
  pinBtn.addEventListener("click", () => {
    const pts = relSpectrum(+kv.value, +ma.value, +fl.value);
    pinned = { pts, stats: stats(pts) };
    unpinBtn.disabled = false; pinBtn.textContent = "Re-pin current"; update();
  });
  unpinBtn.addEventListener("click", () => { pinned = null; unpinBtn.disabled = true; pinBtn.textContent = "Pin for comparison"; update(); });
  update();

  return () => clearTimeout(summaryTimer);
}
