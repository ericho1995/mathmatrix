-- Teacher and tutor accounts (2026-09-24).
--
-- Sign-up now offers "Teacher or tutor" and sends role 'teacher' in the auth
-- metadata. The profiles trigger casts that to user_role, so a teacher sign-up
-- FAILS until this has run. Apply it in the Supabase SQL editor BEFORE deploying
-- the sign-up change (scripts/check-live-schema.mjs reports it). Safe to re-run.
--
-- Teachers use the parent dashboard (linking students, seeing progress); no
-- table or policy checks the parent role, so nothing else changes.

alter type user_role add value if not exists 'teacher';
