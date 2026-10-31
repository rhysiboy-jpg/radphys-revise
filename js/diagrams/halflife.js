// Explorer: half-life. A sample of nuclei decays at random; the number left follows (½)ⁿ after n half-lives.
// Each nucleus has the same chance of decaying in each moment, so no one can say which will go next, but a large sample
// halves every half-life (lecture: Radioactivity, slides 17 and 23–24). Half-lives are reference values.
import { svgEl as el, reducedMotion } from "./util.js";

const NUCLIDES = {
  tc: { name: "Technetium-99m (Tc-99m)", t: 6.0, unit: "hours", use: "gamma camera imaging" },
  mo: { name: "Molybdenum-99 (Mo-99)", t: 66, unit: "hours", use: "the generator that supplies Tc-99m" },
  f: { name: "Fluorine-18 (F-18)", t: 110, unit: "minutes", use: "PET imaging" },
  i: { name: "Iodine-131 (I-131)", t: 8.0, unit: "days", use: "thyroid treatment" },
};
const A0 = 400;                      // MBq, an illustrative starting activity
const NMAX = 5;                      // half-lives on the graph
const SPEED = 0.5;                   // half-lives per second while playing

// Layout: the sample on the left, the graph on the right.
const DOT = { x: 20, y: 30, size: 260 };
const G = { x0: 360, x1: 620, y0: 30, y1: 260 };
const gx = n => G.x0 + (n / NMAX) * (G.x1 - G.x0), gy = f => G.y1 - f * (G.y1 - G.y0);

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 640 320" role="img" aria-labelledby="hl-t hl-d">
      <title id="hl-t">A decaying sample and a graph of nuclei remaining against time</title>
      <desc id="hl-d" data-role="desc"></desc>
      <text class="pane-t" x="${DOT.x + DOT.size / 2}" y="18">The sample</text>
      <text class="pane-t" x="${(G.x0 + G.x1) / 2}" y="18">Nuclei remaining</text>
      <g data-role="dots"></g>
      <g class="axis" data-role="axis"></g>
      <path class="hl-expect" data-role="expect"/>
      <polyline class="hl-run" data-role="run"/>
      <circle class="hl-now" data-role="now" r="5"/>
    </svg>
    <p class="legend"><span><i class="nuc-key"></i>undecayed nucleus</span><span><i class="nuc-key done"></i>decayed</span><span><i class="dash"></i>expected: (½)ⁿ</span><span><i class="run-key"></i>this sample</span></p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider">
        <div class="slider-top"><label for="hl-nuc">Radionuclide</label></div>
        <select id="hl-nuc" class="select">${Object.entries(NUCLIDES).map(([id, n]) => `<option value="${id}">${n.name}</option>`).join("")}</select>
        <small data-role="use"></small>
      </div>
      <div class="slider">
        <div class="slider-top"><span class="label">Sample size</span></div>
        <div class="modes" role="group" aria-label="Sample size">
          <button type="button" data-n="400">400 nuclei</button>
          <button type="button" data-n="36">36 nuclei</button>
        </div>
      </div>
      <div class="controls">
        <button type="button" class="primary" data-role="play">Play</button>
        <button type="button" data-role="step">One half-life</button>
        <button type="button" data-role="reset">Start again</button>
      </div>
    </div>
    <div class="readouts">
      <div class="readout"><span>Time</span><b data-role="r-time"></b><span data-role="r-n"></span></div>
      <div class="readout"><span>Nuclei remaining</span><b data-role="r-left"></b><span data-role="r-left-s"></span></div>
      <div class="readout"><span>Expected fraction, (½)ⁿ</span><b data-role="r-exp"></b></div>
      <div class="readout"><span>Activity</span><b data-role="r-act"></b><span>from ${A0} MBq at the start (illustrative)</span></div>
    </div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
    <div class="try">
      <h3>Try this</h3>
      <ol>
        <li><b>Step one half-life at a time.</b> Each step halves what is left: 100%, 50%, 25%, 12.5%…</li>
        <li><b>Switch to 36 nuclei.</b> The sample wanders off the expected curve: decay is random, and only large numbers follow it closely.</li>
        <li><b>Change the radionuclide.</b> The curve has the same shape for all of them; only the time for each half-life changes.</li>
        <li><b>Watch the activity.</b> Activity is decays per second, so it falls in step with the number of nuclei left.</li>
      </ol>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const nucIn = root.querySelector("#hl-nuc");
  let N = 400, alive_ = [], t = 0, run = [[0, 1]], playing = false, last = 0, alive = true, summaryTimer = null;
  let rand = Math.random;

  // Axes, drawn once.
  const axis = $("axis");
  el("line", { x1: G.x0, y1: G.y1, x2: G.x1, y2: G.y1 }, axis);
  el("line", { x1: G.x0, y1: G.y0, x2: G.x0, y2: G.y1 }, axis);
  for (let n = 0; n <= NMAX; n++) {
    el("line", { class: "grid-l", x1: gx(n), y1: G.y0, x2: gx(n), y2: G.y1 }, axis);
    el("text", { x: gx(n), y: G.y1 + 18, "text-anchor": "middle" }, axis).textContent = n;
  }
  [[1, "100%"], [0.5, "50%"], [0.25, "25%"]].forEach(([f, label]) => {
    el("line", { class: "grid-l", x1: G.x0, y1: gy(f), x2: G.x1, y2: gy(f) }, axis);
    el("text", { x: G.x0 - 6, y: gy(f) + 4, "text-anchor": "end" }, axis).textContent = label;
  });
  el("text", { class: "ax-title", x: (G.x0 + G.x1) / 2, y: G.y1 + 42, "text-anchor": "middle" }, axis).textContent = "Half-lives elapsed (n)";
  $("expect").setAttribute("d", Array.from({ length: 101 }, (_, i) => { const n = (i / 100) * NMAX; return `${i ? "L" : "M"}${gx(n).toFixed(1)} ${gy(0.5 ** n).toFixed(1)}`; }).join(" "));

  let dots = [];
  function build() {
    const g = $("dots");
    g.innerHTML = "";
    const side = Math.round(Math.sqrt(N)), cell = DOT.size / side;
    dots = Array.from({ length: N }, (_, i) => el("circle", { class: "nuc", cx: (DOT.x + cell * ((i % side) + 0.5)).toFixed(1), cy: (DOT.y + cell * (Math.floor(i / side) + 0.5)).toFixed(1), r: (cell * 0.36).toFixed(1) }, g));
  }

  function reset() {
    playing = false;
    t = 0; run = [[0, 1]];
    alive_ = new Array(N).fill(true);
    build();
    update();
  }

  // Advance time by dn half-lives: each nucleus left decays with probability 1 − (½)^dn.
  function advance(dn) {
    dn = Math.min(dn, NMAX - t);
    if (dn <= 0) { playing = false; return; }
    const p = 1 - 0.5 ** dn;
    alive_.forEach((a, i) => { if (a && rand() < p) { alive_[i] = false; dots[i].classList.add("done"); } });
    t += dn;
    run.push([t, alive_.filter(Boolean).length / N]);
    if (t >= NMAX - 1e-9) playing = false;
    update();
  }

  const fmt = v => (v >= 100 ? Math.round(v) : +v.toFixed(v >= 10 ? 1 : 2));
  function update() {
    const nuc = NUCLIDES[nucIn.value], left = alive_.filter(Boolean).length, exp = 0.5 ** t;
    $("use").textContent = `Half-life ${nuc.t} ${nuc.unit}. Used for ${nuc.use}.`;
    root.querySelectorAll("[data-n]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.n === N));
    $("play").textContent = playing ? "Pause" : t >= NMAX - 1e-9 ? "Finished" : "Play";
    $("play").disabled = t >= NMAX - 1e-9;
    $("step").disabled = t >= NMAX - 1e-9;
    $("r-time").textContent = `${fmt(t * nuc.t)} ${nuc.unit}`;
    $("r-n").textContent = `${+t.toFixed(2)} half-lives`;
    $("r-left").textContent = `${left} of ${N}`;
    $("r-left-s").textContent = `${Math.round((left / N) * 100)}% of the sample`;
    $("r-exp").textContent = `${+(exp * 100).toFixed(1)}%`;
    $("r-act").textContent = `${fmt(A0 * exp)} MBq`;
    $("run").setAttribute("points", run.map(([n, f]) => `${gx(n).toFixed(1)},${gy(f).toFixed(1)}`).join(" "));
    $("now").setAttribute("cx", gx(t)); $("now").setAttribute("cy", gy(left / N));

    const sentence = t === 0
      ? `${N} nuclei of ${nuc.name.split(" (")[0]}, half-life ${nuc.t} ${nuc.unit}. Press Play or step one half-life.`
      : `After ${+t.toFixed(2)} half-lives (${fmt(t * nuc.t)} ${nuc.unit}), ${left} of ${N} nuclei are left: ${Math.round((left / N) * 100)}%, against ${+(exp * 100).toFixed(1)}% expected.`;
    $("desc").textContent = sentence;
    if (!playing) { clearTimeout(summaryTimer); summaryTimer = setTimeout(() => { $("summary").textContent = sentence; }, 250); }
  }

  function frame(now) {
    if (!alive) return;
    if (playing) { advance(Math.min(0.1, ((now - last) / 1000) * SPEED)); }
    last = now;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(now => { last = now; frame(now); });

  $("play").addEventListener("click", () => {
    if (reducedMotion()) { advance(1); return; }   // with reduced motion, Play moves in whole half-lives
    playing = !playing; update();
  });
  $("step").addEventListener("click", () => { playing = false; advance(Math.min(1, Math.ceil(t + 1e-9) - t || 1)); });
  $("reset").addEventListener("click", reset);
  nucIn.addEventListener("change", update);
  root.querySelectorAll("[data-n]").forEach(b => b.addEventListener("click", () => { N = +b.dataset.n; reset(); }));
  reset();
  return () => { alive = false; clearTimeout(summaryTimer); };
}
