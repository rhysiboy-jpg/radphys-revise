---
name: RadPhys Revise
description: Revision for first-year diagnostic radiography physics.
colors:
  bangor-red: "#CF0A0A"
  bangor-red-tint: "#FCEBEA"
  bangor-sun: "#FDB913"
  sun-tint: "#FFF4D6"
  sun-ink: "#6B4A00"
  ink: "#15171B"
  muted-slate: "#5A606A"
  slate-chrome: "#ECEEF1"
  sheet-white: "#FFFFFF"
  bench-panel: "#F5F6F8"
  edge-line: "#E3E5E9"
  control-line: "#D3D7DD"
  correct-green: "#1E7A45"
  correct-tint: "#E7F4EC"
  diagram-paper: "#EBF0F3"
  diagram-line: "#C6D1D9"
  diagram-teal: "#0B6A88"
  electron-blue: "#2A5FD4"
  photon-magenta: "#A12F88"
  heat-orange: "#D2601A"
typography:
  display:
    fontFamily: "Figtree, Segoe UI, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Figtree, Segoe UI, system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  question:
    fontFamily: "Figtree, Segoe UI, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.45
  title:
    fontFamily: "Figtree, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  figure:
    fontFamily: "Figtree, Segoe UI, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1.1
  body:
    fontFamily: "Noto Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "tnum"
  label:
    fontFamily: "Noto Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  nav: "8px"
  row: "10px"
  panel: "12px"
  sheet: "16px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet-white}"
    rounded: "{rounded.pill}"
    padding: "11px 18px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "11px 18px"
    height: "44px"
  diagram-button-primary:
    backgroundColor: "{colors.diagram-teal}"
    textColor: "{colors.sheet-white}"
    rounded: "{rounded.pill}"
    padding: "11px 18px"
    height: "44px"
  panel:
    backgroundColor: "{colors.bench-panel}"
    rounded: "{rounded.panel}"
    padding: "20px"
  row-card:
    backgroundColor: "{colors.sheet-white}"
    rounded: "{rounded.row}"
    padding: "16px"
  answer-option:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "14px 16px"
  answer-option-correct:
    backgroundColor: "{colors.correct-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "14px 16px"
  answer-option-wrong:
    backgroundColor: "{colors.bangor-red-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "14px 16px"
  status-ready:
    backgroundColor: "{colors.correct-tint}"
    textColor: "{colors.correct-green}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  status-review:
    backgroundColor: "{colors.sun-tint}"
    textColor: "{colors.sun-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  diagram-stage:
    backgroundColor: "{colors.sheet-white}"
    rounded: "{rounded.panel}"
    padding: "12px"
  nav-item:
    textColor: "{colors.ink}"
    rounded: "{rounded.nav}"
    padding: "8px 10px"
---

# Design System: RadPhys Revise

## Overview

**Creative North Star: "The Clean Lab Bench"**

RadPhys Revise is a calm, well-ordered workspace. A slate-tinted frame holds a single white sheet, like a bench top. On it, tools are laid out tidily in tonal panels: topic rows, question cards and readouts. The experiment sits at the centre: the interactive diagram, or the question being answered. Nothing on the bench competes with the experiment. Colour is rationed so that when it appears it means something: red for what needs another look, Sun for progress, green for a correct answer, and a separate teal-and-magenta palette inside the diagrams.

The density is moderate and readable on a phone. Students revise in short sessions, often on placement or a commute, so every screen leads with one clear next action. Type is the Bangor pairing: Figtree for headings and figures, Noto Sans for reading. Depth comes from tone (frame → sheet → panel → raised row), not from shadows.

Bangor University's colours are used, but toned down and with no logos. Full-strength Bangor red is deepened to pass contrast, and it is never used as a large field.

**Key Characteristics:**
- An L-shaped frame (sidebar on slate chrome) around one white sheet per view.
- Tonal layering, with no drop shadows on interface surfaces.
- Pill-shaped buttons; near-black primary buttons; red is never the default action colour.
- Status always carries a word or icon as well as a colour.
- Diagrams keep their own signed-off palette, separate from the interface colours.
- Tabular numbers everywhere, so counts and readouts line up.

## Colors

A cool slate-and-white bench with three rationed signals (Deepened Bangor Red, Bangor Sun, correct green) and a separate scientific palette for diagrams.

### Primary
- **Deepened Bangor Red** (bangor-red): Bangor's #ED0000 darkened to pass 4.5:1 on white. It marks the brand square in the sidebar and anything that needs attention: a wrong answer, an alert tile, a question due again. In dark mode it lifts to #FF5C52.
- **Red Tint** (bangor-red-tint): the background of a wrong answer option.

### Secondary
- **Bangor Sun** (bangor-sun): progress. It fills mastery bars and completed progress dots. It is never used for text on white.
- **Sun Tint / Sun Ink** (sun-tint, sun-ink): the review and draft flags ("Awaiting sign-off", draft counts). Sun Ink is the readable text partner of Sun.

### Tertiary
- **Correct Green** (correct-green, correct-tint): correct answers and "Ready" status.

### Diagram palette (signed off 29 October 2026)
- **Diagram Teal** (diagram-teal): the diagrams' accent for selection, stepper buttons and slider thumbs.
- **Electron Blue** (electron-blue), **Photon Magenta** (photon-magenta), **Heat Orange** (heat-orange): one colour per physical thing, used consistently across every diagram.
- **Diagram Paper / Diagram Line** (diagram-paper, diagram-line): stage grounds and strokes. The tube's materials (oil, glass, lead, tungsten, copper, aluminium) have their own tokens in `css/app.css`.
- **Labels inside diagrams** are plain ink at medium weight, never in the diagram colours. The colour stays on the electron, photon or line the label names (Rhys, 30 October 2026).
- **Text size:** diagram text never renders below 11px on screen. As a drawing shrinks on a phone its labels and numbered markers grow within it, and the side-by-side diagrams swap to shorter phone labels (`wide-only` / `narrow-only`).
- **Dark mode:** materials are lifted so every edge stands clear of the dark stage, and signs drawn on an electron or nucleus switch to dark text (`--on-electron`, `--on-copper`).

### Neutral
- **Ink** (ink): text, primary buttons and focus rings.
- **Muted Slate** (muted-slate): secondary text, captions and counts. It always passes 4.5:1.
- **Slate Chrome** (slate-chrome): the frame and sidebar ground; also the PWA theme colour.
- **Sheet White** (sheet-white): the sheet, plus raised rows and options inside panels.
- **Bench Panel** (bench-panel): tonal panels, one step off the sheet.
- **Edge Line / Control Line** (edge-line, control-line): row borders, and button and input borders.

### Named Rules
**The Rationed Red Rule.** Red means "look again": a wrong answer, a question due, a destructive reset. Never use it for a primary button, a heading or decoration.

**The Two Palettes Rule.** Interface colours stay out of the diagrams, and diagram colours stay out of the interface chrome. Electron blue is always an electron, and photon magenta is always a photon.

**The Not-By-Colour-Alone Rule.** Every state that has a colour also has a word or an icon (✓ Correct, ✗ Not quite, Ready, Awaiting sign-off).

## Typography

**Display Font:** Figtree (with Segoe UI, system-ui)
**Body Font:** Noto Sans (with Segoe UI, system-ui)

**Character:** Figtree is round, open and friendly, which suits a supportive tutor. Noto Sans is plain and highly legible for long explanations, and it is ready for Welsh diacritics.

### Hierarchy
- **Display** (650, 1.75rem; 1.5rem under 900px; 1.2): one page title per view, such as "RDR-1173 Physics Revision" or a topic name.
- **Headline** (650, 1.3rem, 1.3): diagram module titles in Explore.
- **Question** (600, 1.25rem, 1.45): the question stem in Practise. It is the largest reading text on that screen.
- **Title** (650, 1rem, 1.3): panel headings ("Topics", "This Set") and row titles.
- **Figure** (400, 1.75rem, 1.1): stat tile values. Light weight, so the number reads as a measurement rather than a shout.
- **Body** (400, 16px, 1.55, tabular numbers): explanations and captions, with a maximum of about 70ch.
- **Label** (400–600, 0.8–0.85rem): counts, meta lines, status chips and the sidebar's "Topics" label. Sentence case, never all caps.

### Named Rules
**The No-Shouting Rule.** No uppercase labels and no letter-spaced eyebrows. Small labels are plain grey sentence case.

**The Tabular Figures Rule.** All numbers use tabular figures (`font-variant-numeric: tabular-nums`), so scores, counts and readouts never jitter.

## Layout

- **Desktop:** a 228px sticky sidebar, then the sheet. The sheet has 8px of chrome around it, a 16px radius, 72px of top padding and 48px between sections.
- **Content:** a 12-column grid at most 1100px wide with 16px gutters. Common splits are 9 + 3 on home and practise, and 3:2 for a diagram and its controls.
- **Panels:** 20px of padding with 14px gaps inside. Rows inside panels are 8px apart.
- **Under 900px:** the sidebar becomes a 52px top bar with a menu button that opens full screen. The sheet loses its frame (no margin, radius or border), padding drops to 28px top and 16px sides, and the grid collapses to one column. The practise screen's "This Set" panel is hidden.
- **Under 600px:** topic rows stack their actions under the text, and full-width primary buttons appear in title rows.
- **Touch targets:** at least 44px, or 40px for compact row buttons.

## Elevation & Depth

The system is flat. Depth is conveyed by tonal layering in four steps: Slate Chrome (frame) → Sheet White (sheet) → Bench Panel (panels) → Sheet White with an Edge Line border (raised rows and options). There are no drop shadows on interface surfaces.

The only glow is the selection glow on a part of the tube diagram (`drop-shadow(0 0 5px` diagram teal`)`). It belongs to the signed-off diagram.

### Named Rules
**The Tone-Not-Shadow Rule.** To lift something, move it one tonal step; never add a `box-shadow`. Inset rings are allowed only as state: a selected answer option, or a pressed diagram key.

## Shapes

Gently rounded, nested radii: the sheet is 16px, panels 12px, rows and options 10px, and nav items 8px. Buttons, chips, bars and progress dots are full pills (999px). The brand mark is a hard 14px square, the only sharp corner in the interface. Number badges in the diagrams are circles. Borders are 1px hairlines.

## Components

Calm and sure-footed: rounded pill buttons, quiet borders and clear states. Confident without shouting.

### Buttons
- **Shape:** full pill (999px), at least 44px tall, in 600-weight Noto Sans at 0.92rem.
- **Primary:** an Ink fill with white text. On hover it mixes 15% towards the sheet. There is one primary button per view: the next action ("Start", "Check answer", "Practise this topic").
- **Secondary:** a Sheet White fill with a Control Line border. On hover the border turns Ink.
- **Pressed:** moves down 1px. **Focus:** a 3px Ink outline, offset 2px.
- **Danger:** the reset button only, with a red border and red text and no fill.
- **Link button:** underlined Ink text with no chrome, for minor actions.
- **Inside diagrams:** primary buttons take Diagram Teal.

### Status chips
- **Style:** a pill, 0.8rem in 600 weight, with a tinted fill and matching ink. "Ready" is green, "Awaiting sign-off" is Sun and "Coming soon" is neutral grey.

### Cards / Containers
- **Panel:** Bench Panel fill, 12px radius, 20px padding, no border.
- **Row card** (topic rows, explore list items, review items): Sheet White on the panel, with a 1px Edge Line border and a 10px radius.
- **Stat tile:** a panel at least 128px tall, holding a label, a light Figtree figure and a caption. The alert tile turns its figure red.

### Answer options (signature)
- A full-width row card with a native radio, 14px × 16px padding.
- **Hover:** the border turns Ink. **Selected:** an Ink border plus a 1px inset ring.
- **Correct:** a green border and tint, plus "✓ Correct". **Wrong:** a red border and tint, plus "✗". After checking, options lock and stop reacting to hover.
- Feedback blocks ("why" and the model answer) are raised row cards beneath.

### Mastery bar and progress dots
- An 8px pill track (Ink at 10%) with a Bangor Sun fill. Progress dots are 20 × 6px pills: Sun when done, Ink for the current question.

### Inputs / Fields
- Sheet White fill, a Control Line border and a 10px radius, with 10px × 12px padding and a 1rem body font. Range sliders use Diagram Teal for their accent.

### Navigation
- Sidebar items are 0.92rem with 8px × 10px padding and an 8px radius. Topic numbers are muted, and mastery percentages are right-aligned.
- **Hover:** Ink at 6%. **Current page:** Ink at 9%, in 600 weight.
- Under 900px the sidebar becomes a top bar with a full-screen menu.

### Diagram stage (signature)
- A white (Surface) stage with a Diagram Line border, a 12px radius and 12px padding, holding a full-width SVG. A "not to scale" note sits beneath it.
- Controls (stepper, sliders, mode toggles, readouts) sit in matching bordered surfaces beside it. Selected modes take a teal bottom bar, and selected keys a teal left bar.

## Do's and Don'ts

### Do:
- **Do** layer depth by tone: chrome → sheet → panel → raised row.
- **Do** keep one Ink primary button per view, naming the next action.
- **Do** pair every coloured state with a word or icon.
- **Do** keep diagram colours to their meaning: electron blue, photon magenta, heat orange and teal for selection.
- **Do** keep touch targets at 44px or more, and honour `prefers-reduced-motion`. Animated photon dashes and transitions stop when it is set.
- **Do** define every colour for both light and dark themes.

### Don't:
- **Don't** use Bangor red as a button fill, a heading colour or a large background.
- **Don't** add drop shadows, gradients or glows to interface surfaces.
- **Don't** use uppercase or letter-spaced labels.
- **Don't** show any university logo. Branding is colour and type only.
- **Don't** use real patient images. Phantoms and anatomy are stylised drawings in the diagram style.
- **Don't** change the signed-off diagram palette without Rhys's sign-off.
