// RadPhys Revise: routes between the home, explore and practise views.
import { CONFIG } from "./config.js";
import { loadContent } from "./content.js";
import { getProgress, record, resetProgress, MAX_BOX } from "./store.js";
import { buildSet, shuffle, parseNumber, isNumericCorrect } from "./quiz.js";

const DIAGRAMS = {
  tube: () => import("./diagrams/tube.js"),
  spectrum: () => import("./diagrams/spectrum.js"),
  bohr: () => import("./diagrams/bohr.js"),
  target: () => import("./diagrams/target.js"),
  "pe-compton": () => import("./diagrams/pecompton.js"),
  isl: () => import("./diagrams/isl.js"),
};

// A question is "secure" once it has been answered right this many times since the last slip.
const SECURE_BOX = 4;

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

function nav(active) {
  const link = (href, key, label, extra = "") =>
    `<a href="${href}"${active === key ? ' aria-current="page"' : ""}>${label}${extra}</a>`;
  const topics = content.topics.map(t => {
    const m = mastery(t.id);
    return link(`#explore-${t.id}`, t.id, `<span class="n">${t.number}</span><span>${esc(t.title)}</span>`,
      m && m.tried ? `<span class="pct">${m.pct}%</span>` : "");
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
      <span>Created by Rhys Morris</span>${fb}
    </div>`;
  const btn = side.querySelector(".menu-btn");
  btn.addEventListener("click", () => {
    const open = side.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
    btn.textContent = open ? "Close" : "Menu";
  });
}

function footer() {
  return `<footer class="bottom"><span>RadPhys Revise · Created by Rhys Morris</span><span>Progress is saved on this device only</span></footer>`;
}
function show(html, active) {
  nav(active);
  app.innerHTML = html;
  window.scrollTo(0, 0);
  (app.querySelector("h1") || app).focus({ preventScroll: true });
}

function mastery(topicId) {
  const qs = questionsFor(topicId);
  if (!qs.length) return null;
  const p = getProgress();
  let sum = 0, tried = 0;
  for (const q of qs) if (p[q.id]) { sum += p[q.id].box; tried++; }
  return { pct: Math.round((100 * sum) / (MAX_BOX * qs.length)), tried, total: qs.length };
}
function masteryBar(m, label = "Mastery") {
  if (!m) return "";
  const value = m.tried ? `${m.pct}%` : "Not started";
  return `<div class="mastery">
    <div class="mastery-top"><span>${label ? `${label} · ` : ""}${m.tried} of ${m.total} tried</span><b>${value}</b></div>
    <div class="bar" role="progressbar" aria-label="${label || "Mastery"}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m.pct}"><i style="width:${m.pct}%"></i></div>
  </div>`;
}

/* ---------- Home ---------- */
function home() {
  const p = getProgress();
  const all = content.questions;
  const tried = all.filter(q => p[q.id]).length;
  const due = all.filter(q => p[q.id] && p[q.id].box === 0);
  const secure = all.filter(q => p[q.id]?.box >= SECURE_BOX).length;
  const overall = mastery("mixed");
  const withQs = content.topics.filter(t => questionsFor(t.id).length);
  const diagramsReady = content.topics.reduce((s, t) => s + t.diagrams.filter(shown).length, 0);
  const diagramsAll = content.topics.reduce((s, t) => s + t.diagrams.length, 0);

  // The screen's one finding, and the topic the main button opens.
  let next = withQs[0], finding;
  if (!tried) {
    finding = next ? `Nothing tried yet. ${esc(next.title)} has ${plural(questionsFor(next.id).length, "question")} ready.` : "Questions are on their way.";
  } else if (due.length) {
    const byTopic = withQs.map(t => ({ t, n: due.filter(q => q.topic === t.id).length })).sort((a, b) => b.n - a.n);
    next = byTopic[0].t;
    finding = `${plural(due.length, "question")} to try again, most in ${esc(next.title)}.`;
  } else {
    next = withQs.map(t => ({ t, m: mastery(t.id) })).sort((a, b) => a.m.pct - b.m.pct)[0].t;
    finding = `Nothing due again. ${esc(next.title)} is your lowest topic at ${mastery(next.id).pct}%.`;
  }

  const tiles = [
    ["Overall mastery", overall?.tried ? `${overall.pct}<small>%</small>` : "0<small>%</small>", "Across every question"],
    ["Questions tried", `${tried} <small>of ${all.length}</small>`, CONFIG.reviewMode ? "Draft questions included" : "Approved questions"],
    ["Secure", `${secure}`, `Right ${SECURE_BOX} times since your last slip`],
    ["Due another go", `${due.length}`, "Wrong the last time you tried them", due.length ? "alert" : ""],
  ].map(([label, value, cap, cls = ""]) =>
    `<div class="tile s3 ${cls}"><span class="label">${label}</span><span class="value">${value}</span><span class="cap">${cap}</span></div>`).join("");

  const rows = content.topics.map(t => {
    const n = questionsFor(t.id).length;
    const ready = t.diagrams.filter(shown).length;
    return `<article class="topic">
      <span class="n">${t.number}</span>
      <div class="topic-main">
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.blurb)}</p>
        <p class="counts">${plural(n, "question")} · ${ready} of ${plural(t.diagrams.length, "diagram")} ready</p>
      </div>
      <div class="topic-side">
        ${n ? masteryBar(mastery(t.id), "") : '<span class="soon">Questions coming soon</span>'}
        <div class="controls">
          <a class="btn" href="#explore-${t.id}" aria-label="Explore ${esc(t.title)}">Explore</a>
          ${n ? `<a class="btn" href="#practise-${t.id}" aria-label="Practise ${esc(t.title)}">Practise</a>` : ""}
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
      ${next ? `<a class="btn primary" href="#practise-${next.id}">${tried ? "Continue" : "Start"}: ${esc(next.title)}</a>` : ""}
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
          <p class="muted">${diagramsReady} of ${diagramsAll} diagrams are ready to explore. Your progress is saved in this browser only; clearing it or switching device starts you afresh.</p>
          <div class="reset-row" data-role="reset-row"><button type="button" class="link" data-role="reset">Reset my progress</button></div>
        </section>
      </div>
    </div>
    ${footer()}`, "home");

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
  const m = mastery(id);

  const status = d => !shown(d) ? ["later", "Coming soon"] : d.approved ? ["ready", "Ready"] : ["review", "Awaiting sign-off"];
  const diagramRows = t.diagrams.map(d => `<li><div>${shown(d) ? `<a href="#d-${d.id}" data-jump="d-${d.id}">${esc(d.title)}</a>` : `<span>${esc(d.title)}</span>`}<p>${esc(d.blurb)}</p></div>
    <span class="status ${status(d)[0]}">${status(d)[1]}</span></li>`).join("");

  const areas = [...qs.reduce((map, q) => map.set(q.subtopic || "General", (map.get(q.subtopic || "General") || 0) + 1), new Map())]
    .sort((a, b) => b[1] - a[1]);
  const areaRows = areas.length
    ? `<ul class="list">${areas.map(([name, n]) => `<li><span>${esc(name)}</span><span class="meta">${plural(n, "question")}</span></li>`).join("")}</ul>`
    : '<p class="muted">Questions for this topic are being written. Use the diagrams to get ahead.</p>';

  const modules = t.diagrams.filter(shown).map(d =>
    `<section class="module" id="d-${d.id}" aria-labelledby="dh-${d.id}"><div class="module-head"><h2 id="dh-${d.id}">${esc(d.title)}</h2><p>${esc(d.blurb)}</p></div><div data-diagram="${d.id}"><p class="muted">Loading diagram…</p></div></section>`).join("");

  show(`
    <section class="title-row">
      <div>
        <h1 tabindex="-1">${esc(t.title)}</h1>
        <p class="sub">${esc(t.blurb)} Diagrams are schematic and not to scale.</p>
      </div>
      ${qs.length ? `<a class="btn primary" href="#practise-${id}">Practise this topic</a>` : ""}
    </section>
    <div class="grid12">
      <section class="box s6" aria-labelledby="dg-h">
        <div class="box-head"><h2 id="dg-h">Diagrams</h2><span class="count">${t.diagrams.length}</span></div>
        <ul class="list">${diagramRows}</ul>
      </section>
      <section class="box s6" aria-labelledby="qa-h">
        <div class="box-head"><h2 id="qa-h">Question Areas</h2><span class="count">${qs.length}</span></div>
        ${m ? masteryBar(m) : ""}
        ${areaRows}
      </section>
    </div>
    ${modules}
    ${footer()}`, id);

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
    } catch (err) {
      console.error(err);
      box.innerHTML = '<p class="muted">This diagram could not load. Try refreshing the page.</p>';
    }
  }
}

/* ---------- Practise ---------- */
function practise(scope) {
  const t = scope === "mixed" ? { title: "Mixed Practice", number: "" } : topicById(scope);
  if (!t) return home();
  const pool = questionsFor(scope);
  if (!pool.length) {
    show(`<section class="empty"><h1 tabindex="-1">${esc(t.title)}</h1><p>There are no questions for this topic yet.</p><div class="controls"><a class="btn" href="#explore-${scope}">Explore the diagrams</a><a class="btn" href="#home">Back to home</a></div></section>${footer()}`, scope);
    return;
  }

  const set = buildSet(pool, getProgress(), CONFIG);
  const results = [];
  let i = 0;

  // The right-hand rail: where the student is in the set, and what this question is.
  function rail(q) {
    const items = set.map((_, k) => {
      const r = results[k];
      let cls = "wait", label = "–";
      if (r) {
        if (r.kind === "self") { cls = "self"; label = `${r.ticked} of ${r.q.points.length}`; }
        else if (r.score) { cls = "good"; label = `${MARKS.right}Right`; }
        else { cls = "bad"; label = `${MARKS.wrong}Wrong`; }
      } else if (k === i && q) { cls = "now"; label = "Now"; }
      return `<li class="${cls}"><span class="k">${k + 1}</span><span class="r">${label}</span></li>`;
    }).join("");
    const facts = q ? `<section class="box" aria-labelledby="tq-h"><h2 id="tq-h">This Question</h2><dl class="facts">
        <div><dt>Topic</dt><dd>${esc(topicById(q.topic)?.title || "")}</dd></div>
        ${q.subtopic ? `<div><dt>Area</dt><dd>${esc(q.subtopic)}</dd></div>` : ""}
        <div><dt>Level</dt><dd>${q.difficulty === "stretch" ? "Stretch" : "Core"}</dd></div>
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
      <div class="grid12"><div class="stack s8">${main}</div>${rail(q)}</div>${footer()}`, scope);
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
    if (q.kind === "mcq") {
      const opts = shuffle(q.options);
      body = `<fieldset data-role="opts"><legend class="sr">Choose one answer</legend>${opts.map(o =>
        `<label class="opt" data-key="${o.key}"><input type="radio" name="opt" value="${o.key}"><span>${text(o.text)}</span><span class="tagline"></span></label>`).join("")}</fieldset>
        <div class="controls"><button type="button" class="primary" data-role="check" disabled>Check answer</button></div>`;
    } else if (q.kind === "numeric") {
      body = `<div class="field"><label for="num">Your answer</label>
        <div class="num-row"><input type="text" id="num" inputmode="decimal" autocomplete="off"><span class="unit">${esc(inst.unit)}</span></div></div>
        <div class="controls"><button type="button" class="primary" data-role="check" disabled>Check answer</button></div>`;
    } else {
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
        results.push({ q, score: right ? 1 : 0, kind: "auto" });
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
        results.push({ q, score: right ? 1 : 0, kind: "auto", stem: inst.question });
        input.readOnly = true;
        check.parentElement.remove();
        const answerText = String(+inst.answer.toFixed(2));
        fb.innerHTML = `<p class="verdict ${right ? "good" : "bad"}">${right ? `${MARKS.right}Correct` : value === null ? `${MARKS.wrong}That isn't a number` : `${MARKS.wrong}Not quite`}</p>
          <p><b>Answer:</b> ${answerText} ${esc(inst.unit)}</p>
          <ol class="working">${inst.working.map(w => `<li>${esc(w)}</li>`).join("")}</ol>
          ${inst.explanation ? `<p>${esc(inst.explanation)}</p>` : ""}${diagramLink}${nextBtn}`;
        finish();
      };
      check.addEventListener("click", submit);
      input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
    } else {
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
          results.push({ q, score, kind: "self", ticked });
          fb.querySelector(".points").disabled = true;
          e.target.parentElement.remove();
          fb.insertAdjacentHTML("beforeend", `<p class="verdict self">You covered ${ticked} of ${q.points.length} points</p>
            ${q.explanation ? `<p>${text(q.explanation)}</p>` : ""}${diagramLink}${nextBtn}`);
          finish();
        });
      });
    }
  }

  function renderResults() {
    const total = results.reduce((s, r) => s + r.score, 0);
    const pct = Math.round((100 * total) / results.length);
    const rows = results.map(r => {
      const cls = r.kind === "self" ? "self" : r.score ? "good" : "bad";
      const label = r.kind === "self" ? `${r.ticked} of ${r.q.points.length}` : r.score ? `${MARKS.right}Right` : `${MARKS.wrong}Wrong`;
      const stem = r.stem || r.q.question;
      return `<li><span class="res ${cls}">${label}</span><span>${esc(stem.length > 140 ? stem.slice(0, 137) + "…" : stem)}</span></li>`;
    }).join("");
    frame(`<section class="title-row">
        <div><h1 tabindex="-1">Set Complete: ${esc(t.title)}</h1>
        <p class="sub">Written answers count by the share of marking points you ticked. Questions you got wrong will come back more often.</p></div>
        <span class="score" aria-label="Score ${pct}%">${pct}%</span>
      </section>
      ${scope !== "mixed" ? masteryBar(mastery(scope), "Topic mastery") : ""}
      <ul class="review-list">${rows}</ul>
      <div class="controls"><button type="button" class="primary" data-role="again">Practise again</button><a class="btn" href="#home">Back to home</a></div>`, null);
    app.querySelector('[data-role="again"]').addEventListener("click", () => practise(scope));
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
  else if ((m = h.match(/^practise-([\w-]+)$/))) practise(m[1]);
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
  route();
}

start();

// Offline support. Fails quietly where service workers aren't allowed (e.g. the preview page).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
