<!--
Lessons for topic 5, Interactions with Matter. The README explains the format.
-->

# Transmission, absorption and scatter
id: attenuation
summary: What can happen to a photon in the patient, and how that makes an image.
areas: Attenuation
diagram: pe-compton
status: draft
sources: 10-2 s11–16, s45

As an X-ray beam passes through a patient, each photon does one of three things:

- **Transmission**: it passes straight through and reaches the detector.
- **Absorption**: it gives up all its energy and disappears.
- **Scatter**: it changes direction, usually losing some energy.

**Attenuation** is the total reduction in the beam's intensity: the photons removed by absorption and by scatter together.

Different tissues attenuate by different amounts, and that is what forms the image. **Bone** attenuates the most, so few photons reach the detector behind it and it appears **white**. **Soft tissue** lets more through and appears **grey**. **Air** lets almost everything through and appears **black**.

## Predict
In the photoelectric effect, what happens to the X-ray photon?
- It scatters with less energy
- * It's absorbed completely
- It passes straight through
> Its energy goes into ejecting an inner-shell electron. In Compton scatter, by contrast, the photon survives with less energy and a new direction.

## Try this
- Step through the photoelectric effect on the left and Compton scatter on the right: one absorbs the photon, the other scatters it.

## Key points
- A photon is transmitted, absorbed or scattered.
- Attenuation = absorption + scatter: the total reduction in beam intensity.
- Bone attenuates most (white), soft tissue less (grey), air least (black).

# The photoelectric effect
id: photoelectric
summary: How a photon is completely absorbed, and why this gives the image its contrast.
areas: Photoelectric effect
diagram: pe-compton
status: draft
sources: 10-2 s18–22, s35, s45

In the **photoelectric effect**, a photon meets a tightly bound **inner-shell** electron, usually in the K shell, and is **completely absorbed**. The electron is ejected as a **photoelectron**, carrying the photon's energy **minus its binding energy**.

An outer electron then fills the vacancy, giving a **characteristic photon**. In soft tissue the binding energies are tiny (oxygen's K shell is about 0.5 keV), so this photon has very little energy and is absorbed close by.

The photoelectric effect is far more likely in **high atomic number** materials and at **low photon energies**: roughly in proportion to **Z³** and to **1/E³**. Because it depends so strongly on Z, bone absorbs many more photons than soft tissue. That difference is the main source of **contrast** in a radiograph. All the photon's energy stays in the patient, so it also adds to **patient dose**.

## Try this
- Change the photon energy and watch the photoelectron's energy change.
- Switch the material from soft tissue to bone, iodine and lead, and watch the photoelectric share in "Which is more likely?".

## Key points
- The photon is completely absorbed; an inner-shell electron leaves with the photon's energy minus its binding energy.
- In soft tissue the characteristic photon is very weak and absorbed nearby.
- Probability is roughly ∝ Z³ and ∝ 1/E³.
- It gives the image its contrast, and adds to patient dose.

# Compton and coherent scatter
id: scatter
summary: How photons are scattered, and why scatter matters for image quality and staff dose.
areas: Compton scatter; Coherent scatter
diagram: pe-compton
status: draft
sources: 10-2 s23–27, s31, s40

In **Compton scatter**, a photon meets a loosely bound **outer** electron. It gives the electron part of its energy, and the electron **recoils** out of the atom. The photon carries on in a **new direction** with **less energy**. The bigger the scatter angle, the more energy the photon loses: one that bounces back towards the tube loses the most.

Compton scatter depends on the number of electrons per unit mass, which is much the same for most tissues, so it is **almost independent of atomic number**. Both interactions become less likely as photon energy rises, but the photoelectric effect falls much faster, so in soft tissue **Compton dominates** at most diagnostic energies.

Scatter is a problem in two ways. Scattered photons reaching the detector add **fog** and **reduce contrast**; those leaving the patient are the main source of **dose to staff**. Collimation and grids help control it.

In **coherent** (unmodified) scatter, the photon makes the atom's electrons vibrate briefly, then leaves in a slightly different direction with the **same energy**. No electron is freed, so there is **no ionisation**. It is a small share of interactions, mostly at low energies.

## Try this
- Move the Compton scatter angle: larger angles take more energy from the photon.
- Switch the right-hand panel to **Coherent scatter** and compare.

## Key points
- Compton: a photon gives part of its energy to an outer electron and scatters with less energy; larger angles lose more.
- Compton is almost independent of Z and dominates in soft tissue at diagnostic energies.
- Scatter fogs the image and is the main source of staff dose.
- Coherent scatter: same energy, new direction, no ionisation; a small share.

# Attenuation coefficients and pair production
id: coefficients
summary: Measuring attenuation, why contrast falls as kVp rises, and why pair production doesn't happen here.
areas: Attenuation coefficients; Pair production; Attenuation
diagram: pe-compton
status: draft
sources: 10-2 s31–35, s40–43

The **linear attenuation coefficient**, **µ**, is the fraction of the beam removed by each unit thickness of a material (per mm or per cm), at a given photon energy. Divide it by the material's density and you get the **mass attenuation coefficient**, **µ/ρ**: the attenuation per unit mass. That removes the effect of density, so water, ice and steam have the same value.

Attenuation falls as photon energy rises. At **lower kVp**, more interactions are photoelectric, and because those depend strongly on Z, the difference between bone and soft tissue is **bigger**: **more contrast**. At **higher kVp**, Compton (nearly independent of Z) takes over, and contrast falls.

**Pair production** turns a photon into an electron and a positron near a nucleus. It needs more than **1.02 MeV**, far above any diagnostic beam (under 150 keV), so it never happens in radiography. It matters in radiotherapy and is relevant to PET.

## Try this
- Open **Attenuation and K-edges** and compare bone with soft tissue at 30 keV, then at 100 keV. The gap narrows as energy rises.
- **Split soft tissue into parts**: where do the photoelectric and Compton lines cross?

## Key points
- µ: fractional reduction in intensity per unit thickness; µ/ρ: per unit mass, independent of density.
- Lower kVp: more photoelectric absorption, which depends on Z, so more contrast.
- Pair production needs over 1.02 MeV: it doesn't happen at diagnostic energies.

# Absorption edges and contrast agents
id: k-edges
summary: Why attenuation jumps at a K-edge, and why that makes iodine a good contrast agent.
areas: Absorption edges
diagram: pe-compton
status: draft
sources: 10-2 s36–39

Attenuation generally falls as photon energy rises, but it **jumps** at the binding energy of each shell. Just above the **K-shell binding energy**, photons can eject K-shell electrons as well as L-shell ones, so more electrons are available for photoelectric absorption. This sudden rise is the **K-edge**.

**Iodine** has a high atomic number (53) and a K-edge at about **33 keV**, close to the energies in a diagnostic beam. Just above its K-edge, iodine absorbs around a hundred times as much as soft tissue per gram, so vessels and organs containing it stand out clearly.

**Lead** has its K-edge at 88 keV. Its high atomic number makes it a strong absorber across the whole diagnostic range, which is why it is used for shielding.

## Try this
- In **Attenuation and K-edges**, move the photon energy from 30 to 35 keV and watch iodine jump.
- Split lead into parts and cross 88 keV: which part jumps?

## Key points
- Attenuation jumps sharply at a shell's binding energy: the K-edge.
- Above the K-edge, K-shell electrons can take part in photoelectric absorption.
- Iodine: Z = 53, K-edge about 33 keV, close to beam energies, so a strong contrast agent.
