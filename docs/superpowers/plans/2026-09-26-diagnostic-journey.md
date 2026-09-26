# Diagnostic Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A parent picks a year level and subject, the child sits a short on-screen diagnostic test, the site reports strengths and focus areas with ways to help at home, and builds a tailored printable exam from the result.

**Architecture:** A pure, unit-tested engine in `src/lib/diagnostic/` (classification, blueprint, selection, scoring, tailoring, signed tokens, parent guidance) that takes the question bank as a parameter. A server-side renderer in `src/lib/web/` turns the existing react-pdf diagrams and the MathJax glyph cache into HTML, so the screen shows exactly what the paper prints. Next.js route handlers serve the test, grade it, save it with the service role, and render the tailored exam through the existing PDF documents.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind, Supabase (Postgres + RLS), @react-pdf/renderer, Stripe (existing), `node --test` with Node 24 type stripping.

**Spec:** `docs/superpowers/specs/2026-09-26-diagnostic-journey-design.md`

## Global Constraints

- Customer copy: "practice" for noun and verb (never "practise"); "purchase", never "buy"; never mention refunds; no testimonials, usage numbers or "future papers included" claims.
- Pricing: test + report free; tailored exam included in the Grade 3 – Year 10 plan; VCE tailored exam uses `STRIPE_PRICE_VCE_PAPER` ($20, `VCE_PAPER_PRICE`); non-payers get a preview.
- No new environment variables. The token key is derived from `SUPABASE_SERVICE_ROLE_KEY`.
- No answers, explanations or correct indexes leave the server before a test is submitted.
- Database writes to `diagnostic_results` only through the service role, after server-side grading. Failures are surfaced to the user, never swallowed.
- Engine modules under `src/lib/diagnostic/` import each other and other `src/lib` modules with explicit `.ts` extensions and only `import type` from `@/…`, so `node --test` can load them.
- Windows checkout: edit files with the Edit/Write tools or Node, never Python; scripts with backslash escapes are written to a file, not inlined in Bash.
- Science diagnostics only at Grade 6, Year 8, Year 10 (the catalogue's Science years).
- Merge to `main` is a production deploy and needs the owner; push the branch and open a PR.

---

## File map

| File | Responsibility |
|---|---|
| `tsconfig.json` | add `allowImportingTsExtensions` |
| `src/lib/diagnostic/types.ts` | engine types |
| `src/lib/diagnostic/rng.ts` | seeded PRNG, hashing, shuffle |
| `src/lib/diagnostic/areas.ts` | area + skill classification, area order, subject of a topic |
| `src/lib/diagnostic/blueprint.ts` | offered tests, allocation, screenable pool |
| `src/lib/diagnostic/select.ts` | choose and order a test's questions (incl. Reading texts) |
| `src/lib/diagnostic/score.ts` | grading, report model, headline text |
| `src/lib/diagnostic/tailor.ts` | tailored exam composition |
| `src/lib/diagnostic/token.ts` | HMAC sign/verify, key derivation |
| `src/lib/diagnostic/guidance.ts` | parent guidance per area |
| `src/lib/diagnostic/access.ts` | who gets the full tailored exam |
| `src/lib/diagnostic/save.ts` | server-only insert/claim with service role |
| `src/lib/diagnostic/load.ts` | server-only: read a result, build report + exam |
| `src/lib/web/pdfToHtml.ts` | react-pdf element tree → HTML/SVG string |
| `src/lib/web/mathHtml.ts` | TeX (from glyph cache) → inline SVG; rich text → HTML |
| `src/lib/web/questionHtml.tsx` | a bank question → screen question (HTML strings, no answers) |
| `src/lib/questions/answerUnit.ts` | unit prefix/suffix for short answers (moved from the PDF) |
| `src/lib/pdf/resolveExam.ts` | add `hydrateExam(exam)` |
| `src/lib/pdf/ExamPaperDocument.tsx` | optional `coverNote` |
| `src/lib/pdf/PreviewPages.tsx` | optional preview end-page URL |
| `src/app/api/diagnostic/start/route.ts` | start a test |
| `src/app/api/diagnostic/submit/route.ts` | grade, save or issue receipt |
| `src/app/api/diagnostic/claim/route.ts` | save a receipt to the signed-in account |
| `src/app/api/diagnostic/[id]/exam/route.tsx` | tailored exam PDF (paper/answers), gated |
| `src/app/api/dev/diagnostic/route.tsx` | dev-only sample report/exam |
| `src/app/api/dev/diagrams-web/route.tsx` | dev-only diagram gallery as HTML |
| `src/app/api/checkout/route.ts` | `{ tailoredId }` branch |
| `supabase/schema_diagnostics.sql` | table + RLS |
| `scripts/check-live-schema.mjs` | probe for the table |
| `src/app/diagnostic/page.tsx` + `src/components/diagnostic/DiagnosticSetup.tsx` | landing + setup |
| `src/app/diagnostic/test/page.tsx` + `src/components/diagnostic/DiagnosticRunner.tsx` | the test |
| `src/app/diagnostic/results/page.tsx` + `src/components/diagnostic/DiagnosticResults.tsx` | anonymous headline + claim |
| `src/components/diagnostic/HeadlineResults.tsx`, `LevelChip.tsx`, `AreaBar.tsx` | shared result display |
| `src/app/diagnostic/report/[id]/page.tsx` + `src/components/diagnostic/report/*` | full report |
| `src/app/diagnostic/report/[id]/mark/page.tsx` | mark the tailored exam |
| `src/lib/diagnostic/storage.ts` | client localStorage helpers (client-safe) |
| `src/app/parent/page.tsx` | diagnostics list |
| `src/components/home/MarketingHome.tsx`, `src/components/diagnostic/SampleReport.tsx` | homepage |
| `src/components/layout/Navbar.tsx`, NAPLAN/VCE/pricing/help pages, `src/lib/faqs.ts`, privacy, sitemap, releases | site copy |
| `scripts/tests/diagnostic-*.test.mjs` | unit tests |
| `scripts/diagnostic-audit.mjs` | prints classifier distributions and samples for review |

---

### Task 1: Engine foundation — types, RNG, `.ts` imports

**Files:**
- Modify: `tsconfig.json`
- Create: `src/lib/diagnostic/types.ts`, `src/lib/diagnostic/rng.ts`
- Test: `scripts/tests/diagnostic-rng.test.mjs`

**Interfaces — Produces:**
```ts
// types.ts
import type { Question, SubjectSlug, YearLevel, Difficulty, TopicSlug } from '../../types'
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never
export type BankQuestion = DistributiveOmit<Question, 'created_at'>
export type Level = 'strength' | 'developing' | 'focus'
export interface AreaDef { id: string; label: string }
export interface Classified { area: AreaDef; skill: string }
export interface Allocation { area: string; count: number }
export interface TestSpec { year: YearLevel; subject: SubjectSlug; allocation: Allocation[]; minutes: number; texts?: number }
export type Answer = number | string | null
export interface Response { id: string; a: Answer }
export interface GradedItem { id: string; topic: TopicSlug; area: AreaDef; skill: string; difficulty: Difficulty; answer: Answer; correct: boolean }
export interface SkillResult { label: string; correct: number; total: number }
export interface AreaResult { id: string; label: string; correct: number; total: number; pct: number; level: Level; skills: SkillResult[] }
export interface DiagnosticReport { year: YearLevel; subject: SubjectSlug; correct: number; total: number; pct: number; areas: AreaResult[]; items: GradedItem[] }
// rng.ts
export function hashSeed(s: string): number            // FNV-1a, unsigned 32-bit
export function mulberry32(seed: number): () => number // [0, 1)
export function shuffle<T>(items: readonly T[], rand: () => number): T[]
```

- [ ] **Step 1: tsconfig** — add `"allowImportingTsExtensions": true` to `compilerOptions` (allowed because `noEmit` is true).
- [ ] **Step 2: failing test** `scripts/tests/diagnostic-rng.test.mjs`:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hashSeed, mulberry32, shuffle } from '../../src/lib/diagnostic/rng.ts'

test('hashSeed is stable and unsigned', () => {
  assert.equal(hashSeed('abc'), hashSeed('abc'))
  assert.notEqual(hashSeed('abc'), hashSeed('abd'))
  assert.ok(hashSeed('x') >= 0)
})
test('mulberry32 is deterministic and in [0,1)', () => {
  const a = mulberry32(42), b = mulberry32(42)
  for (let i = 0; i < 100; i++) { const x = a(); assert.equal(x, b()); assert.ok(x >= 0 && x < 1) }
})
test('shuffle keeps every item and does not mutate', () => {
  const src = [1, 2, 3, 4, 5, 6, 7, 8]
  const out = shuffle(src, mulberry32(7))
  assert.deepEqual([...out].sort((x, y) => x - y), src)
  assert.deepEqual(src, [1, 2, 3, 4, 5, 6, 7, 8])
})
```
- [ ] **Step 3:** `npm test` → FAIL (module missing).
- [ ] **Step 4: implement** `types.ts` (as above) and `rng.ts` (FNV-1a over UTF-16 code units; mulberry32; Fisher–Yates on a copy).
- [ ] **Step 5:** `npm test` → PASS; `npm run type-check` → clean.
- [ ] **Step 6: Commit** `feat(diagnostic): engine types and seeded RNG`.

### Task 2: Area and skill classification

**Files:** Create `src/lib/diagnostic/areas.ts`, `scripts/diagnostic-audit.mjs`; Test `scripts/tests/diagnostic-areas.test.mjs`.

**Interfaces — Produces:**
```ts
export function subjectOfTopic(topic: TopicSlug): SubjectSlug
export function areasFor(subject: SubjectSlug, year: YearLevel): AreaDef[]   // report order
export function classify(q: BankQuestion): Classified                       // subject derived from topic
```
Rules (first match wins; test against `question_text`, `diagram?.kind`, `option_diagrams`):
- **Maths** — area = topic (label from `TOPICS`). Skill rules per topic:
  - `number_operations`: Percentages (`%|per ?cent`), Fractions (fraction_model diagram, `fraction|numerator|denominator|half|halves|quarter|third|\d+\s*\/\s*\d+|mixed number`), Money (money diagram, `\$|cents?|change|costs?|price|pays?|spend|spent|earn|budget`), Ratios & rates (`ratio|rate|per hour|km\/h|speed|scale`), Powers & roots (`power|ind(ex|ices)|squared|cubed|square root|√|²|³|scientific notation|× 10`), Negative numbers (`negative|integer|below zero|−\s?\d`), Estimating & rounding (`round|estimat|nearest|approximately`), Decimals (`decimal|tenths?|hundredths?|\d\.\d`), Factors & multiples (`factor|multiple|prime|square number|divisible|even|odd`), Division (`÷|divid|share|equally|left over|remainder`), Multiplication (`×|multipl|times|product|groups of|rows of`), Place value & ordering (place_value/number_line diagram, `place value|digit|value of|thousand|hundred|largest|smallest|order|expanded|numeral|in words`), Addition & subtraction (`\+|−|add|subtract|sum|difference|more than|fewer|less than|altogether|total|left|how many more`), fallback Number problems.
  - `number_patterns`: Order of operations (brackets or mixed operators), Number sentences (`balance|missing|unknown|thinks of a number|number sentence|true|=`), fallback Patterns & rules.
  - `algebra_equations`: Simultaneous equations, Quadratics (`quadratic|parabola|x²|x\^2`), Linear graphs (coordinate_plane/function_graph diagram, `gradient|slope|intercept|straight line|linear`), Inequalities (`inequalit|<|>|≤|≥`), Index laws (`ind(ex|ices)|power|exponent|²|³`), Solving equations (`solve|solution|equation|value of [a-z]\b`), Expressions (`expression|simplif|expand|factoris|substitut|like terms|evaluate`), Patterns & sequences (`pattern|sequence|term|rule`), fallback Algebra problems.
  - `geometry_measurement`: Measuring & units for temperature first (`°C|temperature|thermometer`), Time (clock/calendar diagram, `time|clock|o'?clock|minutes?|hours?|\bam\b|\bpm\b|24-hour|timetable|calendar|leaves at|arrives`), Pythagoras & trigonometry (`pythagoras|hypotenuse|\bsin|\bcos|\btan|trigonometr|similar|congruent`), Area & perimeter (`area|perimeter|cm²|m²|km²|distance around`), Volume & capacity (`volume|capacity|cm³|m³|litre|mL\b|\bL\b`), Angles (`angle|degrees|°|protractor|acute|obtuse|reflex|bearing`), Symmetry & transformations (`reflect|rotat|turn|flip|translat|slide|symmetr|enlarge`), Maps & position (grid_map diagram, `map|north|south|east|west|grid reference|coordinates?|direction|compass`), 3D objects (net/solid diagram, `prism|pyramid|cylinder|cone|sphere|cube|faces|edges|vertices|net\b`), 2D shapes (`triangle|quadrilateral|polygon|parallel|perpendicular|rhombus|trapezium|pentagon|hexagon|circle|radius|diameter|shape`), Measuring & units (`kg|grams?|mass|heav|weigh|cm\b|mm\b|km\b|metres?|length|long|tall|height|width|convert`), fallback Measurement problems.
  - `statistics_probability`: Chance & probability (spinner/venn diagram, `chance|probab|likely|certain|impossible|random|spinner|dice|coin|counter|bag|expect`), Mean, median & mode (`mean|median|mode|range|average|most common|quartile|outlier`), Displaying data (option_diagrams, or `which (graph|chart|plot|table) (shows|best)`), Reading graphs & data (chart diagrams, `graph|chart|table|plot|tally|survey|data|key`), fallback Statistics problems.
- **English (`grammar_punctuation`, `vocabulary`)** — area = skill: `spelling` Spelling (`spel+t|spelled|spelling`), `punctuation` Punctuation (`punctuat|apostrophe|comma|capital letter|question mark|full stop|exclamation|quotation|speech marks|colon|dash|hyphen`), `vocabulary` Vocabulary (topic `vocabulary`, or `means the same|synonym|antonym|opposite|prefix|suffix|meaning|closest in meaning`), `grammar` Grammar (the rest). Order in reports: spelling, grammar, punctuation, vocabulary.
- **Reading** — area = skill: `word_meaning` Word meaning (`what does .* mean|meaning of|closest in meaning|the word ["“‘']|phrase ["“‘']`), `purpose` Purpose & author's craft (`purpose|main idea|mainly about|aimed at|audience|the (writer|author)|text type|organised|heading|title|structure|persuade|convince|mood|tone|technique`), `inferring` Inferring (`infer|suggest|conclude|most likely|probably|what can you tell|shows? (that|about)|feel|felt|imply|might happen`), `finding` Finding information (the rest).
- **Science and VCE** — area = topic, skill = topic label.

- [ ] **Step 1: failing test** `scripts/tests/diagnostic-areas.test.mjs`:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { QUESTION_BANK } from '../../src/lib/questions/bank.ts'
import { classify, areasFor, subjectOfTopic } from '../../src/lib/diagnostic/areas.ts'

test('every question classifies into an area of its subject', () => {
  for (const q of QUESTION_BANK) {
    const c = classify(q)
    const ids = areasFor(subjectOfTopic(q.topic), q.year_level).map(a => a.id)
    assert.ok(ids.includes(c.area.id), `${q.id} → ${c.area.id} not in ${ids}`)
    assert.ok(c.skill.length > 0)
  }
})
test('English splits into the four conventions at every year', () => {
  for (const y of ['grade_3','grade_4','grade_5','grade_6','year_7','year_8','year_9','year_10']) {
    const seen = new Set(QUESTION_BANK.filter(q => q.year_level === y && subjectOfTopic(q.topic) === 'english').map(q => classify(q).area.id))
    for (const a of ['spelling','grammar','punctuation','vocabulary']) assert.ok(seen.has(a), `${y} has no ${a}`)
  }
})
test('spot checks', () => {
  const find = t => QUESTION_BANK.find(q => q.question_text.startsWith(t))
  assert.equal(classify(find('One word in this sentence is spelt incorrectly')).area.id, 'spelling')
  assert.equal(classify(find('What is the antonym (opposite) of')).area.id, 'vocabulary')
})
```
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3: implement** `areas.ts` with a rule table `{ id?, skill, diagrams?: string[], re?: RegExp, test?: (q) => boolean }[]` per topic/subject and `TOPICS` for labels (`import { TOPICS } from '../curriculum.ts'`).
- [ ] **Step 4:** write `scripts/diagnostic-audit.mjs` — prints, per (year, subject, area, skill), the count and two sample stems. Run it; read the samples; tighten rules where a sample is misfiled; re-run until the samples read right.
- [ ] **Step 5:** `npm test` → PASS. Commit `feat(diagnostic): classify questions into areas and skills`.

### Task 3: Blueprint and selection

**Files:** Create `src/lib/diagnostic/blueprint.ts`, `src/lib/diagnostic/select.ts`; Test `scripts/tests/diagnostic-select.test.mjs`.

**Interfaces — Produces:**
```ts
// blueprint.ts
export interface OfferedTest { year: YearLevel; subject: SubjectSlug; questions: number; minutes: number }
export function isScreenable(q: BankQuestion): boolean  // MC or short_answer; no extended_response/long_form; stimulus only for reading
export function screenablePool(bank: readonly BankQuestion[], year: YearLevel, subject: SubjectSlug): BankQuestion[]
export function testSpec(bank: readonly BankQuestion[], year: YearLevel, subject: SubjectSlug): TestSpec | null
export function offeredTests(bank: readonly BankQuestion[]): OfferedTest[]
// select.ts
export function selectTest(bank: readonly BankQuestion[], spec: TestSpec, seed: number, exclude?: ReadonlySet<string>): string[]
export function selectReading(bank: readonly BankQuestion[], year: YearLevel, seed: number, prefer?: ReadonlySet<string>): string[]
```
Allocations: Maths Gr 3–6 `number_operations 8, number_patterns 4, geometry_measurement 7, statistics_probability 5` (25 min); Yr 7–10 `number_operations 7, algebra_equations 7, geometry_measurement 8, statistics_probability 6` (30 min); English `spelling 6, grammar 5, punctuation 5, vocabulary 4` (15 min); Science `4/4/4` (12 min, Gr 6, Yr 8, Yr 10 only); VCE: `target = areas ≥ 6 ? 24 : 20`, equal split, min 3, minutes `round(total × 1.5)`; Reading: two texts, ≤ 7 questions each (20 min). `fitAllocation` clamps each area to what the pool holds and moves the shortfall to areas with spare, in area order; a test is offered only when every area gets ≥ 2 (VCE ≥ 3) and the total ≥ 80% of target.

Selection per area: group the area's pool by skill; shuffle skills and each group with `mulberry32(seed ^ hashSeed(area))`; build difficulty targets spread across the ranks present (`foundation 0 … advanced 3`); round-robin over skills, taking from each the question nearest the next target. Then order all picks by (difficulty rank, random key) so the test starts easy and areas interleave.

Reading: candidate texts = `stimulus_id` groups at the year with ≥ 4 screenable questions; prefer ids in `prefer` (the free Reading paper's texts); choose two distinct texts at random; up to 7 questions each, in bank order; output grouped by text.

- [ ] **Step 1: failing test**:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { QUESTION_BANK } from '../../src/lib/questions/bank.ts'
import { offeredTests, testSpec, screenablePool } from '../../src/lib/diagnostic/blueprint.ts'
import { selectTest, selectReading } from '../../src/lib/diagnostic/select.ts'
import { classify } from '../../src/lib/diagnostic/areas.ts'

const byId = new Map(QUESTION_BANK.map(q => [q.id, q]))
const offered = offeredTests(QUESTION_BANK)

test('the tests the owner expects are offered', () => {
  const has = (y, s) => offered.some(o => o.year === y && o.subject === s)
  for (const y of ['grade_3','grade_5','year_7','year_9','year_10']) { assert.ok(has(y, 'math')); assert.ok(has(y, 'english')); assert.ok(has(y, 'reading')) }
  for (const y of ['grade_6','year_8','year_10']) assert.ok(has(y, 'science'))
  assert.ok(!has('grade_3', 'science'))
  for (const s of ['maths_methods','general_maths','specialist_maths','physics']) assert.ok(has('year_12', s))
  assert.ok(has('year_11', 'chemistry'))
})
test('every offered test fills its blueprint with distinct screenable questions', () => {
  for (const o of offered.filter(o => o.subject !== 'reading')) {
    const spec = testSpec(QUESTION_BANK, o.year, o.subject)
    for (let seed = 1; seed <= 10; seed++) {
      const ids = selectTest(QUESTION_BANK, spec, seed)
      assert.equal(new Set(ids).size, ids.length)
      assert.equal(ids.length, spec.allocation.reduce((n, a) => n + a.count, 0))
      const counts = {}
      for (const id of ids) { const q = byId.get(id); assert.equal(q.year_level, o.year); const a = classify(q).area.id; counts[a] = (counts[a] ?? 0) + 1 }
      for (const a of spec.allocation) assert.equal(counts[a.area] ?? 0, a.count, `${o.year} ${o.subject} ${a.area}`)
    }
    assert.deepEqual(selectTest(QUESTION_BANK, spec, 5), selectTest(QUESTION_BANK, spec, 5))
  }
})
test('reading picks two texts', () => {
  for (const y of ['grade_3','grade_4','year_9']) {
    const ids = selectReading(QUESTION_BANK, y, 3)
    const texts = new Set(ids.map(id => byId.get(id).stimulus_id))
    assert.equal(texts.size, 2)
    assert.ok(ids.length >= 8 && ids.length <= 14)
  }
})
```
- [ ] **Step 2:** FAIL. **Step 3:** implement. **Step 4:** PASS. **Step 5:** commit `feat(diagnostic): blueprints and question selection`.

### Task 4: Scoring and the report model

**Files:** Create `src/lib/diagnostic/score.ts`; Test `scripts/tests/diagnostic-score.test.mjs`.

**Interfaces — Produces:**
```ts
export function levelFor(pct: number): Level                   // ≥75 strength, ≥50 developing, else focus
export function isCorrect(q: BankQuestion, a: Answer): boolean  // MC index match; short answer via matchShortAnswer; null false
export function buildReport(byId: ReadonlyMap<string, BankQuestion>, year: YearLevel, subject: SubjectSlug, responses: readonly Response[]): DiagnosticReport
export interface Headline { name: string | null; year: YearLevel; subject: SubjectSlug; correct: number; total: number; pct: number; areas: Omit<AreaResult, 'skills'>[]; summary: string }
export function headlineOf(report: DiagnosticReport, name: string | null): Headline
export function summarySentence(report: DiagnosticReport, name: string | null): string
```
Areas sorted weakest first (pct asc, then total desc); skills in first-seen order. Unknown ids are skipped. `summarySentence`: "Mia answered 17 of 24 questions correctly. Strengths: A and B. The area to focus on is C." with the all-strength and no-focus variants from the spec.

- [ ] Steps: failing test covering thresholds (74→developing, 75→strength, 49→focus), MC/short-answer/null grading, report totals, area ordering, and the three summary variants → implement → PASS → commit `feat(diagnostic): grading and report model`.

### Task 5: Tailored exam composition

**Files:** Create `src/lib/diagnostic/tailor.ts`; Test `scripts/tests/diagnostic-tailor.test.mjs`.

**Interfaces — Produces:**
```ts
export interface TailoredSection { title: string; time_minutes: number; calculator_allowed?: boolean; restart_numbering?: boolean; instructions?: string[]; question_ids: string[] }
export interface FocusLine { area: string; label: string; level: Level; questions: number }
export interface TailoredExam { id: string; subject: SubjectSlug; yearLevel: YearLevel; title: string; sections: TailoredSection[]; reading_minutes?: number; formula_sheet?: string; focus: FocusLine[]; secondChance: number }
export function tailoredExamId(resultId: string): string        // `tailored-${resultId}`
export function composeTailoredExam(bank: readonly BankQuestion[], input: { resultId: string; report: DiagnosticReport; childName: string | null }): TailoredExam
```
Rules (spec "The tailored exam"): need `1 − pct/100`, weight `0.2 + need`; new-question count by subject (Maths Gr 3–6 30, Yr 7–10 32, English 30, Science 18, Reading three texts, VCE MC 15 + 3 extended response for Year 12, MC 16 + 2 long-answer for Year 11) minus the second chance; each area ≥ 2 if available; difficulty targets focus `[0,1,1,2]`, developing `[1,2,2,3]`, strength `[2,3,3,2]`; wrong skills first in focus areas; exclude every diagnostic question except the ≤ 5 wrong ones in the "Second chance" section; Yr 7–10 Maths splits non-calculator / calculator by `calculator_allowed`; VCE adds `reading_minutes: 15`, `formula_sheet` for `specialist_maths`/`physics`, `restart_numbering`; section instructions name the focus area ranges; seeded by `hashSeed(resultId)`.

- [ ] Steps: failing test — for every offered test, simulate a report from a selection with alternating right/wrong answers, compose, and assert: ids exist and are unique; no diagnostic id outside the second-chance section; second chance ≤ 5 and only wrong ids; focus areas hold more questions than strengths; same input → same exam; section question counts > 0 → implement → PASS → commit `feat(diagnostic): tailored exam composition`.

### Task 6: Signed tokens and receipts

**Files:** Create `src/lib/diagnostic/token.ts`; Test `scripts/tests/diagnostic-token.test.mjs`.

**Interfaces — Produces:**
```ts
export interface TestClaims { v: 1; y: YearLevel; s: SubjectSlug; q: string[]; n: string | null; t: number; r: string }
export interface ReceiptClaims extends TestClaims { a: Answer[]; d: number }
export const TEST_TTL_MS = 7 * 86_400_000
export const RECEIPT_TTL_MS = 30 * 86_400_000
export function signClaims(claims: object, key: string): string                 // base64url(JSON) + '.' + base64url(HMAC-SHA256)
export function verifyClaims<T>(token: string, key: string): T | null           // null on bad shape, bad signature
export function deriveKey(secret: string): string                               // HMAC(secret, 'prepnest-diagnostic-v1') hex
export function diagnosticKey(): string | null                                  // from SUPABASE_SERVICE_ROLE_KEY
export function isFresh(issuedAt: number, ttl: number, now?: number): boolean
export function cleanName(raw: unknown): string | null                          // trim, strip control chars, ≤ 40, else null
```
- [ ] Steps: failing test (round trip, one flipped character → null, wrong key → null, freshness boundaries, cleanName) → implement with `node:crypto` (`createHmac`, `timingSafeEqual`) → PASS → commit `feat(diagnostic): signed test tokens and receipts`.

### Task 7: Parent guidance content

**Files:** Create `src/lib/diagnostic/guidance.ts`; Test `scripts/tests/diagnostic-guidance.test.mjs`.

**Interfaces — Produces:**
```ts
export interface Guidance { covers: string; tips: [string, string, string] }
export function guidanceFor(subject: SubjectSlug, year: YearLevel, area: string): Guidance
```
Bands: primary (Gr 3–6), secondary (Yr 7–10), VCE. Entries for every area `areasFor` can return. Tips are concrete things a parent can do at home without teaching the maths themselves (cooking, shopping, timetables, reading together, asking them to explain a worked solution, timed multiple-choice blocks, the formula sheet).

- [ ] Steps: failing test (every offered test's areas have guidance with non-empty text; no "practise", "buy", "refund" in any string) → write content → PASS → commit `content(diagnostic): guidance for parents by area`.

### Task 8: Questions on screen — HTML renderer

**Files:** Create `src/lib/web/pdfToHtml.ts`, `src/lib/web/mathHtml.ts`, `src/lib/web/questionHtml.tsx`, `src/lib/questions/answerUnit.ts`, `src/app/api/dev/diagrams-web/route.tsx`; Modify `src/lib/pdf/ExamPaperDocument.tsx` (import `answerUnit`); Test `scripts/tests/pdfToHtml.test.mjs`.

**Interfaces — Produces:**
```ts
// pdfToHtml.ts
export function pdfToHtml(node: unknown): string
// mathHtml.ts
export function mathSvg(tex: string, display: boolean): string
export function richHtml(text: string): string          // escapes, \n → <br>, \( \) and \[ \] → SVG
// answerUnit.ts
export function answerUnit(expected: string): { prefix?: string; suffix?: string }
// questionHtml.tsx
export interface ScreenQuestion { id: string; n: number; kind: 'choice' | 'text'; stem: string; diagram?: string; options?: string[]; optionDiagrams?: string[]; optionHeaders?: string[]; unit?: { prefix?: string; suffix?: string }; calculator?: boolean; textId?: string }
export function toScreenQuestion(q: BankQuestion, n: number): ScreenQuestion
```
`pdfToHtml` walks elements: functions are called with props (the diagram components use no hooks); `memo`/`forwardRef` unwrapped; Fragment → children; react-pdf primitives map to `svg g line rect circle ellipse polygon polyline path defs stop clipPath linearGradient radialGradient tspan`; `TEXT` → `<text>` inside SVG, `<span>` inside text, `<div>` otherwise; `VIEW` → `<div style="display:flex;flex-direction:column;…">`; react-pdf-only props dropped (`wrap fixed debug break minPresenceAhead orphans widows`); SVG camelCase attributes → kebab-case except true camelCase SVG attributes (`viewBox`, `preserveAspectRatio`, gradient/pattern units, `refX/refY`, `textLength`…); style objects → CSS (numbers → px except unitless keys; `marginHorizontal/Vertical`, `paddingHorizontal/Vertical` expanded; `DejaVuSans`/`Helvetica` → the site font stack); `<svg>` gets `xmlns` and `style="max-width:100%;height:auto"`; all text and attribute values HTML-escaped.

- [ ] Step 1: failing unit test with hand-built elements (`React.createElement('SVG', {width:10,height:10,viewBox:'0 0 10 10'}, React.createElement('LINE', {x1:0,y1:0,x2:10,y2:10,strokeWidth:2,strokeDasharray:'2,2'}), React.createElement('TEXT', {x:5,y:5,textAnchor:'middle'}, 'a<b'))`) asserting the exact markup, a VIEW/TEXT layout case, a function component, and escaping.
- [ ] Step 2–4: implement → PASS.
- [ ] Step 5: move `extractAnswerUnit` into `answerUnit.ts`, import it in `ExamPaperDocument.tsx`.
- [ ] Step 6: `mathHtml.ts` reads `@/lib/pdf/math/cache.json` (server-only), draws `<svg viewBox="0 -h w h+d" width="{w/1000·1.1}em" height="…em" style="vertical-align:-{d/1000·1.1}em">` with `<path d transform="matrix(sx 0 0 sy tx ty)">` and `<rect>` for rules; falls back to `texToPlain`.
- [ ] Step 7: `questionHtml.tsx` builds `ScreenQuestion` with `DiagramView` (fit 520) and option diagrams (fit 240, bare); never includes `correct_index`, `expected_answer`, `accepted_answers` or `explanation`.
- [ ] Step 8: dev route `/api/dev/diagrams-web` renders `GALLERY`, `GALLERY_OPTIONS`, `GALLERY_NET_OPTIONS` and a sample of TeX stems as an HTML page (localhost + non-production only). Open it and `/api/dev/diagrams` side by side; fix every visible difference (labels, fills, dashes, text anchors, layout Views).
- [ ] Step 9: commit `feat(web): draw paper diagrams and maths on screen`.

### Task 9: Tailored exam PDFs

**Files:** Modify `src/lib/pdf/resolveExam.ts`, `src/lib/pdf/ExamPaperDocument.tsx`, `src/lib/pdf/PreviewPages.tsx`, `src/lib/pdf/AnswerKeyDocument.tsx` (only if it needs the preview URL); Create `src/lib/diagnostic/load.ts` (the tailored exam as a `ResolvedExam`), `src/app/api/dev/diagnostic/route.tsx`.

**Interfaces — Produces:**
```ts
// resolveExam.ts
export function hydrateExam(exam: PracticeExam): ResolvedExam      // resolveExam(id) becomes find + hydrateExam; magazine texts attached as a plain-text Stimulus when the exam has no magazine_id
// ExamPaperDocument
export function ExamPaperDocument(props: { resolved: ResolvedExam; preview?: PreviewInfo; coverNote?: string[] })
// PreviewPages
export function PreviewEndPage(props: { info: PreviewInfo; examTitle: string; kind: 'paper' | 'answers'; url?: string })
// load.ts
export function tailoredAsPractice(exam: TailoredExam): PracticeExam
export function tailoredCoverNote(exam: TailoredExam, childName: string | null): string[]
```
- [ ] Steps: refactor `resolveExam` → `hydrateExam` with no behaviour change (render one catalogue paper before/after through `/api/dev/exam` and compare page count and text); add `coverNote` (printed under the title in a boxed "Built for …" panel) and the preview URL; dev route `/api/dev/diagnostic?year=&subject=&doc=report|paper|answers|preview&seed=` builds a sample result from a seeded selection with a fixed answer pattern and returns report JSON or the PDFs. Render a Grade 3 Maths, Year 9 Maths, Grade 5 English, Grade 4 Reading, Year 8 Science, Year 12 Specialist and Year 11 Chemistry tailored paper and answer key; read every page (cover note, sections, numbering, second chance, diagrams, maths). Commit `feat(pdf): tailored exam papers from a diagnostic`.

### Task 10: Database and saving

**Files:** Create `supabase/schema_diagnostics.sql`, `src/lib/diagnostic/save.ts`; Modify `scripts/check-live-schema.mjs`.

**Interfaces — Produces:**
```ts
// save.ts (server-only)
export type SaveOutcome = { ok: true; id: string } | { ok: false; status: number; error: string }
export async function saveResult(input: { userId: string; claims: TestClaims; answers: Answer[]; report: DiagnosticReport; receiptRef: string | null }): Promise<SaveOutcome>
```
SQL as in the spec, plus `create index diagnostic_results_user_idx on public.diagnostic_results (user_id, created_at desc)`; policies `diagnostic_results_select_own`, `diagnostic_results_select_linked` (`exists (select 1 from public.student_profiles sp where sp.id = diagnostic_results.user_id and sp.parent_id = auth.uid())`), `diagnostic_results_delete_own`; no insert/update policy. `saveResult` uses `createClient(url, serviceKey, { auth: { persistSession: false } })`; with a `receiptRef` it upserts `onConflict: 'receipt_ref', ignoreDuplicates: true` then reads the row by `receipt_ref` and returns 409 if it belongs to another user; errors are logged with `console.error('[diagnostic.save] …')` and returned, never swallowed; a missing table (`PGRST205` / `42P01`) returns 503 "not set up yet".

- [ ] Steps: write SQL; add the probe (`tableExists('diagnostic_results')`, file `schema_diagnostics.sql`); run `node scripts/check-live-schema.mjs` (expect "pending"); implement `save.ts`; type-check; commit `feat(diagnostic): results table and server-side saving`.

### Task 11: API routes and checkout

**Files:** Create `src/app/api/diagnostic/start/route.ts`, `submit/route.ts`, `claim/route.ts`, `[id]/exam/route.tsx`, `src/lib/diagnostic/access.ts`; Modify `src/app/api/checkout/route.ts`, `next.config.js` (trace pdfkit fonts for the new PDF route).

**Interfaces — Produces:**
```ts
// start: POST { year, subject, name? } → 200 { token, total, minutes, questions: ScreenQuestion[], texts?: Record<string, ReadingText> } | 400 | 503
// submit: POST { token, answers } → 200 { saved: true, id } | { saved: false, receipt, headline, saveError?: string } | 400 | 410 (expired)
// claim: POST { receipt } → 200 { id } | 401 | 400 | 409 | 410 | 503
// exam: GET ?doc=paper|answers → PDF | 401 | 404
// access.ts
export type TailoredAccess = { mode: 'full'; reason: 'plan' | 'admin' | 'purchased' } | { mode: 'preview'; purchase: 'plan' | 'vce' }
export function tailoredAccess(result: { id: string; year: YearLevel }, access: Access): TailoredAccess
// checkout: POST { tailoredId } → Stripe payment session, metadata { user_id, exam_id: 'tailored-<id>' }
```
- [ ] Steps: implement routes (all `runtime = 'nodejs'`, `Cache-Control: no-store`); validate every field; `submit` accepts answers only of the token's length with numbers inside the option range or strings ≤ 200 chars; the exam route loads the row with the user's client (RLS decides visibility), composes, gates with `tailoredAccess`, renders full or `previewOf`; checkout validates the row belongs to the user and is Year 11–12, refuses when already owned; commit `feat(diagnostic): start, submit, claim and exam routes`.

### Task 12: Landing and setup page

**Files:** Create `src/app/diagnostic/page.tsx`, `src/components/diagnostic/DiagnosticSetup.tsx`, `src/lib/diagnostic/storage.ts`.

**Interfaces — Produces:**
```ts
// storage.ts (client-safe)
export interface StoredTest { token: string; year: YearLevel; subject: SubjectSlug; name: string | null; total: number; minutes: number; questions: ScreenQuestion[]; texts?: Record<string, ReadingText>; answers: Answer[]; index: number; startedAt: number }
export interface StoredResult { receipt: string; headline: Headline; savedAt: number }
export function loadTest(): StoredTest | null; export function saveTest(t: StoredTest): void; export function clearTest(): void
export function loadResult(): StoredResult | null; export function saveResultLocal(r: StoredResult): void; export function clearResult(): void
```
Page: hero ("Find out exactly where your child needs help"), three facts (free, about 15–35 minutes, no account to start), the setup card, how it works (test → report → tailored exam → re-test), what parents get, FAQ (diagnostic category). Setup: grouped year tiles (`YearPicker` select mode), subject cards filtered to `offeredTests` for the year (label, questions, minutes), optional first name, "Start the test" → POST start → `saveTest` → `router.push('/diagnostic/test')`; resume banner when `loadTest()` exists; errors shown inline.

- [ ] Steps: build, run the dev server, check the page at 1280 px and 390 px, commit `feat(diagnostic): landing and setup`.

### Task 13: The test runner

**Files:** Create `src/app/diagnostic/test/page.tsx`, `src/components/diagnostic/DiagnosticRunner.tsx`, `src/components/diagnostic/QuestionView.tsx`.

Behaviour: intro screen for the parent ("hand the device to Mia") → one question per screen (stem HTML, diagram HTML, options as large buttons or option-diagram tiles or an option table, or a text input with unit prefix/suffix; a calculator chip for Yr 7–10 Maths) → Back / I'm not sure / Next → review grid (answered, skipped; jump to any) → submit (POST submit) → saved: `clearTest()` and go to `/diagnostic/report/<id>`; not saved: `saveResultLocal` and go to `/diagnostic/results`; network or 5xx errors keep the answers and show a retry. Reading shows the text beside the questions on wide screens and as a "Read the text" / "Questions" toggle on phones, using `ReadingTextView`. Answers persist to storage on every change. `noindex`.

- [ ] Steps: build, run full anonymous tests for Maths Gr 3, Maths Yr 9, English Gr 5, Reading Gr 4, Science Yr 8, Specialist Yr 12 in the browser (desktop and phone width); commit `feat(diagnostic): the on-screen test`.

### Task 14: Anonymous results and claiming

**Files:** Create `src/app/diagnostic/results/page.tsx`, `src/components/diagnostic/DiagnosticResults.tsx`, `HeadlineResults.tsx`, `LevelChip.tsx`, `AreaBar.tsx`; Modify `src/app/auth/register/page.tsx` (`?role=parent` preselects Parent).

Behaviour: signed out → the headline (score ring, summary sentence, every area with level chip and bar) and an unlock card listing what the free account adds (skills to work on, how to help at home, every answer explained, the tailored exam) with "Create a free parent account" (`/auth/register?role=parent&next=/diagnostic/results`) and "Sign in" (`/auth/login?next=/diagnostic/results`); signed in → POST claim automatically, then `clearResult()` and go to the report; claim errors are shown with retry; no stored result → "no results on this device" and a start link.

- [ ] Steps: build; check signed-out rendering in the browser; commit `feat(diagnostic): headline results and saving to an account`.

### Task 15: The full report and marking

**Files:** Create `src/app/diagnostic/report/[id]/page.tsx`, `src/components/diagnostic/report/{ReportSummary,TailoredExamCard,AreaCard,QuestionReview,NextSteps}.tsx`, `src/app/diagnostic/report/[id]/mark/page.tsx`; Modify `src/components/practice/PaperMarking.tsx` (optional `saveUrl`; no saving when absent).

Behaviour: signed-out → redirect to `/auth/login?next=…`; row not visible → 404. Sections in order: header, summary (strengths / developing / focus), tailored exam card (focus lines; download paper + answer key when full; preview downloads + plan link or VCE `CheckoutButton` `{ tailoredId }` otherwise; "Mark it on screen" link), area cards weakest first (level, score, skills ✓/✗, covers, three tips, free-practice link `/practice?subject=&grade=&topics=` for topic-based areas), question review in `<details>` per area (stem, options with the child's and the correct answer marked, explanation via `richHtml`), next steps, snapshot disclaimer. `?purchased=1` shows a banner while the webhook lands. Print-friendly (`print:hidden` on nav and buttons).

- [ ] Steps: build; render the report through the dev sample (Task 9 dev route supplies the data to a dev-only page variant or the same components) at 1280 px and 390 px; commit `feat(diagnostic): the full report and marking the tailored exam`.

### Task 16: Dashboards

**Files:** Modify `src/app/parent/page.tsx`, `src/components/home/StudentDashboardTabs.tsx` (link), `src/app/page.tsx` (guardian welcome gains a diagnostic link).

Behaviour: the parent dashboard lists diagnostics (own + linked students'), newest first: child name or "Your child", year and subject, date, score, focus areas, link to the report; an empty state invites the first test; a failed read shows `DataLoadError` rather than an empty list. A parent with no linked child still sees their diagnostics (the page currently returns early with the invite card).

- [ ] Steps: implement; type-check; commit `feat(diagnostic): diagnostics on the dashboards`.

### Task 17: Site — homepage, navigation, pages, copy

**Files:** Modify `src/components/home/MarketingHome.tsx`, `src/components/layout/Navbar.tsx`, `src/app/naplan/page.tsx`, `src/app/vce/page.tsx`, `src/app/pricing/page.tsx`, `src/app/help/page.tsx`, `src/lib/faqs.ts`, `src/app/privacy/page.tsx`, `src/app/sitemap.ts`, `src/lib/releases.ts`; Create `src/components/diagnostic/SampleReport.tsx`, `src/components/diagnostic/DiagnosticCta.tsx`.

- Homepage hero: eyebrow "For parents · NAPLAN, school years & VCE"; headline "Find out exactly where your child needs help."; lead about the free diagnostic and the tailored exam; primary "Start the free diagnostic test" → `/diagnostic`, secondary "Browse practice papers"; checks "Free test and report", "About 20 minutes", "No card needed"; `SampleReport` (real components, sample data, labelled "Sample report") beside it.
- "How it works" becomes the four diagnostic steps; the old paper loop moves under "Prefer to start with a paper?".
- Navbar: "Diagnostic test" first; header button "Free diagnostic test".
- NAPLAN/VCE/help: `DiagnosticCta`. Pricing: tailored exam in plan features and VCE line.
- FAQs: new `diagnostic` category (how long, what it tests, is it free, what the tailored exam is, can it be retaken, what we store); homepage shows two of them.
- Privacy: diagnostic answers and optional first name stored with the account.
- Sitemap `/diagnostic`; releases: a feature entry dated 2026-09-26 if the type allows non-paper releases (otherwise leave).

- [ ] Steps: implement; check copy rules with `grep -rn "practis\|\bbuy\b\|refund" src/components/diagnostic src/app/diagnostic src/lib/diagnostic`; view `/`, `/diagnostic`, `/pricing` at 1280 and 390 px; commit `feat(site): lead with the free diagnostic test`.

### Task 18: Verification, push, PR

- [ ] `npm test`, `npm run type-check`, `npm run lint`, `npm run verify-bank`, `npm run gen` (no diff), stop the dev server, `npm run build`.
- [ ] Browser: full anonymous journey on the dev server (setup → test → results → sign-up link) for three subjects; screenshots of the test, headline and report (dev sample) at desktop and phone width; console free of errors.
- [ ] `git fetch`, merge `origin/main` if it moved, push `feat/diagnostic`, open the PR with the migration step first in the description, and hand over what only the owner can do (run `schema_diagnostics.sql`, try the signed-in path, merge).
