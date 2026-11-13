<!--
Lessons for topic 7, Exposure & Image Quality. The README explains the format.
Wording follows the lecture slides and notes where it can (Exposure, Modifying Exposure); figures follow reference data.
-->

# kVp and mAs
id: kvp-mas
summary: What each exposure factor controls, and how to select them.
areas: kVp and mAs
diagram: console
status: draft
sources: Exposure s6–10, s34–36; Modifying Exposure s2–5

X-ray images are shadows of the body parts that have attenuated the beam. Two exposure factors decide how much radiation is produced and how penetrating it is.

**mAs** is the tube current (milliamps, mA) multiplied by the time (seconds, s) over which the exposure is made. For example, 1,000 mA × 0.01 s = 10 mAs, and 500 mA × 0.02 s also = 10 mAs. We consider it to be the **amount of radiation produced**: the higher the mAs, the larger the quantity of X-ray photons. Tube currents today are high, allowing very short times and reducing the chance of movement unsharpness.

**kVp** is the peak of the kV applied across the X-ray tube. It relates to the kinetic energy of the electrons accelerated in the tube. A higher kVp leads to higher-energy X-ray photons: the beam has **more penetrative power**, and the image has lower contrast.

How should they be selected?

- **kVp** should be selected to reflect the body part: enough kinetic energy to **penetrate the body part**. The photon energies needed for each area of anatomy tend to stay constant. Larger body parts need a higher kVp. Changes of 2 to 3 kVp do nothing to alter the image.
- **mAs** should be selected to ensure there are **enough quanta reaching the detector**. A mAs value that is too low causes signal-to-noise problems: quantum mottle and a grainy appearance.

The two are linked by the **15% rule**: increasing the kVp by 15% means you can halve the mAs. The patient dose falls, but so does the contrast.

In summary: **mAs = how many quanta; kVp = how penetrating they are.** You control the dose and the image quality by the correct choice of exposure factors.

## Predict
Double the mAs and keep everything else the same. What happens to the patient's dose?
- It stays the same
- * It roughly doubles
- It quadruples
> Dose is proportional to mAs. Increasing the kVp by 15% and halving the mAs gives a similar exposure at the detector for less dose.

## Try this
- Choose a body part, then change the kVp and the mAs separately and watch the image, the EI and the dose.
- Press the **15% rule** button: a similar EI, a lower dose, a little less contrast.
- Play **Higher or lower?** to judge which setting gives the higher dose.
- Choose **Dose creep**: predict, then keep adding a little mAs. Watch the image, then the EI and the dose.

## Key points
- mAs = mA × time. It is the amount of radiation produced; select it so that enough quanta reach the detector.
- kVp relates to the kinetic energy of the electrons; the higher the kVp, the more penetrating the beam. Select it to reflect the body part.
- 15% rule: increasing the kVp by 15% means you can halve the mAs.

# Contrast, noise and sharpness
id: image-quality
summary: What makes an image diagnostic, and what controls each quality.
areas: Contrast; Image quality
diagram: console
status: draft
sources: Exposure s11, s17; Modifying Exposure s2–7

**Contrast** is the difference in the amount of blackening between adjacent areas. Contrast is inversely related to kVp: a higher kVp gives a lower contrast. It is also affected by scatter.

**Density** is how "black" the image is. Variations in mAs are its main controlling factor, but with digital technology dark and light images are adjusted automatically.

**Noise** is random fluctuation in the greyness of the anatomical details. If severe enough, it obscures detail. If not enough quanta reach the detector, the chance of noise is higher, so the usual cause is a mAs that is too low.

**Resolution** is the ability to demonstrate small detail. **Sharpness** requires the smallest focal spot possible and a minimal object–receptor distance (in the next lesson), and no movement during the exposure.

Because digital systems adjust the brightness automatically, there is a **temptation to over-expose**. Increasing the mAs will increase image quality, most of the time and up to a limit, but at the expense of dose. This contradicts the legal responsibility of **ALARP**. There is no excuse for over-exposing.

## Try this
- Lower the mAs until the image becomes grainy.
- Raise the kVp and watch the contrast fall.
- Work through the **What do I do?** scenarios, then press **Fix it in the console** and correct the settings yourself.

## Key points
- Contrast: the difference in blackening between adjacent areas. It falls as the kVp rises, and with scatter.
- Noise: random fluctuations in greyness, from not enough quanta reaching the detector.
- Sharpness: the smallest focal spot possible, a minimal ORD and no movement.
- Over-exposing may still give a good image on a digital system, but it contradicts ALARP.

# Focal spot and geometry
id: geometry
summary: Why edges are unsharp, and how the focal spot size and distances control it.
areas: Focal spot and geometry
diagram: geometry
status: draft
sources: Exposure s19; Modifying Exposure s6–7

The **focal spot** is set by the cathode filament selected. There are usually two sizes in any one general X-ray tube, for example 1.2 mm and 0.6 mm.

Because the focal spot has a size, rays from its two edges cast slightly different shadows. The full shadow is the **umbra**; the unsharp margin around it is the **penumbra**, or **geometric unsharpness**.

- The penumbra effect increases as the **focal spot** increases, leading to unsharpness around the image.
- An increase in the **object–receptor distance (ORD)** has the same effect, and also magnifies the image.
- The penumbra decreases as the **focus–receptor distance (FRD)** increases.

The smaller the focal spot, the better the image detail. The bigger it is, the better it tolerates tube loading, so large body parts are not compatible with small focal spots. Sharpness requires the smallest focal spot possible, as well as minimising the ORD.

## Predict
Move the part further from the detector (a larger ORD). What happens to the geometric unsharpness?
- It decreases
- * It increases
- It does not change
> The penumbra is the focal spot size × ORD ÷ (FRD − ORD), so a larger ORD increases it, and the image is magnified too.

## Try this
- Increase the ORD and watch the penumbra and the magnification increase.
- Change from fine to broad focus: the penumbra doubles.
- Increase the FRD and see what happens to the mAs needed.

## Key points
- The penumbra (geometric unsharpness) comes from the size of the focal spot.
- It increases with the focal spot size and the ORD, and decreases as the FRD increases.
- A small focal spot gives better detail; a large one tolerates more tube loading.

# Grids
id: grids
summary: How an anti-scatter grid improves contrast, and what it costs in dose.
areas: Grids
diagram: console
status: draft
sources: Exposure s21

A **grid** is an anti-scatter device. Scatter causes image unsharpness and reduces contrast and detail. A grid helps to absorb some of the scatter before it reaches the image receptor.

When a grid is used, the exposure factors have to be increased, because it also absorbs some of the primary beam. The patient dose rises. This is accounted for in the preset exposure settings.

Grids are not for small body parts. Small body parts need low exposure factors and cause only a small amount of scatter, so a grid adds dose for little gain. Larger body parts, such as the pelvis, abdomen and spine, need a higher kVp and may require a grid for scatter.

## Try this
- Choose **Pelvis** and take the grid out: the contrast falls.
- Choose **Hand** and put a grid in: compare the dose.

## Key points
- A grid absorbs some of the scatter before it reaches the image receptor, improving contrast.
- The exposure factors have to be increased when a grid is used, so the dose rises.
- Not for small body parts, which cause only a small amount of scatter.

# Automatic exposure control
id: aec
summary: How the AEC ends the exposure, and what the radiographer is responsible for.
areas: Automatic exposure control
diagram: aec
status: draft
sources: Exposure s22–24

The **automatic exposure control (AEC)** cuts the exposure when enough radiation has reached the image receptor. It controls the **mAs only**: the kVp is selected by the radiographer and stays constant.

Radiation transmitted through the patient reaches an **ionisation chamber**, where it is converted into an electrical signal. The exposure is terminated when a predetermined amount of radiation has been detected. That level is calibrated by service personnel to meet the department's standards of image quality, as part of quality assurance.

There are usually **three chambers**, which can be selected individually. The radiographer is responsible for selecting the correct chamber for the anatomy under examination, and for centring the anatomy over it.

The AEC has limitations: **metal prostheses** and some pathologies can cause the wrong exposure, so the image still needs checking.

## Predict
For a PA chest, you select only the centre chamber, which lies over the spine. How will the lungs be exposed?
- Correctly: the AEC compensates
- * Too much: the exposure continues until enough radiation has passed through the spine
- Too little
> The chamber under the dense spine takes longer to detect its predetermined amount, so the lungs, which attenuate far less, are over-exposed.

## Try this
- Expose a **PA chest** with the two outer chambers, then with the centre chamber only: the spine makes the exposure too long.
- Change the **patient build**: the mAs changes, but the exposure to the anatomy stays the same.
- Put a **metal implant** over the centre chamber for a lumbar spine, then **lead**: the guard timer has to end the exposure.

## Key points
- The AEC cuts the exposure when a predetermined amount of radiation has reached the ionisation chamber.
- It controls the mAs only; the radiographer selects the kVp.
- The radiographer is responsible for selecting the correct chamber and centring the anatomy. Metal prostheses and some pathologies are limitations.

# The exposure index
id: exposure-index
summary: What the EI indicates, what affects it, and what to do when it is out of range.
areas: Exposure index
diagram: console
status: draft
sources: Exposure s26–34

The **exposure index (EI)** indicates the quantity of radiation energy captured by the detector. It gives an indication of whether the image is over- or under-exposed. Knowing the acceptable range of EI for the equipment you are using is vital.

The EI is intended as a **guide only**. It is **not** a measure of the dose to the patient, and it should not determine the decision to repeat an examination: that depends on whether the clinical landmarks are visible and the clinical question has been answered.

The EI is affected by many technical factors:

- collimation, especially;
- whether the area of interest is in the centre of the receptor;
- the exposure factors selected (kV and mAs);
- high-density objects in the field of view, such as contrast agents and prosthetic implants;
- the focus–receptor distance.

What do I do? Check the EI, then look at the image: is it too dark, too light or noisy?

- **EI within range, but the image appears too dark with little contrast.** Too much kV: the X-rays have too much energy, so there is less attenuation, too much penetration and too little contrast. Reprocess to improve the contrast, and use a lower kV. If using the AEC, make sure the anatomy is centred.
- **EI above range, but the image looks acceptable.** Too much mAs, so too high a dose. Next time reduce your mAs. Consider ALARP.
- **EI above range and the image looks too dark.** Too much mAs and too much kV. Reprocess to improve the image quality, and next time reduce both.
- **EI below range and the image looks dark.** Not enough mAs and too much kV. If there isn't enough information, reprocessing **will not** improve the image quality. Next time increase your exposure.
- **EI below range, but the image looks acceptable.** Small detail, especially in bone, may not be demonstrated.

## Try this
- Work through the **What do I do?** scenarios, judging each image before reading the answer.

## Key points
- The EI indicates how much radiation reached the detector. It is a guide, not a measure of patient dose.
- Collimation, centring, high-density objects and distance all affect it.
- EI above range but the image acceptable: reduce the mAs next time. EI below range and a poor image: increase the exposure; reprocessing will not improve it.
