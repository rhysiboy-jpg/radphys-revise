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

// Reads a typed answer. Accepts plain numbers (2.5, -3, .5), thousands commas (1,000), a decimal comma (2,5),
// scientific notation in the forms students type (3e8, 1.5E-2, 1.5 × 10^-2, 1.5x10-2, 1.5 × 10⁻², 10^-2), simple fractions
// (1/4), and a unit typed after the number (40 µGy/h). Returns null if it isn't a number.
const SUPER = { "⁻": "-", "⁺": "+", "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };
const NUM = String.raw`[-+]?(?:\d+\.?\d*|\.\d+)`;
const PLAIN = new RegExp(String.raw`^(${NUM})$`);
const E_FORM = new RegExp(String.raw`^(${NUM})[eE]([-+]?\d+)$`);
const TIMES_TEN = new RegExp(String.raw`^(${NUM})[x×*·]10\^?([-+]?\d+)$`);
const FRACTION = new RegExp(String.raw`^(${NUM})/(${NUM})$`);
const POWER = /^10\^([-+]?\d+)$/;

export function parseNumber(text) {
  let t = String(text).trim().replace(/[⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]/g, c => SUPER[c]).replace(/\s/g, "").replace(/[−–]/g, "-");
  // A unit after the number: drop trailing text that has no digits in it (so "10^-2" or "1/4" are left alone).
  t = t.replace(/(\d)([a-zA-Zµμ°%][^\d]*)$/, (m, d, unit) => /^(e|x|×)$/i.test(unit) ? m : d);
  // Commas: "1,000" and "12,500" are thousands; any other comma is a decimal point.
  t = /^[-+]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t) ? t.replace(/,/g, "") : t.replace(",", ".");
  let m;
  if ((m = t.match(PLAIN))) return parseFloat(m[1]);
  if ((m = t.match(E_FORM)) || (m = t.match(TIMES_TEN))) return parseFloat(m[1]) * 10 ** +m[2];
  if ((m = t.match(POWER))) return 10 ** +m[1];
  if ((m = t.match(FRACTION)) && +m[2] !== 0) return parseFloat(m[1]) / parseFloat(m[2]);
  return null;
}

// True when the answer given is the right one turned upside down (1/4 for 4), a common slip on "how many times" questions.
export function isUpsideDown(value, answer, tolerance) {
  return value !== null && value !== 0 && Math.abs(answer) !== 1 && isNumericCorrect(1 / value, answer, tolerance);
}

export function isNumericCorrect(value, answer, tolerance) {
  if (value === null) return false;
  return Math.abs(value - answer) <= Math.max(Math.abs(answer) * tolerance, 0.005);
}
