# NAPLAN quality uplift — progress ledger

Spec: `docs/superpowers/specs/2026-09-21-naplan-quality-uplift-design.md`.
Branch: `feat/website-ux` (builds on the website work). Push after every phase.

Reference papers: `~/Downloads/NAPLAN_Past_Papers` (ACARA 2012–2016). To view
pages: `naplan-ref` launch config serves them; `viewer.html?f=/ref/<path>&p=<page>&n=<count>`.
Learn from them; never copy an item.

After any bank edit: `npm run gen` then `npm run verify-bank`. Never edit
`bank.ts` with Python on Windows (CRLF breaks the generators) — use Node or Edit.

## Phase 1 — Diagram engine
- [ ] Move diagram renderers to `src/lib/pdf/diagrams/`
- [ ] Upgrade `bar_chart` (axis, gridlines, horizontal, grouped + key), keep old data rendering
- [ ] New kinds: see spec §4
- [ ] `option_diagrams` on multiple choice (2×2 grid)
- [ ] Short-answer units: cm², m³, °, %, mL, km/h
- [ ] Free quiz excludes diagram questions
- [ ] verify-bank validates every diagram kind
- [ ] Dev preview route + gallery; every kind viewed

## Phase 2 — Year 8 Numeracy
- [ ] ~90 new items, ≥50% graphical, ≥15 kinds, 25–30% short answer, all strands
- [ ] Old Year 8 maths items removed
- [ ] Rendered and reviewed

## Phase 3 — Grade 4 and Grade 6 Numeracy
- [ ] Grade 4 new pool
- [ ] Grade 6 new pool (no circle area / π)

## Phase 4 — Grade 3, 5, Year 7, 9 Numeracy uplift

## Phase 5 — Language Conventions, all years

## Phase 6 — Reading genres, all years
