<!--
Lessons for topic 11, QA & QC. The README explains the format.
Wording follows the lecture slides where it can (11-5, 24-1); levels are as given in the lecture, which cites IPEM Report 91.
-->

# Quality assurance and quality control
id: qa-qc
summary: The difference between QA and QC, and why a QA programme is required.
areas: QA and QC
diagram: qa-sort
status: draft
sources: 11-5 s2; 24-1 s2–4, s34

The World Health Organization describes **quality assurance (QA)** as an organised effort by the staff operating a facility to ensure that the diagnostic images produced are of sufficiently high quality that they consistently provide adequate diagnostic information, at the **lowest possible cost** and with the **least possible exposure of the patient** to radiation.

**QA** is the entire assurance programme. It should include:

- responsibilities;
- purchase specifications;
- standards for image quality;
- monitoring and maintenance programmes;
- records and the quality assurance manual;
- training.

**Quality control (QC)** is the actual techniques used in monitoring, testing and maintenance: daily, monthly, quarterly and annual tests. Performance and stability are its main goals.

Why QA? It is a **legal requirement**. Under **IRR17** (regulation 33), the employer must make arrangements for a suitable quality assurance programme for the equipment, to ensure that it remains capable of restricting exposure so far as is reasonably practicable. **IR(ME)R 2017** requires it too, and it is part of the HCPC standards of proficiency for radiographers.

## Try this
- Sort each activity: is it part of the **programme**, or a **test** of the equipment?

## Key points
- QA: the entire assurance programme (responsibilities, standards, records, training).
- QC: the actual techniques used in monitoring, testing and maintenance, within QA.
- Aim: images that consistently provide adequate diagnostic information, at the lowest possible cost and patient exposure.
- Required by IRR17 and IR(ME)R 2017.

# The life of an X-ray system
id: life-cycle
summary: Acceptance testing, commissioning and routine performance testing.
areas: Equipment life cycle
diagram: qa-lifecycle
status: draft
sources: 24-1 s5, s8–12

QA follows an X-ray imaging system through its life cycle. The quality control part is summarised in four principal steps, with maintenance vital throughout.

- **Acceptance testing** takes place after installation and before clinical use. It checks that the equipment meets its **purchase specification** and is **safe**.
- **Commissioning** measures how the equipment performs when it is working well, and records **baseline values**.
- **Routine performance testing** compares later results with those baselines, for the detection and diagnosis of changes in equipment performance. Performance changes gradually over time, so this detects deterioration before it affects patients.
- **Correction verification**: after a repair, a further test verifies that the cause of the deterioration has been corrected.

## Predict
What are the results of routine QA tests compared with?
- The manufacturer's brochure
- * The baseline recorded at commissioning
- The national DRLs
> Commissioning records how the equipment performs when it is working well. Routine performance tests are compared with that baseline, to detect gradual changes.

## Try this
- Step through the **gradual drift**: when does routine testing detect it, and what happens next?
- Now the **sudden fault**: why is this one handled differently?

## Key points
- Acceptance testing: does new equipment meet its specification, and is it safe?
- Commissioning: record the baseline performance.
- Routine performance testing: compare with the baselines to detect changes in performance.
- Correction verification: test again after a repair.

# IPEM Report 91
id: ipem-91
summary: Remedial and suspension levels, and why every result is documented.
areas: IPEM Report 91
diagram: qa-check
status: draft
sources: 24-1 s14–16

The Institute of Physics and Engineering in Medicine (IPEM) produces a series of reports on the QA of medical equipment. The most useful for diagnostic radiology is **IPEM Report 91**: recommended standards for the routine performance testing of diagnostic X-ray imaging systems. It relates primarily to imaging performance and radiation safety checks.

- **Remedial level**: a level of performance at which **remedial action is required**, but the unit may **continue to be used** in the meantime. The action is based on a risk assessment of the equipment's performance and the risk arising should it continue to be used. A timescale must be agreed, and any restrictions on its use followed.
- **Suspension level**: a level of performance at which it is recommended that the equipment is **removed from clinical use immediately**.

Not all tests have a suspension level, because of the subjective nature of some tests, such as image quality.

IPEM 91 also emphasises that:

- a senior radiographer or other suitable person should be appointed to supervise the QA programme;
- time should be allocated to staff and equipment for testing;
- all QA tests should be **documented**, as they may be required as evidence for HSE inspectors;
- results and remedial actions must be followed up promptly;
- test equipment should be available and within calibration.

## Predict
A test result crosses the remedial level but not the suspension level. What happens to the equipment?
- It is removed from clinical use immediately
- * Remedial action is required, but it may continue to be used after a risk assessment
- Nothing: the result is only recorded
> At the remedial level, action is required and a timescale agreed. At the suspension level, the equipment is removed from clinical use immediately.

## Try this
- Choose a test and move the measured result: watch it cross the remedial level, then the suspension level.

## Key points
- IPEM 91: recommended standards for routine performance testing, with the levels that require action.
- Remedial level: action is required, but the unit may continue to be used after a risk assessment.
- Suspension level: remove from clinical use immediately.
- Document every result. Some subjective tests have no suspension level.

# Testing the X-ray equipment
id: equipment-tests
summary: Light beam alignment, tube output, tube kV, the AEC, the guard timer and the focal spot.
areas: Equipment tests
diagram: qa-check
status: draft
sources: 24-1 s18–27

- **Light beam alignment** (every 1 to 2 months). The edges of the light beam are marked and an exposure is made. The area of the exposed field is then compared with the light field. If they do not match, patients may be irradiated outside the intended area, or anatomy may be missed.
- **Tube output** (every 1 to 2 months). An **ionisation chamber** is placed at a known distance from the X-ray tube. The dose is measured, using an electrometer, for various exposures, to determine the dose per mAs (output), whether the output varies with mA, how it varies with kV, and whether it is consistent when the same exposure is repeated.
- **Tube kV** (every 1 to 2 years). The potential is measured with an electronic **kV meter**, at a range of exposure settings. Is it accurate: do we get the value we selected? Does it change if we change the mA or the exposure time? Does it vary during the exposure?
- **Automatic exposure control** (every 1 to 3 months). The AEC should give a consistent result for a wide range of tube potential (kV) and patient thickness. Perspex or water blocks are used to simulate a patient, with a series of exposures at different tube voltages and thicknesses. The mAs and the **detector dose indicator** are recorded. (The slides also describe film and optical density; digital systems use the detector dose indicator.)
- **Guard timer** (annually). The guard timer terminates the exposure after a set time if the AEC does not. It is tested with a low-kV exposure and **lead blocking the AEC chambers**, ensuring that the exposure is terminated at the guard timer setting.
- **Focal spot size.** A **pinhole**, smaller than the focal spot, is radiographed: from the distances and the size of the image, the size of the focal spot can be calculated. With a **star test object**, an array of radiating lead spokes is imaged; the diameter of the blurred area at the centre is used to calculate the focal spot size.

## Try this
- Read the method for each test and how often it is done, then try results either side of the levels.

## Key points
- Light beam alignment: the light field is compared with the exposed field.
- Tube output: an ionisation chamber and electrometer. Tube kV: an electronic kV meter.
- AEC: Perspex or water blocks of different thickness should give a consistent detector dose indicator. The guard timer is tested with lead blocking the chambers.
- Focal spot: a pinhole or a star test object.

# Testing digital image quality
id: image-quality-tests
summary: Limiting spatial resolution, low-contrast sensitivity and uniformity.
areas: Digital image quality tests
diagram: qa-check
status: draft
sources: 24-1 s30–32

CR and DR systems have their own image quality tests, each compared with the baseline.

- **Limiting spatial resolution** (every 4 to 6 months). A **lead grating resolution bar pattern** is used to assess the highest spatial resolution the system can image accurately.
- **Low-contrast sensitivity** (every 4 to 6 months). A **Leeds test object** is used to ensure that the system is still able to image low-contrast details. The number of groups seen is compared with the baseline.
- **Measured uniformity** (annually). An image is obtained with **no object in the field**. A region of interest is placed over each quadrant and in the centre, and the five values are compared.
- **Dark noise** (annually). An image is obtained without exposure, or with a very low exposure. This tests for noise in the system.

Some of these tests are subjective, so they are scored carefully against the baseline and documented.

## Try this
- Find the resolution and low-contrast tests in the checker, and try results either side of the remedial level.

## Key points
- Lead grating bar pattern: limiting spatial resolution.
- Leeds test object: low-contrast sensitivity, compared with the baseline.
- Uniformity: no object in the field; compare the four quadrants and the centre.
