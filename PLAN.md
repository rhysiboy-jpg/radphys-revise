# RadPhys Revise — agreed plan

Confirmed with Rhys Morris, 29 October 2026.

## Purpose and users
- Revision app for Rhys Morris's first-year BSc Diagnostic Radiography cohort (Bangor University).
- Covers the physics and radiation protection strand of **RDR-1173 Applied Imaging Science 1**. Health informatics is out of scope.
- Target: the end-of-year physics exam (May, 1.5 h, mixed question formats).
- Rhys Morris is the academic owner and approves all content. Claude builds the app.

## Content
- Pilot topics:
  1. Atomic structure & EM radiation
  2. X-ray production & the X-ray tube
  3. Interactions with matter
  4. Radiation protection & legislation (IR(ME)R 2017, IRR17, ALARP, inverse square law)
- Full version adds: effects of radiation on cells, measurement of radiation & dosimetry, X-ray circuitry, electrical safety & QA, digital image formation, radioactivity.
- Maths: nothing harder than the inverse square law. Randomised numeric questions only for the inverse square law, the mAs–distance rule (mAs₂ = mAs₁ × (d₂/d₁)²), and doubling/halving (including HVLs). The 15% kV rule is conceptual only.
- Terminology follows Ball & Moores, *Essential Physics for Radiographers* (UK usage, e.g. kV). Johnston & Fauber is secondary.
- About 25–30 approved questions per topic: around 18 MCQs, 5 self-marked written, and up to 5 calculation templates.
- Workflow: Claude drafts questions into a spreadsheet. Rhys sets Status (draft / approved / rejected) and adds comments. Only approved rows go live. Claude writes the calculation templates and Rhys reviews them on a preview page.

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

## Timeline
- Now: prototype the tube explorer and spectrum explorer (style sign-off) and draft the Atomic structure question bank.
- Early February 2027: pilot with 4 topics and 6 diagrams.
- Late March 2027: full version with all topics.
- April–May 2027: fixes and exam practice mode.

## Rhys's to-dos
- [ ] Create a free GitHub account (before February).
- [ ] Create the Microsoft feedback Form (Claude drafts the questions).
- [ ] Ask Canolfan Bedwyr about Welsh language requirements.
- [ ] Ask line manager about IP.
