<!--
Lessons for topic 8, Dosimetry & Dose Control. The README explains the format.
-->

# Absorbed, equivalent and effective dose
id: dose-quantities
summary: The three dose quantities, their units, and what each one is for.
areas: Dose quantities
diagram: tissue-weights
status: draft
sources: 12-2 s10–17

**Absorbed dose** is the energy deposited by ionising radiation per unit mass of material. Its unit is the **gray** (Gy): 1 Gy is 1 joule per kilogram.

Some radiations do more biological damage than others for the same absorbed dose. **Equivalent dose** allows for this: absorbed dose × the **radiation weighting factor** (wR). For X-rays, gamma rays and beta particles wR = 1; for alpha particles it is 20. Its unit is the **sievert** (Sv), so for X-rays the equivalent dose in Sv equals the absorbed dose in Gy.

Some **tissues** are more sensitive than others. **Effective dose** multiplies each organ's equivalent dose by its **tissue weighting factor** (wT) and adds them up. In ICRP 103, red bone marrow, colon, lung, stomach and breast each have 0.12; skin, brain, bone surface and salivary glands 0.01. Effective dose, also in sieverts, is the whole-body dose that would carry the same overall risk.

That makes effective dose useful for **comparing** the risk of different examinations, such as a chest X-ray, a CT head or a bone scan, on one scale. It describes the average risk for a typical person, not a precise risk for one patient.

## Try this
- Tap organs to see their tissue weighting factors.
- Put the chest, then a knee, in the beam: the same dose counts very differently towards effective dose.

## Key points
- Absorbed dose: energy per unit mass, in Gy (1 J/kg).
- Equivalent dose: absorbed dose × radiation weighting factor (X-rays 1, alpha 20), in Sv.
- Effective dose: sum of equivalent doses × tissue weighting factors, in Sv.
- Effective dose lets the risks of different examinations be compared.

# ESD, DAP and reference levels
id: esd-dap-drl
summary: How patient dose is measured in practice, and the benchmarks it is checked against.
areas: ESD and DAP; Diagnostic reference levels
status: draft
sources: 12-2 s19–20, s24–30

**Entrance skin dose** (ESD) is the absorbed dose at the skin where the beam enters the patient, in mGy. It can be measured directly or estimated, and is used in quality control and for reference levels.

A **dose–area product** (DAP) meter is a large, flat **ionisation chamber** just beyond the collimators, through which the whole beam passes. Its reading is the dose multiplied by the area of the beam, in **Gy cm²**. DAP is often a better indicator of risk than ESD alone: two exposures with the same skin dose carry different risk if one irradiates a much larger area. DAP combines dose and area, so it reflects the total energy put into the patient.

**Diagnostic reference levels** (DRLs) are benchmark doses (such as ESD or DAP) for standard examinations on typical patients, set nationally and locally and reviewed regularly. They are **not limits** for individual patients. But if a department **consistently exceeds** a DRL, it must investigate and take **corrective action**, such as changing techniques, equipment settings or training.

## Key points
- ESD: absorbed dose at the skin where the beam enters, in mGy.
- DAP: dose × beam area, in Gy cm², from an ionisation chamber beyond the collimators; it reflects risk better than ESD alone.
- DRLs are benchmarks for typical patients, not individual limits; consistently exceeding one requires corrective action.

# Measuring radiation
id: measuring
summary: Ionisation chambers and Geiger–Müller tubes.
areas: Measuring radiation
status: draft
sources: 12-2 s27, s31

Most radiation measurement relies on **ionisation**. In an **ionisation chamber**, radiation ionises the gas inside. A voltage across the chamber collects all the ions, and the current that flows is **proportional to the radiation**. Ionisation chambers are accurate, which is why they are used in **DAP meters**, **AEC** systems and for **calibrating** equipment.

A **Geiger–Müller (GM) tube** works at a much higher voltage, so each ionising event sets off an avalanche of ions and a pulse that can be counted. That makes it very **sensitive**: good for **detecting** low levels of radiation or **contamination**. But it can't tell a small event from a large one, so it doesn't measure **dose** accurately.

## Key points
- Ionisation chamber: collects the ions made in a gas; the current is proportional to the radiation. Accurate: used in DAP meters, AEC and calibration.
- GM tube: very sensitive and counts events; good for detecting radiation and contamination, not for measuring dose.

# Personal monitoring
id: personal-monitoring
summary: Who must be monitored, and how film badges, TLDs and electronic dosimeters work.
areas: Personal monitoring
status: draft
sources: 12-2 s32–41

Under **IRR17**, workers likely to receive an effective dose of more than **6 mSv a year** (or more than three-tenths of an equivalent dose limit) must be **classified**, and their dose monitored by an **approved dosimetry service**. The lecture slide gives a 10% rule; IRR17's classification is used here.

**Film badges** hold film behind several **metal filters**. Radiation darkens the film, and comparing the darkening behind each filter helps identify the **type, energy and direction** of the radiation. They are cheap and give a permanent record, but heat and humidity affect them.

A **thermoluminescent dosimeter** (TLD) uses a crystal, usually **lithium fluoride**. Radiation frees electrons that become **trapped** at imperfections in the crystal. When the TLD is **heated**, they are released and give off **light** in proportion to the dose. Lithium fluoride has an effective atomic number close to **soft tissue**, so it absorbs radiation much as tissue does: a more accurate dosimeter than film.

**Pocket and electronic dosimeters** give an **immediate reading**, useful during procedures, though they cost more and some types keep no permanent record.

## Key points
- IRR17: workers likely to exceed 6 mSv a year are classified and monitored by an approved dosimetry service.
- Film badge: filters help identify the type, energy and direction of radiation; a permanent record.
- TLD: heating releases trapped electrons as light in proportion to dose; lithium fluoride is tissue-equivalent.
- Electronic dosimeters give an immediate reading.

# Controlling dose
id: controlling-dose
summary: How patient dose is kept down, and what happens when something goes wrong.
areas: Controlling dose
diagram: dose-choices
status: draft
sources: 12-2 s44–45

Patient dose is controlled through good practice at every step:

- **Collimate** to the area of interest: a bigger field than needed irradiates extra tissue and adds scatter.
- Choose **exposure factors** carefully, and use the AEC correctly.
- **Control scatter** with collimation, and with grids where they are needed.
- Get it **right first time**: clear instructions and immobilisation avoid repeats.

For staff, the principles are **time, distance and shielding** (topic 9).

If a patient receives a **much higher dose than intended**, IR(ME)R 2017 requires the incident to be **investigated**. If it is significant, it must be **notified** to the regulator, **Healthcare Inspectorate Wales** (HIW) in Wales or the **Care Quality Commission** (CQC) in England, and the **patient informed**.

## Try this
- Make the choices for an AP pelvis and watch how each one moves the dose.

## Key points
- Collimate, choose exposure factors well, control scatter, and avoid repeats.
- A larger field than needed adds dose and scatter.
- Significant unintended exposures are investigated, notified (HIW in Wales, CQC in England) and the patient informed.

# Explaining dose to patients
id: explaining-dose
summary: Putting examination doses into words a patient can understand.
areas: Explaining dose
diagram: dose-ladder
status: draft
sources: 12-2 s46–47

Patients often ask how much radiation an examination gives. Effective doses in millisieverts mean little to most people, so it helps to compare them with **natural background radiation**, which everyone receives from the ground, the air and space: about **2.1 mSv a year** on average in the UK.

UKHSA's typical adult effective doses include:

- Chest X-ray (single PA): about **0.02 mSv**, a few days of background.
- Lumbar spine: about **1.3 mSv**, around 7 months.
- CT abdomen and pelvis: about **10 mSv**, around 4.5 years.

When explaining, start with the **benefit**: the examination has been requested because the information will help their care. Then put the dose in context, and keep it honest: every exposure carries a small risk, and that is why it is only done when justified and kept as low as possible.

## Try this
- Tap an examination to read how you might explain its dose to a patient.
- Change the age group and see how the risk changes for children and older adults.

## Key points
- Compare doses with natural background: about 2.1 mSv a year in the UK.
- A chest X-ray is about 0.02 mSv, a few days of background; CT doses are much higher.
- Lead with the benefit, then put the risk in context honestly.
