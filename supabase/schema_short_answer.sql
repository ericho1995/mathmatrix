-- ─────────────────────────────────────────────────────────────────────────────
-- PrepNest — short_answer question format
--
-- Adds a third question format, `short_answer`: auto-gradable like
-- multiple_choice, but with no fixed options — the student types a short
-- typed answer (a number, word, or short phrase) that's checked against
-- `expected_answer` (plus any `accepted_answers` alternates).
--
-- Run this whole file as ONE query in the Supabase SQL editor. The explicit
-- `commit;` below is required: Postgres won't let a new enum value be
-- referenced (e.g. in the check constraint further down) until the
-- transaction that added it has committed. Then run the regenerated
-- supabase/seed.sql as a SEPARATE query straight after.
-- ─────────────────────────────────────────────────────────────────────────────

alter type question_format add value if not exists 'short_answer';
commit;

alter table questions add column if not exists expected_answer text;
alter table questions add column if not exists accepted_answers text[];

alter table questions drop constraint if exists questions_mc_has_options;
alter table questions add constraint questions_mc_has_options check (
  (format != 'multiple_choice' or (options is not null and correct_index is not null))
  and (format != 'short_answer' or expected_answer is not null)
);
