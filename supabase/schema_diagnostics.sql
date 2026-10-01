-- Diagnostic results: one row per diagnostic test a child has sat.
--
-- The answers are what is stored. The report — levels, confidence, skills,
-- explanations — is rebuilt from them on every view, so a corrected
-- explanation or a better skill rule reaches old reports too; `areas` is only a
-- cache for lists such as the parent dashboard.
--
-- Rows are written by the server with the service-role key, after it has
-- marked the answers itself. There is deliberately no insert or update policy:
-- a client must never be able to write a result (or a score) of its own.
--
-- Run this in the Supabase SQL editor. Safe to re-run.

create table if not exists public.diagnostic_results (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  child_name     text check (child_name is null or char_length(child_name) <= 40),
  year_level     text not null,
  subject        text not null,
  -- [{ id, a, ms?, ch?, g?, f? }] in the order asked: the answer, the time
  -- spent, answer changes, the child's own "I guessed" flag, and whether the
  -- question was a follow-up.
  responses      jsonb not null,
  correct        int not null check (correct >= 0),
  total          int not null check (total > 0),
  -- [{ id, label, pct, level, confidence }] weakest first, for lists.
  areas          jsonb not null,
  -- The sitting's nonce: a signed-out result can be saved to an account once.
  receipt_ref    text,
  -- The tailored exam, marked on screen: [{ id, ok }] or [{ id, m, of }].
  exam_marks     jsonb,
  exam_marked_at timestamptz,
  created_at     timestamptz not null default now()
);

create unique index if not exists diagnostic_results_receipt_unique
  on public.diagnostic_results (receipt_ref)
  where receipt_ref is not null;

create index if not exists diagnostic_results_user_idx
  on public.diagnostic_results (user_id, created_at desc);

alter table public.diagnostic_results enable row level security;

drop policy if exists "diagnostic_results_select_own" on public.diagnostic_results;
create policy "diagnostic_results_select_own"
  on public.diagnostic_results
  for select
  using (auth.uid() = user_id);

-- A parent reads the results of a student account linked to them.
drop policy if exists "diagnostic_results_select_linked" on public.diagnostic_results;
create policy "diagnostic_results_select_linked"
  on public.diagnostic_results
  for select
  using (
    exists (
      select 1 from public.student_profiles sp
      where sp.id = diagnostic_results.user_id and sp.parent_id = auth.uid()
    )
  );

drop policy if exists "diagnostic_results_delete_own" on public.diagnostic_results;
create policy "diagnostic_results_delete_own"
  on public.diagnostic_results
  for delete
  using (auth.uid() = user_id);
