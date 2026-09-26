import type { SubjectSlug, YearLevel } from '../../types'
import type { BankQuestion, DiagnosticReport, Level } from './types.ts'
import { classify, subjectOfTopic } from './areas.ts'
import { readingTexts } from './blueprint.ts'
import { DIFFICULTY_RANK } from './select.ts'
import { hashSeed, mulberry32, shuffle } from './rng.ts'
import { SELECTIVE_SUBJECTS, SUBJECTS } from '../curriculum.ts'
import { yearLabel } from '../yearLevels.ts'

// ─────────────────────────────────────────────────────────────────────────────
// The tailored exam: a printable paper built from one diagnostic result.
//
// Most of the paper goes to the areas that went worst, pitched to build up
// from where the child is; strengths keep a few harder questions so they stay
// sharp. Nothing from the diagnostic is repeated except a closing "Second
// chance" section of questions the child got wrong, which is worth doing
// again once the answers have been talked through.
//
// Composed from a seed derived from the result id, so the paper, its answer
// key and the marking screen — three separate requests — always agree.
// ─────────────────────────────────────────────────────────────────────────────

export interface TailoredSection {
  title: string
  time_minutes: number
  calculator_allowed?: boolean
  restart_numbering?: boolean
  instructions?: string[]
  question_ids: string[]
}

export interface FocusLine {
  area: string
  label: string
  level: Level
  questions: number
}

export interface TailoredExam {
  id: string
  subject: SubjectSlug
  yearLevel: YearLevel
  title: string
  sections: TailoredSection[]
  reading_minutes?: number
  formula_sheet?: string
  /** What the paper concentrates on, most questions first. */
  focus: FocusLine[]
  /** Questions repeated from the diagnostic, in the last section. */
  secondChance: number
}

const PREFIX = 'tailored-'
export const tailoredExamId = (resultId: string) => `${PREFIX}${resultId}`
export const isTailoredExamId = (id: string) => id.startsWith(PREFIX)
export const resultIdOfExam = (examId: string) => examId.slice(PREFIX.length)

const SECOND_CHANCE_MAX = 5
const MIN_PER_AREA = 2
const PRIMARY = new Set<YearLevel>(['grade_3', 'grade_4', 'grade_5', 'grade_6'])
const VCE = new Set<YearLevel>(['year_11', 'year_12'])
const FORMULA_SHEET_SUBJECTS = new Set<SubjectSlug>(['specialist_maths', 'physics'])

/** Difficulty ranks to aim at, in turn, for an area at each level. */
const TARGETS: Record<Level, number[]> = {
  focus: [0, 1, 1, 2],
  developing: [1, 2, 2, 3],
  strength: [2, 3, 3, 2],
}

const LEVEL_NOTE: Record<Level, string> = {
  focus: 'the main area to work on',
  developing: 'still developing',
  strength: 'keeping a strength sharp',
}

function subjectLabel(subject: SubjectSlug): string {
  return [...SUBJECTS, ...SELECTIVE_SUBJECTS].find(s => s.slug === subject)?.label ?? subject
}

function titleFor(year: YearLevel, subject: SubjectSlug, name: string | null): string {
  const course = VCE.has(year) ? `${subjectLabel(subject)} ${year === 'year_12' ? 'Unit 3 & 4' : 'Unit 1 & 2'}` : `${yearLabel(year)} ${subjectLabel(subject)}`
  return `${course} — ${name ? `${name}’s practice exam` : 'Tailored practice exam'}`
}

const isChoice = (q: BankQuestion) =>
  (q.format ?? 'multiple_choice') === 'multiple_choice' && 'options' in q && Array.isArray(q.options) && q.options.length >= 2

/**
 * Split `total` across areas by weight, at least MIN_PER_AREA each where the
 * pool allows — and never more to an area than to any area that needs it more.
 * When the weakest area has few questions left after the diagnostic, the
 * paper gets shorter rather than filling up with the child's strengths.
 */
export function allocate(areas: readonly { id: string; weight: number; available: number }[], total: number): Map<string, number> {
  const out = spread(areas, total)
  // Walk from the most needed area down. `ceiling` is the fewest questions any
  // strictly more-needed area received; areas of equal need share a group.
  let ceiling = Infinity
  let groupMin = Infinity
  let groupWeight: number | null = null
  for (const a of [...areas].sort((x, y) => y.weight - x.weight)) {
    if (groupWeight !== null && a.weight < groupWeight) {
      ceiling = Math.min(ceiling, groupMin)
      groupMin = Infinity
    }
    groupWeight = a.weight
    const capped = Math.min(out.get(a.id) ?? 0, Math.max(ceiling, Math.min(MIN_PER_AREA, a.available)))
    out.set(a.id, capped)
    groupMin = Math.min(groupMin, capped)
  }
  return out
}

function spread(areas: readonly { id: string; weight: number; available: number }[], total: number): Map<string, number> {
  const out = new Map(areas.map(a => [a.id, Math.min(MIN_PER_AREA, a.available)]))
  let left = total - Array.from(out.values()).reduce((n, c) => n + c, 0)
  while (left > 0) {
    const open = areas.filter(a => (out.get(a.id) ?? 0) < a.available)
    if (!open.length) break
    const sum = open.reduce((n, a) => n + a.weight, 0)
    const shares = open.map(a => ({ a, share: (left * a.weight) / sum }))
    let given = 0
    for (const { a, share } of shares) {
      const add = Math.min(Math.floor(share), a.available - (out.get(a.id) ?? 0))
      out.set(a.id, (out.get(a.id) ?? 0) + add)
      given += add
    }
    left -= given
    // What rounding left over goes one at a time, largest remainder first.
    for (const { a } of [...shares].sort((x, y) => (y.share % 1) - (x.share % 1) || y.a.weight - x.a.weight)) {
      if (left === 0) break
      if ((out.get(a.id) ?? 0) < a.available) {
        out.set(a.id, (out.get(a.id) ?? 0) + 1)
        left--
        given++
      }
    }
    if (given === 0) break
  }
  return out
}

/**
 * `n` questions from an area: skills that went wrong come round twice as often
 * as the rest, and each pick is the question nearest the next difficulty target.
 */
function pickTargeted(pool: readonly BankQuestion[], n: number, level: Level, wrongSkills: readonly string[], rand: () => number): BankQuestion[] {
  if (n <= 0) return []
  const bySkill = new Map<string, BankQuestion[]>()
  for (const q of shuffle(pool, rand)) {
    const skill = classify(q).skill
    const list = bySkill.get(skill) ?? []
    list.push(q)
    bySkill.set(skill, list)
  }
  const wrong = wrongSkills.filter(s => bySkill.has(s))
  const rest = shuffle(Array.from(bySkill.keys()).filter(s => !wrong.includes(s)), rand)
  const cycle = [...wrong, ...wrong, ...rest]
  const targets = TARGETS[level]

  const chosen: BankQuestion[] = []
  let next = 0
  for (let i = 0; i < n; i++) {
    const target = targets[i % targets.length]
    let picked = false
    for (let tries = 0; tries < cycle.length && !picked; tries++) {
      const list = bySkill.get(cycle[(next + tries) % cycle.length])
      if (!list?.length) continue
      let best = 0
      for (let k = 1; k < list.length; k++) {
        if (Math.abs(DIFFICULTY_RANK[list[k].difficulty] - target) < Math.abs(DIFFICULTY_RANK[list[best].difficulty] - target)) best = k
      }
      chosen.push(list.splice(best, 1)[0])
      next = (next + tries + 1) % cycle.length
      picked = true
    }
    if (!picked) break
  }
  return chosen
}

const byDifficulty = (a: BankQuestion, b: BankQuestion) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty]

/** "Questions 1–12: Fractions (the main area to work on)." */
function rangeLine(from: number, count: number, label: string, level: Level): string {
  const range = count === 1 ? `Question ${from}` : `Questions ${from}–${from + count - 1}`
  return `${range}: ${label} (${LEVEL_NOTE[level]}).`
}

interface Group {
  area: string
  label: string
  level: Level
  questions: BankQuestion[]
}

/** The second-chance section: wrong answers from the weakest areas first, easiest first. */
function secondChance(byId: ReadonlyMap<string, BankQuestion>, report: DiagnosticReport, calculator?: boolean): TailoredSection | null {
  const areaRank = new Map(report.areas.map((a, i) => [a.id, i]))
  const wrong = report.items
    .filter(i => !i.correct)
    .map(i => byId.get(i.id))
    .filter((q): q is BankQuestion => Boolean(q) && !q!.stimulus_id)
    .sort((a, b) => (areaRank.get(classify(a).area.id) ?? 0) - (areaRank.get(classify(b).area.id) ?? 0) || byDifficulty(a, b))
    .slice(0, SECOND_CHANCE_MAX)
  if (!wrong.length) return null
  return {
    title: 'Second chance — questions from the diagnostic',
    time_minutes: Math.max(5, Math.round(wrong.length * 1.5)),
    ...(calculator !== undefined ? { calculator_allowed: calculator } : {}),
    ...(calculator !== undefined ? { restart_numbering: true } : {}),
    instructions: ['These questions were in the diagnostic and were not answered correctly. Try them again before looking at the answer key.'],
    question_ids: wrong.map(q => q.id),
  }
}

function groupByArea(qs: readonly BankQuestion[]): Map<string, BankQuestion[]> {
  const byArea = new Map<string, BankQuestion[]>()
  for (const q of qs) {
    const id = classify(q).area.id
    const list = byArea.get(id) ?? []
    list.push(q)
    byArea.set(id, list)
  }
  return byArea
}

/**
 * Areas of the report, each with its share of the paper's new questions.
 * `extra` supplies more questions for an area whose own pool runs short —
 * neighbouring years, for school subjects — used only after the child's own
 * year is exhausted.
 */
function areaGroups(
  pool: readonly BankQuestion[],
  report: DiagnosticReport,
  total: number,
  rand: () => number,
  extra?: (level: Level) => readonly BankQuestion[]
): Group[] {
  const own = groupByArea(pool)
  const extras = new Map<Level, Map<string, BankQuestion[]>>()
  const extraFor = (level: Level) => {
    if (!extra) return new Map<string, BankQuestion[]>()
    if (!extras.has(level)) extras.set(level, groupByArea(extra(level)))
    return extras.get(level)!
  }
  const available = (id: string, level: Level) => (own.get(id)?.length ?? 0) + (extraFor(level).get(id)?.length ?? 0)

  const areas = report.areas.filter(a => available(a.id, a.level) > 0)
  const counts = allocate(
    areas.map(a => ({ id: a.id, weight: 0.2 + (1 - a.pct / 100), available: available(a.id, a.level) })),
    total
  )
  return areas
    .map(a => {
      const wrongSkills = a.skills
        .filter(s => s.correct < s.total)
        .sort((x, y) => y.total - y.correct - (x.total - x.correct))
        .map(s => s.label)
      const n = counts.get(a.id) ?? 0
      const mine = pickTargeted(own.get(a.id) ?? [], n, a.level, wrongSkills, rand)
      const more = mine.length < n ? pickTargeted(extraFor(a.level).get(a.id) ?? [], n - mine.length, a.level, wrongSkills, rand) : []
      return { area: a.id, label: a.label, level: a.level, questions: [...mine, ...more].sort(byDifficulty) }
    })
    .filter(g => g.questions.length > 0)
    .sort((x, y) => y.questions.length - x.questions.length)
}

const focusOf = (groups: readonly Group[]): FocusLine[] =>
  groups.map(g => ({ area: g.area, label: g.label, level: g.level, questions: g.questions.length }))

/** Second-chance questions count towards the area they practice. Most questions first; ties go to the area that went worse. */
function withSecondChance(focus: readonly FocusLine[], again: TailoredSection | null, byId: ReadonlyMap<string, BankQuestion>, report: DiagnosticReport): FocusLine[] {
  const out = focus.map(f => ({ ...f }))
  for (const id of again?.question_ids ?? []) {
    const q = byId.get(id)
    if (!q) continue
    const { area } = classify(q)
    let line = out.find(f => f.area === area.id)
    if (!line) {
      line = { area: area.id, label: area.label, level: report.areas.find(a => a.id === area.id)?.level ?? 'focus', questions: 0 }
      out.push(line)
    }
    line.questions++
  }
  const rank = new Map(report.areas.map((a, i) => [a.id, i]))
  return out.sort((x, y) => y.questions - x.questions || (rank.get(x.area) ?? 0) - (rank.get(y.area) ?? 0))
}

const SCHOOL_YEARS: YearLevel[] = ['grade_3', 'grade_4', 'grade_5', 'grade_6', 'year_7', 'year_8', 'year_9', 'year_10']

/**
 * More questions for an area whose own year has run short. An area to work on
 * borrows from the year below (the foundations) and the easier questions of
 * the year above; a strength borrows from the year above, to stretch.
 */
function neighbours(bank: readonly BankQuestion[], year: YearLevel, subject: SubjectSlug, exclude: ReadonlySet<string>) {
  const i = SCHOOL_YEARS.indexOf(year)
  const usable = (y: YearLevel | undefined) =>
    y ? bank.filter(q => q.year_level === y && subjectOfTopic(q.topic) === subject && !exclude.has(q.id) && isPrintable(q)) : []
  const below = usable(SCHOOL_YEARS[i - 1])
  const above = usable(SCHOOL_YEARS[i + 1])
  return (level: Level): readonly BankQuestion[] =>
    level === 'strength' ? above : [...below, ...above.filter(q => DIFFICULTY_RANK[q.difficulty] <= DIFFICULTY_RANK.developing)]
}

/** A school-subject question that prints on its own: no reading text needed. */
const isPrintable = (q: BankQuestion) => !q.stimulus_id && (isChoice(q) || q.format === 'short_answer')

/** One school-subject section per calculator rule, questions grouped by area, focus first. */
function schoolSections(groups: readonly Group[], year: YearLevel, subject: SubjectSlug): TailoredSection[] {
  const rate = subject === 'math' ? (PRIMARY.has(year) ? 1.4 : 1.6) : subject === 'english' ? 1 : 1.2
  const split = subject === 'math' && !PRIMARY.has(year)
  const parts = split
    ? [
        { title: 'Part 1 — no calculator', calculator_allowed: false as const, keep: (q: BankQuestion) => q.calculator_allowed !== true },
        { title: 'Part 2 — calculator allowed', calculator_allowed: true as const, keep: (q: BankQuestion) => q.calculator_allowed === true },
      ]
    : [{ title: 'Practice questions', calculator_allowed: undefined, keep: () => true }]

  const sections: TailoredSection[] = []
  let number = 1
  for (const part of parts) {
    const lines: string[] = []
    const ids: string[] = []
    for (const g of groups) {
      const qs = g.questions.filter(part.keep)
      if (!qs.length) continue
      lines.push(rangeLine(number, qs.length, g.label, g.level))
      number += qs.length
      ids.push(...qs.map(q => q.id))
    }
    if (!ids.length) continue
    sections.push({
      title: part.title,
      time_minutes: Math.max(5, Math.round(ids.length * rate)),
      ...(part.calculator_allowed !== undefined ? { calculator_allowed: part.calculator_allowed } : {}),
      instructions: lines,
      question_ids: ids,
    })
  }
  return sections
}

function composeReading(bank: readonly BankQuestion[], report: DiagnosticReport, rand: () => number): { sections: TailoredSection[]; focus: FocusLine[] } {
  const seen = new Set(report.items.map(i => i.id))
  const seenTexts = new Set(bank.filter(q => seen.has(q.id)).map(q => q.stimulus_id))
  const need = new Map(report.areas.map(a => [a.id, 0.2 + (1 - a.pct / 100)]))
  const candidates = readingTexts(bank, report.year).filter(t => !seenTexts.has(t.id))
  // Texts whose questions lean towards the weak skills come first.
  const scored = shuffle(candidates, rand)
    .map(t => ({ t, score: t.questions.reduce((n, q) => n + (need.get(classify(q).area.id) ?? 0.6), 0) / t.questions.length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  const sections = scored.map(({ t }, i) => ({
    title: `Text ${i + 1}`,
    time_minutes: 15,
    question_ids: t.questions.slice(0, 8).map(q => q.id),
  }))
  const counts = new Map<string, number>()
  for (const s of scored) for (const q of s.t.questions.slice(0, 8)) counts.set(classify(q).area.id, (counts.get(classify(q).area.id) ?? 0) + 1)
  const focus = report.areas
    .filter(a => counts.has(a.id))
    .map(a => ({ area: a.id, label: a.label, level: a.level, questions: counts.get(a.id)! }))
    .sort((x, y) => y.questions - x.questions)
  return { sections, focus }
}

function composeVce(bank: readonly BankQuestion[], report: DiagnosticReport, exclude: ReadonlySet<string>, rand: () => number): { sections: TailoredSection[]; focus: FocusLine[] } {
  const { year, subject } = report
  const own = bank.filter(q => q.year_level === year && subjectOfTopic(q.topic) === subject && !exclude.has(q.id))
  const mcPool = own.filter(isChoice)
  const groups = areaGroups(mcPool, report, year === 'year_12' ? 15 : 16, rand)

  const sections: TailoredSection[] = []
  const lines: string[] = []
  let number = 1
  const mcIds: string[] = []
  for (const g of groups) {
    lines.push(rangeLine(number, g.questions.length, g.label, g.level))
    number += g.questions.length
    mcIds.push(...g.questions.map(q => q.id))
  }
  sections.push({
    title: 'Section A — multiple choice',
    time_minutes: Math.round(mcIds.length * 1.5),
    calculator_allowed: true,
    restart_numbering: true,
    instructions: lines,
    question_ids: mcIds,
  })

  // Written questions from the weakest areas of study, one area at a time.
  const longFormat = year === 'year_12' ? 'extended_response' : 'long_form'
  const longPool = own.filter(q => q.format === longFormat)
  const want = year === 'year_12' ? 3 : 2
  const marksOf = (q: BankQuestion) => (q.format === 'extended_response' ? q.parts.reduce((n, p) => n + p.marks, 0) : 5)
  const byArea = report.areas.map(a => ({
    a,
    // Moderate-length questions first, so three of them fit the time.
    qs: shuffle(longPool.filter(q => classify(q).area.id === a.id), rand).sort((x, y) => Number(marksOf(x) > 12) - Number(marksOf(y) > 12)),
  }))
  // A weak area of study takes all but one of the written questions; the
  // next weakest takes the last. With no weak area they go round in turn.
  const written: BankQuestion[] = []
  const [weakest, ...others] = byArea.filter(x => x.qs.length)
  if (weakest && weakest.a.level !== 'strength') {
    written.push(...weakest.qs.slice(0, want - 1))
    if (others.length) written.push(others[0].qs[0])
    for (const q of weakest.qs.slice(want - 1)) {
      if (written.length >= want) break
      written.push(q)
    }
  }
  for (let round = 0; written.length < want && round < 4; round++) {
    for (const { qs } of byArea) {
      if (written.length >= want) break
      const q = qs[round]
      if (q && !written.includes(q)) written.push(q)
    }
  }
  if (year === 'year_12') {
    const techFree = written.filter(q => q.calculator_allowed === false)
    const active = written.filter(q => q.calculator_allowed !== false)
    let letter = 'B'
    for (const [qs, title, calc] of [
      [techFree, 'technology-free', false],
      [active, 'extended response', true],
    ] as const) {
      if (!qs.length) continue
      sections.push({
        title: `Section ${letter} — ${title}`,
        time_minutes: Math.round(qs.reduce((n, q) => n + marksOf(q), 0) * 1.5),
        calculator_allowed: calc,
        restart_numbering: true,
        instructions: calc ? ['A calculator may be used.'] : ['No calculator or notes may be used for this section.'],
        question_ids: qs.map(q => q.id),
      })
      letter = 'C'
    }
  } else if (written.length) {
    sections.push({
      title: 'Section B — short answer',
      time_minutes: written.length * 6,
      calculator_allowed: true,
      restart_numbering: true,
      instructions: ['Show your working in the space provided.'],
      question_ids: written.map(q => q.id),
    })
  }

  const focus = focusOf(groups)
  for (const q of written) {
    const line = focus.find(f => f.area === classify(q).area.id)
    if (line) line.questions++
  }
  return { sections, focus }
}

const SCHOOL_SIZE = (year: YearLevel, subject: SubjectSlug) =>
  subject === 'math' ? (PRIMARY.has(year) ? 30 : 32) : subject === 'science' ? 18 : 30

export function composeTailoredExam(
  bank: readonly BankQuestion[],
  input: { resultId: string; report: DiagnosticReport; childName: string | null }
): TailoredExam {
  const { resultId, report, childName } = input
  const { year, subject } = report
  const rand = mulberry32(hashSeed(resultId))
  const byId = new Map(bank.map(q => [q.id, q]))
  const exclude = new Set(report.items.map(i => i.id))
  const base = { id: tailoredExamId(resultId), subject, yearLevel: year, title: titleFor(year, subject, childName) }

  if (subject === 'reading') {
    const { sections, focus } = composeReading(bank, report, rand)
    return { ...base, sections, focus, secondChance: 0 }
  }

  if (VCE.has(year)) {
    const { sections, focus } = composeVce(bank, report, exclude, rand)
    const again = secondChance(byId, report, true)
    if (again) {
      again.title = `Section ${String.fromCharCode(65 + sections.length)} — second chance`
      sections.push(again)
    }
    return {
      ...base,
      sections,
      focus: withSecondChance(focus, again, byId, report),
      secondChance: again?.question_ids.length ?? 0,
      reading_minutes: 15,
      ...(FORMULA_SHEET_SUBJECTS.has(subject) ? { formula_sheet: subject } : {}),
    }
  }

  const pool = bank.filter(q => q.year_level === year && subjectOfTopic(q.topic) === subject && !exclude.has(q.id) && isPrintable(q))
  const again = secondChance(byId, report)
  const total = SCHOOL_SIZE(year, subject) - (again?.question_ids.length ?? 0)
  const groups = areaGroups(pool, report, total, rand, neighbours(bank, year, subject, exclude))
  const sections = schoolSections(groups, year, subject)
  if (again) sections.push(again)
  return { ...base, sections, focus: withSecondChance(focusOf(groups), again, byId, report), secondChance: again?.question_ids.length ?? 0 }
}
