// A practice set: ten or so questions, one at a time, each marked with feedback, then a results page with every answer to
// reopen. It handles all the question types (multiple choice, calculation, written, put in order, match, label, image
// critique). The page helpers it needs (show a page, the footer, topic look-ups, the progress bar) are handed in by app.js as
// `ui`, so this file never imports app.js.
import { CONFIG } from "./config.js";
import { getProgress, record } from "./store.js";
import { buildSet, shuffle, parseNumber, isNumericCorrect, isUpsideDown, resultMark } from "./quiz.js";
import { FIGURES, drawFigure } from "./figures.js";
import { drawCritique } from "./critique.js";
import { esc, MARKS } from "./html.js";

const text = s => esc(s).replace(/\n/g, "<br>");
const ordinal = n => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;
// The verdict for a question marked in parts (order, match, label): "All 5 matched", "3 of 5 matched".
const verdict = (got, n, what) => got === n
  ? `<p class="verdict good">${MARKS.right}All ${n} ${what}</p>`
  : `<p class="verdict ${got / n >= 0.4 ? "self" : "bad"}">${got / n >= 0.4 ? "" : MARKS.wrong}${got} of ${n} ${what}</p>`;

// ui: the page helpers from app.js. scope: a topic id or "mixed". area: one question area within the topic.
// retry: a fixed list of questions (the ones missed in the last set) instead of a fresh set.
export function practise(ui, scope, area = null, retry = null, label = null) {
  const { show, footer, home, topicById, questionsFor, shown, topicProgress, progressBar, trackScale, onLeave, MASTERY_AFTER } = ui;
  const app = document.getElementById("app");
  const topic = scope === "mixed" ? { title: label || "Mixed Practice", number: "" } : topicById(scope);
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
      if (r) ({ cls, label } = resultMark(r));
      else if (k === i && q) { cls = "now"; label = "Now"; }
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
        <div class="controls"><button type="button" class="primary" data-role="check" disabled>Check answer</button></div>
        <p class="kbd-hint" aria-hidden="true">Keyboard: press 1–${opts.length} to choose, Enter to check, then Enter again for the next question.</p>`;
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
    // Point to the lesson for this question's area if there is one, otherwise to the diagram.
    const qLesson = topicById(q.topic)?.lessonList?.find(l => l.areas.includes(q.subtopic));
    const diagramLink = qLesson
      ? `<p><a href="#learn-${q.topic}/${qLesson.id}">Read the lesson: ${esc(qLesson.title)} →</a></p>`
      : q.diagram && topicById(q.topic)?.diagrams.some(d => d.id === q.diagram && shown(d))
        ? `<p><a href="#diagram-${q.topic}/${q.diagram}">See this in the diagram →</a></p>` : "";
    const refreshRail = () => {
      const old = app.querySelector('aside[aria-label="This set"]');
      old.outerHTML = rail(q);
    };
    const finish = () => {
      refreshRail();
      fb.hidden = false;
      fb.focus();
      fb.querySelector('[data-role="next"]').addEventListener("click", next);
      // Enter on the feedback (where the focus lands) moves on, so a keyboard user can keep going without hunting for the button.
      fb.addEventListener("keydown", e => { if (e.key === "Enter" && e.target === fb) { e.preventDefault(); next(); } });
    };

    if (q.kind === "mcq") {
      const opts = card.querySelector('[data-role="opts"]');
      opts.addEventListener("change", () => { check.disabled = false; });
      // Keyboard: 1–5 picks an option by its position on screen (the options are shuffled, so letters wouldn't match), Enter checks.
      card.addEventListener("keydown", e => {
        if (opts.disabled || e.ctrlKey || e.metaKey || e.altKey) return;
        const radios = [...opts.querySelectorAll('input[type="radio"]')];
        const k = /^[1-9]$/.test(e.key) ? +e.key - 1 : -1;
        if (k >= 0 && k < radios.length) {
          e.preventDefault();
          radios[k].checked = true;
          radios[k].focus();
          opts.dispatchEvent(new Event("change", { bubbles: true }));
        } else if (e.key === "Enter" && opts.contains(e.target) && !check.disabled) {
          e.preventDefault();
          check.click();
        }
      });
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
        const flipped = !right && isUpsideDown(value, inst.answer, inst.tolerance);
        fb.innerHTML = `<p class="verdict ${right ? "good" : "bad"}">${right ? `${MARKS.right}Correct` : value === null ? `${MARKS.wrong}That isn't a number` : `${MARKS.wrong}Not quite`}</p>
          ${value === null ? `<p class="why"><span>Type a number, such as 0.25, 1/4, 3e8 or 1.5 × 10^-2.</span></p>` : flipped ? `<p class="why"><span>Your answer is the right one turned upside down: ${esc(input.value.trim())} instead of ${+inst.answer.toFixed(2)}. Check which way round the question asks for it.</span></p>` : ""}
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
        onLeave(trackScale(card));
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
      const { cls, label } = resultMark(r, " right");
      const stem = r.stem || r.q.question;
      return `<li><details><summary><span class="res ${cls}">${label}</span><span class="stem">${esc(stem.length > 140 ? stem.slice(0, 137) + "…" : stem)}</span></summary>
        <div class="detail">${detail(r)}</div></details></li>`;
    }).join("");

    const actions = missed.length
      ? `<button type="button" class="primary" data-role="retry">Practise the ${missed.length === 1 ? "one" : missed.length} I missed</button><button type="button" data-role="again">New set</button>`
      : `<button type="button" class="primary" data-role="again">New set</button>`;
    const progress = topicProgress(scope);
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
    app.querySelector('[data-role="again"]').addEventListener("click", () => practise(ui, scope, area));
    app.querySelector('[data-role="retry"]')?.addEventListener("click", () => practise(ui, scope, area, missed, label));
  }

  renderQuestion();
}
