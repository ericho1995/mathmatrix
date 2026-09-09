# NAPLAN-style Question Format & Gr3-9 Content Rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give PrepNest's Maths + English Gr3-9 content and practice exams the real structural features of a NAPLAN test (shared reading passages driving clustered questions, a Yr7-9 calculator/non-calculator Numeracy split, sectioned exam papers) and rewrite the content itself to match real NAPLAN item style, replacing the current bare single-step drills.

**Architecture:** Add an optional `Stimulus` entity (shared passage/data, static TS file mirrored to Supabase like `bank.ts` already is) and an optional `stimulus_id`/`calculator_allowed` field on `Question`. Change `PracticeExam` from a flat question-id list to named, timed `sections`; subjects not covered by this plan get a single auto-synthesized section so nothing else breaks. `QuizRunner` and the exam-detail page learn to render a stimulus card and a section banner when present, and render exactly as today when absent. Content is then rewritten/expanded topic-by-topic against a shared quality bar drawn from the 2026-09-09 audit.

**Tech Stack:** Next.js 14 App Router, TypeScript, static content files compiled by two Node ESM scripts (`gen-seed.mjs`, `gen-exams.mjs`), Supabase Postgres (schema mirror only — practice-time reads are from the TS files).

**Spec:** `docs/superpowers/specs/2026-09-09-naplan-question-format-design.md`

## Global Constraints

- No test framework exists in this repo (no jest/vitest). "Write the failing test" steps below use a throwaway `node -e` assertion snippet instead of a test file — write it, run it to see it fail, implement, re-run to see it pass. This matches the project's existing convention of inline invariant checks (e.g. `buildExams`'s own `throw` in `gen-exams.mjs`).
- After every task: `npx tsc --noEmit` must be clean, and (once bank.ts/stimuli.ts changed) `node scripts/gen-seed.mjs && node scripts/gen-exams.mjs` must both run without error.
- New question objects added to `bank.ts` must NOT include an `id:` field — `gen-seed.mjs`'s regex (`/\{\n(\s+)(?!id:)topic:/g`) auto-assigns a UUID to any object starting with `topic:` and rewrites the file in place. Same pattern applies to new `Stimulus` objects in `stimuli.ts` once Task 3 extends the regex to also match `type:`-first objects (a `Stimulus` has no `topic` field).
- Per `[[feedback-prepnest-generated-content-qa]]`: every content task's verification step must tabulate the new/edited questions' `correct_index` distribution (a `node -e` one-liner) and confirm it isn't degenerate (not all-same-value) before committing.
- Every content task must produce items matching the **Content Quality Bar** below — don't restate it per task, but every rewritten/new question must satisfy it.
- Do not touch Science, Chemistry, Physics, Maths Methods, General Mathematics, or Specialist Mathematics content in this plan — out of scope (see spec's Non-goals and Rollout order).

### Content Quality Bar (applies to every content task)

1. **Contextualized:** wrapped in a short, plausible real-world scenario appropriate to the topic (shopping, measuring, scheduling, sport, recipes, school life) — never a bare "Calculate: ..." / "Solve: ..." / "What is X?" with no scenario, unless the real NAPLAN style for that specific skill is genuinely bare (rare — e.g. a pure spelling item).
2. **Right-sized multi-step for year level:** Grade 3-4 items are 1 step; Grade 5-6 items are often 2 steps; Year 7-9 items increasingly chain 2-3 steps or require selecting the right operation/strategy, not just executing a named one.
3. **No cross-grade templating:** don't reuse the same scenario/skill across two grades with only the numbers changed (the audit's #1 finding). Each grade's items should read as written for that grade.
4. **Distractors model specific misconceptions**, not just "correct value ± a round number" — e.g. a sign error, an off-by-one place-value error, applying the wrong operation, a common regrouping mistake, confusing perimeter with area, etc. Say in the explanation why the *correct* answer is right; distractors don't need their own explanation.
5. **No positional bias:** across any batch you write, `correct_index` must land roughly evenly across all option positions — shuffle, don't always put the right answer in a fixed slot (this exact bug was just fixed bank-wide, see `[[feedback-prepnest-generated-content-qa]]`).
6. **`curriculum_code`** set to a real AC9 code for that content (follow the existing pattern in the file for the same strand/grade, e.g. `AC9M6N04`, `AC9E7LA10`).

---

## File Structure

- Modify: `src/types/index.ts` — add `StimulusType`, `Stimulus`, and `stimulus_id?` / `calculator_allowed?` on `QuestionBase`.
- Create: `src/lib/questions/stimuli.ts` — static `STIMULI: Stimulus[]` array (same pattern as `bank.ts`).
- Modify: `src/lib/questions/bank.ts` — content rewrite/expansion (Tasks 7-14).
- Modify: `scripts/gen-seed.mjs` — parse `stimuli.ts`, emit `stimuli` table upsert, add `stimulus_id`/`calculator_allowed` columns to the `questions` upsert.
- Modify: `scripts/gen-exams.mjs` — `PracticeExamSection`/sectioned `PracticeExam`, NAPLAN-aware composer for `math`/`english` Gr3-9, legacy single-section synthesis for everything else.
- Create: `supabase/schema_stimuli.sql` — new migration (guarded/idempotent, matching `schema_topics_and_longform.sql`'s pattern).
- Modify: `src/components/practice/QuizRunner.tsx` — render a stimulus card and a section banner when present on a `QuizQuestion`.
- Modify: `src/app/practice/exams/[id]/page.tsx` — flatten `exam.sections` into the ordered `QuizQuestion[]` QuizRunner expects, attaching each question's stimulus/section info.

---

### Task 1: Add `Stimulus` type, `stimulus_id`/`calculator_allowed` fields, empty `stimuli.ts`

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/lib/questions/stimuli.ts`

**Interfaces:**
- Produces: `StimulusType = 'passage' | 'data_table' | 'image'`; `Stimulus { id, type, title, body, subject: SubjectSlug, year_level: YearLevel, word_count?: number }`; `QuestionBase.stimulus_id?: string`; `QuestionBase.calculator_allowed?: boolean`; `STIMULI: Stimulus[]` exported from `src/lib/questions/stimuli.ts`.

- [ ] **Step 1: Write the failing check**

```bash
node -e "
const ts = require('fs').readFileSync('src/types/index.ts', 'utf8');
if (!/stimulus_id\?:\s*string/.test(ts)) { console.log('FAIL: stimulus_id missing'); process.exit(1); }
console.log('unexpected pass');
"
```
Expected: prints `FAIL: stimulus_id missing` and exits 1 (field doesn't exist yet).

- [ ] **Step 2: Add the type changes**

In `src/types/index.ts`, right after the `Difficulty` type (before `// ─── Questions ───`), add:

```ts
export type StimulusType = 'passage' | 'data_table' | 'image'

export interface Stimulus {
  id: string
  type: StimulusType
  title: string
  body: string            // markdown/plain text for 'passage'; JSON-stringified rows for 'data_table'; image URL for 'image'
  subject: SubjectSlug
  year_level: YearLevel
  word_count?: number      // 'passage' only, informational
}
```

In `QuestionBase`, add two fields after `curriculum_code?: string`:

```ts
  stimulus_id?: string          // FK into Stimulus — questions sharing an id are asked about the same passage/data
  calculator_allowed?: boolean  // Maths Yr7-9 Numeracy only; true = calculator section, unset/false = non-calculator
```

- [ ] **Step 3: Create the empty stimuli file**

```ts
// src/lib/questions/stimuli.ts
import type { Stimulus } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Shared reading passages / data stimuli — a Question can reference one via
// stimulus_id so multiple questions are asked about the same text/data.
// Mirrored into Supabase via supabase/seed.sql, same as bank.ts. Regenerate
// seed.sql after editing with: node scripts/gen-seed.mjs
// ─────────────────────────────────────────────────────────────────────────────

export const STIMULI: Stimulus[] = [
]
```

- [ ] **Step 4: Run the check again to verify it passes**

```bash
node -e "
const ts = require('fs').readFileSync('src/types/index.ts', 'utf8');
if (!/stimulus_id\?:\s*string/.test(ts)) { console.log('FAIL'); process.exit(1); }
if (!/calculator_allowed\?:\s*boolean/.test(ts)) { console.log('FAIL 2'); process.exit(1); }
console.log('PASS');
"
npx tsc --noEmit
```
Expected: `PASS`, then a clean type-check.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/lib/questions/stimuli.ts
git commit -m "feat: add Stimulus type and stimulus_id/calculator_allowed on Question"
```

---

### Task 2: `schema_stimuli.sql` migration

**Files:**
- Create: `supabase/schema_stimuli.sql`

**Interfaces:**
- Consumes: nothing (standalone migration file, not run by this session — no service-role key available, per `[[reference-prepnest-supabase]]`).
- Produces: `stimuli` table; `questions.stimulus_id`, `questions.calculator_allowed` columns — required by Task 3's seed generator output.

- [ ] **Step 1: Write the migration**

```sql
-- supabase/schema_stimuli.sql
--
-- Adds the `stimuli` table (shared reading passages / data referenced by
-- multiple questions) and two new nullable columns on `questions`:
-- stimulus_id (FK into stimuli) and calculator_allowed (Maths Yr7-9
-- Numeracy only). Idempotent — safe to re-run. Must run before the next
-- `supabase/seed.sql` load, since the regenerated seed.sql references
-- these columns.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists stimuli (
  id          uuid primary key,
  type        text not null check (type in ('passage', 'data_table', 'image')),
  title       text not null,
  body        text not null,
  subject     subject_slug not null,
  year_level  year_level not null,
  word_count  integer,
  created_at  timestamptz not null default now()
);

alter table questions add column if not exists stimulus_id uuid references stimuli(id);
alter table questions add column if not exists calculator_allowed boolean;
```

- [ ] **Step 2: Verify syntax matches the existing migration pattern**

```bash
grep -n "create table if not exists\|add column if not exists" supabase/schema_stimuli.sql
```
Expected: 3 lines back (1 table guard, 2 column guards) — confirms it follows the same idempotent style as `schema_topics_and_longform.sql`.

- [ ] **Step 3: Commit**

```bash
git add supabase/schema_stimuli.sql
git commit -m "feat: add stimuli table + questions.stimulus_id/calculator_allowed migration"
```

(No live-DB run here — flag to the user at the end of this plan that this file, like `schema_general_maths_rename.sql`, still needs to be run in the Supabase SQL editor before the next seed load.)

---

### Task 3: `gen-seed.mjs` — emit stimuli + new columns

**Files:**
- Modify: `scripts/gen-seed.mjs`

**Interfaces:**
- Consumes: `STIMULI` from `src/lib/questions/stimuli.ts` (Task 1); `Question.stimulus_id`/`calculator_allowed` (Task 1).
- Produces: `supabase/seed.sql` now contains a `stimuli` upsert block before the `questions` upsert, and the `questions` upsert includes `stimulus_id`/`calculator_allowed` columns.

- [ ] **Step 1: Write the failing check**

```bash
node scripts/gen-seed.mjs
grep -c "insert into stimuli" supabase/seed.sql
```
Expected: `0` (no stimuli insert exists yet).

- [ ] **Step 2: Extend the id-assignment regex to cover Stimulus objects**

In `scripts/gen-seed.mjs`, the existing id-assignment block only matches objects starting with `topic:`. Stimulus objects start with `type:` instead. Change the block (originally just for `bankPath`) to also process `stimuliPath`:

```js
const stimuliPath = join(repoRoot, 'src/lib/questions/stimuli.ts')

let stimuliSrc = readFileSync(stimuliPath, 'utf8')
let stimuliAdded = 0
stimuliSrc = stimuliSrc.replace(/\{\n(\s+)(?!id:)type:/g, (m, indent) => {
  stimuliAdded++
  return `{\n${indent}id: '${randomUUID()}',\n${indent}type:`
})
if (stimuliAdded > 0) {
  writeFileSync(stimuliPath, stimuliSrc)
  console.log(`Assigned ids to ${stimuliAdded} new stimulus/stimuli in stimuli.ts.`)
}
```

Add this right after the existing `bank.ts` id-assignment block (before the `jsSrc` parsing step).

- [ ] **Step 3: Parse `stimuli.ts` the same way `bank.ts` is parsed**

Right after `const { QUESTION_BANK } = await import(...)` / `unlinkSync(tmpPath)`, add:

```js
const stimuliJsSrc = stimuliSrc
  .replace(/^import type .+\n/m, '')
  .replace(/export const STIMULI:[^=]+=\s*\[/, 'export const STIMULI = [')
const stimuliTmpPath = join(repoRoot, '.stimuli-tmp.mjs')
writeFileSync(stimuliTmpPath, stimuliJsSrc)
const { STIMULI } = await import('file://' + stimuliTmpPath)
unlinkSync(stimuliTmpPath)
console.log(`Parsed ${STIMULI.length} stimuli.`)
```

- [ ] **Step 4: Emit the `stimuli` insert block and extend the `questions` insert**

Add before the `questions` insert is built:

```js
const stimuliSqlLines = STIMULI.map(s => {
  const wordCount = s.word_count ?? 'null'
  return `(${sqlQuote(s.id)}, ${sqlQuote(s.type)}, ${sqlQuote(s.title)}, ${sqlQuote(s.body)}, ${sqlQuote(s.subject)}, ${sqlQuote(s.year_level)}, ${wordCount})`
})
const stimuliSql = stimuliSqlLines.length ? `insert into stimuli (id, type, title, body, subject, year_level, word_count)
values
${stimuliSqlLines.join(',\n')}
on conflict (id) do update set
  type = excluded.type,
  title = excluded.title,
  body = excluded.body,
  subject = excluded.subject,
  year_level = excluded.year_level,
  word_count = excluded.word_count;

` : ''
```

Update the `questions` `sqlLines` map to add the two new columns:

```js
const sqlLines = QUESTION_BANK.map(q => {
  const format = q.format ?? 'multiple_choice'
  const options = q.options ? `'${JSON.stringify(q.options).replace(/'/g, "''")}'::jsonb` : 'null'
  const correctIndex = q.correct_index ?? 'null'
  const curriculumCode = q.curriculum_code ? sqlQuote(q.curriculum_code) : 'null'
  const stimulusId = q.stimulus_id ? sqlQuote(q.stimulus_id) : 'null'
  const calculatorAllowed = q.calculator_allowed === undefined ? 'null' : q.calculator_allowed
  return `(${sqlQuote(q.id)}, ${sqlQuote(q.topic)}, ${sqlQuote(q.year_level)}, ${sqlQuote(q.difficulty)}, ${sqlQuote(format)}, ${sqlQuote(q.question_text)}, ${options}, ${correctIndex}, ${sqlQuote(q.explanation)}, ${curriculumCode}, ${stimulusId}, ${calculatorAllowed}, true)`
})
```

And update the `insert into questions (...)` column list + `on conflict` clause to include `stimulus_id, calculator_allowed` (in the same position as the tuple above, right before `is_published`), plus their `excluded.*` assignments. Prepend `stimuliSql` to the final `sql` template literal, before the `insert into questions` line.

- [ ] **Step 5: Add one throwaway stimulus, run, verify, then remove it**

Temporarily add to `stimuli.ts`:
```ts
{ type: 'passage', title: 'Test', body: 'Test body.', subject: 'english', year_level: 'grade_3' },
```
Run:
```bash
node scripts/gen-seed.mjs
grep -c "insert into stimuli" supabase/seed.sql
```
Expected: `1`. Then remove the temporary entry from `stimuli.ts` and re-run `node scripts/gen-seed.mjs` to confirm `supabase/seed.sql` goes back to having 0 stimuli rows and the questions block is otherwise unchanged (`git diff supabase/seed.sql` should show only the stimuli block disappearing, no unrelated question rows touched).

- [ ] **Step 6: Full regen + type-check**

```bash
node scripts/gen-seed.mjs && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add scripts/gen-seed.mjs supabase/seed.sql src/lib/questions/stimuli.ts
git commit -m "feat: gen-seed.mjs emits stimuli table + stimulus_id/calculator_allowed columns"
```

---

### Task 4: `gen-exams.mjs` — sectioned `PracticeExam` + NAPLAN composer

**Files:**
- Modify: `scripts/gen-exams.mjs`

**Interfaces:**
- Consumes: `Question.stimulus_id`/`calculator_allowed` (Task 1).
- Produces: `PracticeExamSection { title: string; time_minutes: number; calculator_allowed?: boolean; question_ids: string[] }`; `PracticeExam.sections: PracticeExamSection[]` (replacing `questionIds`) written into `src/lib/questions/exams.ts` — consumed by Task 6.

- [ ] **Step 1: Write the failing check**

```bash
node scripts/gen-exams.mjs
grep -c "sections:" src/lib/questions/exams.ts
```
Expected: `0` (still flat `questionIds` today).

- [ ] **Step 2: Change the emitted `PracticeExam` shape + legacy composer**

Replace the `PracticeExam` interface in the `ts` template literal:

```ts
export interface PracticeExamSection {
  title: string
  time_minutes: number
  calculator_allowed?: boolean
  question_ids: string[]
}

export interface PracticeExam {
  id: string
  subject: SubjectSlug
  yearLevel: YearLevel
  title: string
  sections: PracticeExamSection[]
  premium: boolean
}
```

Change the loop that builds `practiceExams` so every non-NAPLAN subject/grade still gets one synthesized section (same content as before, just wrapped):

```js
exams.forEach((questionIds, i) => {
  const gradeLabel = GRADE_LABEL[yearLevel] ?? yearLevel
  practiceExams.push({
    id: `${subject}-${yearLevel}-${i + 1}`,
    subject,
    yearLevel,
    title: `${SUBJECT_LABEL[subject]} ${gradeLabel} — Practice Exam ${i + 1}`,
    sections: [{ title: 'Questions', time_minutes: 20, question_ids: questionIds }],
    premium: SELECTIVE_SUBJECTS.has(subject),
  })
})
```

- [ ] **Step 3: Run and verify the legacy path still works**

```bash
node scripts/gen-exams.mjs
node -e "
const { PRACTICE_EXAMS } = require('./src/lib/questions/exams.ts');
" 2>&1 | head -1
grep -c "sections: \[" src/lib/questions/exams.ts
```
(The `require` line will fail because it's TS, not JS — that's expected and fine, ignore its output; the real check is the grep.) Expected: grep count equals the total exam count printed by the script (every exam now has exactly one `sections: [` block).

- [ ] **Step 4: Add the NAPLAN-aware composer for math/english Gr3-9**

Add near the top, after `EXAM_COUNT`:

```js
const NAPLAN_SUBJECTS = new Set(['math', 'english'])
const NAPLAN_GRADES = new Set(['grade_3', 'grade_4', 'grade_5', 'grade_6', 'year_7', 'year_8', 'year_9'])
const READING_TOPICS = new Set(['reading_comprehension', 'reading_literary_analysis'])
const LANGUAGE_TOPICS = new Set(['grammar_punctuation', 'vocabulary'])
const NUMERACY_CALC_SPLIT_GRADES = new Set(['year_7', 'year_8', 'year_9'])
```

Add a new function, called instead of `buildExams`+push when `NAPLAN_SUBJECTS.has(subject) && NAPLAN_GRADES.has(yearLevel)`:

```js
function pickLeastUsed(pool, usage, count) {
  const candidates = pool.filter(q => usage.get(q.id) < 2)
  candidates.sort((a, b) => usage.get(a.id) - usage.get(b.id))
  const chosen = candidates.slice(0, count)
  chosen.forEach(q => usage.set(q.id, usage.get(q.id) + 1))
  return chosen
}

function buildReadingSection(questions, usage, targetCount) {
  // Group by stimulus_id so a passage's questions never get split up.
  const byStimulus = new Map() // stimulus_id -> question[]
  const standalone = []
  for (const q of questions) {
    if (q.stimulus_id) {
      if (!byStimulus.has(q.stimulus_id)) byStimulus.set(q.stimulus_id, [])
      byStimulus.get(q.stimulus_id).push(q)
    } else {
      standalone.push(q)
    }
  }
  const groups = [...byStimulus.values(), ...standalone.map(q => [q])]
  const eligible = groups.filter(g => g.every(q => usage.get(q.id) < 2))
  eligible.sort((a, b) => usage.get(a[0].id) - usage.get(b[0].id))
  const chosen = []
  for (const g of eligible) {
    if (chosen.length >= targetCount) break
    g.forEach(q => usage.set(q.id, usage.get(q.id) + 1))
    chosen.push(...g)
  }
  return chosen.map(q => q.id)
}

function buildNaplanExam(subject, yearLevel, questionsByTopic, usage, examIndex) {
  const sections = []
  const readingPool = [...(questionsByTopic.reading_comprehension ?? []), ...(questionsByTopic.reading_literary_analysis ?? [])]
  if (readingPool.length) {
    sections.push({ title: 'Reading', time_minutes: 45, question_ids: buildReadingSection(readingPool, usage, 8) })
  }
  const languagePool = [...(questionsByTopic.grammar_punctuation ?? []), ...(questionsByTopic.vocabulary ?? [])]
  if (languagePool.length) {
    const ids = pickLeastUsed(languagePool, usage, 10).map(q => q.id)
    sections.push({ title: 'Language Conventions', time_minutes: 40, question_ids: ids })
  }
  const numeracyTopics = ['number_operations', 'number_patterns', 'algebra_equations', 'geometry_measurement', 'statistics_probability']
  const numeracyPool = numeracyTopics.flatMap(t => questionsByTopic[t] ?? [])
  if (numeracyPool.length) {
    if (NUMERACY_CALC_SPLIT_GRADES.has(yearLevel)) {
      const nonCalc = numeracyPool.filter(q => !q.calculator_allowed)
      const calc = numeracyPool.filter(q => q.calculator_allowed)
      if (nonCalc.length) sections.push({ title: 'Numeracy — non-calculator', time_minutes: 30, calculator_allowed: false, question_ids: pickLeastUsed(nonCalc, usage, 12).map(q => q.id) })
      if (calc.length) sections.push({ title: 'Numeracy — calculator', time_minutes: 30, calculator_allowed: true, question_ids: pickLeastUsed(calc, usage, 12).map(q => q.id) })
    } else {
      sections.push({ title: 'Numeracy', time_minutes: 45, question_ids: pickLeastUsed(numeracyPool, usage, 15).map(q => q.id) })
    }
  }
  const gradeLabel = GRADE_LABEL[yearLevel] ?? yearLevel
  return {
    id: `${subject}-${yearLevel}-${examIndex + 1}`,
    subject,
    yearLevel,
    title: `${SUBJECT_LABEL[subject]} ${gradeLabel} — Practice Exam ${examIndex + 1}`,
    sections: sections.filter(s => s.question_ids.length > 0),
    premium: false,
  }
}
```

- [ ] **Step 5: Wire the NAPLAN composer into the main loop**

The current loop groups by `${subject}__${year_level}` for non-selective subjects. Change the per-group handling so NAPLAN-eligible groups use `buildNaplanExam` (grouped further by topic) instead of the flat `buildExams`:

```js
for (const { subject, yearLevel, questions } of groups.values()) {
  if (NAPLAN_SUBJECTS.has(subject) && NAPLAN_GRADES.has(yearLevel)) {
    const questionsByTopic = {}
    for (const q of questions) {
      (questionsByTopic[q.topic] ??= []).push(q)
    }
    const usage = new Map(questions.map(q => [q.id, 0]))
    const examCount = EXAM_COUNT[subject] ?? 3
    for (let i = 0; i < examCount; i++) {
      practiceExams.push(buildNaplanExam(subject, yearLevel, questionsByTopic, usage, i))
    }
    continue
  }
  // ... existing flat-composer branch unchanged, but push using the sections-wrapped shape from Step 2
}
```

- [ ] **Step 6: Run and inspect**

```bash
node scripts/gen-exams.mjs
node -e "
const fs = require('fs');
const src = fs.readFileSync('src/lib/questions/exams.ts', 'utf8');
const m = src.match(/PRACTICE_EXAMS: PracticeExam\[\] = (\[[\s\S]*\])/);
const exams = eval(m[1]);
const mathG3 = exams.filter(e => e.subject === 'math' && e.yearLevel === 'grade_3');
console.log('math grade_3 exams:', mathG3.length);
console.log(JSON.stringify(mathG3[0], null, 2));
"
```
Expected: at least 1 exam, with a `sections` array whose section(s) have non-empty `question_ids` (no Reading section if no `reading_comprehension` grade_3 questions have been authored yet — that's fine, Task 13 adds them; a section is simply omitted when its pool is empty, per Step 4's `sections.filter`).

- [ ] **Step 7: Type-check and commit**

```bash
npx tsc --noEmit
git add scripts/gen-exams.mjs src/lib/questions/exams.ts
git commit -m "feat: sectioned PracticeExam + NAPLAN-aware composer for math/english Gr3-9"
```

---

### Task 5: `QuizRunner.tsx` — render stimulus card + section banner

**Files:**
- Modify: `src/components/practice/QuizRunner.tsx`

**Interfaces:**
- Consumes: nothing new from other tasks directly — this task defines the `QuizQuestion` extension that Task 6 must populate.
- Produces: `QuizQuestion.stimulus?: { id: string; type: 'passage' | 'data_table' | 'image'; title: string; body: string }`; `QuizQuestion.section?: { title: string; calculator_allowed?: boolean }`.

- [ ] **Step 1: Write the failing check**

```bash
grep -c "stimulus?:" src/components/practice/QuizRunner.tsx
```
Expected: `0`.

- [ ] **Step 2: Extend the `QuizQuestion` interface**

```ts
export interface QuizQuestion {
  id: string
  question_text: string
  explanation: string
  format?: QuestionFormat
  options?: string[]
  correct_index?: number
  stimulus?: { id: string; type: 'passage' | 'data_table' | 'image'; title: string; body: string }
  section?: { title: string; calculator_allowed?: boolean }
}
```

- [ ] **Step 3: Render the section banner and stimulus card**

In the `screen === 'quiz'` render branch, right after the progress bar `<div className="h-1.5 ...">` and before the `<div className="card mb-4">` question card, add:

```tsx
{q.section && (qIndex === 0 || questions[qIndex - 1]?.section?.title !== q.section.title) && (
  <div className="mb-4 px-4 py-2 rounded-lg bg-gray-50 text-sm text-gray-600 flex items-center justify-between">
    <span className="font-medium">{q.section.title}</span>
    {q.section.calculator_allowed !== undefined && (
      <span>{q.section.calculator_allowed ? 'Calculator allowed' : 'No calculator'}</span>
    )}
  </div>
)}
{q.stimulus && (
  <div className="card mb-4 bg-gray-50">
    <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">{q.stimulus.title}</p>
    <p className="text-sm leading-relaxed whitespace-pre-line">{q.stimulus.body}</p>
  </div>
)}
```

- [ ] **Step 4: Verify**

```bash
grep -c "stimulus?:" src/components/practice/QuizRunner.tsx
npx tsc --noEmit
```
Expected: `1`, clean type-check. (Manual smoke test happens in Task 6, once real data flows through — a `QuizQuestion` with no `stimulus`/`section` renders identically to before, since both blocks are conditional.)

- [ ] **Step 5: Commit**

```bash
git add src/components/practice/QuizRunner.tsx
git commit -m "feat: QuizRunner renders a stimulus card and section banner when present"
```

---

### Task 6: Exam page — flatten sections into `QuizQuestion[]`

**Files:**
- Modify: `src/app/practice/exams/[id]/page.tsx`

**Interfaces:**
- Consumes: `PracticeExam.sections` (Task 4), `QuizQuestion.stimulus`/`section` (Task 5), `STIMULI` (Task 1/3).

- [ ] **Step 1: Write the failing check**

```bash
grep -c "exam.sections" src/app/practice/exams/\[id\]/page.tsx
```
Expected: `0` (still reads `exam.questionIds`).

- [ ] **Step 2: Replace the flattening logic**

```tsx
import { STIMULI } from '@/lib/questions/stimuli'
// ...
const stimulusById = new Map(STIMULI.map(s => [s.id, s]))

const questions = exam.sections.flatMap(section =>
  section.question_ids
    .map(id => QUESTION_BANK.find(q => q.id === id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .map(q => ({
      ...q,
      section: { title: section.title, calculator_allowed: section.calculator_allowed },
      stimulus: q.stimulus_id ? stimulusById.get(q.stimulus_id) : undefined,
    }))
)
```

- [ ] **Step 3: Verify end-to-end**

```bash
npx tsc --noEmit
grep -c "exam.sections" src/app/practice/exams/\[id\]/page.tsx
```
Expected: clean type-check, count `1`.

- [ ] **Step 4: Manual smoke test**

Run `npm run dev`, open `/practice/exams`, start a non-selective Maths or Science exam (unaffected subjects — should render exactly as before, no section banner since there's only ever one synthesized "Questions" section... actually the banner WILL show once per exam since `qIndex === 0` always triggers it for the first question. Decide: is a single "Questions" banner on question 1 acceptable for legacy exams, or should legacy exams suppress it? Suppress it — cleaner. In Task 4 Step 2, use `title: ''` is awkward; instead, in this task's flatten step, only attach `section` when `exam.sections.length > 1` OR the section title isn't the literal placeholder `'Questions'`:

```tsx
.map(q => ({
  ...q,
  section: section.title === 'Questions' ? undefined : { title: section.title, calculator_allowed: section.calculator_allowed },
  stimulus: q.stimulus_id ? stimulusById.get(q.stimulus_id) : undefined,
}))
```

Re-run the dev server, confirm a legacy exam (e.g. Science) shows no section banner, then confirm `npx tsc --noEmit` is still clean.

- [ ] **Step 5: Commit**

```bash
git add src/app/practice/exams/\[id\]/page.tsx
git commit -m "feat: exam page flattens sections into QuizRunner's question list"
```

---

### Task 7: Rewrite `number_operations` (Grade 3-9) + calculator split for Yr7-9

**Files:**
- Modify: `src/lib/questions/bank.ts` (existing `number_operations` blocks at the "initial" ~line 13, "additional" ~line 828, and "expansion" ~line 5602 headers — locate with `grep -n "topic: 'number_operations'"` since line numbers shift after Tasks 1-6; append new content immediately after the topic's last existing block rather than creating a new scattered section)

**Scope:** Rewrite every existing `number_operations` question (Gr3-9) to meet the Content Quality Bar. Reach **at least 8 questions per grade for Gr3-6** (rewrite in place; add new ones only if a grade has fewer than 8 today) and **at least 8 non-calculator + 8 calculator questions per year level for Yr7-9** (set `calculator_allowed: true`/leave unset accordingly).

**Worked examples (pattern to match):**

Grade 4, non-calculator-split grade — replaces a bare "What is 248 + 375?":
```ts
{
  topic: 'number_operations', year_level: 'grade_4', difficulty: 'developing',
  question_text: "The school canteen sold 248 sausage rolls on Monday and 375 on Tuesday. How many sausage rolls did it sell in total across the two days?",
  options: ['623', '533', '613', '127'],
  correct_index: 0,
  explanation: 'Add the two days together: 248 + 375 = 623.',
  curriculum_code: 'AC9M4N04',
},
```
(Distractor design: 533 = subtracting instead of adding; 613 = a regrouping slip; 127 = 375 − 248, the wrong operation entirely.)

Year 8, calculator-allowed:
```ts
{
  topic: 'number_operations', year_level: 'year_8', difficulty: 'proficient', calculator_allowed: true,
  question_text: "A caterer needs 3.75 kg of flour per cake and is making 17 cakes for a wedding. How many kilograms of flour does she need in total?",
  options: ['63.75 kg', '60.75 kg', '20.75 kg', '58.5 kg'],
  correct_index: 0,
  explanation: '3.75 × 17 = 63.75 kg.',
  curriculum_code: 'AC9M8N01',
},
```
Year 8, non-calculator (same topic/year, no `calculator_allowed`, mental-strategy-friendly numbers):
```ts
{
  topic: 'number_operations', year_level: 'year_8', difficulty: 'developing',
  question_text: "A recipe uses 3/4 cup of sugar. Priya wants to make one and a half times the recipe. How much sugar does she need?",
  options: ['1 1/8 cups', '1 1/4 cups', '3/8 cup', '2 1/4 cups'],
  correct_index: 0,
  explanation: '3/4 × 3/2 = 9/8 = 1 1/8 cups.',
  curriculum_code: 'AC9M8N02',
},
```

- [ ] **Step 1: Locate all existing `number_operations` questions**

```bash
grep -n "topic: 'number_operations'" src/lib/questions/bank.ts
```

- [ ] **Step 2: Rewrite each in place per the Content Quality Bar and worked examples above**, and append any new questions needed to reach the minimums, directly after the topic's last existing block.

- [ ] **Step 3: Verify counts**

```bash
node -e "
const fs = require('fs');
const src = fs.readFileSync('src/lib/questions/bank.ts', 'utf8');
const jsSrc = src.replace(/^import type .+\n/m, '').replace(/export const QUESTION_BANK:[^=]+=\s*\[/, 'export const QUESTION_BANK = [');
fs.writeFileSync('.tmp-check.mjs', jsSrc);
import('./.tmp-check.mjs').then(({ QUESTION_BANK }) => {
  fs.unlinkSync('.tmp-check.mjs');
  const q = QUESTION_BANK.filter(x => x.topic === 'number_operations');
  const byGrade = {};
  for (const x of q) {
    const key = x.year_level + (x.calculator_allowed ? ':calc' : (['year_7','year_8','year_9'].includes(x.year_level) ? ':noncalc' : ''));
    byGrade[key] = (byGrade[key]||0) + 1;
  }
  console.log(byGrade);
});
"
```
Expected: every `grade_3`..`grade_6` key >= 8; every `year_7:calc`/`year_7:noncalc`/`year_8:calc`/etc >= 8.

- [ ] **Step 4: Verify `correct_index` isn't degenerate for the questions you touched**

```bash
grep -A2 "topic: 'number_operations'" src/lib/questions/bank.ts | grep -o "correct_index: [0-9]*" | sort | uniq -c
```
Expected: a roughly even spread, not all one value.

- [ ] **Step 5: Regenerate and type-check**

```bash
node scripts/gen-seed.mjs && node scripts/gen-exams.mjs && npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/questions/bank.ts supabase/seed.sql src/lib/questions/exams.ts
git commit -m "content: rewrite number_operations Gr3-9 to NAPLAN style + Yr7-9 calculator split"
```

---

### Task 8: Rewrite `number_patterns` (Grade 3-6)

**Files:** Modify: `src/lib/questions/bank.ts` (`grep -n "topic: 'number_patterns'"`)

**Scope:** Rewrite every existing question to meet the Content Quality Bar (currently abstract sequences like "Next number: 2, 4, 6, 8, ___?" or context-free "number machines" — replace with real-world repeating/growing patterns). Reach at least 8 per grade (grade_3-grade_6).

**Worked example** (replaces "Find the missing number: 8 + ___ = 15"):
```ts
{
  topic: 'number_patterns', year_level: 'grade_4', difficulty: 'developing',
  question_text: "A bus stops at the school every 8 minutes. If the first bus arrives at 8:00 am, at what time does the 4th bus arrive?",
  options: ['8:24 am', '8:32 am', '8:16 am', '8:40 am'],
  correct_index: 0,
  explanation: 'Buses arrive at 8:00, 8:08, 8:16, 8:24 — the 4th bus is at 8:24 am (3 gaps of 8 minutes after the first).',
  curriculum_code: 'AC9M4A01',
},
```

- [ ] **Step 1: Locate, rewrite, and reach the 8-per-grade minimum**, following Task 7's process (locate → rewrite in place → append if short → verify counts → verify correct_index spread → regenerate → type-check).
- [ ] **Step 2: Commit** with message `content: rewrite number_patterns Gr3-6 to NAPLAN style`.

---

### Task 9: Rewrite `algebra_equations` (Year 7-9) + calculator split

**Files:** Modify: `src/lib/questions/bank.ts` (`grep -n "topic: 'algebra_equations'"`)

**Scope:** Rewrite every existing question (currently bare "Solve: x + 7 = 15" / "Factorise: x² − 9" style, heavily templated across grades per the audit) to meet the Content Quality Bar, contextualized where realistic (e.g. "a plumber charges a $45 callout fee plus $30 per hour — write and solve an equation for a $135 job") and left as clean symbolic manipulation where NAPLAN/AC9 genuinely tests it that way (e.g. factorising) — but never templated identically across two year levels. Reach at least 8 non-calculator + 8 calculator per year level (year_7-year_9).

**Worked example:**
```ts
{
  topic: 'algebra_equations', year_level: 'year_7', difficulty: 'developing',
  question_text: "A taxi charges a $4 flag fall plus $2 per kilometre. If a trip costs $22, how many kilometres was it?",
  options: ['9 km', '11 km', '13 km', '7 km'],
  correct_index: 0,
  explanation: 'Let d = distance. 4 + 2d = 22, so 2d = 18, d = 9 km.',
  curriculum_code: 'AC9M7A02',
},
```

- [ ] **Step 1-6: Same process as Task 7** (locate → rewrite/expand → verify grade/stream counts → verify correct_index spread → regenerate → type-check → commit as `content: rewrite algebra_equations Yr7-9 to NAPLAN style + calculator split`).

---

### Task 10: Rewrite `geometry_measurement` (Grade 3-9) + calculator split for Yr7-9

**Files:** Modify: `src/lib/questions/bank.ts` (`grep -n "topic: 'geometry_measurement'"`)

**Scope:** Rewrite every existing question (currently bare "Perimeter of a square with side length 7 cm?" style, templated across grades per audit — e.g. circle area asked 3 times with only the radius changed). Reach at least 8 per grade for Gr3-6 (note the audit flagged `year_8` as thin at only 5 — this cell especially needs new, non-templated items, not just a rewrite) and at least 8 non-calculator + 8 calculator per year level for Yr7-9.

**Worked example:**
```ts
{
  topic: 'geometry_measurement', year_level: 'grade_5', difficulty: 'developing',
  question_text: "Mrs Chen wants to put a fence around her rectangular vegetable patch, which is 8 m long and 5 m wide. How many metres of fencing does she need?",
  options: ['26 m', '40 m', '13 m', '20 m'],
  correct_index: 0,
  explanation: 'Perimeter = 2 × (length + width) = 2 × (8 + 5) = 26 m.',
  curriculum_code: 'AC9M5M02',
},
```

- [ ] **Step 1-6: Same process as Task 7**, commit as `content: rewrite geometry_measurement Gr3-9 to NAPLAN style + calculator split`.

---

### Task 11: Rewrite `statistics_probability` (Grade 3-9) + calculator split for Yr7-9, add data-interpretation style

**Files:** Modify: `src/lib/questions/bank.ts` (`grep -n "topic: 'statistics_probability'"`)

**Scope:** Rewrite every existing question. The audit flagged this topic as the least NAPLAN-like ("compute the mean/median/mode/range of this list" with no context) — real NAPLAN stats items are built from a two-way table, timetable, or simple graph description that must be *read* before computing. Since this format has no chart-rendering support yet, represent small tables/lists directly in `question_text` (e.g. "The table below shows..." followed by an inline plain-text table using line breaks) rather than a bare number list. Reach at least 8 per grade for Gr3-6 and at least 8 non-calculator + 8 calculator per year level for Yr7-9.

**Worked example:**
```ts
{
  topic: 'statistics_probability', year_level: 'grade_6', difficulty: 'proficient',
  question_text: "Five students recorded how many books they read last month: Ali: 3, Ben: 7, Cara: 5, Dev: 3, Ella: 12. What is the median number of books read?",
  options: ['5', '3', '6', '12'],
  correct_index: 0,
  explanation: 'Ordered: 3, 3, 5, 7, 12. The middle value is 5.',
  curriculum_code: 'AC9M6ST01',
},
```

- [ ] **Step 1-6: Same process as Task 7**, commit as `content: rewrite statistics_probability Gr3-9 to NAPLAN style + calculator split`.

---

### Task 12: Author shared reading passages (`STIMULI`) + clustered questions for `reading_comprehension`/`reading_literary_analysis`

**Files:**
- Modify: `src/lib/questions/stimuli.ts` (add real passages)
- Modify: `src/lib/questions/bank.ts` (`grep -n "topic: 'reading_comprehension'\|topic: 'reading_literary_analysis'"` — replace the existing one-sentence-pseudo-stimulus and no-stimulus items entirely)

**Scope:** Per the audit, every current reading item is either a single quoted sentence feeding one question, or has no text at all. Replace this structurally: author **3 passages per grade band** (grade_3, grade_4, grade_5, grade_6 for `reading_comprehension`; year_7, year_8, year_9 for `reading_literary_analysis`) = 21 passages total, each **5-8 clustered questions**. Delete the old thin standalone items for these topics/grades entirely (don't leave them alongside the new passages — they'd dilute the pool with off-style content).

Length/genre targets (from the audit):
- grade_3: 80-120 words, simple narrative or recount
- grade_4: 120-180 words, narrative + informational
- grade_5: 180-250 words, narrative / informational report / persuasive letter
- grade_6: 250-350 words, narrative / newspaper report / persuasive speech
- year_7-9: 350-600 words, short-story excerpt / opinion-persuasive article / (year_9 also) a poem or satirical piece — increasing inferential difficulty

**Worked example** (one grade_4 passage + 2 of its ~6 questions — write the rest following this pattern):
```ts
// stimuli.ts
{
  type: 'passage', subject: 'english', year_level: 'grade_4', word_count: 142,
  title: 'The Lighthouse Keeper',
  body: `For thirty years, old Mr Petrov had climbed the winding stairs of the lighthouse every evening at sunset. His job was simple but important: make sure the great lamp turned on to warn ships away from the rocky coast.\n\nOne stormy night, the wind howled so fiercely that Mr Petrov worried the lamp's mechanism might jam. He climbed the stairs twice as fast as usual, his lantern swinging wildly in the gale. When he reached the top, he found the gears had indeed stuck.\n\nWorking quickly with cold, stiff fingers, he oiled the mechanism and coaxed it back to life just as a fishing boat rounded the point. The captain later said the light appearing at that exact moment had saved his crew from the rocks.\n\nMr Petrov never told anyone how close it had been. He simply climbed down, made a cup of tea, and waited for tomorrow's sunset.`,
},
```
```ts
// bank.ts — questions referencing the passage above via its assigned stimulus_id
// (write the passage in stimuli.ts FIRST, run gen-seed.mjs once to assign it a
// real id, then copy that id into these questions' stimulus_id — or, simpler,
// assign a literal id yourself in stimuli.ts, e.g. id: 'stim-lighthouse-g4',
// since ids just need to be unique strings; gen-seed.mjs only auto-assigns
// ids that are MISSING, it never overwrites one you already wrote)
{
  topic: 'reading_comprehension', year_level: 'grade_4', difficulty: 'developing', stimulus_id: 'stim-lighthouse-g4',
  question_text: 'Why did Mr Petrov climb the stairs twice as fast as usual on the stormy night?',
  options: ['He was worried the lamp mechanism might jam', 'He wanted to get out of the rain quickly', 'He was late for his shift', 'He heard the fishing boat calling for help'],
  correct_index: 0,
  explanation: 'The text says he "worried the lamp\'s mechanism might jam" as the wind howled, so he climbed faster.',
  curriculum_code: 'AC9E4LY05',
},
{
  topic: 'reading_comprehension', year_level: 'grade_4', difficulty: 'proficient', stimulus_id: 'stim-lighthouse-g4',
  question_text: 'What can you infer about Mr Petrov\'s character from the last paragraph?',
  options: ['He is modest and doesn\'t seek recognition for his actions', 'He is forgetful and often loses track of time', 'He dislikes his job as a lighthouse keeper', 'He is afraid of storms'],
  correct_index: 0,
  explanation: 'He "never told anyone how close it had been" and simply returns to his routine — this shows modesty, not seeking credit.',
  curriculum_code: 'AC9E4LY07',
},
```

(If you assign literal string ids like `'stim-lighthouse-g4'` in `stimuli.ts` rather than leaving them for auto-assignment, that's fine — `gen-seed.mjs`'s regex only touches objects with no `id:` field at all.)

- [ ] **Step 1: Delete the old thin reading items** for `reading_comprehension` (grade_3-6) and `reading_literary_analysis` (year_7-9) from `bank.ts`.

- [ ] **Step 2: Author 21 passages in `stimuli.ts`** (3 per grade band × 7 bands) following the length/genre targets and the worked example's format (literal, memorable `id` strings are recommended for readability, e.g. `'stim-<short-slug>-<grade>'`).

- [ ] **Step 3: Author 5-8 clustered questions per passage in `bank.ts`**, each with that passage's `stimulus_id`, testing a mix of: main idea, inference, vocabulary-in-context, author's purpose/tone, text structure — never a question answerable without having read the passage.

- [ ] **Step 4: Verify structure**

```bash
node -e "
const fs = require('fs');
const src = fs.readFileSync('src/lib/questions/stimuli.ts', 'utf8');
const jsSrc = src.replace(/^import type .+\n/m, '').replace(/export const STIMULI:[^=]+=\s*\[/, 'export const STIMULI = [');
fs.writeFileSync('.tmp-stim.mjs', jsSrc);
import('./.tmp-stim.mjs').then(({ STIMULI }) => {
  fs.unlinkSync('.tmp-stim.mjs');
  const byGrade = {};
  STIMULI.forEach(s => byGrade[s.year_level] = (byGrade[s.year_level]||0) + 1);
  console.log('passages per grade:', byGrade);
});
"
```
Expected: 3 for each of grade_3, grade_4, grade_5, grade_6, year_7, year_8, year_9.

```bash
node -e "
const fs = require('fs');
const src = fs.readFileSync('src/lib/questions/bank.ts', 'utf8');
const jsSrc = src.replace(/^import type .+\n/m, '').replace(/export const QUESTION_BANK:[^=]+=\s*\[/, 'export const QUESTION_BANK = [');
fs.writeFileSync('.tmp-check2.mjs', jsSrc);
import('./.tmp-check2.mjs').then(({ QUESTION_BANK }) => {
  fs.unlinkSync('.tmp-check2.mjs');
  const readingQs = QUESTION_BANK.filter(q => q.topic === 'reading_comprehension' || q.topic === 'reading_literary_analysis');
  const withStimulus = readingQs.filter(q => q.stimulus_id);
  console.log('reading questions:', readingQs.length, 'with stimulus_id:', withStimulus.length);
  const byStimulus = {};
  withStimulus.forEach(q => byStimulus[q.stimulus_id] = (byStimulus[q.stimulus_id]||0) + 1);
  console.log('questions per stimulus (should all be 5-8):', Object.values(byStimulus));
});
"
```
Expected: `readingQs.length === withStimulus.length` (every reading question now has a stimulus), and every value in the per-stimulus counts is 5-8.

- [ ] **Step 5: Regenerate, type-check, and smoke-test in the browser**

```bash
node scripts/gen-seed.mjs && node scripts/gen-exams.mjs && npx tsc --noEmit
npm run dev
```
Open `/practice/exams`, start a Grade 4 English exam, confirm the Reading section shows the passage card staying visible across its question cluster (per Task 5/6's rendering).

- [ ] **Step 6: Commit**

```bash
git add src/lib/questions/stimuli.ts src/lib/questions/bank.ts supabase/seed.sql src/lib/questions/exams.ts
git commit -m "content: author 21 NAPLAN-style reading passages with clustered questions"
```

---

### Task 13: Rewrite `vocabulary` (Grade 3-9) to in-context sentence-based items

**Files:** Modify: `src/lib/questions/bank.ts` (`grep -n "topic: 'vocabulary'"`)

**Scope:** Per the audit, ~70% of vocabulary items are context-free "Which word means the same as 'X'?" flashcards. Rewrite every one to test the word **as used in a sentence** (the existing ~30% in-context pattern is the target style — extend it to 100%). Keep existing per-grade counts (don't need to hit a new minimum, just convert the format).

**Worked example** (replaces "Which word means the same as 'happy'? Glad / Sad / Angry / Tired"):
```ts
{
  topic: 'vocabulary', year_level: 'grade_3', difficulty: 'foundation',
  question_text: 'In the sentence "Maya felt glad when she saw her puppy waiting at the door," what does "glad" mean?',
  options: ['Happy', 'Sad', 'Angry', 'Tired'],
  correct_index: 0,
  explanation: '"Glad" means happy or pleased, matching how Maya feels seeing her puppy.',
  curriculum_code: 'AC9E3LA09',
},
```

- [ ] **Step 1-6: Same process as Task 7** (rewrite in place, no count expansion needed, verify no bare flashcard items remain via `grep -B1 "options:" ... | grep "Which word means"` returning 0 matches, verify correct_index spread, regenerate, type-check), commit as `content: rewrite vocabulary Gr3-9 to in-context sentence-based items`.

---

### Task 14: Expand `grammar_punctuation` volume/variety (mainly year_9)

**Files:** Modify: `src/lib/questions/bank.ts` (`grep -n "topic: 'grammar_punctuation'"`)

**Scope:** The audit found this topic already solid (realistic full-sentence usage/error-identification, on par with real NAPLAN Language Conventions). No rewrite needed. Only: (1) expand `year_9` from 7 to at least 12 questions — the audit flagged it as homogenous (agreement + homophone + punctuation only); add spelling-in-context and multi-clause "which sentence contains an error" item types; (2) spot-check the other grades for variety and add 1-2 more items to any grade with fewer than 8.

**Worked example** (new year_9 item type — multi-clause error identification, not in the current mix):
```ts
{
  topic: 'grammar_punctuation', year_level: 'year_9', difficulty: 'proficient',
  question_text: 'Which sentence contains a punctuation error?',
  options: [
    'Although it was raining, the team decided to play the match, and the crowd stayed until the end.',
    'The coach who had trained them for years, was proud of their effort.',
    'Despite the loss, the players shook hands with their opponents.',
    'The final score, 3-2, surprised everyone in the stadium.',
  ],
  correct_index: 1,
  explanation: 'There should be no comma before "was proud" — the relative clause "who had trained them for years" doesn\'t need a comma to separate the subject from its verb.',
  curriculum_code: 'AC9E9LA07',
},
```

- [ ] **Step 1: Locate `year_9` grammar_punctuation items, add 5+ new ones** following the worked example and Content Quality Bar.
- [ ] **Step 2: Check other grades, top up any below 8.**
- [ ] **Step 3: Verify counts, correct_index spread, regenerate, type-check.**
- [ ] **Step 4: Commit** as `content: expand grammar_punctuation year_9 variety and volume`.

---

## Final verification (after all 14 tasks)

- [ ] `npx tsc --noEmit` clean.
- [ ] `node scripts/gen-seed.mjs && node scripts/gen-exams.mjs` both run clean end-to-end on the final `bank.ts`/`stimuli.ts`.
- [ ] `npm run dev`, manually run through: one Grade 4 English exam (confirm Reading section + passage rendering), one Year 8 Maths exam (confirm Numeracy non-calculator/calculator section banners), one Grade 3 Maths exam (confirm no calculator banner — Gr3 has no split), one Science exam (confirm nothing changed — no section banner, renders as before).
- [ ] Remind the user: `supabase/schema_stimuli.sql` (Task 2) still needs to be run in the Supabase SQL editor, after `schema_general_maths_rename.sql` and `schema_topics_and_longform.sql` (both already pending from the prior session), before the next `seed.sql` load. Update `[[reference-prepnest-supabase]]` with this as the next migration step once it's confirmed run.
