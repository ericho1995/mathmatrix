-- ─────────────────────────────────────────────────────────────────────────────
-- MathMatrix — Supabase Database Schema
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
create type topic_slug as enum (
  'number_operations',
  'algebra_functions',
  'geometry_measurement',
  'statistics_probability'
);
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
  question_text     text not null,
  options           jsonb not null,        -- string[]
  correct_index     smallint not null,
  explanation       text not null,
  curriculum_code   text,                  -- e.g. "AC9M6N01"
  is_published      boolean not null default false,
  created_by        uuid references profiles(id),
  created_at        timestamptz not null default now()
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
  selected_index      smallint not null,
  is_correct          boolean not null,
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

-- Profiles: users can read their own, parents can read linked students
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Questions: all authenticated users can read published questions
create policy "Read published questions"
  on questions for select using (is_published = true);

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
