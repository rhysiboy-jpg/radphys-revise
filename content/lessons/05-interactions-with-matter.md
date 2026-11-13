<!--
Lessons for topic 5, Interactions with Matter. The README explains the format.
Wording follows the lecture slides where it can (10-2); figures follow reference data (NIST XCOM).
-->

# Transmission, absorption and scatter
id: attenuation
summary: What can happen to a photon in the patient, and how that forms an image.
areas: Attenuation
diagram: pe-compton
status: draft
sources: 10-2 s11–16, s45

We need radiation to produce an image, and its ability to do so depends on how it interacts with the tissues it encounters. The beam encounters different tissues with different characteristics: shape, thickness, atomic number and density.

Each photon can do one of three things:

- **Transmission**: the photon passes through the medium, penetrating without giving up energy.
- **Absorption**: the photon gives up its energy and disappears. The energy is deposited in the medium.
- **Scattering**: the photon gives up some of its energy and changes direction.

During an exposure all three processes can occur.

**Attenuation** is the total reduction in the intensity of a beam of radiation. Total attenuation = the reduction due to absorption + the reduction due to scattering.

Different tissues attenuate the beam differently, and that is what forms the image:

- **Bones** are more likely to absorb radiation. This is why they appear **white** on the image.
- **Soft tissue** allows more radiation to pass through than bone. These structures appear **grey**.
- **Air-containing structures** allow the most radiation to pass through. These structures appear **black**.

## Predict
In the photoelectric effect, what happens to the X-ray photon?
- It is scattered with less energy
- * It is totally absorbed
- It passes straight through
> The photon's energy ejects an inner-shell electron, and the photon disappears. In the Compton effect the photon loses some energy and changes direction.

## Try this
- Step through the photoelectric effect on the left and Compton scatter on the right: one absorbs the photon, the other scatters it.

## Key points
- A photon is transmitted, absorbed or scattered. During an exposure all three can occur.
- Attenuation is the total reduction in intensity: absorption + scattering.
- Bone absorbs most (white), soft tissue less (grey), air least (black).

# The photoelectric effect
id: photoelectric
summary: How a photon is totally absorbed, and why this gives the image its contrast.
areas: Photoelectric effect
diagram: pe-compton
status: draft
sources: 10-2 s18–22, s35, s45

In the **photoelectric effect**, an incoming X-ray photon is **totally absorbed** by an atom within the tissue. It is the primary way that contrast is developed.

The atom could be in bone, in soft tissue, or in the lead of lead protection. The steps are:

- The incoming photon has an energy equal to or greater than the binding energy of an **inner-shell** electron.
- The energy of the photon ejects the inner-shell electron, as a **photoelectron**. Its kinetic energy is equal to the initial energy of the photon **minus the electron's binding energy**.
- A vacancy is created in the shell, and an electron from an outer shell fills it.
- As a consequence of this transition, a lower-energy photon is emitted. In soft tissue this photon has very little energy (oxygen's K-shell binding energy is about 0.5 keV), and it is absorbed by adjacent atoms.

The probability of the photoelectric effect is proportional to the atomic number cubed (**Z³**) and inversely proportional to the photon energy cubed (**1/E³**). It is therefore much more likely in bone than in soft tissue, and more likely as the photon energy decreases. Because all the photon's energy is deposited in the patient, it also contributes to **patient dose**.

## Try this
- Change the photon energy and watch the photoelectron's kinetic energy change.
- Change the material from soft tissue to bone, iodine and lead, and watch the photoelectric share in "Which is more likely?".

## Key points
- The photon is totally absorbed. An inner-shell electron is ejected with the photon's energy minus its binding energy.
- In soft tissue the photon emitted afterwards has very little energy and is absorbed by adjacent atoms.
- Probability is proportional to Z³ and inversely proportional to E³.
- It is the primary way that contrast is developed, and it contributes to patient dose.

# Compton and coherent scatter
id: scatter
summary: How photons are scattered, and why scatter matters for the image and for dose.
areas: Compton scatter; Coherent scatter
diagram: pe-compton
status: draft
sources: 10-2 s23–27, s31, s40

The **Compton effect** is a scattering effect. The incident photon ejects an **outer-shell** electron. The electron gains energy and the X-ray photon loses energy, and both move off at an angle to the photon's initial path.

The loss of energy experienced by the photon depends on the **angle of scatter**: the greater the angle, the greater the loss of energy. The higher the photon's energy, the smaller the angle of scatter tends to be.

The probability of the Compton effect depends on the number of electrons per unit mass. This is approximately the same for most tissues, so the probability is **independent of atomic number**. At low energies the major influence on attenuation is the photoelectric effect; at higher energies the major effect is Compton. In soft tissue, Compton is the major effect at most diagnostic energies.

The Compton process results in scatter, which means:

- a reduction in radiographic **contrast**;
- increased **patient dose**;
- potentially increased **occupational dose**.

Collimation and grids help to control it.

In **coherent** (unmodified) scatter, the photon approaches an atom with less energy than the binding energy of the electron. It causes the electron to vibrate, but there is not enough energy to free the electron from its orbit. The photon leaves in a slightly different direction with the **same energy**. There is **no ionisation**. Coherent scatter is a small percentage of the total interactions, and increases for lower-energy examinations such as mammography.

## Try this
- Move the Compton scatter angle: the greater the angle, the greater the photon's loss of energy.
- Change the right-hand panel to **Coherent scatter** and compare.

## Key points
- Compton: the incident photon ejects an outer-shell electron, loses energy and changes direction. The greater the angle of scatter, the greater the loss of energy.
- Compton is independent of atomic number, and is the major effect in soft tissue at most diagnostic energies.
- Scatter reduces radiographic contrast and increases patient dose and, potentially, occupational dose.
- Coherent scatter: the same energy, a new direction, no ionisation; a small percentage of interactions.

# Attenuation coefficients and pair production
id: coefficients
summary: Measuring attenuation, why contrast falls as kVp rises, and why pair production has little significance here.
areas: Attenuation coefficients; Pair production; Attenuation
diagram: pe-compton
status: draft
sources: 10-2 s31–35, s40–43

The **linear attenuation coefficient**, **µ**, is the fractional reduction in intensity per unit thickness of the absorber. It tells us how much each millimetre of a substance reduces the intensity at a given energy.

However, it does not take account of the density of the material: water can be ice, liquid or steam. A refinement divides by the material's density, giving the **mass attenuation coefficient**, **µ/ρ**: the fractional reduction in intensity per unit mass of the absorber.

Photoelectric absorption and Compton scattering are competing processes, and both influence the degree of attenuation. The total mass attenuation coefficient is the sum of the coefficients of both processes.

- For **photoelectric absorption**, it is proportional to Z³ and inversely proportional to E³.
- For the **Compton effect**, it is independent of atomic number and falls slowly as the photon energy rises.

The total attenuation of cortical bone is greater than that of muscle, at all except the higher X-ray energies. Lower-energy X-rays enhance the attenuation differences between bone and muscle, so a **lower kVp gives more contrast**. At a higher kVp the major effect is Compton, which is independent of atomic number, and contrast falls.

**Pair production** occurs with X-ray and gamma ray photons whose energy is greater than **1.02 MeV**. It is significant in radiotherapy and relevant in positron emission tomography (PET), but has little significance in diagnostic radiography, where photon energies are below 150 keV.

## Try this
- Open **Attenuation and K-edges** and compare bone with soft tissue at 30 keV, then at 100 keV. The difference narrows as the energy rises.
- **Split soft tissue into parts**: where do the photoelectric and Compton lines cross?

## Key points
- µ: the fractional reduction in intensity per unit thickness. µ/ρ: per unit mass, which takes account of density.
- Photoelectric absorption and Compton scattering are competing processes; the total is the sum of both.
- Lower-energy X-rays enhance the attenuation differences between bone and soft tissue: more contrast.
- Pair production needs more than 1.02 MeV: it has little significance in diagnostic radiography.

# Absorption edges and contrast agents
id: k-edges
summary: Why attenuation changes abruptly at a K-edge, and why that makes iodine a good contrast agent.
areas: Absorption edges
diagram: pe-compton
status: draft
sources: 10-2 s36–39

Attenuation generally falls as the photon energy rises, but it changes abruptly at the binding energy of the shell electrons. These are the **absorption edges**.

Just above the **K-shell binding energy**, photons have enough energy to interact with electrons in the K shell as well as the L shell. More electrons are available for interaction, so there is a sudden increase in the attenuation coefficient at the K-shell binding energy. This is the **K-edge**.

The K-edge effect is used in contrast examinations and in digital detectors.

**Iodine** has a high atomic number (53) and a K-edge at about **33 keV**, close to the energies in a diagnostic beam. Just above its K-edge, iodine absorbs around a hundred times as much as soft tissue per gram, so vessels and organs containing it are clearly seen.

**Lead** has its K-edge at 88 keV. Its high atomic number makes it a strong absorber across the whole diagnostic range, so it is used for lead protection.

## Try this
- In **Attenuation and K-edges**, move the photon energy from 30 to 35 keV and watch iodine's sudden increase.
- Split lead into parts and cross 88 keV: which part increases?

## Key points
- Attenuation changes abruptly at the binding energy of the shell electrons: the K-edge.
- Above the K-edge, photons can interact with electrons in the K shell as well as the L shell.
- Iodine: Z = 53, K-edge about 33 keV, close to beam energies, so a strong contrast agent.
