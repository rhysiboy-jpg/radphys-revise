// Progress saved in this browser only. Each question has a "box" from 0 (needs work) to 5 (secure).
const KEY = "radphys-revise.progress.v1";
export const MAX_BOX = 5;

let cache = null;

export function getProgress() {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { cache = {}; }
  return cache;
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* storage blocked: progress lasts for this visit only */ }
}

// outcome: true (right), false (wrong) or a 0–1 self-marked score.
export function record(id, outcome) {
  const p = getProgress();
  const r = p[id] || { box: 0, seen: 0, right: 0, last: 0, lastWrong: 0 };
  const score = typeof outcome === "number" ? outcome : outcome ? 1 : 0;
  if (score >= 0.7) { r.box = Math.min(MAX_BOX, r.box + 1); r.right++; }
  else if (score < 0.4) { r.box = 0; r.lastWrong = Date.now(); }
  r.seen++;
  r.last = Date.now();
  p[id] = r;
  save();
}

export function resetProgress() {
  cache = {};
  try { localStorage.removeItem(KEY); } catch { /* nothing to clear */ }
}
