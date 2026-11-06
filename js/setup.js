// Two things every diagram gets without its own code:
// 1. A set-up in the web address (#diagram-topic/id?spec-kv=120&target=Mo), so a lecturer can share, project or set a
//    particular arrangement. Only controls changed from the starting state go in the link, which keeps it short.
// 2. Calmer screen-reader output for sliders. A diagram's live text changes on every step of a slider, which floods a
//    screen reader; while a slider moves its live text is muted, then one line says what changed once it stops.

// What counts as a setting:
// - sliders, drop-downs and number boxes with an id;
// - groups of buttons that pick one option (aria-pressed, inside role="group", exactly one pressed). Groups with several
//   pressed are left out: they are either multi-select or an activity whose answers a link would give away.
function settingButtons(root) {
  const groups = new Map();
  for (const b of root.querySelectorAll('[role="group"] button[aria-pressed]')) {
    if (b.closest(".motion-row")) continue;
    const a = [...b.attributes].find(x => x.name.startsWith("data-") && x.name !== "data-role");
    if (!a) continue;
    const key = a.name.slice(5);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ b, value: a.value });
  }
  return groups;
}
const settingInputs = root => [...root.querySelectorAll("input[type=range][id], input[type=number][id], select[id]")];

export function readSetup(root) {
  const out = {};
  for (const [key, list] of settingButtons(root)) {
    const on = list.filter(x => x.b.getAttribute("aria-pressed") === "true");
    if (on.length === 1) out[key] = on[0].value;
  }
  for (const i of settingInputs(root)) out[i.id] = i.value;
  return out;
}

// Buttons first, because a preset button sets the sliders, which the link's own slider values then override.
export function applySetup(root, setup) {
  for (const [key, list] of settingButtons(root)) {
    if (!(key in setup)) continue;
    const hit = list.find(x => x.value === setup[key]);
    if (hit && hit.b.getAttribute("aria-pressed") !== "true" && !hit.b.disabled) hit.b.click();
  }
  for (const i of settingInputs(root)) {
    if (!(i.id in setup)) continue;
    if (i.tagName === "SELECT" && ![...i.options].some(o => o.value === setup[i.id])) continue;
    i.value = setup[i.id];
    i.dispatchEvent(new Event("input", { bubbles: true }));
    i.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

// Only what differs from the starting state.
export function changedFrom(start, now) {
  const out = {};
  for (const k in now) if (now[k] !== start[k]) out[k] = now[k];
  return out;
}

export const encodeSetup = setup => new URLSearchParams(setup).toString();
export function decodeSetup(query) {
  const out = {};
  for (const [k, v] of new URLSearchParams(query || "")) if (/^[\w-]{1,40}$/.test(k)) out[k] = v.slice(0, 40);
  return out;
}

// Mutes the diagram's live text while a slider moves, then reads out one line when it settles: the slider's name and
// value, then any live text that changed. Returns a cleanup function.
export function calmSliders(root, wait = 700) {
  const say = document.createElement("p");
  say.className = "sr";
  say.setAttribute("aria-live", "polite");
  root.appendChild(say);
  let timer = 0, before = null, muted = [];

  const regions = () => [...root.querySelectorAll('[aria-live="polite"]')].filter(r => r !== say);
  function settle(input) {
    muted.forEach(r => r.setAttribute("aria-live", "polite"));
    muted = [];
    const label = root.querySelector(`label[for="${input.id}"]`)?.textContent.trim() || input.getAttribute("aria-label") || "";
    const value = root.querySelector(`output[for="${input.id}"]`)?.textContent.trim() || input.getAttribute("aria-valuetext") || input.value;
    const changed = regions().filter(r => !r.closest("[hidden]") && r.textContent.trim() && r.textContent !== before.get(r)).map(r => r.textContent.trim().replace(/\s+/g, " "));
    before = null;
    say.textContent = "";
    // A fresh text node after a moment, so the same words twice in a row are still read.
    setTimeout(() => { say.textContent = [`${label} ${value}.`.trim(), ...changed].join(" "); }, 50);
  }
  function onInput(e) {
    const i = e.target;
    if (!i.matches?.("input[type=range], input[type=number]")) return;
    if (!before) {
      before = new Map(regions().map(r => [r, r.textContent]));
      muted = regions();
      muted.forEach(r => r.setAttribute("aria-live", "off"));
    }
    clearTimeout(timer);
    timer = setTimeout(() => settle(i), wait);
  }
  root.addEventListener("input", onInput);
  return () => {
    clearTimeout(timer);
    root.removeEventListener("input", onInput);
    muted.forEach(r => r.setAttribute("aria-live", "polite"));
  };
}
