# Premium UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give PrepNest a blue-bird mascot and logo and a Duolingo-style look (rounded type, chunky lipped buttons and cards, bright colour), and make the homepage, diagnostic journey and parent dashboard tell parents the story: test → weak spots → fine-tuning → progress.

**Architecture:** The look lives in three shared places — the Tailwind theme (colours, font, weights), the global component classes (`btn-primary`, `btn-secondary`, `card`, `input`) and one mascot component — so every page inherits it. Pages the spec names are then restyled by hand.

**Tech Stack:** Next.js 14 App Router, Tailwind 3, next/font (Nunito), inline SVG.

**Spec:** `docs/superpowers/specs/2026-10-02-premium-ui-design.md`

## Global Constraints

- Colours (WCAG on white): fills `#2F8FEA` (brand-500, decorative only); buttons and links `#1D74CC` (brand-600, 4.75:1); lip and hover text `#165EA6` (brand-700); green fill `#58CC02`, green text `#2E7D00`; orange fill `#FF9600`, orange text `#A35200`; sun `#FFC530`; purple fill `#CE82FF`, purple text `#8549BA`; ink `#3C3C3C`; hairline `#E5E5E5`.
- Typeface Nunito. Tailwind weights are remapped so existing markup gets bolder: normal 500, medium 700, semibold 800, bold 900.
- Copy: "practice" for noun and verb, "purchase" not "buy", no refunds, no testimonials or usage numbers, calls to action say "now" not "tonight".
- The bird is hand-built SVG; no generated imagery.
- Merging to main is a production deploy: push the branch and open a PR; the owner merges.

---

### Task 1: Theme, type and shared classes

**Files:** Modify `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `public/manifest.json`.

- [ ] Nunito via `next/font/google` (weights 500–900) as `--font-sans`; viewport and manifest `theme_color` `#1D74CC`.
- [ ] Tailwind: brand ramp `50 #EEF6FE, 100 #D3E9FD, 200 #A9D3FA, 400 #5AA7F0, 500 #2F8FEA, 600 #1D74CC, 700 #165EA6, 800 #12497F, 900 #0B2F54`; `teal` becomes the green ramp (`50 #EAF8DD, 400 #58CC02, 600 #2E7D00`), `amber` the orange ramp (`50 #FFF2DE, 400 #FF9600, 600 #A35200`); add `sun`, `grape`, `ink`, `line`; font weights remapped; `borderRadius` 2xl 20px.
- [ ] Global classes: `btn-primary` (brand-600, 4 px brand-700 bottom lip, rounded-2xl, extra bold, lip collapses on `:active`), `btn-secondary` (white, 2 px line border, line lip, brand-600 text), `card` (white, 2 px line border, 4 px lip, rounded-2xl), `input` (2 px line border, brand-500 focus); body ink.
- [ ] Every `text-amber-400` / `text-teal-400` used as text becomes the `-600` text shade (grep `src`).
- [ ] Verify: `npm run type-check`, `npm run lint`; open `/`, `/pricing`, `/practice/exams` at 1280 px — nothing broken.
- [ ] Commit `feat(ui): Nunito, the new palette and chunky buttons and cards`.

### Task 2: The bird and the logo

**Files:** Create `src/components/brand/Bird.tsx`; modify `src/components/ui/Logo.tsx`, `src/app/icon.svg`, `src/app/apple-icon.png`.

- [ ] `Bird({ pose: 'nest' | 'cheer' | 'think' | 'read', className, title? })`: one shared set of shapes (body, belly, tuft, eyes, cheeks, beak, wings, tail), with the pose deciding eyes (open / happy), wings and prop (pencil and nest / raised wings / thought dots / open book). `aria-hidden` unless `title`.
- [ ] `BirdMark({ className })`: head over nest rim, for 16–40 px.
- [ ] `Logo`: `BirdMark` + "Prep" ink / "Nest" brand-500 in Nunito 900.
- [ ] `icon.svg` = `BirdMark` on a white rounded square; `apple-icon.png` rendered from it at 180 px with headless Edge.
- [ ] Verify: render all four poses and the mark at 24/32/180 px; read the PNG.
- [ ] Commit `feat(brand): the PrepNest bird and logo`.

### Task 3: Navigation and footer

**Files:** `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`.

- [ ] Navbar: 2 px line bottom border, new logo, nav links extra bold, header button `btn-primary` "Free diagnostic test".
- [ ] Footer: brand-tinted band, logo, the reading bird, one line for parents.
- [ ] Verify at 1280 and 390 px (menu open). Commit `feat(ui): navigation and footer`.

### Task 4: Homepage

**Files:** `src/components/home/MarketingHome.tsx`, create `src/components/home/StorySection.tsx`.

- [ ] Hero: bird in the nest; *The free, simple way to find exactly where your child needs help.*; `btn-primary` "Start the free test" → `/diagnostic`, `btn-secondary` "I already have an account" → `/auth/login`.
- [ ] Four step cards: *Your child takes a test · We find the weak spots · We keep fine-tuning · You watch them improve*.
- [ ] `StorySection({ title, body, art, flip, tint })` × 4, alternating art left/right, one per step, each with a real visual: the thinking bird beside a question tile; the sample report; a follow-up/confidence card; the progress (over time) panel.
- [ ] Keep: sample report, library, pricing, FAQ; closing banner in brand-500 with the cheering bird, "Find out where to start now".
- [ ] Verify 1280/390. Commit `feat(home): the parent story, Duolingo style`.

### Task 5: Diagnostic journey

**Files:** `src/app/diagnostic/page.tsx`, `src/components/diagnostic/{DiagnosticSetup,DiagnosticRunner,QuestionView,DiagnosticResults,HeadlineResults,LevelChip,AreaBar}.tsx`, `src/components/diagnostic/report/*`.

- [ ] Setup: bird in the nest in the hero; year and subject tiles as chunky cards; big `btn-primary`.
- [ ] Runner: thick (16 px) rounded progress bar in green with a highlight; answer options as chunky lipped tiles (selected: brand-50 fill, brand-500 border); intro with the thinking bird; "A few more to go" with the cheering bird; full-width bottom action bar on phones.
- [ ] Results: cheering bird above the score; level chips green/blue/orange; bars 12 px rounded.
- [ ] Report: same cards; the reading bird beside "Help at home".
- [ ] Verify: a full anonymous run on the dev server at 1280 and 390 px; `/dev/diagnostic-report`. Commit `feat(diagnostic): the new look`.

### Task 6: Parent dashboard

**Files:** `src/app/parent/page.tsx`, `src/components/diagnostic/DiagnosticsList.tsx`.

- [ ] Greeting with the bird; stat tiles as lipped cards with coloured icons; diagnostics list rows as cards; topic bars 12 px rounded.
- [ ] Verify type-check (needs sign-in to view live). Commit `feat(parent): dashboard in the new look`.

### Task 7: Sweep, verify, PR

- [ ] Visit every other page at 1280 px (`/practice/exams`, an exam page, `/pricing`, `/naplan`, `/vce`, `/practice`, `/help`, `/auth/login`, `/auth/register`, `/whats-new`, `/privacy`) and fix anything the shared classes broke.
- [ ] `npm test`, `npm run type-check`, `npm run lint`, stop the dev server, `npm run build`.
- [ ] Push, open the PR with before/after screenshots described, hand over.
