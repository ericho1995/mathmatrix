import type { BankQuestion, DiagnosticReport } from './types.ts'
import { classify } from './areas.ts'
import { paperPool, weakAreas, type TailoredExam } from './tailor.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Weak-areas papers: generated on request from a diagnostic result, as many as
// the plan allows, each avoiding the questions of the child's earlier papers.
//
// This file holds the rules that need no database — ids, when a paper is too
// thin to print, which areas are running out of questions, and the monthly
// window the allowance counts in — so they can be unit tested.
// ─────────────────────────────────────────────────────────────────────────────

/** Papers a plan holder may generate in a calendar month (Melbourne time). */
export const PAPERS_PER_MONTH = 3

const PREFIX = 'diagnostic-paper-'
/** The paper as a purchasable exam id (VCE papers are purchased one by one). */
export const paperExamId = (paperId: string) => `${PREFIX}${paperId}`
export const isPaperExamId = (id: string) => id.startsWith(PREFIX)

/** New questions on a paper: everything but the second-chance repeats. */
export const newQuestions = (exam: Pick<TailoredExam, 'sections' | 'secondChance'>) =>
  exam.sections.reduce((n, s) => n + s.question_ids.length, 0) - exam.secondChance

/**
 * Fewest new questions a paper needs to be worth sitting. Low, because the
 * smallest pools (Science, Grade 3 Language Conventions) hold only about eight
 * unseen questions in an area after the test — a short focused paper beats
 * none, and the bank alert asks for more.
 */
export const MIN_NEW_QUESTIONS = 6

export const isViable = (exam: Pick<TailoredExam, 'sections' | 'secondChance'>) => newQuestions(exam) >= MIN_NEW_QUESTIONS

export interface LowArea {
  area: string
  label: string
  /** Questions of the child's own year in this area they have not yet seen. */
  remaining: number
  /** Nothing new is left at all. */
  exhausted: boolean
}

/** Below this, an area cannot carry a paper on its own, whatever the last one held. */
const FLOOR = 4

/**
 * The weak areas that could not fill another paper like `exam` from the
 * child's own year. Borrowing from the neighbouring years keeps papers coming
 * for a while, but it is the signal to write more questions for that year.
 * `bank` is the bank papers draw from (the catalogue's questions).
 */
export function lowAreas(
  bank: readonly BankQuestion[],
  report: DiagnosticReport,
  exam: Pick<TailoredExam, 'sections' | 'focus'> | null,
  used: ReadonlySet<string>
): LowArea[] {
  const exclude = new Set<string>([...report.items.map(i => i.id), ...Array.from(used)])
  for (const s of exam?.sections ?? []) for (const id of s.question_ids) exclude.add(id)
  const left = new Map<string, number>()
  for (const q of paperPool(bank, report.year, report.subject)) {
    if (exclude.has(q.id)) continue
    const id = classify(q).area.id
    left.set(id, (left.get(id) ?? 0) + 1)
  }
  const onPaper = new Map((exam?.focus ?? []).map(f => [f.area, f.questions]))
  const out: LowArea[] = []
  for (const a of weakAreas(report).areas) {
    const remaining = left.get(a.id) ?? 0
    if (remaining < Math.max(onPaper.get(a.id) ?? 0, FLOOR)) out.push({ area: a.id, label: a.label, remaining, exhausted: remaining === 0 })
  }
  return out
}

const TZ = 'Australia/Melbourne'

/** The zone's offset from UTC at an instant, in milliseconds ("GMT+10:00" → 36e6). */
function offsetMs(at: Date, tz: string): number {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' }).formatToParts(at).find(p => p.type === 'timeZoneName')?.value ?? 'GMT'
  const m = name.match(/GMT([+-])(\d{2}):(\d{2})/)
  if (!m) return 0
  return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) * 60_000
}

/** Midnight at the start of the 1st of a month in the zone, as an instant. */
function zonedFirst(year: number, month: number, tz: string): Date {
  const utc = Date.UTC(year, month, 1)
  let at = utc
  // The offset at local midnight can differ from the offset at UTC midnight
  // (daylight saving starts and ends in the small hours), so settle it twice.
  for (let i = 0; i < 2; i++) at = utc - offsetMs(new Date(at), tz)
  return new Date(at)
}

/**
 * The calendar month the allowance counts in: from midnight on the 1st,
 * Melbourne time, to midnight on the next 1st, when it resets.
 */
export function monthWindow(now: Date = new Date(), tz: string = TZ): { start: Date; resets: Date } {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric' }).formatToParts(now)
  const year = Number(parts.find(p => p.type === 'year')!.value)
  const month = Number(parts.find(p => p.type === 'month')!.value) - 1
  return { start: zonedFirst(year, month, tz), resets: zonedFirst(month === 11 ? year + 1 : year, (month + 1) % 12, tz) }
}
