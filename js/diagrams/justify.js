// Activity: justify it? (lecture: Cellular Effects of Radiation, slides 21–26 and 33–37; IR(ME)R justification).
// A referral arrives on a request card; the student decides what should happen and sees why. Teaching examples only:
// the scenarios need Rhys's clinical sign-off, and departments follow their own referral criteria.
const CHOICES = {
  go: "Go ahead as requested",
  alt: "Suggest a different examination",
  none: "No imaging is needed",
  info: "Get more information first",
};
const CASES = [
  { patient: "Woman, 34", details: "Fell on an outstretched hand. Swelling and tenderness over the scaphoid.", exam: "Wrist X-ray, with scaphoid views",
    answer: "go", why: "There is a clear clinical question, and the answer changes management: a missed scaphoid fracture can lose its blood supply. The benefit clearly outweighs a very small dose (limbs are under 0.01 mSv).",
    notes: { none: "A suspected scaphoid fracture needs imaging: missing it can cause lasting harm.", info: "The request already gives the mechanism, the findings and the question." } },
  { patient: "Man, 42", details: "Low back pain for three weeks after lifting. No red-flag symptoms.", exam: "Lumbar spine X-ray",
    answer: "none", why: "Imaging is not recommended for non-specific low back pain without red flags (NICE guideline NG59): it rarely changes management. A lumbar spine X-ray is also one of the higher-dose plain films, about 1.3 mSv or 7 months of natural background.",
    notes: { go: "The X-ray would add dose without changing management.", alt: "With no red flags, no imaging is indicated; switching to another examination doesn't solve that." } },
  { patient: "Woman, 47", details: "Right upper quadrant pain after fatty meals. ?Gallstones.", exam: "Abdomen X-ray",
    answer: "alt", why: "Ultrasound is the first-line test for suspected gallstones: it uses no ionising radiation and shows them far better. Most gallstones don't show on an X-ray at all.",
    notes: { go: "Most gallstones are invisible on an abdomen X-ray, so the dose would bring little benefit.", none: "There is a real clinical question; it just needs a better test." } },
  { patient: "Man, 58", details: "(left blank)", exam: "Chest X-ray",
    answer: "info", why: "Under IR(ME)R the referrer must give enough clinical information for the practitioner to justify the exposure. Without it, nobody can weigh the benefit against the risk. Contact the referrer.",
    notes: { go: "Without clinical details, the exposure can't be justified.", none: "There may be a good reason for the request; find out first." } },
  { patient: "Woman, 66", details: "Persistent cough. Had a chest X-ray at another hospital two days ago for the same symptoms.", exam: "Chest X-ray",
    answer: "info", why: "Look for the previous images and report first. Repeating an examination that has just been done adds dose without benefit, unless something has changed clinically.",
    notes: { go: "An unnecessary repeat adds dose for no benefit.", none: "A new X-ray might be justified if things have changed; check the previous one first." } },
  { patient: "Woman, 26", details: "Fall onto the hip. Can weight-bear with pain. Unsure whether she could be pregnant.", exam: "Pelvis X-ray",
    answer: "info", why: "The pelvis is in the primary beam, so you must ask about pregnancy and follow your department's procedure (IR(ME)R). If pregnancy can't be ruled out, the practitioner weighs the clinical urgency before going ahead.",
    notes: { go: "Not until the pregnancy enquiry is done and recorded.", none: "The injury may still need imaging; the pregnancy question comes first." } },
  { patient: "Man, 71", details: "Productive cough, fever, crackles at the right base. ?Pneumonia.", exam: "Chest X-ray",
    answer: "go", why: "A clear clinical question that the X-ray answers well, guiding treatment. A chest PA is about 0.02 mSv, three days of natural background.",
    notes: { alt: "A chest X-ray is the right first test here.", info: "The request already gives the findings and the question." } },
  { patient: "Man, 35", details: "No symptoms. Would like a full-body scan, just to check everything is fine.", exam: "CT, chest, abdomen and pelvis",
    answer: "none", why: "With no symptoms and no clinical question, there is no benefit to weigh against the risk, so the exposure can't be justified. CT of the chest, abdomen and pelvis is around 10 mSv or more: years of natural background.",
    notes: { go: "There is nothing for the scan to answer, so no benefit to justify the dose.", alt: "No examination is indicated without a clinical question.", info: "The request is clear: there is simply no clinical indication." } },
];

const MARKUP = `
<div class="grid">
  <div class="stage just-stage">
    <p class="eyebrow" data-role="count"></p>
    <div class="request" data-role="card"></div>
    <p class="scale-note">Teaching examples. In practice, follow your department's referral criteria and IR(ME)R procedures.</p>
  </div>
  <div class="panel">
    <fieldset class="just-choices" data-role="choices">
      <legend class="label">What should happen?</legend>
      ${Object.entries(CHOICES).map(([k, t]) => `<button type="button" class="just-opt" data-choice="${k}"><span>${t}</span><span class="tagline"></span></button>`).join("")}
    </fieldset>
    <div class="summary" data-role="fb" aria-live="polite" hidden></div>
    <div class="controls"><button type="button" class="primary" data-role="next" hidden>Next scenario</button><button type="button" data-role="restart">Start again</button></div>
    <p data-role="score" aria-live="polite"></p>
    <div class="part-card">
      <p class="eyebrow">Risk vs benefit</p>
      <p>No exposure goes ahead unless the expected benefit to the patient outweighs the risk. Under IR(ME)R the <b>referrer</b> supplies the clinical information and the <b>practitioner</b> justifies the exposure. If it is justified, keep the dose <b>as low as reasonably practicable</b>.</p>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  let ix = 0, right = 0, answered = false;

  function show() {
    const c = CASES[ix];
    answered = false;
    $("count").textContent = `Request ${ix + 1} of ${CASES.length}`;
    $("card").innerHTML = `<p class="request-head">Imaging request</p>
      <dl><div><dt>Patient</dt><dd>${c.patient}</dd></div>
      <div><dt>Clinical details</dt><dd>${c.details}</dd></div>
      <div><dt>Examination requested</dt><dd>${c.exam}</dd></div></dl>`;
    root.querySelectorAll("[data-choice]").forEach(b => { b.disabled = false; b.classList.remove("is-correct", "is-wrong"); b.querySelector(".tagline").textContent = ""; });
    $("fb").hidden = true;
    $("next").hidden = true;
  }

  root.querySelectorAll("[data-choice]").forEach(b => b.addEventListener("click", () => {
    if (answered) return;
    answered = true;
    const c = CASES[ix], k = b.dataset.choice, ok = k === c.answer;
    if (ok) right++;
    root.querySelectorAll("[data-choice]").forEach(x => {
      x.disabled = true;
      if (x.dataset.choice === c.answer) { x.classList.add("is-correct"); x.querySelector(".tagline").textContent = "Usual decision"; }
      else if (x === b) { x.classList.add("is-wrong"); x.querySelector(".tagline").textContent = "Your choice"; }
    });
    $("fb").innerHTML = `<p class="verdict ${ok ? "good" : "bad"}">${ok ? "Agreed" : "Think again"}</p>
      ${!ok && c.notes[k] ? `<p><b>Your choice:</b> ${c.notes[k]}</p>` : ""}<p><b>${CHOICES[c.answer]}.</b> ${c.why}</p>`;
    $("fb").hidden = false;
    const last = ix === CASES.length - 1;
    $("next").hidden = last;
    $("score").textContent = `${right} of ${ix + 1} matched the usual decision.${last ? " That's all eight: start again to try once more." : ""}`;
    if (!last) $("next").focus();
  }));
  $("next").addEventListener("click", () => { ix++; show(); });
  $("restart").addEventListener("click", () => { ix = 0; right = 0; $("score").textContent = ""; show(); });
  show();
}
