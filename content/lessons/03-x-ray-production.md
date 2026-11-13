<!--
Lessons for topic 3, X-ray Production & the X-ray Tube. Edit the wording freely; the README explains the format.
Each lesson starts with "# Title", then a few "name: value" lines, a blank line, and the lesson itself.
  id        a short name for the web address; don't change it once students have used the app
  summary   one line for the contents page
  areas     the question areas this lesson leads into, separated by ";"
  diagram   the interactive to show (leave it out for none)
  status    draft or approved: drafts only show in review mode
  sources   lecture slides, shown to you in review mode only
Plain paragraphs are the explanation. "## Try this" and "## Key points" start those boxes; lines starting "- " are bullet points.
Put a word or phrase in **double stars** to make it bold.
Wording follows the lecture slides where it can (5-2, 8-1, 10-1); figures follow reference data.
-->

# The X-ray tube
id: tube
summary: The parts of a rotating-anode tube, and what each one does.
areas: The X-ray tube
diagram: tube
status: draft
sources: 5-2 s5–12, s20

In the X-ray tube, electrons are accelerated from the negative **cathode** to the positive **anode**. On collision with the anode the electrons rapidly decelerate, and their kinetic energy is converted into X-rays and heat. This takes place inside a **vacuum**, so the electrons can cross the tube without colliding with gas molecules.

The **cathode** acts as the negative electrode. It has two parts:

- The **filament**: a helically wound tungsten wire, 0.2 to 0.3 mm in diameter. There are often two or three filaments, to produce different focal spot sizes.
- The **focusing cup**: a second electrode, which forms the electrons into a narrow beam.

The **anode** is supplied with a very high positive voltage (50 to 150 kV) during the exposure. It attracts the electrons from the cathode. It has to withstand high temperatures and be an efficient emitter of X-rays, so it is composed of a **tungsten and rhenium** skin on a molybdenum base.

- **Tungsten** has a high atomic number (74), which is good for X-ray production, a high melting point (3,422 °C) and a high thermal conductivity.
- **Rhenium** increases the thermal capacity and tensile strength, maintains a smoother surface, and increases resistance to damage from overheating and continuous electron bombardment.

About **99%** of the kinetic energy is converted to heat, so in most tubes the anode **rotates**. The anode stem is attached to a copper **rotor**, located within the glass envelope. The **stator windings** surround the neck of the tube, outside the envelope but within the housing. When they are supplied with an alternating voltage they induce rotation of the rotor, and hence the anode, at 3,000 rpm or 9,000 rpm. The anode starts to rotate when you press **prep**.

The **envelope** (glass, or metal and ceramic) holds the vacuum. The **tube housing** provides mechanical support and protection for the tube. It is filled with **oil**, which insulates and carries heat away, and it is **lead lined** to absorb stray radiation. The useful beam leaves through the **window**, then passes through **added filtration**.

## Predict
The radiographer presses prep. What happens before any X-rays are produced?
- The high voltage is applied across the tube
- * The filament heats up and the anode starts to rotate
- The exposure timer starts
> Prep heats the filament (thermionic emission) and brings the anode up to speed. The kVp is applied only when the exposure starts.

## Try this
- Tap each number on the diagram to read about that part.
- Press **Play** to follow one exposure, from prep to the useful beam.
- Notice which parts are inside the vacuum and which are outside it.

## Key points
- Electrons are accelerated from the negative cathode (filament and focusing cup) to the positive anode, where they rapidly decelerate.
- Tungsten: a high atomic number for X-ray production, and a high melting point to withstand the heat.
- The rotating anode spreads the heat. The rotor is inside the envelope and the stator windings outside it.
- The envelope holds the vacuum; the oil insulates and cools; the lead-lined housing absorbs stray radiation.

# Thermionic emission
id: thermionic
summary: How the filament releases electrons, and what controls the tube current.
areas: Thermionic emission
diagram: tube
status: draft
sources: 5-2 s21–25

Electrons are emitted from the heated filament by **thermionic emission**. Tungsten releases electrons at about 2,000 °C.

The **filament circuit** produces the heating current: approximately **5 A at 12 V**, stepped down from the supply voltage. To produce high tube currents the filament is heated to about 2,700 K, for a minimal time, to reduce evaporation of the tungsten. Before that it is preheated to about 1,500 K. The filament reaches its full temperature when you press **prep**.

The electrons released repel each other, as they all have a negative charge, and form a cloud around the filament: the **space charge**. The negatively charged cloud repels further electrons being released.

When the **kVp** is applied, the electrons are accelerated by the potential difference between the cathode and the anode. This flow of electrons is the **tube current**, measured in milliamperes (**mA**). As the voltage is increased, more electrons flow to the anode. The **saturation voltage** is the voltage at which all the electrons are attracted to the anode. A further increase in voltage then has no effect on the current: the current is limited by the number of electrons available, and is said to be emission limited.

So the **filament temperature controls the mA**: a hotter filament releases more electrons. The kVp determines the kinetic **energy** of each electron. The mA multiplied by the exposure time gives the **mAs**, which sets how many electrons cross the tube, and so the number of X-ray photons.

## Try this
- Press **Next** once. Prep 1 shows the filament heating and the electron cloud forming around it.
- Tap the filament (number 1) and read how its temperature sets the mA.

## Key points
- Electrons are emitted from the heated tungsten filament by thermionic emission.
- The filament circuit (approximately 5 A at 12 V, stepped down from the supply) produces the heating current.
- The electrons form a cloud, the space charge, until the kVp accelerates them to the anode.
- Filament temperature controls the mA (the number of electrons); the kVp determines the energy of each one.

# What happens in the anode
id: anode
summary: The four ways an electron interacts with the target, and why 99% becomes heat.
areas: Interactions in the anode
diagram: target
status: draft
sources: 8-1 s13–21

X-rays are produced when high-speed electrons hit the anode. Each electron arrives with a kinetic energy, in keV, equal to the tube voltage in kV: an electron accelerated through 80 kV arrives with **80 keV**.

We must consider the individual interactions that may happen to that electron in the tungsten target. There are four possibilities:

- **1 Excitation (outer shell).** The incident electron imparts a small amount of its kinetic energy to an outer-shell electron, displacing it to a higher level. The electron then returns to its original level, and the energy is released as **heat**.
- **2 Ionisation (outer shell).** A larger amount of kinetic energy is deposited in an outer-shell electron, and the electron is removed. A free electron takes its place, releasing its excess energy as **heat**.
- **3 Ionisation (inner shell).** Energy is given to an inner-shell electron, which is ejected. It is replaced by an electron from an outer shell, with the release of energy as an X-ray photon: **characteristic radiation**.
- **4 Electron braking.** The incident electron passes close to the nucleus of the tungsten atom, changes direction and slows down. The kinetic energy it loses is given off as an X-ray photon: **Bremsstrahlung radiation**.

Only the last two processes produce X-rays. The outer-shell interactions are far more likely, so X-rays and heat are both produced from the impact, and only about **1%** of the energy is released as X-ray radiation. About **99%** is converted to heat.

## Predict
When the electron beam hits the target, what is most of its energy converted to?
- X-rays
- * Heat
- Visible light
> About 99% is converted to heat. Outer-shell excitation and ionisation release their energy as heat; only inner-shell ionisation and electron braking produce X-rays.

## Try this
- Fire an electron with **1** and with **2** selected. Neither produces an X-ray photon.
- Now try **3** and **4**. These are the two processes that produce X-rays.

## Key points
- Each electron arrives with a kinetic energy in keV equal to the kVp.
- Four possibilities: outer-shell excitation and outer-shell ionisation (heat), inner-shell ionisation (characteristic radiation) and electron braking (Bremsstrahlung).
- Only about 1% of the energy is released as X-ray radiation; about 99% is converted to heat.

# Bremsstrahlung and characteristic radiation
id: x-rays
summary: The two ways X-rays are produced in the target, and why one gives a continuous spectrum and the other lines.
areas: Bremsstrahlung; Characteristic radiation
diagram: target
status: draft
sources: 8-1 s18–33; 10-1 s3

**Bremsstrahlung**, or "braking" radiation, depends on the deflection caused by the attractive force of the nucleus. The incident electron passes close to the nucleus of the tungsten atom, changes direction and slows down. The kinetic energy it loses is given off as an X-ray photon.

The photon's energy depends on how close the electron passes to the nucleus. Small deflections are the most common, producing many low-energy photons. These have little penetrating power and are absorbed by the inherent and added filtration. Large deflections are less likely, and the loss of all the electron's energy is very rare, because the nucleus is so small within the atom. Drawing a graph of the photon energies gives a **continuous spectrum**.

The **maximum photon energy** is set by the potential difference: 80 kVp gives photons of up to 80 keV.

**Characteristic radiation** is emitted following the creation of a vacancy in an inner electron shell. The incident electron must have more than the K-shell binding energy, **69.5 keV** in tungsten, to eject a K-shell electron. The vacancy is filled by an electron from an outer shell, and the atom then contains excess energy: the difference in binding energy between the two shells. This is emitted as a photon:

- From the L shell: 69.5 − 10.2 ≈ **59.3 keV** (Kα), the more likely.
- From the M shell: about **67.2 keV** (Kβ).

These energies depend on the binding energies of tungsten's electrons, not on the kVp, so they appear as **lines** on the spectrum. Below 69.5 kVp there are no K-lines.

The excess energy can be emitted in two ways: by emitting a photon, or by pushing out one of the most loosely bound electrons in the outermost shell. For heavy elements such as tungsten, photon emission is more common; for lighter elements, electron emission dominates. The electrons emitted are called **Auger electrons**.

## Try this
- Choose **4 Braking** and fire at every distance. Each gives a different photon energy.
- Set a **direct hit**: the photon takes all the electron's energy.
- Choose **3 Inner ionisation** at 60 kVp, then at 80 kVp. Below 69.5 kVp there is no Kα photon.

## Key points
- Bremsstrahlung: the electron is slowed by the nucleus. Small deflections are the most common, and the result is a continuous spectrum.
- Characteristic radiation: a vacancy in an inner shell is filled from an outer shell. The energies are fixed (Kα 59.3 keV, Kβ 67.2 keV), so they appear as lines.
- The K-lines need the electron to have more than 69.5 keV: there are none below 69.5 kVp.
- The maximum photon energy is set by the kVp.

# The X-ray spectrum
id: spectrum
summary: Reading the spectrum, and how target material, mA and kVp change it.
areas: The X-ray spectrum
diagram: spectrum
status: draft
sources: 10-1 s9–26

The **X-ray spectrum** is a graph of the number of photons against photon energy. It shows the continuous Bremsstrahlung spectrum and the characteristic lines of the target together. The spectrum ends at the **maximum photon energy**, set by the kVp.

Two terms describe a beam:

- **Quantity** is the number of photons: the **area under the graph**, including the characteristic lines.
- **Quality** describes the **penetrating power** of the beam. A normal X-ray beam is heterogeneous (it contains photons of many energies), so its quality is commonly referred to by its **effective photon energy**: the energy of the homogeneous beam that it would be equivalent to.

Four things affect the spectrum produced: the target material, the mA, the kVp and the filtration.

**Target material.** The target is generally tungsten (W, Z = 74); specialised mammography units use molybdenum (Mo, Z = 42). The amount of Bremsstrahlung is proportional to Z: the greater the atomic number, the greater the quantity produced. The characteristic lines depend on the binding energies of the target material's electrons, so each material has its own.

**mA.** As the mA increases, the number of electrons emitted by the cathode increases in proportion, so the quantity of photons, characteristic and Bremsstrahlung, increases: 2 × mA = 2 × photons. The quality and the maximum and minimum energies are all unaltered.

**kVp.** An increase in kVp increases the kinetic energy of the electrons at the target. The kVp determines the peak energy of the spectrum, and as it increases the number of higher-energy photons increases, so the **quality increases**. The quantity increases too, approximately with **kVp²**: a beam generated at 80 kVp compared with one at 60 kVp gives (80)² ÷ (60)² = 1.78, an increase in output of 78%.

The **generator** also affects the spectrum. A supply with more ripple spends part of each cycle below the peak voltage, so it gives fewer photons, of lower mean energy.

## Predict
Double the mA and keep the kVp the same. What happens to the spectrum?
- It shifts to higher energies
- * It becomes twice as tall, with the same shape
- Its maximum energy doubles
> The mA changes the quantity, not the quality: 2 × mA = 2 × photons. The maximum energy and the shape of the spectrum are unaltered.

## Try this
- **Pin** the beam, then double the mA. The quantity doubles; the quality is unaltered.
- Raise the kVp from 60 to 80. Watch the maximum energy increase and the K-lines appear above 69.5 kVp.
- Choose the **Mammography** preset and compare its spectrum with general radiography.

## Key points
- Quantity is the area under the graph; quality is the penetrating power, referred to by the effective photon energy.
- mA changes the quantity only: 2 × mA = 2 × photons.
- kVp determines the peak energy; raising it increases the quality, and the quantity approximately with kVp².
- The characteristic lines depend on the target material's binding energies.

# Filtration
id: filtration
summary: Why low-energy photons are removed, and what that does to the beam.
areas: Filtration
diagram: spectrum
status: draft
sources: 10-1 s28–37

**Filtration** is the reduction in the intensity of the beam as a result of passing through one or more materials before reaching the patient.

Lower-energy photons contribute to the patient's **dose**, not to the image: they are absorbed in the skin and superficial tissues and never reach the image receptor. Filtration absorbs these lower-energy photons.

**Inherent filtration** comes from the materials the beam passes through before leaving the tube: the tungsten target, the glass of the tube insert, the oil and the insert window. It is equivalent to approximately **1 mm of aluminium**, and it removes some of the low energies.

**Additional filtration** is placed at the exit port, and is a legal requirement. The materials used include aluminium and copper. For general radiography the **total** filtration must be at least **2.5 mm aluminium equivalent**.

On the spectrum, the area below the graph is decreased, so the **quantity is decreased**. The average energy is increased, so the **quality is increased**. This is **beam hardening**. The maximum photon energy is unaltered: it is still set by the kVp.

## Try this
- **Pin** the beam at 2.5 mm, then change the filtration to 6 mm. There are fewer photons, with a higher average energy.
- Set the filtration to 0 mm and look at the low-energy end of the spectrum: these photons would contribute to dose, not to the image.

## Key points
- Lower-energy photons contribute to dose, not to the image, so filtration absorbs them.
- Inherent filtration is approximately 1 mm Al; additional filtration is a legal requirement, and the total must be at least 2.5 mm Al equivalent for general radiography.
- Filtration decreases the quantity and increases the quality: beam hardening. The maximum energy is unaltered.
