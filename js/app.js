// RadPhys Revise: routes between the home, explore and practise views.
import { CONFIG } from "./config.js";
import { loadContent } from "./content.js";
import { getProgress, record, resetProgress, MAX_BOX } from "./store.js";
import { buildSet, shuffle, parseNumber, isNumericCorrect } from "./quiz.js";

const DIAGRAMS = {
  tube: () => import("./diagrams/tube.js"),
  spectrum: () => import("./diagrams/spectrum.js"),
};

const app = document.getElementById("app");
let content = null;
let cleanups = [];

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const text = s => esc(s).replace(/\n/g, "<br>");
const topicById = id => content.topics.find(t => t.id === id);
const questionsFor = id => content.questions.filter(q => id === "mixed" || q.topic === id);

function header(crumb = "") {
  return `<header class="top">
    <div class="crumbs"><a class="brand" href="#home">RadPhys <span>Revise</span></a>${crumb}</div>
    ${CONFIG.reviewMode ? '<div class="flag">Review mode · draft questions showing</div>' : ""}
  </header>`;
}
function footer() {
  const fb = CONFIG.feedbackUrl ? `<a href="${esc(CONFIG.feedbackUrl)}" target="_blank" rel="noopener">Give feedback on this app</a>` : "";
  return `<footer class="bottom"><span>RadPhys Revise · Created by Rhys Morris</span>${fb}</footer>`;
}
function show(html) {
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
function masteryBar(m) {
  if (!m) return "";
  const label = m.tried ? `${m.pct}%` : "Not started";
  return `<div class="mastery">
    <div class="mastery-top"><span>Mastery · ${m.tried} of ${m.total} tried</span><b>${label}</b></div>
    <div class="bar" role="progressbar" aria-label="Mastery" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m.pct}"><i style="width:${m.pct}%"></i></div>
  </div>`;
}

/* ---------- Home ---------- */
function home() {
  const cards = content.topics.map(t => {
    const n = questionsFor(t.id).length;
    const ready = t.diagrams.filter(d => d.ready).length;
    const counts = [`${n} question${n === 1 ? "" : "s"}`, `${ready} of ${t.diagrams.length} diagram${t.diagrams.length === 1 ? "" : "s"} ready`].join(" · ");
    return `<article class="topic">
      <div class="topic-head"><span class="topic-num">${t.number}</span><h2>${esc(t.title)}</h2></div>
      <p class="blurb">${esc(t.blurb)}</p>
      <p class="counts">${counts}</p>
      ${masteryBar(mastery(t.id))}
      <div class="controls">
        <a class="btn" href="#explore-${t.id}">Explore</a>
        ${n ? `<a class="btn primary" href="#practise-${t.id}">Practise</a>` : '<button type="button" disabled>Practise · questions coming soon</button>'}
      </div>
    </article>`;
  }).join("");

  show(`${header()}
    <section class="intro">
      <p class="eyebrow">First-year diagnostic radiography physics</p>
      <h1 tabindex="-1">Revise the physics behind every exposure</h1>
      <p>Explore interactive diagrams, then practise with questions that explain every answer. Questions you get wrong come back more often until they stick.</p>
      <p class="device-note">Your progress is saved on this device only. Clearing your browser data or switching device starts you afresh.</p>
    </section>
    <section class="topics" aria-label="Topics">${cards}</section>
    <section class="mixed">
      <div><h2>Mixed practice</h2><p class="muted">${CONFIG.setSize} questions from across every topic, weighted towards the ones you find hardest.</p>${masteryBar(mastery("mixed"))}</div>
      <a class="btn primary" href="#practise-mixed">Start mixed practice</a>
    </section>
    <div class="reset-row" data-role="reset-row"><button type="button" class="link" data-role="reset">Reset my progress</button></div>
    ${footer()}`);

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
  const n = questionsFor(id).length;
  const sections = t.diagrams.map(d => d.ready
    ? `<section class="module" aria-labelledby="d-${d.id}"><div class="module-head"><h2 id="d-${d.id}">${esc(d.title)}</h2><p>${esc(d.blurb)}</p></div><div data-diagram="${d.id}"><p class="muted">Loading diagram…</p></div></section>`
    : `<section class="coming"><h2>${esc(d.title)}</h2><p>${esc(d.blurb)} Coming soon.</p></section>`).join("");
  show(`${header('<a href="#home">← All topics</a>')}
    <section class="intro">
      <p class="eyebrow">Topic ${t.number} · Explore</p>
      <h1 tabindex="-1">${esc(t.title)}</h1>
      <p>${esc(t.blurb)} Diagrams are schematic and not to scale.</p>
    </section>
    ${sections}
    ${n ? `<div class="controls"><a class="btn primary" href="#practise-${id}">Practise this topic</a></div>` : ""}
    ${footer()}`);

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
  const t = scope === "mixed" ? { title: "Mixed practice", number: "" } : topicById(scope);
  if (!t) return home();
  const pool = questionsFor(scope);
  const crumb = '<a href="#home">← All topics</a>';
  if (!pool.length) {
    show(`${header(crumb)}<section class="empty"><h1 tabindex="-1">${esc(t.title)}</h1><p>There are no questions for this topic yet.</p><div class="controls"><a class="btn" href="#home">Back to topics</a></div></section>${footer()}`);
    return;
  }

  const set = buildSet(pool, getProgress(), CONFIG);
  const results = [];
  let i = 0;

  function frame(inner) {
    const dots = set.map((_, k) => `<i class="${k < i ? "done" : k === i ? "now" : ""}"></i>`).join("");
    show(`${header(crumb)}<section class="practise">${inner(dots)}</section>${footer()}`);
  }

  function next() {
    i++;
    if (i < set.length) renderQuestion(); else renderResults();
  }

  function renderQuestion() {
    const q = set[i];
    const inst = q.kind === "numeric" ? q.generate() : null;
    const topicTitle = topicById(q.topic)?.title || "";
    const tags = [
      `<span class="tag">${esc(q.subtopic || topicTitle)}</span>`,
      q.difficulty === "stretch" ? '<span class="tag stretch">Stretch</span>' : "",
      q.status !== "approved" ? `<span class="tag draft">Draft · ${esc(q.id)}</span>` : "",
    ].join("");
    const stem = inst ? esc(inst.question) : text(q.question);

    let body = "";
    if (q.kind === "mcq") {
      const opts = shuffle(q.options);
      body = `<fieldset data-role="opts"><legend class="sr">Choose one answer</legend>${opts.map(o =>
        `<label class="opt" data-key="${o.key}"><input type="radio" name="opt" value="${o.key}"><span>${text(o.text)}</span><span class="mark"></span></label>`).join("")}</fieldset>
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

    frame(dots => `
      <div class="q-meta"><span class="eyebrow">${esc(t.title)} · Question ${i + 1} of ${set.length}</span><div class="progress-dots" aria-hidden="true">${dots}</div></div>
      <article class="q-card">
        <div class="tags">${tags}</div>
        <h1 class="q-text" tabindex="-1">${stem}</h1>
        ${body}
        <div class="feedback" data-role="feedback" tabindex="-1" aria-live="polite" hidden></div>
      </article>`);

    const card = app.querySelector(".q-card");
    const check = card.querySelector('[data-role="check"]');
    const fb = card.querySelector('[data-role="feedback"]');
    const nextBtn = `<div class="controls"><button type="button" class="primary" data-role="next">${i + 1 < set.length ? "Next question" : "See results"}</button></div>`;
    const diagramLink = q.diagram && topicById(q.topic)?.diagrams.some(d => d.id === q.diagram && d.ready)
      ? `<p><a href="#explore-${q.topic}">See this in the explorer →</a></p>` : "";
    const finish = () => {
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
          if (k === q.answer) { lab.classList.add("is-correct"); lab.querySelector(".mark").textContent = "Correct answer"; }
          else if (k === chosen) { lab.classList.add("is-wrong"); lab.querySelector(".mark").textContent = "Your answer"; }
        }
        check.parentElement.remove();
        const wrongNote = right ? "" : q.options.find(o => o.key === chosen)?.feedback;
        fb.innerHTML = `<p class="verdict ${right ? "good" : "bad"}">${right ? "✓ Correct" : "✗ Not quite"}</p>
          ${wrongNote ? `<p class="why"><b>Why not your answer:</b> ${text(wrongNote)}</p>` : ""}
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
        const shown = String(+inst.answer.toFixed(2));
        fb.innerHTML = `<p class="verdict ${right ? "good" : "bad"}">${right ? "✓ Correct" : value === null ? "✗ That isn't a number" : "✗ Not quite"}</p>
          <p><b>Answer:</b> ${shown} ${esc(inst.unit)}</p>
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
        fb.innerHTML = `<div class="model"><p class="eyebrow">Model answer</p><p>${text(q.model)}</p></div>
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
      const label = r.kind === "self" ? `${r.ticked}/${r.q.points.length}` : r.score ? "✓ Right" : "✗ Wrong";
      const stem = r.stem || r.q.question;
      return `<li><span class="res ${cls}">${label}</span><span>${esc(stem.length > 140 ? stem.slice(0, 137) + "…" : stem)}</span></li>`;
    }).join("");
    frame(() => `
      <div class="results">
        <p class="eyebrow">${esc(t.title)} · Set complete</p>
        <h1 tabindex="-1">You scored <span class="score">${pct}%</span></h1>
        <p class="muted">Written answers count by the share of marking points you ticked. Questions you got wrong will come back more often.</p>
        <ul class="review-list">${rows}</ul>
        ${scope !== "mixed" ? masteryBar(mastery(scope)) : ""}
        <div class="controls"><button type="button" class="primary" data-role="again">Practise again</button><a class="btn" href="#home">Back to topics</a></div>
      </div>`);
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
    app.innerHTML = `${header()}<section class="empty"><h1>RadPhys Revise couldn't load</h1><p>Check your connection and refresh the page. If you're offline, open the app once while online so it can be saved for offline use.</p></section>`;
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
