# Premium catalogue, year picker, sign-up and VCE sets

Approved by the owner on 2026-09-24 from the chat mockups: option A (paper tiles), a grouped year picker, teacher and tutor accounts, and two-exam VCE sets sold as one purchase.

## Why

The owner's feedback was that the catalogue shows only "how many exams are available", as grey counts and plain text links. The year pills ("Gr 3") and the sign-up form look basic. Sign-up leaves out teachers and tutors, who are natural buyers of printable papers. A VCE customer who buys Methods Exam 1 should also get Exam 2 of the same set, because the two papers are one exam sitting.

## 1. Catalogue: paper tiles (`/practice/exams`)

**Year section**
- A stage tag: "NAPLAN year" for Grades 3, 5, 7 and 9; "VCE Units 1 & 2" or "VCE Units 3 & 4" for Years 11 and 12.
- The long name, and "N printable papers across K subjects".
- Pills for "X free" and "Y with a plan". A VCE year shows "Z practice sets" instead.
- The existing unlock or owned message stays.

**Subject card:** the subject icon and name, then one **paper tile** per paper.
- **The tile:** a small portrait "printed page" (about A4 ratio) showing the paper number.
- **Its state:**
  - Free: teal border and a "Free" label.
  - Unlocked: a tick.
  - Locked: a lock icon.
  - VCE and locked: the price.
- **Behaviour:** each tile links to its paper page and carries an accessible label, e.g. "Maths practice exam 2, locked".
- **VCE two-exam sets:** Exam 1 and Exam 2 of a set render as one **set tile**: two joined pages marked "Ex 1" and "Ex 2", the set number, and one price or state.

**Year picker:** it replaces the chip row.
- Grouped tiles: Primary (Grades 3–6), Secondary (Years 7–10) and VCE (Years 11–12).
- Each tile shows the long name, the paper count and a NAPLAN or VCE-unit tag. The selected tile uses the brand fill.
- On phones the picker becomes one horizontally scrolling row of compact tiles, keeping `ScrollActiveIntoView`.

**Components** go in `src/components/catalogue/`:
- `YearPicker.tsx`: presentational, taking `{ items, selected, hrefFor | onSelect }`.
- `YearSection.tsx`.
- `PaperTile.tsx`.
- `SetTile.tsx`.

The page keeps its data logic, which is access and year selection.

## 2. Homepage "library at a glance"

`MarketingHome`'s four-number strip becomes a panel:
- The headline totals: papers, questions, free, and added this month.
- The `YearPicker` in link mode, with every year linking to `/practice/exams?year=…`.

## 3. Sign-up (`/auth/register`)

- **Layout:** a centred branded card, with the PrepNest mark, "Create your free account" and one supporting line.
- **Account type:** three tiles — Student ("I'm studying"), Parent ("For my children") and Teacher or tutor ("For my students").
- **Students:** they pick their year from the grouped year tiles (select mode, no counts). The counts live in the server-only `catalogue.ts` and the form is a client component. The native `<select>` goes.
- **The teacher role:**
  - `UserRole` gains `'teacher'`.
  - A new migration, `supabase/schema_teacher_role.sql`, runs `alter type user_role add value if not exists 'teacher'`. `profiles.role` is cast from sign-up metadata, so a teacher sign-up fails until this runs.
  - Add it to `scripts/check-live-schema.mjs`.
- **Teachers across the site:** a teacher is treated like a parent. That covers the navbar dashboard link, the homepage branch and the parent dashboard (linking students). The account page labels them "Teacher or tutor".
- **Where the branches live:** the role branches currently read `role === 'parent'`. They become `isGuardianRole(role)`, from `src/lib/auth/roles.ts`, so the rule lives in one place.

## 4. VCE two-exam sets

- **Pairing:** `…-exam1` and `…-exam2` with the same stem are one set. `vcePartnerId(id)` in `src/lib/auth/access.ts` is a pure string function, so no catalogue import is needed.
- **Access:** `accessReason` grants a VCE paper when either the paper or its partner was purchased. Existing purchases gain their partner at once. The webhook, checkout flow and `paper_purchases` are unchanged.
- **Copy:**
  - The Stripe description names both exams: "… Practice set 3 — Exam 1 and Exam 2".
  - The paper page's lock screen says "Includes Exam 1 and Exam 2".
  - The account page lists the partner as owned.

## Rollout

`schema_teacher_role.sql` must be applied to the live database **before** this merges, or teacher sign-ups fail. `check-live-schema.mjs` reports it.

## Testing

- **Unit test:** `vcePartnerId` and the partner rule in `accessReason`, as a small node test script run in CI next to `verify-bank --self-test`. The repo has no test runner.
- **Checks:** type-check, lint, build.
- **Visual:** render `/practice/exams`, `?year=grade_3`, `?year=year_12`, `/` and `/auth/register` at 1280 px and 390 px.
- **Sign-up:** check that the role tiles and year tiles set the metadata submitted to `auth.signUp`, with the request inspected and not sent.
