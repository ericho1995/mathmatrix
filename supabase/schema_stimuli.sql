-- supabase/schema_stimuli.sql
--
-- Adds the `stimuli` table (shared reading passages / data referenced by
-- multiple questions) and two new nullable columns on `questions`:
-- stimulus_id (FK into stimuli) and calculator_allowed (Maths Yr7-9
-- Numeracy only). Idempotent — safe to re-run. Must run before the next
-- `supabase/seed.sql` load, since the regenerated seed.sql references
-- these columns.
-- ─────────────────────────────────────────────────────────────────────────────

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
alter table questions add column if not exists calculator_allowed boolean;
