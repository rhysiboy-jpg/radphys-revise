// Explorer: IRR17 in an X-ray room. A floor plan with the room (usually designated a controlled area), the protective screen,
// the door with its warning light, and the corridor. Pick a place and a person to see what applies. Designation is decided by the
// employer with the radiation protection adviser's advice; the plan shows a typical general X-ray room, not a rule.
import { svgEl as el } from "./util.js";

const ZONES = {
  room: { name: "The X-ray room", area: "Controlled area",
    text: "Typically a <b>controlled area</b>: special procedures are needed to restrict exposure. Entry is restricted, <b>local rules</b> apply, and warning signs mark it." },
  screen: { name: "Behind the protective screen", area: "Inside the controlled area, shielded",
    text: "Where staff stand during an exposure. The lead-equivalent screen shields them from scatter, so their dose stays very low: time, distance and <b>shielding</b>." },
  door: { name: "The door and warning light", area: "The boundary",
    text: "Warning signs and a light at the entrance show when the area is controlled and when an exposure is under way, so no one walks in." },
  corridor: { name: "The corridor and waiting area", area: "Not designated",
    text: "The room's walls and door are designed so that doses out here are far below the <b>1 mSv a year</b> limit for members of the public." },
};
const PEOPLE = {
  rad: { name: "Radiographer", text: "An employee aged 18 or over: effective dose limit <b>20 mSv a year</b>. Only staff likely to exceed <b>6 mSv a year</b> are <b>classified</b> and monitored by an approved dosimetry service; most radiographers are not, but many wear a dosimeter as good practice." },
  preg: { name: "Pregnant radiographer", text: "Once she has told her employer <b>in writing</b>, the employer must make sure the dose to the <b>fetus</b> is unlikely to exceed <b>1 mSv</b> for the rest of the pregnancy. In plain radiography this is usually achievable with normal working practice." },
  visitor: { name: "Visitor", text: "A member of the public: dose limit <b>1 mSv a year</b>. Visitors don't enter the controlled area during exposures." },
  carer: { name: "Carer holding a patient", text: "Carers and comforters who knowingly and willingly help are covered by <b>IR(ME)R</b>, not the IRR17 dose limits. Dose constraints apply, they must be given information, and they wear protective clothing and stay out of the primary beam." },
};

const MARKUP = `
<div class="grid">
  <div class="stage">
    <svg viewBox="0 0 640 340" role="img" aria-labelledby="ar-t ar-d">
      <title id="ar-t">Floor plan of a general X-ray room and the corridor outside</title>
      <desc id="ar-d">An X-ray room with a table and tube, a wall detector stand, and a protective screen in one corner with the control panel behind it. A door with a warning light leads to the corridor and waiting area.</desc>
      <g class="ar-zone" data-zone="corridor"><rect x="20" y="262" width="600" height="64" rx="6"/><text class="ar-t" x="320" y="300">Corridor and waiting area</text></g>
      <g class="ar-zone" data-zone="room"><rect x="20" y="20" width="600" height="230" rx="6"/></g>
      <rect class="ar-wall" x="20" y="20" width="600" height="230" rx="6"/>
      <rect class="ar-table" x="150" y="100" width="230" height="70" rx="8"/>
      <text class="ar-t" x="190" y="140">table</text>
      <circle class="ar-tube" cx="265" cy="135" r="20"/>
      <rect class="ar-stand" x="40" y="96" width="22" height="80" rx="3"/>
      <text class="ar-t wide-only" x="51" y="196">detector</text>
      <g class="ar-zone" data-zone="screen"><rect x="460" y="40" width="140" height="100" rx="6"/><text class="ar-t" x="530" y="96">control<tspan class="wide-only"> panel</tspan></text></g>
      <rect class="ar-shield" x="452" y="30" width="10" height="120" rx="2"/>
      <text class="ar-t" x="457" y="170"><tspan class="wide-only">protective </tspan>screen</text>
      <g class="ar-zone" data-zone="door"><rect x="480" y="244" width="80" height="12" rx="2"/><circle class="ar-light" data-role="light" cx="580" cy="250" r="9"/></g>
      <text class="ar-t" x="200" y="40" data-role="room-t">X-ray room: controlled area</text>
    </svg>
    <p class="scale-note">A typical general X-ray room, not to scale · tap a place on the plan or choose one below</p>
  </div>
  <div class="panel">
    <div class="sliders">
      <div class="slider"><div class="slider-top"><span class="label">Where</span></div>
        <div class="modes" role="group" aria-label="Where">${Object.entries(ZONES).map(([id, z]) => `<button type="button" data-z="${id}">${z.name}</button>`).join("")}</div></div>
      <div class="slider"><div class="slider-top"><span class="label">Who</span></div>
        <div class="modes" role="group" aria-label="Who">${Object.entries(PEOPLE).map(([id, p]) => `<button type="button" data-p="${id}">${p.name}</button>`).join("")}</div></div>
      <div class="slider"><div class="slider-top"><span class="label">Exposure</span></div>
        <div class="modes" role="group" aria-label="Exposure"><button type="button" data-x="0">Not exposing</button><button type="button" data-x="1">Exposing</button></div></div>
    </div>
    <div class="part-card" aria-live="polite"><p class="eyebrow" data-role="z-area"></p><h3 data-role="z-name"></h3><p data-role="z-text"></p></div>
    <div class="part-card"><p class="eyebrow">Who</p><h3 data-role="p-name"></h3><p data-role="p-text"></p></div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const st = { z: "room", p: "rad", x: "0" };
  function update() {
    for (const k of ["z", "p", "x"]) root.querySelectorAll(`[data-${k}]`).forEach(b => b.setAttribute("aria-pressed", b.dataset[k] === st[k]));
    root.querySelectorAll(".ar-zone").forEach(g => g.classList.toggle("on", g.dataset.zone === st.z));
    $("light").classList.toggle("on", st.x === "1");
    const z = ZONES[st.z], p = PEOPLE[st.p];
    $("z-area").textContent = z.area;
    $("z-name").textContent = z.name;
    $("z-text").innerHTML = z.text + (st.x === "1" && st.z === "room" ? " <b>Right now an exposure is under way</b>: only those who need to be in the room are, and staff are behind the screen." : st.x === "1" && st.z === "door" ? " <b>The light is on</b>: do not enter." : "");
    $("p-name").textContent = p.name;
    $("p-text").innerHTML = p.text;
  }
  root.querySelectorAll("[data-z]").forEach(b => b.addEventListener("click", () => { st.z = b.dataset.z; update(); }));
  root.querySelectorAll(".ar-zone").forEach(g => g.addEventListener("click", () => { st.z = g.dataset.zone; update(); }));
  root.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { st.p = b.dataset.p; update(); }));
  root.querySelectorAll("[data-x]").forEach(b => b.addEventListener("click", () => { st.x = b.dataset.x; update(); }));
  update();
}
