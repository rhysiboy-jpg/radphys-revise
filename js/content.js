// Loads the topic list, the question spreadsheets and the calculation templates.
import { parseCSV } from "./csv.js";
import { FIGURES } from "./figures.js";
import { parseLessons } from "./lessons.js";
import CALCULATIONS from "../content/calculations.js";

const LETTERS = ["a", "b", "c", "d", "e"];

/** @public Also used by tools/validate.mjs, which loads this file in a way code scanners can't follow. */
export function fromRow(row, topicId) {
  const type = (row.type || "mcq").toLowerCase();
  const base = {
    id: row.id,
    topic: topicId,
    status: (row.status || "draft").toLowerCase(),
    difficulty: (row.difficulty || "core").toLowerCase(),
    subtopic: row.subtopic || "",
    question: row.question,
    explanation: row.explanation || "",
    diagram: row.diagram || "",
  };
  const list = v => (v || "").split("|").map(x => x.trim()).filter(Boolean);
  // Put in order: items are written in the right order and shown shuffled.
  if (type === "order") return { ...base, kind: "order", items: list(row.items) };
  // Match: each item is "left = right"; spares are extra right-hand answers that match nothing.
  if (type === "match") {
    const pairs = list(row.items).map(it => {
      const k = it.indexOf("=");
      return k < 0 ? null : { left: it.slice(0, k).trim(), right: it.slice(k + 1).trim() };
    }).filter(Boolean);
    return { ...base, kind: "match", pairs, spares: list(row.spares) };
  }
  // Label the diagram: a figure from js/figures.js; items (optional) replace its own labels, in marker order.
  if (type === "label") return { ...base, kind: "label", figure: (row.figure || "").trim(), labels: list(row.items), spares: list(row.spares) };
  // Image critique: a single-best-answer question with a simulated image drawn from the settings in "figure".
  const critique = type === "critique" ? { critique: (row.figure || "").trim() } : {};
  if (type === "written") {
    return {
      ...base, kind: "written",
      model: row.model_answer || "",
      points: (row.marking_points || "").split("|").map(s => s.trim()).filter(Boolean),
    };
  }
  const options = LETTERS
    .map(l => ({ key: l.toUpperCase(), text: row["option_" + l] || "", feedback: row["feedback_" + l] || "" }))
    .filter(o => o.text);
  return { ...base, kind: "mcq", options, answer: (row.answer || "").toUpperCase(), ...critique };
}

/** @public Also used by tools/validate.mjs. */
export function isValid(q) {
  if (!q.id || !q.question) return false;
  if (q.kind === "mcq") return q.options.length >= 2 && q.options.some(o => o.key === q.answer);
  if (q.kind === "written") return q.points.length > 0;
  if (q.kind === "order") return q.items.length >= 3;
  if (q.kind === "match") return q.pairs.length >= 3;
  // A label question needs a known figure, and any labels it gives must match the figure's number of markers.
  if (q.kind === "label") return !!FIGURES[q.figure] && (!q.labels.length || q.labels.length === FIGURES[q.figure].labels.length);
  return true;
}

export async function loadContent(config) {
  const topics = await fetch("content/topics.json").then(r => {
    if (!r.ok) throw new Error("Could not load the topic list.");
    return r.json();
  });

  // Lessons: each topic may list a lessons file. Drafts show only in review mode.
  for (const t of topics) {
    t.lessonList = [];
    if (!t.lessons) continue;
    try {
      const res = await fetch(t.lessons);
      if (!res.ok) throw new Error(res.status);
      t.lessonList = parseLessons(await res.text()).filter(l => l.status === "approved" || (config.reviewMode && l.status !== "rejected"));
    } catch (err) { console.warn("Could not load lessons for", t.id, err); }
  }

  const questions = [];
  for (const t of topics) {
    for (const file of t.files || []) {
      const res = await fetch(file);
      if (!res.ok) { console.warn("Could not load", file); continue; }
      for (const row of parseCSV(await res.text())) {
        const q = fromRow(row, t.id);
        if (isValid(q)) questions.push(q);
        else console.warn("Skipped incomplete row", row.id || row);
      }
    }
  }
  for (const c of CALCULATIONS) {
    questions.push({ ...c, kind: "numeric", status: (c.status || "draft").toLowerCase(), difficulty: c.difficulty || "core" });
  }

  const visible = questions.filter(q =>
    q.status === "approved" || (config.reviewMode && q.status !== "rejected"));
  return { topics, questions: visible };
}
