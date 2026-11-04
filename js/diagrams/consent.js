// Scenarios: is consent valid? For each, spot the missing element (disclosure, understanding, voluntariness or capacity), or
// decide that nothing is missing. Each answer says what to do next. Content follows the Medico-legal lecture; the scenarios
// need clinical sign-off before students see them.
import { mountSort } from "./sortkit.js";

const CARDS = [
  ["The radiographer positions the patient for a knee X-ray without saying what the examination is for.", "disclosure", "The patient needs clear information about the purpose, benefits and risks first. Explain, then check they are happy to go ahead."],
  ["The patient is told how the CT scan will help, but nothing about the radiation dose.", "disclosure", "IR(ME)R requires patients to be given information on the benefits <i>and</i> risks of the exposure."],
  ["The patient nods along, but speaks little English and no interpreter has been offered.", "understanding", "Nodding isn't understanding. Arrange an interpreter, following local policy, and check understanding before going ahead."],
  ["A relative insists the patient \"just get it done\", while the patient says they would rather wait.", "voluntariness", "The decision must be the patient's own, free from pressure. Speak to the patient, and respect what they decide."],
  ["\"We're running late, so let's just get on with it,\" the radiographer says, as the patient hesitates.", "voluntariness", "Hurrying a hesitant patient is pressure. Give them time to ask questions and decide."],
  ["An adult patient is very confused after a head injury and can't retain or weigh up the information.", "capacity", "The patient lacks capacity for this decision. Follow the Mental Capacity Act and local policy: a decision made in their best interests, recorded."],
  ["After an explanation of the chest X-ray, the patient asks a question, gets an answer, then stands at the detector.", "valid", "Consent can be given verbally or by actions after an explanation. A signed form isn't needed for plain radiography."],
  ["A patient with capacity hears the benefits and risks, then declines the examination.", "valid", "This is a valid refusal. Respect it: answer their concerns, inform the referrer and record what happened."],
];
const ASIDE = `
  <div class="part-card"><p class="eyebrow">Valid consent needs all four</p><h3>Disclosure, understanding, voluntariness, capacity</h3>
    <p><b>Disclosure:</b> purpose, risks, benefits and alternatives. <b>Understanding:</b> they can understand and weigh it. <b>Voluntariness:</b> free from pressure. <b>Capacity:</b> able to make this decision.</p></div>`;

export function mount(root) {
  mountSort(root, { cards: CARDS, bins: { disclosure: "Disclosure", understanding: "Understanding", voluntariness: "Voluntariness", capacity: "Capacity", valid: "Nothing missing" },
    aside: ASIDE, prompt: "What's missing in each case?" });
}
