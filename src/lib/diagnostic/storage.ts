import type { SubjectSlug, YearLevel } from '@/types'
import type { ReadingText } from '@/types/reading'
import type { ScreenQuestion } from '@/lib/web/questionHtml'
import type { Headline } from './score'
import type { Answer } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// A test in progress, and a signed-out result, kept in the browser so a
// refresh, a break or a lost connection loses nothing. Client-safe.
//
// Every read and write is guarded: storage can be full, disabled or throw in a
// private window, and the test must still run (it just will not survive a
// refresh).
// ─────────────────────────────────────────────────────────────────────────────

/** One answer as the screen records it. */
export interface AnswerState {
  a: Answer
  /** Milliseconds spent on the question so far, across visits. */
  ms: number
  /** Times the answer was changed after it was first given. */
  ch: number
  /** The child marked it as a guess. */
  g: boolean
  /** Answered or skipped deliberately (an untouched question is not). */
  done: boolean
}

export interface StoredTest {
  token: string
  year: YearLevel
  subject: SubjectSlug
  name: string | null
  /** 1 while the first part is being sat; 2 once follow-ups have been added. */
  part: 1 | 2
  /** How many questions the first part has. */
  partOne: number
  minutes: number
  followUps: number
  questions: ScreenQuestion[]
  texts?: Record<string, ReadingText>
  answers: AnswerState[]
  index: number
  startedAt: number
}

export interface StoredResult {
  receipt: string
  headline: Headline
  savedAt: number
  /** Why saving to the account failed, if it was tried. */
  saveError?: string
}

const TEST_KEY = 'prepnest.diagnostic.test.v1'
const RESULT_KEY = 'prepnest.diagnostic.result.v1'

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function remove(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Nothing to do: the entry simply stays.
  }
}

export const emptyAnswer = (): AnswerState => ({ a: null, ms: 0, ch: 0, g: false, done: false })

export const loadTest = () => read<StoredTest>(TEST_KEY)
export const saveTest = (t: StoredTest) => write(TEST_KEY, t)
export const clearTest = () => remove(TEST_KEY)

export const loadResult = () => read<StoredResult>(RESULT_KEY)
export const saveResultLocal = (r: StoredResult) => write(RESULT_KEY, r)
export const clearResult = () => remove(RESULT_KEY)

/** What the server wants for each answer. */
export const answersPayload = (answers: readonly AnswerState[]) =>
  answers.map(x => ({ a: x.a, ms: Math.round(x.ms), ...(x.ch ? { ch: x.ch } : {}), ...(x.g ? { g: true } : {}) }))
