<!--
Lessons for topic 6, Digital Image Formation. The README explains the format.
-->

# Computed radiography (CR)
id: cr
summary: How a storage phosphor plate records an image, and how the reader turns it into pixels.
areas: Computed radiography (CR)
diagram: detectors
status: draft
sources: 11-1 s10–13, s35; 5-2 s33

A **CR** imaging plate holds a layer of **storage phosphor**. When X-ray photons are absorbed, they raise electrons into intermediate energy levels, where they stay **trapped**. The number trapped is proportional to the radiation absorbed, so the pattern of trapped electrons is the **latent image**.

In the **reader**, a finely focused **laser** scans the plate line by line (a raster pattern). The extra energy frees the trapped electrons, and as they drop back the plate gives off **light**, in proportion to the original exposure. A **photomultiplier tube** turns the light into an electrical signal, and an **analogue-to-digital converter** turns that into pixel values. Finally, **bright light erases** the plate so it can be used again.

CR processing makes assumptions: the area of interest is in the **centre** of the plate, **collimation** has been used, there is only **one exposure** on the plate, the smallest suitable plate is used, and the **body part selected** matches. Breaking these can make processing fail.

## Try this
- Choose **CR** and step through from exposure to erasing the plate.

## Key points
- X-rays trap electrons in the storage phosphor: the latent image.
- A laser releases them; the light is turned into a signal by a photomultiplier tube, then digitised.
- The plate is erased with bright light and reused.
- Processing assumes a central, collimated area, one exposure, and the right body part selected.

# Digital radiography (DR)
id: dr
summary: Direct and indirect flat-panel detectors, and why their sharpness differs.
areas: Digital radiography (DR)
diagram: detectors
status: draft
sources: 11-1 s18–21; 10-4 s7–8; 5-2 s36

A **DR** detector reads itself, so there is no cassette to carry to a reader and the image appears within seconds. Detectors can be fixed or portable, wired or wireless. There are two kinds.

**Indirect** detectors convert in two steps. A **scintillator**, such as caesium iodide (CsI) or gadolinium oxysulphide, turns the X-rays into **light**. A matrix of **amorphous silicon photodiodes** turns the light into **charge**, and **thin-film transistors (TFTs)** read each pixel. On its way down, the light spreads a little, blurring fine detail. **Structured CsI** grows in needle-shaped crystals that guide the light straight down, keeping the image sharper.

**Direct** detectors use a photoconductor, **amorphous selenium**, that turns X-rays **straight into charge**. An electric field pulls the charge straight down to the pixel below, so no light is made and nothing spreads. Direct conversion is the sharpest.

## Try this
- Compare **CR**, **indirect DR** and **direct DR**, and watch how far the signal spreads across the pixels.
- In indirect DR, switch from structured CsI to unstructured Gd₂O₂S.

## Key points
- DR needs no separate reader: images appear within seconds.
- Indirect: scintillator to light, photodiodes to charge, TFTs read out. Structured CsI needles reduce light spread.
- Direct: amorphous selenium turns X-rays straight into charge: no light, no spread, the sharpest.

# Digitisation
id: digitisation
summary: Sampling, quantisation, the matrix and bit depth.
areas: Digitisation
diagram: digitisation
status: draft
sources: 11-1 s20, s41–43; 10-4 s6

The signal from a detector has to be turned into numbers, in two steps.

**Sampling** measures the signal at regular points along each line. This sets the **matrix**: the grid of rows and columns of pixels. For the same field of view, a **larger matrix** means more, smaller pixels, so finer detail can be shown.

**Quantisation** then gives each sample a **grey-scale value** according to the strength of the signal. The **bit depth** sets how many values each pixel can hold, so how many shades of grey are available: a greater bit depth gives finer steps of grey.

If the sampling frequency is **too low**, fine detail can't be reproduced faithfully. This is **aliasing**: detail is lost, and false patterns can appear.

## Try this
- Reduce the **pixels across**: edges step and fine detail disappears.
- Reduce the **bit depth** to 2 bits: smooth changes become bands of grey.
- Choose the **bar pattern** and sample coarsely: the finest stripes turn into false, wider stripes. This is aliasing.

## Key points
- Sampling sets the pixels (the matrix); quantisation gives each a grey value.
- A larger matrix for the same field of view means smaller pixels and finer detail.
- Bit depth sets the number of grey shades.
- Sampling too slowly causes aliasing: lost detail and false patterns.

# Image processing
id: processing
summary: How histogram analysis and look-up tables give a consistent image.
areas: Image processing
diagram: processing
status: draft
sources: 11-1 s29–36

A digital system processes every image so that it looks consistent, whatever the exposure.

First, **histogram analysis**. The software builds a histogram of the image's pixel values (how many pixels have each value) and compares it with an **expected histogram** for the selected **body part and projection**. It then rescales the values so the image has a consistent appearance.

Then a **look-up table** (LUT) maps each pixel value to a displayed **grey level**, giving the contrast expected for that body part. Adjusting brightness or contrast on screen temporarily changes this mapping.

That is why selecting the **correct body part and projection** matters: it chooses the histogram model and the LUT. A wrong selection, or poor **collimation** that lets unexpected values into the histogram, can process the image wrongly, giving poor contrast or a misleading appearance.

## Try this
- Look at the **raw data** at half and double exposure, then switch to **Processed**: the brightness is corrected.
- Select **Chest PA** for this limb: the wrong histogram model gives poor contrast.
- Choose an **open field**: the extra unattenuated beam misleads the histogram analysis.

## Key points
- Histogram analysis compares the image's pixel values with an expected histogram, then rescales them.
- A look-up table maps pixel values to displayed grey levels for that body part.
- Select the correct body part and projection, and collimate, or processing can go wrong.

# Windowing
id: windowing
summary: How window level and width change what you see, without changing the data or the dose.
areas: Windowing
diagram: windowing
status: draft
sources: 11-1 s37–39

**Windowing** changes how pixel values are shown on screen. It doesn't change the image data, and it doesn't change the dose.

The **window level** is the centre of the range of pixel values displayed, so it controls the overall **brightness** of the image.

The **window width** is the range of pixel values spread between black and white, so it controls **contrast**. A **narrow** window spreads a small range of values across all the greys: small differences between tissues look larger, so **contrast increases**. A **wide** window shows a larger range, with lower contrast.

## Try this
- Narrow the window width and watch the contrast rise; widen it and the image flattens.
- Move the window level and watch the brightness change while the histogram stays the same.
- Try the **Bone** and **Soft tissue** presets.

## Key points
- Windowing changes the display only: not the data, not the dose.
- Window level sets brightness; window width sets contrast.
- A narrower window gives higher contrast.

# Noise and detector efficiency
id: image-quality
summary: Why too few photons make a grainy image, and what DQE tells you.
areas: Image quality
diagram: noise-dqe
status: draft
sources: 11-1 s52–53; Modifying Exposure s4

Every image contains **noise**: random variation that isn't part of the anatomy. In X-ray imaging the main source is **quantum noise** (quantum mottle), from the random way photons arrive. The more photons the detector absorbs, the higher the **signal-to-noise ratio** (SNR) and the cleaner the image.

If the **mAs is too low**, too few photons reach the detector: a low SNR and a **grainy** image. Processing can fix the brightness, but it **can't create information** that never reached the detector, so fine detail is lost.

**Detective quantum efficiency** (DQE) measures how efficiently a detector turns the incoming X-rays into useful signal. A **higher DQE** means the same image quality with **less dose**.

## Try this
- Lower the dose: the brightness stays the same, but the image becomes grainy.
- Switch to the **lower DQE** detector at the same dose: fewer photons are used, so there is more noise.
- Press **Same image, other detector**: the higher-DQE detector needs half the dose.

## Key points
- Quantum noise falls as more photons reach the detector: a higher SNR.
- Too little mAs gives a grainy image that processing can't rescue.
- A higher DQE gives the same image quality for less dose.
