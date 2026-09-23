-- VCE Specialist Mathematics Unit 3 & 4 support.
--
-- Adds the four Specialist areas of study the bank did not have. The 2023-2027
-- study design has six: logic and proof, functions and graphs, complex
-- numbers, calculus (including differential equations and kinematics),
-- vectors, and probability and statistics. Complex numbers and vectors already
-- exist from Unit 1 & 2 (sm_complex_numbers, sm_vectors); these are the rest.
--
-- Run this in the Supabase SQL editor BEFORE re-running seed.sql — the seed now
-- contains Specialist Unit 3 & 4 rows using these values and will fail against
-- a database that does not have them. Safe to re-run.
--
-- Postgres will not let a newly added enum value be *used* in the same
-- transaction that adds it, which is why seed.sql must be a separate query.

alter type topic_slug add value if not exists 'sm_proof';
alter type topic_slug add value if not exists 'sm_functions';
alter type topic_slug add value if not exists 'sm_calculus';
alter type topic_slug add value if not exists 'sm_statistics';

commit;
