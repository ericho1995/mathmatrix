-- ─────────────────────────────────────────────────────────────────────────────
-- PrepNest — Supabase Database Schema
-- Run this in your Supabase SQL editor to initialise the database.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

create type user_role as enum ('student', 'parent', 'admin');
create type year_level as enum (
  'grade_3', 'grade_4', 'grade_5', 'grade_6',
  'year_7', 'year_8', 'year_9',
  'year_10', 'year_11', 'year_12'
);
create type subject_slug as enum ('math', 'english', 'science');
create type topic_slug as enum (
  'number_operations',
  'number_patterns',
  'algebra_equations',
  'geometry_measurement',
  'statistics_probability',
  'reading_comprehension',
  'reading_literary_analysis',
  'grammar_punctuation',
  'vocabulary',
  'life_science',
  'physical_science',
  'earth_space'
);
create type question_format as enum ('multiple_choice', 'long_form');
-- Topic → subject grouping lives in app metadata (src/lib/curriculum.ts) for now;
-- promote to a `topics` reference table once questions are seeded from the DB.
create type difficulty as enum ('foundation', 'developing', 'proficient', 'advanced');
create type session_mode as enum ('practice', 'timed_challenge');

-- ─── PROFILES ────────────────────────────────────────────────────────────────

create table profiles (
  id            uuid primary key references auth.users on delete cascade,
  email         text not null unique,
  full_name     text not null,
  role          user_role not null default 'student',
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table student_profiles (
  id            uuid primary key references profiles(id) on delete cascade,
  year_level    year_level not null default 'grade_3',
  parent_id     uuid references profiles(id) on delete set null,
  xp_total      integer not null default 0,
  streak_days   integer not null default 0,
  last_active   date
);

-- ─── QUESTIONS ────────────────────────────────────────────────────────────────

create table questions (
  id                uuid primary key default uuid_generate_v4(),
  topic             topic_slug not null,
  year_level        year_level not null,
  difficulty        difficulty not null default 'developing',
  format            question_format not null default 'multiple_choice',
  question_text     text not null,
  options           jsonb,                 -- string[]; null for long_form
  correct_index     smallint,              -- null for long_form
  explanation       text not null,
  curriculum_code   text,                  -- e.g. "AC9M6N01"
  is_published      boolean not null default false,
  created_by        uuid references profiles(id),
  created_at        timestamptz not null default now(),
  constraint questions_mc_has_options check (
    format != 'multiple_choice' or (options is not null and correct_index is not null)
  )
);

create index idx_questions_topic_year on questions(topic, year_level);
create index idx_questions_difficulty on questions(difficulty);

-- ─── SESSIONS ────────────────────────────────────────────────────────────────

create table practice_sessions (
  id                uuid primary key default uuid_generate_v4(),
  student_id        uuid not null references profiles(id) on delete cascade,
  topic             topic_slug not null,
  year_level        year_level not null,
  mode              session_mode not null default 'practice',
  started_at        timestamptz not null default now(),
  completed_at      timestamptz,
  total_questions   smallint not null,
  correct_count     smallint not null default 0,
  xp_earned         smallint not null default 0
);

create index idx_sessions_student on practice_sessions(student_id, started_at desc);
create index idx_sessions_topic on practice_sessions(topic);

-- ─── QUESTION ATTEMPTS ────────────────────────────────────────────────────────

create table question_attempts (
  id                  uuid primary key default uuid_generate_v4(),
  session_id          uuid not null references practice_sessions(id) on delete cascade,
  question_id         uuid not null references questions(id),
  selected_index      smallint not null,     -- -1 for long_form (not applicable)
  response_text       text,                  -- free-text answer for long_form questions
  is_correct          boolean,               -- null = not auto-gradable, pending manual review
  time_taken_seconds  smallint not null,
  created_at          timestamptz not null default now()
);

create index idx_attempts_session on question_attempts(session_id);
create index idx_attempts_question on question_attempts(question_id);

-- ─── PARENT INVITE CODES ──────────────────────────────────────────────────────

create table parent_invites (
  id            uuid primary key default uuid_generate_v4(),
  code          text not null unique,
  parent_id     uuid not null references profiles(id) on delete cascade,
  student_id    uuid references profiles(id) on delete cascade,
  used          boolean not null default false,
  expires_at    timestamptz not null default now() + interval '7 days',
  created_at    timestamptz not null default now()
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table student_profiles enable row level security;
alter table questions enable row level security;
alter table practice_sessions enable row level security;
alter table question_attempts enable row level security;
alter table parent_invites enable row level security;

-- Helper: is the current user an admin? security definer so it can read
-- profiles regardless of the caller's own RLS grants, without the
-- self-referencing subquery causing recursive policy evaluation.
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

-- Profiles: users can read/update their own, admins can read/update all
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select using (is_admin());

create policy "Admins can update all profiles"
  on profiles for update using (is_admin());

-- Student profiles: students read/update their own, parents read linked
-- students', admins manage all
create policy "Students can view own student profile"
  on student_profiles for select using (auth.uid() = id);

create policy "Students can update own student profile"
  on student_profiles for update using (auth.uid() = id);

create policy "Parents can view linked student profiles"
  on student_profiles for select using (auth.uid() = parent_id);

create policy "Admins can manage student profiles"
  on student_profiles for all using (is_admin());

-- Questions: everyone can read published questions, admins manage all
create policy "Read published questions"
  on questions for select using (is_published = true);

create policy "Admins can manage questions"
  on questions for all using (is_admin()) with check (is_admin());

-- Sessions: students own their sessions, parents can read linked student sessions
create policy "Students own sessions"
  on practice_sessions for all using (auth.uid() = student_id);

create policy "Parents can read linked student sessions"
  on practice_sessions for select using (
    exists (
      select 1 from student_profiles sp
      where sp.id = practice_sessions.student_id
      and sp.parent_id = auth.uid()
    )
  );

create policy "Admins can view all sessions"
  on practice_sessions for select using (is_admin());

-- Question attempts: students manage attempts that belong to their own
-- sessions, parents can read attempts from linked students' sessions
create policy "Students manage own question attempts"
  on question_attempts for all using (
    exists (
      select 1 from practice_sessions ps
      where ps.id = question_attempts.session_id
      and ps.student_id = auth.uid()
    )
  );

create policy "Parents can read linked student attempts"
  on question_attempts for select using (
    exists (
      select 1 from practice_sessions ps
      join student_profiles sp on sp.id = ps.student_id
      where ps.id = question_attempts.session_id
      and sp.parent_id = auth.uid()
    )
  );

-- Parent invites: parents manage the invite codes they created
create policy "Parents manage own invites"
  on parent_invites for all using (auth.uid() = parent_id);

-- ─── TRIGGERS ────────────────────────────────────────────────────────────────

-- Auto-update updated_at on profiles
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- Auto-create student_profile row on new student signup
create or replace function handle_new_student()
returns trigger as $$
begin
  if new.role = 'student' then
    insert into student_profiles(id) values (new.id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_student_profile_created
  after insert on profiles
  for each row execute function handle_new_student();

-- Auto-create a profiles row whenever someone signs up via Supabase Auth
-- (email/password or OAuth). Reads full_name/role out of the auth user's
-- metadata, which is what supabase.auth.signUp({ options: { data } }) sets.
create or replace function handle_new_auth_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();
