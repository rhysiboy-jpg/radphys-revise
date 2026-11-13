<!--
Lessons for topic 2, Electricity & X-ray Circuits. The README explains the format.
Wording follows the lecture slides and notes where it can (5-1, 5-3, 10-1); figures follow reference data.
-->

# Charge, conductors and insulators
id: charge
summary: Positive and negative charge, how objects become charged, and why metals conduct.
areas: Charge; Conductors and insulators
diagram: conductors
status: draft
sources: 5-1 s5–7

**Charge** describes the property of an object that allows it to take part in electrical forces. It is present in the form of protons and electrons, and there are two types: **positive** and **negative**. **Like charges repel** each other and **unlike charges attract**. Two negative charges try to move away from each other, while a positive and a negative charge attract.

Most materials are conductors or insulators.

- In a **conductor**, the outermost electrons are loosely bound and free to travel through the material.
- In an **insulator**, the electrons have a higher binding energy, so they are not as free to flow and carry charge through the material.
- **Semiconductors** fit in between: impurities within the material can alter its conductive properties.

There are three ways to give an object a net charge:

- **Friction**: useful for charging insulators. Rubbing one material with another transfers electrons from one to the other, leaving one with a net negative charge and the other with a positive charge.
- **Conduction**: if a charged object touches a conductor, some of the charge is transferred between them.
- **Induction**: a charged object is brought close to a conductor that is connected to earth, and electrons flow onto it or away from it.

In the X-ray tube and circuit, the copper wiring is a conductor, while the glass envelope and the oil are insulators.

## Predict
With a voltage across a strip of glass, what will its electrons do?
- Drift towards the positive end
- * Stay with their atoms, so no current flows
- Drift towards the negative end
> Glass is an insulator: its electrons have a higher binding energy and are not free to flow. In copper, the loosely bound outermost electrons drift towards the positive end.

## Try this
- Make both charges negative, then make one positive: like charges repel, unlike charges attract.
- Turn the voltage on across **copper**: the free electrons drift towards the positive end.
- Switch to **glass** or **oil**: the electrons stay with their atoms, so no current flows.

## Key points
- Like charges repel each other; unlike charges attract.
- Conductors: the outermost electrons are loosely bound and free to travel. Insulators: the electrons have a higher binding energy.
- An object can be given a charge by friction, conduction or induction.

# Potential difference, current and resistance
id: circuits
summary: Volts, amps and ohms, and Ohm's law.
areas: Potential difference and current; Resistance
diagram: ohms-law
status: draft
sources: 5-1 s8–11

**Potential difference** is the difference in the amount of energy that charge carriers have between two points in a circuit. It is measured in **volts** (V): if one joule of energy is required to move one coulomb of charge, the potential difference is 1 volt. The tube voltage (kVp) is a potential difference.

**Current** is the flow of electric charge due to the potential difference within a circuit. It is the rate of charge flowing past a given point, measured in coulombs per second, named the **ampere** (A). The tube current (mA) is the flow of electrons across the X-ray tube.

**Ohm's law** states that the current through a conductor between two points is directly proportional to the voltage across the two points, at a constant temperature. Double the voltage and the current doubles.

This introduces **resistance**: the opposition to the flow of electric current, measured in **ohms**. It is analogous to mechanical friction within a circuit. Resistance depends on the material, and also on its size and shape: a wire's resistance is higher if it is long and thin, and lower if it is short and thick. Resistors oppose the flow, so more electrical energy is required to push the current through, and the excess energy dissipates as **heat**. Sometimes this is the desired outcome, as in a kettle, or in the filament of the X-ray tube.

## Predict
Double the voltage across the same wire. What happens to the current?
- It halves
- It stays the same
- * It doubles
> Ohm's law: at a constant temperature, the current is directly proportional to the voltage, so double the voltage gives double the current.

## Try this
- Double the voltage: the current doubles, and the point moves along a straight line through the origin.
- Make the wire **longer**, then **thicker**: watch the resistance rise, then fall.
- Push a large current through a thin wire and see how much energy dissipates as heat.

## Key points
- Potential difference: the difference in energy that charge carriers have between two points, in volts (J/C).
- Current: the rate of charge flowing past a given point, in amperes (C/s).
- Resistance: the opposition to the flow of current, in ohms. It is higher for long, thin wires, and the excess energy dissipates as heat.
- Ohm's law: current is directly proportional to voltage, at a constant temperature.

# Alternating current and transformers
id: transformers
summary: AC and DC, and how a transformer steps the voltage up or down.
areas: AC and DC; Transformers
diagram: transformer
status: draft
sources: 5-3 s3, s7–9, s19

A **circuit** is a path through which electrical current flows. A closed circuit, or loop, makes current flow possible. The current can be **direct current** (DC), which flows in one direction only, or **alternating current** (AC), which reverses direction: 50 times a second in the UK mains.

There are specific voltage and current requirements to produce X-rays. The mains supply is about 230 V, but the X-ray tube needs tens of thousands of volts, and the filament needs only about 12 V. **Transformers** provide both.

Transformers use **electromagnetic induction** to vary the voltage. They consist of an **iron core**, a **primary winding** and a **secondary winding**. An alternating current flowing through the primary winding produces a changing magnetic field, which carries through the core and induces an alternating voltage in the secondary winding. Transformers only operate with AC: an alternating supply is needed to induce a current in the secondary winding.

- A **step-up transformer** has more turns on the secondary than on the primary. The voltage is increased, but the current must decrease to keep the power constant.
- A **step-down transformer** has fewer turns on the secondary. It decreases the voltage, with a corresponding increase in current.

Transformer efficiency is typically above 95%. The current flowing through the windings produces heat, so X-ray transformers are placed inside a metal box filled with **oil**, which gives electrical and thermal insulation and cools the transformer.

In the X-ray circuit, a step-up transformer converts the voltage to kilovoltage for the tube, and a step-down transformer gives the filament a lower voltage but a higher current (about 12 V and 5 A). An **autotransformer** selects the voltage supplied to the step-up transformer, which is how the kVp is chosen.

## Predict
A step-up transformer raises 230 V to tens of kilovolts. What happens to the current on the high-voltage side?
- It rises by the same factor
- * It falls by the same factor
- It doesn't change
> The voltage is increased, so the current must decrease to keep the power constant.

## Try this
- Choose **High voltage** and see how many turns raise 230 V to the tube voltage, and what happens to the current.
- Choose **Filament** and compare: a step-down transformer gives a low voltage and a high current.
- Move the primary voltage: with the turns fixed, the output follows the input, as when the autotransformer sets the kVp.

## Key points
- AC reverses direction (50 times a second in the UK); DC flows in one direction.
- Transformers use electromagnetic induction to vary the voltage, so they only operate with AC.
- Step-up: the voltage is increased and the current decreases. Step-down: the voltage decreases and the current increases.
- Step-up for the tube's kilovoltage; step-down for the filament; the autotransformer selects the kVp.

# Rectification
id: rectification
summary: Turning AC into the one-way supply the tube needs, and why a steadier supply is better.
areas: Rectification
diagram: rectification
status: draft
sources: 5-3 s10–14; 10-1 s39–43

The X-ray tube requires **direct current**: a negative charge at one end (the cathode) and a positive charge at the other (the anode). Once the voltage has been transformed, the supply is high-voltage AC. **Rectification** is used to convert high-voltage AC to high-voltage DC. It is achieved with **diodes**: solid-state devices through which current can pass in one direction only.

Different forms of rectification are possible, with different outcomes for the resulting current:

- **Half-wave** rectification suppresses the negative portion of the AC sine wave. The positive portion is used to produce a pulsating DC.
- **Full-wave** rectification converts the negative portion of the sine wave to a positive current, giving a more uniform pulsating DC.
- A **three-phase** supply has three waves of AC, each offset in time from the others. After rectification the drop between the peaks is much smaller, giving a much more uniform DC supply. Hospitals use three-phase supplies.
- **High-frequency** generators give an almost constant voltage.

The drop between the peaks is called **ripple**. A supply with peaks and troughs is not optimal for X-ray production: while the voltage is well below the peak, the tube produces fewer photons, of lower energy. Less ripple gives a more consistent beam, with a **higher mean energy** and **more output** for the same mAs.

## Predict
With half-wave rectification, what happens to the negative portion of each AC cycle?
- It is converted and used
- * It is suppressed, so no X-rays are produced then
- It is stored for the next half-cycle
> Half-wave rectification suppresses the negative portion, so the tube produces X-rays only half the time. Full-wave rectification converts it to a positive current, so both portions are used.

## Try this
- Start at AC, then choose half-wave: the negative portion disappears.
- Go to full-wave, then three-phase, and compare the ripple each time.

## Key points
- Rectification converts high-voltage AC to high-voltage DC, so the cathode stays negative and the anode positive.
- Half-wave suppresses the negative portion of the sine wave; full-wave converts it to a positive current.
- Three-phase and high-frequency supplies have little ripple: a more uniform supply, a higher mean energy and more output.

# The X-ray circuit
id: x-ray-circuit
summary: The primary, secondary and filament circuits, and what is in each.
areas: The X-ray circuit
diagram: xray-circuit
status: draft
sources: 5-3 s16–19

X-rays should be controlled in intensity and energy. The X-ray circuit does this, and can be split into three distinct parts.

The **primary circuit** is sometimes known as the low-voltage circuit. It contains:

- the **main switch**, which supplies the power for the X-ray tube;
- the **exposure switch**, which permits current to flow through the circuit;
- the **timer**, used to end the exposure at an accurately measured pre-set time;
- the **kVp and mA selectors**, which allow selection of the energy and intensity of the X-rays produced. The kVp is selected at the **autotransformer**.

The **secondary circuit** is the high-voltage circuit. It contains:

- the **high-voltage transformer**, a step-up transformer that converts the voltage to kilovoltage;
- the **rectifiers**, solid-state devices that allow current to flow in only one direction. They convert high-voltage AC to the high-voltage DC necessary for the tube.

The **filament circuit** supplies power to the X-ray tube filament, so that enough electrons are released by **thermionic emission**. It includes a **step-down transformer**, which provides the high current the filament needs. Its setting controls the filament temperature, and so the **mA**.

In summary: the **kVp** is selected in the primary circuit and produced in the secondary circuit, while the **mA** is set through the filament circuit.

## Predict
Where in the X-ray circuit is the mA set?
- At the step-up transformer
- * In the filament circuit
- At the rectifiers
> The mA selector sets the filament current, so the filament's temperature and the number of electrons released by thermionic emission. The kVp is selected at the autotransformer.

## Try this
- Choose **Select the kVp**: it is selected in the primary circuit and produced in the secondary.
- Choose **Select the mA**: it is set through the filament circuit.
- Tap each part to read what it does and which circuit it belongs to.

## Key points
- Primary (low-voltage) circuit: main switch, exposure switch, timer, autotransformer, kVp and mA selectors.
- Secondary (high-voltage) circuit: step-up transformer and rectifiers.
- Filament circuit: step-down transformer, low voltage and high current; it sets the mA.
