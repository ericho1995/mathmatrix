import type { SubjectSlug, YearLevel } from '../../types'
import type { AreaResult, BankQuestion, DiagnosticReport, Level } from './types.ts'
import { classify, subjectOfTopic } from './areas.ts'
import { readingTexts } from './blueprint.ts'
import { expectedNeed } from './evidence.ts'
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
// An area's share follows what the evidence supports, not the raw percentage:
// none right out of two pulls the paper towards that area less than none
// right out of eight does, so one thin result cannot take over the paper.
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
  /** A paper of weak areas only (see ComposeOptions). */
  weakOnly?: boolean
  /** Weak-areas paper: the test found no weak area, so the lowest areas stand in. */
  fallback?: boolean
}

/**
 * How to compose. With no options this is the original tailored exam, one per
 * result. A weak-areas paper (`weakOnly`) is one of many generated on request:
 * only the areas still to work on, seeded by its number so each is different,
 * avoiding every question already `used` by the child's earlier papers, and
 * drawing new questions only from `allowed` — the catalogue papers' questions,
 * so a generated paper is held to the same standard as a published one.
 */
export interface ComposeOptions {
  weakOnly?: boolean
  /** Which paper this is for the result, from 1: picks the seed. */
  seq?: number
  /** Question ids on the child's earlier papers. */
  used?: ReadonlySet<string>
  /** Question ids new questions may come from. */
  allowed?: ReadonlySet<string>
  /** The paper's id, when it is not the result's own tailored exam. */
  id?: string
}

/**
 * The areas a weak-areas paper works on: those to work on or still developing,
 * unless the evidence is only an early sign — the report never calls those a
 * weakness, so neither does the paper. With none, the two lowest areas.
 */
export function weakAreas(report: Pick<DiagnosticReport, 'areas'>): { areas: AreaResult[]; fallback: boolean } {
  const weak = report.areas.filter(a => a.level !== 'strength' && a.confidence !== 'early')
  return weak.length ? { areas: weak, fallback: false } : { areas: report.areas.slice(0, 2), fallback: true }
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

function titleFor(year: YearLevel, subject: SubjectSlug, name: string | null, seq?: number): string {
  const course = VCE.has(year) ? `${subjectLabel(subject)} ${year === 'year_12' ? 'Unit 3 & 4' : 'Unit 1 & 2'}` : `${yearLabel(year)} ${subjectLabel(subject)}`
  if (seq) return `${course} — ${name ? `${name}’s weak areas` : 'Weak areas'}, paper ${seq}`
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

/** The correct option's position, for multiple choice. */
const letterOf = (q: BankQuestion) => ('correct_index' in q && typeof q.correct_index === 'number' ? q.correct_index : null)

/**
 * `n` questions from an area: skills that went wrong come round twice as often
 * as the rest, and each pick is the question nearest the next difficulty target.
 * With `letters` (the paper's count of correct answers by option so far), a tie
 * on difficulty goes to the least-used letter, so a paper built from a few
 * areas does not lean on one answer letter the way a subset of them can.
 */
function pickTargeted(pool: readonly BankQuestion[], n: number, level: Level, wrongSkills: readonly string[], rand: () => number, letters?: number[]): BankQuestion[] {
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
      const cost = (q: BankQuestion) => {
        const letter = letters ? letterOf(q) : null
        return Math.abs(DIFFICULTY_RANK[q.difficulty] - target) * 3 + (letter === null ? 0 : letters![letter] ?? 0)
      }
      let best = 0
      for (let k = 1; k < list.length; k++) {
        if (cost(list[k]) < cost(list[best])) best = k
      }
      const pick = list.splice(best, 1)[0]
      const letter = letters ? letterOf(pick) : null
      if (letter !== null) letters![letter] = (letters![letter] ?? 0) + 1
      chosen.push(pick)
      next = (next + tries + 1) % cycle.length
      picked = true
    }
    if (!picked) break
  }
  return chosen
}

/** How much of the paper an area should take: most where the evidence says most is missing. */
const weightOf = (a: Pick<AreaResult, 'secure' | 'evidence'>) => 0.2 + expectedNeed(a.secure, a.evidence)

/** Skills to come round first: confirmed gaps, then inconsistent ones, then single misses. */
function skillsToWork(area: AreaResult): string[] {
  const order = { gap: 0, mixed: 1, one_miss: 2 } as const
  return area.skills
    .filter((s): s is typeof s & { state: keyof typeof order } => s.state in order)
    .sort((x, y) => order[x.state] - order[y.state] || y.total - y.correct - (x.total - x.correct))
    .map(s => s.label)
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

/**
 * The second-chance section: wrong answers from the weakest areas first,
 * easiest first. Only from the report's areas — on a weak-areas paper, a slip
 * in a strength is not a weakness — and none already repeated on an earlier paper.
 */
function secondChance(byId: ReadonlyMap<string, BankQuestion>, report: DiagnosticReport, calculator?: boolean, used?: ReadonlySet<string>): TailoredSection | null {
  const areaRank = new Map(report.areas.map((a, i) => [a.id, i]))
  const wrong = report.items
    .filter(i => !i.correct && !used?.has(i.id))
    .map(i => byId.get(i.id))
    .filter((q): q is BankQuestion => Boolean(q) && !q!.stimulus_id && areaRank.has(classify(q!).area.id))
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
  extra?: (level: Level) => readonly BankQuestion[],
  letters?: number[]
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
    areas.map(a => ({ id: a.id, weight: weightOf(a), available: available(a.id, a.level) })),
    total
  )
  const groups = areas.map(a => {
    const wrongSkills = skillsToWork(a)
    const n = counts.get(a.id) ?? 0
    const mine = pickTargeted(own.get(a.id) ?? [], n, a.level, wrongSkills, rand, letters)
    const more = mine.length < n ? pickTargeted(extraFor(a.level).get(a.id) ?? [], n - mine.length, a.level, wrongSkills, rand, letters) : []
    return { area: a.id, label: a.label, level: a.level, questions: [...mine, ...more] }
  })
  if (letters) balanceLetters(groups, g => [...(own.get(g.area) ?? []), ...(extraFor(g.level).get(g.area) ?? [])])
  return groups
    .map(g => ({ ...g, questions: g.questions.sort(byDifficulty) }))
    .filter(g => g.questions.length > 0)
    .sort((x, y) => y.questions.length - x.questions.length)
}

/** Most of a paper's multiple-choice answers one letter may hold — the bank's own rule (verify-bank.mjs). */
const LETTER_SHARE_LIMIT = 0.4

/**
 * Evens out the answer letters of a generated paper. The catalogue papers are
 * balanced as wholes, but a paper built from two or three areas of them can
 * lean on one letter — 12 of 23 answers C, in testing. While one letter holds
 * more than LETTER_SHARE_LIMIT, one of its questions is swapped for an unused
 * question of the same area, no more than a step apart in difficulty, whose
 * answer is a less-used letter; the same skill is preferred.
 */
function balanceLetters(groups: Group[], candidates: (g: Group) => readonly BankQuestion[]) {
  for (let round = 0; round < 40; round++) {
    const counts = [0, 0, 0, 0, 0, 0]
    let mc = 0
    for (const g of groups) for (const q of g.questions) {
      const l = letterOf(q)
      if (l !== null) {
        counts[l]++
        mc++
      }
    }
    if (mc < 8) return
    const over = counts.indexOf(Math.max(...counts))
    if (counts[over] <= LETTER_SHARE_LIMIT * mc) return
    const chosen = new Set(groups.flatMap(g => g.questions.map(q => q.id)))
    let best: { g: Group; i: number; q: BankQuestion; score: number } | null = null
    for (const g of groups) {
      const pool = candidates(g).filter(c => !chosen.has(c.id))
      for (let i = 0; i < g.questions.length; i++) {
        const q = g.questions[i]
        if (letterOf(q) !== over) continue
        for (const c of pool) {
          const l = letterOf(c)
          const step = Math.abs(DIFFICULTY_RANK[c.difficulty] - DIFFICULTY_RANK[q.difficulty])
          if (l === null || l === over || step > 1 || counts[l] + 1 >= counts[over]) continue
          const score = counts[l] * 10 + step * 3 + (classify(c).skill === classify(q).skill ? 0 : 2)
          if (!best || score < best.score) best = { g, i, q: c, score }
        }
      }
    }
    if (!best) return
    best.g.questions[best.i] = best.q
  }
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

const READING_TEXTS_PER_PAPER = 3

/**
 * Three unread texts, those whose questions lean towards the weak question
 * types first. The test itself reads three texts, and some years have few, so
 * when the child's own year runs short the paper borrows from the next year:
 * the year below for a child who found the test hard, the year above for one
 * who did not.
 */
function composeReading(
  bank: readonly BankQuestion[],
  report: DiagnosticReport,
  rand: () => number,
  opts: { used?: ReadonlySet<string>; weakOnly?: boolean; seenBank?: readonly BankQuestion[] } = {}
): { sections: TailoredSection[]; focus: FocusLine[] } {
  const seen = new Set([...report.items.map(i => i.id), ...Array.from(opts.used ?? [])])
  const seenTexts = new Set((opts.seenBank ?? bank).filter(q => seen.has(q.id)).map(q => q.stimulus_id))
  const need = new Map(report.areas.map(a => [a.id, weightOf(a)]))
  // A weak-areas paper keeps only the questions on the weak question types,
  // so a text earns its place by how many of those it carries.
  const keep = (t: { questions: BankQuestion[] }) =>
    (opts.weakOnly ? t.questions.filter(q => need.has(classify(q).area.id)) : t.questions).slice(0, 8)
  const rank = (texts: ReturnType<typeof readingTexts>) =>
    shuffle(texts.filter(t => !seenTexts.has(t.id)), rand)
      .map(t => ({ t, qs: keep(t), score: t.questions.reduce((n, q) => n + (need.get(classify(q).area.id) ?? (opts.weakOnly ? 0 : 0.6)), 0) / t.questions.length }))
      .filter(x => x.qs.length >= (opts.weakOnly ? 2 : 1))
      .sort((a, b) => b.score - a.score)
  const i = SCHOOL_YEARS.indexOf(report.year)
  const neighbour = SCHOOL_YEARS[report.pct < 60 ? i - 1 : i + 1] ?? SCHOOL_YEARS[report.pct < 60 ? i + 1 : i - 1]
  const ranked = [...rank(readingTexts(bank, report.year)), ...(neighbour ? rank(readingTexts(bank, neighbour)) : [])]
  let scored = ranked.slice(0, READING_TEXTS_PER_PAPER)
  if (opts.weakOnly) {
    // Fewer questions per text, so more texts — up to five — until there are a dozen.
    scored = []
    for (const r of ranked) {
      if (scored.length >= READING_TEXTS_PER_PAPER && scored.reduce((n, s) => n + s.qs.length, 0) >= 12) break
      if (scored.length >= 5) break
      scored.push(r)
    }
  }

  const sections = scored.map(({ qs }, i) => ({
    title: `Text ${i + 1}`,
    time_minutes: opts.weakOnly ? Math.max(8, qs.length * 2) : 15,
    question_ids: qs.map(q => q.id),
  }))
  const counts = new Map<string, number>()
  for (const s of scored) for (const q of s.qs) counts.set(classify(q).area.id, (counts.get(classify(q).area.id) ?? 0) + 1)
  const focus = report.areas
    .filter(a => counts.has(a.id))
    .map(a => ({ area: a.id, label: a.label, level: a.level, questions: counts.get(a.id)! }))
    .sort((x, y) => y.questions - x.questions)
  return { sections, focus }
}

function composeVce(
  bank: readonly BankQuestion[],
  report: DiagnosticReport,
  exclude: ReadonlySet<string>,
  rand: () => number,
  letters?: number[]
): { sections: TailoredSection[]; focus: FocusLine[] } {
  const { year, subject } = report
  const own = bank.filter(q => q.year_level === year && subjectOfTopic(q.topic) === subject && !exclude.has(q.id))
  const mcPool = own.filter(isChoice)
  const groups = areaGroups(mcPool, report, year === 'year_12' ? 15 : 16, rand, undefined, letters)

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

/**
 * Every question of the child's own year a paper could use — the same rules
 * the composers apply, before anything is excluded. Says how much is left.
 */
export function paperPool(bank: readonly BankQuestion[], year: YearLevel, subject: SubjectSlug): BankQuestion[] {
  if (subject === 'reading') return readingTexts(bank, year).flatMap(t => t.questions)
  const own = bank.filter(q => q.year_level === year && subjectOfTopic(q.topic) === subject)
  if (VCE.has(year)) return own.filter(q => isChoice(q) || q.format === (year === 'year_12' ? 'extended_response' : 'long_form'))
  return own.filter(isPrintable)
}

const SCHOOL_SIZE = (year: YearLevel, subject: SubjectSlug) =>
  subject === 'math' ? (PRIMARY.has(year) ? 30 : 32) : subject === 'science' ? 18 : 30

export function composeTailoredExam(
  fullBank: readonly BankQuestion[],
  input: { resultId: string; report: DiagnosticReport; childName: string | null },
  opts: ComposeOptions = {}
): TailoredExam {
  const exam = compose(fullBank, input, opts)
  if (!exam.fallback) return exam
  // With no weak area found, the areas a paper practices are only the lowest,
  // whatever level the report gave them, so the notes say so (as the cover does).
  const note = new RegExp(` \\((${Object.values(LEVEL_NOTE).join('|')})\\)\\.$`)
  return { ...exam, sections: exam.sections.map(s => (s.instructions ? { ...s, instructions: s.instructions.map(l => l.replace(note, ' (one of the lowest areas).')) } : s)) }
}

function compose(
  fullBank: readonly BankQuestion[],
  input: { resultId: string; report: DiagnosticReport; childName: string | null },
  opts: ComposeOptions
): TailoredExam {
  const { resultId, childName } = input
  const { year, subject } = input.report
  const rand = mulberry32(hashSeed(opts.seq ? `${resultId}:${opts.seq}` : resultId))
  // Second-chance questions come from the diagnostic itself; new ones only from `allowed`.
  const byId = new Map(fullBank.map(q => [q.id, q]))
  const bank = opts.allowed ? fullBank.filter(q => opts.allowed!.has(q.id)) : fullBank
  const exclude = new Set([...input.report.items.map(i => i.id), ...Array.from(opts.used ?? [])])
  const weak = opts.weakOnly ? weakAreas(input.report) : null
  // Only generated papers balance answer letters: the original exam must stay as it was printed.
  const letters = opts.weakOnly ? [0, 0, 0, 0, 0, 0] : undefined
  const report: DiagnosticReport = weak ? { ...input.report, areas: weak.areas } : input.report
  const base = {
    id: opts.id ?? tailoredExamId(resultId),
    subject,
    yearLevel: year,
    title: titleFor(year, subject, childName, opts.seq),
    ...(weak ? { weakOnly: true, ...(weak.fallback ? { fallback: true } : {}) } : {}),
  }

  if (subject === 'reading') {
    const { sections, focus } = composeReading(bank, report, rand, { used: opts.used, weakOnly: opts.weakOnly, seenBank: fullBank })
    return { ...base, sections, focus, secondChance: 0 }
  }

  if (VCE.has(year)) {
    const { sections, focus } = composeVce(bank, report, exclude, rand, letters)
    const again = secondChance(byId, report, true, opts.used)
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
  const again = secondChance(byId, report, undefined, opts.used)
  const total = SCHOOL_SIZE(year, subject) - (again?.question_ids.length ?? 0)
  const groups = areaGroups(pool, report, total, rand, neighbours(bank, year, subject, exclude), letters)
  const sections = schoolSections(groups, year, subject)
  if (again) sections.push(again)
  return { ...base, sections, focus: withSecondChance(focusOf(groups), again, byId, report), secondChance: again?.question_ids.length ?? 0 }
}
