-- ─────────────────────────────────────────────────────────────────────────────
-- PrepNest — topic grade-banding + long-form question support
--
-- 1. Splits topic_slug values whose label implied a concept too advanced for
--    younger grades: 'algebra_functions' -> 'number_patterns' (Gr3-6) /
--    'algebra_equations' (Yr7-10), 'reading_comprehension' (Yr7-10 rows) ->
--    'reading_literary_analysis'. The actual per-row retagging happens when
--    supabase/seed.sql is re-run after this (it upserts every question by id
--    from the already-retagged src/lib/questions/bank.ts).
-- 2. Adds a question_format enum + `format` column to `questions`, and
--    relaxes `options`/`correct_index` to nullable so long-form questions
--    (no fixed answer, saved for manual review) can be stored.
-- 3. Adds `response_text` to `question_attempts` and relaxes `is_correct` to
--    nullable (null = not auto-gradable, pending review).
--
-- Run this FIRST, on its own, in the Supabase SQL editor (Postgres won't let
-- a new enum value be used in the same transaction that adds it). Then run
-- the regenerated supabase/seed.sql as a SEPARATE query straight after —
-- it retags every existing question row via its upsert.
-- ─────────────────────────────────────────────────────────────────────────────

alter type topic_slug add value if not exists 'number_patterns';
alter type topic_slug add value if not exists 'algebra_equations';
alter type topic_slug add value if not exists 'reading_literary_analysis';

do $$ begin
  create type question_format as enum ('multiple_choice', 'long_form');
exception when duplicate_object then null;
end $$;

alter table questions add column if not exists format question_format not null default 'multiple_choice';
alter table questions alter column options drop not null;
alter table questions alter column correct_index drop not null;
alter table questions drop constraint if exists questions_mc_has_options;
alter table questions add constraint questions_mc_has_options check (
  format != 'multiple_choice' or (options is not null and correct_index is not null)
);

alter table question_attempts add column if not exists response_text text;
alter table question_attempts alter column is_correct drop not null;
