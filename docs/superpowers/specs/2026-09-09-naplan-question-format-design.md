# NAPLAN-style question format & content pilot — design

Status: approved by user 2026-09-09, pending spec review.

## Context

PrepNest's practice content is meant to prepare Australian students for real
standardised tests (NAPLAN for Grade 3-9, VCE exams for Year 11-12 selective
subjects), but the current question bank (`src/lib/questions/bank.ts`, 910
questions) is a flat pool of standalone, single-step, context-free MC items —
e.g. "What is 47 + 36?", "Solve: x + 7 = 15". Real NAPLAN and VCE papers look
nothing like this: NAPLAN Reading gives students a shared passage/article with
a cluster of questions about it; NAPLAN Numeracy splits Year 7/9 into a
non-calculator and a calculator section; VCE papers use multi-part
extended-response questions with per-part marks and (for Maths) a tech-free
vs CAS-active exam split.

This is a multi-subject overhaul too large for one pass. This spec covers
**only the first sub-project**: a data-model foundation for authentic exam
formatting, piloted on NAPLAN-style Maths + English content for Grade 3-9.
Later sub-projects (VCE Maths trio, VCE English, VCE Physics/Chemistry) get
their own brainstorm → spec → plan cycles and are only sketched here as
rollout order, not designed.

Already completed as an independent prep task (not part of this spec's
implementation): renamed VCE "Further Mathematics" → "General Mathematics"
(subject slug `further_maths`→`general_maths`, topics `fm_*`→`gm_*`) to match
VCAA's current 2023-2027 study design. Code-side rename is done; the DB-side
enum rename (`supabase/schema_general_maths_rename.sql`) is written but not
yet run against the live project — needs to run, in the Supabase SQL editor,
before the next `seed.sql` load (see updated Supabase reference memory).

## Goals

1. Let a question optionally reference a **shared stimulus** (a passage,
   article, or data table) so multiple questions can be asked about one piece
   of reading/data, matching NAPLAN Reading and (later) VCE English/Science.
2. Let a practice exam be composed of **named, timed sections** (e.g.
   "Reading", "Language Conventions", "Numeracy — non-calculator", "Numeracy —
   calculator") instead of one flat list of 10 questions, matching how NAPLAN
   papers are actually structured.
3. Rewrite/expand the Grade 3-9 Maths and English content so it reads like
   real NAPLAN items: contextualized, appropriately multi-step per year
   level, well-designed distractors, calculator-appropriate for Yr7-9
   Numeracy, and backed by real shared reading passages.
4. Do all of this without breaking Science or the existing VCE selective
   content, which stay on the current flat/standalone format until their own
   future sub-projects.

## Non-goals (deferred to later sub-projects)

- Multi-part sub-questions ((a)/(b)/(c) with individual mark values) — a VCE
  Maths/Science need, not a NAPLAN one. Not designed here.
- Technology-active vs tech-free exam flagging — VCE Maths concept only.
- Formula/data sheets — VCE Maths/Science/Physics/Chemistry concept only.
- VCE English as a new selective subject — separate future sub-project.
- Expanding VCE Physics/Chemistry topic coverage — separate future sub-project.

## Data model changes

### 1. `Stimulus` entity (new)

New file `src/lib/questions/stimuli.ts`, same pattern as `bank.ts` (static
TS array, source of truth, mirrored into Supabase for admin/FK purposes only
— practice-time reads still come from the TS file, consistent with how
`bank.ts` already works today).

```ts
export type StimulusType = 'passage' | 'data_table' | 'image'

export interface Stimulus {
  id: string
  type: StimulusType
  title: string
  body: string            // markdown/plain text for 'passage'; JSON-stringified rows for 'data_table'; image URL for 'image'
  subject: SubjectSlug
  year_level: YearLevel
  word_count?: number      // 'passage' only, informational — used to sanity-check length against grade band
}
```

`Question` (in `src/types/index.ts`) gains one new optional field on
`QuestionBase`:

```ts
stimulus_id?: string   // FK into Stimulus — questions sharing an id are asked about the same passage/data
```

This is additive and optional — every existing question (no `stimulus_id`)
keeps working unchanged in both the DB and `QuizRunner.tsx`.

### 2. Sectioned `PracticeExam`

`PracticeExam` (in `src/lib/questions/exams.ts`, auto-generated) changes from
a flat `questionIds: string[]` to:

```ts
export interface PracticeExamSection {
  title: string                 // e.g. "Reading", "Numeracy — calculator"
  time_minutes: number          // approximate practice-purpose timing, not an official NAPLAN figure
  calculator_allowed?: boolean  // Numeracy sections only
  question_ids: string[]        // in display order; questions sharing a stimulus_id stay contiguous
}

export interface PracticeExam {
  id: string
  subject: SubjectSlug
  yearLevel: YearLevel
  title: string
  sections: PracticeExamSection[]
  premium: boolean
}
```

Subjects not yet migrated to sectioned content (Science, current VCE) get a
single synthesized section (`{ title: 'Questions', time_minutes: <existing
estimate>, question_ids: <existing flat list> }`) so nothing downstream
breaks — `QuizRunner.tsx` only ever needs to know how to render "a list of
sections, each a list of questions," never a subject-specific special case.

### 3. `gen-exams.mjs` rework

- Keep the existing least-used-first flat composer as the fallback for
  subjects without section rules.
- Add a NAPLAN-aware composer for `math`/`english` at `grade_3`...`year_9`
  that: groups questions by `stimulus_id` (keeping each group contiguous and
  intact within one section — never splits a passage's questions across two
  exams), builds a Reading section from `reading_comprehension` /
  `reading_literary_analysis`, a Language Conventions section from
  `grammar_punctuation` + `vocabulary`, and a Numeracy section (or two, for
  Yr7-9) from the remaining Maths topics. Exact per-section question counts
  and timings are a content-authoring decision made during implementation
  (informed by the audit reports and how many stimuli actually get written),
  not pinned in this spec.

### 4. Supabase schema migration

New file `supabase/schema_stimuli.sql`, following the existing pattern
(`schema_topics_and_longform.sql`) of a guarded, idempotent, standalone
migration:

```sql
create table if not exists stimuli (
  id          uuid primary key,
  type        text not null check (type in ('passage', 'data_table', 'image')),
  title       text not null,
  body        text not null,
  subject     subject_slug not null,
  year_level  year_level not null,
  word_count  integer,
  created_at  timestamptz not null default now()
);

alter table questions add column if not exists stimulus_id uuid references stimuli(id);
```

Must run before the next `seed.sql` load (same "new enum/table before the
upsert that uses it" ordering rule as every prior migration in this repo).

### 5. `QuizRunner.tsx` rendering

When the current question (or the next N questions) share a `stimulus_id`,
render the stimulus (passage text, or a formatted data table) alongside the
question, staying visible while the student answers each question in that
group — mirroring how a real NAPLAN reading magazine stays open across a
cluster of questions. No stimulus reference → renders exactly as today.

## Content plan for the pilot

Grade bands and the NAPLAN sections each maps to:

| Grade band | Reading | Language Conventions | Numeracy |
|---|---|---|---|
| Gr 3 | 1-2 short passages, ~5-6 Qs total | spelling + grammar in-context | single section, no calculator |
| Gr 4-5 | 2 passages, ~6-8 Qs total | spelling + grammar in-context | single section, no calculator |
| Gr 6 | 2-3 passages, ~8 Qs total | spelling + grammar in-context | single section, no calculator |
| Yr 7-9 | 2-3 passages/articles, ~8-10 Qs total, more inferential | spelling + grammar in-context, more complex texts | two sections: non-calculator then calculator |

Exact volumes depend on the audit findings (in progress — see below) plus
how much new content is written; this table sets direction, the
implementation plan pins numbers.

## Audit process

Two research agents (already dispatched, running as of this spec) are
independently reviewing the full current Maths and English Gr3-9 content
against real NAPLAN item style and reporting, per (topic, year_level) cell:
question count, a KEEP/REWRITE/EXPAND verdict, concrete examples, and (for
English) an estimate of how many shared passages are needed. Their reports
feed directly into the implementation plan's content-authoring task
breakdown — this spec does not re-litigate their findings, it just defines
the format they'll be authored into.

## Testing

- `npx tsc --noEmit` after every type/schema change.
- `node scripts/gen-seed.mjs` and `node scripts/gen-exams.mjs` must run clean
  end-to-end against the new `bank.ts`/`stimuli.ts` and produce a valid
  `exams.ts`/`seed.sql`.
- Manual QuizRunner smoke test: one stimulus-backed Reading question group,
  one plain non-stimulus question, one Yr7-9 calculator-flagged Numeracy
  section — confirm rendering and that scoring/XP/attempt-saving (all of
  which had prior silent-failure bugs on this project) still work end to end
  against the live Supabase project, not just that the build passes.
- No live-DB verification is needed for `stimuli`/`stimulus_id` until the
  migration is actually run by the user — until then, all dev/testing reads
  from the static TS files exactly as `bank.ts` does today.

## Rollout order after this pilot

1. **This spec**: NAPLAN-style Maths + English, Gr 3-9.
2. VCE Maths trio (General Mathematics, Maths Methods, Specialist
   Mathematics): multi-part sub-questions with per-part marks, tech-free vs
   CAS-active exam split, formula sheets. Own spec.
3. VCE English (net-new selective subject): Text Response, Comparative
   Analysis, Analysing Argument. Own spec.
4. VCE Physics/Chemistry: expand from 2 to 4 areas of study each, data-based
   multi-part structured questions, data/formula sheets. Own spec.
