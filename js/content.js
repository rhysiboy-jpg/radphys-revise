// Loads the topic list, the question spreadsheets and the calculation templates.
import { parseCSV } from "./csv.js";
import CALCULATIONS from "../content/calculations.js";

const LETTERS = ["a", "b", "c", "d", "e"];

function fromRow(row, topicId) {
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
  return { ...base, kind: "mcq", options, answer: (row.answer || "").toUpperCase() };
}

function isValid(q) {
  if (!q.id || !q.question) return false;
  if (q.kind === "mcq") return q.options.length >= 2 && q.options.some(o => o.key === q.answer);
  if (q.kind === "written") return q.points.length > 0;
  return true;
}

export async function loadContent(config) {
  const topics = await fetch("content/topics.json").then(r => {
    if (!r.ok) throw new Error("Could not load the topic list.");
    return r.json();
  });

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
