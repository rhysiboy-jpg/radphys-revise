// Sorter: QA programme or QC test? Quality assurance is the whole programme; quality control is the testing within it.
// Content follows the QA and QC lecture and the topic 11 lessons.
import { mountSort } from "./sortkit.js";

const CARDS = [
  ["Measuring the tube output with an ionisation chamber.", "qc", "A measurement of equipment performance: quality control."],
  ["Checking that the light beam matches the X-ray field.", "qc", "Light beam alignment is a QC test."],
  ["Writing the purchase specification for a new X-ray room.", "qa", "Specifications are part of the wider QA programme: they set what acceptance testing checks against."],
  ["Training staff in the department's QA procedures.", "qa", "Training is part of the QA programme."],
  ["Imaging a Leeds test object to check low-contrast detail.", "qc", "An image quality test: quality control."],
  ["Deciding who is responsible for each part of the programme.", "qa", "Responsibilities are set by the QA programme."],
  ["Auditing whether the procedures are being followed.", "qa", "Audit checks the programme itself: quality assurance."],
  ["Measuring the kVp with an electronic kVp meter.", "qc", "Testing the tube voltage is quality control."],
  ["Keeping a record of every test result.", "qa", "Records are part of the QA programme, and may be needed as evidence for inspectors."],
  ["Checking detector uniformity with an exposure of an empty field.", "qc", "A uniformity test is quality control."],
  ["Setting the levels each result is judged against.", "qa", "Standards and action levels belong to the QA programme; the QC tests are judged against them."],
];
const ASIDE = `
  <div class="part-card"><p class="eyebrow">Quality assurance</p><h3>The whole programme</h3>
    <p>Responsibilities, specifications, standards, procedures, records, training and audit.</p></div>
  <div class="part-card"><p class="eyebrow">Quality control</p><h3>The testing within it</h3>
    <p>Measuring and monitoring equipment performance: output, kVp, alignment, image quality.</p></div>`;

export function mount(root) {
  mountSort(root, { cards: CARDS, bins: { qa: "QA programme", qc: "QC test" }, aside: ASIDE, prompt: "QA programme or QC test?" });
}
