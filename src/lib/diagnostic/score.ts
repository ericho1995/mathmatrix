import type { SubjectSlug, YearLevel } from '../../types'
import type { Answer, AreaResult, BankQuestion, DiagnosticReport, GradedItem, Level, Response } from './types.ts'
import { areasFor, classify } from './areas.ts'
import { matchShortAnswer } from '../questions/matchShortAnswer.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Marking a diagnostic and turning it into a report.
//
// Always done on the server, from the answers: a score a browser sends is
// never trusted. The report is rebuilt from the stored answers every time it
// is viewed, so a corrected explanation or a better skill name reaches old
// reports too.
// ─────────────────────────────────────────────────────────────────────────────

/** 75% or more is a strength, 50–74% developing, under 50% an area to focus on. */
export function levelFor(pct: number): Level {
  if (pct >= 75) return 'strength'
  if (pct >= 50) return 'developing'
  return 'focus'
}

export const LEVEL_LABEL: Record<Level, string> = {
  strength: 'Strength',
  developing: 'Developing',
  focus: 'Focus area',
}

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
    const { area, skill } = classify(q)
    items.push({ id: q.id, topic: q.topic, area, skill, difficulty: q.difficulty, answer: r.a, correct: isCorrect(q, r.a) })
  }

  const areas = new Map<string, AreaResult>()
  for (const item of items) {
    let area = areas.get(item.area.id)
    if (!area) {
      area = { id: item.area.id, label: item.area.label, correct: 0, total: 0, pct: 0, level: 'focus', skills: [] }
      areas.set(item.area.id, area)
    }
    area.total++
    if (item.correct) area.correct++
    let skill = area.skills.find(s => s.label === item.skill)
    if (!skill) {
      skill = { label: item.skill, correct: 0, total: 0 }
      area.skills.push(skill)
    }
    skill.total++
    if (item.correct) skill.correct++
  }

  const order = areasFor(subject, year).map(a => a.id)
  const sorted = Array.from(areas.values())
    .map(a => {
      const pct = pctOf(a.correct, a.total)
      return { ...a, pct, level: levelFor(pct) }
    })
    .sort((x, y) => x.pct - y.pct || y.total - x.total || order.indexOf(x.id) - order.indexOf(y.id))

  const correct = items.filter(i => i.correct).length
  return { year, subject, correct, total: items.length, pct: pctOf(correct, items.length), areas: sorted, items }
}

/** "A", "A and B", "A, B and C". */
export function listJoin(items: readonly string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/**
 * The report in two or three plain sentences. Says what this test found and
 * nothing more: it is a short snapshot, not a measure against a national
 * standard.
 */
export function summarySentence(report: DiagnosticReport, name: string | null): string {
  const who = name ?? 'Your child'
  const parts = [`${who} answered ${report.correct} of ${report.total} questions correctly.`]
  const labels = (level: Level) => report.areas.filter(a => a.level === level).map(a => a.label)
  const strengths = labels('strength')
  const developing = labels('developing')
  const focus = labels('focus')

  if (!focus.length && !developing.length) {
    parts.push('Every area was a strength, so the tailored exam will stretch them with harder questions.')
    return parts.join(' ')
  }
  if (strengths.length) {
    parts.push(strengths.length === 1 ? `${strengths[0]} is a strength.` : `${listJoin(strengths)} are strengths.`)
  }
  if (focus.length) {
    parts.push(focus.length === 1 ? `The area to focus on is ${focus[0]}.` : `The areas to focus on are ${listJoin(focus)}.`)
  } else {
    parts.push(`Nothing stood out as a weakness; ${listJoin(developing)} ${developing.length === 1 ? 'is' : 'are'} still developing.`)
  }
  return parts.join(' ')
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
  }
}
