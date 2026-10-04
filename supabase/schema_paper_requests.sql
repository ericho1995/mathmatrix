-- ─────────────────────────────────────────────────────────────────────────────
-- Requests from families for more practice papers.
--
-- Run after schema.sql. Safe to run more than once.
--
-- When a child has worked through the papers for their year and subject, a
-- parent can ask for more ("Request more papers" on the catalogue, on a
-- paper's page, and under the weak-areas papers). Each request lands here and
-- on the admin page (/admin/question-bank), where the team marks it in
-- progress and then done.
--
-- Clients cannot read or write this table: requests are inserted by the
-- server with the service role, and only admins can read and update them.
-- ─────────────────────────────────────────────────────────────────────────────

-- The admin check from schema.sql, created here too in case the database
-- predates it (same definition).
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create table if not exists public.paper_requests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  -- The account that asked, if signed in; the email is always kept to reply to.
  user_id     uuid references auth.users (id) on delete set null,
  email       text not null check (char_length(email) between 3 and 320),
  year_level  text not null,
  subject     text not null,
  -- What the family says would help (focus areas, exam dates, ...).
  note        text check (note is null or char_length(note) <= 1000),
  -- Where on the site it was sent from: catalogue, paper, weak_papers.
  source      text,
  status      text not null default 'new' check (status in ('new', 'in_progress', 'done')),
  updated_at  timestamptz not null default now(),
  handled_by  uuid references auth.users (id) on delete set null
);

create index if not exists paper_requests_open_idx on public.paper_requests (status, created_at desc);
create index if not exists paper_requests_email_idx on public.paper_requests (lower(email), created_at desc);

alter table public.paper_requests enable row level security;

drop policy if exists "paper_requests_admin_select" on public.paper_requests;
create policy "paper_requests_admin_select"
  on public.paper_requests
  for select
  using (public.is_admin());

drop policy if exists "paper_requests_admin_update" on public.paper_requests;
create policy "paper_requests_admin_update"
  on public.paper_requests
  for update
  using (public.is_admin())
  with check (public.is_admin());
