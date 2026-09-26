import type { SubjectSlug, YearLevel } from '../../types'
import type { Allocation, BankQuestion, TestSpec } from './types.ts'
import { areasFor, classify, subjectOfTopic } from './areas.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Which diagnostic tests exist, and what each is made of.
//
// A test is only offered when the bank can fill it with questions the screen
// shows exactly: multiple choice or a typed answer, with or without a diagram.
// Extended-response and long-answer questions need a person to mark them, and
// reading texts only make sense in Reading. The lengths come from the design
// (docs/superpowers/specs/2026-09-26-diagnostic-journey-design.md): long enough
// to see every area at a few difficulties, short enough to sit in one go.
// ─────────────────────────────────────────────────────────────────────────────

export interface OfferedTest {
  year: YearLevel
  subject: SubjectSlug
  /** Questions in the test (Reading: typical, since texts vary). */
  questions: number
  minutes: number
}

const YEARS: YearLevel[] = ['grade_3', 'grade_4', 'grade_5', 'grade_6', 'year_7', 'year_8', 'year_9', 'year_10', 'year_11', 'year_12']
const PRIMARY = new Set<YearLevel>(['grade_3', 'grade_4', 'grade_5', 'grade_6'])
const VCE = new Set<YearLevel>(['year_11', 'year_12'])
/** The catalogue offers Science only in these years (owner's decision, 2026-09-24). */
const SCIENCE_YEARS = new Set<YearLevel>(['grade_6', 'year_8', 'year_10'])

const SCHOOL_SUBJECTS: SubjectSlug[] = ['math', 'english', 'reading', 'science']
const VCE_SUBJECTS: SubjectSlug[] = ['maths_methods', 'specialist_maths', 'general_maths', 'physics', 'chemistry']

const MATH_PRIMARY: Allocation[] = [
  { area: 'number_operations', count: 8 },
  { area: 'number_patterns', count: 4 },
  { area: 'geometry_measurement', count: 7 },
  { area: 'statistics_probability', count: 5 },
]
const MATH_SECONDARY: Allocation[] = [
  { area: 'number_operations', count: 7 },
  { area: 'algebra_equations', count: 7 },
  { area: 'geometry_measurement', count: 8 },
  { area: 'statistics_probability', count: 6 },
]
const ENGLISH: Allocation[] = [
  { area: 'spelling', count: 6 },
  { area: 'grammar', count: 5 },
  { area: 'punctuation', count: 5 },
  { area: 'vocabulary', count: 4 },
]
const SCIENCE: Allocation[] = [
  { area: 'life_science', count: 4 },
  { area: 'physical_science', count: 4 },
  { area: 'earth_space', count: 4 },
]

/** Reading uses two texts and at most this many questions on each. */
export const READING_TEXTS = 2
export const READING_MAX_PER_TEXT = 7
const READING_MIN_PER_TEXT = 4

/** Whether the on-screen test can show and mark this question exactly. */
export function isScreenable(q: BankQuestion): boolean {
  const format = q.format ?? 'multiple_choice'
  if (format === 'multiple_choice') {
    if (!('options' in q) || !q.options || q.options.length < 2 || typeof q.correct_index !== 'number') return false
  } else if (format !== 'short_answer') {
    return false
  }
  if (q.stimulus_id) return subjectOfTopic(q.topic) === 'reading'
  return true
}

/** Every question a test in this subject and year may use. */
export function screenablePool(bank: readonly BankQuestion[], year: YearLevel, subject: SubjectSlug): BankQuestion[] {
  return bank.filter(q => q.year_level === year && subjectOfTopic(q.topic) === subject && isScreenable(q))
}

/** Reading questions grouped by the text they are about, in bank (paper) order. */
export function readingTexts(bank: readonly BankQuestion[], year: YearLevel): { id: string; questions: BankQuestion[] }[] {
  const groups = new Map<string, BankQuestion[]>()
  for (const q of screenablePool(bank, year, 'reading')) {
    if (!q.stimulus_id) continue
    const list = groups.get(q.stimulus_id) ?? []
    list.push(q)
    groups.set(q.stimulus_id, list)
  }
  return Array.from(groups, ([id, questions]) => ({ id, questions })).filter(g => g.questions.length >= READING_MIN_PER_TEXT)
}

/**
 * Clamps each area to what the pool holds, then hands the shortfall to areas
 * with questions to spare, in area order, so a thin area does not shorten the
 * whole test.
 */
function fitAllocation(target: readonly Allocation[], available: ReadonlyMap<string, number>): Allocation[] {
  const alloc = target.map(a => ({ area: a.area, count: Math.min(a.count, available.get(a.area) ?? 0) }))
  let short = target.reduce((n, a) => n + a.count, 0) - alloc.reduce((n, a) => n + a.count, 0)
  while (short > 0) {
    let moved = false
    for (const a of alloc) {
      if (short === 0) break
      if ((available.get(a.area) ?? 0) > a.count) {
        a.count++
        short--
        moved = true
      }
    }
    if (!moved) break
  }
  return alloc.filter(a => a.count > 0)
}

function vceTarget(areas: readonly string[]): Allocation[] {
  const total = areas.length >= 6 ? 24 : 20
  const each = Math.floor(total / areas.length)
  let extra = total - each * areas.length
  return areas.map(area => ({ area, count: each + (extra-- > 0 ? 1 : 0) }))
}

function subjectsFor(year: YearLevel): SubjectSlug[] {
  if (VCE.has(year)) return VCE_SUBJECTS
  return SCHOOL_SUBJECTS.filter(s => s !== 'science' || SCIENCE_YEARS.has(year))
}

/** What the test for this subject and year is made of, or null when it is not offered. */
export function testSpec(bank: readonly BankQuestion[], year: YearLevel, subject: SubjectSlug): TestSpec | null {
  if (!subjectsFor(year).includes(subject)) return null

  if (subject === 'reading') {
    return readingTexts(bank, year).length >= READING_TEXTS ? { year, subject, allocation: [], minutes: 20, texts: READING_TEXTS } : null
  }

  const available = new Map<string, number>()
  for (const q of screenablePool(bank, year, subject)) {
    const area = classify(q).area.id
    available.set(area, (available.get(area) ?? 0) + 1)
  }

  const vce = VCE.has(year)
  let target: Allocation[]
  if (subject === 'math') target = PRIMARY.has(year) ? MATH_PRIMARY : MATH_SECONDARY
  else if (subject === 'english') target = ENGLISH
  else if (subject === 'science') target = SCIENCE
  else target = vceTarget(areasFor(subject, year).map(a => a.id).filter(id => (available.get(id) ?? 0) > 0))
  if (!target.length) return null

  const allocation = fitAllocation(target, available)
  const wanted = target.reduce((n, a) => n + a.count, 0)
  const got = allocation.reduce((n, a) => n + a.count, 0)
  const min = vce ? 3 : 2
  // Every area the test sets out to cover must be covered properly.
  if (target.some(t => (allocation.find(a => a.area === t.area)?.count ?? 0) < min)) return null
  if (got < wanted * 0.8) return null

  const minutes = vce ? Math.round(got * 1.5) : subject === 'math' ? (PRIMARY.has(year) ? 25 : 30) : subject === 'english' ? 15 : 12
  return { year, subject, allocation, minutes }
}

/** Every test the site offers, in year then subject order. */
export function offeredTests(bank: readonly BankQuestion[]): OfferedTest[] {
  const out: OfferedTest[] = []
  for (const year of YEARS) {
    for (const subject of subjectsFor(year)) {
      const spec = testSpec(bank, year, subject)
      if (!spec) continue
      const questions =
        subject === 'reading'
          ? typicalReadingLength(bank, year)
          : spec.allocation.reduce((n, a) => n + a.count, 0)
      out.push({ year, subject, questions, minutes: spec.minutes })
    }
  }
  return out
}

function typicalReadingLength(bank: readonly BankQuestion[], year: YearLevel): number {
  const sizes = readingTexts(bank, year)
    .map(t => Math.min(t.questions.length, READING_MAX_PER_TEXT))
    .sort((a, b) => a - b)
  return sizes[Math.floor(sizes.length / 2)] * READING_TEXTS
}
