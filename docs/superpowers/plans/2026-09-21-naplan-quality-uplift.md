# NAPLAN quality uplift — progress ledger

Spec: `docs/superpowers/specs/2026-09-21-naplan-quality-uplift-design.md`.
Branch: `feat/website-ux` (builds on the website work). Push after every phase.

Reference papers: `~/Downloads/NAPLAN_Past_Papers` (ACARA 2012–2016). To view
pages: `naplan-ref` launch config serves them; `viewer.html?f=/ref/<path>&p=<page>&n=<count>`.
Learn from them; never copy an item.

After any bank edit: `npm run gen` then `npm run verify-bank`. Never edit
`bank.ts` with Python on Windows (CRLF breaks the generators) — use Node or Edit.

## Phase 1 — Diagram engine — DONE (b2e3c6a)
- [x] Renderers in `src/lib/pdf/diagrams/`, 33 kinds, all pure SVG except legacy `simple_shape` and the plain `data_table` grid
- [x] `bar_chart` reads from an axis when `yStep` is set (always set it)
- [x] `option_diagrams` on multiple choice (2×2 grid, captions in `options`)
- [x] Units on blanks: cm², m³, °, %, mL, km/h
- [x] Free quiz serves only quiz-playable items (no diagram / passage / extended response)
- [x] verify-bank: diagram structure, typed tables, missing pictures, variety per year
- [x] Gallery: `GET /api/dev/diagrams` (dev + localhost only); samples in `src/lib/pdf/diagrams/gallery.ts`

Authoring notes: figure coordinates are y-up inside width × height; label a
vertical segment with labelSide to push its label clear; spinner sectors run
clockwise from the top; venn regions A B C AB AC BC ABC none.

## Phase 2 — Year 8 Numeracy — DONE
- [x] 96 new items (48 calculator / 48 non-calculator): 63% graphical across 20 picture kinds, 29% short answer, all strands (30 number, 18 algebra, 28 geometry, 20 statistics), answer positions balanced per strand
- [x] The 99 old items removed (BANK_PART_11 replaces them)
- [x] Every item rendered and read (`/api/dev/pool?year=year_8&subject=math`)
- [x] Composer: picture options count as graphical, papers ordered easy → hard, and a session tops up with picture items when plain ones run out (paper 3 was 21 questions)

Authoring workflow that worked: write items as data (`topic, difficulty, calc, q, options/correct or sa+answer, e, code, diagram/option_diagrams`), run the builder with `--dry` to check shares/variety/positions, then write, `npm run gen`, `npm run verify-bank`, render the pool and read every page.

## Phase 3 — Grade 4 and Grade 6 Numeracy — DONE
- [x] Grade 4: 60 new items (BANK_PART_12, replaces 53): 65% graphical across 20 picture kinds, 27% short answer; MAB blocks, coins, clocks, calendar, jug, ruler, grid map, picture-option angles / solids / symmetry / pictographs
- [x] Grade 6: 60 new items (BANK_PART_13, replaces 53): 57% graphical across 18 kinds, 25% short answer; receipts, price lists, protractor, coordinate plane, translations, stem-and-leaf, integers in context; no circle area / π
- [x] Every item rendered and read (`/api/dev/pool?year=grade_4&subject=math`, `grade_6`)
- [x] Composer fills strand quotas (number 50%, measurement and space 30%, statistics 20%) and spreads the picture target across strands — one Grade 6 paper had 4 geometry questions and the next 11
- [x] Renderer fixes from the read-through: tables size to their contents and centre columns after the first (headers overflowed and sat left of their values), grid-shape keys widen the canvas instead of being clipped, and words never hyphenate across lines

## Phase 4 — Grade 3, 5, Year 7, 9 Numeracy — DONE
Every NAPLAN year's Numeracy pool is now rewritten (Grades 3–6, Years 7–9).
- [x] Grade 3: 61 items (BANK_PART_14, replaces 69): 72% graphical, 22 kinds, 28% short answer
- [x] Grade 5: 60 items (BANK_PART_15, replaces 68): 70% graphical, 23 kinds, 28% short answer; 24-hour time, timetable, protractor, nets, reflections, map scale, pie chart, dot plots
- [x] Year 7: 96 items (BANK_PART_16, replaces 135): 48 calculator / 48 non-calculator with equal strand mixes, 60% graphical, 19 kinds, 31% short answer
- [x] Year 9: 96 items (BANK_PART_17, replaces 141): same split, 52% graphical, 19 kinds, 32% short answer; Pythagoras, trigonometry, similarity, cylinders, gradient / midpoint / distance, non-linear graphs, compound probability, two-way tables
- [x] Every pool rendered and read; paper 3 in every year now has pictures (the old pools ran out)
- [x] Renderer fixes: coins and dot plots size to their contents (were shrunk as picture options), balance blocks readable and stacks hang lower, spinner colours share a shade, price lists keep their bottom edge, tile-pattern and figure labels get the room they need, prism height label clear of hidden edges
- [x] verify-bank rejects a measure labelEvery that is not a whole number of marks, and readings between marks
- [x] Dev pool route takes &from=&to= to render a slice

Dev note: garbled glyphs in a dev render (e.g. "2¹⁵" printing as "¹⁵") came from a dev server left running through `npm run build`; a fresh server renders correctly. Stop the dev server before building.

## Phase 5 — Language Conventions, all years

## Phase 6 — Reading genres, all years
