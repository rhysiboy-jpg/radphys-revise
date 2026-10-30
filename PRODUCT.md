# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Primary:** first-year BSc Diagnostic Radiography students at Bangor University, revising the physics and radiation protection strand of RDR-1173 Applied Imaging Science 1 for the end-of-year exam (May, 1.5 hours, mixed question formats).
- They revise in short sessions on their phones, often away from a desk: on placement, on a commute, between lectures.
- **Academic owner:** Rhys Morris, lecturer. Approves every question and diagram before students see it, and reviews the app locally, logging notes as GitHub Issues.
- **Possible later audience:** students at other universities, if the app is shared beyond Bangor. This depends on the IP check with Rhys's line manager and has not been decided.

## Product Purpose
RadPhys Revise helps first-years understand and remember radiographic physics well enough to pass the May exam. Students explore interactive diagrams and practise questions by topic, with immediate feedback.

Success means students turn up to the exam having practised every taught topic, with their weak spots surfaced and revisited.

## Positioning
Four things together that Blackboard quizzes and the textbook don't offer:
1. **Physics they can see.** Interactive diagrams show the mechanism (the tube, the spectrum, photon interactions, the inverse square law) rather than describing it.
2. **Matched to the lectures.** Questions follow Rhys's slides in scope and order, and each one names its lecture and slide. They always use correct reference data, even where a slide differs.
3. **Feedback on every option.** Each wrong answer is explained, worked solutions are given, and missed questions come back more often.
4. **Phone-first, offline, no login.** Installable, usable without a signal, nothing to sign in to.

## Operating Context
- Students find the link on Blackboard and can add the app to their home screen.
- **Explore:** interactive diagrams, each in its topic. **Practise:** 10-question sets per topic or mixed, with a mastery bar per topic. A timed exam mode arrives in April–May 2027.
- Eleven topics in teaching order, from Atomic Structure & EM Radiation to QA & QC (listed in `PLAN.md`).
- Content workflow: Claude drafts questions into CSV files, one topic at a time, with a source column. Rhys sets draft / approved / rejected. Only approved content goes live. Review mode shows drafts and unsigned diagrams.
- Student feedback goes to a Microsoft Form in Rhys's Bangor account.

## Capabilities and Constraints
- Static vanilla-JS PWA, no build step. Hosted on GitHub Pages under Rhys's account. The repo stays private until Rhys gives the go-ahead.
- No data collection, no accounts. Progress is saved on the device only, with a reset button.
- Maths is limited to the inverse square law, the mAs–distance rule and doubling/halving (including HVLs). The question banks contain no calculations; the randomised calculation templates are separate.
- Terminology follows Ball & Moores, *Essential Physics for Radiographers* (UK usage). Tube voltage is written kVp (Rhys, 30 October 2026); kV stays only as the unit of potential difference, e.g. in defining the electron-volt. Johnston & Fauber is secondary.
- Diagrams are 2D schematics, correct in trends and labelled "not to scale". Each is signed off by Rhys before release.
- No real patient images, anywhere.
- English at launch, built to take Welsh. Whether Welsh is required at launch is still to be checked with Canolfan Bedwyr.

## Brand Commitments
- Name: "RadPhys Revise". Footer: "Created by Rhys Morris".
- Visually aligned with Bangor University's colours and type, but with no university logo. The IP position is still to be checked.
- **Voice:** a supportive tutor. Plain, warm and encouraging; explains without talking down. UK English.

## Evidence on Hand
- Approved question banks for topic 1 (32 questions) and topic 3 (24), plus 5 approved calculation templates, all in `content/`.
- Drafts awaiting Rhys's review for topics 2 and 4–8 (25 questions each).
- Six signed-off diagrams in `js/diagrams/`.
- Rhys's lecture slides are source material only. They are never committed or shown in the app.
- There are no student testimonials, usage figures or pilot results yet (the pilot is in early February 2027). Do not invent any.

## Product Principles
1. **Correct physics first.** Reference data wins over convenience or matching a slide. A diagram is honest about scale.
2. **Nothing reaches students unapproved.** Rhys approves every question and diagram.
3. **Show the mechanism.** Where an interactive can show why something happens, it beats more text.
4. **Every answer teaches.** Feedback explains the right answer and why each wrong one is wrong.
5. **Respect the student's situation.** Short sessions on a phone, offline, no sign-in, no tracking.

## Accessibility & Inclusion
- WCAG 2.2 AA: keyboard controls, a caption for each diagram step, reduced-motion support, and no meaning carried by colour alone.
- Built for Welsh-language support alongside English.
