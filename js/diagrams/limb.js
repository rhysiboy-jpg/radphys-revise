// The cartoon limb shared by the exposure console and the windowing explorer: a soft-tissue limb (a fat layer around muscle)
// holding a cartoon "dog bone" with a cracked shaft and marrow spots. No real patient image is used anywhere.

export const W = 360, H = 240;

// A repeatable pseudo-random sequence, so textures and noise hold still between redraws.
export function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }

// Material at each pixel, as attenuation from 0 (air) to 1 (cortical bone).
export const MATERIAL = { air: 0, fat: 0.36, muscle: 0.44, marrow: 0.62, spot: 0.8, cortex: 1 };

const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - (h * h * k) / 4; };
const box = (x, y, cx, cy, hx, hy) => {
  const dx = Math.abs(x - cx) - hx, dy = Math.abs(y - cy) - hy;
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0);
};
const KNOBS = [[80, 98], [80, 142], [280, 98], [280, 142]];

// Signed distance to the bone's edge: negative inside. A shaft with two round knobs at each end, blended smoothly.
function bone(x, y) {
  let d = box(x, y, 180, 120, 96, 17);
  for (const [cx, cy] of KNOBS) d = smin(d, Math.hypot(x - cx, y - cy) - 27, 14);
  return d;
}

// A zig-zag crack across the shaft, as a cartoon would draw it.
function crack(x, y) {
  const t = (y - 96) / 48;
  if (t < 0 || t > 1) return Infinity;
  const zig = [[214, 0], [204, 0.3], [216, 0.55], [206, 0.8], [212, 1]];
  for (let i = 1; i < zig.length; i++) {
    const [x0, t0] = zig[i - 1], [x1, t1] = zig[i];
    if (t >= t0 && t <= t1) return Math.abs(x - (x0 + ((t - t0) / (t1 - t0)) * (x1 - x0)));
  }
  return Infinity;
}

export function limb() {
  const m = new Float32Array(W * H), r = rng(11);
  const spots = Array.from({ length: 46 }, () => {
    const [cx, cy] = KNOBS[Math.floor(r() * 4)];
    const a = r() * Math.PI * 2, d = r() * 17;
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1.6 + r() * 2.2];
  }).concat(Array.from({ length: 14 }, () => [96 + r() * 168, 112 + r() * 16, 1.4 + r() * 1.4]));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    // The limb: a soft wobbly band, with a fat layer under its skin.
    const edge = 80 + 7 * Math.sin(x / 34) + 4 * Math.sin(x / 13 + 1);
    const fromSkin = edge - Math.abs(y - 120);
    let w = fromSkin < 0 ? MATERIAL.air : fromSkin < 12 ? MATERIAL.fat : MATERIAL.muscle;
    const d = bone(x, y);
    if (d < 0) {
      w = d > -7 ? MATERIAL.cortex : MATERIAL.marrow;
      if (d <= -7 && spots.some(([sx, sy, sr]) => Math.hypot(x - sx, y - sy) < sr)) w = MATERIAL.spot;
      if (crack(x, y) < 1.3) w = MATERIAL.marrow - 0.25;
    }
    m[y * W + x] = w;
  }
  return m;
}

// Standard normal noise, one value per pixel, the same every time.
export function grain(seed = 42) {
  const r = rng(seed);
  return Float32Array.from({ length: W * H }, () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r()));
}

// Two box-blur passes, close to a Gaussian, with radius r in pixels.
export function blur(src, r) {
  if (r < 0.5) return src;
  const out = new Float32Array(src), tmp = new Float32Array(src.length), k = Math.round(r);
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let i = -k; i <= k; i++) { const xx = x + i; if (xx >= 0 && xx < W) { s += out[y * W + xx]; n++; } }
      tmp[y * W + x] = s / n;
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let i = -k; i <= k; i++) { const yy = y + i; if (yy >= 0 && yy < H) { s += tmp[yy * W + x]; n++; } }
      out[y * W + x] = s / n;
    }
  }
  return out;
}
