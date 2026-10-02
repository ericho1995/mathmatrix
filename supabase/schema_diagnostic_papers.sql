-- ─────────────────────────────────────────────────────────────────────────────
-- Weak-areas papers and question-bank alerts.
--
-- Run after schema_diagnostics.sql. Safe to run more than once.
--
-- diagnostic_papers: practice papers generated on request from a diagnostic
-- result, on the child's weak areas only. Each row keeps the composed paper
-- (sections and focus) as a snapshot, so a later edit to the question bank
-- can never change a paper that has already been printed or sat.
--
-- question_bank_alerts: raised when a child's weak area is running out of
-- unseen questions, so an admin knows where to write more.
--
-- Clients only read. Every write goes through the server with the service
-- role; the monthly allowance is checked inside create_diagnostic_paper,
-- under a lock, so a double click cannot slip past it.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.diagnostic_papers (
  id              uuid primary key,
  result_id       uuid not null references public.diagnostic_results (id) on delete cascade,
  -- The result's owner (the child's account, or the parent's for a signed-out
  -- sitting saved there): papers are matched across re-tests by owner, year,
  -- subject and child, so a new paper avoids every question already seen.
  owner_id        uuid not null references auth.users (id) on delete cascade,
  -- Who generated it: the allowance is per generating account.
  created_by      uuid not null references auth.users (id) on delete cascade,
  child_key       text not null default '',
  year_level      text not null,
  subject         text not null,
  seq             int not null check (seq > 0),
  -- The TailoredExam: { title, sections, focus, secondChance, ... }.
  exam            jsonb not null,
  question_ids    text[] not null,
  -- Counts towards the monthly allowance (plan papers; not VCE or admin ones).
  counted         boolean not null default false,
  -- Sat on screen: [{ id, a }] as answered.
  online_answers  jsonb,
  -- [{ id, ok }] or [{ id, m, of }], from on-screen or paper marking.
  marks           jsonb,
  marked_at       timestamptz,
  created_at      timestamptz not null default now(),
  unique (result_id, seq)
);

create index if not exists diagnostic_papers_child_idx
  on public.diagnostic_papers (owner_id, year_level, subject, child_key);

create index if not exists diagnostic_papers_allowance_idx
  on public.diagnostic_papers (created_by, created_at desc)
  where counted;

alter table public.diagnostic_papers enable row level security;

-- Whoever can see the result can see its papers: the select policies on
-- diagnostic_results (own, or a linked child's) apply inside this subquery.
drop policy if exists "diagnostic_papers_select_visible" on public.diagnostic_papers;
create policy "diagnostic_papers_select_visible"
  on public.diagnostic_papers
  for select
  using (exists (select 1 from public.diagnostic_results r where r.id = diagnostic_papers.result_id));

-- Creates a paper as the next in the result's series, if the allowance has
-- room. Returns { ok: true, seq } or { ok: false, reason: 'limit' | 'seq', used }.
-- 'seq' means another paper was created for the result in the meantime: the
-- caller composed for the wrong number and should compose again.
create or replace function public.create_diagnostic_paper(
  p_id uuid,
  p_result uuid,
  p_owner uuid,
  p_creator uuid,
  p_child_key text,
  p_year text,
  p_subject text,
  p_seq int,
  p_exam jsonb,
  p_question_ids text[],
  p_counted boolean,
  p_limit int,
  p_since timestamptz
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  used int;
  next_seq int;
begin
  perform pg_advisory_xact_lock(hashtextextended('diagnostic_papers:' || p_creator::text, 0));
  if p_counted and p_limit is not null then
    select count(*) into used from diagnostic_papers
      where created_by = p_creator and counted and created_at >= p_since;
    if used >= p_limit then
      return jsonb_build_object('ok', false, 'reason', 'limit', 'used', used);
    end if;
  end if;

  perform pg_advisory_xact_lock(hashtextextended('diagnostic_papers:' || p_result::text, 0));
  select coalesce(max(seq), 0) + 1 into next_seq from diagnostic_papers where result_id = p_result;
  if next_seq <> p_seq then
    return jsonb_build_object('ok', false, 'reason', 'seq', 'seq', next_seq);
  end if;

  insert into diagnostic_papers (id, result_id, owner_id, created_by, child_key, year_level, subject, seq, exam, question_ids, counted)
  values (p_id, p_result, p_owner, p_creator, p_child_key, p_year, p_subject, p_seq, p_exam, p_question_ids, p_counted);
  return jsonb_build_object('ok', true, 'seq', p_seq);
end;
$$;

revoke all on function public.create_diagnostic_paper(uuid, uuid, uuid, uuid, text, text, text, int, jsonb, text[], boolean, int, timestamptz) from public, anon, authenticated;
grant execute on function public.create_diagnostic_paper(uuid, uuid, uuid, uuid, text, text, text, int, jsonb, text[], boolean, int, timestamptz) to service_role;

-- ─── Question-bank alerts ────────────────────────────────────────────────────

create table if not exists public.question_bank_alerts (
  id           uuid primary key default gen_random_uuid(),
  year_level   text not null,
  subject      text not null,
  area_id      text not null,
  area_label   text not null,
  -- The fewest unseen questions any child had left in this area when it fired.
  remaining    int not null check (remaining >= 0),
  -- A paper could not be made at all for want of questions.
  exhausted    boolean not null default false,
  -- How many times it has fired since it was opened, and for how many papers.
  hits         int not null default 1,
  first_seen   timestamptz not null default now(),
  last_seen    timestamptz not null default now(),
  resolved_at  timestamptz,
  resolved_by  uuid references auth.users (id) on delete set null
);

-- One open alert per area; a resolved one stays as history.
create unique index if not exists question_bank_alerts_open_unique
  on public.question_bank_alerts (year_level, subject, area_id)
  where resolved_at is null;

alter table public.question_bank_alerts enable row level security;

drop policy if exists "question_bank_alerts_admin_select" on public.question_bank_alerts;
create policy "question_bank_alerts_admin_select"
  on public.question_bank_alerts
  for select
  using (public.is_admin());

drop policy if exists "question_bank_alerts_admin_update" on public.question_bank_alerts;
create policy "question_bank_alerts_admin_update"
  on public.question_bank_alerts
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- Opens an alert for an area, or adds to the open one.
create or replace function public.note_question_bank_alert(
  p_year text,
  p_subject text,
  p_area text,
  p_label text,
  p_remaining int,
  p_exhausted boolean
) returns void
language sql
security definer
set search_path = public
as $$
  insert into question_bank_alerts (year_level, subject, area_id, area_label, remaining, exhausted)
  values (p_year, p_subject, p_area, p_label, greatest(p_remaining, 0), p_exhausted)
  on conflict (year_level, subject, area_id) where resolved_at is null
  do update set
    hits = question_bank_alerts.hits + 1,
    last_seen = now(),
    remaining = least(question_bank_alerts.remaining, excluded.remaining),
    exhausted = question_bank_alerts.exhausted or excluded.exhausted,
    area_label = excluded.area_label;
$$;

revoke all on function public.note_question_bank_alert(text, text, text, text, int, boolean) from public, anon, authenticated;
grant execute on function public.note_question_bank_alert(text, text, text, text, int, boolean) to service_role;
