// Simulated images for "Image critique" questions, drawn with the exposure console's model and cartoon limb
// (no patient images). The question's "figure" cell holds the settings, for example:
//   part=knee; kv=85; mas=2.2          (kVp and mAs as numbers; part is hand, knee or pelvis)
//   grid=out | grid=in; spot=fine | spot=broad; frd=100; motion=3 (extra blur in pixels for patient movement)
//   show=image hides the EI and settings, so the student judges the image alone.
// Anything left out takes the console's suggested setting for that body part.
import { model, PARTS, FRD0, EI_LOW, EI_HIGH } from "./diagrams/console.js";
import { W, H, limb, grain, blur } from "./diagrams/limb.js";

let MAP = null, GRAIN = null;

export function parseSettings(text) {
  const kv = {};
  for (const part of String(text).split(/[;,]/)) {
    const k = part.indexOf("=");
    if (k > 0) kv[part.slice(0, k).trim().toLowerCase()] = part.slice(k + 1).trim().toLowerCase();
  }
  const id = PARTS[kv.part] ? kv.part : "knee", p = PARTS[id];
  const num = (v, d) => (v != null && v !== "" && !isNaN(+v) ? +v : d);
  return {
    part: id,
    kv: num(kv.kv, p.kv),
    mas: num(kv.mas, p.mas),
    frd: num(kv.frd, FRD0),
    spot: kv.spot === "broad" || kv.spot === "fine" ? kv.spot : p.spot,
    grid: kv.grid ? kv.grid === "in" || kv.grid === "yes" || kv.grid === "1" : p.grid,
    motion: num(kv.motion, 0),
    showEi: kv.show !== "image",
  };
}

// Draws the image into a canvas, and returns a plain description of what is shown (for its text alternative and caption).
export function drawCritique(canvas, text) {
  const s = parseSettings(text), m = model(s), p = PARTS[s.part];
  MAP ??= limb(); GRAIN ??= grain();
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d"), img = ctx.createImageData(W, H), d = img.data;
  const w = blur(MAP, Math.round((m.blur + s.motion) * 2) / 2), c = 0.95 * m.contrast;
  for (let i = 0; i < W * H; i++) {
    const v = Math.max(0, Math.min(1, m.level + c * (w[i] - 0.45) + m.noise * GRAIN[i]));
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = Math.round(v * 255);
    d[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const settings = `${p.name} · ${s.kv} kVp · ${+s.mas.toFixed(2)} mAs · ${s.frd} cm · ${s.spot} focus · grid ${s.grid ? "in" : "out"}`;
  const ei = `EI ${m.ei} · the department's range is ${EI_LOW}–${EI_HIGH}`;
  return { settings, ei: s.showEi ? ei : "", alt: `Simulated X-ray image, ${p.name}: a cartoon limb with a bone.${s.showEi ? ` ${settings}. ${ei}.` : ""}` };
}
