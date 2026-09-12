-- VCE Unit 3 & 4 support.
--
-- Adds the two Mathematical Methods areas of study the bank was missing
-- (functions/graphs and algebra), the extended-response question format, the
-- year_12 year level, and a column to hold the parts of a multi-part question.
--
-- Run this in the Supabase SQL editor BEFORE re-running seed.sql — the seed now
-- contains rows using these values and will fail against a database that does
-- not have them. Safe to re-run.
--
-- Note: Postgres will not let a newly added enum value be *used* in the same
-- transaction that adds it. This file only adds values and a column, so it is
-- safe as one script; seed.sql must be a separate query afterwards.

-- ─── Topic slugs: the two missing Methods areas of study ─────────────────────
alter type topic_slug add value if not exists 'mm_functions';
alter type topic_slug add value if not exists 'mm_algebra';

-- ─── Question format: VCE multi-part extended response ───────────────────────
alter type question_format add value if not exists 'extended_response';

-- ─── Year level: Unit 3 & 4 sits at Year 12 ──────────────────────────────────
alter type year_level add value if not exists 'year_12';

commit;

-- ─── Parts of a multi-part question ──────────────────────────────────────────
-- A VCE extended response is one scenario with lettered parts, each carrying its
-- own marks. Stored as jsonb rather than a child table: parts are only ever read
-- and written with their parent question, never queried independently, so a
-- separate table would add a join and a migration surface for no benefit.
--
-- Shape: [{ "label": "a", "prompt": "...", "marks": 2,
--           "expected_answer": "...", "explanation": "..." }, ...]
alter table public.questions add column if not exists parts jsonb;

-- Marks a question is worth. Null for NAPLAN questions, which are scored by
-- count rather than marks.
alter table public.questions add column if not exists marks integer;

comment on column public.questions.parts is
  'VCE extended response only: lettered parts, each with its own marks and marking guidance.';
