-- VCE General Mathematics Unit 3 & 4 support.
--
-- Adds the two areas of study the bank was missing. VCAA's General Mathematics
-- examination specifications (2023-2027) divide both papers into four content
-- areas: data analysis, recursion and financial modelling, matrices, and
-- networks and decision mathematics. The bank already had slugs for the first
-- two (gm_data_analysis and gm_financial); these are the other two.
--
-- Run this in the Supabase SQL editor BEFORE re-running seed.sql — the seed now
-- contains rows using these values and will fail against a database that does
-- not have them. Safe to re-run.
--
-- Run order for the VCE migrations:
--   1. schema_vce_unit34.sql          (Methods: mm_functions, mm_algebra,
--                                      extended_response, year_12, parts, marks)
--   2. schema_general_maths_unit34.sql (this file)
--   3. seed.sql
--
-- Note: Postgres will not let a newly added enum value be *used* in the same
-- transaction that adds it, which is why seed.sql must be a separate query.

-- ─── Topic slugs: the two missing General Mathematics areas of study ─────────
alter type topic_slug add value if not exists 'gm_matrices';
alter type topic_slug add value if not exists 'gm_networks';

commit;
