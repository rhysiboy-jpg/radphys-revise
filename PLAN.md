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
- Done (October 2026): tube and spectrum explorers signed off, Atomic structure question bank approved, Bangor restyle, remaining four diagrams built.
- Now: draft the topic 2–4 question banks.
- Early February 2027: pilot with 4 topics and 6 diagrams.
- Late March 2027: full version with all topics.
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
- Next: the topic 2 question bank (X-ray Production & the X-ray Tube) in the same CSV format, then topics 3 and 4.
- Untested: offline mode. Check it once hosted on GitHub Pages, which needs the repo made public (only with Rhys's go-ahead).
- Commit identity: Rhys Morris, using the GitHub no-reply email.
- Rhys is a lecturer, not a developer: explain steps plainly.

## Rhys's to-dos
- [ ] Create a free GitHub account (before February).
- [ ] Create the Microsoft feedback Form (Claude drafts the questions).
- [ ] Ask Canolfan Bedwyr about Welsh language requirements.
- [ ] Ask line manager about IP.
