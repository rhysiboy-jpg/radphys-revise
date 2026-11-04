// Static figures for "Label the diagram" questions. Each figure draws itself and returns its numbered markers:
// [badge x, badge y, point x, point y], in the same order as its labels. A question may replace the labels (same order).
// Schematic, in the same drawing style as the interactives; not to scale.
import { svgEl as el, wavy } from "./diagrams/util.js";
import { drawAtom } from "./diagrams/atom.js";
import { spectrum, REF_SET } from "./diagrams/spectrum.js";

export const FIGURES = {
  tube: {
    title: "A rotating-anode X-ray tube in side view",
    viewBox: "0 0 760 392",
    note: "Schematic · not to scale · cathode (−) left, anode (+) right",
    labels: ["Filament", "Focusing cup", "Target and focal spot", "Rotating anode", "Rotor", "Stator", "Envelope (vacuum)", "Window", "Added filtration", "Housing and oil"],
    // The same drawing as the tube explorer, without its animation.
    draw(g) {
      g.innerHTML = `
        <rect class="oil" x="30" y="30" width="700" height="300" rx="36"/>
        <rect class="housing" x="30" y="30" width="700" height="300" rx="36"/>
        <rect class="port" x="410" y="324" width="80" height="12"/>
        <rect class="glass" x="100" y="70" width="540" height="220" rx="60"/>
        <line class="window" x1="414" y1="290" x2="488" y2="290"/>
        <rect class="al" x="402" y="336" width="96" height="12" rx="2"/>
        <path class="wire" d="M36 232 H140"/>
        <path class="wire" d="M616 170 H724"/>
        <text class="pol" x="70" y="222">−</text>
        <text class="pol" x="684" y="160">+</text>
        <path class="cup" d="M140 200 H180 V214 H166 V250 H180 V264 H140 Z"/>
        <path class="coil" d="M170 217 l7 3 l-7 3 l7 3 l-7 3 l7 3 l-7 3 l7 3 l-7 3 l7 3 l-7 3"/>
        <polygon class="disc" points="458,90 484,90 484,250 458,250 446,206 446,134"/>
        <rect class="stem" x="484" y="164" width="56" height="12"/>
        <line class="track" x1="447" y1="209" x2="457" y2="247"/>
        <line class="track" x1="457" y1="93" x2="447" y2="131"/>
        <rect class="rotor" x="540" y="136" width="76" height="68" rx="6"/>
        <path d="M556 136 V204 M572 136 V204 M588 136 V204 M604 136 V204" stroke="var(--lead)" stroke-width="1" opacity="0.5"/>
        <rect class="stator" x="540" y="44" width="76" height="20" rx="3"/>
        <rect class="stator" x="540" y="296" width="76" height="20" rx="3"/>
        <path class="stator-coil" d="M548 48 V60 M560 48 V60 M572 48 V60 M584 48 V60 M596 48 V60 M608 48 V60 M548 300 V312 M560 300 V312 M572 300 V312 M584 300 V312 M596 300 V312 M608 300 V312"/>`;
      return [[210, 190, 176, 222], [128, 182, 142, 202], [404, 276, 450, 240], [462, 50, 466, 88], [578, 170, 578, 170],
        [664, 54, 618, 54], [300, 96, 300, 96], [524, 306, 490, 292], [532, 362, 500, 344], [72, 60, 72, 60]];
    },
  },

  atom: {
    title: "The Bohr model of a sodium atom",
    viewBox: "0 0 520 360",
    note: "Schematic · not to scale · real shells are not circles",
    labels: ["Nucleus (protons and neutrons)", "K shell", "L shell", "M shell", "Electron"],
    draw(g) {
      const a = drawAtom(g, { cx: 260, cy: 180, counts: [2, 8, 1], label: false });
      const e = a.shells[1].dots[6], c = Math.SQRT1_2;
      return [[90, 180, 243, 180], [430, 56, 260 + 44 * c, 180 - 44 * c], [470, 180, 336, 180], [430, 314, 260 + 108 * c, 180 + 108 * c], [90, 70, e._x - 5, e._y - 5]];
    },
  },

  spectrum: {
    title: "An X-ray spectrum from a tungsten target at 80 kVp, after 2.5 mm aluminium",
    viewBox: "0 0 640 340",
    note: "Number of photons against photon energy · schematic heights",
    labels: ["Bremsstrahlung (continuous spectrum)", "Kα characteristic line", "Kβ characteristic line", "Maximum photon energy, set by the kVp", "Low-energy photons removed by filtration"],
    draw(g) {
      const PX0 = 50, PX1 = 610, PY0 = 30, PY1 = 280, EMAX = 100;
      // The explorer's spectrum, with the two K-lines drawn taller so they can be labelled (heights are schematic).
      const raw = spectrum(REF_SET).filter(([E]) => E <= EMAX);
      const cont = Math.max(...raw.filter(([E]) => Math.abs(E - 59.3) > 1 && Math.abs(E - 67.2) > 1).map(p => p[1]));
      const pts = raw.map(([E, v], i) => Math.abs(E - 59.3) < 0.25 ? [E, raw[i - 1][1] + cont * 0.75] : Math.abs(E - 67.2) < 0.25 ? [E, raw[i - 1][1] + cont * 0.3] : [E, v]);
      const top = Math.max(...pts.map(p => p[1])) * 1.05;
      const sx = E => PX0 + (E / EMAX) * (PX1 - PX0), sy = v => PY1 - (v / top) * (PY1 - PY0);
      const axes = el("g", { class: "axis" }, g);
      for (let E = 0; E <= EMAX; E += 20) el("text", { ...(E === 0 ? { class: "wide-only" } : {}), x: sx(E), y: PY1 + 18, "text-anchor": "middle" }, axes).textContent = E;
      el("path", { d: `M${PX0} ${PY0} V${PY1} H${PX1}`, fill: "none" }, axes);
      el("text", { class: "ax-title", x: (PX0 + PX1) / 2, y: PY1 + 44, "text-anchor": "middle" }, axes).textContent = "Photon energy (keV)";
      el("text", { class: "ax-title", x: 26, y: (PY0 + PY1) / 2, "text-anchor": "middle", transform: `rotate(-90 26 ${(PY0 + PY1) / 2})` }, axes).textContent = "Number of photons";
      const line = pts.map(([E, v], i) => `${i ? "L" : "M"}${sx(E).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");
      el("path", { class: "spec-area", d: `${line} L${sx(pts[pts.length - 1][0])} ${PY1} L${sx(pts[0][0])} ${PY1} Z` }, g);
      el("path", { class: "curve", d: line }, g);
      const at = E => pts.reduce((b, p) => Math.abs(p[0] - E) < Math.abs(b[0] - E) ? p : b)[1];
      const peak = E => pts.filter(p => Math.abs(p[0] - E) < 1).reduce((m, p) => Math.max(m, p[1]), 0);
      return [
        [sx(36), PY1 - 50, sx(36), sy(at(36)) + 6],
        [sx(50), sy(peak(59.3)) - 4, sx(59.3) - 3, sy(peak(59.3)) + 2],
        [sx(76), sy(peak(67.2)) - 16, sx(67.2) + 3, sy(peak(67.2)) + 2],
        [sx(88), PY1 - 60, sx(80), PY1 - 2],
        [sx(6), PY1 - 70, sx(14), sy(at(14)) - 2],
      ];
    },
  },

  dr: {
    title: "An indirect digital radiography (DR) detector in cross-section",
    viewBox: "0 0 640 300",
    note: "Schematic · cross-section · not to scale",
    labels: ["X-ray photon", "Caesium iodide (CsI) scintillator", "Light", "Photodiode (amorphous silicon)", "Thin-film transistor (TFT)"],
    draw(g) {
      const X0 = 60, X1 = 520, HIT = 308;
      el("rect", { class: "det-layer det-scint", x: X0, y: 70, width: X1 - X0, height: 120 }, g);
      for (let x = X0 + 6; x < X1; x += 9) el("line", { class: "needle", x1: x, y1: 72, x2: x, y2: 188 }, g);
      el("rect", { class: "det-layer det-asi", x: X0, y: 190, width: X1 - X0, height: 34 }, g);
      for (let x = X0; x < X1; x += 46) {
        el("rect", { class: "fig-pd", x: x + 3, y: 194, width: 30, height: 26, rx: 2 }, g);
        el("rect", { class: "fig-tft", x: x + 36, y: 204, width: 8, height: 14 }, g);
      }
      el("rect", { class: "det-layer", x: X0, y: 224, width: X1 - X0, height: 18 }, g);
      el("path", { class: "photon", d: wavy(HIT, 6, HIT, 118, 4, 12) }, g);
      el("circle", { class: "flash", cx: HIT, cy: 124, r: 7 }, g);
      for (const dx of [-8, 0, 8]) el("path", { class: "light-ray", d: `M${HIT + dx / 2} 132 L${HIT + dx * 1.4} 192` }, g);
      return [[372, 34, 316, 40], [586, 130, 520, 130], [384, 160, 316, 160], [150, 278, 168, 214], [238, 278, 191, 214]];
    },
  },

  geometry: {
    title: "Focal spot, object and image receptor, with the shadow of the object",
    viewBox: "0 0 640 330",
    note: "Schematic · the focal spot is drawn far larger than it is",
    labels: ["Focal spot", "Object", "Image receptor", "Umbra", "Penumbra (geometric unsharpness)", "Object–receptor distance (ORD)", "Focus–receptor distance (FRD)"],
    draw(g) {
      const YS = 30, YO = 178, YD = 280, S = [308, 332], O = [290, 350];
      const hit = (sxp, ox) => sxp + (ox - sxp) * ((YD - YS) / (YO - YS));
      for (const s of S) for (const o of O) el("line", { class: "geo-ray", x1: s, y1: YS, x2: hit(s, o), y2: YD }, g);
      const uL = hit(S[0], O[0]), pL = hit(S[1], O[0]), uR = hit(S[1], O[1]), pR = hit(S[0], O[1]);
      el("rect", { class: "geo-penumbra", x: pL, y: YD - 5, width: uL - pL, height: 10 }, g);
      el("rect", { class: "geo-penumbra", x: uR, y: YD - 5, width: pR - uR, height: 10 }, g);
      el("rect", { class: "geo-umbra", x: uL, y: YD - 5, width: uR - uL, height: 10 }, g);
      el("rect", { class: "geo-spot", x: S[0], y: YS - 5, width: S[1] - S[0], height: 10, rx: 2 }, g);
      el("rect", { class: "geo-object", x: O[0], y: YO - 9, width: O[1] - O[0], height: 18, rx: 3 }, g);
      el("line", { class: "geo-detector", x1: 140, y1: YD, x2: 500, y2: YD }, g);
      const dim = (x, y0, y1) => el("path", { class: "geo-dim", d: `M${x - 8} ${y0} H${x + 8} M${x} ${y0} V${y1} M${x - 8} ${y1} H${x + 8}` }, g);
      dim(450, YO, YD); dim(560, YS, YD);
      return [[232, YS, S[0] - 4, YS], [210, 140, O[0] - 2, YO - 6], [180, 306, 210, YD + 1], [320, 312, 320, YD + 6],
        [410, 312, (uR + pR) / 2, YD + 6], [494, (YO + YD) / 2, 450, (YO + YD) / 2], [604, 150, 560, 150]];
    },
  },

  transformer: {
    title: "A step-up transformer",
    viewBox: "0 0 640 300",
    note: "Schematic · not to scale · fewer turns drawn than a real transformer has",
    labels: ["Primary winding", "Secondary winding", "Iron core", "Changing magnetic field in the core", "Alternating current (AC) supply"],
    draw(g) {
      el("rect", { class: "core", x: 200, y: 50, width: 240, height: 200, rx: 6 }, g);
      el("rect", { class: "core-hole", x: 240, y: 90, width: 160, height: 120, rx: 3 }, g);
      el("rect", { class: "fig-flux", x: 220, y: 70, width: 200, height: 160, rx: 12 }, g);
      const coil = (x0, x1, n) => { let d = ""; for (let i = 0; i < n; i++) { const y = 84 + (i * 132) / (n - 1); d += `M${x0} ${y} L${x1} ${y + 6} `; } el("path", { class: "winding", d }, g); };
      coil(192, 248, 7); coil(392, 448, 14);
      const wire = d => el("path", { class: "lead-wire", d }, g);
      wire("M192 84 H110 V128"); wire("M192 222 H110 V172");
      wire("M448 90 H540 V120"); wire("M448 222 H540 V180");
      el("circle", { class: "det-box", cx: 110, cy: 150, r: 22 }, g);
      el("path", { class: "lead-wire", d: "M98 150 q6 -10 12 0 t12 0" }, g);
      el("rect", { class: "det-box", x: 526, y: 120, width: 28, height: 60, rx: 3 }, g);
      return [[150, 50, 200, 96], [490, 50, 446, 100], [320, 24, 320, 50], [320, 272, 320, 230], [56, 200, 96, 166]];
    },
  },
};

// Draws a figure into an <svg> and numbers its markers. Returns the number of markers, or 0 if the figure is unknown.
export function drawFigure(svg, id) {
  const f = FIGURES[id];
  if (!f) return 0;
  svg.setAttribute("viewBox", f.viewBox);
  const art = el("g", {}, svg), marks = f.draw(art);
  const badges = el("g", {}, svg);
  marks.forEach(([bx, by, lx, ly], i) => {
    const b = el("g", { class: "badge", "aria-hidden": "true" }, badges);
    if (bx !== lx || by !== ly) el("line", { x1: bx, y1: by, x2: lx, y2: ly }, b);
    el("circle", { cx: bx, cy: by, r: 13 }, b);
    el("text", { x: bx, y: by }, b).textContent = i + 1;
  });
  return marks.length;
}
