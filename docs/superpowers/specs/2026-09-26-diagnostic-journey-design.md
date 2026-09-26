# The parent journey: diagnostic test → report → tailored exam

Requested by the owner on 2026-09-26: "Parents want to help their child with
their learning — NAPLAN, VCE or the years in between — but they don't know how.
A test based on year level (and for the senior years a subject such as Methods
or Specialist) pinpoints what the child is good at and weak at, so we can make
an exam catered to them. Create this end to end."

## Decisions made by the owner

| Question | Decision |
|---|---|
| How is the tailored exam made? | **Automatically and instantly**, from the question bank, weighted to the weak areas. |
| What is free? | **The test and the full report.** The tailored exam is included in the Grade 3 – Year 10 plan; for VCE it is sold like a VCE paper ($20). Anyone else sees a preview of it. |
| When is an account needed? | **After the test.** The child starts straight away; headline results show to anyone; a free account unlocks the full report, saves it and builds the exam. |
| What does one test cover? | **One subject.** Grade 3 – Year 10: Maths, English (Language Conventions), Reading, or Science where the site offers it. Years 11–12: one VCE subject. |

## The journey

1. **Homepage** leads with the parent's problem: *find out exactly where your
   child needs help*. Primary call to action: **Start the free diagnostic
   test** → `/diagnostic`. The papers library stays below it.
2. **`/diagnostic`** — the parent picks the year level, the subject, and
   optionally the child's first name. The page says how long it takes and how
   to run it (let them work alone; paper for working is fine).
3. **`/diagnostic/test`** — the child sits it on screen: one question at a
   time, large type, progress bar, *Back*, and *I'm not sure* (a skip, which
   is better diagnostic evidence than a guess). No marking during the test.
   Diagrams and typeset maths render on screen. Progress is kept in
   `localStorage`, so a refresh or a break loses nothing.
4. **Submit** — graded on the server.
   - Signed in: saved straight away → `/diagnostic/report/[id]`.
   - Signed out: `/diagnostic/results` shows the **headline** — overall score
     and every area with its level — and asks for a free account to see the
     rest. After sign-up the result is claimed into the account and the full
     report opens.
5. **The report** (`/diagnostic/report/[id]`, account only):
   - summary in plain English: strengths, what is developing, focus areas;
   - one card per area, weakest first: level, score, the specific skills
     answered right and wrong, what the area covers, **three concrete ways to
     help at home**, and a link to free practice on that topic;
   - every question reviewed: the child's answer, the right one, the
     explanation;
   - **the tailored exam** card, near the top;
   - what to do next: sit the exam, mark it, practice the gaps, re-test in a
     few weeks.
6. **The tailored exam** — a printable paper and separate answer key built
   for this result, downloadable from the report. Plan holders (Grade 3 –
   Year 10) and buyers (VCE) get it whole; everyone else gets the preview (the
   first third, then a page describing the rest). After sitting it, the paper
   can be marked on screen (`/diagnostic/report/[id]/mark`) for an updated
   topic breakdown.
7. **Dashboards** — the parent (and teacher) dashboard lists every diagnostic
   saved on the account or on a linked student's account, with links to the
   reports.

## What the test measures

### Areas and skills

The report's unit is an **area** — what a parent recognises as "a part of the
subject" — and inside it **skills**, the specific things tested.

| Subject | Areas | Skills |
|---|---|---|
| Maths (Gr 3 – Yr 10) | The bank topics: Number & Operations, Number Patterns (Gr 3–6) or Algebra & Equations (Yr 7–10), Geometry & Measurement, Statistics & Probability | Classified from the question: e.g. Fractions, Decimals, Money, Time, Area & perimeter, Angles, Reading graphs, Chance… |
| English (Language Conventions) | Spelling, Punctuation, Grammar, Vocabulary — classified from the question, because the bank's two topics are too coarse to help a parent | The same four (the area is the skill) |
| Reading | Finding information, Inferring, Word meaning, Purpose & structure — classified from the question stem | The same |
| Science (Gr 6, Yr 8, Yr 10 — the years the catalogue offers it) | Life, Physical, Earth & Space | Topic-level |
| VCE subjects | The areas of study (bank topics) | Topic-level; the question review carries the detail |

Skills come from a rule-based classifier (`src/lib/diagnostic/areas.ts`):
diagram kind first (a clock is *Time*, a spinner is *Chance*), then keywords in
the question. The curriculum codes were checked and are too loosely applied to
name skills from (one English code covers both spelling and capital letters).
The classifier is unit-tested against the whole bank: every diagnosable
question must land in an area, and the distribution is printed for review.

### Blueprint (length and spread)

| Test | Questions | About |
|---|---|---|
| Maths Gr 3–6 | 24 (number 8, patterns 4, geometry & measurement 7, statistics 5) | 25 min |
| Maths Yr 7–10 | 28 (number 7, algebra 7, geometry & measurement 8, statistics 6) | 30 min |
| English | 20 (spelling 6, punctuation 5, grammar 5, vocabulary 4) | 15 min |
| Reading | two texts, about 12 questions | 20 min |
| Science | 12 (4 per area) | 12 min |
| VCE | 20–24 multiple choice, at least 3 per area of study | 30–35 min |

Within an area the picks spread across difficulty (foundation → advanced) and
across skills, at random but from a seeded generator so a result can be
re-derived. The paper runs easiest first, areas interleaved. Only questions
the screen can show exactly are used: multiple choice and short answer, with
or without a diagram; not extended response or long form; reading texts only
in Reading.

### Scoring

Per area: correct ÷ asked (a skip counts as not correct).

- **Strength** — 75% or more
- **Developing** — 50–74%
- **Focus area** — under 50%

The overall line says what the test found, not a national standard: "Mia
answered 17 of 24 correctly. Number and statistics are strengths; measurement
is the area to focus on." The report says plainly that a short diagnostic is a
snapshot, not a formal assessment.

## The tailored exam

Composed on the server from the result, deterministically (seeded by the
result id), so the paper, the answer key and the marking screen always agree.

- **Weighting.** Each area's share follows its need (`1 − score`, with a
  floor), so focus areas get most of the paper and strengths keep a few
  questions to stay sharp. Every area gets at least two.
- **Difficulty.** Focus areas start at foundation/developing and climb; a
  strength is stretched with proficient/advanced questions.
- **New questions first.** Diagnostic questions are excluded, except a closing
  "Second chance" section of up to five questions the child got wrong.
- **Shape.**
  - Maths Gr 3–6: 30 questions, one section. Yr 7–10: 32, split into
    non-calculator and calculator sections like NAPLAN.
  - English: 30. Science: 15–20.
  - Reading: three unseen texts chosen for the weak skills, printed with their
    questions.
  - VCE: Section A multiple choice (about 15) and Section B extended response
    (3–4 questions from the weakest areas of study), reading time, and the
    formula sheet where the subject has one. Year 11 uses long-answer questions
    for Section B.
- **The cover** names the child and lists the focus areas, so the parent can
  see the paper was built for them.
- Rendered by the existing `ExamPaperDocument` / `AnswerKeyDocument` from a
  synthetic `PracticeExam` (`id: tailored-<resultId>`). `resolveExam` gains a
  reusable `hydrateExam(exam)` (a deferred item from 2026-09-10).

### Access

| Year level | Full paper and answer key | Otherwise |
|---|---|---|
| Grade 3 – Year 10 | active plan, admin, or an old year-level bundle for that year | preview |
| Year 11–12 | purchased (`paper_purchases.exam_id = 'tailored-<resultId>'`), or admin | preview + purchase button ($20) |

Checkout gains `{ tailoredId }`; the webhook is unchanged (it already
upserts `paper_purchases` from `metadata.exam_id`).

## Architecture

### Engine — `src/lib/diagnostic/` (pure, unit-tested with `node --test`)

| Module | Does |
|---|---|
| `types.ts` | Shared types |
| `rng.ts` | Seeded PRNG and string hashing |
| `areas.ts` | Area and skill classification per subject |
| `blueprint.ts` | Which (year, subject) tests exist, their length and allocation |
| `select.ts` | Picks and orders a test's questions |
| `score.ts` | Grades responses and builds the report model |
| `tailor.ts` | Composes the tailored exam |
| `guidance.ts` | Parent guidance per area: what it covers, how to help at home |
| `token.ts` | HMAC-signed test tokens and result receipts |

The modules take the question bank as a parameter and import each other with
explicit `.ts` extensions (`allowImportingTsExtensions`), so the Node test
runner can load them without Next.js — the pattern `vceSets.ts` set.

### On-screen questions — `src/lib/web/`

The PDF diagrams are react-pdf components whose primitives are plain element
types (`'SVG'`, `'LINE'`, `'VIEW'`…). `pdfToHtml.ts` walks that element tree
on the server — calling the (hook-free) components, mapping each primitive to
its SVG/HTML equivalent — and returns markup. So the screen draws exactly the
diagram the paper prints, with no second implementation and no diagram code
shipped to the browser. Maths uses the MathJax glyph cache the PDFs already
use (`math/cache.json`), drawn as inline SVG. `questionHtml.tsx` turns a
question into `{ stem, options, diagram, optionDiagrams }` HTML strings.

### API

| Route | Does |
|---|---|
| `POST /api/diagnostic/start` | `{ year, subject, name? }` → `{ token, questions }`. Questions carry HTML and no answers. |
| `POST /api/diagnostic/submit` | `{ token, answers }` → grades. Signed in: saves → `{ id }`. Signed out: `{ receipt, headline }`. |
| `POST /api/diagnostic/claim` | `{ receipt }` (signed in) → saves once → `{ id }` |
| `GET /api/diagnostic/[id]/exam?doc=paper\|answers` | The tailored exam PDF, gated as above |
| `GET /api/dev/diagnostic` | Dev only: report data and exam PDFs from a sample, no account |
| `GET /api/dev/diagrams-web` | Dev only: every diagram in the gallery drawn for the screen |

**Tokens.** `start` signs the question ids, year, subject, name and time with
an HMAC key derived from `SUPABASE_SERVICE_ROLE_KEY` (no new environment
variable). `submit` grades only the questions its token names, so it cannot be
used to look up answers to arbitrary questions. The anonymous **receipt** is
the token plus the answers, signed again; `claim` re-grades from the answers
and never trusts a client score. Receipts expire after 30 days and each can be
claimed once.

### Data — `supabase/schema_diagnostics.sql`

```sql
create table public.diagnostic_results (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  child_name   text check (char_length(child_name) <= 40),
  year_level   text not null,
  subject      text not null,
  responses    jsonb not null,      -- [{ id, a }] in the order asked
  correct      int not null,
  total        int not null,
  areas        jsonb not null,      -- [{ id, label, correct, total, level }] for lists
  receipt_ref  text unique,         -- a claimed receipt cannot be claimed twice
  created_at   timestamptz not null default now()
);
```

RLS: read your own rows, or a linked student's (`student_profiles.parent_id =
auth.uid()`); delete your own. **No insert policy** — rows are written by the
server with the service role after it has graded them, so a result cannot be
forged through PostgREST. The report is recomputed from `responses` on every
view, so explanations stay current; `areas` is only a cache for lists.
`check-live-schema.mjs` learns the new table.

If the table is missing (migration not yet run), saving fails loudly: the
results page says the report could not be saved, keeps the receipt, and
offers to retry. Nothing is silently dropped.

## Site changes

- **Homepage**: new hero and "how it works" around the diagnostic, with a
  sample report built from the real report components (labelled "Sample").
  The papers library, look-inside, pricing and FAQ stay, below.
- **Navbar**: "Diagnostic test" link; the header button becomes "Free
  diagnostic test".
- **NAPLAN, VCE, pricing, help**: a diagnostic call to action; pricing says
  the tailored exam is included in the plan and $20 for VCE; new FAQs.
- **Parent dashboard**: a "Diagnostic tests" list.
- **Privacy page**: diagnostic answers and the optional first name are stored
  with the account.
- Sitemap: `/diagnostic`. The test, results and report pages are `noindex`.

Copy follows the house rules: *practice* for the verb too, *purchase* not
*buy*, no refunds, no testimonials or usage numbers.

## Rollout

1. Merge only after `supabase/schema_diagnostics.sql` has been run in the SQL
   editor; `node scripts/check-live-schema.mjs` reports it. Without it, the
   test and the anonymous headline work, but saving a report fails (loudly).
2. No new environment variables. Stripe is unchanged: VCE tailored exams use
   the existing `STRIPE_PRICE_VCE_PAPER`.

## Testing

- Unit (`npm test`): classifier coverage over the whole bank, blueprint
  feasibility for every offered (year, subject), selection (size, spread, no
  duplicates, determinism), scoring and levels, tailored composition (size,
  weighting, exclusions, determinism, second chance), token sign/verify/expiry
  and tamper rejection.
- `npm run type-check`, `npm run lint`, `npm run build`, `npm run verify-bank`.
- Browser, on the dev server: every diagram kind drawn on screen against the
  PDF gallery; a full anonymous run for Maths Gr 3, Maths Yr 9, English, Reading,
  Science and Specialist; the report and both tailored PDFs rendered from the
  dev route and read page by page; phone width (390 px) for the test and report.
- Signed-in paths (save, claim, dashboard, checkout) cannot be exercised here —
  signing in goes through the live Supabase project. They are covered by the
  unit tests of the pieces they call and listed for the owner to try after the
  migration runs.
