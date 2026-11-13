<!--
Lessons for topic 8, Dosimetry & Dose Control. The README explains the format.
Wording follows the lecture slides where it can (12-2); figures follow reference data (ICRP 103, UKHSA, IRR17, IR(ME)R 2017).
-->

# Absorbed, equivalent and effective dose
id: dose-quantities
summary: The three dose quantities, their units, and what each one is for.
areas: Dose quantities
diagram: tissue-weights
status: draft
sources: 12-2 s10–17

Each of these measures is often simply described as "dose", which can lead to confusion.

**Absorbed dose** (D) is the mean energy imparted by ionising radiation per unit mass of material. Its SI unit is the **gray** (Gy), defined as one joule per kilogram. As a point measurement, absorbed dose is suitable for describing localised exposures. Localised diagnostic doses are typically in the range 0 to 50 mGy.

**Equivalent dose** (H) takes into account the biological effectiveness of the radiation type. It is the mean absorbed dose to an organ multiplied by a **radiation weighting factor** (wR). For X-rays, gamma rays and beta particles wR = 1. For alpha particles it is 20: for the same absorbed dose in Gy, alpha particles are 20 times as biologically potent as X-rays or gamma rays. Equivalent dose is measured in **sieverts** (Sv), so for X-rays the equivalent dose in Sv equals the absorbed dose in Gy.

**Effective dose** (E) accounts for the fact that the stochastic risk of cancer induction varies from one tissue to another. It is the sum of the equivalent doses to each organ, each multiplied by its **tissue weighting factor** (wT), and it is also measured in sieverts. Effective dose provides the equivalent whole-body dose that gives the same risk as the localised exposure.

The weighting factors are calculated by the International Commission on Radiological Protection (ICRP). In ICRP 103, red bone marrow, colon, lung, stomach and breast each have 0.12; the gonads 0.08; bladder, liver, oesophagus and thyroid 0.04; skin, bone surface, salivary glands and brain 0.01. Organs remote from the site of irradiation receive only a small equivalent dose, mainly from scatter, so they contribute little to the effective dose even if their weighting factor is high.

Effective dose makes it possible to **compare** the stochastic risk of different examinations, such as a chest X-ray and a CT scan of the head, or the same body part examined with different techniques.

## Try this
- Tap organs to see their tissue weighting factors.
- Put the chest, then a knee, in the beam: the same dose counts very differently towards effective dose.

## Key points
- Absorbed dose: the mean energy imparted per unit mass, in Gy (1 J/kg).
- Equivalent dose: absorbed dose × radiation weighting factor (X-rays 1, alpha particles 20), in Sv.
- Effective dose: the sum of equivalent doses × tissue weighting factors, in Sv. It is the equivalent whole-body dose that gives the same risk.
- Effective dose allows the stochastic risk of different examinations to be compared.

# ESD, DAP and reference levels
id: esd-dap-drl
summary: How patient dose is measured in practice, and the benchmarks it is compared with.
areas: ESD and DAP; Diagnostic reference levels
diagram: dap
status: draft
sources: 12-2 s19–20, s24–30

**Entrance skin dose** (ESD) is the measure of the radiation dose absorbed by the skin where the beam enters the patient, in mGy. It is a directly measurable quantity, and can also be estimated from the dose–area product. It is often used as a benchmark measurement, to assist quality control and optimisation in radiography departments.

**Dose–area product** (DAP) is defined as the absorbed dose multiplied by the area irradiated, expressed in **Gy cm²**. A **DAP meter** is an ionisation chamber, larger than the area of the X-ray beam, placed just beyond the collimators. It must intercept the entire X-ray field for an accurate reading. The reading changes if the exposure factors (kVp, mA or time) are altered, if the area of the field is varied, or both.

Why DAP? It is relatively easy to measure, and it may be a better indicator of risk than entrance dose alone, as it incorporates both the entrance dose and the field size. DAP has been shown to correlate well with the total energy imparted to the patient, which is related to the effective dose and therefore to the overall cancer risk.

**Diagnostic reference levels (DRLs)** establish a benchmark for optimisation in the use of medical radiation. They are required for all examinations, are set at national and local level, and are regularly reviewed. They are not limits for individual patients. If a DRL is **consistently exceeded**, corrective action **must** be taken: modifying equipment, changing techniques or retraining staff.

## Predict
Open the collimators from 20 to 40 cm square, with the same exposure. What happens to the ESD?
- It quadruples
- * It stays about the same, while the DAP quadruples
- It halves
> The skin dose depends on the exposure, not the field size. DAP is the dose multiplied by the area irradiated, and doubling the side of the field quadruples the area.

## Try this
- Open the field from 20 to 40 cm: the ESD stays the same while the DAP rises past the reference level.
- Double the **exposure**: now the ESD and the DAP both double.
- Change between measuring at **the DAP meter** and at **the skin**: dose × area gives the same result.

## Key points
- ESD: the dose absorbed by the skin where the beam enters, in mGy.
- DAP: the absorbed dose multiplied by the area irradiated, in Gy cm², from an ionisation chamber beyond the collimators. It may be a better indicator of risk than entrance dose alone.
- DRLs are benchmarks, not individual limits. If one is consistently exceeded, corrective action must be taken.

# Measuring radiation
id: measuring
summary: Ionisation chambers and Geiger–Müller tubes.
areas: Measuring radiation
diagram: gas-detector
status: draft
sources: 12-2 s27, s31

Radiation measurement instruments detect and measure radiation, and are generally gas filled. The major types are the ionisation chamber, the proportional counter and the Geiger–Müller detector.

The **ionisation chamber** is the simplest of all gas-filled radiation detectors, and is widely used for the detection and measurement of X-rays, gamma rays and beta particles. It collects all the charges created by direct ionisation within the gas, through the application of an electric field. The current produced is **proportional to the radiation**, so it measures accurately. Ionisation chambers are used in **DAP meters**, in **AEC** systems and for calibration.

A **Geiger–Müller (GM) tube** works at a much higher voltage, so that each ionisation event produces a pulse of the same size. It **counts** ionisation events. It is highly sensitive to low-intensity radiation, and is used to **detect** radiation, **not to measure** it: for example as a contamination monitor.

## Predict
In a Geiger–Müller tube, how does the pulse from a large event compare with the pulse from a small one?
- Larger, in proportion
- * The same size
- Smaller
> Every event produces a pulse of the same size. A GM tube counts ionisation events; an ionisation chamber measures.

## Try this
- In the **ionisation chamber** region, compare the two events: the larger one gives a proportionally larger signal.
- Move into the **Geiger–Müller** region: both events give the same large pulse.
- Why is the ionisation chamber used in DAP meters and AEC systems?

## Key points
- Ionisation chamber: collects all the charges created by ionisation within the gas. The current is proportional to the radiation, so it measures. Used in DAP meters, AEC systems and calibration.
- GM tube: counts ionisation events and is highly sensitive. Used to detect radiation and contamination, not to measure dose.

# Personal monitoring
id: personal-monitoring
summary: Who must be monitored, and how film badges, TLDs and pocket dosimeters work.
areas: Personal monitoring
diagram: dosimeters
status: draft
sources: 12-2 s32–41

Personnel monitoring is generally accomplished through personal dosimetry. Under **IRR17**, workers likely to receive an effective dose of more than **6 mSv a year** (or more than three-tenths of an equivalent dose limit) must be **classified**, and their dose assessed by an approved dosimetry service. The lecture slide gives a 10% rule; IRR17's classification is used here.

A personal dosimeter should be lightweight, durable, reliable and inexpensive. There are three main types.

The **film badge** is the most widely used and the most economical. It consists of a plastic film holder, **metal filters** and a film packet, and can read X-ray, gamma and beta radiation.

- Advantages: lightweight, durable and cost efficient; a permanent legal record; it can differentiate between scatter and the primary beam, and can indicate the direction the radiation came from when worn correctly.
- Disadvantages: it only records exposure where it is worn; it can be affected by heat and humidity; the exposure cannot be determined on the day; accuracy is limited to about ± 20%.

A **thermoluminescent dosimeter (TLD)** contains a phosphor, such as **lithium fluoride**, in a solid crystal structure. Ionising radiation deposits energy in the material, and some atoms become ionised, producing free electrons. Imperfections in the lattice structure trap the free electrons. When the crystal is **heated**, the trapped electrons are released and return to their original state, releasing energy as **light**. The light is counted in photomultiplier tubes, and the number of photons counted is proportional to the quantity of radiation.

- Advantages: the crystals in a TLD interact with ionising radiation as tissue does, so it determines dose more accurately.
- Disadvantages: the initial cost is greater than that of a film badge; it can only be read once; it records exposure only where it is worn.

A **pocket dosimeter** is the most sensitive personal dosimeter. It is small and easy to use and provides an **immediate reading**, but it is expensive, readings can be lost, and it gives no permanent record.

## Predict
A film badge is exposed to high-energy gamma rays. How will the film look behind its filters?
- Dark only under the open window
- * Much the same under every filter
- Dark only under the metal filters
> High-energy photons pass through all the filters, so the darkening is even. Low-energy X-rays are absorbed by the metal filters, so the pattern shows the difference.

## Try this
- Compare **low-energy X-rays** with **gamma rays** on the film badge: the filters show the difference.
- Choose **beta particles**: only the open window and thin plastic darken.
- Open the **TLD**, wear it, then heat and read it. Read it again: it can only be read once.

## Key points
- IRR17: workers likely to exceed 6 mSv a year are classified and monitored by an approved dosimetry service.
- Film badge: economical, and a permanent legal record; the filters help to identify the type and energy of the radiation.
- TLD: heating releases the trapped electrons as light, in proportion to the dose. The crystals interact with radiation as tissue does.
- Pocket dosimeters provide an immediate reading, but no permanent record.

# Controlling dose
id: controlling-dose
summary: How patient dose is controlled, and what happens when a dose is higher than expected.
areas: Controlling dose
diagram: dose-choices
status: draft
sources: 12-2 s44–45

Whilst radiation occurs naturally in the environment, additional exposure for medical purposes should be limited to where the benefit outweighs the risk, to both staff and patients. Dose is controlled by:

- **kVp and mAs**: changing both the energy and the amount of radiation.
- **Collimation**: reducing the area of radiation.
- **Scatter reduction techniques**: grids and digital processes.
- **Time, distance and shielding** (topic 9).
- **ALARP**, including getting the image right first time: clear instructions and immobilisation avoid repeats.

**Informing patients.** IR(ME)R 2017 places a duty on practitioners to inform patients of risk. Any incident where a patient has received a **much higher dose than expected** must be **investigated**, with the dose estimated from the exposure factors. If it is significant, it must be **notified** to the regulator, **Healthcare Inspectorate Wales (HIW)** in Wales or the **Care Quality Commission (CQC)** in England, and the **patient informed**, under the duty of candour.

## Try this
- Make the choices for an AP pelvis and watch how each one changes the dose.

## Key points
- Control dose with kVp and mAs, collimation, scatter reduction, and time, distance and shielding: ALARP.
- Collimation reduces the area of radiation.
- A dose much higher than expected is investigated; significant incidents are notified (HIW in Wales, CQC in England) and the patient is informed.

# Explaining dose to patients
id: explaining-dose
summary: Putting examination doses into words a patient can understand.
areas: Explaining dose
diagram: dose-ladder
status: draft
sources: 12-2 s46–47

How would you explain the risk of radiation to a patient? Too much information? Too little? How would you explain how you are reducing that risk, and what steps you will take?

Effective doses in millisieverts mean little to most people, so it helps to compare them with the **equivalent period of natural background radiation**, which everyone receives: about **2.1 mSv a year** on average in the UK.

UKHSA publishes typical effective doses for common examinations, each with its equivalent period of natural background radiation and the lifetime additional risk of fatal cancer. They cover a very wide range, from a few days of background to several years. Try estimating some in the diagram below before you look them up.

When explaining, start with the **benefit**: the examination has been requested because the information will help the patient's care. Then put the dose in context, and be honest: every exposure carries a small risk, which is why it is only carried out when justified, and kept as low as reasonably practicable.

## Predict
For the same examination, how does a child's extra lifetime risk compare with an adult's?
- About the same
- * About twice as high
- About five times lower
> UKHSA's guidance: the risk is about twice as high for a child, and about five times lower for a patient over 70. Explore the ladder and change the patient's age to see it.

## Try this
- Start with **Guess first**: estimate six doses before you see them, and compare your estimates with UKHSA's.
- Then choose **Explore the ladder** and tap an examination to read how you might explain its dose to a patient.
- Change the age group and see how the risk changes for children and older adults.

## Key points
- Compare doses with the equivalent period of natural background radiation: about 2.1 mSv a year in the UK.
- A chest X-ray is about 0.02 mSv, a few days of background; CT doses are much higher.
- Start with the benefit, then put the risk in context honestly.
