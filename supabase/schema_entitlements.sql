-- Entitlements: what a user has paid for.
--
-- The product is a year-level bundle — one payment unlocks every premium paper
-- for one year level of one subject family. Scope is deliberately coarse
-- (subject is not recorded) so a Year 9 bundle covers Maths and English alike;
-- narrow it later by adding a column rather than by splitting rows.
--
-- Run this in the Supabase SQL editor. Safe to re-run.

create table if not exists public.entitlements (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  year_level    year_level not null,
  source        text not null default 'stripe',
  -- Stripe's checkout session id. Webhooks are delivered at least once, so this
  -- is what makes replay harmless rather than a second free grant.
  external_ref  text,
  created_at    timestamptz not null default now()
);

-- One entitlement per user per year level. An upsert on this constraint turns a
-- duplicate webhook delivery into a no-op.
create unique index if not exists entitlements_user_year_unique
  on public.entitlements (user_id, year_level);

-- A given Stripe checkout session may only ever grant once.
create unique index if not exists entitlements_external_ref_unique
  on public.entitlements (external_ref)
  where external_ref is not null;

create index if not exists entitlements_user_idx on public.entitlements (user_id);

alter table public.entitlements enable row level security;

-- Users may read their own entitlements and nothing else. Note there is no
-- insert or update policy: granting is done by the Stripe webhook using the
-- service-role key, which bypasses RLS. A client must never be able to grant
-- itself an entitlement.
drop policy if exists "entitlements_select_own" on public.entitlements;
create policy "entitlements_select_own"
  on public.entitlements
  for select
  using (auth.uid() = user_id);
