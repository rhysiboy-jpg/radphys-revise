// Content checker. Run it before publishing:  node tools/validate.mjs
// It reads every spreadsheet, lesson file and calculation exactly as the app does, and lists anything the app would skip or
// get wrong: duplicate ids, bad answer letters, missing marking points, links to diagrams that don't exist, calculations that
// give nonsense. "Problems" stop a row from working; "Warnings" are worth a look but the app copes.
// It changes nothing. Exit code 1 if there are problems, so it can also run automatically.
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const exists = p => fs.existsSync(path.join(ROOT, p));
const load = p => import(pathToFileURL(path.join(ROOT, p)).href);

// The diagram helpers expect a browser; a stand-in is enough to load the parsers.
globalThis.window ??= { matchMedia: () => ({ matches: false, addEventListener() {} }) };

const { parseCSV } = await load("js/csv.js");
const { parseLessons } = await load("js/lessons.js");
const { fromRow, isValid } = await load("js/content.js");
const { FIGURES } = await load("js/figures.js");
const { PARTS } = await load("js/diagrams/console.js");
const CALCULATIONS = (await load("content/calculations.js")).default;

const problems = [], warnings = [];
const problem = (where, what) => problems.push(`${where}: ${what}`);
const warn = (where, what) => warnings.push(`${where}: ${what}`);

const STATUSES = ["draft", "approved", "rejected"];
const TYPES = ["mcq", "written", "order", "match", "label", "critique"];
const DIFFICULTIES = ["core", "stretch"];
const COLUMNS = ["id", "status", "type", "difficulty", "subtopic", "question", "explanation"];

// Topics, and the diagrams the app can actually load.
const topics = JSON.parse(read("content/topics.json"));
const appJs = read("js/app.js");
const registered = new Map([...appJs.matchAll(/^\s+"?([\w-]+)"?: \(\) => import\("\.\/diagrams\/([\w.-]+)"\)/gm)].map(m => [m[1], `js/diagrams/${m[2]}`]));
const diagramIds = new Set();
for (const t of topics) {
  for (const d of t.diagrams || []) {
    diagramIds.add(d.id);
    if (!registered.has(d.id)) problem(`topics.json, ${t.id}`, `diagram "${d.id}" isn't registered in js/app.js`);
    else if (!exists(registered.get(d.id))) problem(`topics.json, ${t.id}`, `diagram "${d.id}" points to a missing file, ${registered.get(d.id)}`);
  }
  for (const f of t.files || []) if (!exists(f)) problem(`topics.json, ${t.id}`, `spreadsheet ${f} doesn't exist`);
  if (t.lessons && !exists(t.lessons)) problem(`topics.json, ${t.id}`, `lessons file ${t.lessons} doesn't exist`);
}
const topicIds = new Set(topics.map(t => t.id));

// Question spreadsheets.
const ids = new Map();           // id → where it was first seen
const areas = new Map();         // topic → its question areas
let rows = 0;
const seen = (id, where) => {
  if (ids.has(id)) problem(where, `id ${id} is also used in ${ids.get(id)}`);
  else ids.set(id, where);
};
for (const t of topics) {
  areas.set(t.id, new Set());
  for (const file of t.files || []) {
    if (!exists(file)) continue;
    const name = path.basename(file);
    const text = read(file);
    const header = parseCSV(text.split(/\r?\n/)[0] + "\n" + text.split(/\r?\n/)[0])[0];
    for (const c of COLUMNS) if (header && !(c in header)) problem(name, `the "${c}" column is missing`);
    parseCSV(text).forEach((row, i) => {
      rows++;
      const where = `${name}, ${row.id ? `question ${row.id}` : `row ${i + 2}`}`;
      if (!row.id) { problem(where, "no id"); return; }
      seen(row.id, name);
      const status = (row.status || "").toLowerCase(), type = (row.type || "mcq").toLowerCase(), diff = (row.difficulty || "core").toLowerCase();
      if (!STATUSES.includes(status)) problem(where, `status "${row.status}" should be draft, approved or rejected`);
      if (!TYPES.includes(type)) problem(where, `type "${row.type}" isn't one the app knows (${TYPES.join(", ")})`);
      if (!DIFFICULTIES.includes(diff)) warn(where, `difficulty "${row.difficulty}" should be core or stretch`);
      if (!row.question) problem(where, "the question is empty");
      if (!row.subtopic) warn(where, "no subtopic, so it won't appear under any area");
      else areas.get(t.id).add(row.subtopic);
      if (!row.explanation && type !== "written") warn(where, "no explanation");
      if (row.diagram && !diagramIds.has(row.diagram.trim())) problem(where, `diagram "${row.diagram}" doesn't exist`);

      const q = fromRow(row, t.id);
      if (q.kind === "mcq") {
        if (q.options.length < 2) problem(where, "needs at least two options");
        if (!q.answer) problem(where, "no answer letter");
        else if (!q.options.some(o => o.key === q.answer)) problem(where, `answer "${row.answer}" doesn't match a filled-in option`);
        for (const o of q.options) if (o.key !== q.answer && !o.feedback) warn(where, `no "why not" feedback for option ${o.key}`);
        if (q.critique !== undefined) {
          const kv = Object.fromEntries(q.critique.split(/[;,]/).map(s => s.split("=").map(x => x.trim().toLowerCase())).filter(p => p.length === 2));
          if (!q.critique) problem(where, "critique question with no image settings in the figure column");
          if (kv.part && !PARTS[kv.part]) problem(where, `image part "${kv.part}" should be one of ${Object.keys(PARTS).join(", ")}`);
          for (const k of ["kv", "mas", "frd", "motion"]) if (k in kv && isNaN(+kv[k])) problem(where, `image setting ${k}=${kv[k]} isn't a number`);
          for (const k of Object.keys(kv)) if (!["part", "kv", "mas", "frd", "motion", "grid", "spot", "show"].includes(k)) warn(where, `image setting "${k}" isn't recognised, so it's ignored`);
        }
      }
      if (q.kind === "written") {
        if (!q.model) problem(where, "no model answer");
        if (q.points.length === 0) problem(where, "no marking points (separate them with |)");
        else if (q.points.length === 1) warn(where, "only one marking point: check the | separators");
      }
      if (q.kind === "order" && q.items.length < 3) problem(where, "needs at least three items, separated with |");
      if (q.kind === "match") {
        if (q.pairs.length < 3) problem(where, "needs at least three \"left = right\" pairs, separated with |");
        if ((row.items || "").split("|").filter(s => s.trim()).length !== q.pairs.length) problem(where, "an item is missing its \" = \"");
      }
      if (q.kind === "label") {
        if (!FIGURES[q.figure]) problem(where, `figure "${q.figure}" doesn't exist (${Object.keys(FIGURES).join(", ")})`);
        else if (q.labels.length && q.labels.length !== FIGURES[q.figure].labels.length) problem(where, `has ${q.labels.length} labels but the ${q.figure} figure has ${FIGURES[q.figure].labels.length} markers`);
      }
      if (!isValid(q) && !problems.some(p => p.startsWith(where))) problem(where, "the app would skip this row");
    });
  }
}

// Calculations: run each template many times and check every version.
let calcs = 0;
for (const c of CALCULATIONS) {
  calcs++;
  const where = `calculations.js, ${c.id || "a template with no id"}`;
  if (!c.id) { problem(where, "no id"); continue; }
  seen(c.id, "calculations.js");
  if (!topicIds.has(c.topic)) problem(where, `topic "${c.topic}" doesn't exist`);
  if (!STATUSES.includes((c.status || "draft").toLowerCase())) problem(where, `status "${c.status}" should be draft, approved or rejected`);
  if (c.diagram && !diagramIds.has(c.diagram)) problem(where, `diagram "${c.diagram}" doesn't exist`);
  if (typeof c.generate !== "function") { problem(where, "no generate()"); continue; }
  const faults = new Set();
  for (let i = 0; i < 300; i++) {
    let v;
    try { v = c.generate(); } catch (err) { faults.add(`generate() failed: ${err.message}`); break; }
    if (!v || !v.question) faults.add("a version has no question text");
    if (typeof v.answer !== "number" || !Number.isFinite(v.answer)) faults.add(`a version's answer is ${v.answer}, not a number`);
    else if (v.answer === 0) faults.add("a version's answer is 0, which can't be marked within a tolerance");
    if (!(v.tolerance > 0)) faults.add("no tolerance above 0");
    if (/NaN|undefined|Infinity/.test(`${v.question} ${(v.working || []).join(" ")} ${v.explanation || ""}`)) faults.add("a version shows NaN, undefined or Infinity in its text");
    if (!Array.isArray(v.working) || !v.working.length) faults.add("no worked solution");
  }
  for (const f of faults) problem(where, f);
}

// Lessons.
let lessons = 0;
for (const t of topics) {
  if (!t.lessons || !exists(t.lessons)) continue;
  const name = path.basename(t.lessons), lessonIds = new Set();
  for (const l of parseLessons(read(t.lessons))) {
    lessons++;
    const where = `${name}, lesson "${l.title || l.id}"`;
    if (!l.id) problem(where, "no id line");
    else if (lessonIds.has(l.id)) problem(where, `id ${l.id} is used twice in this file`);
    lessonIds.add(l.id);
    if (!STATUSES.includes(l.status)) problem(where, `status "${l.status}" should be draft, approved or rejected`);
    if (l.diagram && !diagramIds.has(l.diagram)) problem(where, `diagram "${l.diagram}" doesn't exist`);
    for (const a of l.areas || []) if (!areas.get(t.id).has(a)) warn(where, `area "${a}" has no questions, so its "Check yourself" link leads nowhere`);
    if (!l.body || !l.body.length) problem(where, "no text");
    if (!l.keyPoints || !l.keyPoints.length) warn(where, "no Key points");
    if (l.predict) {
      const right = l.predict.options.filter(o => o.right).length;
      if (!l.predict.question) problem(where, "the Predict section has no question");
      if (l.predict.options.length < 2) problem(where, "the Predict section needs at least two options (\"- \" lines)");
      if (right !== 1) problem(where, `the Predict section needs exactly one right option, marked "- * " (it has ${right})`);
      if (!l.predict.why) problem(where, "the Predict section has no explanation (a \"> \" line)");
      if (!l.diagram) warn(where, "a Predict section with no diagram to try it on");
    }
  }
}

// Offline copy: every script, the stylesheet and the icon must be listed in CORE in sw.js, or the app breaks offline.
// (Spreadsheets and lessons are found through topics.json, so they needn't be listed.)
const sw = read("sw.js");
const core = new Set([...(sw.match(/const CORE = \[([\s\S]*?)\];/)?.[1] || "").matchAll(/"([^"]+)"/g)].map(m => m[1]));
const walk = dir => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })
  .flatMap(d => d.isDirectory() ? walk(`${dir}/${d.name}`) : [`${dir}/${d.name}`]);
for (const f of [...walk("js"), ...walk("css"), ...walk("icons"), ...walk("fonts"), "content/topics.json", "content/calculations.js", "index.html", "manifest.webmanifest"])
  if (!core.has(f) && /\.(js|css|svg|png|json|html|webmanifest|woff2)$/.test(f)) problem("sw.js", `${f} isn't in the CORE list, so it won't work offline`);
// Fonts and scripts come from the app itself: nothing a page loads may come from another site (privacy, and offline use).
// The one exception: the PowerPoint add-in page must load Microsoft's Office script from Microsoft, and nothing else.
const OFFICE_JS = "https://appsforoffice.microsoft.com/lib/1/hosted/office.js";
for (const f of ["index.html", "addin/index.html", ...walk("css"), ...walk("addin").filter(x => x.endsWith(".css"))]) {
  const ext = (read(f).match(/(?:href|src)=["']https?:\/\/[^"']+|url\(["']?https?:\/\/[^)"']+/g) || [])
    .filter(m => !(f === "addin/index.html" && m.endsWith(OFFICE_JS)));
  if (ext.length) problem(f, `loads from another site: ${ext.join(", ")}`);
}
// The add-in's manifest must point at the live add-in page and the icons, all of which must exist.
if (exists("addin/manifest.xml")) {
  const manifest = read("addin/manifest.xml"), site = "https://rhysiboy-jpg.github.io/radphys-revise/";
  for (const [, url] of manifest.matchAll(/DefaultValue="(https:[^"]+)"/g)) {
    if (!url.startsWith(site)) continue;
    const local = url.slice(site.length).split("#")[0];
    if (local && !exists(local)) problem("addin/manifest.xml", `points at ${local}, which doesn't exist`);
  }
}
for (const f of core) if (f !== "./" && !exists(f)) problem("sw.js", `CORE lists ${f}, which doesn't exist (the offline copy would fail to install)`);

// Report, in plain English.
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
console.log(`Checked ${plural(rows, "question")}, ${plural(calcs, "calculation")}, ${plural(lessons, "lesson")} and ${plural(diagramIds.size, "diagram")}.`);
if (problems.length) { console.log(`\n${plural(problems.length, "problem")} (these need fixing):`); problems.forEach(p => console.log(`  - ${p}`)); }
if (warnings.length) { console.log(`\n${plural(warnings.length, "warning")} (worth a look):`); warnings.forEach(w => console.log(`  - ${w}`)); }
if (!problems.length && !warnings.length) console.log("Everything looks right.");
else if (!problems.length) console.log("\nNo problems.");
process.exitCode = problems.length ? 1 : 0;
