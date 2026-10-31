// Sorter: stochastic or deterministic? Each card is an effect or a property; the student files it, and each answer explains itself.
// Content follows the Cellular Effects of Radiation and Dose Measurement lectures.

const CARDS = [
  ["Radiation-induced cancer", "s", "Cancer induction is the main stochastic effect: the chance rises with dose, with no threshold."],
  ["Leukaemia", "s", "A radiation-induced cancer, so stochastic: more dose makes it more likely, not more severe."],
  ["Heritable (genetic) effects in a patient's children", "s", "Damage to the chromosomes in ova or sperm is a matter of chance, so stochastic. That is why gonad dose is kept as low as possible."],
  ["No threshold: any dose carries some chance of harm", "s", "This is what makes an effect stochastic, and why there is no completely safe dose."],
  ["The chance of the effect rises with dose, but not its severity", "s", "A stochastic effect either happens or it does not. More dose makes it more likely, not worse."],
  ["The main concern for patients in diagnostic radiography", "s", "Diagnostic doses are far below the thresholds for tissue reactions, so the concern is stochastic risk."],
  ["Skin erythema (reddening)", "d", "Erythema appears only above a threshold dose and gets worse with more dose: deterministic. Becquerel saw it on his own skin after carrying radium in his pocket."],
  ["Cataract", "d", "Lens opacity needs a threshold dose to be passed: a deterministic effect, or tissue reaction."],
  ["Hair loss (epilation)", "d", "Hair loss happens above a threshold, and more dose means more loss: deterministic."],
  ["Temporary sterility", "d", "It needs a threshold dose to the gonads, and is more severe and longer lasting at higher doses: deterministic."],
  ["There is a threshold dose below which the effect does not occur", "d", "A threshold is the mark of a deterministic effect."],
  ["Severity increases with dose", "d", "For deterministic effects the dose sets how severe the effect is."],
  ["More likely in radiotherapy or long interventional procedures", "d", "Only large doses pass the thresholds, so deterministic effects are mainly seen in radiotherapy and long fluoroscopy-guided procedures."],
];
const NAME = { s: "Stochastic", d: "Deterministic" };

const MARKUP = `
<div class="grid">
  <div class="stage sort-stage">
    <p class="sort-progress" data-role="progress" aria-live="polite"></p>
    <ol class="sort-list" data-role="list"></ol>
    <div class="controls"><button type="button" data-role="again">Shuffle and start again</button></div>
  </div>
  <div class="panel">
    <div class="part-card">
      <p class="eyebrow">Stochastic</p>
      <h3>A matter of chance</h3>
      <p>No threshold. The <b>probability</b> rises with dose; the severity does not. Every exposure carries some risk. Examples: cancer, heritable effects.</p>
    </div>
    <div class="part-card">
      <p class="eyebrow">Deterministic (tissue reactions)</p>
      <h3>Above a threshold</h3>
      <p>Below the threshold dose the effect does not occur. Above it, the <b>severity</b> rises with dose. Examples: erythema, cataract, hair loss.</p>
    </div>
  </div>
</div>`;

export function mount(root) {
  root.innerHTML = MARKUP;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  let order = [], done = 0, right = 0;

  function progress() {
    $("progress").textContent = done === CARDS.length
      ? `All ${CARDS.length} sorted: ${right} right.${right === CARDS.length ? " Every one." : " Shuffle to try again."}`
      : `Sorted ${done} of ${CARDS.length}${done ? `, ${right} right` : ""}. File each card as stochastic or deterministic.`;
  }

  function start() {
    order = CARDS.map((c, i) => [Math.random(), i]).sort((a, b) => a[0] - b[0]).map(([, i]) => CARDS[i]);
    done = 0; right = 0;
    const list = $("list");
    list.innerHTML = "";
    order.forEach(([text, kind, why]) => {
      const li = document.createElement("li");
      li.className = "sort-card";
      li.innerHTML = `<p class="sort-text">${text}</p>
        <div class="controls" role="group" aria-label="${text}">
          <button type="button" data-k="s">Stochastic</button>
          <button type="button" data-k="d">Deterministic</button>
        </div>
        <p class="sort-why" hidden></p>`;
      li.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => {
        const ok = b.dataset.k === kind;
        done++; if (ok) right++;
        li.classList.add(ok ? "is-correct" : "is-wrong");
        li.querySelectorAll("[data-k]").forEach(x => { x.disabled = true; x.setAttribute("aria-pressed", x === b); });
        const why_ = li.querySelector(".sort-why");
        why_.innerHTML = `<b>${ok ? "Right" : "Not quite"}: ${NAME[kind].toLowerCase()}.</b> ${why}`;
        why_.hidden = false;
        progress();
      }));
      list.appendChild(li);
    });
    progress();
  }

  $("again").addEventListener("click", start);
  start();
}
