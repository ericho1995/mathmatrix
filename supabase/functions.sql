-- ─────────────────────────────────────────────────────────────────────────────
-- PrepNest — RPC functions for the leaderboard and parent↔student linking
-- Safe to re-run (create-or-replace + idempotent grants). Run in the
-- Supabase SQL editor after schema.sql and seed.sql.
-- ─────────────────────────────────────────────────────────────────────────────

-- Weekly leaderboard: top students by XP earned in the last 7 days.
-- Security definer so it can read across all students' profiles/sessions
-- without needing a broad SELECT policy on `profiles` — only returns a
-- first-name + last-initial display name, year level, and XP total.
create or replace function get_weekly_leaderboard(limit_count int default 20)
returns table (
  student_id uuid,
  display_name text,
  year_level year_level,
  xp_this_week bigint
) as $$
  select
    p.id,
    trim(
      split_part(p.full_name, ' ', 1) ||
      case
        when split_part(p.full_name, ' ', 2) <> ''
        then ' ' || left(split_part(p.full_name, ' ', 2), 1) || '.'
        else ''
      end
    ) as display_name,
    sp.year_level,
    coalesce(sum(ps.xp_earned), 0) as xp_this_week
  from profiles p
  join student_profiles sp on sp.id = p.id
  left join practice_sessions ps
    on ps.student_id = p.id and ps.started_at > now() - interval '7 days'
  where p.role = 'student'
  group by p.id, p.full_name, sp.year_level
  having coalesce(sum(ps.xp_earned), 0) > 0
  order by xp_this_week desc
  limit limit_count;
$$ language sql security definer stable set search_path = public;

grant execute on function get_weekly_leaderboard(int) to authenticated, anon;

-- Redeem a parent invite code: links the calling student to the parent
-- who generated the code, and marks the code used. Security definer
-- because the student doesn't own the parent_invites row they're reading.
create or replace function redeem_parent_invite(invite_code text)
returns boolean as $$
declare
  invite parent_invites%rowtype;
begin
  select * into invite from parent_invites
    where code = upper(invite_code) and used = false and expires_at > now()
    limit 1;

  if not found then
    return false;
  end if;

  update student_profiles set parent_id = invite.parent_id where id = auth.uid();
  update parent_invites set used = true, student_id = auth.uid() where id = invite.id;

  return true;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function redeem_parent_invite(text) to authenticated;
