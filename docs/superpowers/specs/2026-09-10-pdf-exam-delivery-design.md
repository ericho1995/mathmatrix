# PDF Exam Delivery — design

Status: approved by user 2026-09-10.

## Context

Mid-implementation of the NAPLAN question-format pilot
(`docs/superpowers/specs/2026-09-09-naplan-question-format-design.md`), the user
redirected the delivery model: real NAPLAN/VCE practice happens on paper — a student
prints an exam, completes it by hand under timed conditions, then marks it against a
separate answer key. PrepNest's interactive on-screen `QuizRunner` doesn't replicate
that, and it's not supposed to for full exams. Business-model context that shapes this
spec: in-browser interactive practice (small, casual question sets) is the free
trial/demo; the actual paid product is a downloadable, printable exam PDF plus a
separate answer-key PDF. This is a new subsystem, not a content change, and it changes
how the NAPLAN plan's screen-rendering tasks should be spent — see that plan's ledger
for the pivot record.

This spec only covers the PDF generation/delivery subsystem. It does not re-litigate
the NAPLAN spec's data model (`Stimulus`, sectioned `PracticeExam`, `calculator_allowed`)
— that stays as designed; a PDF renderer consumes exactly the same structure a screen
renderer would.

## Goals

1. Generate a real, downloadable `.pdf` exam paper from a `PracticeExam` — cover page,
   per-section instructions (title, time, calculator allowed/not), stimulus passages
   printed before their question cluster, sequentially numbered questions with either
   MC bubble layout or lined space for written/long-form answers.
2. Generate a separate answer-key `.pdf` for the same exam — same header, then each
   question's correct answer and explanation.
3. Apply this to every subject's exam catalog (`PRACTICE_EXAMS`) generically — the
   renderer is subject-agnostic, built once against `PracticeExam`/`Question`/`Stimulus`.
4. Every exam PDF is paid content now, not just VCE selective subjects — extend the
   existing "locked, price shown, coming soon" placeholder pattern (already live for
   VCE) to every subject's exam catalog, rather than building a real payment/entitlement
   system (still out of scope — no processor exists, this doesn't change that).
5. The interactive `QuizRunner` keeps working exactly as it does today, but is
   repositioned as the free/casual practice surface only (`/practice`'s ad-hoc
   subject+topic+count builder) — it is no longer used for the fixed exam catalog.

## Non-goals

- Building a real payment/entitlement system (Stripe or otherwise). Every exam PDF
  stays behind the same UI-only "coming soon" lock VCE already has; this spec only
  widens that lock to cover every subject, and gets the actual PDF generation
  fully built and testable so it's ready the moment payments exist.
- A real, dynamically-generated PDF for the `/practice` personalised builder's
  exam-scale output. That page gets a "Generate exam paper" call-to-action that leads
  to the same locked/coming-soon state as the fixed catalog — no dynamic PDF endpoint
  is built for it yet, since nothing downloadable would be reachable behind the lock
  anyway. The fixed-catalog PDF plumbing is written so it's trivial to reuse later
  (`resolveExam`-shaped input, not catalog-lookup-specific).
- Any change to `QuizRunner`'s question-taking mechanics, XP/session persistence, or
  the free-practice flow's UI beyond removing exam-specific code paths that no longer
  apply to it.

## Design

### PDF rendering: `@react-pdf/renderer`

Pure-JS PDF renderer (no headless browser/Chromium needed — works in a standard Next.js
Node runtime Route Handler on Vercel). Documents are built from React components using
its own primitives (`Document`, `Page`, `View`, `Text`, `StyleSheet`), not regular DOM
JSX. New dependency: `@react-pdf/renderer` in `package.json`.

### File structure

- `src/lib/pdf/theme.ts` — shared `StyleSheet.create(...)` styles (fonts, spacing,
  colors) reused by both documents, so they look like one consistent paper family.
- `src/lib/pdf/resolveExam.ts` — `resolveExam(examId: string): ResolvedExam | null`,
  looking up a `PracticeExam` from `PRACTICE_EXAMS`, resolving each section's
  `question_ids` to full `Question` objects from `QUESTION_BANK`, and each resolved
  question's `stimulus_id` to a `Stimulus` from `STIMULI`. Shape:
  ```ts
  interface ResolvedExam {
    exam: PracticeExam
    sections: { section: PracticeExamSection; questions: (Question & { stimulus?: Stimulus })[] }[]
  }
  ```
- `src/lib/pdf/ExamPaperDocument.tsx` — `<Document>` taking a `ResolvedExam`: cover
  page (subject/year/title, per-section time summary, general instructions), then per
  section: a section header (title, time, calculator note), each stimulus printed once
  before its question cluster, and every question numbered sequentially across the
  whole paper (not restarting per section) — MC questions render their options as
  A/B/C/D bubbles, long-form questions render ~6 blank lines.
- `src/lib/pdf/AnswerKeyDocument.tsx` — `<Document>` taking the same `ResolvedExam`:
  same cover header, then a compact per-question list of the correct answer (letter +
  text, or "See marking guide" for long-form) and its explanation.
- `src/app/api/exams/[id]/pdf/route.ts` — `GET`, Node runtime. Resolves the exam via
  `resolveExam`; 404 if missing. If `exam.premium` is true, returns a 402 JSON body
  (`{ error: 'Payment required', price: PREMIUM_PRICE }`) — unconditionally, since no
  purchase/entitlement record can exist yet (this is the same rule the UI already
  enforces, moved server-side so the download link itself is not a bypass of the paywall
  the UI shows). Otherwise renders `ExamPaperDocument` via `renderToBuffer` and returns
  it with `Content-Type: application/pdf` and a `Content-Disposition: attachment;
  filename="<subject>-<year>-<n>.pdf"`.
- `src/app/api/exams/[id]/answers/route.ts` — same shape, `AnswerKeyDocument`.
- `scripts/gen-exams.mjs` — change `premium: SELECTIVE_SUBJECTS.has(subject)` to
  `premium: true` unconditionally for every generated `PracticeExam`.
- `src/components/practice/PremiumExamLock.tsx` — extracted from the existing inline
  locked-screen JSX in `exams/[id]/page.tsx` (title, price, "coming soon" messaging),
  so the same component can be reused by the personalised builder's new CTA.
- `src/app/practice/exams/[id]/page.tsx` — rewritten: no more `QuizRunner` usage at
  all. Every exam shows `PremiumExamLock`, which fully replaces the page body (since
  every exam is now premium and nothing is purchasable yet) — no download links render
  in the UI while locked. The API routes are independently testable via `curl`/dev
  tools without a UI entry point, so the rendering plumbing is fully built and verified
  even though nothing is reachable from the live page yet. Once a real payment system
  exists, unlocking a specific exam is a follow-up change to this page (show the
  download links instead of the lock) — not built now, since there is no entitlement
  record yet to key that check against.
- `src/app/practice/page.tsx` — add a "Generate exam paper" button/link alongside
  "Start practice" once a selection is ready (`readyToBuild`); it renders
  `PremiumExamLock` in place of building a `QuizRunner` session. `QuizRunner` itself is
  untouched — this page's existing interactive flow keeps working exactly as today.

### Section/question numbering and layout details

- Question numbers run continuously across the whole paper (Section A: 1-8, Section B
  continues at 9, etc.) — matches real NAPLAN/VCE convention.
- A stimulus is printed once, immediately before the first question that references
  it, and stays on the page(s) its question cluster occupies (no need to reprint it per
  question — unlike the on-screen `QuizRunner`, a printed page can show text once above
  several questions).
- Each section starts on a new page (`break` prop on the first element of a section).
- MC options render as a lettered list (A/B/C/D) with a small circle/bubble glyph next
  to each, not full-width buttons (there's no click target on paper).
- Long-form questions render the question text followed by ~6 blank ruled lines (a
  repeated thin bottom-border `View`) for handwritten working/answers.

## Testing

- No live payment state exists, so `exam.premium` is unconditionally true for every
  generated exam — the API routes' 402 branch is exercised by default. To verify the
  actual PDF rendering works, temporarily flip `premium: true` to `false` for one exam
  in the generated `exams.ts` (or add a short-lived dev-only bypass), hit both routes,
  inspect the returned PDF, then revert before committing — same technique already used
  in this repo to verify the long-form question UI (see git history, "Verify VCE
  premium exam content" commit).
- `npx tsc --noEmit` clean after every task.
- Manual smoke test: download both PDFs for one Maths exam and one English exam (the
  latter exercising stimulus rendering), open them, visually confirm cover page,
  section breaks, question numbering, and stimulus placement look right.
- `/practice` (free interactive builder) and the existing `QuizRunner` on-screen
  behavior must be re-verified unchanged after this work (manual click-through) — this
  spec must not regress the free trial experience.

## Rollout order (unchanged from the NAPLAN spec, resumes after this ships)

This plan executes, then the NAPLAN plan's Tasks 7-14 (content authoring) resume
unaffected. VCE Maths trio / VCE English / VCE Physics-Chemistry sub-projects remain
future work; once built, their exam catalogs automatically get PDF export for free
(the renderer is already subject-agnostic) — no separate PDF work needed per subject
going forward.
