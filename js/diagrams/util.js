// Shared helpers for the SVG diagrams.
const NS = "http://www.w3.org/2000/svg";

export function svgEl(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

// A wavy line from (x1, y1) to (x2, y2): the usual way of drawing a photon.
export function wavy(x1, y1, x2, y2, amp = 4, wl = 13) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  let d = `M${x1} ${y1}`;
  const n = Math.ceil(L / 2);
  for (let i = 1; i <= n; i++) {
    const s = (i * L) / n, o = amp * Math.sin((s / wl) * 2 * Math.PI);
    d += ` L${(x1 + ux * s - uy * o).toFixed(1)} ${(y1 + uy * s + ux * o).toFixed(1)}`;
  }
  return d;
}

const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
export const reducedMotion = () => mq.matches;

// Runs step(t) for t from 0 to 1 over ms milliseconds. With reduced motion it jumps straight to the end.
// Resolves false if cancelled (alive() returned false), so a sequence can stop when the view closes.
export function tween(ms, step, alive = () => true) {
  return new Promise(resolve => {
    if (reducedMotion()) { step(1); resolve(alive()); return; }
    const t0 = performance.now();
    const tick = now => {
      if (!alive()) { resolve(false); return; }
      const t = Math.min(1, (now - t0) / ms);
      step(t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);   // ease in and out
      if (t < 1) requestAnimationFrame(tick); else resolve(true);
    };
    requestAnimationFrame(tick);
  });
}

export const lerp = (a, b, t) => a + (b - a) * t;
