<!--
Lessons for topic 4, Effects of Radiation. The README explains the format.
-->

# Ionisation in the cell
id: cell
summary: What happens in a cell after an X-ray photon ionises it.
areas: Ionisation in cells
diagram: cell-damage
status: draft
sources: 9-1 s5–7

When ionising radiation passes through tissue, it ejects electrons from atoms. Each event leaves a positive ion and a free electron: an **ion pair**. This breaks chemical bonds.

Many ions **recombine** within about 10⁻¹¹ s. If they form exactly the molecules that were there before, **no harm** is done. But the free ions are highly reactive, and some bond with others to form **new molecules**.

Cells are mostly water, so most of the damage is **indirect**: ionised water forms **free radicals**, which go on to damage DNA. Less often, the radiation ionises the DNA itself (**direct action**). If an important molecule such as DNA is changed, the cell may **repair** the damage, **die**, or survive with a **mutation**. Biological damage has then taken place.

## Predict
For X-rays, how is most DNA damage caused?
- By the photon hitting the DNA directly
- * By free radicals from ionised water attacking the DNA
- By the cell heating up
> Cells are mostly water. Most damage from X-rays is indirect: ionising water makes free radicals, which then attack the DNA.

## Try this
- Step through one photon, choosing each path after ionisation in turn.
- Press **Fire 1,000 photons** a few times. The outcome of each event is down to chance.

## Key points
- Ionisation forms ion pairs and breaks chemical bonds.
- Ions that recombine into the original molecules cause no harm.
- Free radicals from water cause most DNA damage (indirect action).
- A damaged cell may repair itself, die, or survive with a mutation.

# Stochastic and deterministic effects
id: stochastic-deterministic
summary: The difference between effects that may happen and effects that will.
areas: Stochastic effects; Deterministic effects
diagram: dose-response
status: draft
sources: 9-1 s8–9, s17–19

The lecture sorts biological damage into two kinds.

**Stochastic** effects are governed by **chance**. The greater the dose, the greater the **probability** of the effect, but its **severity** does not depend on the dose: a radiation-induced cancer is no worse because the dose was higher. There is assumed to be **no threshold**, so **no dose is completely safe**. The main stochastic effect is **cancer**.

**Deterministic** effects (also called tissue reactions) happen only above a **threshold dose**. Below it they don't occur; above it they **will** occur, and a higher dose makes them **more severe**. Examples are skin erythema, cataracts and hair loss. For a single whole-body dose, about 1 Gy causes a temporary drop in blood counts; about 5 Gy, bone marrow failure; about 10 Gy, damage to the gut lining; about 20 Gy, damage to the nervous system.

Diagnostic doses are far below these thresholds, so deterministic effects belong mainly to **radiotherapy** (and occasionally long interventional procedures). For a patient having plain radiography, the concern is **stochastic** risk.

## Try this
- Use **Predict first**: choose the shape of each graph, then reveal them.
- Move the dose from a chest X-ray up to 5 Gy and watch which effects appear.

## Key points
- Stochastic: chance rises with dose, severity doesn't; no threshold, so no safe dose. Example: cancer.
- Deterministic: a threshold dose, then severity rises with dose. Examples: erythema, cataract, hair loss.
- A stochastic effect may occur; a deterministic effect will occur above its threshold.
- Diagnostic doses are below deterministic thresholds: the concern is stochastic risk.

# Somatic and genetic effects
id: somatic-genetic
summary: Effects on the person irradiated, and effects passed to their children.
areas: Genetic and somatic effects
diagram: sorter
status: draft
sources: 9-1 s14–16, s20

Before effects were sorted into stochastic and deterministic, they were described by **who** they affect.

A **somatic** effect appears in the **person who was irradiated**. It can be stochastic (a cancer) or deterministic (erythema).

A **genetic** (heritable) effect comes from damage to the chromosomes in the **ova or sperm**. If that person goes on to have children, the change can be passed to them and to later generations. Genetic effects are stochastic. Severe changes tend to be eliminated, because they shorten life or prevent reproduction, so it is the less severe ones we guard against. Data from Hiroshima have not shown genetic effects to be a major problem, but protection against them is still required in law.

The dose that matters for genetic effects is the **gonad dose** of people who may still have children. Justifying each examination, collimating tightly and using good technique keep it as low as possible.

## Try this
- Sort each card as stochastic or deterministic. Where do heritable effects go?

## Key points
- Somatic effects appear in the irradiated person; they can be stochastic or deterministic.
- Genetic effects come from damage to ova or sperm and appear in descendants; they are stochastic.
- Keep the gonad dose of people who may have children as low as possible.

# Counting the risk
id: population-risk
summary: How stochastic risk is estimated, and what it means for a population.
areas: Stochastic effects
diagram: population-risk
status: draft
sources: 9-1 s10–12

Stochastic risk is estimated by comparing the number of cancers in an irradiated population with the number in an unirradiated one. That gives a **risk factor** for a given dose. For the whole body, the usual estimate is about **5% per sievert** for a fatal cancer: a chest X-ray (about 0.02 mSv) carries a risk of about **1 in a million**.

The lecture's example uses a leukaemia risk factor of 2 × 10⁻³ per Sv. Give a million people the employee annual limit of 20 mSv and about **40** would be expected to develop radiation-induced leukaemia: 1 in 25,000.

Risk applies to a **population**. Nobody can say in advance **who** will be affected, which is exactly what makes the effect stochastic. These figures assume risk rises in proportion to dose, however small: they are for planning protection, not predictions for one person.

## Predict
A million people each have one chest X-ray (0.02 mSv). At about 5% per sievert, roughly how many extra cancer deaths might result?
- About 1,000
- About 100
- * About 1
> 1,000,000 × 0.00002 Sv × 0.05 per Sv ≈ 1. It's so small that, run again, the simulation sometimes shows none.

## Try this
- Start with a chest X-ray for a million people, then run it again: sometimes one case, sometimes none.
- Choose another dose or group size: guess how many cases first, then see the result.
- Try the lecture example, then turn on the background of cancer deaths that would happen anyway.

## Key points
- Risk factors come from comparing irradiated and unirradiated populations.
- About 5% per Sv for a fatal cancer: a chest X-ray is about 1 in a million.
- Risk describes a population; nobody can predict which person will be affected.

# Radiosensitivity and tissue weighting
id: radiosensitivity
summary: Why some tissues are more sensitive, and how effective dose allows for it.
areas: Radiosensitivity
diagram: tissue-weights
status: draft
sources: 9-1 s13, s27

Some tissues are more **radiosensitive** than others. Cells that **divide rapidly** are the most sensitive, because damage to DNA matters most when a cell is about to copy it. Bone marrow, the lining of the gut and the gonads are examples. Brain cells, which rarely divide in adults, are among the least sensitive.

So the risk from a dose depends on **which tissues** are irradiated. Each organ is given a **tissue weighting factor**: its share of the total stochastic risk if the whole body were irradiated. Red bone marrow, lung, stomach, colon and breast each have 0.12; the gonads 0.08; the thyroid, liver, oesophagus and bladder 0.04; skin, brain, bone surface and salivary glands 0.01.

**Effective dose** adds up the dose to each organ multiplied by its weighting factor. That is why a chest or abdomen examination gives a far higher effective dose than a hand or knee, even at the same exposure.

## Predict
Which has the larger tissue weighting factor?
- The skin
- * The lungs
- They're the same
> In ICRP 103 the lungs have 0.12 and the skin 0.01: the lungs count twelve times as much towards effective dose.

## Try this
- Tap organs on the body to compare their weighting factors.
- Put the chest, then a knee, in the beam and compare their share of the weighting.
- Try **Rank them**.

## Key points
- Rapidly dividing cells are the most radiosensitive.
- Tissue weighting factors reflect each organ's share of the stochastic risk.
- Effective dose = the sum of each organ's dose × its weighting factor.

# Risk versus benefit
id: risk-benefit
summary: Justification, and keeping the dose as low as reasonably practicable.
areas: Risk and benefit
diagram: justify
status: draft
sources: 9-1 s21–26

Every examination carries some risk, because stochastic effects have no threshold. So how can X-rays be justified at all? There must be a **benefit** to the patient that **outweighs the risk**. No radiological procedure should go ahead without sound **clinical justification**. This **risk–benefit** principle governs most of our practice and is at the core of the legislation.

Once an examination is justified, the dose must be kept as low as possible while still answering the clinical question. The Ionising Radiations Regulations call this **ALARP**: As Low As Reasonably **Practicable**. ICRP uses **ALARA**: As Low As Reasonably **Achievable**.

"Reasonably" matters: good technique, the most appropriate equipment and up-to-date training all reduce dose, but the cost and effort must also be reasonable.

## Try this
- Work through the eight imaging requests and decide what should happen to each.

## Key points
- An examination must have a clinical benefit that outweighs its risk: justification.
- Once justified, keep the dose ALARP (As Low As Reasonably Practicable; ICRP: ALARA).
- What is "reasonable" weighs dose reduction against cost and practicality.

# What can we do?
id: what-can-we-do
summary: Who needs protecting, and the factors that affect a patient's dose.
areas: Radiation protection; Risk and benefit
diagram: dose-choices
status: draft
sources: 9-1 s2–4, s28–37

Radiation protection aims to **minimise the risk** of receiving a dose. Medical exposure is a significant share of the UK population's dose, and it is **controllable**. It protects everyone who may be exposed: the **patient**, the **radiographer**, and anyone else, such as someone holding a patient or staff in the room during fluoroscopy.

Many factors affect a patient's dose:

- **The radiographer's choices**: exposure factors, collimation, the projection, using the AEC and grid appropriately, and avoiding repeats with clear instructions.
- **The equipment**: filtration, rectification and tube shielding are built in, so choosing the most appropriate equipment matters.
- **The patient**: a larger patient needs higher exposure factors for the same image quality, so receives more dose. An uncooperative patient needs extra care to avoid repeats.
- **The department**: room design (lead-equivalent walls and a protective barrier), and written protocols for each examination.

## Predict
For an AP pelvis, which of these doubles the patient's dose?
- Collimating to the pelvis
- * A repeat because the patient moved
- Using the 15% rule
> A repeat gives the whole dose again. Collimating and the 15% rule both lower the dose.

## Try this
- Make the choices for an AP pelvis and watch the dose meter.
- Sort each factor by who controls it.

## Key points
- Protection covers the patient, the staff and anyone else who may be exposed.
- The radiographer controls exposure factors, collimation, projection, AEC and grid use, and avoiding repeats.
- Filtration, rectification and tube shielding are fixed by the equipment.
- Larger patients need more exposure, so receive more dose.
