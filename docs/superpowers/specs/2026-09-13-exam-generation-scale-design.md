# Scaling exam paper generation

**Status:** proposal, not started
**Date:** 2026-09-13

## The problem, in numbers

Every NAPLAN section is now 30 questions. A question may be reused at most twice
across a subject's papers, so the number of genuinely distinct papers a section
can produce is `floor(pool × 2 / 30)`.

Measured against the current bank:

| Section | Pool | Distinct papers possible |
|---|---|---|
| Grade 3 Numeracy | 69 | 4 |
| Grade 3 Reading | 31 | **2** |
| Grade 3 Language Conventions | 31 | **2** |
| Grade 5 Numeracy | 68 | 4 |
| Grade 5 Reading | 31 | **2** |
| Grade 5 Language Conventions | 30 | **2** |
| Year 7 Numeracy (non-calc / calc) | 72 / 63 | 4 / 4 |
| Year 7 Reading | 32 | **2** |
| Year 7 Language Conventions | 31 | **2** |
| Year 9 Numeracy (non-calc / calc) | 78 / 63 | 5 / 4 |
| Year 9 Reading | 32 | **2** |
| Year 9 Language Conventions | 30 | **2** |

English is the binding constraint at two papers per year level. Reaching ten
papers per section across the four NAPLAN year levels needs roughly **1,500 more
questions** and about **30 more reading passages**.

Observed hand-authoring rate, from the sessions that built the current content:
roughly 100 verified items per working session. That is ~15 sessions of pure
authoring, which is not a viable path.

## Where the time actually goes

Writing a question is fast. Everything around it is slow, and this is the part
worth automating:

- verifying the arithmetic
- making distractors misconception-based rather than arbitrary
- checking the item is not a near-duplicate of something already in the bank
- checking it is calibrated to the year level rather than one or two years off
- confirming it renders — glyph coverage, diagram collisions, line breaks

Every defect found while building the current content fell into those five
categories: a Year 9 paper with four near-identical factorisations, a Grade 3
paper pitched at Year 5, an unanswerable question built from emoji the PDF font
could not render, a clock face whose hand sat on top of a numeral.

## Proposal

Four parts, in dependency order. Part 1 is a prerequisite for part 3.

### 1. `npm run verify-bank` — one verification harness

Consolidate every check currently run ad hoc into a single command that exits
non-zero on failure, wired into CI and the pre-commit hook:

- **Structural** — options unique, `correct_index` in range, `short_answer` has
  an `expected_answer`, no orphan `stimulus_id`
- **Duplication** — duplicate ids; identical stems within a year level;
  near-duplicate option sets (3 of 4 values shared)
- **Distribution** — `correct_index` spread not degenerate per year and topic
- **Rendering** — no characters outside the embedded PDF font
- **Calibration** — per-year lint rules encoding the ACARA analysis, e.g. Grade 3
  computation stays within two digits, mean/range do not appear before Year 7
- **Arithmetic** — where an explanation contains a computable expression,
  evaluate it and compare against the stated answer

This turns "did I remember to check everything?" into a command. Nothing
downstream is safe to scale without it.

### 2. Seeded composition — more papers from the same bank

Replace the fixed three-paper catalogue with a seeded composer, so a paper can be
generated on demand and reproducibly from a seed. Same pools, reuse cap applied
per paper rather than globally.

This is cheap and immediate, but it must be described honestly: it produces new
*arrangements*, not new questions. A student working through many papers will
still meet the same items. It is a variety win, not a depth win.

### 3. LLM-assisted authoring, behind the harness

A `scripts/author-batch.mjs` that takes a spec — year level, topic, count, format
mix, calculator split, target skills — and:

1. prompts a model with the year-level calibration profile derived from the real
   papers, several exemplars from that exact bucket, and the stems already in the
   bank so it can avoid near-duplicates
2. emits candidates in the bank's exact shape
3. runs every candidate through `verify-bank` plus an independent arithmetic
   re-check
4. writes only survivors; rejects go to a file with the reason attached

Human review then applies to survivors only, which is where the leverage is.

The caveat matters and should not be soft-pedalled: in this project the model has
been reliable at *generating* and unreliable at *self-verifying*. It produced
correct coin counts and a correct 285° clock angle, then placed a label off the
canvas and duplicated a question stem it had been shown. The harness, not the
model, is what makes this safe.

### 4. Parameterised templates for the mechanical tail

For genuinely formulaic items — Pythagorean triples, perimeter and area of a
labelled rectangle, index laws, place value — define a generator with constrained
parameters and misconception-derived distractors. Arithmetic is correct by
construction and variants are unlimited at zero marginal cost.

Use sparingly. This project's own review history repeatedly flagged templating as
a defect when overused ("cross-grade templating", "reused option sets"). Cap
templated items at roughly a quarter of any paper and enforce that cap in the
harness.

## Reading passages: a separate track

Passages cannot be templated and are the binding constraint on English. Two
routes:

- **Public-domain and open-licensed source texts** — out-of-copyright literature
  for narrative, government and CC-licensed factual writing for informative texts,
  adapted to length. Much faster than original composition and legally clean.
- **Original composition** where no suitable source exists.

Recommendation: public-domain sources for informative texts, original writing for
narrative, where voice and age-pitch matter most.

## Sequencing

1. **Foundation** — verification harness and CI. Blocks everything else.
2. **Quick win** — seeded composition.
3. **Scale** — batch authoring behind the harness, targeting Reading and Language
   Conventions first, since they are the two-paper bottleneck.
4. **Efficiency** — templates for the mechanical tail; the Writing domain if it
   is wanted.

## Risks and open decisions

- **Copyright.** The calibration profile is derived from real ACARA and VCAA
  papers, but no generated item may reproduce one. Worth stating explicitly in
  the repo and checking in the harness against a list of known source items.
- **Quality drift.** The harness catches mechanical faults, not dullness,
  repetitiveness of theme, or cultural insensitivity. Keep a human spot-check on
  a sample of every batch.
- **Bundle exposure.** `QUESTION_BANK` is imported by client components, so the
  entire bank — every answer and explanation — ships in the browser bundle. This
  is already a known issue; multiplying the bank tenfold makes it materially
  worse. Resolve before a large content push.
- **Off-NAPLAN years.** Years 4, 6 and 8 have no reading passages and therefore
  short Reading sections. Decide whether they are a product or just practice.
