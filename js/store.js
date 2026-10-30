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
  r.lastScore = score;
  p[id] = r;
  save();
}

// How the latest try went: "right" (0.7 or more), "partly" (0.4 to 0.7) or "revisit" (below 0.4).
// Records saved before lastScore existed fall back to the box: above 0 means the last try was right.
export function lastResult(r) {
  const s = r.lastScore ?? (r.box > 0 ? 1 : 0);
  return s >= 0.7 ? "right" : s >= 0.4 ? "partly" : "revisit";
}

export function resetProgress() {
  cache = {};
  try { localStorage.removeItem(KEY); } catch { /* nothing to clear */ }
}
