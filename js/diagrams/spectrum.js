// Explorer: the X-ray spectrum. Target material, generator type, kVp, mA and filtration drive a live photon-number spectrum,
// with its quantity (the area under the curve) and quality (the mean photon energy) read out separately
// (lecture: X-ray Spectrum). Illustrative, but right in its trends:
//   Bremsstrahlung (Kramers) N(E) ∝ Z · mA · (V − E) ÷ E, worked out across the generator's voltage waveform;
//   K-lines appear only while the voltage exceeds the target's K-edge; filtration follows NIST attenuation data.
import { svgEl as el } from "./util.js";

// Mass attenuation coefficients (cm²/g), approximate NIST XCOM values; log-log interpolation between points.
const AL = [[10, 26.2], [15, 7.96], [20, 3.44], [30, 1.128], [40, 0.5685], [50, 0.3681], [60, 0.2778], [80, 0.2018], [100, 0.1704], [150, 0.1378]];
const MO_BELOW = [[5, 543], [10, 83.8], [15, 28.0], [20, 12.9]];                                   // below the 20.0 keV K-edge
const MO_ABOVE = [[20, 79.0], [25, 45.0], [30, 27.3], [40, 12.6], [50, 6.9], [60, 4.2], [80, 1.92], [100, 1.08], [150, 0.48]];
function interp(table, E) {
  if (E <= table[0][0]) return table[0][1] * Math.pow(E / table[0][0], -3);
  for (let i = 1; i < table.length; i++) if (E <= table[i][0]) {
    const [a, fa] = table[i - 1], [b, fb] = table[i], t = Math.log(E / a) / Math.log(b / a);
    return Math.exp(Math.log(fa) + t * Math.log(fb / fa));
  }
  return table[table.length - 1][1];
}
const muAl = E => interp(AL, E);
const muMo = E => (E < 20 ? interp(MO_BELOW, E) : interp(MO_ABOVE, E));
const RHO = { al: 2.7, mo: 10.22 };   // g/cm³

// Targets: atomic number, K-edge and K-lines (keV). Line strength is illustrative.
const TARGETS = {
  W: { name: "Tungsten (W)", z: 74, edge: 69.5, ka: 59.3, kb: 67.2, lines: 3.6 },
  Mo: { name: "Molybdenum (Mo)", z: 42, edge: 20.0, ka: 17.5, kb: 19.6, lines: 7.2 },
};
// Generator waveforms: tube voltage as a fraction of the kVp through one mains cycle (θ from 0 to 2π).
const GENERATORS = {
  hf: { name: "High-frequency", v: th => 1 - 0.005 * (1 + Math.sin(20 * th)) },
  twelve: { name: "Three-phase, 12-pulse", v: th => Math.max(...[0, 30, 60, 90, 120, 150].map(d => Math.abs(Math.sin(th - (d * Math.PI) / 180)))) },
  six: { name: "Three-phase, 6-pulse", v: th => Math.max(...[0, 120, 240].map(d => Math.abs(Math.sin(th - (d * Math.PI) / 180)))) },
  full: { name: "Single-phase, full-wave", v: th => Math.abs(Math.sin(th)) },
  half: { name: "Single-phase, half-wave", v: th => Math.max(0, Math.sin(th)) },
};
const PHASES = 72;                    // samples across one cycle
const DE = 0.5, EMAX = 150;

// Photon number in each 0.5 keV bin for one setting s = { target, gen, kv, ma, filter, al }.
function spectrum(s) {
  const T = TARGETS[s.target], wave = GENERATORS[s.gen].v;
  const volts = Array.from({ length: PHASES }, (_, i) => s.kv * wave((i / PHASES) * 2 * Math.PI));
  const pts = [];
  for (let E = DE; E <= EMAX + 1e-9; E += DE) {
    let n = 0;
    for (const V of volts) {
      if (E < V) n += (T.z / 74) * s.ma * (V - E) / E;
      if (V > T.edge) {
        const line = s.ma * T.lines * Math.pow((V - T.edge) / T.edge, 1.6);
        if (Math.abs(E - T.ka) < DE / 2) n += line;
        if (Math.abs(E - T.kb) < DE / 2) n += line * 0.25;
      }
    }
    n /= PHASES;
    const att = s.filter === "mo" ? muMo(E) * RHO.mo * 0.003 : muAl(E) * RHO.al * (s.al / 10);   // 0.03 mm Mo, or s.al mm Al
    pts.push([E, n * Math.exp(-att)]);
  }
  return pts;
}
const REF_SET = { target: "W", gen: "hf", kv: 80, ma: 200, filter: "al", al: 2.5 };
const stats = pts => {
  let tot = 0, w = 0, mx = 0;
  for (const [E, v] of pts) { tot += v; w += E * v; mx = Math.max(mx, v); }
  return { tot, mean: tot ? w / tot : 0, max: mx };
};
const REF = stats(spectrum(REF_SET));
const rel = s => spectrum(s).map(([E, v]) => [E, (v / REF.max) * 100]);   // the reference beam peaks at 100

const PRESETS = {
  general: { name: "General radiography", set: { target: "W", gen: "hf", kv: 80, ma: 200, filter: "al", al: 2.5 } },
  mammo: { name: "Mammography", set: { target: "Mo", gen: "hf", kv: 28, ma: 100, filter: "mo", al: 0 } },
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
    <p class="scale-note" data-role="note"></p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><span class="label">Set-up</span></div>
        <div class="modes" role="group" aria-label="Set-up">${Object.entries(PRESETS).map(([id, p]) => `<button type="button" data-preset="${id}">${p.name}</button>`).join("")}</div>
      </div>
      <div class="slider">
        <div class="slider-top"><span class="label">Target</span></div>
        <div class="modes" role="group" aria-label="Target material">${Object.entries(TARGETS).map(([id, t]) => `<button type="button" data-target="${id}">${t.name}</button>`).join("")}</div>
      </div>
      <div class="slider">
        <div class="slider-top"><label for="spec-gen">Generator</label></div>
        <select id="spec-gen" class="select">${Object.entries(GENERATORS).map(([id, g]) => `<option value="${id}">${g.name}</option>`).join("")}</select>
        <small>How steady the tube voltage is: see Rectification in topic 2.</small>
      </div>
      <div class="slider">
        <div class="slider-top"><label for="spec-kv">Tube voltage</label><output for="spec-kv" data-role="kv-o"></output></div>
        <input type="range" id="spec-kv" min="20" max="150" step="1">
        <small>Sets the energy of each electron, so the highest photon energy.</small>
      </div>
      <div class="slider">
        <div class="slider-top"><label for="spec-ma">Tube current</label><output for="spec-ma" data-role="ma-o"></output></div>
        <input type="range" id="spec-ma" min="50" max="500" step="25">
        <small>Sets how many electrons cross the tube each second.</small>
      </div>
      <div class="slider">
        <div class="slider-top"><span class="label">Filter</span></div>
        <div class="modes" role="group" aria-label="Filter material">
          <button type="button" data-filter="al">Aluminium</button>
          <button type="button" data-filter="mo">Molybdenum, 0.03 mm</button>
        </div>
      </div>
      <div class="slider" data-role="al-row">
        <div class="slider-top"><label for="spec-fl">Total filtration</label><output for="spec-fl" data-role="fl-o"></output></div>
        <input type="range" id="spec-fl" min="0" max="6" step="0.5">
        <small>Inherent plus added filtration, in aluminium equivalent.</small>
      </div>
      <div class="controls">
        <button type="button" data-role="pin">Pin for comparison</button>
        <button type="button" data-role="unpin" disabled>Clear pinned</button>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Quantity: area under the curve</span><b data-role="r-qty"></b><span>compared with general radiography at 80 kVp, 200 mA</span></div>
      <div class="readout"><span>Quality: mean photon energy</span><b data-role="r-mean"></b><span>the beam's penetrating power</span></div>
      <div class="readout"><span>Maximum photon energy</span><b data-role="r-max"></b></div>
      <div class="readout"><span>Characteristic K-lines</span><b data-role="r-lines"></b></div>
    </div>
    <p class="summary" data-role="compare" hidden></p>
    <p class="summary" data-role="summary" aria-live="polite"></p>
    <div class="try">
      <h3>Try this</h3>
      <ol>
        <li><b>Pin, then double the mA.</b> Twice the quantity; the quality and the maximum energy do not change.</li>
        <li><b>Pin, then raise the kVp from 60 to 85.</b> 1.4 times the kVp: quantity ∝ kVp² predicts double, and it more than doubles, because a harder beam loses fewer photons in the filtration and the K-lines switch on. The quality rises too.</li>
        <li><b>Pin, then switch to molybdenum.</b> Less Bremsstrahlung (Z = 42 instead of 74), so less quantity, and its K-lines move to about 17.5 and 19.6 keV.</li>
        <li><b>Pin, then add filtration.</b> The low-energy end is cut away: the quality rises and the quantity falls. This is beam hardening.</li>
        <li><b>Pin, then choose a single-phase generator.</b> The voltage spends much of each cycle below the kVp: less quantity and lower quality for the same settings.</li>
        <li><b>Choose Mammography.</b> At 28 kVp the molybdenum filter passes the lines but absorbs the energies just above its 20 keV K-edge, leaving a beam mostly between 15 and 20 keV, right for soft breast tissue.</li>
      </ol>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const kv = root.querySelector("#spec-kv"), ma = root.querySelector("#spec-ma"), fl = root.querySelector("#spec-fl"), gen = root.querySelector("#spec-gen");
  let target = "W", filter = "al";

  const PX0 = 60, PX1 = 620, PY0 = 26, PY1 = 310;
  let view = 150;                                    // the energy axis runs to 50 keV for low kVp, 150 otherwise
  const sx = E => PX0 + (E / view) * (PX1 - PX0);
  let yMax = 100;
  const sy = v => PY1 - (v / yMax) * (PY1 - PY0);
  const NICE = []; for (let p = -1; p <= 4; p++) for (const m of [1, 1.5, 2, 3, 5, 7.5]) NICE.push(+(m * 10 ** p).toPrecision(2));   // in-between steps keep the curve tall
  const inView = pts => pts.filter(([E]) => E <= view);
  const toPath = pts => inView(pts).map(([E, v], i) => `${i ? "L" : "M"}${sx(E).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");

  const axes = $("axes");
  function drawAxes() {
    axes.innerHTML = "";
    const step = view === 50 ? 10 : 25;
    for (let E = 0; E <= view; E += step) {
      el("line", { class: "grid-l", x1: sx(E), y1: PY0, x2: sx(E), y2: PY1 }, axes);
      el("text", { ...(E === 0 ? { class: "wide-only" } : {}), x: sx(E), y: PY1 + 18, "text-anchor": "middle" }, axes).textContent = E;   // on a phone the two zeros would touch
    }
    // Divide the scale so every tick lands on a round number (150 in threes, 100 in fours, 50 in fives).
    const round = x => { const p = 10 ** Math.floor(Math.log10(x)), m = +(x / p).toFixed(6); return [1, 2, 2.5, 5].includes(m); };
    const parts = [4, 5, 3, 2].find(n => round(yMax / n)) || 4;
    for (let i = 0; i <= parts; i++) {
      const v = (yMax * i) / parts, y = sy(v);
      el("line", { class: "grid-l", x1: PX0, y1: y, x2: PX1, y2: y }, axes);
      el("text", { x: PX0 - 8, y: y + 4, "text-anchor": "end" }, axes).textContent = yMax < 20 ? +v.toFixed(1) : Math.round(v);
    }
    el("path", { d: `M${PX0} ${PY0} V${PY1} H${PX1}`, fill: "none" }, axes);
    el("text", { class: "ax-title", x: (PX0 + PX1) / 2, y: PY1 + 44, "text-anchor": "middle" }, axes).textContent = "Photon energy (keV)";
    el("text", { class: "ax-title wide-only", x: 14, y: (PY0 + PY1) / 2, "text-anchor": "middle", transform: `rotate(-90 14 ${(PY0 + PY1) / 2})` }, axes).textContent = "Relative number of photons";   // too long beside the scale on a phone
  }

  const settings = () => ({ target, gen: gen.value, kv: +kv.value, ma: +ma.value, filter, al: +fl.value });
  const setTo = s => { target = s.target; filter = s.filter; gen.value = s.gen; kv.value = s.kv; ma.value = s.ma; fl.value = s.al; update(); };

  let pinned = null, summaryTimer = null;
  function update() {
    const s = settings(), T = TARGETS[s.target];
    view = s.kv <= 45 ? 50 : 150;
    $("kv-o").textContent = `${s.kv} kVp`;
    $("ma-o").textContent = `${s.ma} mA`;
    $("fl-o").textContent = `${s.al.toFixed(1)} mm Al`;
    $("al-row").hidden = filter !== "al";
    root.querySelectorAll("[data-target]").forEach(b => b.setAttribute("aria-pressed", b.dataset.target === target));
    root.querySelectorAll("[data-filter]").forEach(b => b.setAttribute("aria-pressed", b.dataset.filter === filter));
    root.querySelectorAll("[data-preset]").forEach(b => {
      const p = PRESETS[b.dataset.preset].set;
      b.setAttribute("aria-pressed", Object.keys(p).every(k => k === "al" && p.filter !== "al" ? true : p[k] === s[k]));
    });

    const pts = rel(s), st = stats(pts);
    const need = Math.max(Math.max(...inView(pts).map(p => p[1])), pinned ? Math.max(...inView(pinned.pts).map(p => p[1])) : 0) * 1.08;
    if (need > yMax || need < yMax * 0.5) yMax = NICE.find(n => n >= need) || NICE[NICE.length - 1];
    drawAxes();

    $("curve").setAttribute("d", toPath(pts));
    $("area").setAttribute("d", `${toPath(pts)} L${sx(Math.min(view, EMAX))} ${PY1} L${sx(DE)} ${PY1} Z`);
    $("pinned").setAttribute("d", pinned ? toPath(pinned.pts) : "");
    $("legend-pin").hidden = !pinned;

    const x = sx(Math.min(s.kv, view)), kvlabel = $("kvlabel");
    $("kvline").setAttribute("x1", x); $("kvline").setAttribute("x2", x);
    kvlabel.setAttribute("x", Math.min(x, PX1 - 4)); kvlabel.setAttribute("text-anchor", x > PX1 - 90 ? "end" : "middle");
    kvlabel.textContent = `max = ${s.kv} keV`;

    // Lines show only if the peak voltage passes the K-edge and they are not filtered away.
    const lineLabels = $("linelabels");
    lineLabels.innerHTML = "";
    const atLine = E => pts.find(p => Math.abs(p[0] - E) < DE / 2)[1];
    const hasLines = s.kv > T.edge && atLine(T.ka) > 1.5 * atLine(T.ka - 2);
    if (hasLines) {
      el("text", { class: "linelabel", x: sx(T.ka) - 6, y: Math.max(sy(atLine(T.ka)) - 6, PY0 + 12), "text-anchor": "end" }, lineLabels).textContent = "Kα";
      el("text", { class: "linelabel", x: sx(T.kb) + 6, y: Math.max(sy(atLine(T.kb)) - 6, PY0 + 12) }, lineLabels).textContent = "Kβ";
    }

    const mx = sx(st.mean), meanG = $("meanmark"), mt = meanG.querySelector("text");
    meanG.querySelector("polygon").setAttribute("points", `${mx},${PY1 - 1} ${mx - 6},${PY1 - 11} ${mx + 6},${PY1 - 11}`);
    mt.setAttribute("x", mx); mt.setAttribute("y", PY1 - 15); mt.setAttribute("text-anchor", "middle"); mt.textContent = "mean";

    const qty = st.tot / (REF.tot / REF.max * 100);
    const fmtQ = q => (q >= 10 ? Math.round(q) : q >= 0.1 ? +q.toFixed(2) : +q.toPrecision(2));
    $("r-qty").textContent = `× ${fmtQ(qty)}`;
    $("r-mean").textContent = `≈ ${Math.round(st.mean)} keV`;
    $("r-max").textContent = `${s.kv} keV`;
    $("r-lines").innerHTML = hasLines ? `<span class="pill yes">${T.ka} and ${T.kb} keV</span>` : '<span class="pill no">Absent</span>';
    $("note").textContent = `Illustrative: ${T.name.toLowerCase().replace(/ \(.*\)/, "")} target, ${GENERATORS[s.gen].name.toLowerCase()} generator, ${filter === "mo" ? "0.03 mm molybdenum filter" : `${s.al.toFixed(1)} mm aluminium`}. The vertical scale adjusts itself, so read the axis numbers when comparing.`;

    // What changed against the pinned beam, in the lecture's terms.
    if (pinned) {
      const q = st.tot / pinned.stats.tot, dm = st.mean - pinned.stats.mean;
      const qWord = Math.abs(q - 1) < 0.03 ? "the quantity is unchanged" : `the quantity is ${fmtQ(q)} times the pinned beam`;
      const mWord = Math.abs(dm) < 0.5 ? "the quality is unchanged" : `the quality is ${dm > 0 ? "higher" : "lower"} (mean ${Math.round(st.mean)} keV against ${Math.round(pinned.stats.mean)} keV)`;
      $("compare").textContent = `Against the pinned beam: ${qWord}, and ${mWord}.`;
    }
    $("compare").hidden = !pinned;

    const genNote = s.gen === "hf" ? "" : ` With a ${GENERATORS[s.gen].name.toLowerCase()} generator the voltage spends part of each cycle below the kVp, so there are fewer photons and the mean energy is lower than with a steady (high-frequency) supply.`;
    const lineNote = hasLines
      ? `${T.name.replace(/ \(.*\)/, "")}'s K-lines appear at about ${T.ka} keV (Kα) and ${T.kb} keV (Kβ), because the electrons carry more than the ${T.edge} keV needed to eject a K-shell electron.`
      : s.kv > T.edge
        ? `${T.name.replace(/ \(.*\)/, "")}'s K-lines are made, but the filtration absorbs almost all of them at this low energy.`
        : `There are no K-lines: the electrons carry less than the ${T.edge} keV needed to eject a ${T.name.replace(/ \(.*\)/, "").toLowerCase()} K-shell electron.`;
    const sentence = `At ${s.kv} kVp and ${s.ma} mA the quantity is ${fmtQ(qty)} times the general-radiography reference, and the quality (mean energy) is about ${Math.round(st.mean)} keV, with a maximum of ${s.kv} keV. ${lineNote}${genNote}`;
    clearTimeout(summaryTimer);
    summaryTimer = setTimeout(() => { $("summary").textContent = sentence; }, 250);
    $("desc").textContent = "Relative number of photons against photon energy. " + sentence;
  }

  [kv, ma, fl].forEach(i => i.addEventListener("input", update));
  gen.addEventListener("change", update);
  root.querySelectorAll("[data-target]").forEach(b => b.addEventListener("click", () => { target = b.dataset.target; update(); }));
  root.querySelectorAll("[data-filter]").forEach(b => b.addEventListener("click", () => { filter = b.dataset.filter; update(); }));
  root.querySelectorAll("[data-preset]").forEach(b => b.addEventListener("click", () => setTo(PRESETS[b.dataset.preset].set)));
  const pinBtn = $("pin"), unpinBtn = $("unpin");
  pinBtn.addEventListener("click", () => {
    const pts = rel(settings());
    pinned = { pts, stats: stats(pts) };
    unpinBtn.disabled = false; pinBtn.textContent = "Re-pin current"; update();
  });
  unpinBtn.addEventListener("click", () => { pinned = null; unpinBtn.disabled = true; pinBtn.textContent = "Pin for comparison"; update(); });
  setTo(PRESETS.general.set);

  return () => clearTimeout(summaryTimer);
}
export { spectrum, stats, REF_SET };   // for checking the model outside the page
