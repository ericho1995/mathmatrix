# PrepNest — what needs doing, in priority order

**Date:** 2026-09-13
**Verified against:** commit `1cb5a9f`, live Supabase project `mntpvbzarwrnhebphwyb`

Priority is set by one question: *what stands between PrepNest and a paying
customer who stays?* Everything in Tier 1 blocks revenue outright. Tier 2 is what
makes revenue survivable. Tiers 3 and 4 grow it.

---

## Tier 1 — Blocking revenue

### 1. There is no way to take money

`src/lib/pricing.ts` is a hardcoded string:

```ts
export const PREMIUM_PRICE = '$4.99'   // UI-only for now
```

All **91 of 91** exams are flagged `premium: true`, and every one sits behind a
"coming soon" lock. A visitor today sees 91 locked papers and leaves. There is no
path from interest to payment, and no path from payment to a file.

Before writing any code, decide the commercial model:

- **Per-paper** (~$4.99) — simple, matches the current lock UI, low commitment,
  but revenue scales only with catalogue depth, which is the weakest thing we have.
- **Subscription** (~$15–25/mo) — better economics and forgives a thin catalogue
  *if* new papers land regularly. Requires the generation pipeline to be real.
- **Year-level bundle** (~$29 one-off) — good fit for how parents actually buy
  around NAPLAN, which is seasonal and deadline-driven.

Recommendation: **bundle or subscription, not per-paper.** Per-paper maximises
the pain of a shallow catalogue.

Then: Stripe Checkout, an `entitlements` table, and a real gate on the two PDF
routes (they currently share a duplicated 402 check that must stay in sync).

### 2. The entire paid product is free to anyone who opens devtools

`src/app/practice/page.tsx` is a `'use client'` component that imports
`QUESTION_BANK`. That means all **1,518 questions — every `correct_index`, every
`explanation`** — ship inside the browser JS bundle on a public page.

You cannot charge for something the browser already handed over. This is a
prerequisite for Tier 1.1, not a follow-up to it.

The fix is structural, not a patch: the client needs exam *metadata* (title,
topic, question count, price), never question content. PDF generation already
runs server-side in a Node route, so the data never has to cross to the client at
all.

### 3. The catalogue is two papers deep where it matters

Measured capacity, at 30 questions per section and a question reused at most
twice:

| Section | Distinct papers possible |
|---|---|
| Reading (every year level) | **2** |
| Language Conventions (every year level) | **2** |
| Numeracy | 4–5 |

A parent who buys "NAPLAN practice" and gets two Reading papers asks for a
refund. Either build depth (see Tier 4.2) or price and describe the product
honestly around what exists today.

This is a commercial decision before it is an engineering one: it determines
whether the model above can be a subscription at all.

---

## Tier 2 — Makes revenue survivable

### 4. No tests, no CI, no content verification

There is no test script and no CI workflow in the repo. Every quality defect
found while building the current content — questions pitched two year levels too
high, four near-identical questions in one paper, an item built from emoji the
PDF font cannot render, a clock face with its hand across a numeral — was caught
by hand, by looking.

At 1,518 questions that stops working, and it makes automated generation
unsafe to attempt. Build `npm run verify-bank` (structural, duplication,
distribution, glyph coverage, year-level calibration, arithmetic) and run it in
CI. Detail in `docs/superpowers/specs/2026-09-13-exam-generation-scale-design.md`.

### 5. Production is ~1,000 questions behind the repo

The live `questions` table holds **511** rows. The repo holds **1,518**. Several
migrations in `supabase/` have never been applied.

The PDFs themselves are fine — they render from `bank.ts`, not the database. The
damage is narrower but real: `question_attempts` rows reference question ids that
do not exist in production, so per-question analytics silently fail for roughly
two thirds of the bank, and the admin publish panel shows a stale catalogue.

Root cause is that migrations are applied by hand in the SQL editor. That needs
to become an actual deploy step before anything else depends on the database.

### 6. Failures are invisible by design

Supabase writes across the app are wrapped in `try/catch` so nothing crashes.
The effect is that a broken migration, a missing RPC or an RLS rejection looks
identical to success. This has already hidden three separate production bugs.

Once money is involved that is untenable — a failed entitlement write must not
look like a completed purchase. Surface errors, add monitoring, and treat silent
catch blocks in payment and entitlement paths as defects.

---

## Tier 3 — Product completeness

### 7. The Writing test does not exist

NAPLAN has four domains. PrepNest covers Numeracy, Reading and Language
Conventions. Writing is absent, and it is the one parents worry about most.

It is a different shape from everything built so far: a prompt plus a marking
rubric, not scored questions. Worth scoping separately.

### 8. Marked work goes nowhere

Long-form and short-answer responses are captured but never scored, and there is
no interface for a parent or tutor to mark them. For a paid product this is a
visible hole — the answer key exists, but nothing closes the loop.

### 9. Years 4, 6 and 8 are half-built

They generate papers but have no reading passages, so their Reading sections are
short. Either finish them or drop them from the catalogue — shipping a visibly
thinner paper at some year levels undercuts trust in all of them.

---

## Tier 4 — Scale and efficiency

### 10. Content-as-code has hit its ceiling

`bank.ts` is a ~14,000-line TypeScript file that already exceeded the compiler's
union-complexity limit once (TS2590) and now has to be split into four chunks to
compile at all. It is also the direct cause of the bundle-exposure problem in
Tier 1.2.

Moving question content to data — JSON or the database, loaded server-side
through a typed boundary — resolves both problems at once and removes the
recurring chunk-splitting chore. Worth doing *before* the bank grows another
thousand questions, not after.

### 11. Content generation does not scale by hand

Reaching ten papers per section needs roughly 1,500 more questions and 30 more
passages — around 15 sessions of pure authoring at the observed rate. The
proposal is in
`docs/superpowers/specs/2026-09-13-exam-generation-scale-design.md`; it depends on
Tier 2.4 being done first.

### 12. Illustration library

Eight illustrations exist and the authoring pipeline works. More figure types —
nets, 3D solids, shape composition — would bring Year 3 and 5 closer still to the
real papers. Genuine polish, and correctly last.

---

## The short version

1. You cannot take money.
2. What you would sell is already public in the JS bundle.
3. There is only about a fortnight of content per year level.

Those three are the business. Everything below them is engineering that matters
only once those are true.
