<!--
Lessons for topic 10, Radioactivity. The README explains the format.
-->

# The nucleus and stability
id: nucleus
summary: Atomic and mass numbers, isotopes, and why some nuclei are unstable.
areas: Nucleus and isotopes; Nuclear stability
diagram: nuclides
status: draft
sources: 12-1 s2–17

The nucleus holds **protons** and **neutrons**. The **atomic number**, **Z**, counts the protons and decides the element. The **mass number**, **A**, counts protons plus neutrons (the nucleons): helium-4 has Z = 2 and A = 4.

**Isotopes** of an element have the same Z but different numbers of neutrons, so different A. Carbon-12, carbon-13 and carbon-14 are all carbon, with 6, 7 and 8 neutrons. Only carbon-14 of these is **unstable**.

Inside the nucleus, two forces compete. The positive protons **repel** each other. The short-range **nuclear force** between nucleons **binds** them together. Neutrons add binding without adding repulsion. Light stable nuclei have roughly equal numbers of protons and neutrons; heavier ones need **proportionally more neutrons** to hold together.

When the disrupting forces win, the nucleus is **unstable**. It becomes more stable by emitting radiation: an alpha or beta particle, a gamma ray, or energy passed to an orbital electron. This spontaneous emission is **radioactivity**.

## Try this
- Compare **carbon-12** and **carbon-14**: same element, but one sits off the band.
- Predict **iodine-131** and **iodine-123**: why do two isotopes of one element decay differently?
- Choose **radium-226**: what happens beyond lead?

## Key points
- Z = protons (decides the element); A = protons + neutrons.
- Isotopes: same Z, different numbers of neutrons.
- Proton repulsion competes with the nuclear force; heavier stable nuclei need extra neutrons.
- Unstable nuclei emit radiation to become more stable: radioactivity.

# Activity and half-life
id: half-life
summary: Becquerels, random decay, and the exponential fall in activity.
areas: Activity and half-life
diagram: halflife
status: draft
sources: 12-1 s17, s21–25

**Activity** is the number of nuclei decaying each second, measured in **becquerels** (Bq): 1 Bq is one decay per second. Nuclear medicine activities are usually given in **megabecquerels** (MBq).

Decay is **random**. You can't predict when one particular nucleus will decay. But with very large numbers of nuclei, the decay rate is predictable and characteristic of each radionuclide.

The **half-life** is the time for **half** the radioactive nuclei in a sample, and so its activity, to decay. After one half-life 50% remain, after two 25%, after three 12.5%, and so on. The same **fraction** decays in each half-life, so the activity falls **exponentially**: steeply at first, then more and more slowly, approaching but never reaching zero. Technetium-99m has a half-life of about **6 hours**.

## Try this
- Step one half-life at a time: 100%, 50%, 25%, 12.5%…
- Switch to 36 nuclei: the sample wanders off the expected curve, because decay is random.
- Change the radionuclide: the shape stays the same; only the time scale changes.

## Key points
- Activity: decays per second, in becquerels (Bq).
- Each decay is random; large numbers give a predictable rate.
- Half-life: the time for half the nuclei (and the activity) to decay.
- Decay is exponential: the same fraction decays in each half-life.

# Alpha decay
id: alpha
summary: What an alpha particle is, and why alpha emitters aren't used for imaging.
areas: Alpha decay
diagram: decay
status: draft
sources: 12-1 s27–29

An **alpha particle** is two protons and two neutrons: a **helium-4 nucleus**. It is heavy (4 atomic mass units) and carries a charge of **+2**.

In **alpha decay** the nucleus loses two protons and two neutrons, so **Z falls by 2** and **A falls by 4**. It becomes a different element, two places lower in the periodic table. Radium-226, for example, becomes radon-222.

Being heavy and highly charged, alpha particles interact very strongly. They are **strongly ionising** and are stopped by thin plastic or a few centimetres of air. Inside the body they would deposit a **heavy local dose** and could never be detected outside it, so alpha emitters are **unsuitable for diagnostic imaging**.

## Try this
- Choose **Alpha** and build the daughter nucleus: count how Z and A change.

## Key points
- An alpha particle is a helium nucleus: 2 protons, 2 neutrons, charge +2.
- Alpha decay: Z falls by 2, A falls by 4.
- Strongly ionising with a very short range: unsuitable for imaging.

# Beta decay
id: beta
summary: Beta-minus, beta-plus, annihilation and electron capture.
areas: Beta decay
diagram: decay
status: draft
sources: 12-1 s30–35

**Beta-minus** decay happens in nuclei with **too many neutrons**. A **neutron becomes a proton**, and an **electron** (the beta-minus particle) and an **antineutrino** are emitted. **Z rises by 1**; **A is unchanged**.

**Beta-plus** (positron) decay happens in nuclei with **too many protons**. A **proton becomes a neutron**, and a **positron** and a **neutrino** are emitted. **Z falls by 1**; A is unchanged. A positron has the mass of an electron but a positive charge.

When a positron meets an electron they **annihilate**: their mass becomes energy, giving **two 511 keV photons** travelling in opposite directions. This is the basis of PET imaging. (Slide 35 differs: the reference physics is two photons.)

**Electron capture** is the other way a proton-rich nucleus can decay. The nucleus captures an **inner orbital electron**, a proton becomes a neutron, and a **neutrino** is emitted. **Characteristic X-rays** follow as the shell vacancy is filled. (Slide 34 gives a gamma ray; the reference physics is a neutrino and characteristic X-rays.)

## Try this
- Build the daughter nucleus for beta-minus, beta-plus and electron capture, and compare how Z changes.

## Key points
- Beta-minus: neutron to proton; electron and antineutrino emitted; Z + 1, A unchanged.
- Beta-plus: proton to neutron; positron and neutrino emitted; Z − 1, A unchanged.
- Annihilation: a positron and an electron give two 511 keV photons in opposite directions.
- Electron capture: an inner electron is captured; a neutrino is emitted, then characteristic X-rays.

# Gamma rays and technetium-99m
id: gamma-tc99m
summary: Where gamma rays come from, and why technetium-99m suits imaging so well.
areas: Gamma and technetium-99m
diagram: decay
status: draft
sources: 12-1 s36–40

**Gamma rays** are electromagnetic radiation from the **nucleus**. They have the same properties as X-rays: they ionise, penetrate according to their energy, and aren't deflected by electric or magnetic fields. The only difference is **where they come from**: gamma rays from the nucleus, X-rays from electrons outside it. Gamma emission doesn't change Z or A; it only lowers the energy of an excited nucleus.

**Technetium-99m** is the workhorse of nuclear medicine. Molybdenum-99 decays by beta-minus emission to technetium-99m, left in an excited, **metastable** state (the "m"). It stays excited for a measurable time, then drops to its ground state with a half-life of about **6 hours**, emitting a **140 keV gamma ray**.

That makes it ideal for imaging:

- It is an almost **pure gamma emitter**, so there is no local dose from alpha or beta particles.
- A **140 keV** gamma ray penetrates the body and is easy to detect with a gamma camera.
- A **6-hour half-life** is long enough to prepare and image, short enough to keep the dose low.

## Try this
- Choose **Gamma, from a metastable state**: Z and A stay the same.

## Key points
- Gamma rays come from the nucleus; X-rays from electrons. Otherwise they are the same.
- Gamma emission lowers the nucleus's energy without changing Z or A.
- Tc-99m: metastable; made from Mo-99; 6-hour half-life; 140 keV gamma; almost pure gamma emitter.
