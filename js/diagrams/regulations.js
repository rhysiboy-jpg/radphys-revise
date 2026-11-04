// Sorter: which law covers it? IR(ME)R 2017 (patients; HIW in Wales, CQC in England), IRR17 (workers and the public; HSE) or the
// Data Protection Act 2018 (personal information). Content follows the Medico-legal lecture and the topic 9 lessons.
import { mountSort } from "./sortkit.js";

const CARDS = [
  ["A practitioner justifies a patient's lumbar spine X-ray.", "irmer", "Justifying a medical exposure is an IR(ME)R duty. IR(ME)R is enforced by HIW in Wales and the CQC in England."],
  ["The 20 mSv annual dose limit for a radiographer.", "irr", "Dose limits for workers are set by IRR17, enforced by the HSE."],
  ["Designating the X-ray room as a controlled area.", "irr", "Designated areas are an IRR17 requirement, to protect staff and the public."],
  ["Diagnostic reference levels for standard examinations.", "irmer", "The employer must set DRLs under IR(ME)R: they are about optimising patient doses."],
  ["Local rules on display in the X-ray room.", "irr", "Local rules for controlled areas are required by IRR17."],
  ["The employer's procedure for asking about pregnancy before an exposure.", "irmer", "IR(ME)R requires procedures for pregnancy enquiries, so a possible fetus is considered in justification."],
  ["A patient's images are emailed to the wrong hospital.", "dpa", "This is a breach of personal data, covered by the Data Protection Act 2018 (with UK GDPR) and the duty of confidentiality."],
  ["Appointing a radiation protection supervisor for the department.", "irr", "The RPS, and the radiation protection adviser, are IRR17 roles."],
  ["Investigating a patient who received a much higher dose than intended.", "irmer", "Unintended patient exposures fall under IR(ME)R: investigated, and if significant notified to HIW or the CQC."],
  ["The 1 mSv dose limit for a visitor waiting in the corridor.", "irr", "Dose limits for members of the public are also set by IRR17."],
  ["Entitling a radiographer to act as an operator.", "irmer", "Entitlement of duty holders is the employer's duty under IR(ME)R."],
  ["Keeping patient records secure and sharing them only when needed.", "dpa", "Personal and health information is protected by the Data Protection Act 2018."],
];
const ASIDE = `
  <div class="part-card"><p class="eyebrow">Protects patients</p><h3>IR(ME)R 2017</h3>
    <p>Medical exposures: justification, optimisation, duty holders, DRLs. Enforced by <b>HIW</b> in Wales and the <b>CQC</b> in England.</p></div>
  <div class="part-card"><p class="eyebrow">Protects workers and the public</p><h3>IRR17</h3>
    <p>Dose limits, designated areas, local rules, the RPA and RPS. Enforced by the <b>HSE</b>.</p></div>
  <div class="part-card"><p class="eyebrow">Protects personal information</p><h3>Data Protection Act 2018</h3>
    <p>With UK GDPR and the professional duty of confidentiality.</p></div>`;

export function mount(root) {
  mountSort(root, { cards: CARDS, bins: { irmer: "IR(ME)R", irr: "IRR17", dpa: "Data Protection" }, aside: ASIDE, prompt: "Which law covers each one?" });
}
