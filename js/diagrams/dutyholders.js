// Journey: one patient's lumbar spine X-ray, step by step. For each step, which IR(ME)R 2017 duty holder is responsible?
// Kept in order, so it reads as the patient's pathway. Content follows the Medico-legal lecture and the topic 9 lessons.
import { mountSort } from "./sortkit.js";

const STEPS = [
  ["Before any patient arrives: written procedures and protocols for each standard examination, and staff entitled to their roles.", "employer", "The employer provides the framework: procedures, protocols, entitlement and training."],
  ["The department's diagnostic reference levels are set and reviewed.", "employer", "Setting DRLs is the employer's duty."],
  ["A GP requests a lumbar spine X-ray, with the clinical details.", "referrer", "The referrer refers the patient and must give enough clinical information for the exposure to be justified."],
  ["The request is weighed up: does the benefit outweigh the risk, and would a test without ionising radiation do?", "practitioner", "Justification is the practitioner's role."],
  ["A radiographer authorises the exposure by following the practitioner's written guidelines.", "operator", "An operator can authorise an exposure using the practitioner's authorisation guidelines; the practitioner keeps responsibility for the justification."],
  ["Asking about pregnancy, following the employer's procedure.", "operator", "The enquiry is a practical task carried out by the operator, following the employer's written procedure."],
  ["Positioning the patient and selecting the exposure factors.", "operator", "Any practical aspect of the exposure is the operator's."],
  ["Making the exposure.", "operator", "Pressing the exposure button is a practical aspect: the operator."],
  ["Writing the clinical evaluation of the image (the report).", "operator", "IR(ME)R counts clinical evaluation as a practical aspect, so whoever writes the report acts as an operator."],
];
const ASIDE = `
  <div class="part-card"><p class="eyebrow">Four duty holders</p><h3>Who does what?</h3>
    <p><b>Employer:</b> the framework. <b>Referrer:</b> refers, with clinical information. <b>Practitioner:</b> justifies. <b>Operator:</b> any practical aspect.</p>
    <p class="tip"><b>Remember:</b> one person can hold more than one role. A radiographer is often both practitioner and operator.</p></div>`;

export function mount(root) {
  mountSort(root, { cards: STEPS, bins: { employer: "Employer", referrer: "Referrer", practitioner: "Practitioner", operator: "Operator" },
    ordered: true, aside: ASIDE, intro: "One patient's lumbar spine X-ray, in order.", prompt: "Who is responsible for each step?" });
}
