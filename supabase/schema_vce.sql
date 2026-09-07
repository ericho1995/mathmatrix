-- ─────────────────────────────────────────────────────────────────────────────
-- PrepNest — adds the 5 selective VCE subjects (Chemistry, Physics,
-- Maths Methods, Further Mathematics, Specialist Mathematics) and their
-- topics to the existing subject_slug / topic_slug enums.
--
-- Run this FIRST, on its own, in the Supabase SQL editor. Postgres will
-- not let a new enum value be used in the same transaction that adds it,
-- so run supabase/seed.sql as a SEPARATE query straight after this one
-- (it already contains the new questions using these values).
-- Safe to re-run — every statement is "add if not exists".
-- ─────────────────────────────────────────────────────────────────────────────

alter type subject_slug add value if not exists 'chemistry';
alter type subject_slug add value if not exists 'physics';
alter type subject_slug add value if not exists 'maths_methods';
alter type subject_slug add value if not exists 'further_maths';
alter type subject_slug add value if not exists 'specialist_maths';

alter type topic_slug add value if not exists 'chem_atomic_structure';
alter type topic_slug add value if not exists 'chem_reactions';
alter type topic_slug add value if not exists 'phys_mechanics';
alter type topic_slug add value if not exists 'phys_electricity';
alter type topic_slug add value if not exists 'mm_calculus';
alter type topic_slug add value if not exists 'mm_probability';
alter type topic_slug add value if not exists 'fm_data_analysis';
alter type topic_slug add value if not exists 'fm_financial';
alter type topic_slug add value if not exists 'sm_complex_numbers';
alter type topic_slug add value if not exists 'sm_vectors';
