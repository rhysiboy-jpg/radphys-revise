// Explorer: which tissues matter most? (lecture: Cellular Effects of Radiation, slides 13 and 27). A cartoon body with the
// organs that carry tissue weighting factors (ICRP Publication 103, the values used for effective dose in the UK).
// Explore each organ, irradiate one area to see how much of the body's risk lies in the beam, or rank organs.
import { svgEl as el } from "./util.js";

// [id, name, wT, why]
const ORGANS = [
  ["marrow", "Red bone marrow", 0.12, "Blood-forming cells divide constantly, which makes them very radiosensitive. Leukaemia is one of the cancers most clearly linked to radiation."],
  ["lung", "Lungs", 0.12, "A large organ with a high natural cancer rate, and often in the beam for chest and spine examinations."],
  ["stomach", "Stomach", 0.12, "Its lining renews itself every few days: rapidly dividing cells are the most sensitive."],
  ["colon", "Colon", 0.12, "Like the stomach, its lining divides rapidly. Abdomen and pelvis examinations put much of it in the beam."],
  ["breast", "Breast", 0.12, "Breast tissue is sensitive, especially in younger people. This is one reason PA chest projections are preferred to AP."],
  ["gonads", "Gonads (ovaries and testes)", 0.08, "Their weighting covers heritable effects as well as cancer: damage to ova and sperm could pass to children."],
  ["bladder", "Bladder", 0.04, "Moderately sensitive, and in the beam for pelvis examinations."],
  ["liver", "Liver", 0.04, "Moderately sensitive. In the beam for abdomen and lower chest examinations."],
  ["oesophagus", "Oesophagus", 0.04, "Runs through the neck and chest, so it is in the beam for many examinations."],
  ["thyroid", "Thyroid", 0.04, "Especially sensitive in children. It sits in the neck, close to many head, neck and chest fields."],
  ["bone", "Bone surface", 0.01, "Cells on bone surfaces are less sensitive than the marrow inside."],
  ["brain", "Brain", 0.01, "Brain cells rarely divide in adults, so they are among the least sensitive."],
  ["salivary", "Salivary glands", 0.01, "Low sensitivity, but in the beam for head, neck and dental imaging."],
  ["skin", "Skin", 0.01, "A low weighting for cancer risk, though skin receives the highest dose in most examinations: the entrance surface dose."],
];
const BY_ID = Object.fromEntries(ORGANS.map(([id, name, w, why]) => [id, { id, name, w, why }]));
// Regions: the organs counted as in the beam (skin and bone surface are in every field). y0–y1 is the band drawn on the body.
const REGIONS = {
  head: { name: "Head", y0: 14, y1: 100, organs: ["brain", "salivary", "skin", "bone"] },
  neck: { name: "Neck", y0: 96, y1: 140, organs: ["thyroid", "oesophagus", "salivary", "skin", "bone"] },
  chest: { name: "Chest", y0: 136, y1: 256, organs: ["lung", "breast", "oesophagus", "marrow", "skin", "bone"] },
  abdomen: { name: "Abdomen", y0: 248, y1: 332, organs: ["stomach", "liver", "colon", "marrow", "skin", "bone"] },
  pelvis: { name: "Pelvis", y0: 326, y1: 412, organs: ["colon", "bladder", "gonads", "marrow", "skin", "bone"] },
  limb: { name: "Knee", y0: 470, y1: 530, organs: ["skin", "bone"] },
};
const MODES = { explore: "Explore", beam: "Irradiate an area", rank: "Rank them" };
const sumW = ids => +ids.reduce((s, id) => s + BY_ID[id].w, 0).toFixed(2);

const BODY = `
  <g class="tw-body" data-organ="skin">
    <circle cx="150" cy="58" r="44"/>
    <rect x="130" y="96" width="40" height="40" rx="8"/>
    <rect x="80" y="128" width="140" height="282" rx="44"/>
    <rect x="42" y="138" width="36" height="226" rx="18"/>
    <rect x="222" y="138" width="36" height="226" rx="18"/>
    <rect x="94" y="392" width="52" height="208" rx="22"/>
    <rect x="154" y="392" width="52" height="208" rx="22"/>
  </g>
  <g class="tw-bones" data-organ="bone">
    <line x1="60" y1="152" x2="60" y2="348"/><line x1="240" y1="152" x2="240" y2="348"/>
    <line x1="120" y1="412" x2="120" y2="584"/><line x1="180" y1="412" x2="180" y2="584"/>
  </g>
  <ellipse class="tw-organ" data-organ="brain" cx="150" cy="50" rx="31" ry="23"/>
  <ellipse class="tw-organ" data-organ="salivary" cx="126" cy="86" rx="8" ry="6"/>
  <ellipse class="tw-organ" data-organ="salivary" cx="174" cy="86" rx="8" ry="6"/>
  <ellipse class="tw-organ" data-organ="thyroid" cx="141" cy="122" rx="9" ry="7"/>
  <ellipse class="tw-organ" data-organ="thyroid" cx="159" cy="122" rx="9" ry="7"/>
  <ellipse class="tw-organ" data-organ="lung" cx="118" cy="184" rx="27" ry="46"/>
  <ellipse class="tw-organ" data-organ="lung" cx="182" cy="184" rx="27" ry="46"/>
  <path class="tw-organ tw-tube" data-organ="oesophagus" d="M150 104 V250"/>
  <circle class="tw-organ" data-organ="breast" cx="106" cy="236" r="14"/>
  <circle class="tw-organ" data-organ="breast" cx="194" cy="236" r="14"/>
  <ellipse class="tw-organ" data-organ="liver" cx="124" cy="270" rx="34" ry="19"/>
  <ellipse class="tw-organ" data-organ="stomach" cx="180" cy="272" rx="22" ry="17"/>
  <path class="tw-organ tw-tube wide" data-organ="colon" d="M122 344 V302 H178 V344"/>
  <ellipse class="tw-organ" data-organ="marrow" cx="102" cy="356" rx="18" ry="24"/>
  <ellipse class="tw-organ" data-organ="marrow" cx="198" cy="356" rx="18" ry="24"/>
  <ellipse class="tw-organ" data-organ="bladder" cx="150" cy="372" rx="17" ry="11"/>
  <ellipse class="tw-organ" data-organ="gonads" cx="136" cy="397" rx="8" ry="5"/>
  <ellipse class="tw-organ" data-organ="gonads" cx="164" cy="397" rx="8" ry="5"/>`;

const MARKUP = `
<div class="modes view-modes" role="group" aria-label="Mode">${Object.entries(MODES).map(([k, t]) => `<button type="button" data-mode="${k}">${t}</button>`).join("")}</div>
<div class="grid">
  <div class="stage tw-stage">
    <svg class="tw-svg" viewBox="0 0 300 610" role="img" aria-labelledby="tw-t tw-d">
      <title id="tw-t">A cartoon body showing the organs with tissue weighting factors</title>
      <desc id="tw-d" data-role="desc"></desc>
      ${BODY}
      <g data-role="band"></g>
    </svg>
    <label class="check-row" data-role="colour-row"><input type="checkbox" data-role="colour"> Shade organs by weighting factor</label>
    <p class="scale-note">Cartoon · not to scale · the red marrow is shown in the pelvis, though it is also in the spine, ribs and skull</p>
  </div>
  <div class="panel">
    <div data-role="p-explore">
      <ul class="key">${ORGANS.map(([id, name]) => `<li><button type="button" data-pick="${id}">${name}</button></li>`).join("")}</ul>
      <div class="part-card" data-role="card" aria-live="polite"></div>
    </div>
    <div data-role="p-beam" hidden>
      <div class="slider">
        <div class="slider-top"><span class="label">Put this area in the beam</span></div>
        <div class="modes" role="group" aria-label="Area in the beam">${Object.entries(REGIONS).map(([k, r]) => `<button type="button" data-region="${k}">${r.name}</button>`).join("")}</div>
      </div>
      <div class="readouts">
        <div class="readout"><span>Weighting factors in the beam</span><b data-role="r-sum"></b><span>of 1.00 for the whole body</span></div>
        <div class="readout"><span>Compared with a knee</span><b data-role="r-vs"></b><span>for the same dose to each organ</span></div>
      </div>
      <p class="summary" data-role="beam-sum" aria-live="polite"></p>
    </div>
    <div data-role="p-rank" hidden>
      <p class="q-hint">Put these organs in order of tissue weighting factor, highest first.</p>
      <ol class="order-list" data-role="rank"></ol>
      <p class="sr" aria-live="polite" data-role="moved"></p>
      <div class="controls"><button type="button" class="primary" data-role="check">Check order</button><button type="button" data-role="new">New set</button></div>
      <p data-role="rank-fb" aria-live="polite"></p>
    </div>
    <p class="scale-note">Tissue weighting factors from ICRP Publication 103. The remaining tissues share a further 0.12. Effective dose adds up each organ's equivalent dose × its weighting factor.</p>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const svg = root.querySelector(".tw-svg");
  let mode = "explore", picked = "marrow", region = "chest";

  const shapes = id => svg.querySelectorAll(`[data-organ="${id}"]`);
  function shade() {
    const on = $("colour").checked && mode !== "rank";
    for (const [id, , w] of ORGANS) shapes(id).forEach(s => {
      s.style.setProperty("--tw", on ? (w / 0.12).toFixed(2) : 0);
      s.classList.toggle("shaded", on);
    });
  }
  function highlight(ids) {
    svg.querySelectorAll("[data-organ]").forEach(s => s.classList.toggle("sel", ids.includes(s.dataset.organ)));
  }

  function showExplore() {
    const o = BY_ID[picked];
    highlight([picked]);
    root.querySelectorAll("[data-pick]").forEach(b => b.setAttribute("aria-pressed", b.dataset.pick === picked));
    const same = ORGANS.filter(([id, , w]) => w === o.w && id !== o.id).map(([, n]) => n.toLowerCase());
    $("card").innerHTML = `<p class="eyebrow">Tissue weighting factor</p><h3>${o.name}: ${o.w.toFixed(2)}</h3><p>${o.why}</p>
      ${same.length ? `<p class="tip"><b>Same weighting:</b> ${same.join(", ")}.</p>` : ""}`;
    $("desc").textContent = `${o.name} highlighted: tissue weighting factor ${o.w.toFixed(2)}.`;
  }

  function showBeam() {
    const r = REGIONS[region], s = sumW(r.organs), knee = sumW(REGIONS.limb.organs);
    highlight(r.organs.filter(id => id !== "skin" && id !== "bone"));   // skin and bone are in every field: outlining them would light up the whole body
    root.querySelectorAll("[data-region]").forEach(b => b.setAttribute("aria-pressed", b.dataset.region === region));
    $("band").innerHTML = "";
    el("rect", { class: "tw-band", x: 4, y: r.y0, width: 292, height: r.y1 - r.y0, rx: 8 }, $("band"));
    $("r-sum").textContent = s.toFixed(2);
    $("r-vs").textContent = region === "limb" ? "—" : `× ${Math.round(s / knee)}`;
    const list = r.organs.filter(id => id !== "skin" && id !== "bone").map(id => `${BY_ID[id].name.split(" (")[0].toLowerCase()} (${BY_ID[id].w.toFixed(2)})`);
    $("beam-sum").innerHTML = region === "limb"
      ? `A knee has only skin and bone surface in the beam: weighting ${s.toFixed(2)}. That is why limb examinations have the lowest effective doses on the dose ladder.`
      : `In the beam: ${list.join(", ")}, plus skin and bone surface. Together they carry <b>${Math.round(s * 100)}%</b> of the whole body's weighting, so the same dose here counts about <b>${Math.round(s / knee)} times</b> as much towards effective dose as it would for a knee. Organs partly in the beam are counted in full here; real calculations allow for the part irradiated.`;
    $("desc").textContent = `${r.name} in the beam. Weighting factors in the beam add up to ${s.toFixed(2)}.`;
  }

  // Rank: four organs with different weightings, shuffled.
  let rankSet = [];
  function newRank() {
    const pick = w => { const opts = ORGANS.filter(o => o[2] === w); return opts[Math.floor(Math.random() * opts.length)][0]; };
    rankSet = [pick(0.12), pick(0.08), pick(0.04), pick(0.01)];
    let order;
    do order = [...rankSet].sort(() => Math.random() - 0.5); while (order.every((v, i) => v === rankSet[i]));
    $("rank").innerHTML = order.map(id => `<li class="order-item" data-item="${id}"><span class="order-t">${BY_ID[id].name}</span>
      <span class="order-btns"><button type="button" data-move="-1" aria-label="Move up: ${BY_ID[id].name}">↑</button><button type="button" data-move="1" aria-label="Move down: ${BY_ID[id].name}">↓</button></span>
      <span class="tagline"></span></li>`).join("");
    $("check").disabled = false;
    $("rank-fb").textContent = "";
    refreshRank();
    highlight([]);
  }
  const items = () => [...$("rank").children];
  function refreshRank() {
    items().forEach((li, k, all) => {
      const up = li.querySelector('[data-move="-1"]'), down = li.querySelector('[data-move="1"]');
      if (up) { up.disabled = k === 0; down.disabled = k === all.length - 1; }
    });
  }
  $("rank").addEventListener("click", e => {
    const btn = e.target.closest("[data-move]");
    if (!btn || btn.disabled) return;
    const li = btn.closest("li"), list = $("rank"), up = btn.dataset.move === "-1";
    if (up) list.insertBefore(li, li.previousElementSibling); else list.insertBefore(li.nextElementSibling, li);
    refreshRank();
    $("moved").textContent = `${BY_ID[li.dataset.item].name}: now ${items().indexOf(li) + 1} of 4`;
    (btn.disabled ? li.querySelector(`[data-move="${up ? 1 : -1}"]`) : btn).focus();
  });
  $("check").addEventListener("click", () => {
    let right = 0;
    items().forEach((li, k) => {
      const ok = li.dataset.item === rankSet[k];
      if (ok) right++;
      li.classList.add(ok ? "is-correct" : "is-wrong");
      li.querySelector(".order-btns")?.remove();
      li.querySelector(".tagline").textContent = `${ok ? "Right place" : "Not here"} · ${BY_ID[li.dataset.item].w.toFixed(2)}`;
    });
    $("check").disabled = true;
    $("rank-fb").textContent = `${right} of 4 in the right place. ${right === 4 ? "Spot on." : `Right order: ${rankSet.map(id => BY_ID[id].name).join(", ")}.`}`;
    highlight(rankSet);
  });
  $("new").addEventListener("click", newRank);

  function setMode(m) {
    mode = m;
    root.querySelectorAll("[data-mode]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === m));
    $("p-explore").hidden = m !== "explore"; $("p-beam").hidden = m !== "beam"; $("p-rank").hidden = m !== "rank";
    $("colour-row").hidden = m === "rank";
    $("band").innerHTML = "";
    shade();
    if (m === "explore") showExplore(); else if (m === "beam") showBeam(); else newRank();
  }

  // Tapping an organ on the body explores it; the list of buttons does the same from the keyboard.
  svg.addEventListener("click", e => {
    const s = e.target.closest("[data-organ]");
    if (!s || mode !== "explore") return;
    picked = s.dataset.organ; showExplore();
  });
  root.querySelectorAll("[data-pick]").forEach(b => b.addEventListener("click", () => { picked = b.dataset.pick; showExplore(); }));
  root.querySelectorAll("[data-region]").forEach(b => b.addEventListener("click", () => { region = b.dataset.region; showBeam(); }));
  root.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
  $("colour").addEventListener("change", shade);
  setMode("explore");
}
