-- ─────────────────────────────────────────────────────────────────────────────
-- Peer comparison for diagnostic results: how other children who sat the same
-- test (same year level and subject) scored.
--
-- Run after schema_diagnostics.sql. Safe to run more than once.
--
-- Only real results count: each child's latest sitting (by account and first
-- name, so re-tests don't count twice), and never admin accounts. Below 30
-- children nothing is returned but { open: false }, not even the count, so a
-- small group can never be picked apart and the site never shows a comparison
-- that rests on too few children. The answer is scores only: no ids, names or
-- dates.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.diagnostic_cohort(p_year text, p_subject text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with latest as (
    select distinct on (r.user_id, lower(coalesce(r.child_name, '')))
      round(100.0 * r.correct / r.total)::int as pct
    from diagnostic_results r
    where r.year_level = p_year
      and r.subject = p_subject
      and r.total > 0
      and not exists (select 1 from profiles p where p.id = r.user_id and p.role = 'admin')
    order by r.user_id, lower(coalesce(r.child_name, '')), r.created_at desc
  )
  select case
    when (select count(*) from latest) >= 30 then
      jsonb_build_object(
        'open', true,
        'students', (select count(*) from latest),
        'pcts', (select jsonb_agg(pct order by pct) from latest)
      )
    else jsonb_build_object('open', false)
  end;
$$;

revoke all on function public.diagnostic_cohort(text, text) from public, anon;
grant execute on function public.diagnostic_cohort(text, text) to authenticated, service_role;
