-- VCE Physics Unit 3 & 4 support.
--
-- Adds the five Physics Unit 3 & 4 topics (2024-2027 study design): motion in
-- two dimensions; gravitational, electric and magnetic fields; generation and
-- transmission of electricity; light, matter and special relativity; and the
-- scientific investigation. Unit 1 & 2 keeps phys_mechanics and
-- phys_electricity.
--
-- Run this in the Supabase SQL editor BEFORE loading the Physics questions
-- (seed.sql or the physics seed files) — those rows use these values and will
-- fail against a database that does not have them. Safe to re-run.
--
-- Postgres will not let a newly added enum value be *used* in the same
-- transaction that adds it, which is why the seed must be a separate query.

alter type topic_slug add value if not exists 'phys_motion';
alter type topic_slug add value if not exists 'phys_fields';
alter type topic_slug add value if not exists 'phys_electrical_power';
alter type topic_slug add value if not exists 'phys_light_matter';
alter type topic_slug add value if not exists 'phys_investigation';

commit;
