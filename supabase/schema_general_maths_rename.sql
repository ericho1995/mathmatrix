-- Renames "Further Mathematics" to "General Mathematics" to match VCAA's
-- current VCE Mathematics study design (2023-2027). Run once, alone, against
-- the live project (Postgres allows RENAME VALUE in the same transaction,
-- unlike ADD VALUE + immediate use). Safe to re-run: guarded by exception
-- handlers so a second run is a no-op instead of an error.
do $$
begin
  alter type subject_slug rename value 'further_maths' to 'general_maths';
exception when others then
  raise notice 'subject_slug rename skipped: %', sqlerrm;
end $$;

do $$
begin
  alter type topic_slug rename value 'fm_data_analysis' to 'gm_data_analysis';
exception when others then
  raise notice 'topic_slug rename (fm_data_analysis) skipped: %', sqlerrm;
end $$;

do $$
begin
  alter type topic_slug rename value 'fm_financial' to 'gm_financial';
exception when others then
  raise notice 'topic_slug rename (fm_financial) skipped: %', sqlerrm;
end $$;
