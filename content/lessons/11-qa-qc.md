<!--
Lessons for topic 11, QA & QC. The README explains the format.
-->

# Quality assurance and quality control
id: qa-qc
summary: The difference between QA and QC, and why a QA programme is required.
areas: QA and QC
status: draft
sources: 11-5 s2; 24-1 s2–4, s34

**Quality assurance** (QA) is the **whole programme** for making sure images are consistently good enough for diagnosis at the lowest reasonable dose and cost. It covers responsibilities, purchase specifications, standards, procedures, records, training and audit. The World Health Organization describes its aim as images that consistently give adequate diagnostic information at the **lowest possible cost and patient exposure**.

**Quality control** (QC) is the **testing** part of QA: the actual measuring and monitoring of equipment performance, such as checking the tube output or the light beam alignment.

A QA programme is a **legal requirement**. **IRR17** requires the employer to provide a suitable QA programme, so equipment keeps restricting exposure as far as reasonably practicable, and **IR(ME)R 2017** requires it too. It is also part of the HCPC standards of proficiency. In practice it means patients get diagnostic images without unnecessary dose, and faults are found before they affect them.

## Key points
- QA: the whole programme (responsibilities, standards, records, training).
- QC: the testing and monitoring of equipment, within QA.
- Aim: consistently diagnostic images at the lowest reasonable cost and patient exposure.
- Required by IRR17 and IR(ME)R 2017.

# The life of an X-ray system
id: life-cycle
summary: Acceptance, commissioning and routine testing.
areas: Equipment life cycle
status: draft
sources: 24-1 s5, s8–12

QA follows an X-ray system through its whole life.

**Acceptance testing** happens after installation and before clinical use. It checks that the equipment meets its **purchase specification** and is **safe**.

**Commissioning** then measures how the equipment performs when it is working well, recording **baseline values**.

**Routine performance testing** compares later results with those baselines. Equipment drifts over time, so this detects **gradual deterioration** before it affects patients. After a repair, a further test confirms that the fault has been put right.

## Key points
- Acceptance: does new equipment meet its specification, and is it safe?
- Commissioning: record baseline performance.
- Routine testing: compare with the baselines to catch deterioration; retest after repairs.

# IPEM Report 91
id: ipem-91
summary: Remedial and suspension levels, and why every result is recorded.
areas: IPEM Report 91
diagram: qa-check
status: draft
sources: 24-1 s14–16

**IPEM Report 91**, from the Institute of Physics and Engineering in Medicine, sets out recommended standards for routine performance testing of diagnostic X-ray systems: which tests to do, how often, and the levels that trigger action.

- The **remedial level** is a level of performance at which **action is needed**, but the equipment may **stay in use** meanwhile. A risk assessment decides whether that is safe, and a timescale for the fix is agreed.
- The **suspension level** recommends that the equipment is **removed from clinical use immediately**: performance is poor enough that continued use would be unsafe or give inadequate images.

Some tests, such as image quality checks, are partly **subjective**, so they have remedial levels but **no suspension level**.

All results must be **documented** and remedial actions followed up promptly. Records may be needed as evidence for HSE inspectors, and test equipment such as dosemeters must itself be in calibration.

## Try this
- Choose a test and move the measured result: watch it cross the remedial, then the suspension level.

## Key points
- IPEM 91: which tests, how often, and the action levels.
- Remedial level: act on it, but the equipment may stay in use after a risk assessment.
- Suspension level: remove from clinical use immediately.
- Record every result; subjective tests have no suspension level.

# Testing the X-ray equipment
id: equipment-tests
summary: Light beam alignment, output, kVp, AEC, guard timer and focal spot tests.
areas: Equipment tests
diagram: qa-check
status: draft
sources: 24-1 s18–27

- **Light beam alignment**: the edges of the light field are marked, an exposure is made, and the light and X-ray fields are compared. If they don't match, patients may be irradiated outside the intended area, or anatomy may be cut off.
- **Tube output**: an **ionisation chamber** and electrometer at a known distance measure the dose for a range of exposures: the output per mAs, how it varies with mA and kVp, and whether repeated exposures are consistent.
- **Tube voltage**: an electronic **kVp meter** checks the actual kVp matches the selected value, doesn't change with mA or time, and stays steady during the exposure.
- **AEC**: Perspex or water phantoms of different thicknesses are exposed at different kVp. A working AEC keeps the **detector dose indicator** consistent. (The slides describe film and optical density; digital systems use the dose indicator.)
- **Guard timer**: it ends the exposure if the AEC fails to. It is tested by **blocking the AEC chambers with lead**: the timer must stop the exposure at its set limit.
- **Focal spot size**: measured with a **pinhole** (an image of the focal spot) or a **star test object** (the size of its blurred centre gives the focal spot size).

## Try this
- Read the method and how often each test is done, then try results either side of the levels.

## Key points
- Light beam alignment: light field matches X-ray field.
- Output: ionisation chamber and electrometer; kVp: electronic kVp meter.
- AEC: phantoms of different thickness give a consistent detector dose indicator; guard timer tested by blocking the chambers.
- Focal spot: pinhole or star test object.

# Testing digital image quality
id: image-quality-tests
summary: Resolution, low-contrast detail and detector uniformity.
areas: Digital image quality tests
diagram: qa-check
status: draft
sources: 24-1 s30–32

Digital systems need their own image quality checks, compared each time with the baseline.

- **Spatial resolution**: a **lead bar pattern** has groups of lines at increasing spatial frequency. The finest group still seen as separate lines gives the **limiting resolution**.
- **Low-contrast detail**: a **Leeds test object** contains details of decreasing contrast. Counting how many can be seen, and comparing with the baseline, shows whether low-contrast performance has deteriorated.
- **Uniformity**: an exposure is made with **nothing in the field**. A uniform detector gives similar pixel values everywhere, so regions of interest in the four quadrants and the centre are compared.

These tests are partly subjective, so they are scored carefully against the baseline and recorded.

## Try this
- Find the resolution and low-contrast tests in the checker, and try results either side of the remedial level.

## Key points
- Lead bar pattern: limiting spatial resolution.
- Leeds test object: low-contrast detail, compared with the baseline.
- Uniformity: no object in the field; compare the quadrants and the centre.
