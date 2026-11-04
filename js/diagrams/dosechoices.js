// Activity: what can we do? (lecture: Cellular Effects of Radiation, slides 28–37). Part 1: choices for one AP pelvis move a
// dose meter. Part 2: sort the factors that affect dose by who controls them.
// The pelvis starts at UKHSA's typical effective dose (0.7 mSv). kVp and mAs follow the exposure console (dose ∝ kVp² × mAs,
// so the 15% rule gives about two-thirds); the other multipliers are illustrative but right in direction and rough size.
const BASE = 0.7;          // mSv, AP pelvis (UKHSA)
const BACKGROUND = 2.1;    // mSv a year
const CHOICES = [
  { id: "coll", label: "Collimation", opts: [["Collimated to the pelvis", 1], ["Field left wide open", 1.4]],
    why: "A wider field irradiates more tissue, including organs outside the area of interest, and adds scatter that lowers contrast." },
  { id: "kv", label: "Exposure factors", opts: [["75 kVp, 32 mAs", 1], ["86 kVp, 16 mAs (the 15% rule)", 0.66]],
    why: "Raising the kVp by 15% and halving the mAs keeps the detector exposure about the same, with about a third less patient dose (dose ∝ kVp² × mAs)." },
  { id: "size", label: "The patient", opts: [["Average build", 1], ["Large build", 2]], fixed: true,
    why: "A larger patient needs more exposure to give the same image quality, so receives more dose. You can't change the patient, but you can choose factors carefully." },
  { id: "repeat", label: "First time?", opts: [["Right first time", 1], ["Repeat: the patient moved", 2]],
    why: "A repeat doubles the dose. Clear instructions, immobilisation and the shortest practical exposure time help get it right first time." },
];
const WHO = { r: "The radiographer, at each examination", e: "Built into the equipment", d: "The department: room and protocols" };
const CARDS = [
  ["Collimating to the area of interest", "r", "The radiographer sets the field for every examination: one of the most effective ways to cut dose."],
  ["Choosing the kVp and mAs", "r", "Exposure factors are set by the radiographer, guided by protocols and the patient in front of them."],
  ["Using the AEC correctly", "r", "Automatic exposure control only works if the radiographer chooses and positions the right chambers."],
  ["Using a grid only when it's needed", "r", "A grid needs more exposure, so it's used for thicker parts, where scatter would spoil the image."],
  ["Avoiding repeats with clear instructions", "r", "Explaining, positioning and immobilising well is down to the radiographer, and saves a whole repeat dose."],
  ["Tube filtration", "e", "Filtration is built into the tube and its housing. The radiographer can't remove it (slide 32)."],
  ["The generator's rectification", "e", "How steady the tube voltage is depends on the generator chosen when the equipment was bought."],
  ["Lead-lined tube housing", "e", "The housing limits leakage radiation; it is part of the equipment."],
  ["Lead-equivalent walls and doors", "d", "Room design protects staff and the public, and is set when the room is built (slides 29–30)."],
  ["The protective barrier for staff", "d", "Part of the room layout, designed so staff can stand behind it during exposures."],
  ["Written protocols for each examination", "d", "The employer must have written protocols for each standard examination. This is an IR(ME)R 2017 requirement; the slide attributes it to IRR17."],
];

const MARKUP = `
<div class="grid">
  <div class="stage dc-stage">
    <p class="eyebrow">AP pelvis, adult</p>
    <div class="meter" aria-hidden="true"><div class="meter-bar"><i data-role="bar"></i><span class="meter-base"></span></div>
      <div class="meter-scale"><span>0</span><span>good practice</span><span>×4</span></div></div>
    <div class="readouts">
      <div class="readout"><span>Effective dose</span><b data-role="r-dose"></b><span data-role="r-x"></span></div>
      <div class="readout"><span>The same as</span><b data-role="r-bg"></b><span>of natural background</span></div>
    </div>
    <p class="scale-note">Starts from UKHSA's typical 0.7 mSv for a pelvis. The multipliers are illustrative but right in direction and rough size.</p>
  </div>
  <div class="panel">
    <div class="sliders">${CHOICES.map(c => `
      <div class="slider">
        <div class="slider-top"><span class="label">${c.label}${c.fixed ? " (not your choice)" : ""}</span></div>
        <div class="modes" role="group" aria-label="${c.label}">${c.opts.map(([t], i) => `<button type="button" data-c="${c.id}" data-i="${i}">${t}</button>`).join("")}</div>
      </div>`).join("")}
    </div>
    <div class="controls"><button type="button" data-role="best">Best practice</button></div>
    <p class="summary" data-role="summary" aria-live="polite"></p>
  </div>
</div>
<section class="dc-sort">
  <h3>Who controls it?</h3>
  <p data-role="progress" aria-live="polite"></p>
  <ol class="sort-list" data-role="cards"></ol>
  <div class="controls"><button type="button" data-role="again">Shuffle and start again</button></div>
</section>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const pick = Object.fromEntries(CHOICES.map(c => [c.id, c.id === "kv" ? 0 : 0]));
  let last = null;

  function update() {
    const f = CHOICES.reduce((m, c) => m * c.opts[pick[c.id]][1], 1), d = BASE * f;
    root.querySelectorAll("[data-c]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.i === pick[b.dataset.c]));
    $("bar").style.width = `${Math.min(100, (f / 4) * 100)}%`;
    $("bar").classList.toggle("high", f > 1.05);
    $("r-dose").textContent = `${+d.toFixed(2)} mSv`;
    $("r-x").textContent = Math.abs(f - 1) < 0.01 ? "the typical dose" : `× ${+f.toFixed(2)} the typical dose`;
    const days = (d / BACKGROUND) * 365;
    $("r-bg").textContent = days >= 60 ? `${+(days / 30.4).toFixed(1)} months` : `${Math.round(days)} days`;
    const c = last && CHOICES.find(x => x.id === last);
    $("summary").textContent = c ? c.why : "Change a choice to see how it moves the dose. Each one is from the lecture's list of what we can do.";
  }
  root.querySelectorAll("[data-c]").forEach(b => b.addEventListener("click", () => { pick[b.dataset.c] = +b.dataset.i; last = b.dataset.c; update(); }));
  $("best").addEventListener("click", () => { pick.coll = 0; pick.kv = 1; pick.repeat = 0; last = null; update();
    $("summary").textContent = "Tight collimation, the 15% rule and getting it right first time: the lowest dose for this patient. The patient's build is the one thing you can't change."; });

  // Who controls it? Each card has three choices and explains itself.
  let done = 0, right = 0;
  function progress() {
    $("progress").textContent = done === CARDS.length ? `All ${CARDS.length} sorted: ${right} right.` : `Sorted ${done} of ${CARDS.length}${done ? `, ${right} right` : ""}.`;
  }
  function deal() {
    done = 0; right = 0;
    const list = $("cards");
    list.innerHTML = "";
    [...CARDS].sort(() => Math.random() - 0.5).forEach(([text, who, why]) => {
      const li = document.createElement("li");
      li.className = "sort-card";
      li.innerHTML = `<p class="sort-text">${text}</p>
        <div class="controls" role="group" aria-label="${text}">${Object.entries(WHO).map(([k, t]) => `<button type="button" data-k="${k}">${t}</button>`).join("")}</div>
        <p class="sort-why" hidden></p>`;
      li.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => {
        const ok = b.dataset.k === who;
        done++; if (ok) right++;
        li.classList.add(ok ? "is-correct" : "is-wrong");
        li.querySelectorAll("[data-k]").forEach(x => { x.disabled = true; x.setAttribute("aria-pressed", x === b); });
        const w = li.querySelector(".sort-why");
        w.innerHTML = `<b>${ok ? "Right" : "Not quite"}: ${WHO[who].toLowerCase()}.</b> ${why}`;
        w.hidden = false;
        progress();
      }));
      list.appendChild(li);
    });
    progress();
  }
  $("again").addEventListener("click", deal);
  update();
  deal();
}
