// RadPhys Revise: routes between the home, explore and practise views.
import { CONFIG } from "./config.js";
import { loadContent } from "./content.js";
import { getProgress, resetProgress, lastResult, MAX_BOX, visitedLessons, markVisited, exportProgress, importProgress } from "./store.js";
import { esc, MARKS } from "./html.js";
import { practise as runPractise } from "./practise.js";
import { apaCredit, creditYear, diagramSvg, svgToPng, save, graphics } from "./export.js";
import { readSetup, applySetup, changedFrom, encodeSetup, decodeSetup, calmSliders } from "./setup.js";

const DIAGRAMS = {
  tube: () => import("./diagrams/tube.js"),
  spectrum: () => import("./diagrams/spectrum.js"),
  bohr: () => import("./diagrams/bohr.js"),
  target: () => import("./diagrams/target.js"),
  "pe-compton": () => import("./diagrams/pecompton.js"),
  isl: () => import("./diagrams/isl.js"),
  console: () => import("./diagrams/console.js"),
  windowing: () => import("./diagrams/windowing.js"),
  "dose-ladder": () => import("./diagrams/dose.js"),
  sorter: () => import("./diagrams/sorter.js"),
  "cell-damage": () => import("./diagrams/cell.js"),
  "dose-response": () => import("./diagrams/doseresponse.js"),
  "population-risk": () => import("./diagrams/population.js"),
  "tissue-weights": () => import("./diagrams/tissues.js"),
  justify: () => import("./diagrams/justify.js"),
  "dose-choices": () => import("./diagrams/dosechoices.js"),
  halflife: () => import("./diagrams/halflife.js"),
  decay: () => import("./diagrams/decay.js"),
  transformer: () => import("./diagrams/transformer.js"),
  rectification: () => import("./diagrams/rectification.js"),
  detectors: () => import("./diagrams/detectors.js"),
  geometry: () => import("./diagrams/geometry.js"),
  "qa-check": () => import("./diagrams/qa.js"),
  "qa-lifecycle": () => import("./diagrams/lifecycle.js"),
  "qa-sort": () => import("./diagrams/qasort.js"),
  nuclides: () => import("./diagrams/nuclides.js"),
  consent: () => import("./diagrams/consent.js"),
  "designated-areas": () => import("./diagrams/areas.js"),
  "duty-holders": () => import("./diagrams/dutyholders.js"),
  regulations: () => import("./diagrams/regulations.js"),
  dosimeters: () => import("./diagrams/dosimeters.js"),
  "gas-detector": () => import("./diagrams/gasdetector.js"),
  dap: () => import("./diagrams/dap.js"),
  aec: () => import("./diagrams/aec.js"),
  "noise-dqe": () => import("./diagrams/noise.js"),
  processing: () => import("./diagrams/processing.js"),
  digitisation: () => import("./diagrams/digitise.js"),
  "xray-circuit": () => import("./diagrams/xcircuit.js"),
  "ohms-law": () => import("./diagrams/ohm.js"),
  conductors: () => import("./diagrams/conductors.js"),
  "em-spectrum": () => import("./diagrams/emspectrum.js"),
  "electron-energy": () => import("./diagrams/energy.js"),
};

// Mastery (how secure the tried questions are) shows once this many questions have been tried.
const MASTERY_AFTER = 5;

const app = document.getElementById("app");
const side = document.getElementById("side");
let content = null;
let cleanups = [];

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const topicById = id => content.topics.find(t => t.id === id);
const questionsFor = id => content.questions.filter(q => id === "mixed" || q.topic === id);
// A diagram is shown once built and signed off; in review mode, built diagrams awaiting sign-off show too.
const shown = d => d.ready && (d.approved || CONFIG.reviewMode);

// current: the active link is this page (aria-current). Otherwise it is only highlighted, e.g. a topic while practising it.
function nav(active, current = true) {
  const link = (href, key, label, extra = "") =>
    `<a href="${href}"${active === key ? (current ? ' aria-current="page"' : ' class="here"') : ""}>${label}${extra}</a>`;
  const topics = content.topics.map(t => {
    const s = topicProgress(t.id);
    return link(`#explore-${t.id}`, t.id, `<span class="n">${t.number}</span><span>${esc(t.title)}</span>`,
      s && s.tried ? `<span class="pct" aria-label="${s.tried} of ${s.total} tried">${s.tried}/${s.total}</span>` : "");
  }).join("");
  const fb = CONFIG.feedbackUrl ? `<a href="${esc(CONFIG.feedbackUrl)}" target="_blank" rel="noopener">Give feedback on this app</a>` : "";
  side.classList.remove("open");
  side.innerHTML = `
    <a class="brand" href="#home"><span class="brand-mark" aria-hidden="true"></span>RadPhys Revise</a>
    <button type="button" class="menu-btn" aria-expanded="false" aria-controls="side-nav">Menu</button>
    <div class="nav" id="side-nav">
      ${link("#home", "home", "Home")}
      ${link("#practise-mixed", "mixed", "Mixed Practice")}
      <p class="nav-label">Topics</p>
      ${topics}
    </div>
    <div class="side-foot">
      ${CONFIG.reviewMode ? '<span class="flag">Review mode: drafts showing</span>' : ""}
      <div class="theme-switch" role="group" aria-label="Theme">
        ${THEMES.map(([id, label]) => `<button type="button" data-theme-choice="${id}" aria-pressed="${theme() === id}">${label}</button>`).join("")}
      </div>
      <span>Created by Rhys Morris</span>${fb}
    </div>`;
  side.querySelectorAll("[data-theme-choice]").forEach(b => b.addEventListener("click", () => {
    setTheme(b.dataset.themeChoice);
    side.querySelectorAll("[data-theme-choice]").forEach(x => x.setAttribute("aria-pressed", x === b));
  }));
  side.querySelector(".menu-btn").addEventListener("click", () => setMenu(!side.classList.contains("open")));
  // Any link closes the phone menu, including one to the page already showing (which doesn't change the address).
  side.querySelectorAll(".nav a, .brand").forEach(a => a.addEventListener("click", () => setMenu(false)));
}

// The phone menu covers the whole screen, so it closes from its own button, a link, or Escape.
function setMenu(open) {
  const btn = side.querySelector(".menu-btn");
  if (!btn || side.classList.contains("open") === open) return;
  side.classList.toggle("open", open);
  btn.setAttribute("aria-expanded", open);
  btn.textContent = open ? "Close" : "Menu";
  if (!open) btn.focus({ preventScroll: true });
}
document.addEventListener("keydown", e => { if (e.key === "Escape" && side.classList.contains("open")) setMenu(false); });

// Theme: Auto follows the device; Light and Dark override it. The choice is kept on this device only.
const THEMES = [["auto", "Auto"], ["light", "Light"], ["dark", "Dark"]];
const THEME_KEY = "radphys-theme";
function theme() {
  try { const t = localStorage.getItem(THEME_KEY); return t === "light" || t === "dark" ? t : "auto"; } catch { return "auto"; }
}
function setTheme(t) {
  try { if (t === "auto") localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, t); } catch { /* storage blocked: lasts for this visit */ }
  if (t === "auto") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  // The phone's status bar follows the chosen theme too: the frame colour of that theme. Auto goes back to the pair of
  // colours index.html started with, one for each device setting.
  const chrome = getComputedStyle(document.documentElement).getPropertyValue("--chrome").trim();
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => {
    m.dataset.auto ??= m.content;
    m.content = t === "auto" || !chrome ? m.dataset.auto : chrome;
  });
}

// Every page closes with who made it, how current it is, what it rests on and how to report a problem: the trust signals
// the credibility research asks for, grouped in one quiet place.
function footer() {
  const report = CONFIG.contactEmail
    ? `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent("RadPhys Revise: error report")}&body=${encodeURIComponent(`Page: ${location.hash || "#home"}\n\nWhat's wrong:\n`)}`
    : CONFIG.feedbackUrl;
  return `<footer class="bottom">
    <span>RadPhys Revise · An independent revision aid by Rhys Morris for RDR-1173 students${CONFIG.lastUpdated ? ` · Last updated ${esc(CONFIG.lastUpdated)}` : ""}</span>
    <span>Not an official Bangor University resource, and not endorsed by Bangor University</span>
    <span>Physics and doses follow reference data: NIST XCOM, ICRP 103, UKHSA, IR(ME)R 2017, IRR17 and IPEM Report 91</span>
    <span>Progress is saved on this device only${report ? ` · <a href="${esc(report)}"${CONFIG.contactEmail ? "" : ' target="_blank" rel="noopener"'}>Report an error</a>` : ""} · <a href="#privacy">Privacy</a> · <a href="#about">About and terms</a> · <a href="#accessibility">Accessibility</a></span>
  </footer>`;
}
function show(html, active, { title = "", current = true } = {}) {
  nav(active, current);
  document.title = title ? `${title} · RadPhys Revise` : "RadPhys Revise";
  app.innerHTML = html;
  window.scrollTo(0, 0);
  (app.querySelector("h1") || app).focus({ preventScroll: true });
}

// Where a student stands: coverage first (tried, and how the latest try at each went), then mastery,
// the average box of the tried questions, once enough have been tried for it to mean something.
function topicProgress(topicId, pool = questionsFor(topicId)) {
  if (!pool.length) return null;
  const p = getProgress();
  const s = { total: pool.length, tried: 0, right: 0, partly: 0, revisit: 0, boxes: 0 };
  for (const q of pool) {
    const r = p[q.id];
    if (!r) continue;
    s.tried++;
    s[lastResult(r)]++;
    s.boxes += r.box;
  }
  s.mastery = s.tried >= MASTERY_AFTER ? Math.round((100 * s.boxes) / (MAX_BOX * s.tried)) : null;
  return s;
}
function resultCounts(s) {
  const parts = [[s.right, "right"], [s.partly, "partly right"], [s.revisit, "to revisit"]].filter(([n]) => n);
  return parts.map(([n, w]) => `${n} ${w}`).join(" · ");
}
// The bar shows the topic's questions: right, partly right and to revisit, then the untried remainder.
function progressBar(s, label) {
  if (!s) return "";
  const seg = (n, cls) => n ? `<i class="${cls}" style="width:${((100 * n) / s.total).toFixed(2)}%"></i>` : "";
  const said = s.tried ? `${s.tried} of ${s.total} tried: ${resultCounts(s)}` : `none of ${s.total} tried yet`;
  return `<div class="mastery">
    <div class="mastery-top"><span>${s.tried ? `${s.tried} of ${s.total} tried` : "Not started"}</span>${s.mastery !== null ? `<span>Mastery ${s.mastery}%</span>` : ""}</div>
    <div class="bar" role="img" aria-label="${esc(label)}: ${said}">${seg(s.right, "right")}${seg(s.partly, "partly")}${seg(s.revisit, "revisit")}</div>
    ${s.tried ? `<p class="tally">${resultCounts(s)}</p>` : ""}
  </div>`;
}

/* ---------- Home ---------- */
function home() {
  const p = getProgress();
  const all = content.questions;
  const s = topicProgress("mixed");
  const revisit = all.filter(q => p[q.id] && lastResult(p[q.id]) === "revisit");
  const withQs = content.topics.filter(t => questionsFor(t.id).length);

  // The screen's one finding and its next steps. The research behind this page (reports/Educational home page design.md):
  // one recommended step with the full topic list below it, practice of what's due made a single tap because students
  // reach for rereading, and progress shown as an action rather than as a row of numbers.
  const lt = content.topics.map(t => ({ t, L: lessonState(t) })).find(x => x.L.total && x.L.done < x.L.total);
  const lessonsStarted = content.topics.some(t => lessonState(t).done);
  const lessonBtn = cls => lt ? `<a class="btn${cls}" href="#learn-${lt.t.id}/${lt.L.next.id}">${lessonsStarted ? "Continue" : "Start"}: ${esc(lt.L.next.title)}</a>` : "";
  const firstVisit = !s?.tried && !lessonsStarted;
  let next = withQs[0], finding, actions;
  if (revisit.length) {
    // Questions answered wrongly come first: practising them is the step with the strongest evidence behind it.
    const byTopic = withQs.map(t => ({ t, n: revisit.filter(q => q.topic === t.id).length })).sort((a, b) => b.n - a.n);
    finding = `${plural(revisit.length, "question")} to revisit, most in ${esc(byTopic[0].t.title)}. Practising them now is the quickest way to make them stick.`;
    actions = `<a class="btn primary" href="#revisit">Practise the ${revisit.length === 1 ? "one" : revisit.length} to revisit</a>${lessonBtn("")}`;
  } else if (!s?.tried) {
    // Before any questions: the lessons teach, and the questions then check.
    if (lt) {
      finding = lessonsStarted
        ? `You're part-way through the lessons. Next: ${esc(lt.t.title)}, lesson ${lt.t.lessonList.indexOf(lt.L.next) + 1} of ${lt.L.total}.`
        : `Start with ${esc(lt.t.title)}: ${plural(lt.L.total, "lesson")}, then ${plural(questionsFor(lt.t.id).length, "question")} to practise.`;
      actions = lessonBtn(" primary");
    } else {
      finding = next ? `${esc(next.title)} has ${plural(questionsFor(next.id).length, "question")} ready.` : "Questions are on their way.";
      actions = next ? `<a class="btn primary" href="#practise-${next.id}">Start: ${esc(next.title)}</a>` : "";
    }
  } else {
    // Nothing to revisit: the topic with the most still to try, with the next lesson beside it.
    next = withQs.map(t => ({ t, s: topicProgress(t.id) })).sort((a, b) => a.s.tried / a.s.total - b.s.tried / b.s.total)[0].t;
    finding = `Nothing to revisit. ${esc(next.title)} has the most questions still to try.`;
    actions = `<a class="btn primary" href="#practise-${next.id}">Practise: ${esc(next.title)}</a>${lessonBtn("")}`;
  }
  // One line on a first visit saying what the app is; after that, a reminder to space practice and a growth-mindset line.
  const second = firstVisit
    ? `Short lessons, interactive diagrams and practice questions for all ${content.topics.length} topics. No login: your progress stays on this device.`
    : "The more you practise, the more you learn. Come back in a few days to review: questions stick better with a gap.";
  // Progress as one line, measured by questions answered (not pages read). Nothing to show until something is tried.
  const progressLine = s?.tried ? `<p class="progress-line" aria-label="Your progress">
      <span><b>${s.tried}</b> of ${all.length} tried${CONFIG.reviewMode ? " (drafts included)" : ""}</span>
      <span><b>${s.right}</b> right last time${s.partly ? `, ${s.partly} partly right` : ""}</span>
      <span>${s.mastery != null ? `Mastery <b>${s.mastery}%</b>` : `Mastery shows once you've tried ${MASTERY_AFTER} questions`}</span></p>` : "";

  const rows = content.topics.map(t => {
    const n = questionsFor(t.id).length, L = lessonState(t);
    const diagrams = t.diagrams.filter(shown).length;
    // Lessons come first: they teach, the questions then check. A topic without lessons keeps its diagrams.
    const counts = L.total ? [plural(L.total, "lesson"), plural(n, "question")]
      : [plural(n, "question"), ...(diagrams ? [`${plural(diagrams, "diagram")} to explore`] : [])];
    const lessonBtn = !L.total ? "" : L.done === L.total
      ? `<a class="btn" href="#explore-${t.id}" aria-label="Lessons for ${esc(t.title)}">Lessons</a>`
      : `<a class="btn" href="#learn-${t.id}/${L.next.id}" aria-label="${L.done ? "Continue" : "Start"} the lessons for ${esc(t.title)}">${L.done ? "Continue lessons" : "Lessons"}</a>`;
    return `<article class="topic">
      <span class="n">${t.number}</span>
      <div class="topic-main">
        <h3><a href="#explore-${t.id}">${esc(t.title)}</a></h3>
        <p>${esc(t.blurb)}</p>
        <p class="counts">${counts.join(" · ")}${L.total && L.done ? ` · ${L.done} of ${L.total} lessons visited` : ""}</p>
      </div>
      <div class="topic-side">
        ${n ? progressBar(topicProgress(t.id), t.title) : '<span class="soon">Questions coming soon</span>'}
        <div class="controls">
          ${lessonBtn}
          ${n ? `<a class="btn" href="#practise-${t.id}" aria-label="Practise ${esc(t.title)}">Practise</a>`
            : !L.total && diagrams ? `<a class="btn" href="#explore-${t.id}" aria-label="Explore ${esc(t.title)}">Explore</a>` : ""}
        </div>
      </div>
    </article>`;
  }).join("");

  show(`
    <section class="title-row">
      <div>
        <h1 tabindex="-1">RDR-1173 Physics Revision</h1>
        <p class="sub">${finding}</p>
        <p class="sub-2">${second}</p>
      </div>
      ${actions ? `<div class="controls hero-actions">${actions}</div>` : ""}
    </section>
    ${progressLine}
    <div class="grid12">
      <section class="box s9" aria-labelledby="topics-h">
        <div class="box-head"><h2 id="topics-h">Topics</h2><span class="count">${content.topics.length}</span></div>
        <div class="rows">${rows}</div>
      </section>
      <div class="stack s3">
        <section class="box" aria-labelledby="mixed-h">
          <h2 id="mixed-h">Mixed Practice</h2>
          <p class="muted">${CONFIG.setSize} questions from every topic, weighted towards the ones you find hardest.</p>
          <a class="btn" href="#practise-mixed">Start mixed practice</a>
        </section>
        <section class="box" aria-labelledby="dev-h">
          <h2 id="dev-h">On This Device</h2>
          <p class="muted">Your progress stays in this browser, on this device. Nothing is sent anywhere, and there's nothing to sign in to.</p>
          <p class="muted">To move it to another device, or keep it safe, save a backup file. Then load it on the other device.</p>
          <div class="controls backup-row">
            <button type="button" data-role="backup">Save a backup</button>
            <label class="btn file-btn">Load a backup<input type="file" accept=".json,application/json" data-role="restore" class="sr"></label>
          </div>
          <p class="backup-msg" data-role="backup-msg" aria-live="polite"></p>
          <div class="reset-row" data-role="reset-row"><button type="button" class="link" data-role="reset">Clear everything this app has stored</button></div>
        </section>
      </div>
    </div>
    ${footer()}`, "home", { title: "Home" });

  const msg = app.querySelector('[data-role="backup-msg"]');
  app.querySelector('[data-role="backup"]').addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(exportProgress())], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `radphys-progress-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    msg.textContent = "Backup saved to your downloads. Load it on another device to carry on there.";
  });
  app.querySelector('[data-role="restore"]').addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const n = importProgress(JSON.parse(await file.text()));
      home();
      app.querySelector('[data-role="backup-msg"]').textContent = n
        ? `Backup loaded: ${n} question${n === 1 ? "" : "s"} updated. Anything newer on this device was kept.`
        : "Backup loaded. This device already had everything in it.";
    } catch (err) {
      msg.textContent = err instanceof SyntaxError ? "That file couldn't be read. Choose a RadPhys Revise backup (.json)." : err.message;
    }
    e.target.value = "";
  });

  const row = app.querySelector('[data-role="reset-row"]');
  row.addEventListener("click", e => {
    const role = e.target.dataset.role;
    if (role === "reset") {
      row.innerHTML = '<span>Delete your progress, lesson ticks and theme choice on this device? Save a backup first if you want to keep them.</span><button type="button" class="danger" data-role="confirm">Yes, clear it</button><button type="button" data-role="cancel">Cancel</button>';
      row.querySelector('[data-role="cancel"]').focus();
    } else if (role === "confirm") { resetProgress(); setTheme("auto"); home(); }   // everything the app stores, theme included
    else if (role === "cancel") { row.innerHTML = '<button type="button" class="link" data-role="reset">Clear everything this app has stored</button>'; }
  });
}

/* ---------- Explore ---------- */
async function explore(id) {
  const t = topicById(id);
  if (!t) return home();
  if (t.lessonList?.length) return contents(t);   // topics with lessons open on their contents page
  const qs = questionsFor(id);
  const visible = t.diagrams.filter(shown);
  const later = t.diagrams.filter(d => !shown(d));

  // The diagrams lead the page; a row of jump links when there is more than one.
  const jumps = visible.length > 1
    ? `<nav class="jumps" aria-label="Diagrams on this page">${visible.map(d => `<a href="#d-${d.id}" data-jump="d-${d.id}">${esc(d.title)}</a>`).join("")}</nav>` : "";
  const laterNote = later.length ? `<p class="later">Coming later: ${later.map(d => esc(d.title)).join(", ")}.</p>` : "";
  // Sign-off status is for the reviewer only; students see just the diagrams.
  const reviewChip = d => CONFIG.reviewMode && !d.approved ? ' <span class="status review">Awaiting sign-off</span>' : "";
  const modules = visible.map(d =>
    `<section class="module" id="d-${d.id}" aria-labelledby="dh-${d.id}"><div class="module-head"><h2 id="dh-${d.id}">${esc(d.title)}${reviewChip(d)}</h2><p>${esc(d.blurb)}</p></div><div data-diagram="${d.id}"><p class="muted">Loading diagram…</p></div></section>`).join("");

  // Each question area starts a set on just that area.
  const areas = [...qs.reduce((map, q) => map.set(q.subtopic || "General", (map.get(q.subtopic || "General") || 0) + 1), new Map())]
    .sort((a, b) => b[1] - a[1]);
  const practiseBox = `<section class="box" aria-labelledby="qa-h">
      <div class="box-head"><h2 id="qa-h">Practise by area</h2></div>
      ${qs.length ? progressBar(topicProgress(id), t.title) : ""}
      ${areas.length
        ? `<ul class="areas">${areas.map(([name, n]) => `<li><a class="area" href="#practise-${id}/${encodeURIComponent(name)}"><span>${esc(name)}</span><span class="meta">${plural(n, "question")}</span></a></li>`).join("")}</ul>`
        : '<p class="muted">Questions for this topic are being written. Use the diagrams to get ahead.</p>'}
    </section>`;

  show(`
    <section class="title-row">
      <div>
        <h1 tabindex="-1">${esc(t.title)}</h1>
        <p class="sub">${esc(t.blurb)}${visible.length ? " Diagrams are schematic and not to scale." : ""}</p>
      </div>
      ${qs.length ? `<a class="btn primary" href="#practise-${id}">Practise this topic</a>` : ""}
    </section>
    ${jumps || laterNote ? `<div class="explore-intro">${jumps}${laterNote}</div>` : ""}
    ${modules}
    ${practiseBox}
    ${footer()}`, id, { title: t.title });

  // In-page jumps without changing the hash, which drives the router.
  for (const a of app.querySelectorAll("[data-jump]")) {
    a.addEventListener("click", e => {
      e.preventDefault();
      const target = document.getElementById(a.dataset.jump);
      target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      target.querySelector("h2")?.setAttribute("tabindex", "-1");
      target.querySelector("h2")?.focus({ preventScroll: true });
    });
  }

  await mountDiagrams();
}

/* ---------- Lessons ---------- */
// The "Practise by area" box, shared by a topic's contents page.
function practiseBox(t) {
  const qs = questionsFor(t.id);
  const areas = [...qs.reduce((map, q) => map.set(q.subtopic || "General", (map.get(q.subtopic || "General") || 0) + 1), new Map())]
    .sort((a, b) => b[1] - a[1]);
  return `<section class="box" aria-labelledby="qa-h">
      <div class="box-head"><h2 id="qa-h">Practise by area</h2></div>
      ${qs.length ? progressBar(topicProgress(t.id), t.title) : ""}
      ${areas.length
        ? `<ul class="areas">${areas.map(([name, n]) => `<li><a class="area" href="#practise-${t.id}/${encodeURIComponent(name)}"><span>${esc(name)}</span><span class="meta">${plural(n, "question")}</span></a></li>`).join("")}</ul>`
        : '<p class="muted">Questions for this topic are being written.</p>'}
    </section>`;
}
const lessonChip = l => CONFIG.reviewMode && l.status !== "approved" ? ' <span class="status review">Draft</span>' : "";

// A topic's lessons on this device: how many, how many visited, and the next one to read (the first not yet visited).
function lessonState(t) {
  const seen = visitedLessons(), list = t.lessonList || [];
  const done = list.filter(l => seen.has(`${t.id}/${l.id}`)).length;
  return { total: list.length, done, next: list.find(l => !seen.has(`${t.id}/${l.id}`)) || list[0] };
}

// A topic's contents: its lessons in order, ticked once visited, with practice by area beside them.
function contents(t) {
  const seen = visitedLessons(), list = t.lessonList;
  const { done, next: nextUp } = lessonState(t);
  const qs = questionsFor(t.id);
  const extras = diagramsOutsideLessons(t);
  const extrasBox = extras.length ? `<section class="box" aria-labelledby="mx-h"><div class="box-head"><h2 id="mx-h">More to explore</h2></div>
      <ul class="areas">${extras.map(d => `<li><a class="area" href="#diagram-${t.id}/${d.id}"><span>${esc(d.title)}</span><span class="meta">Diagram →</span></a></li>`).join("")}</ul></section>` : "";
  show(`
    <section class="title-row">
      <div>
        <h1 tabindex="-1">${esc(t.title)}</h1>
        <p class="sub">${esc(t.blurb)}</p>
      </div>
      <a class="btn primary" href="#learn-${t.id}/${nextUp.id}">${done ? (done === list.length ? "Start again" : "Continue") : "Start the lessons"}</a>
    </section>
    <div class="grid12">
      <section class="lesson-contents ${qs.length || extras.length ? "s8" : "s12"}" aria-labelledby="lc-h">
        <div class="box-head"><h2 id="lc-h">Lessons</h2><p class="muted">${done} of ${list.length} visited</p></div>
        <ol class="lesson-list">${list.map((l, i) => {
          const v = seen.has(`${t.id}/${l.id}`);
          return `<li><a href="#learn-${t.id}/${l.id}" class="lesson-link${v ? " visited" : ""}">
            <span class="ln">${v ? MARKS.right : i + 1}</span>
            <span class="lt"><b>${esc(l.title)}${lessonChip(l)}</b><span>${esc(l.summary)}</span></span>
            <span class="lv">${v ? "Visited" : ""}</span></a></li>`;
        }).join("")}</ol>
      </section>
      ${qs.length || extras.length ? `<div class="s4 contents-side stack">${qs.length ? practiseBox(t) : ""}${extrasBox}</div>` : ""}
    </div>
    ${footer()}`, t.id, { title: t.title });
}

// Diagrams in this topic that no visible lesson shows. A diagram can be approved while the lesson that holds it is still a
// draft; without this list students could never reach it.
function diagramsOutsideLessons(t) {
  const inLessons = new Set(t.lessonList.map(l => l.diagram).filter(Boolean));
  return t.diagrams.filter(d => shown(d) && !inLessons.has(d.id));
}

// A set of just the questions to revisit (last answered wrongly), most recently missed first, from the home page's button.
function practiseRevisit() {
  const p = getProgress();
  const list = content.questions.filter(q => p[q.id] && lastResult(p[q.id]) === "revisit")
    .sort((a, b) => (p[b.id].lastWrong || 0) - (p[a.id].lastWrong || 0)).slice(0, CONFIG.setSize);
  if (!list.length) return home();
  practise("mixed", null, list, "Questions to revisit");
}

// The policy pages linked from every footer: accessibility, privacy, and about and terms of use. The app is an independent
// effort, not a university service, so the pages name no university body. They are drafts until Rhys has checked them; in
// review mode each says what to check.
function policyPage(key, title, check, body) {
  show(`
    <article class="lesson">
      <h1 tabindex="-1">${title}</h1>
      ${CONFIG.reviewMode ? `<p class="lesson-src"><span class="status review">Draft</span> ${check}</p>` : ""}
      <div class="lesson-body">${body.replace(/<(\/?)h3>/g, "<$1h2>")}</div>
    </article>
    ${footer()}`, key, { title });
}
const reportRoute = () => CONFIG.contactEmail || CONFIG.feedbackUrl
  ? `use the "Report an error" link at the foot of any page, or tell your module lecturer`
  : "tell your module lecturer";

// Accessibility statement, in the shape of the GOV.UK model statement. Tested on 5 November 2026; update the dates when
// the app is tested again.
function accessibility() {
  policyPage("accessibility", "Accessibility statement", "As an independent app it isn't covered by the 2018 public sector accessibility regulations, so the statement follows their model voluntarily. If the university ever takes the app on, check it against the university's guidance.", `
    <p>This statement applies to RadPhys Revise, a revision app for the RDR-1173 physics and radiation protection module. It is run by Rhys Morris. It should be usable by as many people as possible. For example, you should be able to:</p>
    <ul>
      <li>zoom the page up to 200% and still read everything, with no sideways scrolling;</li>
      <li>use it on a phone, a tablet or a computer;</li>
      <li>answer the questions and use the diagrams' controls with a keyboard alone (in practice sets, press 1 to 4 to choose an answer and Enter to check it);</li>
      <li>choose a light or dark theme, or follow your device's setting;</li>
      <li>pause anything that moves with the "Pause motion" button beside the diagram, or stop animation through your device's "reduce motion" setting;</li>
      <li>read text descriptions of the simulated X-ray images and of what each diagram shows;</li>
      <li>tell right from wrong answers without relying on colour: each is marked with a tick or a cross and words.</li>
    </ul>
    <h3>How accessible this app is</h3>
    <p>The interactive diagrams are visual and have not yet been tested with a screen reader, so some may be hard to follow that way. Each has labelled controls and a written summary of what it shows. When a slider stops moving, a screen reader reads its new value and the updated summary once, rather than at every step. The lessons and questions explain the same physics in words.</p>
    <h3>Feedback and contact information</h3>
    <p>If you find something you can't use, or need the content in another format, ${reportRoute()}. Say which page and what happened.</p>
    <h3>Technical information about this app's accessibility</h3>
    <p>The aim is to meet the Web Content Accessibility Guidelines (WCAG) version 2.2, level AA: the standard UK public sector websites must meet. This app is an independent effort, so it follows that standard voluntarily.</p>
    <p><b>Compliance status:</b> this app is partially compliant with WCAG 2.2 AA. No failures are known, but it has not yet been tested with screen readers, so it does not claim full compliance.</p>
    <h3>Non-accessible content</h3>
    <p>The diagrams have not been tested with screen readers, so there may be problems we don't yet know about.</p>
    <h3>Preparation of this accessibility statement</h3>
    <p>This statement was prepared on 5 November 2026 and last reviewed on 6 November 2026. The app was last tested on 6 November 2026 by its developer, using automated checks (including tap-target sizes and line contrast in both themes) and manual testing at phone and computer widths, in light and dark themes, and with a keyboard. It has not had an independent audit.</p>`);
}

// Privacy: what the app keeps on the device and why (the storage law's "clear information" requirement), that nothing is
// sent anywhere, and what happens to feedback and error reports.
function privacy() {
  const email = CONFIG.contactEmail ? `<a href="mailto:${esc(CONFIG.contactEmail)}">${esc(CONFIG.contactEmail)}</a>` : "";
  // What the page says depends on which ways of getting in touch are switched on in js/config.js.
  const reports = [
    email ? `If you email an error report, it goes to Rhys Morris at ${email} and is used only to put the problem right.` : "",
    CONFIG.feedbackUrl ? "Feedback form answers are used only to improve the app." : "",
  ].filter(Boolean).join(" ");
  const sending = reports
    ? `${reports} Please don't include personal details you don't need to share.`
    : "The app has no report or feedback link at present, so it sends nothing. To report a problem, tell your module lecturer.";
  const rights = email
    ? `You can ask what is held from a report you sent, or ask for it to be deleted, by emailing ${email}. If you're unhappy with the answer,`
    : "The app holds nothing about you, so there is nothing to ask for or delete beyond clearing your own device, as above. If you have a concern about your data,";
  policyPage("privacy", "Privacy and your data", "No contact email or feedback Form is set, so this page says the app sends nothing. If you add one in <code>js/config.js</code>, the page changes to say where reports go: read it again then.", `
    <p><b>In short:</b> this app doesn't collect your personal data. Your progress stays on your device, and nothing is sent to anyone.</p>
    <h3>What the app keeps on your device</h3>
    <ul>
      <li><b>Your practice progress:</b> for each question you've tried, how you did, when, and how often it should come back.</li>
      <li><b>The lessons you've opened</b>, for the ticks on each topic page.</li>
      <li><b>Your Light or Dark choice</b>, if you pick one. Auto stores nothing.</li>
    </ul>
    <p>These are kept in your browser's storage on this device, not in cookies. They are used only to run features you use: saving your progress and remembering how you like the app to look. There is no tracking, no analytics and no advertising.</p>
    <h3>Clearing it</h3>
    <p>Use <b>Clear everything this app has stored</b> on the home page, or clear this site's data in your browser's settings. A backup file is only made when you save one, and it stays wherever you put it.</p>
    <h3>Hosting</h3>
    <p>The app is hosted on GitHub Pages. Like most web hosts, GitHub records visitors' IP addresses for security, under <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener">GitHub's privacy statement</a>.</p>
    <h3>Feedback and error reports</h3>
    <p>${sending}</p>
    <h3>Your rights</h3>
    <p>${rights} you can complain to the <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener">Information Commissioner's Office</a>.</p>`);
}

// About and terms of use: what the app is for (education, not clinical guidance), how accurate it aims to be, how it may be
// used, and credits.
function about() {
  policyPage("about", "About and terms of use", "Check the wording on using the content, and the independence statement, with your line manager once the IP question is settled.", `
    <p>RadPhys Revise is a free revision app for students taking the RDR-1173 physics and radiation protection module: short lessons, interactive diagrams and practice questions for every topic. It was made by Rhys Morris.</p>
    <h3>An independent revision aid</h3>
    <p>RadPhys Revise is an independent revision aid. It is not an official Bangor University resource, and it is not endorsed by Bangor University. Your lectures and the module's own materials come first: if anything here differs from them, follow them, and please report the difference.</p>
    <h3>What it's for</h3>
    <p>Revision and learning only. It is not clinical guidance: in practice, follow your training, your department's protocols and the regulations. Diagrams are schematic and not to scale, and values marked "illustrative" are not reference data.</p>
    <h3>Accuracy</h3>
    <p>Physics and doses follow reference data: NIST XCOM, ICRP 103, UKHSA, IR(ME)R 2017, IRR17 and IPEM Report 91. Where a lecture slide differs, the app says so. Mistakes can still happen, so if you spot one, ${reportRoute()}. If the app and your lectures disagree on something you'll be assessed on, check with your lecturer.</p>
    <h3>Using the app</h3>
    <p>It's free to use for your own study, with no account. Please don't republish or sell the lessons, questions or diagrams without permission. The date at the foot of each page shows when the app was last updated.</p>
    <h3>Credits</h3>
    <p>Fonts: Figtree (The Figtree Project Authors) and Noto Sans (The Noto Project Authors), both under the SIL Open Font License 1.1. Attenuation data: NIST XCOM photon cross sections database (Berger and colleagues).</p>`);
}

// One diagram on a page of its own: for diagrams outside any visible lesson, and for links from question feedback.
async function diagramPage(topicId, diagramId, query) {
  const t = topicById(topicId), d = t?.diagrams.find(x => x.id === diagramId && shown(x));
  if (!d) return t ? explore(t.id) : home();
  const lessons = t.lessonList.filter(l => l.diagram === d.id);
  const qs = questionsFor(t.id);
  show(`
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#explore-${t.id}">${esc(t.title)}</a><span aria-hidden="true">›</span><span>Diagram</span></nav>
    <section class="title-row">
      <div>
        <h1 tabindex="-1">${esc(d.title)}</h1>
        <p class="sub">${esc(d.blurb)} Schematic and not to scale.</p>
      </div>
      ${qs.length ? `<a class="btn" href="#practise-${t.id}">Practise this topic</a>` : ""}
    </section>
    ${CONFIG.reviewMode && !d.approved ? '<p class="lesson-src"><span class="status review">Awaiting sign-off</span></p>' : ""}
    <section class="module" aria-label="${esc(d.title)}"><div data-diagram="${d.id}"><p class="muted">Loading diagram…</p></div></section>
    ${lessons.length ? `<p>Read more in the lesson${lessons.length > 1 ? "s" : ""}: ${lessons.map(l => `<a href="#learn-${t.id}/${l.id}">${esc(l.title)}</a>`).join(", ")}.</p>` : ""}
    ${footer()}`, t.id, { title: `${d.title} · ${t.title}` });
  await mountDiagrams(decodeSetup(query));
}

// Presentation view: one diagram and nothing else, filling the screen. For projecting in a lecture, and for showing the live
// diagram inside a slide through a web viewer add-in. The address carries the settings, like the diagram page's.
async function present(topicId, diagramId, query) {
  const t = topicById(topicId), d = t?.diagrams.find(x => x.id === diagramId && shown(x));
  if (!d) return t ? explore(t.id) : home();
  document.body.classList.add("presenting");
  document.documentElement.dataset.theme = "light";   // a light background projects best; route() puts the usual theme back
  show(`
    <div class="present-bar">
      <h1 tabindex="-1">${esc(d.title)}</h1>
      <div class="controls">
        <button type="button" data-role="fullscreen">Full screen</button>
        <a class="btn" href="#diagram-${t.id}/${d.id}${query ? "?" + esc(query) : ""}">Exit</a>
      </div>
    </div>
    <section class="module" aria-label="${esc(d.title)}"><div data-diagram="${d.id}"><p class="muted">Loading diagram…</p></div></section>`,
    t.id, { title: `${d.title} · Presentation` });
  const fs = app.querySelector('[data-role="fullscreen"]');
  if (!document.documentElement.requestFullscreen) fs.hidden = true;   // not offered where the browser or an embedding slide forbids it
  fs.addEventListener("click", async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { fs.hidden = true; }
  });
  await mountDiagrams(decodeSetup(query));
}

// One lesson: explanation, the interactive with what to try, key points, practice for its areas, and Previous / Next.
async function lesson(topicId, lessonId) {
  const t = topicById(topicId);
  const list = t?.lessonList || [], i = list.findIndex(l => l.id === lessonId);
  if (i < 0) return t ? explore(t.id) : home();
  const l = list[i], prev = list[i - 1], next = list[i + 1];
  markVisited(`${t.id}/${l.id}`);
  const d = l.diagram && t.diagrams.concat(...content.topics.map(x => x.diagrams)).find(x => x.id === l.diagram && shown(x));
  const qs = questionsFor(t.id);
  const areaLinks = l.areas.map(a => [a, qs.filter(q => q.subtopic === a).length]).filter(([, n]) => n);
  show(`
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#explore-${t.id}">${esc(t.title)}</a><span aria-hidden="true">›</span><span>Lesson ${i + 1} of ${list.length}</span></nav>
    <div class="lesson-top">
      <article class="lesson">
        <h1 tabindex="-1">${esc(l.title)}</h1>
        ${CONFIG.reviewMode && (l.sources || lessonChip(l)) ? `<p class="lesson-src">${lessonChip(l)}${l.sources ? ` Lecture: ${esc(l.sources)}` : ""}</p>` : ""}
        <div class="lesson-body">${l.body}</div>
      </article>
      <aside class="lesson-aside" aria-labelledby="la-h">
        <h2 id="la-h">In this topic</h2>
        <ol class="lesson-mini">${list.map((x, k) => {
          const v = visitedLessons().has(`${t.id}/${x.id}`), here = x === l;
          return `<li><a href="#learn-${t.id}/${x.id}"${here ? ' aria-current="page"' : ""} class="${v && !here ? "visited" : ""}"><span class="ln">${v && !here ? MARKS.right : k + 1}</span><span>${esc(x.title)}</span></a></li>`;
        }).join("")}</ol>
        ${qs.length ? `<a class="btn" href="#practise-${t.id}" aria-label="Practise ${esc(t.title)}">Practise this topic</a>` : ""}
      </aside>
    </div>
    ${d ? `<section class="module lesson-diagram${l.tryThis ? " has-try" : ""}" aria-labelledby="ld-h">
        <div class="module-head"><h2 id="ld-h">Explore: ${esc(d.title)}</h2>${predictCard(l)}${l.tryThis ? `<div class="lesson-try"><b>Try this</b>${l.tryThis}</div>` : ""}</div>
        <div data-diagram="${d.id}"><p class="muted">Loading diagram…</p></div>
      </section>` : ""}
    ${l.keyPoints ? `<section class="key-points" aria-labelledby="kp-h"><h2 id="kp-h">Key points</h2>${l.keyPoints}</section>` : ""}
    ${areaLinks.length ? `<section class="box" aria-labelledby="cy-h"><div class="box-head"><h2 id="cy-h">Check yourself</h2></div>
        <ul class="areas">${areaLinks.map(([a, n]) => `<li><a class="area" href="#practise-${t.id}/${encodeURIComponent(a)}"><span>Practise: ${esc(a)}</span><span class="meta">${plural(n, "question")}</span></a></li>`).join("")}</ul></section>` : ""}
    <nav class="lesson-nav" aria-label="Lessons">
      ${prev ? `<a class="btn" href="#learn-${t.id}/${prev.id}"><span class="dir">← Previous</span><span>${esc(prev.title)}</span></a>` : `<a class="btn" href="#explore-${t.id}"><span class="dir">← Contents</span><span>${esc(t.title)}</span></a>`}
      ${next ? `<a class="btn primary" href="#learn-${t.id}/${next.id}"><span class="dir">Next →</span><span>${esc(next.title)}</span></a>` : (qs.length ? `<a class="btn primary" href="#practise-${t.id}"><span class="dir">Finished: practise →</span><span>${esc(t.title)}</span></a>` : "")}
    </nav>
    ${footer()}`, t.id, { title: `${l.title} · ${t.title}` });
  wirePredict();
  await mountDiagrams();
}

// "Predict first": commit to an answer, try it on the diagram, then check. Predicting before seeing is one of the
// best-supported ways to make an interactive teach (reports/Interactive diagram upgrades.md). Nothing is recorded.
function predictCard(l) {
  const p = l.predict;
  if (!p || p.options.length < 2) return "";
  return `<div class="predict" data-role="predict">
      <p class="predict-q"><b>Predict first:</b> ${p.question}</p>
      <div class="predict-opts" role="group" aria-label="Your prediction">${p.options.map((o, i) =>
        `<button type="button" data-opt="${i}">${o.text}</button>`).join("")}</div>
      <p class="predict-next" hidden>Now try it on the diagram below, then <button type="button" class="link" data-role="check">check your prediction</button>.</p>
      <p class="predict-why" aria-live="polite" hidden></p>
    </div>`;
}
function wirePredict() {
  const card = app.querySelector('[data-role="predict"]');
  if (!card) return;
  const lesson = currentLesson(), p = lesson?.predict;
  if (!p) return;
  let chosen = null;
  card.querySelectorAll("[data-opt]").forEach(b => b.addEventListener("click", () => {
    chosen = +b.dataset.opt;
    card.querySelectorAll("[data-opt]").forEach(x => x.setAttribute("aria-pressed", x === b));
    card.querySelector(".predict-next").hidden = false;
  }));
  card.querySelector('[data-role="check"]').addEventListener("click", () => {
    const right = p.options[chosen]?.right, answer = p.options.find(o => o.right);
    card.querySelectorAll("[data-opt]").forEach((x, i) => {
      x.disabled = true;
      if (p.options[i].right) x.classList.add("is-right");
      else if (i === chosen) x.classList.add("is-wrong");
    });
    card.querySelector(".predict-next").hidden = true;
    const why = card.querySelector(".predict-why");
    why.innerHTML = `<b>${right ? `${MARKS.right}You predicted it.` : `${MARKS.wrong}Not this time. Answer: ${answer.text}.`}</b> ${p.why}`;
    why.hidden = false;
  });
}
// The lesson on screen, from the address (#learn-topic/lesson).
function currentLesson() {
  const m = location.hash.match(/^#learn-([\w-]+)\/([\w-]+)$/);
  return m ? topicById(m[1])?.lessonList.find(l => l.id === m[2]) : null;
}

// "Pause motion" for diagrams with something that moves by itself (WCAG 2.2.2). One switch for the whole app, so a student
// who pauses once isn't met by moving diagrams on the next page.
function addPauseButton(box) {
  const stage = box.querySelector(".stage") || box;
  const row = document.createElement("div");
  row.className = "controls motion-row";
  const b = document.createElement("button");
  b.type = "button";
  const label = () => {
    const paused = document.documentElement.classList.contains("motion-paused");
    b.textContent = paused ? "Play motion" : "Pause motion";
    b.setAttribute("aria-pressed", paused);
  };
  b.addEventListener("click", () => {
    document.documentElement.classList.toggle("motion-paused");
    document.querySelectorAll(".motion-row button").forEach(x => x.dispatchEvent(new Event("relabel")));
  });
  b.addEventListener("relabel", label);
  label();
  row.appendChild(b);
  stage.appendChild(row);
}

// The row under each diagram, the same on all 42: "Reset" (only where there are settings to reset) and "Copy link", a link to
// the diagram's own page that opens with the settings as they are now. The starting state is recorded before any set-up from
// the address is applied, so a link only carries what was changed.
function addDiagramRow(box, start, reset) {
  const t = content.topics.find(x => x.diagrams.some(d => d.id === box.dataset.diagram));
  if (!t) return;
  const row = document.createElement("div");
  row.className = "controls link-row";
  if (Object.keys(start).length) {
    const rb = document.createElement("button");
    rb.type = "button";
    rb.dataset.role = "reset-diagram";
    rb.textContent = "Reset";
    rb.setAttribute("aria-label", "Reset this diagram to its starting settings");
    rb.addEventListener("click", reset);
    row.appendChild(rb);
  }
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = Object.keys(start).length ? "Copy link to this set-up" : "Copy link to this diagram";
  const note = document.createElement("span");
  note.className = "link-note";
  note.setAttribute("aria-live", "polite");
  b.addEventListener("click", async () => {
    const q = encodeSetup(changedFrom(start, readSetup(box)));
    const url = `${location.origin}${location.pathname}#diagram-${t.id}/${box.dataset.diagram}${q ? "?" + q : ""}`;
    try {
      await navigator.clipboard.writeText(url);
      note.textContent = "Link copied. It opens this diagram with these settings.";
    } catch {
      // No clipboard (an older browser, or permission refused): show the link to copy by hand.
      note.innerHTML = `<label>Copy this link: <input type="text" readonly value="${esc(url)}"></label>`;
      note.querySelector("input").select();
    }
  });
  row.append(b);

  // "Present": the diagram alone on a clean page, for projecting or for a web viewer on a slide.
  const setupQuery = () => { const q = encodeSetup(changedFrom(start, readSetup(box))); return q ? "?" + q : ""; };
  const d = t.diagrams.find(x => x.id === box.dataset.diagram);
  const present = document.createElement("button");
  present.type = "button";
  present.dataset.role = "present";
  present.textContent = "Present";
  present.setAttribute("aria-label", "Show this diagram on its own, for projecting");
  present.addEventListener("click", () => { location.hash = `#present-${t.id}/${d.id}${setupQuery()}`; });
  row.append(present);

  // "Download": the diagram as it is now, as a picture for a slide. SVG stays sharp at any size; PNG works everywhere.
  if (graphics(box).length) {
    const download = async kind => {
      note.textContent = "Making the picture…";   // a PNG takes about a second
      try {
        const hosted = !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
        const credit = apaCredit({ author: "Morris, R.", year: creditYear(CONFIG.lastUpdated), title: d.title, site: "RadPhys Revise",
          url: hosted ? `${location.origin}${location.pathname}#diagram-${t.id}/${d.id}` : "" });
        const svg = await diagramSvg(box, { title: d.title, credit });
        const blob = kind === "svg" ? new Blob([svg], { type: "image/svg+xml" }) : await svgToPng(svg);
        save(blob, `radphys-${d.id}.${kind}`);
        note.textContent = `Picture saved as radphys-${d.id}.${kind}.`;
      } catch (err) {
        console.error(err);
        note.textContent = "The picture could not be made. Try the other format.";
      }
    };
    for (const kind of ["svg", "png"]) {
      const db = document.createElement("button");
      db.type = "button";
      db.dataset.role = `download-${kind}`;
      db.textContent = `Download ${kind.toUpperCase()}`;
      db.setAttribute("aria-label", `Download this diagram as ${kind === "svg" ? "an SVG" : "a PNG"} picture`);
      db.addEventListener("click", () => download(kind));
      row.append(db);
    }
  }
  row.append(note);
  box.appendChild(row);
}

// Loads and mounts every [data-diagram] box on the page. A set-up from the address applies to the diagram page's one diagram.
async function mountDiagrams(setup = {}) {
  for (const box of app.querySelectorAll("[data-diagram]")) {
    const loader = DIAGRAMS[box.dataset.diagram];
    if (!loader) { box.innerHTML = '<p class="muted">This diagram is not available yet.</p>'; continue; }
    try {
      const mod = await loader();
      if (!box.isConnected) return;   // the user navigated away while loading
      // Reset builds the diagram again from scratch, which is the one way to be sure every module returns to its start.
      let undo = [];
      const run = given => {
        undo.forEach(fn => { try { fn?.(); } catch { /* already gone */ } });
        undo = [mod.mount(box)];
        const start = readSetup(box);
        if (Object.keys(given).length) applySetup(box, given);
        if (mod.moving) addPauseButton(box);
        addDiagramRow(box, start, () => {
          run({});
          box.querySelector('[data-role="reset-diagram"]')?.focus();
        });
        undo.push(calmSliders(box), trackScale(box));
      };
      run(setup);
      cleanups.push(() => undo.forEach(fn => { try { fn?.(); } catch { /* already gone */ } }));
    } catch (err) {
      console.error(err);
      box.innerHTML = '<p class="muted">This diagram could not load. Try refreshing the page.</p>';
    }
  }
}

// Tells each diagram how far it is scaled down (--u: drawing units per screen pixel), so the CSS can keep its text readable on a phone.
function trackScale(box) {
  const ro = new ResizeObserver(entries => {
    for (const { target } of entries) {
      const w = target.getBoundingClientRect().width, vb = target.viewBox?.baseVal;
      if (w && vb?.width) target.style.setProperty("--u", (vb.width / w).toFixed(3));
    }
  });
  box.querySelectorAll("svg[viewBox]").forEach(svg => ro.observe(svg));
  return () => ro.disconnect();
}

/* ---------- Practise ---------- */
// The practice set itself lives in practise.js. It is handed the page helpers it needs from this file.
const practiceHelpers = {
  show, footer, home, topicById, questionsFor, shown, topicProgress, progressBar, trackScale, MASTERY_AFTER,
  onLeave: fn => cleanups.push(fn),
};
const practise = (...args) => runPractise(practiceHelpers, ...args);

/* ---------- Router ---------- */
function route() {
  cleanups.forEach(fn => { try { fn?.(); } catch { /* already gone */ } });
  cleanups = [];
  if (document.body.classList.contains("presenting")) {
    document.body.classList.remove("presenting");
    const usual = theme();   // back from the presentation view's light theme to the student's own choice
    if (usual === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = usual;
  }
  const h = location.hash.slice(1) || "home";
  let m;
  if ((m = h.match(/^explore-([\w-]+)$/))) explore(m[1]);
  else if ((m = h.match(/^learn-([\w-]+)\/([\w-]+)$/))) lesson(m[1], m[2]);
  else if ((m = h.match(/^diagram-([\w-]+)\/([\w-]+)(?:\?(.*))?$/))) diagramPage(m[1], m[2], m[3]);
  else if ((m = h.match(/^present-([\w-]+)\/([\w-]+)(?:\?(.*))?$/))) present(m[1], m[2], m[3]);
  else if (h === "revisit") practiseRevisit();
  else if (h === "accessibility") accessibility();
  else if (h === "privacy") privacy();
  else if (h === "about") about();
  else if ((m = h.match(/^practise-([\w-]+)(?:\/(.+))?$/))) practise(m[1], m[2] ? decodeURIComponent(m[2]) : null);
  else home();
}

async function start() {
  try {
    content = await loadContent(CONFIG);
  } catch (err) {
    console.error(err);
    app.innerHTML = `<section class="empty"><h1>RadPhys Revise couldn't load</h1><p>Check your connection and refresh the page. If you're offline, open the app once while online so it can be saved for offline use.</p></section>`;
    return;
  }
  window.addEventListener("hashchange", route);
  // Skip link past the sidebar. It focuses the sheet directly, because the hash drives the router.
  const skip = document.createElement("a");
  skip.className = "skip";
  skip.href = "#";
  skip.textContent = "Skip to content";
  skip.addEventListener("click", e => { e.preventDefault(); (app.querySelector("h1") || app).focus(); });
  document.body.prepend(skip);
  route();
}

start();

// Offline support. Fails quietly where service workers aren't allowed (e.g. the preview page).
if ("serviceWorker" in navigator) {
  // When a new version is published, a page that was already open is still running the old one (questions and lessons are
  // loaded when it starts). Offer a refresh rather than reloading by itself, so no one loses a question part-way through.
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadController) offerRefresh(); });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then(reg => {
      // Look for a new version whenever the app comes back to the screen, not just when it's first opened.
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reg.update().catch(() => {}); });
    }).catch(() => {});
  });
}

function offerRefresh() {
  if (document.querySelector(".update-bar")) return;
  const bar = document.createElement("div");
  bar.className = "update-bar";
  bar.setAttribute("role", "status");
  bar.innerHTML = `<span>A new version of RadPhys Revise is ready.</span><button type="button" class="primary">Refresh</button><button type="button" class="link">Later</button>`;
  bar.querySelector(".primary").addEventListener("click", () => location.reload());
  bar.querySelector(".link").addEventListener("click", () => bar.remove());
  document.body.appendChild(bar);
}
