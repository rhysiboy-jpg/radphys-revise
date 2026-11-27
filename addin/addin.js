// The PowerPoint add-in (a "content add-in": a web page that PowerPoint shows inside a slide).
// While editing the slide, the lecturer picks a diagram, from the list or by pasting a link that carries its settings. The
// choice is saved in the slide itself (Office's document settings), so the slide shows the same diagram every time the
// presentation opens, on any computer with the add-in. The diagram is the app's own presentation view (#present-…) in a
// frame, so it stays live: in the slide show students can watch the lecturer move its sliders and press its buttons.
// During the slide show the bar with "Change diagram" is hidden, so only the diagram shows.
import { CONFIG } from "../js/config.js";

const $ = r => document.querySelector(`[data-role="${r}"]`);
const KEY = "radphysDiagram";   // the setting saved in the slide: { topic, id, query }
const shown = d => d.ready && (d.approved || CONFIG.reviewMode);   // the same rule as the app's diagram pages
let topics = [], office = false, choice = null, slideShow = false;

// A link from the app: #diagram-topic/id or #present-topic/id, with any settings after a "?".
export function parseLink(text) {
  const m = String(text).trim().match(/#(?:diagram|present)-([\w-]+)\/([\w-]+)(?:\?([^\s#]*))?\s*$/);
  return m ? { topic: m[1], id: m[2], query: m[3] || "" } : null;
}
export const presentPath = c => `../#present-${c.topic}/${c.id}${c.query ? "?" + c.query : ""}`;

const find = c => {
  const t = topics.find(x => x.id === c?.topic), d = t?.diagrams.find(x => x.id === c?.id && shown(x));
  return d ? { t, d } : null;
};

function save(c) {
  choice = c;
  if (!office) return;
  Office.context.document.settings.set(KEY, c);
  Office.context.document.settings.saveAsync();   // saved with the presentation when it is next saved
}

function showDiagram() {
  const found = find(choice);
  if (!found) { showPicker(choice ? "That diagram isn't available. Choose another." : ""); return; }
  const frame = $("frame");
  const src = presentPath(choice);
  if (frame.getAttribute("src") !== src) frame.setAttribute("src", src);
  frame.title = `${found.d.title}: RadPhys Revise diagram`;
  $("name").textContent = `RadPhys Revise · ${found.d.title}${choice.query ? " (with saved settings)" : ""}`;
  $("pick").hidden = true;
  frame.hidden = false;
  $("bar").hidden = slideShow;
}

function showPicker(error = "") {
  $("frame").hidden = true;
  $("bar").hidden = true;
  $("pick").hidden = false;
  $("link-error").textContent = error;
}

function buildList() {
  const groups = topics.map(t => {
    const ds = t.diagrams.filter(shown);
    if (!ds.length) return "";
    return `<section class="addin-topic"><h2>${t.number}. ${esc(t.title)}</h2><ul>${ds.map(d =>
      `<li><button type="button" data-topic="${t.id}" data-id="${d.id}"><b>${esc(d.title)}</b><small>${esc(d.blurb || "")}</small></button></li>`).join("")}</ul></section>`;
  }).join("");
  $("list").innerHTML = groups || '<p class="muted">No diagrams are available yet.</p>';
  $("list").querySelectorAll("button[data-topic]").forEach(b => b.addEventListener("click", () => {
    save({ topic: b.dataset.topic, id: b.dataset.id, query: "" });
    showDiagram();
  }));
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Edit view shows the bar; the slide show ("read" view) hides it.
function watchView() {
  if (!office || !Office.context.document.getActiveViewAsync) return;
  const apply = view => { slideShow = view === "read"; if (!$("frame").hidden) $("bar").hidden = slideShow; };
  Office.context.document.getActiveViewAsync(r => { if (r.status === "succeeded") apply(r.value); });
  Office.context.document.addHandlerAsync?.(Office.EventType.ActiveViewChanged, e => apply(e.activeView));
}

async function start(inOffice) {
  office = inOffice;
  $("change").addEventListener("click", () => showPicker());
  $("link-form").addEventListener("submit", e => {
    e.preventDefault();
    const c = parseLink(document.getElementById("addin-link").value);
    if (!c) { $("link-error").textContent = "That isn't a link to a diagram. Use Copy link or Present under a diagram, then paste it here."; return; }
    if (!find(c)) { $("link-error").textContent = "That diagram isn't available."; return; }
    save(c);
    showDiagram();
  });
  try {
    topics = await (await fetch("../content/topics.json")).json();
  } catch {
    $("list").innerHTML = '<p class="addin-error">The diagrams couldn\'t load. Check the internet connection, then close and reopen the slide.</p>';
    showPicker();
    return;
  }
  buildList();
  watchView();
  choice = office ? Office.context.document.settings.get(KEY) : null;
  if (choice) showDiagram(); else showPicker();
}

// Inside PowerPoint, Office.onReady says so; opened in a browser, or with Microsoft's script blocked, the page runs without it.
// (Not at all outside a browser: the tests load this file only for parseLink.)
if (typeof document !== "undefined") {
  if (typeof Office !== "undefined" && Office.onReady) Office.onReady(info => start(!!info.host));
  else start(false);
}
