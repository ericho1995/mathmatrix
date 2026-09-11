# NAPLAN Visual Format — Design

**Status:** Phase 1 approved, in progress. Phase 2 documented, not started.

**Source:** user-supplied real ACARA 2016 NAPLAN papers — Year 7 Numeracy
(calculator) and Year 7 Numeracy (non-calculator), read via `pdftotext -layout`
(no `pdftoppm` available in this environment, so this is derived from text
layout, not a rendered visual, though the layout signal is strong enough to
be confident in the findings below).

## What real NAPLAN numeracy papers look like

- **Calculator and non-calculator are two separate booklets**, not two
  sections of one document — "Session 1" (calculator) / "Session 2"
  (non-calculator), each with its own cover, its own page numbering, its
  own "STOP — end of test" final page.
- **Cover style:** plain and bureaucratic — subject name, "calculator
  ALLOWED" / "NON-calculator", year level, year (2016), time available
  ("40min"), "Use 2B or HB pencil only", ACARA copyright line. No branding.
- **Multiple-choice options render as a horizontal row of boxes**, not a
  stacked vertical list.
- **Short-answer blanks print with the unit already there** —
  `$______`, `______ beads`, `______ millilitres` — not a generic blank line.
- **Real embedded graphics carry many questions**: tile-pattern diagrams,
  a spinner, a bar chart with a colour key, a grid/map with compass
  directions, a pictograph (`✕ = 4 animals`), simple 3D shapes, a number
  line.
- **Small data tables live inside individual questions** — a torn
  receipt, a sports-tally table, a shop-discount table. This is different
  from this app's existing `Stimulus` concept (one shared passage/table
  driving a *cluster* of questions) — these are one-off, per-question.
- Footer: ACARA copyright + centered page number, every page.

## Phase 1 — layout & structure (approved, in progress)

Applies to every existing Gr3-9 general-subject exam (Math/English), no
content rewrites required.

1. **Two-booklet split for calculator/non-calculator exams.** Currently
   `math-year_7/8/9-N` exams have both "Numeracy — non-calculator" and
   "Numeracy — calculator" as sections inside one PDF. Split these into two
   separate downloadable PDFs (own cover, own page numbering, own "end of
   test" page), matching real Session 1/2 structure. Grade 3-6 exams (no
   calculator split) and English exams (never split) are unaffected —
   still a single PDF.
2. **Horizontal MC option layout** — replace the current stacked list with
   a row of boxes, applied globally to every multiple-choice question in
   every PDF (no content change needed).
3. **Unit-suffixed short-answer blanks** — where a `short_answer` question's
   `expected_answer` carries an obvious unit (currency, a bare count noun
   like "beads", a metric unit), print the blank with that unit attached
   instead of a generic line. Needs a small optional field (e.g.
   `answer_unit?: string`) or a convention for extracting it — exact
   mechanism decided during implementation, doesn't change existing data.
4. **Plain NAPLAN-style section header** on question pages — subject name,
   calculator status (if applicable), year level, time available — closer
   to the real booklet's minimal style, replacing the current casual
   section header.
5. **Branding stays light on question pages** (per user decision) — the
   existing watermark + footer remain; only the layout/header style changes
   to match NAPLAN's structure. The branded cover page (built earlier) is
   unaffected — it's the booklet's outer cover, real NAPLAN's plain
   session-cover convention doesn't override it.

**Out of scope for Phase 1:** no diagrams, no per-question tables, no
content changes. This is a rendering/composition change only.

## Phase 2 — diagrams & per-question tables (documented, not started)

This cannot be done generically in one pass — it is new rendering
capability that has to be built diagram-type by diagram-type, and existing
content has zero diagram data to draw from, so it also requires new content
authored *with* a diagram in mind, not a retrofit of existing text-only
questions.

**Data model:** a new optional field on `Question`, e.g.
`diagram?: { kind: DiagramKind; data: unknown }`, rendered via a
`DiagramKind`-keyed component registry in the PDF layer (`@react-pdf/renderer`
supports `Svg`/`Path`/`Rect`/`Circle`/`Line` primitives, sufficient for all
the diagram types observed). Per-question tables reuse the existing
`Stimulus` `data_table` type (already defined in the type system, already
has a `body` field documented as "JSON-stringified rows for 'data_table'" —
but the PDF renderer currently just dumps `stimulus.body` as raw text
regardless of `type`, so the table-rendering path doesn't actually exist
yet) — extend the PDF stimulus renderer to parse and grid-render
`data_table` bodies, and additionally support a *per-question* (not just
per-cluster) table via the same mechanism with a 1:1 stimulus.

**Diagram types observed in the two source papers, in roughly descending
order of how often they'd recur across a full Gr3-9 bank:**
1. Bar chart (with a colour-coded key)
2. Number line (with marked/labelled points)
3. Simple geometric shapes (tiles, polygons with labelled side lengths)
4. Grid/map (coordinate grid with compass rose and labelled cells)
5. Pictograph (repeated icon = N units, with a key)
6. Spinner (a circle divided into labelled coloured sectors)
7. Simple 3D shape (a cube/prism outline, for edge/face/vertex questions)

**Recommended order to build:** bar chart and number line first (highest
reuse across number/statistics topics), then simple shapes, then the rest
as content actually needs them — don't build the full registry speculatively.

**Not designed yet, needs its own pass when this phase starts:** the exact
content-authoring workflow (how a content task's brief specifies "this
question needs a bar chart with this data" in a way an implementer subagent
can act on without needing to hand-place SVG coordinates itself).
