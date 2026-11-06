// Shared helpers for the SVG diagrams.
const NS = "http://www.w3.org/2000/svg";

export function svgEl(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

// Sets a label's text as lines stacked under its anchor point.
export function setLines(t, ...lines) {
  t.textContent = "";
  lines.forEach((line, i) => { svgEl("tspan", { x: t.getAttribute("x"), dy: i ? "1.15em" : 0 }, t).textContent = line; });
}

// Nudges a label sideways so it stays between x0 and x1 at its on-screen size (labels grow on a phone).
export function keepInside(t, x0, x1) {
  t.removeAttribute("transform");
  t.getBoundingClientRect();   // a full layout first: getBBox alone can measure a new label before its phone-size text applies
  const b = t.getBBox();
  const shift = b.x < x0 ? x0 - b.x : b.x + b.width > x1 ? x1 - (b.x + b.width) : 0;
  if (shift) t.setAttribute("transform", `translate(${shift.toFixed(1)} 0)`);
}

// Tapping a graph moves its slider to the value under the tap, so the graph and the control work both ways. It is also a
// tap alternative to dragging the slider (WCAG 2.5.7). The slider stays the keyboard and screen-reader route, so the tap
// area is hidden from assistive technology. area: the plot in drawing units; toValue turns a drawing x into the slider's value.
export function tapToSet(svg, area, input, toValue) {
  const hit = svgEl("rect", { class: "tap-area", x: area.x0, y: area.y0, width: area.x1 - area.x0, height: area.y1 - area.y0, "aria-hidden": "true" });
  const first = [...svg.children].find(n => !["title", "desc", "defs"].includes(n.tagName));
  svg.insertBefore(hit, first || null);   // behind the drawing, so the curves stay on top
  svg.addEventListener("click", e => {
    const m = svg.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    if (p.x < area.x0 || p.x > area.x1 || p.y < area.y0 || p.y > area.y1) return;
    input.value = toValue(p.x);   // the slider rounds to its step and keeps within its range
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
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
// True while motion should stand still: the device asks for reduced motion, or the student pressed "Pause motion"
// (WCAG 2.2.2: anything that moves by itself for more than five seconds needs a way to pause it). Loops that run by
// themselves check this every frame, so they freeze where they are and carry on when it's switched back.
export const motionPaused = () => mq.matches || document.documentElement.classList.contains("motion-paused");

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
