# NAPLAN quality uplift — research, standards and rollout

**Date:** 2026-09-21 · **Status:** approved by delegation ("review the NAPLAN
papers to learn and ensure all the younger grades and year levels have quality
questionnaires and papers").

**Trigger:** the user reviewed the Year 8 papers and found them "very generic",
lacking imagery, and not the question design agreed in
`2026-09-09-naplan-question-format-design.md` and
`2026-09-11-naplan-visual-format-design.md`.

## 1. What the audit found

Measured across the NAPLAN-format pools (Maths + English, Grade 3 – Year 10):

| Pool | Questions | With a diagram |
|---|---|---|
| Grade 4 Maths | 53 | **0** |
| Grade 6 Maths | 53 | **0** |
| Year 8 Maths | 99 | **0** |
| Grade 3 / 5 Maths | 69 / 68 | 20% / 21% |
| Year 7 / 9 Maths | 135 / 141 | 25% / 13% |
| English, every year | 74–82 each | **0** |

Where diagrams exist they repeat four kinds (bar chart, number line, dot plot, a
rectangle or right triangle). The bar chart prints each bar's value under it, so
"read the graph" is really "read the label". Only 8 illustrations exist and each
is used once.

The text itself is templated: contexts pasted onto bare arithmetic ("a player's
score is calculated as −3 × (−4) + 2, where the first two numbers represent
stacked penalty multipliers"), tables typed into the stem with ASCII pipes, a
Grade 4 item that says "a column graph shows" above a typed table, near-duplicate
items, a mathematically wrong one (a square's area "modelled as A = 2a²"), Year 8
lopsided toward percentages (23 of 99) with almost no geometry, statistics or
probability, and circle area with π in Grade 6 (it is Year 8 content).

## 2. What real NAPLAN papers look like

Source: the official ACARA 2012–2016 papers for every domain and year
(`~/Downloads/NAPLAN_Past_Papers`, 2016 papers read in full, pages viewed
visually). Learned from, never copied — every PrepNest item is original.

### Numeracy item design

- **Stem shape.** One or two short context sentences about a named person doing
  something ordinary, facts on their own lines, the question alone on the last
  line. "Jane makes necklaces using beads. / She has 345 beads in 23 colours. /
  How many beads of each colour?" The maths arises from the situation; it is
  never an expression wearing a costume.
- **About half the items cannot be answered without the picture.** Observed
  across Years 3–9: pictographs with a key; spinners with shaded, labelled
  sectors; growing tile patterns; shapes on square grids; composite shapes with
  dashed joins; balance scales; measuring jugs, broken rulers and thermometers;
  price tags and receipts (one torn); maps on lettered grids with a compass rose
  and a scale key; grouped column graphs with a key; line graphs; dot plots;
  two-way tables and Venn diagrams; nets and isometric solids ("not to scale");
  parallel lines cut by a transversal; triangles on a Cartesian plane for
  transformations; clocks; calendars; timetables.
- **Answers are often pictures.** "Which of these models did Jack make?" (nets),
  "Select the dot plot that correctly displays the data", "Which table correctly
  shows the animals?" (pictographs), four candidate graphs of a ball's path,
  four shaded Venn diagrams, four number lines.
- **Item types beyond "calculate":** which statement is true / always true /
  possible; which number sentence could solve this; which story matches this
  number sentence; logic with bulleted clues; estimation ("about how much");
  select the correct display; reverse problems.
- **Short answer runs 25–31%**, printed with the unit on the blank:
  `$ ____`, `____ beads`, `____ millilitres`, `____ degrees`, `____ cm²`.
- **Calculator vs non-calculator** (Years 7 and 9): non-calculator items use
  numbers chosen for mental and written methods; calculator items use realistic,
  messy values (fuel economy 6.85 L/100 km, flour at $3.62/kg).
- Distractors come from real errors: the wrong operation, a place-value slip,
  perimeter for area, forgetting a step.

### Language Conventions design

- **About half is spelling**: a circled misspelt word to correct, then "one word
  in this sentence is misspelt — write it correctly".
- The rest: inline-blank completion ("Which word correctly completes this
  sentence?"), four candidate sentences (which is punctuated correctly / is
  correct / is not correct), which sentence needs an apostrophe, what
  punctuation is missing, word classes, verb tense and agreement.

### Reading design

- A magazine of 7–8 texts in **different genres** per paper: explanation,
  illustrated information page with captions, narrative, persuasive sign with a
  picture, classic-literature excerpt, two reviews side by side with star
  ratings, poem, procedure.
- Questions: literal retrieval, inference, vocabulary in context, author's
  purpose, **text features** (why the exclamation marks, what the stars mean,
  purpose of the picture), comparing two texts, sequencing.

PrepNest's reading passages today are 4 plain-prose texts per year level
(narrative, persuasive, information) — no signs, reviews, procedures with
diagrams, poems or paired texts.

## 3. Authoring standard

Every new or rewritten NAPLAN-format item must meet all of these. They are the
review checklist.

1. **Situation first.** The context is one the operation genuinely arises from.
   No expressions dressed up as stories. No "calculated as", "represented by",
   "modelled as" unless modelling is the skill being tested.
2. **Short stem.** Facts on separate lines; the question on the last line.
3. **Pictures carry information.** If a real paper would show a graph, table,
   figure, map, instrument or object, the item has a diagram. Tables are never
   typed into `question_text`.
4. **A diagram never gives the answer away.** Charts are read from an axis, not
   from printed values.
5. **Vary the picture.** Within a year-level pool no single diagram kind exceeds
   ~15% of graphical items, and repeated kinds vary in style (orientation,
   shading, grid type, instrument, layout).
6. **Mix the item types** — calculate, choose the statement, choose the display,
   estimate, reverse, logic clues — and use picture options where the real test
   does.
7. **Distractors are real mistakes**, each explainable in one sentence.
8. **25–30% short answer**, with the unit in `expected_answer` so the blank
   prints it.
9. **Calibrated to AC v9.0** for the year level; calculator items only in
   calculator sections, and only where a calculator is actually needed.
10. **Explanations teach**: the working in one to three steps, naming the trap.
11. Checked by `npm run verify-bank` (structure, answer-position spread, glyphs,
    duplicates, calibration, diagram validity) **and** by rendering the paper and
    looking at every diagram.

## 4. Diagram engine

The PDF renderer grows from 11 diagram kinds to about 30, moved out of the
885-line `ExamPaperDocument.tsx` into `src/lib/pdf/diagrams/`, one file per
family. Every kind is **parametric data**, not artwork — authoring a new picture
means writing a few lines of typed data, which is what makes variety cheap and
reviewable in a diff.

New kinds, each with style variants:

| Family | Kinds |
|---|---|
| Data displays | `bar_chart` (upgraded: axis, gridlines, horizontal, grouped series with key, shading), `line_graph`, `pie_chart`, `pictograph`, `stem_leaf`, `data_table` styles (grid, receipt, torn receipt, price list, tally, timetable) |
| Chance | `spinner`, `venn` (2 or 3 sets, values or shaded regions) |
| Geometry | `figure` (general: points, segments, angle arcs, right-angle marks, equal-side ticks, parallel arrows, dashed lines, circles, "not to scale"), `grid_shape` (square or dot grid, shaded cells, outlines, symmetry lines), `coordinate_plane` (points, polygons, transformations), `solid` (cuboid, isometric cube stacks, cylinder, cone, pyramid, prism), `net` |
| Measurement | `measure` (ruler incl. broken ruler, jug, thermometer, scale dial, protractor), `clock` (analogue or digital), `balance`, `calendar` |
| Number | `number_line` (upgraded: jumps, open/closed points, rays for inequalities), `fraction_model` (bar, circle, grid), `bar_model` (tape diagrams for ratio), `place_value` (MAB blocks), `array`, `money` (Australian coins and notes), `tile_pattern` (growing patterns) |
| Maps | `grid_map` (upgraded: compass rose, route) |

**Picture options:** multiple-choice items gain optional `option_diagrams`, drawn
as a 2×2 grid of lettered panels.

**Short-answer units** extend to `cm²`, `m³`, `°`, `%`, `mL`, `km/h`.

**Free on-screen quiz:** it strips diagrams, so a diagram-dependent question is
unanswerable there. Until the browser can draw them, diagram questions are
excluded from the free quiz.

**Review tooling:** a development-only route renders any pool or a gallery of
every diagram kind as a PDF, so every picture is looked at before it ships.

## 5. Rollout

Each phase is committed and pushed on its own; the ledger in
`docs/superpowers/plans/2026-09-21-naplan-quality-uplift.md` tracks progress.

1. **Engine** — diagram modules, new kinds, picture options, units, free-quiz
   exclusion, verify-bank checks, preview route. Visual check of every kind.
2. **Year 8 Numeracy** — the pool the user reviewed. Replace the 99 generic
   items with ~90 new ones: ≥50% graphical across ≥15 kinds, 25–30% short answer,
   balanced across all six strands, calculator and non-calculator.
3. **Grade 4 and Grade 6 Numeracy** — both at 0% graphical; same treatment.
   Remove Grade 6 circle-area items (Year 8 content).
4. **Grade 3, Grade 5, Year 7, Year 9 Numeracy** — replace typed tables and
   text-only data items with diagram versions and add variety to reach ~50%.
5. **Language Conventions, all years** — rebalance toward spelling in the
   circled-word and find-the-error formats; inline-blank completions; the full
   range of punctuation and grammar item types.
6. **Reading, all years** — new genres: signs, reviews, procedures with
   diagrams, poems, paired texts, illustrated information pages; text-feature
   questions.

Year 10 (not a NAPLAN year, already 43% graphical) and Science follow later.
