# RadPhys Revise

Revision app for first-year diagnostic radiography physics (RDR-1173). See [PLAN.md](PLAN.md) for everything agreed.

## Editing questions

Questions live in spreadsheets in `content/`, one per topic (for example `content/01-atomic-structure.csv`). Open them in Excel and save as **CSV UTF-8**.

| Column | What to put |
|---|---|
| `id` | Unique code, e.g. `AS-19`. Don't reuse or change an id once students have used it, because their progress is stored against it. |
| `status` | `draft`, `approved` or `rejected`. Students only see `approved`. |
| `reviewer_comments` | Your notes. The app ignores this column. |
| `type` | `mcq` (multiple choice), `written` (self-marked), `order`, `match`, `label` or `critique` (see below). |
| `difficulty` | `core` or `stretch`. |
| `question` | The question text. |
| `option_a` … `option_d` | MCQ options. The app shuffles them. |
| `answer` | Letter of the correct option. |
| `explanation` | Shown after every answer. |
| `feedback_a` … `feedback_d` | Why that option is wrong. Leave blank for the correct one. |
| `model_answer` | Written questions only. |
| `marking_points` | Written questions only. Separate points with `|`. |
| `diagram` | Optional. A diagram id (e.g. `tube`, `spectrum`) adds a "See this in the explorer" link to the feedback. |

| `items` | Order, match and label questions only (see below). Separate entries with `|`. |
| `spares` | Match and label questions only. Extra wrong answers for the drop-downs, separated with `|`. Optional. |
| `figure` | Label questions: the figure's name. Critique questions: the image settings. |

To add a new spreadsheet, list it under the topic's `files` in `content/topics.json`.

### The four newer question types

These are marked automatically. For order, match and label questions each part earns its share, so 4 of 5 counts as 0.8; a question comes back sooner unless the student gets at least 70%. Fill in `question` and `explanation` as usual; the option and feedback columns are only for critique questions.

- **Put in order** (`type` = `order`): write the steps in `items` in the **right** order, for example `Radio waves | Microwaves | Infrared`. Students see them shuffled and move them with arrow buttons. Use 4 to 6 steps.
- **Match** (`type` = `match`): write each pair in `items` as `left = right`, for example `Absorbed dose = gray (Gy) | Activity = becquerel (Bq)`. Students choose each right-hand answer from a drop-down. Add a wrong answer or two in `spares` so the last pair can't be found by elimination. Avoid two pairs with the same right-hand answer.
- **Label the diagram** (`type` = `label`): put the figure's name in `figure`. Students choose a label for each numbered marker. Leave `items` empty to use the figure's own labels, or write your own wording in `items` in the same order (same number of labels). The figures and their numbered labels are:

  | `figure` | Labels, in marker order |
  |---|---|
  | `tube` | Filament · Focusing cup · Target and focal spot · Rotating anode · Rotor · Stator · Envelope (vacuum) · Window · Added filtration · Housing and oil |
  | `atom` | Nucleus (protons and neutrons) · K shell · L shell · M shell · Electron |
  | `spectrum` | Bremsstrahlung (continuous spectrum) · Kα characteristic line · Kβ characteristic line · Maximum photon energy, set by the kVp · Low-energy photons removed by filtration |
  | `dr` | X-ray photon · Caesium iodide (CsI) scintillator · Light · Photodiode (amorphous silicon) · Thin-film transistor (TFT) |
  | `geometry` | Focal spot · Object · Image receptor · Umbra · Penumbra (geometric unsharpness) · Object–receptor distance (ORD) · Focus–receptor distance (FRD) |
  | `transformer` | Primary winding · Secondary winding · Iron core · Changing magnetic field in the core · Alternating current (AC) supply |

- **Image critique** (`type` = `critique`): a multiple-choice question (fill in the options, `answer` and feedback as for `mcq`) with a simulated image of the cartoon limb above it. No patient images are used. Describe the exposure in `figure`, separated by `;`:
  - `part=hand`, `part=knee` or `part=pelvis`
  - `kv=` and `mas=` as numbers, for example `kv=85; mas=2.2`
  - optionally `grid=in` or `grid=out`, `spot=fine` or `spot=broad`, `frd=` in cm, and `motion=` (blur from movement, try 3 or 4)
  - `show=image` hides the settings and EI, so students judge the image alone

  Anything left out uses the exposure console's suggested setting for that body part. The EI is worked out from the settings, using the same model as the exposure console. Try a setting in the console first to see what the image will look like.

Calculation questions (inverse square law, HVL) are in `content/calculations.js`. Claude writes these. Change `status` to `"approved"` there once you're happy with them.

## Editing lessons

A topic can have lessons: short pages, clicked through in order, each with an explanation, an interactive, key points and a link to practise that area. A topic with lessons opens on its list of lessons; a topic without them shows its diagrams on one page, as before.

Each topic's lessons are in one text file in `content/lessons/` (for example `content/lessons/03-x-ray-production.md`), listed as `"lessons"` for that topic in `content/topics.json`. Open it in any text editor (Notepad is fine). Each lesson looks like this:

```
# The X-ray tube
id: tube
summary: The parts of a rotating-anode tube, and what each one does.
areas: The X-ray tube
diagram: tube
status: draft
sources: 5-2 s5–12, s20

A paragraph of explanation. Put **double stars** round a word to make it bold.

Another paragraph. Lines starting "- " become bullet points.

## Try this
- What to try with the interactive.

## Key points
- A point to take away.
```

- `id` goes in the web address. Don't change it once students have used the app, because their ticks are stored against it.
- `areas` are the question areas (the `subtopic` column) the lesson leads into, separated by `;`. Each gets a "Practise" link, and a question's feedback links back to its area's lesson.
- `diagram` is an interactive's id from `content/topics.json` (leave the line out for none). The same interactive can appear in more than one lesson.
- `status`: students only see `approved` lessons. While a topic has none approved, it shows its diagrams page as before.
- `sources` is shown to you in review mode only.
- Lessons appear in the order they are written in the file.

## Before giving the link to students

In `js/config.js`:
- set `reviewMode` to `false` (hides drafts)
- paste the Microsoft Form link into `feedbackUrl`

## Publishing

The app is a plain static website with no build step. It's published to GitHub Pages: upload the whole folder (except `prototypes/`) to a GitHub repository, then turn on Pages. Claude will walk you through this before the pilot.

Before publishing, check the content. In PowerShell, from the project folder, run:

```
node tools/validate.mjs
```

It reads every spreadsheet, lesson and calculation the way the app does, and lists anything wrong in plain English. It changes nothing.
- **Problems** stop a question from working: a duplicate id, a wrong answer letter, missing marking points, or a link to a diagram that doesn't exist.
- **Warnings** are worth a look, but the app copes with them.

After changing files, bump `VERSION` in `sw.js`. Anyone with the app open then sees "A new version is ready", with a Refresh button. New spreadsheets and lesson files listed in `content/topics.json` are saved for offline use automatically.

## Previewing on your computer

Opening `index.html` directly doesn't work because browsers block loading the spreadsheets from a local file. Instead, run this from the project folder in PowerShell, then open http://localhost:8080 (press Ctrl+C to stop):

```
powershell -ExecutionPolicy Bypass -File tools\serve.ps1
```

You can also ask Claude to publish a preview link.
