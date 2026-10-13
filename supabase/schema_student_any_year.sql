-- ─────────────────────────────────────────────────────────────────────────────
-- PrepNest — students of any age can sign up
--
-- Sign-up offers Grade 3 to Year 12 plus "Another year, or not at school", for
-- a younger child, an adult learner or anyone else. That choice sends no
-- year_level, and until now the trigger filled the gap with 'grade_3', so an
-- adult would be labelled Grade 3 on their dashboard and the leaderboard.
--
-- This makes a student's year level optional and stops the trigger guessing.
-- Nothing is gated on it: every year's papers stay open to every account.
--
-- Safe to run more than once. Safe to run before or after the code that uses
-- it ships: until it runs, the "another year" choice is stored as Grade 3.
-- Existing accounts are left as they are.
-- ─────────────────────────────────────────────────────────────────────────────

alter table student_profiles alter column year_level drop default;
alter table student_profiles alter column year_level drop not null;

create or replace function handle_new_student()
returns trigger as $$
declare
  meta jsonb;
begin
  if new.role = 'student' then
    select raw_user_meta_data into meta from auth.users where id = new.id;
    insert into student_profiles(id, year_level)
    values (new.id, nullif(meta->>'year_level', '')::year_level)
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;
