-- ─────────────────────────────────────────────────────────────────────────────
-- PrepNest — fix: student_profiles never created + question_attempts RLS block
--
-- Found 2026-09-09 while testing the VCE practice flow end-to-end with a real
-- signup: practice_sessions saves fine, but on the live project (a) no
-- student_profiles row exists for a freshly-confirmed student despite the
-- on_student_profile_created trigger/function being present in schema.sql +
-- schema_registration_fix.sql, so xp_total/streak_days/year_level never get
-- populated and the app's XP-update code silently no-ops; and (b) inserting
-- into question_attempts is rejected outright with
-- "new row violates row-level security policy for table question_attempts"
-- (42501), so no per-question accuracy data is ever recorded. Both failures
-- are swallowed by QuizRunner's best-effort try/catch, so nothing crashes and
-- nothing shows to the student.
--
-- This re-applies both pieces idempotently. Safe to run any time after
-- schema_registration_fix.sql and functions.sql.
-- ─────────────────────────────────────────────────────────────────────────────

-- Re-attach the trigger in case it's missing or was bound to a stale function.
drop trigger if exists on_student_profile_created on profiles;

create or replace function handle_new_student()
returns trigger as $$
declare
  meta jsonb;
begin
  if new.role = 'student' then
    select raw_user_meta_data into meta from auth.users where id = new.id;
    insert into student_profiles(id, year_level)
    values (new.id, coalesce((meta->>'year_level')::year_level, 'grade_3'))
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_student_profile_created
  after insert on profiles
  for each row execute function handle_new_student();

-- Backfill any existing student accounts that are missing their row (e.g.
-- anyone who signed up while the trigger was broken).
insert into student_profiles (id, year_level)
select p.id, coalesce((u.raw_user_meta_data->>'year_level')::year_level, 'grade_3')
from profiles p
join auth.users u on u.id = p.id
where p.role = 'student'
on conflict (id) do nothing;

-- Re-create the question_attempts policy with an explicit WITH CHECK — the
-- USING-only version in schema.sql should fall back to using USING for
-- inserts too, but the live project is rejecting inserts, so spell it out.
drop policy if exists "Students manage own question attempts" on question_attempts;

create policy "Students manage own question attempts"
  on question_attempts for all
  using (
    exists (
      select 1 from practice_sessions ps
      where ps.id = question_attempts.session_id
      and ps.student_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from practice_sessions ps
      where ps.id = question_attempts.session_id
      and ps.student_id = auth.uid()
    )
  );
