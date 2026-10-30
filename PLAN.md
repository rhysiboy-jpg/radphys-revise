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
- Maths: nothing harder than the inverse square law. Randomised numeric questions only for the inverse square law, the mAs–distance rule (mAs₂ = mAs₁ × (d₂/d₁)²), and doubling/halving (including HVLs). The 15% kV rule is conceptual only.
- Terminology follows Ball & Moores, *Essential Physics for Radiographers* (UK usage, e.g. kV). Johnston & Fauber is secondary.
- About 25 approved questions per topic: around 18 MCQs, 5 self-marked written, and up to 5 calculation templates.
- Workflow: Claude drafts questions into a spreadsheet, one topic at a time, with a `source` column naming the lecture and slide (e.g. "10-2 s25") so Rhys can check each against his slides. Rhys sets Status (draft / approved / rejected) and adds comments. Only approved rows go live. Claude writes the calculation templates and Rhys reviews them on a preview page.

## App
- **Explore** (interactive diagrams) and **Practise** (10-question sets per topic or mixed).
- Immediate feedback, worked solutions, and an explanation for each wrong option. Written answers are self-marked against a model answer and a marking-point checklist.
- Mastery bar per topic. Questions answered wrongly come back more often. Timed exam mode arrives in April–May.
- Diagrams: Bohr atom (reused across the others), X-ray tube explorer, electron–target interactions, spectrum explorer (kV/mA/filtration), photoelectric vs Compton, inverse square law visualiser.
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
1. Exposure console (topic 7): set kV, mAs, focal spot, grid and distance; a stylised phantom drawn in the diagram style (or playfully cartoony) shows contrast, noise and sharpness changing, with EI and dose. Includes the "What do I do?" EI scenarios, the "Higher or lower?" dose exercise and the 15% rule. No real patient images.
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
  - Drafted for Rhys's review: topic 1 additions AS-19 to AS-27 and AS-W6 (units, energy, 2n², isotopes, visible range, wave–particle duality), and the full topic 3 bank XP-01 to XP-20 and XP-W1 to XP-W5 in `content/03-x-ray-production.csv`.
- Waiting on Rhys: review of the 35 drafts above.
- Next: question bank for topic 2 (Electricity & X-ray Circuits), then topics 4–11 in order.
- Untested: offline mode. Check it once hosted on GitHub Pages, which needs the repo made public (only with Rhys's go-ahead).
- Commit identity: Rhys Morris, using the GitHub no-reply email.
- Rhys is a lecturer, not a developer: explain steps plainly.

## Rhys's to-dos
- [ ] Create a free GitHub account (before February).
- [ ] Create the Microsoft feedback Form (Claude drafts the questions).
- [ ] Ask Canolfan Bedwyr about Welsh language requirements.
- [ ] Ask line manager about IP.
