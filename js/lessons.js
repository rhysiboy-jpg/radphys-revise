// Reads a topic's lessons file (content/lessons/*.md): "# Title", then "name: value" lines, then the lesson in simple
// Markdown (paragraphs, "- " bullet lists, **bold**). "## Try this" and "## Key points" start those boxes; any other
// "## Heading" becomes a subheading in the explanation. Comments in <!-- --> are ignored.
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

// Simple Markdown blocks to HTML: paragraphs, bullet lists and "## " subheadings.
function blocks(lines) {
  const out = [];
  let para = [], list = [];
  const flush = () => {
    if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; }
    if (list.length) { out.push(`<ul>${list.map(li => `<li>${inline(li)}</li>`).join("")}</ul>`); list = []; }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    if (line.startsWith("- ")) { if (para.length) flush(); list.push(line.slice(2)); continue; }
    if (line.startsWith("## ")) { flush(); out.push(`<h3>${inline(line.slice(3))}</h3>`); continue; }
    if (list.length) flush();
    para.push(line);
  }
  flush();
  return out.join("");
}

// "## Predict": a question line, then options as "- " lines with the right one written "- * ", then the explanation as
// "> " lines. Asked before the diagram, so the student commits to an answer, then checks it on the diagram.
function predictBlock(lines) {
  const rows = lines.map(l => l.trim()).filter(Boolean);
  if (!rows.length) return null;
  const question = rows.filter(r => !r.startsWith("- ") && !r.startsWith(">")).join(" ");
  const options = rows.filter(r => r.startsWith("- ")).map(r => {
    const right = r.startsWith("- * ");
    return { text: inline(r.slice(right ? 4 : 2)), right };
  });
  const why = rows.filter(r => r.startsWith(">")).map(r => r.replace(/^>\s?/, "")).join(" ");
  return { question: inline(question), options, why: inline(why) };
}

export function parseLessons(text) {
  text = text.replace(/^﻿/, "").replace(/<!--[\s\S]*?-->/g, "").replace(/\r\n?/g, "\n");
  const lessons = [];
  for (const chunk of text.split(/^# /m).slice(1)) {
    const lines = chunk.split("\n");
    const title = lines.shift().trim();
    const meta = {};
    while (lines.length && /^[a-z]+:\s/i.test(lines[0].trim())) {
      const l = lines.shift().trim(), k = l.indexOf(":");
      meta[l.slice(0, k).trim().toLowerCase()] = l.slice(k + 1).trim();
    }
    // Split the body into the explanation and the named boxes.
    const parts = { body: [], try: [], key: [], predict: [] };
    let into = "body";
    for (const l of lines) {
      const h = l.trim().toLowerCase();
      if (h === "## try this") { into = "try"; continue; }
      if (h === "## key points") { into = "key"; continue; }
      if (h === "## predict") { into = "predict"; continue; }
      parts[into].push(l);
    }
    if (!title || !meta.id) continue;
    lessons.push({
      id: meta.id,
      title,
      summary: meta.summary || "",
      areas: (meta.areas || "").split(";").map(s => s.trim()).filter(Boolean),
      diagram: meta.diagram || "",
      status: (meta.status || "draft").toLowerCase(),
      sources: meta.sources || "",
      body: blocks(parts.body),
      tryThis: blocks(parts.try),
      keyPoints: blocks(parts.key),
      predict: predictBlock(parts.predict),
    });
  }
  return lessons;
}
