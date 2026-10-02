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

/**
 * One answer, with what the screen saw while it was given. The extra signals
 * are optional: a result saved before they existed, or a paper marked by hand,
 * has none, and is scored on the answers alone.
 */
export interface Response {
  id: string
  a: Answer
  /** Time spent on the question, in milliseconds. */
  ms?: number
  /** How many times the answer was changed after it was first given. */
  ch?: number
  /** The child said this one was a guess. */
  g?: boolean
  /** Asked in the second part of the test, to double-check the first. */
  f?: boolean
}

/**
 * How much the evidence supports a call.
 * - `clear`  — enough questions, and they point the same way
 * - `likely` — probably right; a few more questions would settle it
 * - `early`  — too few questions, or too close to a boundary, to rely on
 */
export type Confidence = 'clear' | 'likely' | 'early'

export interface GradedItem {
  id: string
  topic: TopicSlug
  area: AreaDef
  skill: string
  difficulty: Difficulty
  answer: Answer
  correct: boolean
  /** The child said this one was a guess. */
  guessed: boolean
  /** Answered too fast to have read the question. */
  rapid: boolean
  /**
   * Whether the answer is used as evidence. A lucky guess says nothing about
   * what the child knows, and neither does an answer given in two seconds, so
   * both count towards the score but not towards a level.
   */
  counted: boolean
  ms: number | null
  changes: number
  followUp: boolean
}

/**
 * What the answers say about one skill.
 * - `secure`    — asked at least twice, right nearly every time
 * - `gap`       — asked at least twice, wrong nearly every time
 * - `mixed`     — asked at least twice, some right and some wrong
 * - `one_right` — asked once, answered correctly
 * - `one_miss`  — asked once, answered incorrectly: could be a slip
 */
export type SkillState = 'secure' | 'gap' | 'mixed' | 'one_right' | 'one_miss'

export interface SkillResult {
  label: string
  correct: number
  total: number
  state: SkillState
}

export interface AreaResult {
  id: string
  label: string
  /** Every question asked and every one answered correctly. */
  correct: number
  total: number
  /** The answers used as evidence: `total` less lucky guesses and rapid answers. */
  evidence: number
  /** Correct answers among the evidence. */
  secure: number
  /** Whole-number percentage of the evidence answered correctly. */
  pct: number
  level: Level
  confidence: Confidence
  /** The chance, 0–100, that the area really sits in this level given the evidence. */
  certainty: number
  skipped: number
  /** Median seconds per question, when the screen timed them. */
  seconds: number | null
  skills: SkillResult[]
}

/**
 * Something about the sitting that weakens its result.
 * - `rushed`       — many answers given too fast to have read the question
 * - `ran_out`      — the last questions were left unanswered
 * - `many_skips`   — a large share skipped throughout
 * - `many_guesses` — a large share marked as guesses
 */
export type QualityFlag = 'rushed' | 'ran_out' | 'many_skips' | 'many_guesses'

/** How the sitting itself went, which says how far to trust it. */
export interface SittingQuality {
  skipped: number
  /** Answers the child marked as a guess, right or wrong. */
  guessed: number
  rapid: number
  /** Minutes on the questions, when the screen timed them. */
  minutes: number | null
  /** Empty when the sitting looks sound. */
  flags: QualityFlag[]
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
  quality: SittingQuality
}
