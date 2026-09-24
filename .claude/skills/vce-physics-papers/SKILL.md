---
name: vce-physics-papers
description: Use when writing, adding, replacing, reviewing or fixing VCE Physics Unit 3 & 4 (Year 12) practice exams or answer keys for PrepNest — including "more Physics exams", "another Physics practice set", a physics diagram that renders wrongly, or a question in scripts/authoring/physics/set-*.mjs.
---

# VCE Physics Unit 3 & 4 exam papers

## Overview

Each practice set is one JS file (`scripts/authoring/physics/set-N.mjs`) holding one complete examination: **Section A** (20 × 4-option MC, 1 mark each) and **Section B** (about 15 questions, 100 marks). `build.mjs` writes every set into `bank.ts` as `BANK_PHYSICS_U34`; `npm run gen` composes paper `physics-year_12-N`, typesets the maths and adds the Physics formula sheet. Set 1 is the free sample.

The past-paper corpus (VCAA 2005–2022 with examiner reports, and 2023–2024 trials from NEAP, Insight, TSSM, Kilbaha, QATS, STAV and Access) is already distilled into `references/`. **Do not re-read the PDFs** unless an archetype is missing — see `references/corpus.md` for cheap text lookups.

**Core rule: every number is computed in `checks/setN.py` before it is written into a set file** — answers, distractors, graph data and figure geometry. Mental arithmetic has been wrong.

## Workflow

1. `node scripts/authoring/physics/coverage.mjs` — what sets 1…N already ask, and the answer-letter spread per area of study.
2. Plan the set against `references/blueprint.md` (marks per area, 15 questions, letters 5/5/5/5 steered towards each area's smaller counts). Choose archetypes and **contexts** that `references/archetypes.md` marks as unused.
3. Write `checks/setN.py` (copy `checks/set5.py`) and run it with `C:/Users/eric_/Anaconda3/python.exe`.
4. Write `set-N.mjs` with `phys.mjs` and `draw.mjs`, following `references/style.md`.
5. `node scripts/authoring/physics/build.mjs` → `npm run gen` → `node scripts/verify-bank.mjs`. Fix every ✗.
6. Render every page and look at every figure: dev server on the worktree, then `curl "http://localhost:PORT/api/dev/exam?id=physics-year_12-N&doc=paper"` (also `doc=answers`) and `node scripts/authoring/pdf-pages.mjs file.pdf 7 4 out.png 520`. Figures fail in ways no check catches (labels on lines, arrows the wrong way).
7. Add a `src/lib/releases.ts` entry, commit on a branch, push, and open a PR. Merging to `main` is a production deploy and needs the owner's go-ahead. The live DB then needs the Physics seed rows (see `reference_prepnest_supabase` memory).

## Quick reference

| Need | Where |
|---|---|
| Format, instructions, marks per area, study design scope, data values | `references/blueprint.md` |
| Archetypes per area of study, and which contexts sets 1–5 used | `references/archetypes.md` |
| Authoring API, figure helpers and their traps, wording, solutions, distractors | `references/style.md` |
| Finding a past or trial paper on a topic | `references/corpus.md` |

## Common mistakes

- **Figure text on top of lines.** Check every label against paths, dimension lines and hatching in the render. Move labels with `anchor: 'end'`, or enlarge the canvas.
- **`rect(x, y, w, h, { w: 1.6 })`.** Here `w` is the width, so for a heavy outline use `poly(corners, { closed: true, w })`.
- **Circuit polarity.** `cell()` always draws the long (+) plate on top. Draw the plates by hand when the current must flow the other way, then re-derive every force direction.
- **Direction answers.** Work out each right-hand-rule result with vectors in the check script (x right, y up the page, z out of the page).
- **"above".** Diagrams print below their text: say "shown in Figure n" or "below".
- **Crowded energy levels.** Space the levels schematically and caption "(not to scale)".
- **Wrong glyphs in a dev render.** Restart the dev server before debugging fonts.
- **Copy rules:** "practice" (never "practise"), "purchase" not "buy", and no refund talk.
