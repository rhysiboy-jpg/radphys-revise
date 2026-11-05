# RadPhys Revise — agreed plan

Confirmed with Rhys Morris, 29 October 2026.

## Purpose and users
- Revision app for Rhys Morris's first-year BSc Diagnostic Radiography cohort (Bangor University).
- Covers the physics and radiation protection strand of **RDR-1173 Applied Imaging Science 1**. Health informatics is out of scope.
- Target: the end-of-year physics exam (May, 1.5 h, mixed question formats).
- Rhys Morris is the academic owner and approves all content. Claude builds the app.

## Content
- Source material: Rhys's first-year physics lecture slides (supplied 30 October 2026). Questions follow the lectures in scope but always use correct reference data; Rhys is correcting the slides themselves.
- Topics, shown in the app in teaching order (agreed 30 October 2026):
  1. Atomic Structure & EM Radiation (lectures 2-2, 3-1 units, 3-2 energy and EM)
  2. Electricity & X-ray Circuits (5-1, 5-3)
  3. X-ray Production & the X-ray Tube (5-2, 8-1, 10-1 spectrum)
  4. Effects of Radiation (9-1)
  5. Interactions with Matter (10-2)
  6. Digital Image Formation (10-4, 11-1)
  7. Exposure & Image Quality (Exposure, Modifying Exposure)
  8. Dosimetry & Dose Control (12-2)
  9. Radiation Protection & Legislation (Medico-legal; IR(ME)R 2017, IRR17, ALARP, inverse square law)
  10. Radioactivity (12-1)
  11. QA & QC (11-5, 24-1)
- Binding energies use reference data (the L3 and M5 sub-shells behind the main lines). The app notes that lecture tables quote slightly different, averaged L and M values.
- Maths: nothing harder than the inverse square law. Randomised numeric questions only for the inverse square law, the mAs–distance rule (mAs₂ = mAs₁ × (d₂/d₁)²), and doubling/halving (including HVLs). The 15% kVp rule is conceptual only.
- Terminology follows Ball & Moores, *Essential Physics for Radiographers* (UK usage). Tube voltage is written kVp (Rhys, 30 October 2026); kV stays only as the unit of potential difference, e.g. in defining the electron-volt. Johnston & Fauber is secondary.
- About 25 approved questions per topic: around 18 MCQs, 5 self-marked written, and up to 5 calculation templates.
- Workflow: Claude drafts questions into a spreadsheet, one topic at a time, with a `source` column naming the lecture and slide (e.g. "10-2 s25") so Rhys can check each against his slides. Rhys sets Status (draft / approved / rejected) and adds comments. Only approved rows go live. Claude writes the calculation templates and Rhys reviews them on a preview page.

## App
- **Explore** (interactive diagrams) and **Practise** (10-question sets per topic or mixed).
- Immediate feedback, worked solutions, and an explanation for each wrong option. Written answers are self-marked against a model answer and a marking-point checklist.
- Mastery bar per topic. Questions answered wrongly come back more often. Timed exam mode arrives in April–May.
- Diagrams: Bohr atom (reused across the others), X-ray tube explorer, electron–target interactions, spectrum explorer (kVp/mA/filtration), photoelectric vs Compton, inverse square law visualiser.
  - 2D schematics, correct in trends, labelled "not to scale".
  - Rhys signs off each one before release.
- No login. Students land on topic selection with a note that progress is saved on this device only, plus a reset button.

## Technical and policy
- Mobile-friendly web app, installable to the home screen and usable offline (PWA).
- Hosted on GitHub Pages under Rhys's account, with the link posted on Blackboard.
- No data collection. Student feedback goes to a Microsoft Form in Rhys's Bangor account.
- WCAG 2.2 AA: keyboard controls, captions for each diagram step, reduced-motion support, no meaning carried by colour alone.
- English at launch and built to take Welsh. Check with Canolfan Bedwyr whether Welsh is required at launch.
- Neutral branding: "RadPhys Revise", footer "Created by Rhys Morris". No university logo. Check IP with line manager.

## Interactives to build (build order; each sits in its topic in the app)
1. Exposure console (topic 7): set kVp, mAs, focal spot, grid and distance; a stylised phantom drawn in the diagram style (or playfully cartoony) shows contrast, noise and sharpness changing, with EI and dose. Includes the "What do I do?" EI scenarios, the "Higher or lower?" dose exercise and the 15% rule. No real patient images.
2. Windowing explorer (topic 6): window level and width, LUT, histogram.
3. Dose ladder (topic 8): typical effective doses as background-radiation days and risk, for explaining to patients; stochastic vs deterministic sorter.
4. Radioactivity (topic 10): half-life simulator; decay builder (α, β⁻, β⁺, γ and ⁹⁹ᵐTc).
5. Circuits (topic 2): transformer turns ratio; rectification waveforms.
6. Detectors (topic 6): CR vs DR, direct vs indirect.
7. Focal spot and geometry (topic 7): penumbra, ORD and FRD.
8. QA checker (topic 11): measurement against IPEM 91 remedial and suspension levels.
- Upgrades to existing diagrams: electron–target shows the lectures' four interactions (outer excitation, outer ionisation, inner ionisation, braking) and Auger electrons; spectrum adds target material (W/Mo), generator type and quantity vs quality readouts; photoelectric vs Compton adds coherent scatter and an attenuation/K-edge view.
- New question types: label the diagram, put in order, match, image critique (EI scenarios).

## Timeline
- Done (October 2026): tube and spectrum explorers signed off, Atomic structure question bank approved, Bangor restyle, remaining four diagrams built and signed off.
- Phase 1 (November 2026): align numbers with the lectures where reference data agrees; topic 1 additions; question banks for topics 2–11, one topic at a time.
- Phase 2 (December 2026 – January 2027): diagram upgrades and new question types.
- Early February 2027: pilot with every topic taught so far (questions for all of them) and the six existing diagrams. Interactives arrive through the spring, steered by student feedback.
- Phase 3 (February – March 2027): the new interactives, in the build order above.
- April–May 2027: fixes and exam practice mode.

## Status (30 October 2026)
- Done:
  - Diagram style signed off (anode angle corrected to about 15°).
  - App shell built: home, Explore, Practise, mastery tracking, offline support.
  - Atomic structure question bank: 18 MCQs and 5 written, all approved by Rhys.
  - 5 calculation templates, all approved by Rhys.
  - Code saved to the private GitHub repo `rhysiboy-jpg/radphys-revise`.
  - Restyled to Bangor University branding (Figtree and Noto Sans, Bangor red and Sun, no logos). Diagram labels checked by Rhys after the restyle.
  - All six diagrams built. The four new ones (Bohr atom, electron–target interactions, photoelectric vs Compton, inverse square law) appear only in review mode, marked "Awaiting sign-off", until approved.
- Diagram sign-off: each diagram has `"approved"` in `content/topics.json`. Rhys reviews them on `prototypes/diagrams.html` (a checklist per diagram); only approved diagrams reach students.
- Signed off by Rhys (30 October 2026): Bohr atom, electron–target interactions, photoelectric vs Compton, inverse square law. All six pilot diagrams are now approved.
- Offline support is now network-first: online visitors always get the latest files; saved copies are used only offline.
- Review notes: Rhys checks the app locally (`tools/serve.ps1`, http://localhost:8080) and logs notes as GitHub Issues using the "Review note" form (label `note`, plus `physics`, `wording`, `layout`, `bug` or `enhancement`). Claude works through open notes and closes each with a comment saying what changed.
- Phase 1 progress (30 October 2026):
  - Topics restructured to the eleven above, in teaching order; planned interactives show as "Coming soon".
  - Tube explorer aligned with the lectures (filament about 5 A at 12 V; 3,000 or 9,000 rpm; inherent filtration about 1 mm Al). Bohr atom notes the lecture-table L and M values.
  - Approved by Rhys: topic 1 additions (units, energy, shell capacity, isotopes, visible range, wave–particle duality, binding energy written) and the topic 3 bank in `content/03-x-ray-production.csv`. Topic 1 now has 32 questions, topic 3 has 24.
  - No calculation questions in the banks (Rhys, 30 October 2026): the drafted unit conversion (AS-20) and kVp² output ratio (XP-19) were removed; AS-24 asks for the M shell's capacity as recall. The randomised calculation templates (inverse square law, HVL) are separate and unchanged.
  - Drafted for review: topic 2 bank EC-01 to EC-20 and EC-W1 to EC-W5 in `content/02-electricity-circuits.csv` (charge, conductors, potential difference, current, Ohm's law, resistance, AC/DC, transformers, rectification, three-phase, the three circuits). Conceptual only, no calculations.
  - Drafted for review: topic 4 bank EF-01 to EF-20 and EF-W1 to EF-W5 in `content/04-effects-of-radiation.csv` (ionisation in cells, stochastic and deterministic effects, radiosensitivity, genetic and somatic effects, risk and benefit, ALARP). Deterministic doses given in Gy (slide table uses Sv); departmental protocols attributed to IR(ME)R 2017 (slide says IRR17).
  - Drafted for review: topic 5 bank IM-01 to IM-20 and IM-W1 to IM-W5 in `content/05-interactions-with-matter.csv` (transmission, absorption and scatter; photoelectric, Compton, coherent, pair production; attenuation coefficients; K-edges and iodine; contrast and kVp). Compton taught with electron and photon leaving in different directions, and probability falling slowly with energy (slides 23 and 25 differ).
  - Drafted for review: topic 6 bank DI-01 to DI-20 and DI-W1 to DI-W5 in `content/06-digital-image-formation.csv` (CR read-out, direct and indirect DR, structured scintillators, sampling, quantisation and aliasing, bit depth and matrix, histogram analysis, LUTs, windowing, SNR and DQE). Window level is tested as controlling brightness, not the direction of change (slide 37's direction depends on the system's pixel-value convention).
  - Drafted for review: topic 7 bank EX-01 to EX-20 and EX-W1 to EX-W5 in `content/07-exposure-image-quality.csv` (mAs and kVp, the 15% rule as a concept, contrast, noise, over-exposure and ALARP, focal spot and ORD, grids, AEC, exposure index and the "What do I do?" scenarios). EI questions say "above or below the target range", because EI scales differ between manufacturers.
  - Drafted for review: topic 8 bank DO-01 to DO-20 and DO-W1 to DO-W5 in `content/08-dosimetry-dose-control.csv` (absorbed, equivalent and effective dose; weighting factors; ESD, DAP and DRLs; ionisation chambers, GM tubes, film badges, TLDs and electronic dosimeters; controlling and explaining dose). Monitoring follows IRR17 classification (over 6 mSv a year) rather than the slide's 10% rule; unintended exposures are notified to HIW in Wales or the CQC in England.
  - Drafted for review: topic 9 bank RP-01 to RP-20 and RP-W1 to RP-W5 in `content/09-radiation-protection-legislation.csv` (IR(ME)R 2017 and IRR17, enforcement, data protection, negligence and vicarious liability, consent, duty holders, justification and pregnancy enquiries, dose limits, designated areas, RPA and RPS, pregnant staff, time, distance and shielding, lead equivalence). Consent is attributed to common law and professional standards, with IR(ME)R requiring information on benefits and risks (slide 32 attributes consent to IR(ME)R). Routine patient contact shielding follows the 2020 UK guidance, which no longer recommends it (slide 21 does).
  - Drafted for review: topic 10 bank RA-01 to RA-20 and RA-W1 to RA-W5 in `content/10-radioactivity.csv` (isotopes, nuclear stability, activity, half-life as a concept, alpha, beta-minus, beta-plus, annihilation, electron capture, gamma and technetium-99m). Annihilation gives two 511 keV photons (slide 35 differs); electron capture emits a neutrino and characteristic X-rays (slide 34 gives a gamma ray).
  - Drafted for review: topic 11 bank QA-01 to QA-20 and QA-W1 to QA-W5 in `content/11-qa-qc.csv` (QA vs QC, the WHO aim, legal basis, acceptance, commissioning and routine testing, IPEM 91 remedial and suspension levels, records, light beam, output, kVp, AEC, guard timer, focal spot, resolution, low contrast and uniformity). IPEM 91 tolerances are not tested as numbers. AEC testing uses the detector dose indicator (slides describe film and optical density).
  - Tube voltage is written kVp throughout the banks (Rhys, 30 October 2026). AS-17 and XP-12 keep kV, where it is the unit of potential difference that defines the electron-volt.
  - Diagrams (30 October 2026): tube voltage reads kVp on screen; labels inside diagrams are plain ink, not coloured bold; dark-mode colours lifted and checked for contrast; diagram text never below 11px on screen, with shorter phone labels on the side-by-side diagrams. These are changes to signed-off diagrams, for Rhys to recheck.
  - Interactive 1 built, awaiting sign-off (review mode only): the exposure console (`js/diagrams/console.js`, topic 7). Hand, knee and pelvis presets; kVp, mAs, FRD, focal spot and grid; a simulated image of a stylised limb (no patient images) showing brightness, contrast, noise and sharpness; EI against an illustrative 240–380 range; patient dose relative to the suggested setting (∝ kVp² × mAs, which matches the "Higher or lower?" slide doses to within 8%); exposure time; a 15% rule button; and the five "What do I do?" scenarios from the Exposure lecture, slides 30–34. "Higher or lower?" (Modifying Exposure, slides 8–10): seven pelvis rounds, the lecture's three doses first, then doses estimated from kVp² × mAs calibrated to them; written as entrance surface dose (the slides say "SD"). The limb is a cartoon dog bone (Rhys, 30 October 2026), shared with the windowing explorer in `js/diagrams/limb.js`.
  - Interactive 2 built, awaiting sign-off (review mode only): the windowing explorer (`js/diagrams/windowing.js`, topic 6). The cartoon limb as 12-bit pixel values; window level and width sliders; Full range, Bone and Soft tissue presets; the histogram (unchanged by windowing), the window band and the LUT drawn over it with a grey strip; tap the image to read a pixel value. Follows slide 37's convention: pixel value follows exposure (air high, bone low), so raising the level brightens the image.
  - Interactive 3 built, awaiting sign-off (review mode only): the dose ladder (`js/diagrams/dose.js`, topic 8). UKHSA "Patient dose information: guidance" (updated 28 September 2026), the same table as the Dose lecture, slide 47, plus the nuclear medicine table: each examination's typical effective dose on a log-scale bar, the equivalent period of natural background and the lifetime risk of fatal cancer, with comparison rows for a year of UK background (now 2.1 mSv; it was 2.2) and the IRR17 public (1 mSv) and employee (20 mSv) limits. Tap a row for a plain-language explanation for a patient; the age setting applies UKHSA's footnote (risk about ×2 for children, ÷5 over 70). No risk category words, as UKHSA no longer uses them.
  - The stochastic vs deterministic sorter went to topic 4 (Effects of Radiation), where the Cellular Effects lecture teaches it, not topic 8 (`js/diagrams/sorter.js`, awaiting sign-off): 13 cards to file, each with an explanation.
  - Interactive 4 built as two, awaiting sign-off (review mode only), topic 10. Half-life (`js/diagrams/halflife.js`): a sample of 400 or 36 nuclei decays at random beside a graph of the number left against (½)ⁿ; Tc-99m (6.0 h), Mo-99 (66 h), F-18 (110 min) and I-131 (8.0 days); activity falls from an illustrative 400 MBq. Decay builder (`js/diagrams/decay.js`): set the daughter's A and Z for alpha (Ra-226), beta-minus (I-131), beta-plus (F-18), electron capture (I-123) and gamma from a metastable state (Tc-99m), then check; a drawing and equation for each. Beta-plus shows annihilation into two 511 keV photons in opposite directions, and electron capture emits a neutrino and characteristic X-rays (slides 34–35 differ, as already noted for the RA bank).
  - Diagram text fix (31 October 2026): every SVG label had a thin glass-coloured outline, because the atom shells' `.shell` style also matched the app's page frame (`div.shell`) and SVG text inherits stroke. Now `circle.shell` only, and diagram text never takes a stroke.
  - Interactive 5 built as two, awaiting sign-off (review mode only), topic 2. Transformer (`js/diagrams/transformer.js`): iron core with primary and secondary windings; turns ratio from 1 : 50 to 1000 : 1 and the primary voltage (the autotransformer); Filament (1 : 20, about 12 V) and High voltage (500 : 1, about 115 kV) presets; voltage up, current down, power unchanged. Rectification (`js/diagrams/rectification.js`): AC, half-wave, full-wave, three-phase six- and twelve-pulse and high-frequency waveforms over two 50 Hz cycles, with ripple worked out from the waveform (100%, 100%, 13%, 3.4%, about 1%). High-frequency and twelve-pulse go beyond the slides.
  - Interactive 6 built, awaiting sign-off (review mode only): CR and DR detectors (`js/diagrams/detectors.js`, topic 6). Step through CR (latent image, laser read-out, photomultiplier, digitising, erasing), indirect DR (scintillator, light spread, a-Si photodiodes, TFT read-out; structured CsI or unstructured Gd₂O₂S) and direct DR (field across a-Se, X-rays to charge, straight drift, TFT read-out). A row of pixels shows how the signal spreads: central pixel about 97% direct, 57% CsI, 36% CR, 22% Gd₂O₂S (illustrative, in the right order). Written as amorphous silicon and oxysulphide (slide 19 has "silicone" and "oxisulphide"); erasing is "bright light" (the slide names a sodium discharge lamp).
  - Light/dark switch (31 October 2026): Auto, Light and Dark in the sidebar footer (in the menu on a phone), kept on the device and applied before first paint.
  - Interactive 7 built, awaiting sign-off (review mode only): focal spot and geometry (`js/diagrams/geometry.js`, topic 7). Rays from both edges of a fine (0.6 mm) or broad (1.2 mm) focal spot pass a 40 mm object and land on the detector, showing umbra and penumbra; ORD 0–30 cm and FRD 90–180 cm (the tube moves, the detector stays). Readouts: penumbra = focal spot × ORD ÷ (FRD − ORD), magnification = FRD ÷ (FRD − ORD), and the mAs change for the FRD (inverse square law). The focal spot is drawn 30 times larger so the penumbra shows.
  - Interactive 8 built, awaiting sign-off (review mode only): the QA checker (`js/diagrams/qa.js`, topic 11). Twelve tests, each with its method and how often it is done; move the measured result along a bar of Within / Remedial / Suspend, or use "Test me" for random results to classify. kVp uses "±5% or 5 kV, whichever is greater" (and 10%/10 kV) at a chosen set kVp; the image-quality tests show no suspension level. Levels are exactly as the QA and QC lecture gives them, citing IPEM Report 91; they could not be checked against the report itself (not freely available), so Rhys to confirm. AEC consistency is left out, because its slide gives two remedial levels (baseline ±30%, mean ±20%).
- All eight planned interactives are built (as eleven pieces). Waiting on Rhys: review of the topic 2 and 4–11 drafts (225 questions), and sign-off of the exposure console, windowing explorer, dose ladder, sorter, half-life, decay builder, transformer, rectification, detectors, geometry and QA checker. Every topic now has questions.
- Upgrade 1 done, back to awaiting sign-off: electron–target interactions now shows the lecture's four, numbered as on the slides: 1 outer excitation and 2 outer ionisation (both heat, now separate), 3 inner ionisation and 4 braking. Inner ionisation offers the Auger alternative: the excess energy throws out an outer electron (roughly 48 keV, KLL) instead of a 59.3 keV photon. Reference: tungsten's K-shell fluorescence yield is about 0.95, so a photon about 95% of the time and an Auger electron about 5%.
  - Added at Rhys's request (4 November 2026): the cascade after Kα. The L-to-K drop leaves a gap in the L shell; an M-shell electron fills it and gives a weak L-line photon, 10.2 − 1.8 ≈ 8.4 keV (tungsten Lα, L3 − M5), absorbed by the tube window and filtration, which is why only K-lines show in the beam. The gap ends in the M shell. The Kα photon now ends a little higher so its label clears the outer-shell note on a phone.
- Upgrade 2 done, back to awaiting sign-off: the X-ray spectrum.
  - Target: tungsten (Z 74; Kα 59.3, Kβ 67.2 keV above 69.5 kVp) or molybdenum (Z 42; Kα 17.5, Kβ 19.6 keV above 20.0 kVp). Bremsstrahlung scales with Z: molybdenum gives about 0.6 of tungsten's quantity at the same settings.
  - Generator: high-frequency, three-phase 12- and 6-pulse, single-phase full- and half-wave; the spectrum is averaged over the voltage waveform (quantity ×0.98, ×0.90, ×0.43, ×0.22 of high-frequency, with lower mean energy). Beyond the slides.
  - Filter: aluminium 0–6 mm, or 0.03 mm molybdenum (approximate NIST XCOM attenuation, K-edge at 20.0 keV). Presets: General radiography (W, 80 kVp, 200 mA, 2.5 mm Al) and Mammography (Mo target and filter, 28 kVp; mean about 16 keV). The molybdenum filter and the mammography preset go beyond the slides.
  - Readouts: quantity as the area under the curve against the general-radiography reference, and quality as the mean photon energy (the lecture's definitions); a pinned beam gives "quantity × n, quality higher / lower / unchanged".
  - Slide difference: "Intensity (Quality) ∝ kVp²" is written as quantity ∝ kVp², matching the lecture's own definition of quantity. The app also notes that after filtration the quantity rises faster than kVp² (60 → 85 kVp gives about ×2.6).
- Upgrade 3 done, back to awaiting sign-off: photoelectric vs Compton, renamed "Interactions and attenuation" (`js/diagrams/pecompton.js`, data in `js/diagrams/xcom.js`).
  - Interactions view: the right-hand panel switches between Compton and coherent (unmodified) scatter. Coherent: the whole atom takes up the photon, its electrons vibrate together, and a photon of the same energy leaves at a small angle (drawn at 20°); no electron freed, no ionisation.
  - "Which is more likely?" now uses NIST XCOM reference data (downloaded 4 November 2026; ICRU-44 soft tissue and cortical bone, iodine, lead) and shows three shares: photoelectric, Compton and coherent. Soft tissue crosses from photoelectric to Compton at about 27 keV (was about 25 from the Z³/E³ rule), bone at about 55 keV (was about 47). The K-edges now show: iodine jumps above 33.2 keV, lead above 88.0 keV. Coherent is about 7–13% in soft tissue.
  - Attenuation view: log-log graph of mass attenuation coefficient (cm²/g) from 20 to 150 keV for soft tissue, bone, iodine and lead, with the iodine (33.2 keV, attenuation ×5.5 across the edge) and lead (88.0 keV, ×4.0) K-edges marked; the photon energy is shared with the interactions view. "Split into parts" shows one material's photoelectric, Compton and coherent curves. Readouts compare bone, iodine and lead with soft tissue per gram; the summary explains falling bone contrast with energy, iodine contrast just above 33 keV, and lead's K-edge.
  - At exactly a K-edge energy (88 keV for lead) the photon is treated as just below the edge, as in the XCOM data.
- New question types built (4 November 2026), with 24 drafts for review (six of each, all `draft`, so review mode only). Written up for authors in README.md.
  - Put in order (`order`): steps in `items` in the right order, shown shuffled; moved with up and down buttons (keyboard and screen reader friendly; no drag-and-drop). Drafts: AS-O1 (EM spectrum by energy), XP-O1 (one exposure, prep to beam), DI-O1 (CR), DI-O2 (indirect DR), EF-O1 (indirect action in a cell), DO-O1 (six examinations by UKHSA effective dose).
  - Match (`match`): `left = right` pairs in `items`, a drop-down per row, optional wrong answers in `spares`. Drafts: IM-M1 (interactions), DO-M1 (quantities and units), RP-M1 (IR(ME)R duty holders, with the RPA as the spare), RA-M1 (decay types; electron capture gives a neutrino and characteristic X-rays), DI-M1 (CR, indirect and direct DR), EC-M1 (X-ray circuit parts).
  - Label the diagram (`label`): six static figures in `js/figures.js` (tube, atom, spectrum, dr, geometry, transformer), numbered markers and a drop-down per number. The tube figure is the tube explorer's drawing; the spectrum figure draws the K-lines taller than the model so they can be labelled (heights noted as schematic). Drafts: XP-L1, AS-L1 (sodium, 2.8.1), XP-L2, DI-L1, EX-L1, EC-L1.
  - Image critique (`critique`): a single-best-answer question with a simulated image from the exposure console's model and cartoon limb (`js/critique.js`), settings in `figure`. Drafts EX-C1 to EX-C6: hand over-exposed (EI 900), knee under-exposed (EI 75, grainy), knee kVp too high (EI in range, low contrast), pelvis without its grid (EI in range, flat), knee movement blur (image only, no settings), pelvis kVp too low (EI in range, light, 1.6 × dose).
  - Marking: order, match and label score each part (for example 4 of 6 = 0.67); 70% or more counts as right for the "comes back sooner" boxes. The set list and results show "4 of 6 right"; opening a result shows the student's answer against the right one.
- Topic 4 interactives (4 November 2026, at Rhys's request, from the Cellular Effects of Radiation lecture), all awaiting sign-off:
  - Inside the cell (`cell.js`, slides 5–7): step through ionisation, free radicals (about 10⁻¹¹ s), recombination or DNA damage by indirect action (about two-thirds of X-ray DNA damage) or direct action, then repair, cell death or a surviving mutation. "Fire 1,000 photons" tallies outcomes at random; the proportions (98.8%, 1.1%, 0.1%) are illustrative, labelled as such.
  - May or will? (`doseresponse.js`, slides 8–9, 17–19): one dose drives four graphs (chance and severity, stochastic and deterministic), with a "predict first" mode. Stochastic risk about 5% per Sv (UKHSA's basis; not shown above 1 Sv). Deterministic: the lecture's whole-body table in Gy (slide 18 uses Sv), skin from ICRP 85 (2, 3, 6, 7, 10, 15 Gy), lens 0.5 Gy (ICRP 118).
  - One in a million (`population.js`, slides 11–12): up to a million people at one dose; expected fatal cancers at about 5% per Sv light up at random. Slide 12's leukaemia example (2 × 10⁻³ per Sv, 40 in a million at 20 mSv) is its own preset; that risk factor couldn't be verified against ICRP 103, so Rhys to confirm. 20 mSv is about 1,000 chest X-rays at UKHSA's 0.02 mSv (slide 12 says 400). Optional background: about 1 in 4 UK deaths are from cancer (Cancer Research UK).
  - Which tissues matter most? (`tissues.js`, slides 13 and 27): cartoon body with ICRP 103 tissue weighting factors; explore, put an area in the beam (chest 0.42 against a knee 0.02), or rank four organs.
  - Justify it? (`justify.js`, slides 21–26, 33, 37): eight requests (scaphoid, back pain without red flags per NICE NG59, ?gallstones to ultrasound, blank clinical details, recent repeat, pregnancy enquiry, ?pneumonia, asymptomatic full-body CT). Teaching examples that need Rhys's clinical sign-off.
  - What can we do? (`dosechoices.js`, slides 28–37): AP pelvis choices move a dose meter from UKHSA's 0.7 mSv (collimation ×1.4 open, 15% rule ×0.66, large build ×2, repeat ×2; illustrative except the kVp rule), then sort eleven factors by who controls them. Written protocols attributed to IR(ME)R 2017 (slide 36 says IRR17).
  - Slide 2 says about 11% of the UK population's dose is medical; UKHSA's RIFE summaries (2023, 2024) give 16%. Not used in the app, noted for the slides.
- Lesson pages, piloted on topic 3 (4 November 2026, at Rhys's request: clearer separation within topics, more explanation than the diagrams alone). A topic with lessons opens on a contents page (lessons in order, ticked once visited on the device, "Start the lessons" / "Continue"); each lesson page has the explanation, the interactive with "Try this", key points, "Check yourself" links to practise its question areas, and Previous / Next. Question feedback links to the lesson for its area. Lessons live in one editable text file per topic (`content/lessons/03-x-ray-production.md`, format in README.md), drafts in review mode only. Topic 3's six drafts, written from the approved topic 3 bank and its slide references: the X-ray tube; thermionic emission; what happens in the anode; Bremsstrahlung and characteristic radiation; the X-ray spectrum; filtration.
- Lessons rolled out to all eleven topics (4 November 2026, at Rhys's request after the topic 3 pilot): 63 draft lessons in `content/lessons/`, one file per topic, written from each topic's question bank and its slide references, covering every question area. Topic 1: 6 lessons; 2: 5; 3: 6; 4: 7 (one per interactive); 5: 5; 6: 6; 7: 6; 8: 6; 9: 6; 10: 5; 11: 5. Interactives from other topics are reused where they teach the point (topic 8 uses the tissue map and dose choices; topic 9 uses Justify it?). Slide differences already recorded for the banks are stated in the lessons where they matter (annihilation and electron capture in topic 10; personal monitoring classification in topic 8; patient contact shielding in topic 9; AEC testing in topic 11).
- Interactives for every text-only lesson (4 November 2026, at Rhys's request): 19 new diagrams, all `approved: false`, so every lesson now has one.
  - Topic 1: the electronvolt (with unit prefixes); the EM spectrum.
  - Topic 2: charges, conductors and insulators; an Ohm's law circuit; the X-ray circuit as a block diagram.
  - Topic 6: sampling and quantisation (with aliasing); histogram analysis and the LUT; quantum noise and DQE.
  - Topic 7: an AEC simulator (chambers, patient build, metal, guard timer).
  - Topic 8: ESD and DAP; gas-filled detector regions; film badge and TLD.
  - Topic 9: which law (sorter); the duty holders journey; the X-ray room under IRR17; consent scenarios.
  - Topic 10: a chart of nuclides with decay prediction.
  - Topic 11: QA or QC (sorter); the equipment life cycle.
  - The sorters share `js/diagrams/sortkit.js`.
  - Illustrative, not reference data (labelled as such on screen): DQE 0.6 and 0.3; AEC transmissions and guard-timer limit; the DAP reference level (1.5 Gy cm², not a national DRL); film badge darkening; the TLD glow curve; the processing model's percentiles.
  - Reference values used: 1 eV = 1.6 × 10⁻¹⁹ J; ionisation from about 10 eV; filament about 12 V, 5 A (as in the tube diagram); IRR17 limits of 20 mSv and 1 mSv, classification above 6 mSv, fetus 1 mSv after written notification; IPEM 91 output consistency levels of ±20% and ±50% (as in the QA checker); Z, N and decay mode for each nuclide.
  - Need clinical or legal sign-off: the consent scenarios; the duty holders journey (it counts clinical evaluation as an operator task); the IRR17 room (designation is the employer's decision, with RPA advice; carers and comforters come under IR(ME)R).
- Six improvements from an outside review (4 November 2026, at Rhys's request). Three other suggestions from that review were already built: the expandable results review, the theme switch, and retrying missed questions.
  - **Content checker:** `node tools/validate.mjs` checks the content, the diagram registry and the offline file list. It found `sortkit.js` missing from the offline list on its first run.
  - **Phone menu:** closes on any link (including one to the current page) and on Escape.
  - **Keyboard in practice:** number keys pick an option by its position (not A–D, because options are shuffled), Enter checks, and Enter on the feedback moves on. A hint shows only on devices with a mouse.
  - **Progress backup:** a file saved and loaded from Home, merged so newer work on the device is kept. Nothing goes to a server.
  - **Offline copy:** spreadsheets and lessons are cached from `topics.json`, and a "new version is ready" notice offers a refresh rather than reloading by itself.
  - **Number entry:** accepts scientific notation (3e8, 1.5 × 10^-2), fractions, thousands commas and a unit typed after the number. An answer turned upside down (1/4 for 4) gets its own hint.
  - **Deferred:** exam practice mode (planned for April–May; its question mix should follow the real exam format, which Rhys will confirm); Welsh, until Canolfan Bedwyr replies; slider − / + buttons, perhaps on the kV and distance sliders only.
- Design review and three layout changes (5 November 2026, at Rhys's request, using the design-taste-frontend skill). The skill's checks found nothing failing; the changes come from looking at the screens.
  - **Home:** each topic row reads "6 lessons · 34 questions" and has a Lessons (or Continue lessons) button before Practise. Before any questions are tried, the main button opens the next lesson instead of a practice set.
  - **Lesson pages:** on wide screens an "In this topic" list sits beside the text (ticks for visited lessons, the current one marked, and a practice button), filling the empty right half. Below 1100px it is left out. The Draft tag moved out of the title onto the lecture line.
  - **Topic contents:** the lessons and "Practise by area" sit side by side on desktop, so both are on the first screen.
  - **Left as they are:** duplicated progress on the practice screen; empty progress bars on the phone home screen.
- Fixes from the whole-project code review (5 November 2026, at Rhys's request).
  - **Three diagrams need signing off again.** The Bohr atom, the X-ray tube and the inverse square law were approved on 30 October at 11:32. They then changed later that day (legibility, kVp labels, dark mode) and stayed approved, against the rule that changed diagrams need signing off again. They are back to `approved: false`, so **no diagrams are approved at the moment**.
  - **No approved diagram is hidden.** A topic's page now lists any approved diagram that no visible lesson shows, under "More to explore". Each such diagram has its own page (`#diagram-<topic>/<id>`). Without this, an approved diagram inside a draft lesson could never reach students.
  - **Question feedback links** now open the diagram's own page, not the topic page.
  - **Checked** with review mode off, one lesson approved and one diagram approved; all three test changes were then reverted.
- Fonts stored in the app (5 November 2026, at Rhys's request, from the code review). Figtree and Noto Sans were loaded from Google, which sent each student's IP address to Google (against "no data collection") and didn't work offline on a first visit.
  - **Now:** they're in `fonts/` with `css/fonts.css`, in Latin, extended Latin (ready for Welsh ŵ ŷ) and Greek, about 250 KB in all, under the SIL Open Font License (licence files included). They're part of the offline copy, and the look is unchanged.
  - **Guard:** the content checker now fails if `index.html` or any stylesheet loads anything from another site.
- Code tidy and the sign-off gallery (5 November 2026, at Rhys's request).
  - **knip scan:** no unused files or packages. Four exports used only in their own file are no longer exported (`parseSettings`, `rng`, `SHELL_NAMES`, `XCOM`). `fromRow` and `isValid` stay, marked as used by the checker.
  - **Gallery:** `prototypes/diagrams.html` (open it at http://localhost:8080/prototypes/diagrams.html) now shows all 42 diagrams by topic. It's built from `topics.json` and the app's diagram list, so new diagrams appear without editing it.
  - **Each diagram's entry shows:** its sign-off status, the lessons that use it, what to check (the illustrative values and the items needing clinical or legal sign-off), and a filter for "Awaiting sign-off".
  - **Loading:** diagrams load as you scroll, and the fonts come from the app.
- Home page changes from the research report (5 November 2026, at Rhys's request; evidence in `reports/Educational home page design.md`):
  - **Practising what's due:** when questions are to revisit, the main button is "Practise the N to revisit". It opens a set of just those questions, most recently missed first, at `#revisit`. The next lesson sits beside it.
  - **A first visit** gets one line saying what the app is and that no login is needed.
  - **Two prompts after that:** a growth-mindset line and a reminder to space practice ("Come back in a few days to review").
  - **Progress:** the four summary boxes are replaced by one line of figures, shown only once something has been tried.
  - **Footer:** now carries the module, `lastUpdated` from `js/config.js`, the reference data, "Report an error" (to `contactEmail` or the feedback Form) and an Accessibility link.
  - **Accessibility statement:** a new page at `#accessibility`. **It's a draft for Rhys to check against the university's guidance.**
  - **Sizes:** buttons on topic rows and in "On This Device" are now 44px; topic descriptions are 16px; lesson text is 18px.
- Next: Rhys reviews the 63 draft lessons and the 19 new interactives (review mode only). Still waiting: review of the 249 draft questions, and sign-off of the earlier interactives and diagram upgrades.
- Untested: offline mode. Check it once hosted on GitHub Pages, which needs the repo made public (only with Rhys's go-ahead).
- Commit identity: Rhys Morris, using the GitHub no-reply email.
- Rhys is a lecturer, not a developer: explain steps plainly.

## Rhys's to-dos
- [ ] Create a free GitHub account (before February).
- [ ] Create the Microsoft feedback Form (Claude drafts the questions).
- [ ] Ask Canolfan Bedwyr about Welsh language requirements.
- [ ] Ask line manager about IP.
