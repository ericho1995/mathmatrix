import type { Difficulty, Question, SubjectSlug, TopicSlug, YearLevel } from '../../types'

// ─────────────────────────────────────────────────────────────────────────────
// The diagnostic test's vocabulary.
//
// A test is sat in one subject at one year level. Its questions are grouped
// into *areas* — what a parent recognises as a part of the subject, such as
// "Geometry & Measurement" or "Spelling" — and each question tests one
// *skill* inside its area, such as "Time" or "Fractions". The report is built
// area by area, weakest first, naming the skills answered right and wrong.
//
// Everything under src/lib/diagnostic takes the question bank as a parameter
// and imports only types from '@/…', so `node --test` can load it without
// Next.js (see scripts/tests/diagnostic-*.test.mjs).
// ─────────────────────────────────────────────────────────────────────────────

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

/** A question as bank.ts stores it (the bank has no created_at). */
export type BankQuestion = DistributiveOmit<Question, 'created_at'>

/** How an area went: 75% or more, 50–74%, or under 50%. */
export type Level = 'strength' | 'developing' | 'focus'

export interface AreaDef {
  id: string
  label: string
}

export interface Classified {
  area: AreaDef
  /** The specific skill a question tests, e.g. "Fractions". */
  skill: string
}

export interface Allocation {
  area: string
  count: number
}

/** What one test is made of. */
export interface TestSpec {
  year: YearLevel
  subject: SubjectSlug
  /** Questions per area, in report order. Reading allocates texts instead. */
  allocation: Allocation[]
  minutes: number
  /** Reading only: how many texts the test uses. */
  texts?: number
}

/** A chosen option's index, a typed answer, or null for "I'm not sure". */
export type Answer = number | string | null

export interface Response {
  id: string
  a: Answer
}

export interface GradedItem {
  id: string
  topic: TopicSlug
  area: AreaDef
  skill: string
  difficulty: Difficulty
  answer: Answer
  correct: boolean
}

export interface SkillResult {
  label: string
  correct: number
  total: number
}

export interface AreaResult {
  id: string
  label: string
  correct: number
  total: number
  /** Whole-number percentage. */
  pct: number
  level: Level
  skills: SkillResult[]
}

export interface DiagnosticReport {
  year: YearLevel
  subject: SubjectSlug
  correct: number
  total: number
  pct: number
  /** Weakest first. */
  areas: AreaResult[]
  /** In the order the questions were asked. */
  items: GradedItem[]
}
