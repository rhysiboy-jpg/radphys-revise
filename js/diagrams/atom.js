// The Bohr atom drawing shared by the atom, electron–target and photoelectric/Compton diagrams.
// Shells are drawn as rings, electrons as labelled dots. Schematic: real shells are not circles and not to scale.
import { svgEl as el } from "./util.js";

export const SHELL_NAMES = ["K", "L", "M"];

// counts: electrons per shell from K outwards. Shells beyond M are summarised on one dashed ring.
export function drawAtom(parent, { cx, cy, counts, radii = [44, 76, 108], outerR = 136, z, label = true, showEmpty = false }) {
  const g = el("g", { class: "atom" }, parent);
  const shells = [];
  const drawn = showEmpty ? [0, 1, 2].map(s => counts[s] || 0) : counts.slice(0, 3);
  drawn.forEach((n, s) => {
    const r = radii[s];
    el("circle", { class: n ? "shell" : "shell empty", cx, cy, r }, g);
    if (label) el("text", { class: "shell-label", x: cx + r * 0.71 + 4, y: cy - r * 0.71 - 4 }, g).textContent = SHELL_NAMES[s];
    const dots = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2 + s * 0.35;
      dots.push(electron(g, cx + r * Math.cos(a), cy + r * Math.sin(a)));
    }
    shells.push({ r, dots });
  });
  const outer = counts.slice(3).reduce((a, b) => a + b, 0);
  if (outer) {
    el("circle", { class: "shell outer", cx, cy, r: outerR }, g);
    el("text", { class: "shell-label outer-note", x: cx, y: cy + outerR + 18, "text-anchor": "middle" }, g).textContent = `+ ${outer} electrons in outer shells`;
  }
  const nucleus = el("g", { class: "nucleus-g" }, g);
  el("circle", { class: "nucleus", cx, cy, r: 16 }, nucleus);
  el("text", { class: "nucleus-t", x: cx, y: cy }, nucleus).textContent = z ? `${z}+` : "+";
  return { g, shells, cx, cy };
}

// An electron: a filled dot with a minus sign, so it reads without colour.
export function electron(parent, x, y, r = 6.5) {
  const g = el("g", { class: "e", transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, parent);
  el("circle", { class: "e-dot", r }, g);
  el("text", { class: "e-sign" }, g).textContent = "−";
  g._x = x; g._y = y;
  return g;
}
export function moveTo(node, x, y) {
  node._x = x; node._y = y;
  node.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
}

// A hole left by a removed electron: a dashed empty circle.
export function vacancy(parent, x, y) {
  return el("circle", { class: "vacancy", cx: x, cy: y, r: 6.5 }, parent);
}
