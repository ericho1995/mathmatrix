# Website UX — sell the product PrepNest actually has

**Date:** 2026-09-21 · **Status:** approved by delegation (user asked for autonomous research + build)

## Problem

The site describes a product PrepNest stopped being. The paid product is
printable exam papers with separate answer keys — $29 unlocks a year level, one
free sample paper per subject and year — but a visitor would never learn that
from the site:

- The homepage hero sells "instant feedback, XP and streaks", the free
  in-browser quiz. It never mentions exam papers, answer keys, NAPLAN, VCE, the
  free sample, or the price.
- It contradicts itself: "Grade 5 to Year 12" in the hero and the page metadata,
  "Gr 3–Yr 12" in the stat banner. The catalogue starts at Grade 3.
- The papers — the thing for sale — sit behind Practice → a second tab. The nav
  offers "Practice" and "Leaderboard", and the leaderboard is empty.
- There is no pricing page. The price appears only after clicking a locked paper.
- There is nowhere for a paying customer to see what they bought, and no way to
  contact the business at all.
- **Bug:** a signed-out visitor who clicks "Unlock" is sent to
  `/auth/login?next=…`, but login ignores `next` and always goes to `/`. The
  purchase intent is lost on the one path that takes money.
- The catalogue is grouped subject-first, but the product is sold per year level.
  A parent thinks "my child is in Year 5", and has to assemble that view by
  scrolling across three subject sections.

## Research

Competitors (PrepPath, NotesEdu, Kilbaha, Neap, ATAR Hero, Polarbear) converge on:

- Navigation by **exam**, not by feature: NAPLAN, Selective, VCE.
- A dedicated **Pricing** page with an explicit free-vs-paid comparison.
- **Guides / FAQ / Support** as first-class tabs.
- **Exam countdowns** — VCE countdown tools are a common traffic driver.
- Explicit **what's in a pack**: number of tests, questions, marked writing.

Dates verified against primary sources:

- **NAPLAN 2027: 10–22 March 2027** (nap.edu.au key dates; 2028: 15–27 March).
- **VCE 2026 written exams: 27 Oct – 18 Nov 2026** (VCAA timetable), including
  General Maths Exam 1 Fri 30 Oct, Exam 2 Mon 2 Nov; Methods Exam 1 Thu 5 Nov,
  Exam 2 Fri 6 Nov; Specialist Exam 1 Mon 9 Nov, Exam 2 Wed 11 Nov; Chemistry
  Tue 10 Nov; Physics Thu 12 Nov.

As of today the first VCE maths exam is ~5 weeks away. That is the most
time-sensitive marketing window PrepNest has.

## Design

### New pages

| Route | Purpose |
|---|---|
| `/pricing` | The bundle explained. Free vs paid side by side, per-year-level paper counts computed from the real catalogue (never hardcoded), buy buttons, payment FAQ. |
| `/naplan` | NAPLAN hub. 2027 test window + countdown, the four domains and which ones PrepNest covers — **honestly stating Writing is not yet available** — and per-year links (3/5/7/9) into the catalogue. |
| `/vce` | VCE hub. 2026 timetable for the subjects PrepNest covers, a countdown per exam, and links to Units 1&2 (Year 11) and Units 3&4 (Year 12) papers. |
| `/account` | Signed-in only. Profile, the year levels you've unlocked with links straight to them, receipt note (Stripe emails receipts), links to parent linking and help. |
| `/help` | Help centre: FAQ grouped by Buying / Papers / Accounts / Parents, plus a contact block. |

### Changed pages

- **Navigation** — Exam papers · NAPLAN · VCE · Practice · Pricing, plus
  role links (Leaderboard for students, Parent dashboard for parents) and an
  Account link when signed in. Leaderboard leaves the signed-out nav: an empty
  board is poor first-impression social proof.
- **Footer** — grouped columns (Exams / Product / Support / Legal).
- **Homepage (signed out)** — rewritten around the paper product: hero that
  names it, exam-picker cards (NAPLAN / Years 3–10 / VCE), the
  download → sit → mark → targeted-practice loop, a countdown strip, pricing
  summary, parent section, updated FAQ. Grade 3 everywhere.
- **Catalogue** — grouped by **year level**, with year-level filter chips
  (`?year=` so NAPLAN/VCE/pricing pages can deep-link), each year showing its
  paper count, free count, and a buy button right there.
- **Exam detail and lock pages** — show the paper's structure (sections,
  question counts, minutes, calculator, reading time) before asking for money,
  and a short how-to-use for unlocked papers.
- **Login** — honours a safe relative `next`, so Buy → sign in → back to buying.
- **SEO** — per-page titles/descriptions; sitemap includes new pages and every
  exam page.

### Shared units

- `src/lib/site.ts` — support email from `NEXT_PUBLIC_SUPPORT_EMAIL`. **No
  fallback address is invented**; when unset, contact copy is hidden rather than
  pointing at a mailbox that may not exist.
- `src/lib/examDates.ts` — the dates above, each with its source URL, plus a
  `daysUntil()` computed in Australia/Melbourne time so a countdown never shows
  "0 days" the evening before in UTC.
- `src/lib/catalogue.ts` — per-year-level stats (papers, free, paid, subjects)
  derived from `PRACTICE_EXAMS`, used by pricing, hubs and the catalogue so the
  numbers cannot disagree with each other.
- `BuyBundleButton` — the checkout call extracted from `PremiumExamLock`, reused
  by the lock page, catalogue and pricing page.
- `PaperFacts` — renders a paper's structure from its sections.

### Deliberately excluded

- **Testimonials, review counts, "trusted by N families".** There are no real
  ones yet; fabricating them is both dishonest and an ACL problem.
- Blog / guides CMS, AI tutor, Writing test, app — each is its own project.
- Year 12 checkout — still needs a tenth Stripe price (see launch runbook).

## Error handling

- Pages with signed-in content fail closed through the existing
  `queryFailed` / entitlement helpers; a failed entitlement read shows papers as
  locked, never as unlocked.
- `next` redirect accepts only paths beginning with a single `/` — no protocol,
  no `//host` — so it cannot become an open redirect.
- Countdowns hide themselves once a date has passed rather than going negative.

## Verification

Type-check, lint, `verify-bank`, build; then each new and changed page walked in
the browser at desktop and mobile width, signed out, checking for console
errors. The signed-in and purchased states are exercised by the launch
runbook's Part D test purchase.
