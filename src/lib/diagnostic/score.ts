import type { SubjectSlug, YearLevel } from '../../types'
import type {
  Answer,
  AreaResult,
  BankQuestion,
  DiagnosticReport,
  GradedItem,
  Level,
  QualityFlag,
  Response,
  SittingQuality,
  SkillResult,
  SkillState,
} from './types.ts'
import { areasFor, classify } from './areas.ts'
import { callFor } from './evidence.ts'
import { matchShortAnswer } from '../questions/matchShortAnswer.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Marking a diagnostic and turning it into a report.
//
// Always done on the server, from the answers: a score a browser sends is
// never trusted. The report is rebuilt from the stored answers every time it
// is viewed, so a corrected explanation or a better skill name reaches old
// reports too.
//
// Two numbers are kept apart. The *score* is every question answered
// correctly, as a child or parent would count it. The *evidence* behind a
// level leaves out the answers that say nothing about what the child knows —
// a guess that happened to be right, and an answer given too fast to have
// read the question — and each level carries how far that evidence supports it
// (see evidence.ts).
// ─────────────────────────────────────────────────────────────────────────────

export { levelFor } from './evidence.ts'

export const LEVEL_LABEL: Record<Level, string> = {
  strength: 'Strength',
  developing: 'Developing',
  focus: 'Focus area',
}

/**
 * Faster than this and the question was not read: the answer is a tap, not an
 * attempt. Deliberately low — a quick, confident child on an easy spelling
 * question takes longer than this.
 */
export const RAPID_MS = 2500
const MAX_MS = 15 * 60_000

/** A skipped question ("I'm not sure") is not correct. */
export function isCorrect(q: BankQuestion, a: Answer): boolean {
  if (a === null || a === undefined) return false
  if (q.format === 'short_answer') {
    return typeof a === 'string' && a.trim() !== '' && matchShortAnswer(a, { expected_answer: q.expected_answer, accepted_answers: q.accepted_answers })
  }
  if ((q.format ?? 'multiple_choice') === 'multiple_choice' && 'correct_index' in q) return a === q.correct_index
  return false
}

const pctOf = (correct: number, total: number) => (total ? Math.round((100 * correct) / total) : 0)

function median(values: readonly number[]): number | null {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/** What a skill's answers say, from the ones that count as evidence. */
export function skillState(right: number, asked: number): SkillState {
  if (asked <= 1) return right >= 1 ? 'one_right' : 'one_miss'
  const share = right / asked
  if (share >= 0.75) return 'secure'
  if (share <= 1 / 3) return 'gap'
  return 'mixed'
}

export const SKILL_STATE_LABEL: Record<SkillState, string> = {
  secure: 'Secure',
  gap: 'Needs work',
  mixed: 'Inconsistent',
  one_right: 'Right so far',
  one_miss: 'One miss',
}

function gradeItem(q: BankQuestion, r: Response): GradedItem {
  const { area, skill } = classify(q)
  const correct = isCorrect(q, r.a)
  const ms = typeof r.ms === 'number' && Number.isFinite(r.ms) && r.ms >= 0 ? Math.min(r.ms, MAX_MS) : null
  const answered = r.a !== null && r.a !== undefined
  const rapid = answered && ms !== null && ms < RAPID_MS
  const guessed = answered && r.g === true
  return {
    id: q.id,
    topic: q.topic,
    area,
    skill,
    difficulty: q.difficulty,
    answer: r.a,
    correct,
    guessed,
    rapid,
    counted: !rapid && !(guessed && correct),
    ms,
    changes: typeof r.ch === 'number' && r.ch > 0 ? Math.min(Math.floor(r.ch), 99) : 0,
    followUp: r.f === true,
  }
}

function sittingQuality(items: readonly GradedItem[]): SittingQuality {
  const skippedAt = items.map(i => i.answer === null || i.answer === undefined)
  const skipped = skippedAt.filter(Boolean).length
  const guessed = items.filter(i => i.guessed).length
  const rapid = items.filter(i => i.rapid).length
  const timed = items.filter(i => i.ms !== null)
  const minutes = timed.length ? Math.round(timed.reduce((n, i) => n + (i.ms ?? 0), 0) / 6000) / 10 : null

  const flags: QualityFlag[] = []
  const n = items.length
  if (n >= 8) {
    if (rapid >= Math.max(3, Math.ceil(n * 0.2))) flags.push('rushed')
    const tail = Math.max(4, Math.floor(n / 4))
    const tailSkips = skippedAt.slice(n - tail).filter(Boolean).length
    const headSkips = skipped - tailSkips
    if (tailSkips >= Math.ceil(tail * 0.75) && headSkips < (n - tail) * 0.3) flags.push('ran_out')
    else if (skipped >= Math.ceil(n * 0.4)) flags.push('many_skips')
    if (guessed >= Math.ceil(n * 0.3)) flags.push('many_guesses')
  }
  return { skipped, guessed, rapid, minutes, flags }
}

export function buildReport(
  byId: ReadonlyMap<string, BankQuestion>,
  year: YearLevel,
  subject: SubjectSlug,
  responses: readonly Response[]
): DiagnosticReport {
  const items: GradedItem[] = []
  for (const r of responses) {
    const q = byId.get(r.id)
    // A question removed from the bank since the test was sat is left out
    // rather than breaking the report.
    if (!q) continue
    items.push(gradeItem(q, r))
  }

  interface Tally {
    id: string
    label: string
    items: GradedItem[]
    skills: Map<string, GradedItem[]>
  }
  const tallies = new Map<string, Tally>()
  for (const item of items) {
    let tally = tallies.get(item.area.id)
    if (!tally) {
      tally = { id: item.area.id, label: item.area.label, items: [], skills: new Map() }
      tallies.set(item.area.id, tally)
    }
    tally.items.push(item)
    const list = tally.skills.get(item.skill) ?? []
    list.push(item)
    tally.skills.set(item.skill, list)
  }

  const right = (list: readonly GradedItem[]) => list.filter(i => i.correct).length
  const order = areasFor(subject, year).map(a => a.id)
  const areas: AreaResult[] = Array.from(tallies.values())
    .map(t => {
      const evidence = t.items.filter(i => i.counted)
      const call = callFor(right(evidence), evidence.length)
      const seconds = median(t.items.filter(i => i.ms !== null).map(i => (i.ms ?? 0) / 1000))
      const skills: SkillResult[] = Array.from(t.skills, ([label, list]) => {
        const counted = list.filter(i => i.counted)
        // A skill whose only answers were guesses has no evidence either way;
        // it is shown as it was answered, as a single unconfirmed result.
        const state = counted.length ? skillState(right(counted), counted.length) : skillState(right(list) ? 1 : 0, 1)
        return { label, correct: right(list), total: list.length, state }
      })
      return {
        id: t.id,
        label: t.label,
        correct: right(t.items),
        total: t.items.length,
        evidence: evidence.length,
        secure: right(evidence),
        ...call,
        skipped: t.items.filter(i => i.answer === null || i.answer === undefined).length,
        seconds: seconds === null ? null : Math.round(seconds),
        skills,
      }
    })
    .sort((x, y) => x.pct - y.pct || y.total - x.total || order.indexOf(x.id) - order.indexOf(y.id))

  const correct = right(items)
  return { year, subject, correct, total: items.length, pct: pctOf(correct, items.length), areas, items, quality: sittingQuality(items) }
}

/** "A", "A and B", "A, B and C". */
export function listJoin(items: readonly string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

type SummaryArea = Pick<AreaResult, 'label' | 'level' | 'confidence'>

/**
 * The report in two or three plain sentences. Says what this test found and
 * nothing more: it is a short snapshot, not a measure against a national
 * standard. A level the evidence does not yet support is worded as a
 * possibility, never as a finding.
 */
export function summarySentence(report: { correct: number; total: number; areas: readonly SummaryArea[] }, name: string | null): string {
  const who = name ?? 'Your child'
  const parts = [`${who} answered ${report.correct} of ${report.total} questions correctly.`]
  const labels = (level: Level, firm?: boolean) =>
    report.areas.filter(a => a.level === level && (firm === undefined || (a.confidence !== 'early') === firm)).map(a => a.label)
  const strengths = labels('strength')
  const developing = labels('developing')
  const focus = labels('focus', true)
  const maybe = labels('focus', false)

  if (!focus.length && !maybe.length && !developing.length) {
    parts.push('Every area was a strength, so practice papers work on the two lowest areas.')
    return parts.join(' ')
  }
  if (strengths.length) {
    parts.push(strengths.length === 1 ? `${strengths[0]} is a strength.` : `${listJoin(strengths)} are strengths.`)
  }
  if (focus.length) {
    parts.push(focus.length === 1 ? `The area to focus on is ${focus[0]}.` : `The areas to focus on are ${listJoin(focus)}.`)
  }
  if (maybe.length) {
    parts.push(
      focus.length
        ? `${listJoin(maybe)} may need work too, but there were too few questions to be sure.`
        : `${listJoin(maybe)} may need work: that is an early sign, not yet a firm result.`
    )
  }
  if (!focus.length && !maybe.length) {
    parts.push(`Nothing stood out as a weakness; ${listJoin(developing)} ${developing.length === 1 ? 'is' : 'are'} still developing.`)
  }
  return parts.join(' ')
}

/** What to tell the parent about a sitting that weakens its own result. */
export function qualityNotes(quality: SittingQuality, name: string | null): string[] {
  const who = name ?? 'your child'
  const notes: Record<QualityFlag, string> = {
    rushed: `${quality.rapid} answers were given in under three seconds, too fast to have read the question. They are left out of the levels below. If ${who} was rushing or tired, a re-test on a fresh day will give a truer picture.`,
    ran_out: `The last questions were left unanswered, which usually means time or energy ran out rather than not knowing. The areas those questions covered may look weaker than they are.`,
    many_skips: `${quality.skipped} questions were skipped. Skipping is the right thing to do when unsure, but with this many the result shows what ${who} is confident about more than what they know.`,
    many_guesses: `${quality.guessed} answers were marked as guesses. Guesses that turned out right are left out of the levels below, so nothing here rests on luck.`,
  }
  return quality.flags.map(f => notes[f])
}

export type HeadlineArea = Omit<AreaResult, 'skills'>

/** What anyone sees straight after the test, without an account. */
export interface Headline {
  name: string | null
  year: YearLevel
  subject: SubjectSlug
  correct: number
  total: number
  pct: number
  areas: HeadlineArea[]
  summary: string
  /** Cautions about the sitting itself (rushed, tailed off…); usually empty. */
  notes: string[]
}

export function headlineOf(report: DiagnosticReport, name: string | null): Headline {
  return {
    name,
    year: report.year,
    subject: report.subject,
    correct: report.correct,
    total: report.total,
    pct: report.pct,
    areas: report.areas.map(({ skills: _skills, ...rest }) => rest),
    summary: summarySentence(report, name),
    notes: qualityNotes(report.quality, name),
  }
}
