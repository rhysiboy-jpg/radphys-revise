<!--
Lessons for topic 6, Digital Image Formation. The README explains the format.
Wording follows the lecture slides and notes where it can (11-1, 10-4, 5-2); figures follow reference data.
-->

# Computed radiography (CR)
id: cr
summary: How a storage phosphor plate records an image, and how the reader converts it to a digital image.
areas: Computed radiography (CR)
diagram: detectors
status: draft
sources: 11-1 s10–13, s35; 5-2 s33

Detectors in general radiography are either **CR** (computed radiography) or **DR** (digital radiography). A CR system has a cassette and receptor plate, an image reader and an image display.

**Primary excitation.** X-ray photons are absorbed by the **phosphor** coating of the receptor plate. Electrons are trapped in intermediate energy levels. The number of trapped electrons is directly proportional to the amount of radiation absorbed by the phosphor. This is the **latent image**.

**Secondary excitation and photomultiplication.** The image reader converts the analogue information of the latent image to a digital format:

- The plate is scanned in a raster pattern by a finely focused **laser**.
- The laser gives the trapped electrons additional energy, which releases them. As they return to their resting state, electromagnetic energy is released in the form of **light**.
- The light is directed to a **photomultiplier tube**, which produces an electrical signal proportional to the light released.
- The electrical signal is amplified and sent to the digitiser, and the image is built up pixel by pixel and line by line.
- The plate is then exposed to a high-intensity lamp. The remaining trapped electrons return to their resting state, and the plate is ready for its next use.

CR processing makes **assumptions**: the area of interest is in the middle of the receptor; the smallest size of receptor has been used for the body part; the field has not been split, so there is only one exposure per receptor; collimation has been used; and the body part and projection selected match.

## Predict
After a CR plate has been read, what has to happen before it is used again?
- Nothing: it is ready straight away
- * It is exposed to a high-intensity light
- It is processed in chemicals
> Reading releases most of the trapped electrons but not all of them. A high-intensity light returns the rest to their resting state before the next exposure.

## Try this
- Choose **CR** and step through from the exposure to the plate being made ready for its next use.

## Key points
- X-ray photons are absorbed by the phosphor and electrons are trapped: the latent image.
- A laser releases the trapped electrons; the light released is converted to an electrical signal by a photomultiplier tube, then digitised.
- The plate is exposed to a high-intensity light and reused.
- Processing assumes a central, collimated area, one exposure per receptor, and the matching body part and projection.

# Digital radiography (DR)
id: dr
summary: Direct and indirect conversion detectors, and why their resolution differs.
areas: Digital radiography (DR)
diagram: detectors
status: draft
sources: 11-1 s18–21; 10-4 s7–8; 5-2 s36

A **DR** receptor has a similar form to a CR cassette, but holds more electronics, so there is no need for a separate image reader. It can be fixed in location, or mobile in wired or wireless form. There are two types.

**Indirect conversion** uses a **scintillator** layer and a light-sensitive TFT array:

- The scintillator is a phosphor: caesium iodide (CsI) or gadolinium oxysulphide (Gd₂O₂S). When it is exposed to X-rays, the energy from the beam is absorbed and converted to **light**.
- A thin layer of **amorphous silicon** (a-Si) is attached to the phosphor layer in a fixed matrix of pixels, each behaving as a photodiode. It converts the light into an electrical **charge**.
- The charge is read out through **thin-film transistors (TFTs)**, amplified and converted to a digital value for each pixel.

In an **unstructured** scintillator a large amount of the light produced scatters, which reduces the spatial resolution of the image. A **structured** scintillator, such as CsI, has the phosphor in needle-like structures, which reduces the amount of scattering and so increases the resolution.

**Direct conversion** uses an X-ray sensitive photoconductor, **amorphous selenium**, and a charge-collecting TFT array. Before the exposure an electrical field is applied across the selenium layer. The absorbed X-ray photons are converted directly into an electrical charge, proportional to the amount of radiation incident on the detector. The advantage of direct conversion is that no light is produced, so there is no scattering of light.

## Try this
- Compare **CR**, **indirect DR** and **direct DR**, and watch how far the signal spreads across the pixels.
- In indirect DR, change from structured CsI to unstructured Gd₂O₂S.

## Key points
- A DR receptor needs no separate image reader.
- Indirect conversion: a scintillator converts X-rays to light, amorphous silicon photodiodes convert the light to charge, and TFTs read it out. Structured CsI reduces the scattering of light.
- Direct conversion: amorphous selenium converts X-rays directly to charge. No light is produced, so there is no scattering of light.

# Digitisation
id: digitisation
summary: Sampling, quantisation, the matrix and bit depth.
areas: Digitisation
diagram: digitisation
status: draft
sources: 11-1 s20, s41–43; 10-4 s6

The electrical signal from the detector is continuously variable. It is converted into digital data in a two-step process: sampling and quantisation.

**Sampling** decides the matrix size. The sampling frequency must give enough samples per horizontal line to replicate the original analogue signal faithfully.

**Quantisation** assigns a grey-scale value to each pixel, based on the intensity of the electrical signal.

A digital image is displayed as a combination of rows and columns known as the **matrix**. The smallest component of the matrix is the **pixel** (picture element). The location of each pixel corresponds to a volume of tissue within the patient, referred to as a **voxel**.

- For a given field of view, a **larger matrix** includes a greater number of smaller pixels, so more detail can be shown.
- Each pixel is assigned a numeric value that represents a shade of grey, based on the attenuation characteristics of the volume of tissue imaged. The **bit depth** sets how many values, and so how many shades of grey, are available.

If the sampling frequency is **too low**, the result is **aliasing**: the loss of important high-spatial-frequency information, and the introduction of false lower-frequency data.

## Predict
Halve the number of pixels across the same field of view. What happens to each pixel?
- It becomes smaller
- * It becomes larger, so fine detail is lost
- It stays the same size
> For a given field of view, a smaller matrix has fewer, larger pixels, so less detail can be shown.

## Try this
- Reduce the **pixels across**: edges become stepped and fine detail disappears.
- Reduce the **bit depth** to 2 bits: smooth changes become bands of grey.
- Choose the **bar pattern** and sample coarsely: the finest stripes become false, wider stripes. This is aliasing.

## Key points
- Sampling decides the matrix; quantisation assigns each pixel a grey-scale value.
- For a given field of view, a larger matrix includes a greater number of smaller pixels.
- Bit depth sets the number of shades of grey.
- Too low a sampling frequency causes aliasing: lost detail and false data.

# Image processing
id: processing
summary: How segmentation, histogram analysis and look-up tables give a consistent image.
areas: Image processing
diagram: processing
status: draft
sources: 11-1 s29–36

An advantage of digital radiography is its wider **dynamic range**: it produces a diagnostic image within a wider range of exposures.

Processing is broadly the same for all digital imaging. Each pixel is given a **pixel value**, dependent on the amount of light or charge produced at that point. The processing software uses these values to form the image, in two processes.

**Segmentation** separates the image into distinct areas containing pixels of similar value.

**Histogram analysis.** The pixel values form a histogram: the x-axis represents the amount of exposure and the y-axis the number of pixels at each exposure level. The software has **histogram models** for each anatomical region, each with a shape characteristic of the selected region and projection. The **values of interest** are what the software "expects" to see. **Automatic rescaling** maps the raw data histogram onto the model, which maintains a consistent image whether it is under- or over-exposed.

A **look-up table (LUT)**, specific to the body part, then gives each pixel value a grey-scale value. Altering the contrast or brightness on screen temporarily alters this.

The software assumes that collimation has been used and that the body part and projection selected match the examination. If they do not, the image can be processed wrongly, giving poor contrast or a misleading appearance.

## Predict
An image is taken at double the usual exposure. After processing, how does it look?
- Twice as dark
- * About the same brightness
- Twice as light
> Automatic rescaling maps the pixel values onto the histogram model, so the brightness is corrected. The exposure index, not the appearance of the image, shows that the exposure was too high.

## Try this
- Look at the **raw data** at half and double exposure, then change to **Processed**: the brightness is corrected.
- Select **Chest PA** for this limb: the wrong histogram model gives poor contrast.
- Choose an **open field**: the unattenuated beam around the limb misleads the histogram analysis.

## Key points
- Each pixel is given a pixel value; segmentation and histogram analysis use these to form the image.
- Histogram analysis compares the image with a model for the selected body part and projection, and rescales it.
- A look-up table, specific to the body part, gives each pixel value a grey-scale value.
- Select the matching body part and projection, and collimate, or the image can be processed wrongly.

# Windowing
id: windowing
summary: How window level and width change what you see, without changing the data or the dose.
areas: Windowing
diagram: windowing
status: draft
sources: 11-1 s37–39

**Windowing** changes how the pixel values are displayed. It does not change the image data, and it does not change the dose.

The **window level** is the centre, or midpoint, of the range of pixel values displayed. Increasing the window level increases the image **brightness**. In this convention the pixel value for air is high and the value for bone is lower.

The **window width** is the range of pixel values displayed between black and white. A **narrow** (decreased) window width increases the image **contrast**. A **wide** window displays a larger range of values, with lower contrast.

Together, the midpoint and the width of the window set the brightness and contrast of the displayed image.

## Predict
Narrow the window width. What happens to the contrast?
- It decreases
- * It increases
- It stays the same
> A narrower range of pixel values is displayed between white and black, so small differences become larger steps of grey. Values outside the window are displayed as white or black.

## Try this
- Narrow the window width and watch the contrast increase; widen it and the contrast decreases.
- Move the window level and watch the brightness change while the histogram stays the same.
- Try the **Bone** and **Soft tissue** presets.

## Key points
- Windowing changes the display only: not the data, and not the dose.
- Increasing the window level increases the brightness; the window width sets the contrast.
- A narrow window width increases the contrast.

# Noise and detector efficiency
id: image-quality
summary: Why too few photons give a grainy image, and what DQE tells you.
areas: Image quality
diagram: noise-dqe
status: draft
sources: 11-1 s52–53; Modifying Exposure s4

The **signal-to-noise ratio (SNR)** is a measure of the true signal, reflecting the actual anatomy, against the noise, such as random **quantum mottle**. A lower signal-to-noise ratio generally results in a grainy appearance to the image.

In radiography, the larger the number of photons absorbed, the greater the SNR and the less noisy the image. The choice of **mAs** is therefore vital in all types of digital imaging. If too little information reaches the detector, processing can correct the brightness but **will not** rescue the image: fine detail is lost.

**Detective quantum efficiency (DQE)** is a fundamental physical variable related to image quality. It refers to the efficiency of a detector in converting incident X-ray energy into an image signal. A **high DQE** indicates that less radiation is needed to achieve identical image quality.

## Predict
Halve the dose. After processing, how does the image look?
- Darker
- * The same brightness, but grainier
- Exactly the same
> Processing corrects the brightness, but fewer photons absorbed means a lower signal-to-noise ratio. The SNR follows the square root of the number of photons, so halving them lowers it by about 30%.

## Try this
- Lower the dose: the brightness stays the same, but the image becomes grainy.
- Change to the **lower DQE** detector at the same dose: fewer photons are used, so there is more noise.
- Press **Same image, other detector**: the higher-DQE detector needs half the dose.

## Key points
- The larger the number of photons absorbed, the greater the SNR and the less noisy the image.
- Too little mAs gives a grainy image that processing will not rescue.
- A high DQE means less radiation is needed for identical image quality.
