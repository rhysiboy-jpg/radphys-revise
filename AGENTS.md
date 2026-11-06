# AGENTS.md

Rules for any coding agent (Claude Code, Codex or another) working on this repository.

## The project

RadPhys Revise is a revision app for first-year diagnostic radiography physics (module RDR-1173). It's a plain static website with no build step: vanilla JavaScript ES modules, one stylesheet and a service worker, published to GitHub Pages.

- The owner is Rhys Morris, a lecturer, not a developer. Explain things in plain language and avoid jargon.
- [PLAN.md](PLAN.md) records everything agreed so far. Read it before starting work, and add an entry when you finish something.
- [README.md](README.md) explains how Rhys edits questions and lessons. Keep it accurate when formats change.
- [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md) hold the product and design context.

## Standing rules

- **Commit or push only when Rhys asks.** He usually asks for one commit per finished piece of work. Work on the current branch (`content/phase-1`) unless told otherwise.
- **Keep the GitHub repository private** until Rhys gives the go-ahead (an IP check is pending).
- **No real patient images** anywhere. Simulated images use the cartoon limb in `js/diagrams/limb.js`.
- **Never commit the lecture slides** or other source material Rhys shares from his own files.
- **Use reference data** (for example NIST XCOM, ICRP 103, UKHSA, IRR17, IR(ME)R 2017, IPEM Report 91) rather than the slides alone. Where a slide differs, follow the reference, say so where students meet it, and record the difference in PLAN.md.
- **No calculation questions in the question banks.** Calculation questions live separately, as randomised templates in `content/calculations.js`, with their own `status`.
- **Nothing reaches students without Rhys's approval:**
  - new or changed diagrams get `"approved": false` in `content/topics.json`;
  - new questions and lessons get `status: draft`;
  - drafts appear only while `reviewMode` is `true` in `js/config.js`.
- **Mark illustrative values as illustrative**, on screen and in the file's header comment, whenever they aren't reference data.
- Flag anything that needs clinical or legal sign-off (consent, duty holders, legislation scenarios) in PLAN.md.

## Where things are

| Path | What it is |
|---|---|
| `content/*.csv` | Question banks, one per topic (format in the README). |
| `content/lessons/*.md` | Lessons, one file per topic (format in the README). |
| `content/topics.json` | Topics, with their question files, lesson file and diagrams. |
| `js/app.js` | Views and routing (`#explore-`, `#learn-`, `#practise-`). Diagrams are registered in its `DIAGRAMS` map. |
| `js/diagrams/` | One module per interactive, each exporting `mount(root)`. It may return a cleanup function. `util.js` has shared helpers (including `tapToSet`, which lets a tap on a graph set its slider), and `sortkit.js` is the shared sorting activity. |
| `js/setup.js` | Shared by every diagram: settings in the web address (the "Copy link" button) and the single screen-reader line when a slider stops. The app adds a Reset button beside "Copy link", which rebuilds the diagram from scratch. |
| `js/content.js`, `js/lessons.js`, `js/csv.js` | Loading and parsing content. |
| `js/store.js` | Student progress in localStorage. |
| `css/app.css` | All styles. Diagram colours use the `--dg-*`, `--photon` and `--electron` tokens. Never hard-code colours, and check dark mode. |
| `fonts/`, `css/fonts.css` | Figtree and Noto Sans, stored in the app (SIL Open Font License, licences alongside). Never load fonts or scripts from another site: the checker fails it. |
| `sw.js` | Offline cache. List every new file in `CORE`. |
| `prototypes/` | Old experiments. Not published. |

## Adding a diagram

1. Write `js/diagrams/<name>.js`, following an existing module of the same kind.
2. Register it in `DIAGRAMS` in `js/app.js`.
3. Add it to the topic's `diagrams` in `content/topics.json` with `"ready": true, "approved": false`.
4. Add the file to `CORE` in `sw.js`. Every script needs listing there; spreadsheets and lessons are cached from `topics.json` automatically.
5. Bump `VERSION` in `sw.js`.
6. Attach it to a lesson with a `diagram:` line, and add a `## Try this` list.
7. For "Copy link" to record a setting, give sliders and drop-downs an `id`, and put single-choice buttons in a `role="group"` with `aria-pressed` and a `data-` attribute naming the option. Give each slider a `<label for>` and an `<output for>`, which the screen-reader line reads out.
8. Keep to the shared layout: the drawing first (`.stage`), then the settings in `.panel`. Only a choice of what the drawing shows (a view, a type, explore or test) goes above the drawing, as tabs. The starting state should already show the key idea, and the summary should say it in words before anything is pressed.
9. Where a graph has a slider for its x axis, mark the current value on the graph and call `tapToSet` so a tap on the graph sets the slider.

## Writing style

- **Text students see:** British English, plain and direct. Use colons, full stops or commas rather than dashes.
- **Text on diagrams:**
  - It must stay readable on a phone. SVG text sizes come from `--fs` and `--min-fs`.
  - Use `wide-only` and `narrow-only` for labels that need shortening.
  - Keep labels from overlapping one another.
- **Code comments:** say why, not what. Each diagram module opens with a comment describing what it shows and what is simplified.

## Checking your work

- **Run both checks first:** `node tools/validate.mjs` checks every content file, the diagram registry and the offline file list; `node tools/test.mjs` tests the app's logic (answer reading, marking, practice sets, progress and backups, the file readers). Each exits with 1 on a problem. Fix every problem before committing, and add a test when you change that logic.

- **Preview:** run `node tools/serve.mjs`, then open http://localhost:8080. Opening `index.html` directly doesn't work.
- **Test widths:** check at phone width (375px) and desktop width. Look for clipped or overlapping labels, sideways scrolling and console errors, and try every control.
- **Old copies:** the service worker can serve outdated files. Unregister it and clear its caches while testing.
- **Line endings:** some files use CRLF. Prefer exact-match edits to scripted find-and-replace, and confirm each edit applied.
