<!--
Lessons for topic 1, Atomic Structure & EM Radiation. The README explains the format.
-->

# Units and energy
id: units
summary: SI units, the electronvolt, and how energy changes form.
areas: Units; Energy
diagram: electron-energy
status: draft
sources: 3-1 s6–7; 3-2 s3, s15

Physics uses the **SI system** of units, built on seven **base units**: the metre, second, kilogram, ampere, kelvin, candela and mole. Every other unit is made from these. The **gray** (Gy), for example, measures absorbed dose: one joule of energy absorbed in each kilogram.

Energy is measured in **joules** (J), but a joule is far too large for a single photon or electron. Radiography uses the **electronvolt** (eV) instead: the energy one electron gains when it is accelerated through 1 volt, about 1.6 × 10⁻¹⁹ J. A **keV** is 1,000 eV.

This gives a neat link to the X-ray tube. An electron accelerated through **80 kV** arrives at the target with **80 keV** of energy, and that is the highest energy any X-ray photon from the tube can have.

Energy is never lost; it changes form. In the X-ray tube, electrical energy becomes the electrons' kinetic energy, and in the target about **99%** of that becomes **heat** and only about **1%** becomes X-rays.

## Try this
- Set **80 kV**: the electron arrives with 80 keV, the highest photon energy the tube can make.
- Halve the voltage: the energy halves too.
- Choose each **prefix** to see how µ, m, k and M relate units you'll meet in radiography.

## Key points
- Seven SI base units (metre, second, kilogram, ampere, kelvin, candela, mole); all others are derived from them.
- The gray is absorbed dose: 1 J/kg.
- 1 eV is the energy an electron gains through 1 V (1.6 × 10⁻¹⁹ J); electrons crossing an 80 kV tube gain 80 keV.
- Energy changes form: in the tube, about 99% becomes heat and about 1% X-rays.

# The atom and the Bohr model
id: atom
summary: Protons, neutrons and electrons, atomic number, and isotopes.
areas: Bohr model; Isotopes
diagram: bohr
status: draft
sources: 2-2 s6–13

Every atom has a small, dense **nucleus** holding **protons** (positive charge) and **neutrons** (no charge). Together they are called **nucleons**. Negatively charged **electrons** orbit outside the nucleus.

The **atomic number**, **Z**, is the number of protons. It defines the element: every atom with 74 protons is tungsten. In a neutral atom the number of electrons equals the number of protons. The **mass number** is the number of protons plus neutrons, so tungsten-184 has 184 − 74 = 110 neutrons.

**Isotopes** of an element have the same number of protons but different numbers of neutrons. Chlorine-35 and chlorine-37 both have 17 protons; one has 18 neutrons and the other 20.

The **Bohr model** pictures the electrons in fixed **shells**, or energy levels, lettered outwards from the nucleus: **K, L, M** and so on. It is a simplification (real electrons don't follow circular paths), but it explains X-ray production and attenuation well.

## Try this
- Change the element and count the electrons in each shell.
- Compare carbon (Z = 6) with tungsten (Z = 74): many more electrons, and many more shells.

## Key points
- The nucleus holds protons and neutrons; electrons orbit in shells.
- Atomic number Z = number of protons, which defines the element; mass number = protons + neutrons.
- Isotopes: same number of protons, different numbers of neutrons.
- Shells are lettered K, L, M… outwards from the nucleus.

# Shells and binding energy
id: shells
summary: How many electrons each shell holds, and how tightly they are held.
areas: Electron shells; Binding energy
diagram: bohr
status: draft
sources: 2-2 s6–7, s15–17

Each shell can hold a set maximum number of electrons: **2n²**, where n is the shell number. The **K** shell (n = 1) holds 2, the **L** shell (n = 2) holds 8, and the **M** shell (n = 3) holds 18.

**Binding energy** is the energy needed to remove an electron from its shell, overcoming the pull of the positive nucleus. It is greatest for the **K shell**, closest to the nucleus, and smaller for each shell further out.

Binding energy also rises with **atomic number**. More protons pull harder on the electrons, so tungsten's K-shell binding energy is about **69.5 keV**, while carbon's is under 1 keV. This is why heavy elements such as tungsten, iodine and lead matter so much in radiography.

## Try this
- Read the K, L and M binding energies for tungsten, then switch to carbon.
- Change the element: a lead K-shell electron is held over 300 times more tightly than a carbon one.

## Key points
- A shell holds at most 2n² electrons: K 2, L 8, M 18.
- Binding energy is the energy needed to remove an electron; it is greatest in the K shell.
- Binding energy rises with atomic number: tungsten K about 69.5 keV, carbon K under 1 keV.

# Ionisation and excitation
id: ionisation
summary: What happens when an electron gains energy, and why ionisation matters in the body.
areas: Ionisation and excitation
diagram: bohr
status: draft
sources: 2-2 s15–20

An electron can gain energy from a passing photon or electron. What happens next depends on how much energy it gains.

In **excitation**, the electron gains less than its binding energy. It moves up to a higher shell but stays in the atom. It soon drops back and releases the energy again.

In **ionisation**, the electron gains at least its binding energy and leaves the atom altogether. The atom is left as a **positive ion**, and the freed electron and the ion together form an **ion pair**.

Ionisation is why X-rays need careful use. In tissue it breaks chemical bonds and can damage **DNA**, directly or through free radicals made from water. This is the source of radiation risk, and why every exposure must be justified and optimised.

## Try this
- Try **Excitation**, then **Ionisation**. Only ionisation leaves a charged atom, because only then does the electron leave.

## Key points
- Excitation: the electron gains less than its binding energy, moves up a shell and stays in the atom.
- Ionisation: the electron gains at least its binding energy and leaves, leaving a positive ion.
- In the body, ionisation can damage DNA: the basis of radiation risk.

# Characteristic radiation
id: characteristic
summary: Why an electron dropping into an inner shell gives a photon of a fixed energy.
areas: Characteristic radiation
diagram: bohr
status: draft
sources: 2-2 s18–20; 8-1 s18

If an inner-shell electron is removed, the atom is left with a **vacancy**. An electron from a shell further out drops in to fill it, moving to a more tightly bound shell. It gives out the **difference in binding energies** as a photon.

In tungsten, an **L** electron filling a **K** vacancy gives 69.5 − 10.2 ≈ **59.3 keV** (Kα). An **M** electron filling it gives about **67.2 keV** (Kβ).

This radiation is called **characteristic** because the energies belong to the element: every element has its own binding energies, so its own photon energies. Tungsten's K-lines are always at about 59 and 67 keV, whatever the tube voltage. Topic 3 shows how they appear as sharp lines on the X-ray spectrum.

## Try this
- Choose tungsten and step through ionisation of the K shell: watch the L electron drop in and the photon leave.
- Compare its energy with the K-lines on the spectrum explorer in topic 3.

## Key points
- An outer electron fills an inner vacancy and gives out the difference in binding energies as a photon.
- Tungsten: L to K gives Kα, about 59.3 keV; M to K gives Kβ, about 67.2 keV.
- The energies are fixed for each element: they are "characteristic" of it.

# The electromagnetic spectrum
id: em-spectrum
summary: Where X-rays sit among other electromagnetic radiation, and what makes them different.
areas: EM spectrum
diagram: em-spectrum
status: draft
sources: 3-2 s27–32

X-rays are one part of the **electromagnetic (EM) spectrum**. In order of rising photon energy: radio waves, microwaves, infrared, visible light, ultraviolet, then **X-rays and gamma rays**. As energy rises, **frequency** rises and **wavelength** gets shorter. Visible light is only a small slice, from about 400 nm (violet) to 700 nm (red).

All EM radiation travels at the **speed of light** in a vacuum, about 3 × 10⁸ m/s. It can be described as a **wave**, with a wavelength and frequency, or as a stream of **photons**, each carrying a set amount of energy. This is **wave–particle duality**. In radiography we usually think in photons.

X-rays and gamma rays overlap in energy. They differ in **where they come from**: X-rays from electrons outside the nucleus, gamma rays from the nucleus during radioactive decay.

Only high-energy photons (X-rays, gamma rays and the highest-energy ultraviolet) can ionise. X-rays also travel in straight lines, carry no charge (so they can't be focused or deflected), are invisible, penetrate matter by different amounts depending on the tissue, and make some materials fluoresce.

## Try this
- Slide from left to right: the wavelength shortens as the frequency and energy rise.
- Find where radiation becomes **ionising**: in the far ultraviolet, at about 10 eV.
- Compare a **60 keV X-ray** with the **Tc-99m gamma ray**: both sit where X-rays and gamma rays overlap.

## Key points
- In order of energy: radio, microwave, infrared, visible, ultraviolet, X-rays and gamma rays.
- Higher energy means higher frequency and shorter wavelength; all travel at the speed of light.
- X-rays come from electrons, gamma rays from the nucleus.
- X-rays are ionising, invisible, uncharged, travel in straight lines and penetrate tissue by different amounts.
