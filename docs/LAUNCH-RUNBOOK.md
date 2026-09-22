# PrepNest — launch runbook

**Written:** 2026-09-20 · **Verified against:** commit `d2a3cf8`, live Supabase project `mntpvbzarwrnhebphwyb`

Everything between here and taking a customer's money. The steps are ordered by
dependency, not by size — **Part A must finish before Part B**, because turning
on Stripe while the database is unready means a customer is charged and gets
nothing.

Each part ends with a check that proves it worked. Don't skip those. The
recurring failure in this project is a step that appears to succeed: the app
wraps its database reads, so a missing table renders as an empty page rather
than an error, and a truncated SQL paste still parses as valid SQL.

---

## Part A — Bring the live database up to date

The live project is running the schema from 2026-09-08 and a 511-row question
bank. The repo is nine migrations and ~1,400 questions ahead.

### A1. See what's missing

```bash
node scripts/check-live-schema.mjs
```

Read-only, uses the anon key already in `.env.local`. Right now it reports all
nine as `PENDING`. Run it again after each step if you like; it's the same check
I'll use to confirm you're done.

### A2. Run the eight schema migrations

Open the [SQL editor](https://supabase.com/dashboard/project/mntpvbzarwrnhebphwyb/sql).
For each file below: open it from the repo, copy the whole thing, paste, **Run**.

**One file per query. Do not combine them.** Postgres will not let a newly added
enum value be *used* in the same transaction that added it, and several of these
files add an enum value that a later file depends on. Combining them fails in a
way that reads like a syntax error.

| Order | File | Should say |
|---|---|---|
| 1 | `supabase/schema_topics_and_longform.sql` | Success |
| 2 | `supabase/schema_general_maths_rename.sql` | Success (may print `NOTICE` — that's the re-run guard, fine) |
| 3 | `supabase/schema_stimuli.sql` | Success |
| 4 | `supabase/schema_short_answer.sql` | Success |
| 5 | `supabase/schema_vce_unit34.sql` | Success |
| 6 | `supabase/schema_general_maths_unit34.sql` | Success |
| 7 | `supabase/schema_paper_results.sql` | Success |
| 8 | `supabase/schema_entitlements.sql` | Success |

All eight are additive and idempotent — nothing drops a table or a column, and
re-running one is a no-op. If one errors, fix that one and carry on; you don't
need to start over.

### A3. Load the question bank

`supabase/seed.sql` is ~890 KB in two statements. Pasting that into a browser
editor is slow and can silently drop the tail, so split it first:

```bash
node scripts/split-seed.mjs
```

That writes seven files to `supabase/seed-parts/`, largest 148 KB. Paste each one
as its own query, **in filename order**:

```
01-stimuli-1.sql       32 stimuli (reading passages and data tables)
02-questions-1.sql  ┐
03-questions-2.sql  │
04-questions-3.sql  ├  1,914 questions
05-questions-4.sql  │
06-questions-5.sql  │
07-questions-6.sql  ┘
```

Each is a complete, idempotent upsert — safe to re-run, and safe to re-run just
the one that failed. Do `01-stimuli` first; the question rows reference it.

**After any later content change**, load the new questions with one command
instead: `node scripts/load-questions.mjs` reports what is missing (read-only),
and `--write` upserts every question through the REST API. `--write` needs
`SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (gitignored). Content rewrites change
question ids, and a question missing from the table cannot have its attempts
saved.

### A4. Check

```bash
node scripts/check-live-schema.mjs
```

You want nine `✓ applied` and `All migrations are live.` If `seed.sql` still
shows a count below 1,900, one of the chunks didn't land — re-run that chunk.

**Stop here and tell me the output if anything is still pending.**

---

## Part B — Stripe

Do all of this in **Test mode** first (the toggle in the Stripe dashboard).
You'll repeat B1–B2 in Live mode at the end.

### B1. Create nine prices

One product per year level. Each one: **one-off payment**, **A$29.00**,
currency **AUD**.

```
Grade 3    Grade 4    Grade 5    Grade 6
Year 7     Year 8     Year 9     Year 10    Year 11
```

Copy each **Price** id — `price_...`, from the pricing section of the product,
**not** the product id `prod_...`. Getting these two confused is the most common
way this step goes wrong, and the error it produces (`No price configured`)
doesn't say which one you used.

> **Year 12 is optional, and now needs no code change.** A year level becomes
> buyable the moment its price variable exists — every buy button checks the
> same environment checkout does. To sell Year 12, create a tenth A$29 price and
> add `STRIPE_PRICE_YEAR_12` in Part C. Until then, Year 12 shows "purchases
> open soon" instead of a button that would error.

### B1b. Turn on receipts

Settings → **Customer emails** → turn on **Successful payments**. The site tells
customers "Stripe emails you a receipt", which is only true once this is on.

### B2. Create the webhook endpoint

Developers → Webhooks → **Add endpoint**:

- **URL:** `https://prepnest.com.au/api/webhooks/stripe`
- **Events:** `checkout.session.completed` — that one only. The route
  acknowledges and ignores everything else, so subscribing to more just adds
  noise to your dashboard.

Copy the **signing secret** (`whsec_...`).

### B3. Copy your secret key

Developers → API keys → **Secret key** (`sk_test_...`).

---

## Part C — Environment variables

Twelve values, all in **Vercel → mathmatrix → Settings → Environment Variables**,
scoped to **Production** (add Preview too if you want to test there).

None of these are `NEXT_PUBLIC_` — they're read server-side only, and must stay
that way.

```
STRIPE_SECRET_KEY            sk_test_...   (from B3)
STRIPE_WEBHOOK_SECRET        whsec_...     (from B2)
STRIPE_PRICE_GRADE_3         price_...     ┐
STRIPE_PRICE_GRADE_4         price_...     │
STRIPE_PRICE_GRADE_5         price_...     │
STRIPE_PRICE_GRADE_6         price_...     │ from B1
STRIPE_PRICE_YEAR_7          price_...     │
STRIPE_PRICE_YEAR_8          price_...     │
STRIPE_PRICE_YEAR_9          price_...     │
STRIPE_PRICE_YEAR_10         price_...     │
STRIPE_PRICE_YEAR_11         price_...     ┘
SUPABASE_SERVICE_ROLE_KEY    eyJ...
```

The last one: Supabase → Settings → API → **`service_role`**. The webhook cannot
write an entitlement without it, because row-level security deliberately gives
the client no insert path. Treat it like a password — it must never appear in a
`NEXT_PUBLIC_` variable or anywhere a browser can read it.

**Strongly recommended — a thirteenth, public one:**

```
NEXT_PUBLIC_SUPPORT_EMAIL    help@yourdomain   (an inbox you actually read)
```

It puts a contact address in the footer, help centre and account page. It has
no default on purpose: printing an address nobody reads is worse than printing
none, because a customer whose purchase didn't unlock writes to it, hears
nothing, and disputes the charge. Until it's set, contact lines stay hidden.

**Then redeploy.** Vercel only picks up environment variables on a new
deployment; setting them changes nothing until you do.

Check them without exposing any values:

```bash
node scripts/check-vercel-env.mjs
```

### C1. Check

```bash
curl -s -X POST https://prepnest.com.au/api/checkout \
  -H 'content-type: application/json' \
  -d '{"yearLevel":"year_9"}' -w '\n%{http_code}\n'
```

| Response | Meaning |
|---|---|
| `401 {"error":"Sign in to buy"}` | **Correct.** Stripe is wired up; checkout needs an account so the entitlement has somewhere to attach. |
| `503 "Payments are not configured"` | `STRIPE_SECRET_KEY` didn't land, or you didn't redeploy. |
| `503 "No price configured for year_9"` | The price ids didn't land, or you pasted a `prod_` id. |

---

## Part D — One real test purchase

Signed in, on the deployed site, with Stripe still in Test mode.

1. `/practice/exams` → a locked **Year 9** paper → **Unlock Year 9 for $29**
2. Pay with `4242 4242 4242 4242`, any future expiry, any CVC
3. You land back on the catalogue. It should say **"Payment received — every
   Year 9 paper is unlocked"**, briefly showing "unlocking…" first while the
   webhook lands
4. In the Supabase SQL editor: `select * from entitlements;` — **one row**
5. Open a paid Year 9 paper and download **both** the exam PDF **and** the
   answer key

Step 4 is not optional. A green checkout page is not evidence the entitlement
was written — that exact gap is why this list exists. Step 5 covers both PDF
routes, which have drifted apart once before and both return 402 when signed
out, so testing only one proves less than it looks.

If step 3 stays on "unlocking…" and step 4 shows no row: Stripe → Developers →
Webhooks → your endpoint → **Recent deliveries**. A failed delivery there tells
you exactly what the route returned.

---

## Part E — Go live

1. Flip Stripe to **Live mode** and repeat **B1** and **B2** — live mode has its
   own products, prices, webhook endpoints and keys. None of the test ones carry
   over.
2. Update the twelve variables in Vercel with the live values, redeploy.
3. Run **C1** again, and do **one real purchase on a real card**. Refund it from
   the Stripe dashboard afterwards. A test-mode pass does not prove live mode
   works — different keys, different webhook, different failure modes.

---

## What I've already done

Merged into `fix/launch-blockers`, not yet on `main`:

- **Year 12 is no longer free.** The free-sample rule gave away all four Unit
  3 & 4 papers. Catalogue is now 31 free / 43 paid, exactly one free sample per
  subject and year level.
- **The catalogue page tells the truth.** It said "$29 each" (the product is a
  $29 year-level bundle), drew a padlock on all 74 papers including the 31 free
  ones, and never read entitlements — a paying customer saw what a stranger saw.
- **Stripe's return trip is handled.** Checkout redirects before the webhook
  lands, so the catalogue used to greet a paying customer with a wall of
  padlocks. It now waits for the entitlement and says so.

To ship those:

```bash
git checkout main && git merge fix/launch-blockers && git push
```

Vercel deploys `main` automatically. Do this before Part D — the test purchase
exercises all three.

---

## Two decisions — both now made (2026-09-22)

Refund policy: **7 days, no questions asked**, set by `REFUND_DAYS` in
`src/lib/pricing.ts` and shown on /terms and in the FAQ. Analytics: **Vercel Web
Analytics** is in the root layout; enable it under Vercel → Analytics. Error
monitoring (Sentry) is still not set up.

The original notes follow.

**1. Refund policy.** `terms/page.tsx` (447 words) and `privacy/page.tsx` (571
words) don't mention payments, refunds, or Stripe at all. You need this for
Stripe onboarding and under Australian Consumer Law, and it's a business call I
shouldn't make for you.

My suggestion: a **7-day no-questions refund**, with the free sample paper at
every year level as the reason it's safe to offer — a customer can see the
product before paying, so genuine refund requests will be rare, and the promise
removes the main hesitation on a $29 purchase from an unknown brand. Tell me
your answer and I'll write both pages.

**2. Analytics and error monitoring.** There is none of either — no GA,
Plausible, PostHog, Vercel Analytics, Sentry. Two consequences: you can't tell
whether a marketing campaign worked, and a failed entitlement write is noticed
by the customer who paid rather than by you. Both need accounts you'd create.
Say the word and I'll wire up whichever you pick; Vercel Analytics plus Sentry
is the least-effort pair given you're already on Vercel.

---

## Still open, deliberately not in this runbook

Not blockers for taking a first payment, but they shape what you say in the
marketing:

- **Catalogue depth.** $29 buys 2 paid papers at most year levels, 3 for Maths.
  Honest, but thin — describe it accurately rather than implying a library.
- **NAPLAN Writing doesn't exist.** Numeracy, Reading and Language Conventions
  are covered. Writing isn't, and it's the domain parents ask about most.
- **30 `verify-bank` warnings.** Grade 4, Grade 6 and Year 8 numeracy are at 0%
  graphical questions against a ~50% target; short-answer proportion runs below
  what real NAPLAN papers use.
- **No tests.** CI runs type-check, lint, `verify-bank` and build. Nothing
  exercises checkout → webhook → entitlement → PDF, which is why Part D is done
  by hand.
