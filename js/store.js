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
  try { localStorage.removeItem(KEY); localStorage.removeItem(LESSONS); } catch { /* nothing to clear */ }
}

// Lessons visited on this device, as "topic/lesson" keys, for the ticks on a topic's contents page.
const LESSONS = "radphys-revise.lessons.v1";
export function visitedLessons() {
  try { return new Set(JSON.parse(localStorage.getItem(LESSONS)) || []); } catch { return new Set(); }
}
export function markVisited(key) {
  const seen = visitedLessons();
  seen.add(key);
  try { localStorage.setItem(LESSONS, JSON.stringify([...seen])); } catch { /* storage blocked: ticks last for this visit only */ }
}

// Backup and transfer: everything this device knows, as a small file the student keeps. Nothing goes to a server.
const BACKUP = "radphys-revise-progress";
export function exportProgress() {
  return { app: BACKUP, version: 1, saved: new Date().toISOString(), progress: getProgress(), lessons: [...visitedLessons()] };
}

// Loads a backup by merging it with what's here: for each question the more recent record wins, so loading an older
// backup never throws away newer work. Returns how many questions it changed, or throws a plain-English error.
export function importProgress(data) {
  if (!data || data.app !== BACKUP || typeof data.progress !== "object" || data.progress === null) throw new Error("That file isn't a RadPhys Revise backup.");
  const p = getProgress();
  let changed = 0;
  for (const [id, r] of Object.entries(data.progress)) {
    if (!r || typeof r !== "object" || !Number.isFinite(r.box) || !Number.isFinite(r.last)) continue;
    if (!p[id] || r.last > (p[id].last || 0)) {
      p[id] = { box: Math.max(0, Math.min(MAX_BOX, r.box)), seen: +r.seen || 0, right: +r.right || 0, last: r.last, lastWrong: +r.lastWrong || 0, ...(Number.isFinite(r.lastScore) ? { lastScore: r.lastScore } : {}) };
      changed++;
    }
  }
  save();
  if (Array.isArray(data.lessons)) {
    const seen = visitedLessons();
    data.lessons.forEach(k => typeof k === "string" && seen.add(k));
    try { localStorage.setItem(LESSONS, JSON.stringify([...seen])); } catch { /* storage blocked */ }
  }
  return changed;
}
