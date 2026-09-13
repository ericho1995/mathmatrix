-- Results from a paper that was sat away from the screen.
--
-- A student downloads a PDF, sits it on paper, and a parent marks it with the
-- answer key. Entering those marks on the site produces a practice_sessions row
-- and its question_attempts, exactly like an on-screen quiz — which is what
-- makes the parent dashboard's per-topic accuracy start working, since it reads
-- from question_attempts rather than from the session's single topic tag.
--
-- The only schema change needed is telling the two apart. A sat paper is
-- self-reported and covers a whole year level's worth of topics; an on-screen
-- quiz is observed and narrow. Reporting them as one number would be wrong.
--
-- Run this in the Supabase SQL editor. Safe to re-run. It has no dependency on
-- the other pending migrations and can be run before or after them, but note
-- that SAVING a result still requires seed.sql to have loaded the questions:
-- question_attempts.question_id is a foreign key to questions(id), so an
-- attempt against a question that exists only in code is rejected.

alter type session_mode add value if not exists 'paper';

comment on type session_mode is
  'practice = on-screen quiz; timed_challenge = timed on-screen quiz; paper = marks entered from a downloaded PDF sat away from the screen.';
