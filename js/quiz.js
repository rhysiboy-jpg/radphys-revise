// Picks practice sets and marks answers.
import { MAX_BOX } from "./store.js";

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Questions not yet seen, or recently got wrong, are more likely to come up; secure ones less so.
function weight(q, progress, now) {
  const r = progress[q.id];
  if (!r) return 4;
  let w = MAX_BOX + 1 - r.box;
  if (r.lastWrong && now - r.lastWrong < 3 * 24 * 3600e3) w *= 1.5;
  if (now - r.last < 10 * 60e3) w *= 0.25;   // just answered: give it a rest
  return w;
}

export function buildSet(pool, progress, { setSize, maxWrittenPerSet }) {
  const now = Date.now();
  const items = pool.map(q => ({ q, w: weight(q, progress, now) }));
  const chosen = [];
  let written = 0;
  while (chosen.length < setSize && items.length) {
    const total = items.reduce((s, it) => s + it.w, 0);
    let r = Math.random() * total, i = 0;
    while (i < items.length - 1 && (r -= items[i].w) > 0) i++;
    const [{ q }] = items.splice(i, 1);
    if (q.kind === "written" && written >= maxWrittenPerSet) continue;
    if (q.kind === "written") written++;
    chosen.push(q);
  }
  // Written questions last, so the set opens with quick questions.
  return [...chosen.filter(q => q.kind !== "written"), ...chosen.filter(q => q.kind === "written")];
}

export function parseNumber(text) {
  const t = String(text).trim().replace(/\s/g, "").replace(",", ".");
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  return parseFloat(t);
}

export function isNumericCorrect(value, answer, tolerance) {
  if (value === null) return false;
  return Math.abs(value - answer) <= Math.max(Math.abs(answer) * tolerance, 0.005);
}
