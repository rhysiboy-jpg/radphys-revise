// Sorter: stochastic or deterministic? Each card is an effect or a property; the student files it, and each answer explains itself.
// Content follows the Cellular Effects of Radiation and Dose Measurement lectures. Uses the shared sorting activity.
import { mountSort } from "./sortkit.js";

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
const ASIDE = `
  <div class="part-card">
    <p class="eyebrow">Stochastic</p>
    <h3>A matter of chance</h3>
    <p>No threshold. The <b>probability</b> rises with dose; the severity does not. Every exposure carries some risk. Examples: cancer, heritable effects.</p>
  </div>
  <div class="part-card">
    <p class="eyebrow">Deterministic (tissue reactions)</p>
    <h3>Above a threshold</h3>
    <p>Below the threshold dose the effect does not occur. Above it, the <b>severity</b> rises with dose. Examples: erythema, cataract, hair loss.</p>
  </div>`;

export function mount(root) {
  mountSort(root, { cards: CARDS, bins: { s: "Stochastic", d: "Deterministic" }, aside: ASIDE, prompt: "File each card as stochastic or deterministic." });
}
