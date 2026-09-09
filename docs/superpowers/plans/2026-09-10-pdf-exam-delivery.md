# PDF Exam Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn every exam in `PRACTICE_EXAMS` into a downloadable exam-paper PDF plus a separate answer-key PDF, generic across all subjects, with every exam now paid content behind the existing UI-only "coming soon" lock (extended from VCE-only to all subjects).

**Architecture:** `@react-pdf/renderer` builds two documents (exam paper, answer key) from a shared `resolveExam()` helper that hydrates a `PracticeExam`'s sections with full `Question`/`Stimulus` data. Two Node-runtime API routes serve them, gated by `exam.premium` (unconditionally locked — no payment system exists). The exam detail page drops `QuizRunner` entirely in favor of a `PremiumExamLock` component; the free interactive `/practice` builder keeps `QuizRunner` untouched but gains a "Generate exam paper" CTA that shows the same lock.

**Tech Stack:** Next.js 14 App Router Route Handlers (Node runtime), `@react-pdf/renderer`, TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-10-pdf-exam-delivery-design.md`

**Depends on:** Task 4 of `docs/superpowers/plans/2026-09-09-naplan-question-format.md` (sectioned `PracticeExam` with `.sections`) must be complete before Task 1 of this plan — `resolveExam()` reads `exam.sections`, which doesn't exist until that task lands.

## Global Constraints

- No test framework exists in this repo. Verification is `npx tsc --noEmit`, `node -e` checks, and manual PDF inspection.
- `exam.premium` is unconditionally `true` for every generated exam after Task 4 of this plan — there is no entitlement/payment record to check against, so any code gating on it must treat `premium === true` as an unconditional lock, not a "check if this specific user purchased it" branch (that's future work, out of scope here).
- To verify PDF rendering actually works despite the unconditional lock, temporarily flip one exam's `premium` to `false` in the generated `src/lib/questions/exams.ts` (never in `gen-exams.mjs` itself — that would regress Task 4 of the other plan), test, then run `node scripts/gen-exams.mjs` again to regenerate the file back to its correct all-premium state before committing. Never commit a manually-edited `exams.ts`.
- Do not modify `src/components/practice/QuizRunner.tsx`'s question-answering mechanics, XP/session persistence, or its existing props — it is explicitly out of scope (spec Non-goals).

## File Structure

- Modify: `package.json` — add `@react-pdf/renderer`.
- Create: `src/lib/pdf/theme.ts` — shared PDF styles.
- Create: `src/lib/pdf/resolveExam.ts` — exam-id → hydrated sections+questions+stimuli.
- Create: `src/lib/pdf/ExamPaperDocument.tsx` — the exam paper PDF document.
- Create: `src/lib/pdf/AnswerKeyDocument.tsx` — the answer key PDF document.
- Create: `src/app/api/exams/[id]/pdf/route.ts` — exam paper download route.
- Create: `src/app/api/exams/[id]/answers/route.ts` — answer key download route.
- Modify: `scripts/gen-exams.mjs` — `premium: true` unconditionally.
- Create: `src/components/practice/PremiumExamLock.tsx` — extracted lock UI.
- Modify: `src/app/practice/exams/[id]/page.tsx` — drop QuizRunner, always show the lock.
- Modify: `src/app/practice/page.tsx` — add a "Generate exam paper" CTA showing the lock.

---

### Task 1: Install `@react-pdf/renderer`, `resolveExam.ts`, `theme.ts`

**Files:**
- Modify: `package.json`
- Create: `src/lib/pdf/theme.ts`
- Create: `src/lib/pdf/resolveExam.ts`

**Interfaces:**
- Consumes: `PRACTICE_EXAMS` (`src/lib/questions/exams.ts`, with `.sections` from the other plan's Task 4), `QUESTION_BANK` (`src/lib/questions/bank.ts`), `STIMULI` (`src/lib/questions/stimuli.ts`).
- Produces: `resolveExam(examId: string): ResolvedExam | null` and the `ResolvedExam` type, consumed by Tasks 2, 3, 4, 5.

- [ ] **Step 1: Install the dependency**

```bash
npm install @react-pdf/renderer
```

- [ ] **Step 2: Write the failing check**

```bash
node -e "require('@react-pdf/renderer')" 2>&1 | head -1
ls src/lib/pdf 2>&1
```
Expected before this task's code exists: the require succeeds (package installed) but `ls src/lib/pdf` fails (directory doesn't exist yet).

- [ ] **Step 3: Create the theme file**

```ts
// src/lib/pdf/theme.ts
import { StyleSheet } from '@react-pdf/renderer'

export const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica', color: '#1a1a1a' },
  coverTitle: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  coverSubtitle: { fontSize: 12, color: '#555', marginBottom: 16 },
  coverInstructions: { fontSize: 10, color: '#333', lineHeight: 1.5, marginBottom: 4 },
  sectionHeader: { fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 4, borderBottom: '1pt solid #333', paddingBottom: 4 },
  sectionMeta: { fontSize: 9, color: '#666', marginBottom: 12 },
  stimulusBox: { backgroundColor: '#f5f5f5', padding: 10, marginBottom: 10, borderRadius: 2 },
  stimulusTitle: { fontSize: 9, textTransform: 'uppercase', color: '#888', marginBottom: 4 },
  stimulusBody: { fontSize: 10, lineHeight: 1.5 },
  questionRow: { marginBottom: 14 },
  questionText: { fontSize: 11, marginBottom: 6 },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3, marginLeft: 12 },
  optionBubble: { width: 10, height: 10, borderRadius: 5, border: '1pt solid #333', marginRight: 6 },
  optionText: { fontSize: 10 },
  answerLine: { borderBottom: '0.5pt solid #999', height: 18 },
  answerKeyRow: { marginBottom: 8, fontSize: 10 },
  answerKeyNum: { fontWeight: 700 },
  explanation: { fontSize: 9, color: '#555', marginTop: 2 },
})
```

- [ ] **Step 4: Write `resolveExam.ts`**

```ts
// src/lib/pdf/resolveExam.ts
import { PRACTICE_EXAMS, type PracticeExam, type PracticeExamSection } from '@/lib/questions/exams'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { STIMULI } from '@/lib/questions/stimuli'
import type { Question, Stimulus } from '@/types'

export type ResolvedQuestion = Question & { stimulus?: Stimulus }

export interface ResolvedSection {
  section: PracticeExamSection
  questions: ResolvedQuestion[]
}

export interface ResolvedExam {
  exam: PracticeExam
  sections: ResolvedSection[]
}

export function resolveExam(examId: string): ResolvedExam | null {
  const exam = PRACTICE_EXAMS.find(e => e.id === examId)
  if (!exam) return null

  const questionById = new Map(QUESTION_BANK.map(q => [q.id, q]))
  const stimulusById = new Map(STIMULI.map(s => [s.id, s]))

  const sections: ResolvedSection[] = exam.sections.map(section => ({
    section,
    questions: section.question_ids
      .map(id => questionById.get(id))
      .filter((q): q is Question => Boolean(q))
      .map(q => ({ ...q, stimulus: q.stimulus_id ? stimulusById.get(q.stimulus_id) : undefined })),
  }))

  return { exam, sections }
}
```

- [ ] **Step 5: Run the check again**

```bash
node -e "
const { execSync } = require('child_process');
execSync('npx tsc --noEmit', { stdio: 'inherit' });
"
```
Expected: clean (this only compiles — `resolveExam` isn't exercised by a runnable script yet since it's a `.ts` module using `@/` path aliases; full exercise happens once Task 4/5's API routes call it in a running Next.js process).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/pdf/theme.ts src/lib/pdf/resolveExam.ts
git commit -m "feat: add @react-pdf/renderer, PDF theme, and resolveExam helper"
```

---

### Task 2: `ExamPaperDocument.tsx`

**Files:**
- Create: `src/lib/pdf/ExamPaperDocument.tsx`

**Interfaces:**
- Consumes: `ResolvedExam`, `pdfStyles` (Task 1).
- Produces: `ExamPaperDocument({ resolved: ResolvedExam }): JSX.Element` (a `@react-pdf/renderer` `<Document>`), consumed by Task 4's API route.

- [ ] **Step 1: Write the component**

```tsx
// src/lib/pdf/ExamPaperDocument.tsx
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { pdfStyles } from './theme'
import type { ResolvedExam, ResolvedQuestion } from './resolveExam'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function QuestionBlock({ question, number }: { question: ResolvedQuestion; number: number }) {
  return (
    <View style={pdfStyles.questionRow} wrap={false}>
      <Text style={pdfStyles.questionText}>{number}. {question.question_text}</Text>
      {question.format === 'long_form' ? (
        <>
          <View style={pdfStyles.answerLine} />
          <View style={pdfStyles.answerLine} />
          <View style={pdfStyles.answerLine} />
          <View style={pdfStyles.answerLine} />
          <View style={pdfStyles.answerLine} />
          <View style={pdfStyles.answerLine} />
        </>
      ) : (
        (question.options ?? []).map((opt, i) => (
          <View key={i} style={pdfStyles.optionRow}>
            <View style={pdfStyles.optionBubble} />
            <Text style={pdfStyles.optionText}>{OPTION_LETTERS[i]}. {opt}</Text>
          </View>
        ))
      )}
    </View>
  )
}

export function ExamPaperDocument({ resolved }: { resolved: ResolvedExam }) {
  const { exam, sections } = resolved
  let questionNumber = 0
  const totalMinutes = sections.reduce((sum, s) => sum + s.section.time_minutes, 0)

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.coverTitle}>{exam.title}</Text>
        <Text style={pdfStyles.coverSubtitle}>Total time: {totalMinutes} minutes</Text>
        <Text style={pdfStyles.coverInstructions}>Sections in this paper:</Text>
        {sections.map((s, i) => (
          <Text key={i} style={pdfStyles.coverInstructions}>
            • {s.section.title} — {s.section.time_minutes} min
            {s.section.calculator_allowed !== undefined ? (s.section.calculator_allowed ? ' (calculator allowed)' : ' (no calculator)') : ''}
          </Text>
        ))}
        <Text style={pdfStyles.coverInstructions}>
          Answer every question you can. Write your working in the space provided for long-answer questions.
        </Text>
      </Page>

      {sections.map((s, si) => (
        <Page key={si} size="A4" style={pdfStyles.page}>
          <Text style={pdfStyles.sectionHeader}>{s.section.title}</Text>
          <Text style={pdfStyles.sectionMeta}>
            {s.section.time_minutes} minutes
            {s.section.calculator_allowed !== undefined ? (s.section.calculator_allowed ? ' • Calculator allowed' : ' • No calculator') : ''}
          </Text>
          {(() => {
            const rendered: JSX.Element[] = []
            let lastStimulusId: string | undefined
            for (const q of s.questions) {
              questionNumber++
              if (q.stimulus && q.stimulus.id !== lastStimulusId) {
                rendered.push(
                  <View key={`stim-${q.stimulus.id}`} style={pdfStyles.stimulusBox} wrap={false}>
                    <Text style={pdfStyles.stimulusTitle}>{q.stimulus.title}</Text>
                    <Text style={pdfStyles.stimulusBody}>{q.stimulus.body}</Text>
                  </View>
                )
                lastStimulusId = q.stimulus.id
              }
              rendered.push(<QuestionBlock key={q.id} question={q} number={questionNumber} />)
            }
            return rendered
          })()}
        </Page>
      ))}
    </Document>
  )
}
```

- [ ] **Step 2: Verify it type-checks**

```bash
npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/lib/pdf/ExamPaperDocument.tsx
git commit -m "feat: add ExamPaperDocument PDF template"
```

---

### Task 3: `AnswerKeyDocument.tsx`

**Files:**
- Create: `src/lib/pdf/AnswerKeyDocument.tsx`

**Interfaces:**
- Consumes: `ResolvedExam` (Task 1).
- Produces: `AnswerKeyDocument({ resolved: ResolvedExam }): JSX.Element`, consumed by Task 5's API route.

- [ ] **Step 1: Write the component**

```tsx
// src/lib/pdf/AnswerKeyDocument.tsx
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { pdfStyles } from './theme'
import type { ResolvedExam } from './resolveExam'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function AnswerKeyDocument({ resolved }: { resolved: ResolvedExam }) {
  const { exam, sections } = resolved
  let questionNumber = 0

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.coverTitle}>{exam.title} — Answers &amp; Explanations</Text>
        <Text style={pdfStyles.coverSubtitle}>For a parent, tutor, or the student to mark the exam paper against.</Text>
        {sections.map((s, si) => (
          <View key={si}>
            <Text style={pdfStyles.sectionHeader}>{s.section.title}</Text>
            {s.questions.map(q => {
              questionNumber++
              const answerLabel = q.format === 'long_form'
                ? 'See explanation below — this question is not auto-marked.'
                : `${OPTION_LETTERS[q.correct_index ?? 0]}. ${(q.options ?? [])[q.correct_index ?? 0] ?? ''}`
              return (
                <View key={q.id} style={pdfStyles.answerKeyRow} wrap={false}>
                  <Text><Text style={pdfStyles.answerKeyNum}>{questionNumber}. </Text>{answerLabel}</Text>
                  <Text style={pdfStyles.explanation}>{q.explanation}</Text>
                </View>
              )
            })}
          </View>
        ))}
      </Page>
    </Document>
  )
}
```

- [ ] **Step 2: Verify it type-checks**

```bash
npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/lib/pdf/AnswerKeyDocument.tsx
git commit -m "feat: add AnswerKeyDocument PDF template"
```

---

### Task 4: `/api/exams/[id]/pdf` route

**Files:**
- Create: `src/app/api/exams/[id]/pdf/route.ts`

**Interfaces:**
- Consumes: `resolveExam` (Task 1), `ExamPaperDocument` (Task 2), `PREMIUM_PRICE` (`src/lib/pricing.ts`).

- [ ] **Step 1: Write the route**

```ts
// src/app/api/exams/[id]/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { resolveExam } from '@/lib/pdf/resolveExam'
import { ExamPaperDocument } from '@/lib/pdf/ExamPaperDocument'
import { PREMIUM_PRICE } from '@/lib/pricing'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const resolved = resolveExam(params.id)
  if (!resolved) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  if (resolved.exam.premium) {
    return NextResponse.json({ error: 'Payment required', price: PREMIUM_PRICE }, { status: 402 })
  }

  const buffer = await renderToBuffer(<ExamPaperDocument resolved={resolved} />)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${resolved.exam.id}-exam.pdf"`,
    },
  })
}
```

Note: this file's extension must be `.tsx` (not `.ts`) since it contains JSX (`<ExamPaperDocument ... />`) — Next.js Route Handlers support `.tsx` route files with the same `route` filename convention.

- [ ] **Step 2: Verify the 402 path (default state — every exam is currently premium)**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/exams/math-grade_3-1/pdf
```
Expected: `402` (replace `math-grade_3-1` with any real exam id from `src/lib/questions/exams.ts` if that one doesn't exist — check with `grep -o "id: '[^']*'" src/lib/questions/exams.ts | head -3`).

- [ ] **Step 3: Verify the actual PDF renders (temporary local bypass, per Global Constraints)**

Temporarily edit `src/lib/questions/exams.ts` (NOT `gen-exams.mjs`) to set `premium: false` on the one exam object you're testing with, save, let the dev server hot-reload, then:

```bash
curl -s -o /tmp/test-exam.pdf -w "%{http_code}\n" http://localhost:3000/api/exams/math-grade_3-1/pdf
file /tmp/test-exam.pdf
```
Expected: `200`, and `file` reports `PDF document`. Open it and visually confirm a cover page and at least one section render with numbered questions.

Then **revert** `exams.ts` by regenerating it: `node scripts/gen-exams.mjs` (do not hand-commit the temporary edit).

- [ ] **Step 4: Type-check and stop the dev server**

```bash
npx tsc --noEmit
kill %1
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/exams/\[id\]/pdf/route.tsx
git commit -m "feat: add exam paper PDF download route"
```

---

### Task 5: `/api/exams/[id]/answers` route

**Files:**
- Create: `src/app/api/exams/[id]/answers/route.tsx`

**Interfaces:**
- Consumes: `resolveExam` (Task 1), `AnswerKeyDocument` (Task 3), `PREMIUM_PRICE`.

- [ ] **Step 1: Write the route** (identical shape to Task 4, swap in `AnswerKeyDocument` and a `-answers.pdf` filename)

```ts
// src/app/api/exams/[id]/answers/route.tsx
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { resolveExam } from '@/lib/pdf/resolveExam'
import { AnswerKeyDocument } from '@/lib/pdf/AnswerKeyDocument'
import { PREMIUM_PRICE } from '@/lib/pricing'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const resolved = resolveExam(params.id)
  if (!resolved) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  if (resolved.exam.premium) {
    return NextResponse.json({ error: 'Payment required', price: PREMIUM_PRICE }, { status: 402 })
  }

  const buffer = await renderToBuffer(<AnswerKeyDocument resolved={resolved} />)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${resolved.exam.id}-answers.pdf"`,
    },
  })
}
```

- [ ] **Step 2: Same verification pattern as Task 4 Steps 2-4** (402 by default, temporary bypass + curl + `file` check for the real PDF, revert `exams.ts` via `node scripts/gen-exams.mjs`, `npx tsc --noEmit` clean).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/exams/\[id\]/answers/route.tsx
git commit -m "feat: add answer key PDF download route"
```

---

### Task 6: `gen-exams.mjs` — all exams premium

**Files:**
- Modify: `scripts/gen-exams.mjs`

**Interfaces:**
- Produces: every `PracticeExam.premium` is `true` — consumed by Task 4/5's routes and Task 7/8's UI.

- [ ] **Step 1: Write the failing check**

```bash
grep -n "premium:" scripts/gen-exams.mjs
```
Expected: shows `premium: SELECTIVE_SUBJECTS.has(subject)` in two places (the NAPLAN-composer branch added by the other plan's Task 4, and the legacy branch).

- [ ] **Step 2: Change both occurrences to `premium: true`**

- [ ] **Step 3: Regenerate and verify**

```bash
node scripts/gen-exams.mjs
grep -c "premium: false" src/lib/questions/exams.ts
```
Expected: `0` — every exam is premium now.

- [ ] **Step 4: Type-check and commit**

```bash
npx tsc --noEmit
git add scripts/gen-exams.mjs src/lib/questions/exams.ts
git commit -m "feat: make every exam premium (paid PDF product, all subjects)"
```

---

### Task 7: `PremiumExamLock` component + rewrite exam detail page

**Files:**
- Create: `src/components/practice/PremiumExamLock.tsx`
- Modify: `src/app/practice/exams/[id]/page.tsx`

**Interfaces:**
- Produces: `PremiumExamLock({ title, subjectLabel }: { title: string; subjectLabel: string }): JSX.Element`, reused by Task 8.

- [ ] **Step 1: Extract the lock component**

```tsx
// src/components/practice/PremiumExamLock.tsx
import { PREMIUM_PRICE } from '@/lib/pricing'

export default function PremiumExamLock({ title, subjectLabel }: { title: string; subjectLabel: string }) {
  return (
    <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
      <div className="text-3xl mb-3">🔒</div>
      <h1 className="text-2xl font-medium tracking-tight mb-2">{title}</h1>
      <p className="text-gray-500 mb-1">
        This is a downloadable {subjectLabel} exam paper (plus a separate answer key) — {PREMIUM_PRICE}.
      </p>
      <p className="text-sm text-gray-400 mb-8">
        Payments aren&apos;t live yet, so exam PDFs can&apos;t be purchased right now.
      </p>
      <button disabled className="btn-primary w-full mb-3 opacity-50 cursor-not-allowed">
        Unlock for {PREMIUM_PRICE} — coming soon
      </button>
    </main>
  )
}
```

- [ ] **Step 2: Rewrite the exam detail page**

```tsx
// src/app/practice/exams/[id]/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { SUBJECTS, SELECTIVE_SUBJECTS } from '@/lib/curriculum'
import PremiumExamLock from '@/components/practice/PremiumExamLock'

export default function ExamPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const exam = PRACTICE_EXAMS.find(e => e.id === params.id)

  if (!exam) {
    return (
      <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
        <h1 className="text-2xl font-medium tracking-tight mb-2">Exam not found</h1>
        <p className="text-gray-500">This practice exam doesn&apos;t exist or has been removed.</p>
      </main>
    )
  }

  const subject = [...SUBJECTS, ...SELECTIVE_SUBJECTS].find(s => s.slug === exam.subject)
  return <PremiumExamLock title={exam.title} subjectLabel={subject?.label ?? 'exam'} />
}
```

Note: `router` is now unused if nothing else in the file needs navigation — remove the `useRouter` import/call if the linter flags it as unused (it's fine to keep the `'use client'` directive since this is still an interactive component even without navigation).

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
npm run lint
```
Expected: clean (no unused-variable warnings for `router`/`useRouter` — remove them if flagged).

- [ ] **Step 4: Manual smoke test**

```bash
npm run dev
```
Visit `/practice/exams`, click into any exam, confirm it shows the lock screen (no interactive quiz starts).

- [ ] **Step 5: Commit**

```bash
git add src/components/practice/PremiumExamLock.tsx src/app/practice/exams/\[id\]/page.tsx
git commit -m "feat: exam detail page shows PDF paywall instead of QuizRunner"
```

---

### Task 8: `/practice` page — "Generate exam paper" CTA

**Files:**
- Modify: `src/app/practice/page.tsx`

**Interfaces:**
- Consumes: `PremiumExamLock` (Task 7).

- [ ] **Step 1: Write the failing check**

```bash
grep -c "PremiumExamLock" src/app/practice/page.tsx
```
Expected: `0`.

- [ ] **Step 2: Add the CTA and lock screen**

Add a new `Screen` value and state, alongside the existing `'select' | 'quiz'`:

```ts
type Screen = 'select' | 'quiz' | 'exam-lock'
```

Import `PremiumExamLock` at the top. In the `screen === 'quiz'` block's sibling position, add:

```tsx
if (screen === 'exam-lock') {
  const subjectLabel = [...SUBJECTS, ...SELECTIVE_SUBJECTS].find(s => s.slug === subject)?.label ?? 'exam'
  return <PremiumExamLock title="Personalised exam paper" subjectLabel={subjectLabel} />
}
```

Next to the existing "Start practice" button at the bottom of the select screen, add a second button:

```tsx
<button onClick={() => setScreen('exam-lock')} disabled={!readyToBuild || pool.length === 0} className="btn-secondary w-full mt-2">
  Generate exam paper (PDF)
</button>
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Manual smoke test**

```bash
npm run dev
```
Visit `/practice`, pick a subject/grade/topic, confirm both "Start practice" (still launches the interactive `QuizRunner` exactly as before) and "Generate exam paper (PDF)" (shows the lock screen) work, and that going back from the lock screen (there's no back button yet — add `onExit`-style behavior only if the brief's worked example doesn't already cover it; if missing, wire the existing `onClick={() => setScreen('select')}` pattern used elsewhere on this page) returns to the picker.

- [ ] **Step 5: Commit**

```bash
git add src/app/practice/page.tsx
git commit -m "feat: add exam-paper PDF generation CTA to the personalised practice builder"
```

---

## Final verification (after all 8 tasks)

- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run build` succeeds (confirms the new API routes compile for production, not just dev).
- [ ] Manual: `/practice` free interactive flow (small question count, "Start practice") works exactly as before this plan — no regression.
- [ ] Manual: `/practice/exams` → any exam → shows the PDF paywall, no interactive quiz.
- [ ] Manual: `/practice` → pick a selection → "Generate exam paper (PDF)" → shows the same paywall.
- [ ] Using the temporary local bypass technique (Task 4 Step 3), confirm both PDF routes for one Maths exam and one English exam (the latter exercising a stimulus) produce valid, visually-correct PDFs — then confirm `exams.ts` was regenerated back to its all-premium state via `node scripts/gen-exams.mjs` and the working tree is clean before the final commit.
- [ ] Report to the user: the PDF generation pipeline is fully built and testable, but not reachable by real customers until a payment system exists — same situation as today's VCE paywall, now extended to every subject. Flag this as the natural next decision point, don't build it unprompted.
