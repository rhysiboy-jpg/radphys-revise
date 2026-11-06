<!--
Lessons for topic 7, Exposure & Image Quality. The README explains the format.
-->

# kVp and mAs
id: kvp-mas
summary: What each exposure factor controls, and how to choose them.
areas: kVp and mAs
diagram: console
status: draft
sources: Exposure s6–10, s34–36; Modifying Exposure s2–5

The two main exposure factors do different jobs.

**kVp** sets the energy of the electrons crossing the tube, and so the **energy of the photons**: how **penetrating** the beam is. Choose it to **penetrate the body part**. Too low and the beam doesn't get through; too high and contrast falls.

**mAs** is the tube current (mA) multiplied by the exposure time (s). It sets how many electrons cross the tube, and so the **number of photons**: the quantity. Choose it so that **enough quanta reach the detector** for a diagnostic image, without unnecessary dose. The same mAs can come from a high mA for a short time, which reduces the chance of movement, or a lower mA for longer.

The two are linked by the **15% rule**: raising the kVp by about 15% roughly doubles the radiation reaching the detector, so the mAs can be about halved for a similar exposure. The patient dose falls, but so does the contrast.

In short: **mAs sets how many quanta; kVp sets how penetrating they are.**

## Predict
Double the mAs and keep everything else the same. What happens to the patient's dose?
- It stays the same
- * It roughly doubles
- It quadruples
> Dose is proportional to mAs. Raising the kVp instead (the 15% rule) gives a similar detector exposure for less dose.

## Try this
- Choose a body part, then change the kVp and the mAs separately and watch the image, the EI and the dose.
- Press the **15% rule** button: similar EI, lower dose, a little less contrast.
- Play **Higher or lower?** to guess which setting gives the bigger dose.

## Key points
- kVp sets photon energy (penetration); choose it for the body part.
- mAs = mA × time; it sets the number of photons; choose it so enough quanta reach the detector.
- 15% rule: +15% kVp is roughly like doubling the mAs.

# Contrast, noise and sharpness
id: image-quality
summary: The three things that make an image diagnostic, and what controls each.
areas: Contrast; Image quality
diagram: console
status: draft
sources: Exposure s11, s17; Modifying Exposure s2–7

**Contrast** is the difference in grey level between neighbouring areas, which lets structures be told apart. Raising the **kVp lowers contrast**: higher-energy photons penetrate all tissues more evenly, and there is more Compton scatter. Scatter and image processing affect contrast too.

**Noise** (quantum mottle) is random variation in grey level that can hide detail. It comes from **too few quanta** reaching the detector, usually because the **mAs was too low**.

**Sharpness** is how clearly edges are shown. It is lost through **movement** (use a short exposure time, clear instructions and immobilisation) and through **geometry** (the focal spot and distances, in the next lesson).

Digital processing rescales the brightness of every image, so an over-exposed image can still look fine. That is a **temptation to over-expose**, and it must be resisted: the patient has received more dose than needed, against **ALARP**.

## Try this
- Lower the mAs until the image becomes grainy.
- Raise the kVp and watch the contrast fall.
- Work through the **What do I do?** scenarios.

## Key points
- Contrast: the difference in grey between areas; it falls as kVp rises and with more scatter.
- Noise: from too few quanta, usually too little mAs.
- Sharpness: lost to movement and to geometry.
- Over-exposure can look fine on a digital system, but it breaks ALARP.

# Focal spot and geometry
id: geometry
summary: Why edges blur, and how focal spot size and distances control it.
areas: Focal spot and geometry
diagram: geometry
status: draft
sources: Exposure s19; Modifying Exposure s6–7

If X-rays came from a single point, every edge would be perfectly sharp. But the **focal spot** has a size, so rays from its two edges cast slightly different shadows. The full shadow is the **umbra**; the blurred margin around it is the **penumbra**, or **geometric unsharpness**.

The penumbra grows with:

- a **larger focal spot**;
- a **larger object–receptor distance** (ORD).

It shrinks as the **focus–receptor distance** (FRD) increases, because the rays are closer to parallel.

A **small (fine) focal spot** gives sharper detail but concentrates the heat on a smaller area, which limits the exposure. A **large (broad) focal spot** tolerates more heat but gives less detail. For sharp images, use the smallest suitable focal spot and keep the part **close to the receptor**. A larger ORD also **magnifies** the image.

## Predict
Move the part further from the detector (a larger ORD). What happens to the geometric unsharpness?
- It falls
- * It grows
- It doesn't change
> The penumbra is the focal spot size × ORD ÷ FOD, so a larger ORD widens it, and the image is magnified too.

## Try this
- Raise the ORD and watch the penumbra and magnification grow.
- Switch from fine to broad focus: the penumbra doubles.
- Lengthen the FRD and see what happens to the mAs needed.

## Key points
- Penumbra (geometric unsharpness) comes from the focal spot's size.
- It grows with focal spot size and ORD, and shrinks as FRD rises.
- Fine focus: sharper but less heat capacity; broad focus: more heat capacity, less detail.

# Grids
id: grids
summary: How an anti-scatter grid improves contrast, and what it costs in dose.
areas: Grids
diagram: console
status: draft
sources: Exposure s21

Thicker body parts produce more **scatter**, which reaches the detector as a uniform fog and **lowers contrast**.

An **anti-scatter grid** sits between the patient and the detector. Its thin lead strips absorb much of the scatter heading for the detector, which **improves contrast**. But a grid also absorbs some of the useful **primary** radiation, so **higher exposure factors** are needed, and the patient dose rises.

So a grid is used where it helps: on **thicker parts** such as the pelvis, abdomen and spine, where scatter would spoil the image. On thin parts such as a hand or knee it adds dose for little gain.

## Try this
- Choose **Pelvis** and take the grid out: the image goes grey and flat.
- Choose **Hand** and put a grid in: compare the dose.

## Key points
- A grid absorbs scatter before it reaches the detector, improving contrast.
- It also absorbs some primary radiation, so exposure and dose must rise.
- Use it for thick parts; it isn't worth the dose on thin ones.

# Automatic exposure control
id: aec
summary: How the AEC ends the exposure, and what the radiographer must get right.
areas: Automatic exposure control
diagram: aec
status: draft
sources: Exposure s22–24

An **automatic exposure control** (AEC) uses **ionisation chambers** between the patient and the detector. They measure the radiation passing through the patient and **end the exposure** once a calibrated amount has been reached. So the AEC controls the **mAs**; the radiographer still chooses the **kVp**.

There are usually **three chambers**. The radiographer must:

- select the chamber or chambers that lie under the **anatomy of interest**;
- **centre** the patient accurately over them.

If the chambers sit under the wrong tissue, the exposure will be wrong. **Metal prostheses** and some pathologies can make the AEC end the exposure too early or too late, so the result still needs checking.

## Predict
For a PA chest, you select only the centre chamber, which lies over the spine. How will the lungs be exposed?
- Correctly: the AEC compensates
- * Too much: the AEC runs on until enough gets through the spine
- Too little
> The chamber under the dense spine needs longer to collect its set amount, so the lungs, which let far more through, are overexposed.

## Try this
- Expose a **PA chest** with the two outer chambers, then with the centre chamber only: the spine makes the AEC run too long.
- Change the **patient build**: the mAs changes, but the exposure to the anatomy stays the same.
- Put a **metal implant** over the centre chamber for a lumbar spine, then **lead**: the guard timer has to end the exposure.

## Key points
- AEC chambers measure the radiation reaching the detector and end the exposure at a set amount.
- The AEC sets the mAs; the radiographer sets the kVp.
- Choose the right chambers and centre accurately; metal and pathology can mislead it.

# The exposure index
id: exposure-index
summary: What the EI tells you, what affects it, and what to do when it's out of range.
areas: Exposure index
diagram: console
status: draft
sources: Exposure s26–34

The **exposure index** (EI) indicates **how much radiation reached the detector**, so it shows whether the image was likely over- or under-exposed compared with the department's target range. It is **not a measure of patient dose**.

EI is calculated from the image data, so **collimation**, **centring**, metal or contrast in the field, distance and the exposure factors all change it. It is a **guide**, not a precise measurement, and it shouldn't decide on its own whether to repeat an image.

The lecture's "What do I do?" situations:

- **EI above range, image looks fine**: too much mAs. Processing has hidden the extra dose. Don't repeat; **reduce the mAs** next time.
- **EI below range, image grainy**: too few quanta. Reprocessing **can't add missing information**; increase the mAs next time.
- **EI in range, image dark with little contrast**: **too much kVp**. Reprocess to improve contrast, and use a lower kVp next time; with the AEC, check the centring.

## Try this
- Work through the **What do I do?** scenarios, judging each image before reading the answer.

## Key points
- EI shows how much radiation reached the detector, not the patient dose.
- Collimation, centring, metal and distance all affect it: it is a guide.
- EI high but image fine: reduce the mAs next time. EI low and grainy: increase the exposure; reprocessing won't fix it.
