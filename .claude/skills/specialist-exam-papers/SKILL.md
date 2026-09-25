---
name: specialist-exam-papers
description: Use when writing, adding, replacing, reviewing or fixing VCE Specialist Mathematics Unit 3 & 4 practice papers (Examination 1, Examination 2, answer keys) for PrepNest — including "more Specialist exams", "another practice set", or a question in scripts/authoring/specialist/set-*.mjs.
---

# Specialist Mathematics exam papers

## Overview

Each practice set is one JS file (`scripts/authoring/specialist/set-N.mjs`) holding a complete **Examination 1** (tech-free, 10 questions, 40 marks) and **Examination 2** (Section A 20 × 4-option MC; Section B 6 × 10 marks). `build.mjs` writes all sets into `bank.ts`; `npm run gen` composes the papers, typesets the maths and adds the formula sheet.

The past-paper corpus (VCAA 2001–2025 and trial papers from MAV, NEAP, Insight, Kilbaha, TSSM, Heffernan and QATS) has already been distilled into `references/`. **Do not re-read the PDF folder** unless you need an archetype the references lack — see `references/corpus.md` for cheap targeted lookups.

**Core rule: every answer is computed in a SymPy/SciPy check script before it is written into a set file.** Hand-derived answers have been wrong. (A distance-travelled answer once assumed a turning point that came after the time limit.)

## Workflow

1. `node scripts/authoring/specialist/coverage.mjs` — see what sets 1…N already ask, so you can pick different archetypes and contexts.
2. Plan the set against `references/blueprint.md`: the marks table, AOS spread, and Section A letters 5/5/5/5. Draw archetypes from `references/archetypes.md`.
3. Write `checks/setN.py` first, then run `C:/Users/eric_/Anaconda3/python.exe scripts/authoring/specialist/checks/setN.py`. It computes every exact value, decimal and distractor. `checks/set1.py` is the template.
4. Write `set-N.mjs` with the `sm.mjs` helpers, following `references/style.md` (TeX, diagrams, working space, worked solutions).
5. `node scripts/authoring/specialist/build.mjs` → `npm run gen` → `npm run verify-bank`. Fix every ✗ (duplicate stems across sets are errors).
6. Render and look at every page: start the dev server, fetch `/api/dev/exam?id=specialist_maths-year_12-N-exam1&doc=paper` (also `exam2`, `doc=answers`), then `node scripts/authoring/pdf-pages.mjs file.pdf 2 6 out.png 420`.
7. Add a `src/lib/releases.ts` entry, commit on a branch, push, open a PR. Merging to `main` is a production deploy and needs the owner's go-ahead.

## Quick reference

| Need | Where |
|---|---|
| Paper format, instructions, marks, AOS weights, what's out of the study design | `references/blueprint.md` |
| Question archetypes per area of study, with VCAA phrasing | `references/archetypes.md` |
| TeX macros, diagram helpers, solution format, MC distractors | `references/style.md` |
| Finding a past paper on a topic | `references/corpus.md` |
| Renderer / cache / verify internals | `scripts/lib/math.mjs`, `src/lib/pdf/math/MathText.tsx`, `scripts/verify-bank.mjs` §10b |

## Common mistakes

- **Answer letters bunch.** Numeric options go in ascending order, so pick distractors that move the key. `build.mjs` prints the letter counts, and each set needs 4–6 of each.
- **Five options.** VCAA has used A–D since 2024; the build rejects anything else.
- **Out of the 2023–2027 study design:** forces, momentum and Newton's laws (dynamics), integrating factors, and ellipse and hyperbola loci as complex regions. Kinematics with a given acceleration is in.
- **Diagram gives the answer away.** Never label the point a part asks for (turning points, intercepts, collision points).
- **"above".** Diagrams print *below* their text, so say "shown below".
- **Plain strings with TeX.** Always use the `t` tag. Never write `${` inside it, and never type Unicode maths symbols inside `\( \)`.
- **Same stem as an earlier set** (e.g. "The slope field shown below…"). `verify-bank` fails, so reword it.
- **Copy rules:** "practice" (never "practise"), "purchase" not "buy", and no refund talk.
