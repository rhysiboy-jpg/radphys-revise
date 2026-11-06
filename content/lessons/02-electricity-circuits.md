<!--
Lessons for topic 2, Electricity & X-ray Circuits. The README explains the format.
-->

# Charge, conductors and insulators
id: charge
summary: Positive and negative charge, how objects become charged, and why metals conduct.
areas: Charge; Conductors and insulators
diagram: conductors
status: draft
sources: 5-1 s5–7

Electric **charge** comes in two kinds: positive (protons) and negative (electrons). **Like charges repel** and **unlike charges attract**: two negative charges push each other apart, while a negative and a positive pull together. This is also why electrons are held in an atom by its positive nucleus.

An object becomes charged by gaining or losing electrons, in three ways:

- **Friction**: rubbing transfers electrons from one surface to another (useful for insulators).
- **Conduction**: charge flows across when a charged object touches another.
- **Induction**: a charged object brought near an earthed conductor draws charge into or out of it.

In a **conductor**, such as a metal, the outermost electrons are loosely bound and free to move through the material, so charge can flow. In an **insulator** the electrons are held tightly (a higher binding energy), so charge can't flow freely. The oil and glass of an X-ray tube are insulators; the copper wiring is a conductor.

## Predict
With a voltage across a strip of glass, what will its electrons do?
- Drift towards the positive end
- * Stay with their atoms, so no current flows
- Drift towards the negative end
> Glass is an insulator: its electrons are held tightly, so they can't flow. In copper, the loosely bound outer electrons drift towards the positive end.

## Try this
- Make both charges negative, then make one positive: like charges repel, unlike charges attract.
- Turn the voltage on across **copper**: the free electrons drift towards the positive end.
- Switch to **glass** or **oil**: the electrons stay with their atoms, so no current flows.

## Key points
- Like charges repel; unlike charges attract.
- Objects are charged by friction, conduction or induction.
- Conductors have loosely bound outer electrons that are free to move; insulators hold theirs tightly.

# Potential difference, current and resistance
id: circuits
summary: Volts, amps and ohms, and Ohm's law.
areas: Potential difference and current; Resistance
diagram: ohms-law
status: draft
sources: 5-1 s8–11

**Potential difference** is the difference in energy per unit of charge between two points in a circuit: the energy needed to move charge between them. It is measured in **volts**: 1 V is 1 joule per coulomb. The tube voltage (kVp) is a potential difference.

**Current** is the rate of flow of charge, measured in **amperes**: 1 A is one coulomb passing a point each second. The tube current (mA) is the flow of electrons across the X-ray tube.

**Resistance** is the opposition to current, measured in **ohms**. It increases with the length of a wire and decreases with its thickness, so a long, thin wire has the highest resistance. Pushing current through a resistance turns energy into **heat**: a loss in most of the circuit, but exactly what heats the X-ray tube filament.

**Ohm's law**: for a conductor at constant temperature, the current is **directly proportional** to the potential difference. Double the voltage and the current doubles; the ratio between them is the resistance.

## Predict
Double the voltage across the same wire. What happens to the current?
- It halves
- It stays the same
- * It doubles
> Ohm's law: at a constant temperature, current is proportional to potential difference, so double the voltage gives double the current.

## Try this
- Double the voltage: the current doubles, and the point moves along a straight line through the origin.
- Make the wire **longer**, then **thicker**: watch the resistance rise, then fall.
- Push a large current through a thin wire and see how much energy becomes heat.

## Key points
- Potential difference: energy per unit charge, in volts (J/C).
- Current: rate of flow of charge, in amperes (C/s).
- Resistance: opposition to current, in ohms; higher for long, thin wires; it turns energy into heat.
- Ohm's law: current is proportional to potential difference at constant temperature.

# Alternating current and transformers
id: transformers
summary: AC and DC, and how a transformer steps the voltage up or down.
areas: AC and DC; Transformers
diagram: transformer
status: draft
sources: 5-3 s3, s7–9, s19

**Direct current** (DC) flows in one direction only. **Alternating current** (AC) reverses direction many times a second: 50 times a second in UK mains. Mains AC is at about 230 V, but the X-ray tube needs tens of thousands of volts, and the filament needs only about 12 V. **Transformers** make both.

A transformer has two **windings** on an **iron core**. AC in the **primary** winding makes a **changing magnetic field** in the core, which **induces** an alternating voltage in the **secondary** winding: electromagnetic induction. Only a changing field induces a voltage, so a transformer **needs AC**: DC makes a steady field that induces nothing.

The **turns ratio** sets the change. More turns on the secondary than the primary **steps the voltage up**; fewer **steps it down**. A transformer can't create energy, so when the voltage goes up the current comes down, keeping the power about the same (transformers are over 95% efficient).

In the X-ray circuit, a **step-up transformer** raises the voltage to kilovolts for the tube, and a **step-down transformer** gives the filament its low voltage and high current (about 12 V and 5 A). An **autotransformer** selects the voltage fed to the step-up transformer, which is how the kVp is chosen.

## Predict
A step-up transformer raises 230 V to tens of kilovolts. What happens to the current on the high-voltage side?
- It rises by the same factor
- * It falls by the same factor
- It doesn't change
> Voltage and current change in opposite directions: in an ideal transformer, voltage × current is the same on both sides.

## Try this
- Choose **High voltage** and see how many turns lift 230 V to the tube voltage, and what happens to the current.
- Choose **Filament** and compare: a step-down transformer gives a low voltage and a high current.
- Move the primary voltage: with the turns fixed, the output follows the input, just as the autotransformer sets the kVp.

## Key points
- AC reverses direction (50 times a second in the UK); DC flows one way.
- A transformer works by electromagnetic induction, so it needs AC.
- More secondary turns steps the voltage up and the current down; fewer steps it down.
- Step-up for the tube's kilovolts; step-down for the filament; the autotransformer selects the kVp.

# Rectification
id: rectification
summary: Turning AC into the one-way supply the tube needs, and why smoother is better.
areas: Rectification
diagram: rectification
status: draft
sources: 5-3 s10–14; 10-1 s39–43

The step-up transformer gives a very high **alternating** voltage, but the tube needs current to flow **one way**: electrons must always travel from the negative **cathode** to the positive **anode**. Turning AC into DC is **rectification**, done by **rectifiers** (diodes), which let current through in one direction only.

- **Half-wave** rectification simply suppresses the reverse half of each cycle, leaving gaps.
- **Full-wave** rectification turns the reverse half into forward current too: twice as many pulses, but the voltage still drops to zero between them.
- **Three-phase** supplies overlap three waveforms, so after rectification the voltage barely dips between pulses.
- **High-frequency** generators give an almost constant voltage.

The dip between peaks is called **ripple**. While the voltage is well below the peak, the tube makes fewer, lower-energy photons. Less ripple means a more consistent beam with a **higher mean energy** and **more output** for each mAs, which is why hospital generators are three-phase or high-frequency.

## Predict
With half-wave rectification, what happens to the half of each AC cycle that runs the wrong way?
- It's reversed and used
- * It's blocked, so no X-rays are made then
- It's stored for the next half-cycle
> A half-wave rectifier blocks the reverse half, so the tube makes X-rays only half the time. Full-wave rectification flips it instead, so both halves are used.

## Try this
- Start at AC, then choose half-wave: the reversed half disappears.
- Go to full-wave, then three-phase, and compare the ripple each time.

## Key points
- Rectification converts AC to DC, so the cathode stays negative and the anode positive.
- Half-wave suppresses the reverse half; full-wave converts it, doubling the pulses.
- Three-phase and high-frequency supplies have little ripple: a steadier kVp, a higher mean energy and more output.

# The X-ray circuit
id: x-ray-circuit
summary: The primary, secondary and filament circuits, and what sits in each.
areas: The X-ray circuit
diagram: xray-circuit
status: draft
sources: 5-3 s16–19

An X-ray generator has three linked circuits.

The **primary circuit** runs at low voltage and holds everything the radiographer controls: the **main switch**, the **exposure switch**, the **timer**, the **autotransformer** and the **kVp and mA selectors**.

The **secondary circuit** is the high-voltage side. The **step-up transformer** raises the voltage to the kilovolts the tube needs, and the **rectifiers** turn it into a one-way supply, so the cathode is always negative and the anode always positive.

The **filament circuit** has a **step-down transformer**, giving a low voltage and a high current to heat the filament for **thermionic emission**. Its setting controls the filament temperature, and so the **mA**.

Putting it together: the **kVp** is selected in the primary circuit and produced in the secondary circuit, while the **mA** is set through the filament circuit.

## Predict
Where in the X-ray circuit is the mA set?
- At the step-up transformer
- * In the filament circuit
- At the rectifiers
> The mA selector sets the filament current, so the filament's temperature and how many electrons it releases. The kVp is selected at the autotransformer.

## Try this
- Choose **Select the kVp**: it is chosen in the primary circuit and produced in the secondary.
- Choose **Select the mA**: it is set through the filament circuit.
- Tap each part to read what it does and which circuit it belongs to.

## Key points
- Primary (low voltage): main switch, exposure switch, timer, autotransformer, kVp and mA selectors.
- Secondary (high voltage): step-up transformer and rectifiers.
- Filament: step-down transformer, low voltage and high current; it sets the mA.
