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
-->

# The X-ray tube
id: tube
summary: The parts of a rotating-anode tube, and what each one does.
areas: The X-ray tube
diagram: tube
status: draft
sources: 5-2 s5–12, s20

An X-ray tube turns electrical energy into X-rays. It needs three things: a supply of electrons, a high voltage to accelerate them, and a target to stop them. All of this happens inside a **vacuum**, so the electrons can cross the tube without hitting gas molecules.

The **cathode** is the negative side. It holds a coil of tungsten wire, the **filament**, which releases electrons when it is heated. Around it sits the **focusing cup**, held at the same negative potential. It repels the electrons and squeezes them into a narrow beam aimed at the focal spot.

The **anode** is the positive side: a disc with a bevelled edge carrying a **tungsten** target track (often tungsten–rhenium). Tungsten is used because its high atomic number (Z = 74) makes X-ray production efficient, and its very high melting point (3,422 °C) survives the heat.

About **99%** of the electrons' energy becomes heat, so the anode **rotates**, at about 3,000 rpm (or about 9,000 rpm in high-speed tubes). The electrons then strike a moving track rather than one spot, spreading the heat. The anode is turned by an **induction motor**: a copper **rotor** inside the vacuum, driven by **stator** coils outside the glass. It starts spinning when you press **prep**.

The **envelope** (glass, or metal and ceramic) holds the vacuum. Around it, the **housing** is lined with lead to absorb **leakage radiation**, and filled with **oil**, which insulates against the high voltage and carries heat away. The useful beam leaves through the **window**, then passes through **added filtration**.

## Try this
- Tap each number on the diagram to read about that part.
- Press **Play** to follow one exposure, from prep to the useful beam.
- Notice which parts are inside the vacuum and which are outside it.

## Key points
- The cathode (filament and focusing cup) supplies and aims the electrons; the anode's tungsten target stops them.
- Tungsten: a high atomic number for efficient X-ray production, and a high melting point to survive the heat.
- The rotating anode spreads the heat around a track. The rotor is inside the vacuum and the stator outside: an induction motor.
- The vacuum envelope lets electrons cross freely; the oil insulates and cools; the lead-lined housing stops leakage radiation.

# Thermionic emission
id: thermionic
summary: How the filament releases electrons, and what controls the tube current.
areas: Thermionic emission
diagram: tube
status: draft
sources: 5-2 s21–25

Electrons in a metal are held in by its surface. Heat the metal enough and some electrons gain enough energy to escape. This is **thermionic emission**, and it is how the X-ray tube gets its electrons.

The filament has its own low-voltage circuit. A **step-down transformer** supplies about **5 A at 12 V**, heating the tungsten filament to over 2,000 °C. This happens when you press **prep**.

The released electrons gather in a cloud around the filament: the **space charge**. Nothing crosses the tube yet. Only when the **kVp** is applied are the electrons pulled across to the anode. That flow of electrons is the **tube current**, measured in milliamperes (**mA**).

A hotter filament releases more electrons, so the **filament current controls the mA**. The kVp does something different: it sets how much **energy** each electron carries. Multiply the mA by the exposure time and you get the **mAs**, which sets how many electrons cross, and so the number of X-ray photons.

## Try this
- Press **Next** once. Prep 1 shows the filament heating and the space charge forming around it.
- Tap the filament (number 1) and read how its temperature sets the mA.

## Key points
- Heating the tungsten filament releases electrons: thermionic emission.
- The filament circuit (about 5 A at 12 V, from a step-down transformer) sets the filament temperature.
- The electrons wait in a space charge until the kVp pulls them across the tube.
- Filament temperature controls the mA (how many electrons); the kVp controls the energy of each one.

# What happens in the anode
id: anode
summary: The four ways an electron interacts with the target, and why 99% becomes heat.
areas: Interactions in the anode
diagram: target
status: draft
sources: 8-1 s13–21

Each electron arrives at the target with a kinetic energy, in keV, equal to the tube voltage in kV. An electron accelerated through 80 kV arrives with **80 keV**.

In the target it meets tungsten atoms and loses its energy in many small interactions. The lecture sorts them into four kinds:

- **1 Excitation (outer shell).** The electron lifts an outer-shell electron to a higher level; it drops back, and the energy ends as **heat**.
- **2 Ionisation (outer shell).** The electron knocks an outer-shell electron out of the atom; the energy again ends as **heat**.
- **3 Ionisation (inner shell).** The electron knocks out a K-shell electron, giving **characteristic radiation**.
- **4 Braking.** The electron is slowed by the nucleus, giving **Bremsstrahlung**.

The outer-shell interactions happen far more often, and each involves only a few electronvolts. That is why about **99%** of the electrons' energy becomes **heat** and only about **1%** becomes X-rays, and why so much of anode design is about managing heat.

## Try this
- Fire an electron with **1** and with **2** selected. Neither makes an X-ray photon.
- Now try **3** and **4**. These are the two that produce X-rays.

## Key points
- Each electron arrives with an energy in keV equal to the kVp.
- Outer-shell excitation and ionisation make heat; inner-shell ionisation and braking make X-rays.
- About 99% of the energy becomes heat and about 1% becomes X-rays.

# Bremsstrahlung and characteristic radiation
id: x-rays
summary: The two ways X-rays are made in the target, and why one gives a curve and the other sharp lines.
areas: Bremsstrahlung; Characteristic radiation
diagram: target
status: draft
sources: 8-1 s18–33; 10-1 s3

**Bremsstrahlung** (German for "braking radiation") happens when an electron passes close to a tungsten nucleus. The positive nucleus pulls on it, so it slows and changes direction, and the energy it loses leaves as an X-ray photon. A closer pass means a sharper turn and a higher-energy photon. Electrons pass at every distance, so photons of **every energy** are made, from almost nothing up to the maximum. That gives a **continuous spectrum**.

Rarely, an electron is stopped dead and all its energy becomes one photon. That is the **maximum photon energy**, and it equals the kVp: 80 kVp gives photons of up to 80 keV.

**Characteristic radiation** starts when an incoming electron knocks a **K-shell** electron out of a tungsten atom. That needs more than the K-shell binding energy, **69.5 keV**. An electron from a higher shell drops into the vacancy and gives out the difference as a photon:

- From the L shell: 69.5 − 10.2 ≈ **59.3 keV** (Kα), the more likely.
- From the M shell: about **67.2 keV** (Kβ).

These energies depend only on tungsten, not on the kVp, so they appear as **sharp lines** on the spectrum. Below 69.5 kVp there are no K-lines at all. After the drop, the gap moves out to the L shell and is filled in turn, giving weak L-line photons (about 8 keV) that the tube's filtration absorbs. Occasionally (about 5% of the time in tungsten) the energy throws out an outer electron, an **Auger electron**, instead of a photon.

## Try this
- Choose **4 Braking** and fire at every distance. Each gives a different photon energy.
- Set a **direct hit**: the photon takes all the electron's energy.
- Choose **3 Inner ionisation** at 60 kVp, then at 80 kVp. Below 69.5 kVp there is no Kα photon.

## Key points
- Bremsstrahlung: the electron is braked by the nucleus; any energy up to the kVp, so a continuous spectrum.
- Characteristic: a K-shell vacancy filled from a higher shell; fixed energies (Kα 59.3 keV, Kβ 67.2 keV), so sharp lines.
- K-lines need the electron to bring more than 69.5 keV: none below 69.5 kVp.
- The maximum photon energy equals the kVp.

# The X-ray spectrum
id: spectrum
summary: Reading the spectrum, and how mA, kVp, target and generator change it.
areas: The X-ray spectrum
diagram: spectrum
status: draft
sources: 10-1 s9–26

The **X-ray spectrum** is a graph of the number of photons against photon energy. It combines the two kinds of X-ray: the smooth **Bremsstrahlung** curve and the sharp **K-lines** of tungsten. The curve ends at the **maximum photon energy**, equal to the kVp. At the low-energy end it falls away, because filtration has removed those photons.

Two words describe a beam:

- **Quantity** is the number of photons: the **area under the curve**.
- **Quality** is the beam's penetrating power, described by its **mean** (or effective) photon energy.

**mA and time** change the number of electrons, so the number of photons. Double the mA and the quantity doubles; the shape, the maximum and the mean energy stay the same.

**kVp** changes the energy of the electrons. Raising it moves the maximum photon energy up and shifts the curve to higher energies, so the **quality rises**. The quantity rises too, roughly with kVp², and the K-lines appear once the kVp passes 69.5.

The **target material** and the **generator** matter too. A lower atomic number target such as molybdenum makes fewer Bremsstrahlung photons and has its own K-lines, used in mammography. A generator with more ripple gives a lower average voltage, so fewer photons with a lower mean energy.

## Try this
- **Pin** the beam, then double the mA. Quantity doubles; quality is unchanged.
- Raise the kVp from 60 to 80. Watch the maximum energy move and the K-lines appear above 69.5 kVp.
- Choose the **Mammography** preset and compare its spectrum with general radiography.

## Key points
- Quantity is the area under the curve; quality is the mean photon energy.
- mA (and time) change quantity only.
- kVp raises the maximum and mean energy, and the quantity (roughly with kVp²).
- The K-lines' energies belong to the target material; they only appear above its K-edge.

# Filtration
id: filtration
summary: Why low-energy photons are removed, and what that does to the beam.
areas: Filtration
diagram: spectrum
status: draft
sources: 10-1 s28–37

Low-energy photons don't have the energy to pass through the patient. They are absorbed in the skin and superficial tissues, adding **dose** without ever reaching the image receptor. **Filtration** removes them before they reach the patient.

Some filtration is built into the tube: the glass envelope, the oil and the window. This **inherent filtration** is about 1 mm aluminium equivalent, and it can't be removed. **Added filtration**, usually aluminium sheets at the tube port, brings the **total** to at least **2.5 mm aluminium equivalent** for general radiography.

Filtration absorbs mostly low-energy photons, so the beam has fewer photons (**quantity falls**) but a higher mean energy (**quality rises**). This is **beam hardening**. The maximum photon energy doesn't change: that is still set by the kVp.

## Try this
- **Pin** the beam at 2.5 mm, then change the filtration to 6 mm. Fewer photons, a higher mean energy.
- Set the filtration to 0 mm and look at the low-energy end of the curve: these are the photons that would only add skin dose.

## Key points
- Low-energy photons add patient dose but don't reach the image, so filtration removes them.
- Inherent filtration is about 1 mm Al; the total must be at least 2.5 mm Al equivalent for general radiography.
- Filtration lowers quantity and raises quality: beam hardening. The maximum energy is unchanged.
