# Premium catalogue, year picker, sign-up and VCE sets — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the text-list catalogue with paper tiles, add a grouped year picker (catalogue, homepage and sign-up), add teacher and tutor accounts, and make one VCE purchase unlock both exams of a set.

**Architecture:**
- **Pure logic** gets its own small, dependency-free modules, which are unit-tested with Node's built-in runner:
  - `src/lib/auth/vceSets.ts`: pairing and grouping;
  - `src/lib/auth/roles.ts`: role rules;
  - `src/lib/yearLevels.ts`: year labels and stages, safe to import from client code.
- **Presentation** lives in `src/components/catalogue/`. The pages keep their data fetching and access checks.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind (brand and teal palettes in `tailwind.config.ts`), lucide-react icons, and Supabase. Tests use `node --test` with Node 24's built-in TypeScript stripping.

**Spec:** `docs/superpowers/specs/2026-09-24-premium-catalogue-design.md`

## Global Constraints

- **Copy rules:** "practice" (never "practise"), "purchase" (never "buy"), and never mention refunds.
- **Server-only:** `src/lib/catalogue.ts` imports the whole paper list, so client components must never import it.
- **Paywall:** access goes through `accessReason` / `canOpen` in `src/lib/auth/access.ts` only.
- **Teacher role:** it needs `supabase/schema_teacher_role.sql` applied live before merge.
- **Tests:** `node --test scripts/tests/*.test.mjs`. Test files import `.ts` modules with explicit extensions, and those modules must not use the `@/` path alias.
- **Before every commit:** `npm run type-check` and `npm run lint` pass.

---

### Task 1: VCE sets — pairing, grouping and access

**Files:**
- Create: `src/lib/auth/vceSets.ts`, `scripts/tests/vceSets.test.mjs`
- Modify: `src/lib/auth/access.ts` (`accessReason`), `src/app/api/checkout/route.ts` (description), `src/components/practice/PremiumExamLock.tsx` (copy), `src/app/account/page.tsx` (owned list), `package.json` (`test` script), `.github/workflows/ci.yml` (run tests)

**Interfaces:**
- Produces:
  - `vcePartnerId(examId: string): string | null`
  - `ownsVcePaper(examId: string, purchased: Set<string>): boolean`
  - `setNumber(examId: string): number | null`
  - `groupIntoSets<T extends { id: string }>(exams: T[]): (T | { set: number; exams: [T, T] })[]`

- [ ] **Step 1: Write the failing test** at `scripts/tests/vceSets.test.mjs`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { vcePartnerId, ownsVcePaper, setNumber, groupIntoSets } from '../../src/lib/auth/vceSets.ts'

test('partner of exam 1 is exam 2 of the same set, and back', () => {
  assert.equal(vcePartnerId('maths_methods-year_12-3-exam1'), 'maths_methods-year_12-3-exam2')
  assert.equal(vcePartnerId('maths_methods-year_12-3-exam2'), 'maths_methods-year_12-3-exam1')
})
test('single-paper subjects have no partner', () => {
  assert.equal(vcePartnerId('physics-year_12-2'), null)
  assert.equal(vcePartnerId('chemistry-year_11-1'), null)
})
test('buying either exam of a set owns both', () => {
  const bought = new Set(['specialist_maths-year_12-4-exam2'])
  assert.equal(ownsVcePaper('specialist_maths-year_12-4-exam1', bought), true)
  assert.equal(ownsVcePaper('specialist_maths-year_12-4-exam2', bought), true)
  assert.equal(ownsVcePaper('specialist_maths-year_12-5-exam1', bought), false)
})
test('set number', () => {
  assert.equal(setNumber('general_maths-year_12-5-exam1'), 5)
  assert.equal(setNumber('physics-year_12-2'), null)
})
test('groups exam pairs into sets and leaves single papers alone', () => {
  const ids = ['m-year_12-1-exam1', 'm-year_12-1-exam2', 'm-year_12-2-exam1', 'm-year_12-2-exam2', 'p-year_12-1']
  const grouped = groupIntoSets(ids.map(id => ({ id })))
  assert.equal(grouped.length, 3)
  assert.deepEqual(grouped[0], { set: 1, exams: [{ id: 'm-year_12-1-exam1' }, { id: 'm-year_12-1-exam2' }] })
  assert.deepEqual(grouped[2], { id: 'p-year_12-1' })
})
```

- [ ] **Step 2: Run it.** `node --test scripts/tests/vceSets.test.mjs`. Expected: FAIL (module not found).

- [ ] **Step 3: Implement** `src/lib/auth/vceSets.ts`:

```ts
/**
 * VCE subjects examined in two papers (Mathematical Methods, Specialist and
 * General Mathematics) are practice *sets*: `…-N-exam1` (technology-free or
 * multiple choice) and `…-N-exam2`. One purchase covers both papers of a set.
 * Pure string logic with no imports, so the paywall and the catalogue share it
 * and it can be unit-tested without Next.js.
 */
const PAIR = /^(.*-(\d+))-exam([12])$/

export function vcePartnerId(examId: string): string | null {
  const m = PAIR.exec(examId)
  return m ? `${m[1]}-exam${m[3] === '1' ? '2' : '1'}` : null
}

/** Owned when this paper, or the other exam of its set, was purchased. */
export function ownsVcePaper(examId: string, purchased: Set<string>): boolean {
  if (purchased.has(examId)) return true
  const partner = vcePartnerId(examId)
  return partner !== null && purchased.has(partner)
}

export function setNumber(examId: string): number | null {
  const m = PAIR.exec(examId)
  return m ? Number(m[2]) : null
}

export type SetGroup<T> = { set: number; exams: [T, T] }

/** Exam 1 and Exam 2 of a set become one entry; everything else passes through, in order. */
export function groupIntoSets<T extends { id: string }>(exams: T[]): (T | SetGroup<T>)[] {
  const out: (T | SetGroup<T>)[] = []
  const used = new Set<string>()
  for (const exam of exams) {
    if (used.has(exam.id)) continue
    const partnerId = vcePartnerId(exam.id)
    const partner = partnerId ? exams.find(e => e.id === partnerId) : undefined
    const n = setNumber(exam.id)
    if (partner && n !== null) {
      const pair = (exam.id.endsWith('exam1') ? [exam, partner] : [partner, exam]) as [T, T]
      out.push({ set: n, exams: pair })
      used.add(exam.id)
      used.add(partner.id)
    } else {
      out.push(exam)
    }
  }
  return out
}

export function isSetGroup<T>(item: T | SetGroup<T>): item is SetGroup<T> {
  return typeof item === 'object' && item !== null && 'set' in item && 'exams' in item
}
```

- [ ] **Step 4: Run it.** `node --test scripts/tests/vceSets.test.mjs`. Expected: PASS (5 tests).

- [ ] **Step 5: Use it in the paywall.** In `src/lib/auth/access.ts`, add `import { ownsVcePaper } from './vceSets'` and replace the VCE line in `accessReason`:

```ts
  if (isVceYear(exam.yearLevel)) return ownsVcePaper(exam.id, access.papers) ? 'paper' : null
```

Update the doc comment bullet: "VCE papers open when that paper — or the other exam of its set — was bought;".

- [ ] **Step 6: Update the checkout description.** In `src/app/api/checkout/route.ts`, add `import { vcePartnerId } from '@/lib/auth/vceSets'`, and in the exam branch:

```ts
      const partner = PRACTICE_EXAMS.find(e => e.id === vcePartnerId(exam.id))
      // One purchase covers both exams of a two-paper VCE set.
      const description = partner ? `${exam.title} and ${shortTitleOf(partner.title)}` : exam.title
```

Add the helper at the bottom of the file:

```ts
function shortTitleOf(title: string): string {
  return title.split(' — ').pop() ?? title
}
```

Then pass `payment_intent_data: { description }`.

- [ ] **Step 7: Update the lock copy.** In `src/components/practice/PremiumExamLock.tsx`, where the VCE sentence and label are built, give the component an optional prop `pairedWith?: string` (the partner's short title). When it is set, the sentence reads `Purchase this set for ${VCE_PAPER_PRICE} — this paper and ${pairedWith}, each with its full answer key, yours to keep.` and the button reads `Purchase both exams — ${VCE_PAPER_PRICE}`. In `src/app/practice/exams/[id]/page.tsx`, pass `pairedWith={partner ? shortTitle(partner) : undefined}`, where `partner = PRACTICE_EXAMS.find(e => e.id === vcePartnerId(exam.id))`.

- [ ] **Step 8: Update the account list.** In `src/app/account/page.tsx`, replace `const vcePapers = PRACTICE_EXAMS.filter(e => access.papers.has(e.id))` with `const vcePapers = PRACTICE_EXAMS.filter(e => ownsVcePaper(e.id, access.papers))` and import `ownsVcePaper`.

- [ ] **Step 9: Wire the tests.** In `package.json` scripts add `"test": "node --test scripts/tests/*.test.mjs"`. In `.github/workflows/ci.yml`, after the lint step, add:

```yaml
      - name: Unit tests
        run: npm test
```

- [ ] **Step 10: Verify and commit.** Run `npm test && npm run type-check && npm run lint`, then:

```bash
git add src/lib/auth/vceSets.ts scripts/tests/vceSets.test.mjs src/lib/auth/access.ts src/app/api/checkout/route.ts src/components/practice/PremiumExamLock.tsx "src/app/practice/exams/[id]/page.tsx" src/app/account/page.tsx package.json .github/workflows/ci.yml
git commit -m "feat: one VCE purchase unlocks both exams of a set"
```

### Task 2: Teacher and tutor role

**Files:**
- Create: `src/lib/auth/roles.ts`, `scripts/tests/roles.test.mjs`, `supabase/schema_teacher_role.sql`
- Modify: `src/types/index.ts` (`UserRole`), `src/components/layout/Navbar.tsx`, `src/app/page.tsx`, `src/app/account/page.tsx`, `scripts/check-live-schema.mjs`

**Interfaces:**
- Produces:
  - `isGuardianRole(role: string | null | undefined): boolean` — true for 'parent' and 'teacher';
  - `roleLabel(role: string | null | undefined): string` — 'Student', 'Parent', 'Teacher or tutor' or 'Admin';
  - `dashboardLabel(role): string` — 'Parent dashboard' or 'Teacher dashboard'.

- [ ] **Step 1: Write the failing test** at `scripts/tests/roles.test.mjs`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isGuardianRole, roleLabel, dashboardLabel } from '../../src/lib/auth/roles.ts'

test('parents and teachers are guardians; students and admins are not', () => {
  assert.equal(isGuardianRole('parent'), true)
  assert.equal(isGuardianRole('teacher'), true)
  assert.equal(isGuardianRole('student'), false)
  assert.equal(isGuardianRole('admin'), false)
  assert.equal(isGuardianRole(null), false)
})
test('labels', () => {
  assert.equal(roleLabel('teacher'), 'Teacher or tutor')
  assert.equal(roleLabel('parent'), 'Parent')
  assert.equal(roleLabel(undefined), 'Student')
  assert.equal(dashboardLabel('teacher'), 'Teacher dashboard')
  assert.equal(dashboardLabel('parent'), 'Parent dashboard')
})
```

- [ ] **Step 2: Run it.** `node --test scripts/tests/roles.test.mjs`. Expected: FAIL (module not found).

- [ ] **Step 3: Implement** `src/lib/auth/roles.ts`:

```ts
/**
 * Who an account is for. Parents and teachers (or tutors) both look after
 * students' practice, so they share the dashboard for linking students and
 * seeing their progress; only the wording differs. The one place that rule lives.
 */
export function isGuardianRole(role: string | null | undefined): boolean {
  return role === 'parent' || role === 'teacher'
}

export function roleLabel(role: string | null | undefined): string {
  if (role === 'teacher') return 'Teacher or tutor'
  if (role === 'parent') return 'Parent'
  if (role === 'admin') return 'Admin'
  return 'Student'
}

export function dashboardLabel(role: string | null | undefined): string {
  return role === 'teacher' ? 'Teacher dashboard' : 'Parent dashboard'
}
```

- [ ] **Step 4: Run it.** `node --test scripts/tests/roles.test.mjs`. Expected: PASS.

- [ ] **Step 5: Type and migration.**
  - In `src/types/index.ts`, set `export type UserRole = 'student' | 'parent' | 'teacher' | 'admin'`.
  - Create `supabase/schema_teacher_role.sql`:

```sql
-- Teacher and tutor accounts (2026-09-24).
--
-- Sign-up sends role 'teacher' in the auth metadata, and the profiles trigger
-- casts it to user_role, so a teacher sign-up FAILS until this has run. Apply it
-- in the Supabase SQL editor before deploying the sign-up change. Safe to re-run.
alter type user_role add value if not exists 'teacher';
```

  - In `scripts/check-live-schema.mjs`, add an entry after `schema_physics_unit34.sql`, following the pattern of the existing enum checks: `{ file: 'schema_teacher_role.sql', check: () => enumValueExists('profiles', 'role', 'teacher') }`. Check how `enumValueExists` probes (a filtered select on the column), and use the same call shape.

- [ ] **Step 6: Switch the branches to `isGuardianRole`.**
  - **`Navbar.tsx`:** widen the `role` type to `UserRole`, and replace `user?.role === 'parent'` with `isGuardianRole(user?.role)`, using the label `dashboardLabel(user?.role)`.
  - **`src/app/page.tsx`:**
    - type `role` as `UserRole | null`;
    - replace both `role === 'parent'` checks with `isGuardianRole(role)`;
    - the message becomes `'Check in on your students’ progress.'` for teachers (`role === 'teacher'`) and keeps the child wording for parents;
    - the button text becomes `Go to ${dashboardLabel(role).toLowerCase()}`.
  - **`src/app/account/page.tsx`:**
    - type `role` as `UserRole`;
    - `roleLabel` becomes the imported function;
    - the shortcut uses `isGuardianRole(role)`, with the text `${dashboardLabel(role)} — see progress`.

- [ ] **Step 7: Verify and commit.** Run `npm test && npm run type-check && npm run lint`, then:

```bash
git add src/lib/auth/roles.ts scripts/tests/roles.test.mjs supabase/schema_teacher_role.sql src/types/index.ts src/components/layout/Navbar.tsx src/app/page.tsx src/app/account/page.tsx scripts/check-live-schema.mjs
git commit -m "feat: teacher and tutor accounts share the parent dashboard"
```

### Task 3: Year levels module (client-safe)

**Files:**
- Create: `src/lib/yearLevels.ts`, `scripts/tests/yearLevels.test.mjs`
- Modify: `src/lib/catalogue.ts` (import `yearLabel` from here instead of its own `LONG_LABEL`)

**Interfaces:**
- Produces:
  - `YEAR_STAGES: { id: 'primary' | 'secondary' | 'vce'; label: string; note: string; years: YearLevel[] }[]`
  - `yearLabel(y: YearLevel): string`
  - `yearTag(y: YearLevel): string | null` — 'NAPLAN', 'Units 1 & 2', 'Units 3 & 4' or null
  - `stageTag(y: YearLevel): string` — 'NAPLAN year', 'VCE Units 1 & 2', 'VCE Units 3 & 4' or ''

- [ ] **Step 1: Write the failing test** at `scripts/tests/yearLevels.test.mjs`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { YEAR_STAGES, yearLabel, yearTag, stageTag } from '../../src/lib/yearLevels.ts'

test('stages cover Grade 3 to Year 12 once each, in order', () => {
  const all = YEAR_STAGES.flatMap(s => s.years)
  assert.deepEqual(all, ['grade_3', 'grade_4', 'grade_5', 'grade_6', 'year_7', 'year_8', 'year_9', 'year_10', 'year_11', 'year_12'])
})
test('labels and tags', () => {
  assert.equal(yearLabel('grade_3'), 'Grade 3')
  assert.equal(yearLabel('year_12'), 'Year 12')
  assert.equal(yearTag('grade_5'), 'NAPLAN')
  assert.equal(yearTag('grade_4'), null)
  assert.equal(yearTag('year_12'), 'Units 3 & 4')
  assert.equal(stageTag('year_9'), 'NAPLAN year')
  assert.equal(stageTag('year_11'), 'VCE Units 1 & 2')
  assert.equal(stageTag('year_8'), '')
})
```

- [ ] **Step 2: Run it.** `node --test scripts/tests/yearLevels.test.mjs`. Expected: FAIL.

- [ ] **Step 3: Implement** `src/lib/yearLevels.ts`. It has type-only imports, so it is safe in client components and under `node --test`:

```ts
import type { YearLevel } from '../types'

/**
 * Year levels as people talk about them — "Grade 3", "Year 12" — grouped by
 * school stage for the year picker. Client-safe: no paper data here (paper
 * counts come from the server-only catalogue).
 */
const LONG: Record<YearLevel, string> = {
  grade_3: 'Grade 3', grade_4: 'Grade 4', grade_5: 'Grade 5', grade_6: 'Grade 6',
  year_7: 'Year 7', year_8: 'Year 8', year_9: 'Year 9', year_10: 'Year 10',
  year_11: 'Year 11', year_12: 'Year 12',
}

const NAPLAN = new Set<YearLevel>(['grade_3', 'grade_5', 'year_7', 'year_9'])

export const YEAR_STAGES = [
  { id: 'primary', label: 'Primary', note: 'NAPLAN in Grades 3 and 5', years: ['grade_3', 'grade_4', 'grade_5', 'grade_6'] },
  { id: 'secondary', label: 'Secondary', note: 'NAPLAN in Years 7 and 9', years: ['year_7', 'year_8', 'year_9', 'year_10'] },
  { id: 'vce', label: 'VCE', note: 'Units 1 & 2 and 3 & 4', years: ['year_11', 'year_12'] },
] as const satisfies readonly { id: string; label: string; note: string; years: readonly YearLevel[] }[]

export function yearLabel(y: YearLevel): string {
  return LONG[y]
}

export function yearTag(y: YearLevel): string | null {
  if (NAPLAN.has(y)) return 'NAPLAN'
  if (y === 'year_11') return 'Units 1 & 2'
  if (y === 'year_12') return 'Units 3 & 4'
  return null
}

export function stageTag(y: YearLevel): string {
  if (NAPLAN.has(y)) return 'NAPLAN year'
  if (y === 'year_11') return 'VCE Units 1 & 2'
  if (y === 'year_12') return 'VCE Units 3 & 4'
  return ''
}
```

If the `../types` import fails under Node's runner (a type-only import is erased, so it should not), use `import type { YearLevel } from '../types/index.ts'`.

- [ ] **Step 4: Run it.** `node --test scripts/tests/yearLevels.test.mjs`. Expected: PASS.

- [ ] **Step 5: Deduplicate `catalogue.ts`.** Delete its `LONG_LABEL` constant and its `yearLabel` function. Import them instead with `import { yearLabel } from '@/lib/yearLevels'` and re-export them with `export { yearLabel }`, so existing importers keep working. Use `label: yearLabel(g.value)` in `YEAR_LEVEL_STATS`, and keep `isYearLevel` using `value in` over a local set of `GRADES` values.

- [ ] **Step 6: Verify and commit.** Run `npm test && npm run type-check && npm run lint`, then `git add src/lib/yearLevels.ts scripts/tests/yearLevels.test.mjs src/lib/catalogue.ts` and `git commit -m "refactor: client-safe year levels with stages and tags"`.

### Task 4: Catalogue components and page

**Files:**
- Create: `src/components/catalogue/YearPicker.tsx`, `src/components/catalogue/PaperTile.tsx`, `src/components/catalogue/YearSection.tsx`
- Modify: `src/app/practice/exams/page.tsx` (use them; remove `YearChips` and the inline `YearSection`)

**Interfaces:**
- Consumes: `YEAR_STAGES`, `yearTag`, `stageTag` (Task 3); `groupIntoSets`, `isSetGroup` (Task 1).
- Produces:
  - `YearPicker({ items, selected, hrefFor?, onSelect?, compact? })`, where `items: { yearLevel: YearLevel; sub?: string; done?: boolean }[]`. Link mode when `hrefFor` is given, button mode when `onSelect` is given.
  - `PaperTile({ href, number, state, subject, ariaTitle })`, where `state: 'free' | 'unlocked' | 'locked' | { price: string }`.
  - `SetTile({ set, papers: [{ href, label: 'Ex 1' | 'Ex 2', state }, …], price? })`.

- [ ] **Step 1: `YearPicker.tsx`.** It is a server-compatible presentational component, with no `'use client'`. Button mode (`onSelect`) is only used from client components, which import it as-is.

```tsx
import Link from 'next/link'
import type { Route } from 'next'
import { YEAR_STAGES, yearLabel, yearTag } from '@/lib/yearLevels'
import type { YearLevel } from '@/types'

export interface YearPickerItem {
  yearLevel: YearLevel
  /** Second line, e.g. "8 papers". Falls back to the NAPLAN or VCE tag. */
  sub?: string
  /** The visitor already owns every paper at this level. */
  done?: boolean
}

/**
 * The year levels as grouped tiles — Primary, Secondary, VCE — each naming the
 * level in full and what it holds. Link mode for browsing (catalogue,
 * homepage); button mode for choosing (sign-up). One horizontal row on phones.
 */
export default function YearPicker({
  items,
  selected,
  hrefFor,
  onSelect,
  compact = false,
}: {
  items: YearPickerItem[]
  selected?: YearLevel | null
  hrefFor?: (y: YearLevel) => string
  onSelect?: (y: YearLevel) => void
  compact?: boolean
}) {
  const byYear = new Map(items.map(i => [i.yearLevel, i]))
  return (
    <div className="flex gap-5 sm:flex-col sm:gap-4 w-max sm:w-auto">
      {YEAR_STAGES.map(stage => {
        const tiles = stage.years.filter(y => byYear.has(y))
        if (tiles.length === 0) return null
        return (
          <div key={stage.id} className="shrink-0">
            <p className="text-xs text-gray-500 mb-2">
              <span className="font-medium text-gray-700">{stage.label}</span>
              {!compact && <span className="hidden sm:inline"> · {stage.note}</span>}
            </p>
            <div className="flex sm:grid sm:grid-cols-4 gap-2">
              {tiles.map(y => {
                const item = byYear.get(y)!
                const active = selected === y
                const cls = `group block text-left rounded-xl border px-3 py-2.5 min-w-[7.5rem] transition-colors ${
                  active
                    ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                    : 'border-gray-200 bg-white hover:border-brand-200 hover:bg-brand-50/40'
                }`
                const body = (
                  <>
                    <span className={`block text-sm font-medium ${active ? 'text-brand-800' : 'text-gray-900'}`}>
                      {yearLabel(y)}
                      {item.done && <span className="text-teal-600" aria-label="unlocked"> ✓</span>}
                    </span>
                    <span className={`block text-xs mt-0.5 ${active ? 'text-brand-600' : 'text-gray-500'}`}>
                      {item.sub ?? yearTag(y) ?? ' '}
                    </span>
                  </>
                )
                return hrefFor ? (
                  <Link key={y} href={hrefFor(y) as Route} className={cls} aria-current={active ? 'page' : undefined}>
                    {body}
                  </Link>
                ) : (
                  <button key={y} type="button" onClick={() => onSelect?.(y)} className={cls} aria-pressed={active}>
                    {body}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: `PaperTile.tsx`.** It exports `PaperTile` and `SetTile`, both portrait "printed page" tiles.

```tsx
import Link from 'next/link'
import type { Route } from 'next'
import { Check, Lock } from 'lucide-react'

export type TileState = 'free' | 'unlocked' | 'locked' | { price: string }

function stateLabel(state: TileState): string {
  return state === 'free' ? 'free' : state === 'unlocked' ? 'unlocked' : state === 'locked' ? 'locked' : `${state.price}`
}

function Page({ label, state }: { label: string; state: TileState }) {
  const free = state === 'free'
  return (
    <span
      className={`relative flex flex-col items-center justify-center gap-1 w-12 h-16 rounded-md border bg-white text-xs
        shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-transform group-hover:-translate-y-0.5 ${
          free ? 'border-teal-400' : 'border-gray-200 group-hover:border-brand-200'
        }`}
    >
      {/* folded corner */}
      <span aria-hidden className="absolute top-0 right-0 w-2.5 h-2.5 border-l border-b border-gray-200 bg-gray-50 rounded-bl-sm" />
      <span className="font-medium text-gray-900">{label}</span>
      {state === 'free' ? (
        <span className="text-[11px] font-medium text-teal-600">Free</span>
      ) : state === 'unlocked' ? (
        <Check className="w-3.5 h-3.5 text-teal-600" aria-hidden />
      ) : state === 'locked' ? (
        <Lock className="w-3.5 h-3.5 text-gray-400" aria-hidden />
      ) : (
        <Lock className="w-3.5 h-3.5 text-gray-400" aria-hidden />
      )}
    </span>
  )
}

export function PaperTile({ href, number, state, ariaTitle }: { href: string; number: number | string; state: TileState; ariaTitle: string }) {
  return (
    <Link href={href as Route} className="group" aria-label={`${ariaTitle}, ${stateLabel(state)}`}>
      <Page label={String(number)} state={state} />
    </Link>
  )
}

/** Exam 1 and Exam 2 of a VCE set: two joined pages, one purchase. */
export function SetTile({
  set,
  papers,
  price,
}: {
  set: number
  papers: { href: string; label: string; state: TileState; ariaTitle: string }[]
  price?: string
}) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex gap-1">
        {papers.map(p => (
          <Link key={p.href} href={p.href as Route} className="group" aria-label={`${p.ariaTitle}, ${stateLabel(p.state)}`}>
            <Page label={p.label} state={p.state} />
          </Link>
        ))}
      </div>
      <span className="text-xs text-gray-500">
        Set {set}
        {price && <span className="text-gray-700"> · {price} both</span>}
      </span>
    </div>
  )
}
```

- [ ] **Step 3: `YearSection.tsx`.** Move the page's `YearSection` here and give it the new look:
  - **Header:**
    - `stageTag` in `text-xs font-medium text-brand-600`;
    - the name in `text-xl font-semibold`;
    - a line such as "8 printable papers across 3 subjects";
    - pills: `bg-teal-50 text-teal-600` "N free", and `bg-brand-50 text-brand-800` for "N with a plan" (non-VCE) or "N practice sets" (VCE, counted with `groupIntoSets`).
  - **Right-hand side:** the existing owned, VCE, plan or "plans open soon" block, unchanged.
  - **Subject cards:** a `card` (not `p-5`, use `p-4`) with the icon and name. Below it, `groupIntoSets(exams)` feeds a `flex flex-wrap gap-2.5`: `SetTile` for a set group, otherwise `PaperTile`, numbered by the exam's position in its subject list.
  - **Tile state:**
    - `!exam.premium` → 'free';
    - `unlocked(exam)` → 'unlocked';
    - VCE → `{ price: VCE_PAPER_PRICE }`;
    - otherwise 'locked'.
    - A `SetTile`'s `price` is `VCE_PAPER_PRICE` only when some paper in the set is locked.
  - **Reading:** a subject whose exams have `magazine_id` shows "+ colour magazine" under its tiles.
  - **Props:** `{ stats, owned, plansOpen, unlocked, focused }`, as before.

- [ ] **Step 4: Page.** In `src/app/practice/exams/page.tsx`:
  - delete `YearChips` and the inline `YearSection`;
  - render `<ScrollActiveIntoView label="Year level" className="-mx-4 px-4 mb-10 overflow-x-auto sm:overflow-visible">` around `<YearPicker items={YEAR_LEVEL_STATS.map(s => ({ yearLevel: s.yearLevel, sub: `${s.papers} papers`, done: owned.has(s.yearLevel) }))} selected={selected} hrefFor={y => `/practice/exams?year=${y}`} />`;
  - add an "All years" link above the picker, visible only when `selected`: `← All years`.

- [ ] **Step 5: Verify and commit.**
  - Run `npm run type-check && npm run lint`.
  - Start the dev server on the worktree, then screenshot `/practice/exams`, `?year=grade_3` and `?year=year_12` at 1280 px and 390 px.
  - Check that the tiles link correctly, the VCE sets pair up, and physics shows single tiles.
  - Commit with `git add src/components/catalogue src/app/practice/exams/page.tsx` and `git commit -m "feat: catalogue shows papers as tiles, with a grouped year picker"`.

### Task 5: Homepage "library at a glance"

**Files:**
- Modify: `src/components/home/MarketingHome.tsx` (the "Stat banner" section)

- [ ] **Step 1:** Replace the `{/* Stat banner */}` section with:

```tsx
      {/* The library at a glance: the totals, then every year level with what it holds. */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-3xl font-semibold tracking-tight text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="-mx-6 px-6 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible border-t border-gray-100 pt-6">
            <YearPicker
              items={YEAR_LEVEL_STATS.map(s => ({ yearLevel: s.yearLevel, sub: `${s.papers} papers · ${s.free} free` }))}
              hrefFor={y => `/practice/exams?year=${y}`}
            />
          </div>
        </div>
      </section>
```

Here `stats` is the existing four-item array, hoisted to a `const stats = [...]` before `return`. Import `YearPicker` and `YEAR_LEVEL_STATS`.

- [ ] **Step 2: Verify and commit.** Run type-check and lint, then screenshot `/` signed out at both widths. Commit with `git commit -am "feat: homepage shows the library by year level"`.

### Task 6: Sign-up redesign

**Files:**
- Modify: `src/app/auth/register/page.tsx`

- [ ] **Step 1:** Keep all the state, `handleRegister` and the `next` logic. Change these:
  - `role` state type: `Exclude<UserRole, 'admin'>`, which now includes 'teacher'.
  - The metadata stays `{ full_name, role, ...(role === 'student' ? { year_level } : {}) }`.
  - The layout, replacing everything inside `<main>`:

```tsx
    <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-10 sm:py-16 bg-gradient-to-b from-brand-50/60 to-white">
      <div className="w-full max-w-xl rounded-2xl border border-gray-100 bg-white shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Create your free account</h1>
        <p className="text-gray-500 mb-6">Download the free sample papers straight away. No card needed.</p>

        <p className="text-sm font-medium text-gray-900 mb-2">Who is this account for?</p>
        <div className="grid grid-cols-3 gap-2 mb-6" role="radiogroup" aria-label="Account type">
          {ACCOUNT_TYPES.map(t => {
            const active = role === t.role
            return (
              <button
                key={t.role}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setRole(t.role)}
                className={`text-left rounded-xl border px-3 py-3 transition-colors ${
                  active ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-gray-200 hover:border-brand-200'
                }`}
              >
                <t.icon className={`w-5 h-5 mb-1.5 ${active ? 'text-brand-600' : 'text-gray-400'}`} aria-hidden />
                <span className={`block text-sm font-medium ${active ? 'text-brand-800' : 'text-gray-900'}`}>{t.label}</span>
                <span className="block text-xs text-gray-500">{t.sub}</span>
              </button>
            )
          })}
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {role === 'student' && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Your year level</p>
              <div className="-mx-6 px-6 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible">
                <YearPicker items={GRADES.map(g => ({ yearLevel: g.value }))} selected={yearLevel || null} onSelect={setYearLevel} compact />
              </div>
            </div>
          )}
          <input className="input" type="text" placeholder="Full name" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} required />
          <input className="input" type="email" placeholder="Email address" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password (at least 6 characters)" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-teal-600 text-sm">{message}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        {/* existing "Already have an account? Sign in" paragraph, unchanged */}
      </div>
    </main>
```

  - Above the component:

```tsx
import { GraduationCap, Users, Presentation } from 'lucide-react'
import YearPicker from '@/components/catalogue/YearPicker'

const ACCOUNT_TYPES = [
  { role: 'student', label: 'Student', sub: 'I’m studying', icon: GraduationCap },
  { role: 'parent', label: 'Parent', sub: 'For my children', icon: Users },
  { role: 'teacher', label: 'Teacher or tutor', sub: 'For my students', icon: Presentation },
] as const
```

  - `YearPicker` in button mode is used from this client component. It has no server-only imports (it uses `yearLevels.ts`), so it works as a client component when imported here.

- [ ] **Step 2: Verify and commit.**
  - Run type-check and lint.
  - Screenshot `/auth/register` at both widths for each role.
  - With the browser, click Teacher, then Student and Year 8, and confirm the form state without submitting: read the `aria-checked` and `aria-pressed` attributes.
  - Commit with `git commit -am "feat: redesigned sign-up with teacher and tutor accounts and year tiles"`.

### Task 7: Finish

- [ ] **Step 1:** Add a `src/lib/releases.ts` entry only if papers changed. They did not, so skip it.
- [ ] **Step 2:** Run the full check: `npm test && npm run type-check && npm run lint && npm run verify-bank && npm run build`. Stop the dev server first, because a build corrupts a running dev server's cache.
- [ ] **Step 3:** Push `feat/premium-catalogue` and open the PR. The body lists the migration that must run before merge, and the screenshots go to the owner.
- [ ] **Step 4:** Do not merge until `node scripts/check-live-schema.mjs` shows `schema_teacher_role.sql` applied.
