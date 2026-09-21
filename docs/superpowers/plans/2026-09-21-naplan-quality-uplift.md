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

## Phase 3 — Grade 4 and Grade 6 Numeracy
- [ ] Grade 4 new pool
- [ ] Grade 6 new pool (no circle area / π)

## Phase 4 — Grade 3, 5, Year 7, 9 Numeracy uplift

## Phase 5 — Language Conventions, all years

## Phase 6 — Reading genres, all years
