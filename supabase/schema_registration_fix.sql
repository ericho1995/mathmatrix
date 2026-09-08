-- ─────────────────────────────────────────────────────────────────────────────
-- PrepNest — registration fix
-- The original handle_new_student() trigger always defaulted new students to
-- 'grade_3', ignoring the year_level the student actually picked at signup
-- (src/app/auth/register/page.tsx now sends it via auth.signUp options.data).
-- This replaces the trigger to read it from the auth user's metadata.
-- Safe to re-run (create-or-replace). Run any time after schema.sql.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function handle_new_student()
returns trigger as $$
declare
  meta jsonb;
begin
  if new.role = 'student' then
    select raw_user_meta_data into meta from auth.users where id = new.id;
    insert into student_profiles(id, year_level)
    values (new.id, coalesce((meta->>'year_level')::year_level, 'grade_3'));
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;
