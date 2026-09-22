-- Subscriptions (the Grade 3 – Year 10 plan) and per-paper purchases (VCE).
--
-- Replaces the $29 year-level bundle as the way new customers pay. The
-- `entitlements` table stays: anyone who bought a year level keeps it, and the
-- access check still honours those rows.
--
-- Run this in the Supabase SQL editor. Safe to re-run.

-- One row per Stripe subscription, kept in step by the webhook
-- (checkout.session.completed and customer.subscription.*). Access is granted
-- while status is active, trialing or past_due and current_period_end is in
-- the future, so a cancelled plan keeps working until the end of the period
-- the customer already paid for.
create table if not exists public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id      text not null,
  stripe_subscription_id  text not null,
  plan                    text not null,
  status                  text not null,
  current_period_end      timestamptz not null,
  cancel_at_period_end    boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Webhooks are delivered at least once; upserting on the Stripe id makes a
-- repeated delivery an update rather than a second row.
create unique index if not exists subscriptions_stripe_id_unique
  on public.subscriptions (stripe_subscription_id);

create index if not exists subscriptions_user_idx on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;

-- Read your own, nothing else. No insert or update policy: only the webhook,
-- using the service-role key, writes here.
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

-- One row per VCE paper bought. exam_id is the catalogue id (e.g.
-- maths_methods-year_12-1-exam1), which lives in code, so it is not a foreign
-- key.
create table if not exists public.paper_purchases (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  exam_id       text not null,
  -- Stripe's checkout session id, so a replayed webhook cannot grant twice.
  external_ref  text,
  created_at    timestamptz not null default now()
);

create unique index if not exists paper_purchases_user_exam_unique
  on public.paper_purchases (user_id, exam_id);

create unique index if not exists paper_purchases_external_ref_unique
  on public.paper_purchases (external_ref)
  where external_ref is not null;

alter table public.paper_purchases enable row level security;

drop policy if exists "paper_purchases_select_own" on public.paper_purchases;
create policy "paper_purchases_select_own"
  on public.paper_purchases
  for select
  using (auth.uid() = user_id);
