# RadPhys Revise

Revision app for first-year diagnostic radiography physics (RDR-1173). See [PLAN.md](PLAN.md) for everything agreed.

## Editing questions

Questions live in spreadsheets in `content/`, one per topic (for example `content/01-atomic-structure.csv`). Open them in Excel and save as **CSV UTF-8**.

| Column | What to put |
|---|---|
| `id` | Unique code, e.g. `AS-19`. Don't reuse or change an id once students have used it, because their progress is stored against it. |
| `status` | `draft`, `approved` or `rejected`. Students only see `approved`. |
| `reviewer_comments` | Your notes. The app ignores this column. |
| `type` | `mcq` (multiple choice) or `written` (self-marked). |
| `difficulty` | `core` or `stretch`. |
| `question` | The question text. |
| `option_a` … `option_d` | MCQ options. The app shuffles them. |
| `answer` | Letter of the correct option. |
| `explanation` | Shown after every answer. |
| `feedback_a` … `feedback_d` | Why that option is wrong. Leave blank for the correct one. |
| `model_answer` | Written questions only. |
| `marking_points` | Written questions only. Separate points with `|`. |
| `diagram` | Optional. A diagram id (e.g. `tube`, `spectrum`) adds a "See this in the explorer" link to the feedback. |

To add a new spreadsheet, list it under the topic's `files` in `content/topics.json`.

Calculation questions (inverse square law, HVL) are in `content/calculations.js`. Claude writes these. Change `status` to `"approved"` there once you're happy with them.

## Before giving the link to students

In `js/config.js`:
- set `reviewMode` to `false` (hides drafts)
- paste the Microsoft Form link into `feedbackUrl`

## Publishing

The app is a plain static website with no build step. It's published to GitHub Pages: upload the whole folder (except `prototypes/`) to a GitHub repository, then turn on Pages. Claude will walk you through this before the pilot.

After changing files, bump `VERSION` in `sw.js` so phones pick up the changes promptly. They update in the background otherwise.

## Previewing on your computer

Opening `index.html` directly doesn't work because browsers block loading the spreadsheets from a local file. Instead, run this from the project folder in PowerShell, then open http://localhost:8080 (press Ctrl+C to stop):

```
powershell -ExecutionPolicy Bypass -File tools\serve.ps1
```

You can also ask Claude to publish a preview link.
