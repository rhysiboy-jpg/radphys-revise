// Tests for the app's own logic: reading answers, marking, picking practice sets, saving and loading progress, and reading
// the spreadsheets and lesson files, and diagram set-up links. Run before publishing, alongside the content checker:  node tools/test.mjs
// No installs needed. Exit code 1 if any test fails.
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = p => import(pathToFileURL(path.join(ROOT, p)).href);

// The progress store uses the browser's localStorage; a stand-in in memory is enough here.
const mem = new Map();
globalThis.localStorage = {
  getItem: k => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: k => mem.delete(k),
};

const { parseNumber, isNumericCorrect, isUpsideDown, buildSet } = await load("js/quiz.js");
const store = await load("js/store.js");
const { parseCSV } = await load("js/csv.js");
const { parseLessons } = await load("js/lessons.js");
const { changedFrom, encodeSetup, decodeSetup } = await load("js/setup.js");

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed++; } catch (err) { failures.push(`${name}: ${err.message}`); }
}
function equal(actual, expected, what = "") {
  const ok = typeof expected === "number" && typeof actual === "number"
    ? Math.abs(actual - expected) <= Math.abs(expected) * 1e-12
    : JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) throw new Error(`${what} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

// ---------- Reading a typed answer ----------
test("number entry: the forms students type", () => {
  const cases = {
    "2.5": 2.5, "-3": -3, ".5": 0.5, "1,000": 1000, "12,500": 12500, "2,5": 2.5, "3e8": 3e8, "1.5E-2": 0.015,
    "1.5 × 10^-2": 0.015, "1.5x10-2": 0.015, "1.5 × 10⁻²": 0.015, "10^-2": 0.01, "1/4": 0.25, "40 µGy/h": 40,
    "4 times lower": 4, "−4": -4, "1.28 × 10⁻¹⁴ J": 1.28e-14,
  };
  for (const [typed, value] of Object.entries(cases)) equal(parseNumber(typed), value, `"${typed}":`);
});
test("number entry: things that aren't numbers", () => {
  for (const typed of ["", "abc", "1/0", "1.2.3", "2e"]) equal(parseNumber(typed), null, `"${typed}":`);
});

// ---------- Marking ----------
test("marking: within the tolerance counts as right", () => {
  equal(isNumericCorrect(101, 100, 0.02), true, "101 for 100 at ±2%:");
  equal(isNumericCorrect(103, 100, 0.02), false, "103 for 100 at ±2%:");
  equal(isNumericCorrect(null, 100, 0.02), false, "not a number:");
});
test("marking: an answer turned upside down is spotted", () => {
  equal(isUpsideDown(0.25, 4, 0.001), true, "1/4 for 4:");
  equal(isUpsideDown(4, 4, 0.001), false, "the right answer:");
  equal(isUpsideDown(1, 1, 0.001), false, "1 is its own reciprocal:");
});

// ---------- Picking a practice set ----------
const pool = [
  ...Array.from({ length: 20 }, (_, i) => ({ id: `M${i}`, kind: "mcq" })),
  ...Array.from({ length: 8 }, (_, i) => ({ id: `W${i}`, kind: "written" })),
];
test("practice sets: the right size, no repeats, written questions capped and last", () => {
  for (let run = 0; run < 200; run++) {
    const set = buildSet(pool, {}, { setSize: 10, maxWrittenPerSet: 2 });
    equal(set.length, 10, "set size:");
    equal(new Set(set.map(q => q.id)).size, 10, "distinct questions:");
    const written = set.filter(q => q.kind === "written").length;
    if (written > 2) throw new Error(`${written} written questions in one set`);
    const firstWritten = set.findIndex(q => q.kind === "written");
    if (firstWritten >= 0 && set.slice(firstWritten).some(q => q.kind !== "written")) throw new Error("a written question came before a quick one");
  }
});
test("practice sets: a question answered wrongly comes up more than a secure one", () => {
  const two = [{ id: "weak", kind: "mcq" }, { id: "secure", kind: "mcq" }];
  const old = Date.now() - 86400e3;
  const progress = { weak: { box: 0, last: old, lastWrong: old }, secure: { box: 5, last: old, lastWrong: 0 } };
  let weakFirst = 0;
  for (let run = 0; run < 2000; run++) if (buildSet(two, progress, { setSize: 1, maxWrittenPerSet: 2 })[0].id === "weak") weakFirst++;
  if (weakFirst < 1500) throw new Error(`the weak question was picked first only ${weakFirst} times in 2000`);
});

// ---------- Recording progress ----------
test("progress: right answers move a question up, wrong ones back to the start", () => {
  store.resetProgress();
  store.record("Q1", true); store.record("Q1", true);
  equal(store.getProgress().Q1.box, 2, "after two right:");
  store.record("Q1", false);
  equal(store.getProgress().Q1.box, 0, "after a wrong one:");
  equal(store.lastResult(store.getProgress().Q1), "revisit", "latest result:");
  store.record("Q1", 0.5);
  equal(store.lastResult(store.getProgress().Q1), "partly", "a half-marked written answer:");
});

test("clearing: progress and lesson ticks are both removed", () => {
  store.record("Q9", true);
  store.markVisited("atomic/units");
  store.resetProgress();
  equal(Object.keys(store.getProgress()).length, 0, "progress left:");
  equal(store.visitedLessons().size, 0, "lesson ticks left:");
});

// ---------- Backup and transfer ----------
test("backup: loading merges, and newer work on the device is kept", () => {
  store.resetProgress();
  store.record("HERE", true);
  const here = store.getProgress().HERE;
  const backup = { app: "radphys-revise-progress", version: 1, progress: {
    HERE: { box: 0, seen: 9, right: 0, last: here.last - 1000, lastWrong: 0 },   // older than the device's own record
    NEW: { box: 3, seen: 3, right: 3, last: Date.now(), lastWrong: 0 },
    BAD: { box: "x" },
  }, lessons: ["atomic/units"] };
  equal(store.importProgress(backup), 1, "questions changed:");
  equal(store.getProgress().HERE.box, here.box, "the newer record on the device:");
  equal(store.getProgress().NEW.box, 3, "a question only in the backup:");
  equal("BAD" in store.getProgress(), false, "a damaged record is skipped:");
  equal(store.visitedLessons().has("atomic/units"), true, "lesson ticks:");
});
test("backup: a file that isn't a backup is refused", () => {
  let refused = false;
  try { store.importProgress({ hello: 1 }); } catch { refused = true; }
  equal(refused, true, "refused:");
});

// ---------- Reading the spreadsheets ----------
test("spreadsheets: Excel's quotes, commas, line breaks and byte-order mark", () => {
  const rows = parseCSV('﻿id,Question,answer\r\nQ1,"Commas, and ""quotes""",A\r\nQ2,"Two\nlines",B\r\n\r\n');
  equal(rows.length, 2, "rows:");
  equal(rows[0].question, 'Commas, and "quotes"', "quoted field:");
  equal(rows[1].question, "Two\nlines", "line break in a cell:");
  equal(rows[0].id, "Q1", "header with a byte-order mark:");
});

// ---------- Reading the lesson files ----------
test("lessons: details, explanation, Try this and Key points", () => {
  const [l] = parseLessons(`<!-- a comment -->
# The X-ray tube
id: tube
summary: The parts of the tube.
areas: The X-ray tube; Filtration
diagram: tube
status: draft

An **X-ray tube** turns energy into X-rays.

## Try this
- Press Play.

## Key points
- Tungsten target.
`);
  equal([l.title, l.id, l.diagram, l.status], ["The X-ray tube", "tube", "tube", "draft"], "details:");
  equal(l.areas, ["The X-ray tube", "Filtration"], "areas:");
  equal(l.body.includes("<b>X-ray tube</b>"), true, "bold in the explanation:");
  equal(l.tryThis.includes("Press Play"), true, "Try this:");
  equal(l.keyPoints.includes("Tungsten target"), true, "Key points:");
});

test("lessons: a Predict question, its options, the right one and the explanation", () => {
  const [l] = parseLessons(`# Spectrum
id: spectrum
status: draft

Text.

## Predict
Raise the **kVp**: what happens to the highest photon energy?
- It stays the same
- * It rises to match the new kVp
> The highest energy in keV equals the kVp.
`);
  equal(l.predict.question, "Raise the <b>kVp</b>: what happens to the highest photon energy?", "question:");
  equal(l.predict.options.map(o => o.right), [false, true], "which is right:");
  equal(l.predict.why, "The highest energy in keV equals the kVp.", "explanation:");
  equal(parseLessons("# A\nid: a\n\nText.\n")[0].predict, null, "no Predict section:");
});

// ---------- Diagram set-ups in the web address ----------
test("set-up links: only changed settings, and they read back the same", () => {
  const start = { "spec-kv": "80", "spec-ma": "200", target: "W" };
  const now = { "spec-kv": "120", "spec-ma": "200", target: "Mo" };
  const changed = changedFrom(start, now);
  equal(changed, { "spec-kv": "120", target: "Mo" }, "changed:");
  equal(decodeSetup(encodeSetup(changed)), changed, "round trip:");
  equal(decodeSetup(encodeSetup({ a: "+" })), { a: "+" }, "a value needing escaping:");
});
test("set-up links: odd addresses are ignored, not trusted", () => {
  equal(decodeSetup(""), {}, "empty:");
  equal(decodeSetup(undefined), {}, "none:");
  equal(Object.keys(decodeSetup("<b>=1&ok=2")), ["ok"], "a strange name:");
  equal(decodeSetup("k=" + "9".repeat(200)).k.length, 40, "a long value is cut short:");
});

console.log(`${passed} of ${passed + failures.length} tests passed.`);
if (failures.length) { console.log("\nFailed:"); failures.forEach(f => console.log(`  - ${f}`)); }
process.exitCode = failures.length ? 1 : 0;
