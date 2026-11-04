// RadPhys Revise: routes between the home, explore and practise views.
import { CONFIG } from "./config.js";
import { loadContent } from "./content.js";
import { getProgress, record, resetProgress, lastResult, MAX_BOX } from "./store.js";
import { buildSet, shuffle, parseNumber, isNumericCorrect } from "./quiz.js";
import { FIGURES, drawFigure } from "./figures.js";
import { drawCritique } from "./critique.js";

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
  halflife: () => import("./diagrams/halflife.js"),
  decay: () => import("./diagrams/decay.js"),
  transformer: () => import("./diagrams/transformer.js"),
  rectification: () => import("./diagrams/rectification.js"),
  detectors: () => import("./diagrams/detectors.js"),
  geometry: () => import("./diagrams/geometry.js"),
  "qa-check": () => import("./diagrams/qa.js"),
};

// Mastery (how secure the tried questions are) shows once this many questions have been tried.
const MASTERY_AFTER = 5;

const app = document.getElementById("app");
const side = document.getElementById("side");
let content = null;
let cleanups = [];

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const text = s => esc(s).replace(/\n/g, "<br>");
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const topicById = id => content.topics.find(t => t.id === id);
const questionsFor = id => content.questions.filter(q => id === "mixed" || q.topic === id);
// A diagram is shown once built and signed off; in review mode, built diagrams awaiting sign-off show too.
const shown = d => d.ready && (d.approved || CONFIG.reviewMode);

// Right and wrong are always shown with a mark and words, never by colour alone.
const MARKS = {
  right: '<svg class="mark" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  wrong: '<svg class="mark" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
};
const ordinal = n => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;
// The verdict for a question marked in parts (order, match, label): "All 5 matched", "3 of 5 matched".
const verdict = (got, n, what) => got === n
  ? `<p class="verdict good">${MARKS.right}All ${n} ${what}</p>`
  : `<p class="verdict ${got / n >= 0.4 ? "self" : "bad"}">${got / n >= 0.4 ? "" : MARKS.wrong}${got} of ${n} ${what}</p>`;

// current: the active link is this page (aria-current). Otherwise it is only highlighted, e.g. a topic while practising it.
function nav(active, current = true) {
  const link = (href, key, label, extra = "") =>
    `<a href="${href}"${active === key ? (current ? ' aria-current="page"' : ' class="here"') : ""}>${label}${extra}</a>`;
  const topics = content.topics.map(t => {
    const s = standing(t.id);
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
  const btn = side.querySelector(".menu-btn");
  btn.addEventListener("click", () => {
    const open = side.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
    btn.textContent = open ? "Close" : "Menu";
  });
}

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
  // The phone's status bar follows the chosen theme too.
  const bar = { light: "#ECEEF1", dark: "#0E0F11" };
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => {
    m.content = t === "auto" ? (m.media.includes("dark") ? bar.dark : bar.light) : bar[t];
  });
}

function footer() {
  return `<footer class="bottom"><span>RadPhys Revise · Created by Rhys Morris</span><span>Progress is saved on this device only</span></footer>`;
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
function standing(topicId, pool = questionsFor(topicId)) {
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
function tally(s) {
  const parts = [[s.right, "right"], [s.partly, "partly right"], [s.revisit, "to revisit"]].filter(([n]) => n);
  return parts.map(([n, w]) => `${n} ${w}`).join(" · ");
}
// The bar shows the topic's questions: right, partly right and to revisit, then the untried remainder.
function progressBar(s, label) {
  if (!s) return "";
  const seg = (n, cls) => n ? `<i class="${cls}" style="width:${((100 * n) / s.total).toFixed(2)}%"></i>` : "";
  const said = s.tried ? `${s.tried} of ${s.total} tried: ${tally(s)}` : `none of ${s.total} tried yet`;
  return `<div class="mastery">
    <div class="mastery-top"><span>${s.tried ? `${s.tried} of ${s.total} tried` : "Not started"}</span>${s.mastery !== null ? `<span>Mastery ${s.mastery}%</span>` : ""}</div>
    <div class="bar" role="img" aria-label="${esc(label)}: ${said}">${seg(s.right, "right")}${seg(s.partly, "partly")}${seg(s.revisit, "revisit")}</div>
    ${s.tried ? `<p class="tally">${tally(s)}</p>` : ""}
  </div>`;
}

/* ---------- Home ---------- */
function home() {
  const p = getProgress();
  const all = content.questions;
  const s = standing("mixed");
  const revisit = all.filter(q => p[q.id] && lastResult(p[q.id]) === "revisit");
  const withQs = content.topics.filter(t => questionsFor(t.id).length);

  // The screen's one finding, and the topic the main button opens.
  let next = withQs[0], finding;
  if (!s?.tried) {
    finding = next ? `Nothing tried yet. ${esc(next.title)} has ${plural(questionsFor(next.id).length, "question")} ready.` : "Questions are on their way.";
  } else if (revisit.length) {
    const byTopic = withQs.map(t => ({ t, n: revisit.filter(q => q.topic === t.id).length })).sort((a, b) => b.n - a.n);
    next = byTopic[0].t;
    finding = `${s.right ? `${s.right} right so far. ` : ""}${plural(revisit.length, "question")} to revisit, most in ${esc(next.title)}; they come back sooner in your sets.`;
  } else {
    // Nothing to revisit: point at the topic with the most still to try.
    next = withQs.map(t => ({ t, s: standing(t.id) })).sort((a, b) => a.s.tried / a.s.total - b.s.tried / b.s.total)[0].t;
    finding = `${s.right} right and nothing to revisit. ${esc(next.title)} has the most questions still to try.`;
  }

  const tiles = [
    ["Tried", `${s?.tried ?? 0} <small>of ${all.length}</small>`, CONFIG.reviewMode ? "Draft questions included" : "Questions across every topic"],
    ["Right last time", `${s?.right ?? 0}`, s?.partly ? `Plus ${s.partly} partly right` : "Your latest try at each question"],
    ["To revisit", `${revisit.length}`, "These come back sooner in your sets"],
    ["Mastery", s?.mastery != null ? `${s.mastery}<small>%</small>` : "<small>Not yet</small>",
      s?.mastery != null ? "Grows each time you get a question right again" : `Shows once you've tried ${MASTERY_AFTER} questions`],
  ].map(([label, value, cap]) =>
    `<div class="tile s3"><span class="label">${label}</span><span class="value">${value}</span><span class="cap">${cap}</span></div>`).join("");

  const rows = content.topics.map(t => {
    const n = questionsFor(t.id).length;
    const diagrams = t.diagrams.filter(shown).length;
    return `<article class="topic">
      <span class="n">${t.number}</span>
      <div class="topic-main">
        <h3><a href="#explore-${t.id}">${esc(t.title)}</a></h3>
        <p>${esc(t.blurb)}</p>
        <p class="counts">${plural(n, "question")}${diagrams ? ` · ${plural(diagrams, "diagram")} to explore` : ""}</p>
      </div>
      <div class="topic-side">
        ${n ? progressBar(standing(t.id), t.title) : '<span class="soon">Questions coming soon</span>'}
        <div class="controls">
          ${n ? `<a class="btn" href="#practise-${t.id}" aria-label="Practise ${esc(t.title)}">Practise</a>`
            : diagrams ? `<a class="btn" href="#explore-${t.id}" aria-label="Explore ${esc(t.title)}">Explore</a>` : ""}
        </div>
      </div>
    </article>`;
  }).join("");

  show(`
    <section class="title-row">
      <div>
        <h1 tabindex="-1">RDR-1173 Physics Revision</h1>
        <p class="sub">${finding}</p>
      </div>
      ${next ? `<a class="btn primary" href="#practise-${next.id}">${s?.tried ? "Continue" : "Start"}: ${esc(next.title)}</a>` : ""}
    </section>
    <section class="grid12 tiles" aria-label="Your progress">${tiles}</section>
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
          <div class="reset-row" data-role="reset-row"><button type="button" class="link" data-role="reset">Reset my progress</button></div>
        </section>
      </div>
    </div>
    ${footer()}`, "home", { title: "Home" });

  const row = app.querySelector('[data-role="reset-row"]');
  row.addEventListener("click", e => {
    const role = e.target.dataset.role;
    if (role === "reset") {
      row.innerHTML = '<span>Delete all your progress on this device?</span><button type="button" class="danger" data-role="confirm">Yes, reset</button><button type="button" data-role="cancel">Cancel</button>';
      row.querySelector('[data-role="cancel"]').focus();
    } else if (role === "confirm") { resetProgress(); home(); }
    else if (role === "cancel") { row.innerHTML = '<button type="button" class="link" data-role="reset">Reset my progress</button>'; }
  });
}

/* ---------- Explore ---------- */
async function explore(id) {
  const t = topicById(id);
  if (!t) return home();
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
      ${qs.length ? progressBar(standing(id), t.title) : ""}
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

  for (const box of app.querySelectorAll("[data-diagram]")) {
    const loader = DIAGRAMS[box.dataset.diagram];
    if (!loader) { box.innerHTML = '<p class="muted">This diagram is not available yet.</p>'; continue; }
    try {
      const mod = await loader();
      if (!box.isConnected) return;   // the user navigated away while loading
      cleanups.push(mod.mount(box));
      cleanups.push(trackScale(box));
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
// scope: a topic id or "mixed". area: one question area within the topic.
// retry: a fixed list of questions (the ones missed in the last set) instead of a fresh set.
function practise(scope, area = null, retry = null) {
  const topic = scope === "mixed" ? { title: "Mixed Practice", number: "" } : topicById(scope);
  if (!topic) return home();
  const t = { ...topic, title: area ? `${topic.title}: ${area}` : topic.title };
  const pool = questionsFor(scope).filter(q => !area || (q.subtopic || "General") === area);
  if (!pool.length) {
    show(`<section class="empty"><h1 tabindex="-1">${esc(t.title)}</h1><p>There are no questions here yet.</p><div class="controls"><a class="btn" href="#explore-${scope}">Explore the diagrams</a><a class="btn" href="#home">Back to home</a></div></section>${footer()}`, scope, { title: t.title, current: false });
    return;
  }

  const set = retry ? shuffle(retry) : buildSet(pool, getProgress(), CONFIG);
  const results = [];
  let i = 0;

  // The right-hand rail: where the student is in the set, and what this question is.
  function rail(q) {
    const items = set.map((_, k) => {
      const r = results[k];
      let cls = "wait", label = "–";
      if (r) {
        if (r.kind === "self") { cls = "self"; label = `${r.ticked} of ${r.q.points.length} points`; }
        else if (r.of) { cls = r.score >= 0.7 ? "good" : r.score >= 0.4 ? "self" : "bad"; label = `${r.score === 1 ? MARKS.right : ""}${r.got} of ${r.of}`; }
        else if (r.score) { cls = "good"; label = `${MARKS.right}Right`; }
        else { cls = "bad"; label = `${MARKS.wrong}Not quite`; }
      } else if (k === i && q) { cls = "now"; label = "Now"; }
      return `<li class="${cls}"><span class="k">${k + 1}</span><span class="r">${label}</span></li>`;
    }).join("");
    const facts = q ? `<section class="box" aria-labelledby="tq-h"><h2 id="tq-h">This Question</h2><dl class="facts">
        <div><dt>Topic</dt><dd>${esc(topicById(q.topic)?.title || "")}</dd></div>
        ${q.subtopic ? `<div><dt>Area</dt><dd>${esc(q.subtopic)}</dd></div>` : ""}
        <div><dt>Level</dt><dd>${q.difficulty === "stretch" ? "Stretch: beyond the core" : "Core"}</dd></div>
        ${q.status !== "approved" ? `<div><dt>Status</dt><dd class="draft">Draft · ${esc(q.id)}</dd></div>` : ""}
      </dl></section>` : "";
    return `<aside class="stack s4" aria-label="This set">
      <section class="box set-box" aria-labelledby="set-h"><h2 id="set-h">This Set</h2><ol class="set-list">${items}</ol></section>
      ${facts}
    </aside>`;
  }

  function frame(main, q) {
    const dots = set.map((_, k) => `<i class="${k < i ? "done" : k === i ? "now" : ""}"></i>`).join("");
    show(`<div class="q-meta"><span>${esc(t.title)} · Question ${Math.min(i + 1, set.length)} of ${set.length}</span><div class="progress-dots" aria-hidden="true">${dots}</div></div>
      <div class="grid12"><div class="stack s8">${main}</div>${rail(q)}</div>${footer()}`, scope,
      { title: `Question ${i + 1} of ${set.length} · ${t.title}`, current: scope === "mixed" });
  }

  function next() {
    i++;
    if (i < set.length) renderQuestion(); else renderResults();
  }

  function renderQuestion() {
    const q = set[i];
    const inst = q.kind === "numeric" ? q.generate() : null;
    const stem = inst ? esc(inst.question) : text(q.question);

    let body = "";
    // Order, match and label: the student's arrangement, kept for marking.
    let order = null, choices = null;
    const fig = q.kind === "label" ? FIGURES[q.figure] : null;
    const figLabels = fig ? (q.labels.length ? q.labels : fig.labels) : null;
    const pickRows = (rows, answers) => {
      const opts = shuffle([...new Set(answers)]);
      return `<div class="match-list" data-role="rows">${rows.map((r, k) => `<div class="match-row" data-k="${r.k}">
          <label for="pick-${k}">${r.label}</label>
          <select id="pick-${k}" class="select"><option value="">Choose…</option>${opts.map(o => `<option>${esc(o)}</option>`).join("")}</select>
          <span class="tagline"></span></div>`).join("")}</div>`;
    };
    if (q.kind === "order") {
      // Shuffled, but never already in the right order.
      do order = shuffle(q.items.map((_, k) => k)); while (order.every((v, k) => v === k));
      body = `<p class="muted q-hint">Move each step into place with its arrows, first at the top.</p>
        <ol class="order-list" data-role="order">${order.map(k => `<li class="order-item" data-item="${k}">
          <span class="order-t">${text(q.items[k])}</span>
          <span class="order-btns"><button type="button" data-move="-1" aria-label="Move up: ${esc(q.items[k])}">↑</button><button type="button" data-move="1" aria-label="Move down: ${esc(q.items[k])}">↓</button></span>
          <span class="tagline"></span></li>`).join("")}</ol>
        <p class="sr" aria-live="polite" data-role="moved"></p>
        <div class="controls"><button type="button" class="primary" data-role="check">Check order</button></div>`;
    } else if (q.kind === "match") {
      choices = shuffle(q.pairs.map((p, k) => ({ k, label: text(p.left) })));
      body = `${pickRows(choices, [...q.pairs.map(p => p.right), ...q.spares])}
        <div class="controls"><button type="button" class="primary" data-role="check" disabled>Check answers</button></div>`;
    } else if (q.kind === "label") {
      choices = figLabels.map((_, k) => ({ k, label: `Label ${k + 1}` }));
      body = `<figure class="stage q-fig"><svg role="img" aria-labelledby="qf-t"><title id="qf-t">${esc(fig.title)}, with ${figLabels.length} numbered labels</title></svg>
          <figcaption class="scale-note">${esc(fig.note)}</figcaption></figure>
        ${pickRows(choices, [...figLabels, ...q.spares])}
        <div class="controls"><button type="button" class="primary" data-role="check" disabled>Check labels</button></div>`;
    }
    if (q.critique) {
      body = `<figure class="q-fig crit"><canvas class="xray" role="img"></canvas><figcaption class="crit-cap" data-role="crit-cap"></figcaption></figure>`;
    }
    if (q.kind === "mcq") {
      const opts = shuffle(q.options);
      body += `<fieldset data-role="opts"><legend class="sr">Choose one answer</legend>${opts.map(o =>
        `<label class="opt" data-key="${o.key}"><input type="radio" name="opt" value="${o.key}"><span>${text(o.text)}</span><span class="tagline"></span></label>`).join("")}</fieldset>
        <div class="controls"><button type="button" class="primary" data-role="check" disabled>Check answer</button></div>`;
    } else if (q.kind === "numeric") {
      body = `<div class="field"><label for="num">Your answer</label>
        <div class="num-row"><input type="text" id="num" inputmode="decimal" autocomplete="off"><span class="unit">${esc(inst.unit)}</span></div></div>
        <div class="controls"><button type="button" class="primary" data-role="check" disabled>Check answer</button></div>`;
    } else if (q.kind === "written") {
      body = `<div class="field"><label for="written">Your answer</label><p class="muted" style="font-size:.9rem">Write it as you would in the exam. Only you will see it. Then compare it with the model answer and mark yourself.</p>
        <textarea id="written"></textarea></div>
        <div class="controls"><button type="button" class="primary" data-role="check">Compare with model answer</button></div>`;
    }

    frame(`<article class="q-card">
        <h1 class="q-text" tabindex="-1">${stem}</h1>
        ${body}
        <div class="feedback" data-role="feedback" tabindex="-1" aria-live="polite" hidden></div>
      </article>`, q);

    const card = app.querySelector(".q-card");
    const check = card.querySelector('[data-role="check"]');
    const fb = card.querySelector('[data-role="feedback"]');
    const nextBtn = `<div class="controls"><button type="button" class="primary" data-role="next">${i + 1 < set.length ? "Next question" : "See results"}</button></div>`;
    const diagramLink = q.diagram && topicById(q.topic)?.diagrams.some(d => d.id === q.diagram && shown(d))
      ? `<p><a href="#explore-${q.topic}">See this in the explorer →</a></p>` : "";
    const refreshRail = () => {
      const old = app.querySelector('aside[aria-label="This set"]');
      old.outerHTML = rail(q);
    };
    const finish = () => {
      refreshRail();
      fb.hidden = false;
      fb.focus();
      fb.querySelector('[data-role="next"]').addEventListener("click", next);
    };

    if (q.kind === "mcq") {
      card.querySelector('[data-role="opts"]').addEventListener("change", () => { check.disabled = false; });
      check.addEventListener("click", () => {
        const chosen = card.querySelector('input[name="opt"]:checked')?.value;
        if (!chosen) return;
        const right = chosen === q.answer;
        record(q.id, right);
        results.push({ q, score: right ? 1 : 0, kind: "auto", chosen });
        card.querySelector("fieldset").disabled = true;
        card.querySelector("fieldset").classList.add("locked");
        for (const lab of card.querySelectorAll(".opt")) {
          const k = lab.dataset.key;
          if (k === q.answer) { lab.classList.add("is-correct"); lab.querySelector(".tagline").innerHTML = `${MARKS.right}Correct answer`; }
          else if (k === chosen) { lab.classList.add("is-wrong"); lab.querySelector(".tagline").innerHTML = `${MARKS.wrong}Your answer`; }
        }
        check.parentElement.remove();
        const wrongNote = right ? "" : q.options.find(o => o.key === chosen)?.feedback;
        fb.innerHTML = `<p class="verdict ${right ? "good" : "bad"}">${right ? `${MARKS.right}Correct` : `${MARKS.wrong}Not quite`}</p>
          ${wrongNote ? `<p class="why"><span><b>Why not your answer:</b> ${text(wrongNote)}</span></p>` : ""}
          ${q.explanation ? `<p>${text(q.explanation)}</p>` : ""}${diagramLink}${nextBtn}`;
        finish();
      });
    } else if (q.kind === "numeric") {
      const input = card.querySelector("#num");
      input.addEventListener("input", () => { check.disabled = !input.value.trim(); });
      const submit = () => {
        if (check.disabled) return;
        const value = parseNumber(input.value);
        const right = isNumericCorrect(value, inst.answer, inst.tolerance);
        record(q.id, right);
        const answerText = String(+inst.answer.toFixed(2));
        results.push({ q, score: right ? 1 : 0, kind: "auto", stem: inst.question, inst, given: input.value.trim(), answerText });
        input.readOnly = true;
        check.parentElement.remove();
        fb.innerHTML = `<p class="verdict ${right ? "good" : "bad"}">${right ? `${MARKS.right}Correct` : value === null ? `${MARKS.wrong}That isn't a number` : `${MARKS.wrong}Not quite`}</p>
          <p><b>Answer:</b> ${answerText} ${esc(inst.unit)}</p>
          <ol class="working">${inst.working.map(w => `<li>${esc(w)}</li>`).join("")}</ol>
          ${inst.explanation ? `<p>${esc(inst.explanation)}</p>` : ""}${diagramLink}${nextBtn}`;
        finish();
      };
      check.addEventListener("click", submit);
      input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
    } else if (q.kind === "written") {
      check.addEventListener("click", () => {
        card.querySelector("#written").readOnly = true;
        check.parentElement.remove();
        fb.innerHTML = `<div class="model"><b>Model answer</b><p>${text(q.model)}</p></div>
          <fieldset class="points"><legend><b>Tick each point your answer covered</b></legend>
            ${q.points.map((pt, k) => `<label class="point"><input type="checkbox" value="${k}"><span>${text(pt)}</span></label>`).join("")}
          </fieldset>
          <div class="controls"><button type="button" class="primary" data-role="save">Save my score</button></div>`;
        fb.hidden = false;
        fb.focus();
        fb.querySelector('[data-role="save"]').addEventListener("click", e => {
          const ticked = fb.querySelectorAll(".points input:checked").length;
          const score = ticked / q.points.length;
          record(q.id, score);
          results.push({ q, score, kind: "self", ticked, written: card.querySelector("#written").value.trim() });
          fb.querySelector(".points").disabled = true;
          e.target.parentElement.remove();
          fb.insertAdjacentHTML("beforeend", `<p class="verdict self">You covered ${ticked} of ${q.points.length} points</p>
            ${q.explanation ? `<p>${text(q.explanation)}</p>` : ""}${diagramLink}${nextBtn}`);
          finish();
        });
      });
    } else if (q.kind === "order") {
      const list = card.querySelector('[data-role="order"]'), said = card.querySelector('[data-role="moved"]');
      const items = () => [...list.children];
      const refresh = () => items().forEach((li, k, all) => {
        li.querySelector('[data-move="-1"]').disabled = k === 0;
        li.querySelector('[data-move="1"]').disabled = k === all.length - 1;
      });
      list.addEventListener("click", e => {
        const btn = e.target.closest("[data-move]");
        if (!btn || btn.disabled) return;
        const li = btn.closest("li"), up = btn.dataset.move === "-1";
        if (up) list.insertBefore(li, li.previousElementSibling); else list.insertBefore(li.nextElementSibling, li);
        refresh();
        const pos = items().indexOf(li) + 1;
        said.textContent = `${q.items[li.dataset.item]}: now ${pos} of ${q.items.length}`;
        (btn.disabled ? li.querySelector(`[data-move="${up ? 1 : -1}"]`) : btn).focus();   // keep the focus on the step that moved
      });
      refresh();
      check.addEventListener("click", () => {
        const given = items().map(li => +li.dataset.item);
        const got = given.filter((v, k) => v === k).length, n = given.length, score = got / n;
        record(q.id, score);
        items().forEach((li, k) => {
          const ok = +li.dataset.item === k;
          li.classList.add(ok ? "is-correct" : "is-wrong");
          li.querySelector(".order-btns").remove();
          li.querySelector(".tagline").innerHTML = ok ? `${MARKS.right}Right place` : `${MARKS.wrong}Belongs ${ordinal(+li.dataset.item + 1)}`;
        });
        list.classList.add("locked");
        check.parentElement.remove();
        const right = `<ol class="working">${q.items.map(s => `<li>${text(s)}</li>`).join("")}</ol>`;
        const review = `<p><b>Your order:</b></p><ol class="working">${given.map((v, k) => `<li>${v === k ? MARKS.right : MARKS.wrong} ${text(q.items[v])}</li>`).join("")}</ol>
          ${score < 1 ? `<p><b>Right order:</b></p>${right}` : ""}`;
        results.push({ q, score, kind: "auto", got, of: n, review });
        fb.innerHTML = `${verdict(got, n, "in the right place")}${score < 1 ? `<p><b>The right order:</b></p>${right}` : ""}
          ${q.explanation ? `<p>${text(q.explanation)}</p>` : ""}${diagramLink}${nextBtn}`;
        finish();
      });
    } else if (q.kind === "match" || q.kind === "label") {
      const rows = [...card.querySelectorAll(".match-row")];
      const want = k => q.kind === "match" ? q.pairs[k].right : figLabels[k];
      const name = k => q.kind === "match" ? q.pairs[k].left : `Label ${k + 1}`;
      card.querySelector('[data-role="rows"]').addEventListener("change", () => {
        check.disabled = rows.some(r => !r.querySelector("select").value);
      });
      if (q.kind === "label") {
        drawFigure(card.querySelector(".q-fig svg"), q.figure);
        cleanups.push(trackScale(card));
      }
      check.addEventListener("click", () => {
        const marks = rows.map(r => {
          const k = +r.dataset.k, sel = r.querySelector("select"), ok = sel.value === want(k);
          sel.disabled = true;
          r.classList.add(ok ? "is-correct" : "is-wrong");
          r.querySelector(".tagline").innerHTML = ok ? `${MARKS.right}Right` : `${MARKS.wrong}Answer: ${esc(want(k))}`;
          return { k, ok, given: sel.value };
        }).sort((a, b) => a.k - b.k);
        const got = marks.filter(m => m.ok).length, n = marks.length, score = got / n;
        record(q.id, score);
        check.parentElement.remove();
        const review = `<ul class="working plain">${marks.map(m => `<li>${m.ok ? MARKS.right : MARKS.wrong} <b>${esc(name(m.k))}:</b> ${esc(m.given)}${m.ok ? "" : ` · <b>answer:</b> ${esc(want(m.k))}`}</li>`).join("")}</ul>`;
        results.push({ q, score, kind: "auto", got, of: n, review });
        fb.innerHTML = `${verdict(got, n, q.kind === "label" ? "labels right" : "matched")}
          ${q.explanation ? `<p>${text(q.explanation)}</p>` : ""}${diagramLink}${nextBtn}`;
        finish();
      });
    }
    if (q.critique) {
      const canvas = card.querySelector(".q-fig canvas"), shot = drawCritique(canvas, q.critique);
      canvas.setAttribute("aria-label", shot.alt);
      card.querySelector('[data-role="crit-cap"]').innerHTML = `${esc(shot.settings)}${shot.ei ? `<br><b>${esc(shot.ei)}</b>` : ""}`;
      if (!shot.ei) card.querySelector('[data-role="crit-cap"]').textContent = "Judge the image itself: no settings shown.";
    }
  }

  // What the student answered and why, shown again when a row on the results screen is opened.
  function detail(r) {
    const q = r.q, parts = [];
    if (r.kind === "self") {
      if (r.written) parts.push(`<div class="model"><b>Your answer</b><p>${text(r.written)}</p></div>`);
      parts.push(`<div class="model"><b>Model answer</b><p>${text(q.model)}</p></div>`);
    } else if (q.kind === "mcq") {
      const opt = k => q.options.find(o => o.key === k);
      if (!r.score) {
        parts.push(`<p><b>Your answer:</b> ${text(opt(r.chosen)?.text)}</p>`);
        if (opt(r.chosen)?.feedback) parts.push(`<p class="why"><span><b>Why not:</b> ${text(opt(r.chosen).feedback)}</span></p>`);
      }
      parts.push(`<p><b>Correct answer:</b> ${text(opt(q.answer)?.text)}</p>`);
    } else if (r.review) {
      parts.push(r.review);
    } else if (r.inst) {
      parts.push(`<p><b>Your answer:</b> ${esc(r.given)} ${esc(r.inst.unit)} · <b>Answer:</b> ${r.answerText} ${esc(r.inst.unit)}</p>`,
        `<ol class="working">${r.inst.working.map(w => `<li>${esc(w)}</li>`).join("")}</ol>`);
    }
    if (q.explanation) parts.push(`<p>${text(q.explanation)}</p>`);
    return parts.join("");
  }

  function renderResults() {
    const n = results.length;
    const right = results.filter(r => r.score >= 0.7).length;
    const partly = results.filter(r => r.score >= 0.4 && r.score < 0.7).length;
    const missed = results.filter(r => r.score < 0.7).map(r => r.q);
    // Lead with what went right; the missed ones are framed as what comes next, not as failure.
    const lead = right === n ? `All ${n} right. These questions will now come back less often.`
      : !right && !partly ? `None right this time, and that's normal on a first go. Open any question below to read why; they'll all come back sooner.`
      : `${right} right${partly ? `, ${partly} partly right` : ""}. The ${missed.length === 1 ? "one" : missed.length} you didn't fully get will come back sooner, so each set moves you on.`;

    const rows = results.map(r => {
      const good = r.score >= 0.7;
      const cls = r.kind === "self" ? "self" : good ? "good" : r.of && r.score >= 0.4 ? "self" : "bad";
      const label = r.kind === "self" ? `${r.ticked} of ${r.q.points.length} points`
        : r.of ? `${r.score === 1 ? MARKS.right : ""}${r.got} of ${r.of} right`
        : good ? `${MARKS.right}Right` : `${MARKS.wrong}Not quite`;
      const stem = r.stem || r.q.question;
      return `<li><details><summary><span class="res ${cls}">${label}</span><span class="stem">${esc(stem.length > 140 ? stem.slice(0, 137) + "…" : stem)}</span></summary>
        <div class="detail">${detail(r)}</div></details></li>`;
    }).join("");

    const actions = missed.length
      ? `<button type="button" class="primary" data-role="retry">Practise the ${missed.length === 1 ? "one" : missed.length} I missed</button><button type="button" data-role="again">New set</button>`
      : `<button type="button" class="primary" data-role="again">New set</button>`;
    const progress = standing(scope);
    show(`<section class="title-row">
        <div><h1 tabindex="-1">Set complete</h1>
        <p class="sub">${esc(t.title)}</p></div>
      </section>
      <div class="grid12">
        <div class="stack s8">
          <div class="result-lead">
            <p class="score">${right ? `${right}<small> of ${n} right</small>` : `${n}<small> ${n === 1 ? "question" : "questions"} tried</small>`}</p>
            <p>${lead}</p>
            <div class="controls">${actions}<a class="btn" href="#home">Back to home</a></div>
          </div>
          <section aria-labelledby="rv-h" class="stack">
            <h2 id="rv-h">Your answers <span class="muted">· open one to see why</span></h2>
            <ul class="review-list">${rows}</ul>
          </section>
        </div>
        <aside class="stack s4" aria-label="Progress">
          <section class="box" aria-labelledby="tp-h"><h2 id="tp-h">${scope === "mixed" ? "All topics" : esc(topic.title)}</h2>
            ${progressBar(progress, scope === "mixed" ? "All topics" : topic.title)}
            ${progress.mastery === null ? `<p class="muted">Mastery shows once you've tried ${MASTERY_AFTER} questions.</p>` : ""}
          </section>
        </aside>
      </div>${footer()}`, scope, { title: `Set complete · ${t.title}`, current: scope === "mixed" });
    app.querySelector('[data-role="again"]').addEventListener("click", () => practise(scope, area));
    app.querySelector('[data-role="retry"]')?.addEventListener("click", () => practise(scope, area, missed));
  }

  renderQuestion();
}

/* ---------- Router ---------- */
function route() {
  cleanups.forEach(fn => { try { fn?.(); } catch { /* already gone */ } });
  cleanups = [];
  const h = location.hash.slice(1) || "home";
  let m;
  if ((m = h.match(/^explore-([\w-]+)$/))) explore(m[1]);
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
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
