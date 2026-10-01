import type { SubjectSlug, YearLevel } from '../../types'
import type { AreaResult, BankQuestion, DiagnosticReport } from './types.ts'
import { areasFor, classify } from './areas.ts'
import { READING_MAX_PER_TEXT, readingTexts, screenablePool } from './blueprint.ts'
import { DIFFICULTY_RANK } from './select.ts'
import { hashSeed, mulberry32, shuffle } from './rng.ts'

// ─────────────────────────────────────────────────────────────────────────────
// The second part of the test: questions chosen from the first part's answers.
//
// The first part asks the same spread of every child. It leaves some areas
// settled (eight right out of eight) and some not (two right out of four), and
// it leaves skills that were missed once — which is as likely a slip as a gap.
// Rather than report those as findings, the test asks again: more questions
// where the result could still go either way, and a second question on each
// skill missed once. A child whose first part was clear-cut gets few or none,
// so the test is only as long as it needs to be.
//
// Nothing here marks an answer to the browser. The route that calls this
// returns the new questions and nothing about the old ones.
// ─────────────────────────────────────────────────────────────────────────────

const VCE = new Set<YearLevel>(['year_11', 'year_12'])

/** The most follow-up questions a test may add. Reading adds one text instead. */
export function followUpBudget(subject: SubjectSlug, year: YearLevel): number {
  if (subject === 'reading') return READING_MAX_PER_TEXT
  if (VCE.has(year)) return 6
  if (subject === 'math') return 8
  if (subject === 'english') return 6
  return 4
}

/** Below this, another question would not change what the report says. */
const WORTH_ASKING = 0.15
/** Each question already given to an area makes the next one worth this much less. */
const DIMINISH = 0.65

/**
 * How much one more question in this area would help. Highest where the level
 * could still go either way; a possible weakness matters more than a possible
 * strength, because a weakness is what the parent acts on.
 */
export function areaPriority(area: Pick<AreaResult, 'level' | 'confidence' | 'certainty' | 'evidence' | 'skills'>): number {
  if (area.confidence === 'clear') return 0
  let priority = 1 - area.certainty / 100
  if (area.level === 'strength') priority *= 0.6
  if (area.evidence < 6) priority += 0.2
  if (area.skills.some(s => s.state === 'one_miss')) priority += 0.1
  return priority
}

/** How many follow-ups each area gets, from a budget, never more than `room` allows. */
function shareBudget(priorities: ReadonlyMap<string, number>, room: ReadonlyMap<string, number>, budget: number): Map<string, number> {
  const given = new Map<string, number>()
  for (let i = 0; i < budget; i++) {
    let best: string | null = null
    let bestValue = WORTH_ASKING
    for (const [id, priority] of Array.from(priorities)) {
      const have = given.get(id) ?? 0
      if (have >= (room.get(id) ?? 0)) continue
      const value = priority * Math.pow(DIMINISH, have)
      if (value > bestValue) {
        best = id
        bestValue = value
      }
    }
    if (best === null) break
    given.set(best, (given.get(best) ?? 0) + 1)
  }
  return given
}

/** Takes from `pool` the question of `skill` (or any, when null) nearest a difficulty. */
function takeNearest(pool: BankQuestion[], skill: string | null, rank: number): BankQuestion | null {
  let best = -1
  for (let i = 0; i < pool.length; i++) {
    if (skill !== null && classify(pool[i]).skill !== skill) continue
    if (best < 0 || Math.abs(DIFFICULTY_RANK[pool[i].difficulty] - rank) < Math.abs(DIFFICULTY_RANK[pool[best].difficulty] - rank)) best = i
  }
  return best < 0 ? null : pool.splice(best, 1)[0]
}

/**
 * The follow-up question ids for a first part, in the order to ask them.
 * Empty when every area is already clear, or the bank has nothing left to ask.
 *
 * At most half of what an area has left is used, so the tailored exam — which
 * repeats nothing from the test — still has new questions to print.
 */
export function selectFollowUps(
  bank: readonly BankQuestion[],
  report: DiagnosticReport,
  seed: number,
  exclude?: ReadonlySet<string>
): string[] {
  const { year, subject } = report
  if (subject === 'reading') return []
  const asked = new Set(report.items.map(i => i.id))
  const rand = mulberry32((seed ^ hashSeed('follow-up')) >>> 0)

  const left = new Map<string, BankQuestion[]>()
  for (const q of shuffle(screenablePool(bank, year, subject), rand)) {
    if (asked.has(q.id) || exclude?.has(q.id)) continue
    const area = classify(q).area.id
    const list = left.get(area) ?? []
    list.push(q)
    left.set(area, list)
  }

  const priorities = new Map(report.areas.map(a => [a.id, areaPriority(a)]))
  const room = new Map(Array.from(left, ([id, list]) => [id, Math.floor(list.length / 2)]))
  const counts = shareBudget(priorities, room, followUpBudget(subject, year))

  const picks: BankQuestion[] = []
  for (const area of report.areas) {
    const n = counts.get(area.id) ?? 0
    const pool = left.get(area.id)
    if (!n || !pool) continue
    const mine = report.items.filter(i => i.area.id === area.id)
    const ranks = mine.map(i => DIFFICULTY_RANK[i.difficulty]).sort((a, b) => a - b)
    const middle = ranks[ranks.length >> 1] ?? 1

    // A skill missed once is asked again at the difficulty it was missed at:
    // right this time and the miss was a slip; wrong again and it is a gap.
    const targets: { skill: string | null; rank: number }[] = []
    for (const state of ['one_miss', 'mixed'] as const) {
      for (const s of area.skills.filter(s => s.state === state)) {
        const missed = mine.find(i => i.skill === s.label && !i.correct)
        targets.push({ skill: s.label, rank: missed ? DIFFICULTY_RANK[missed.difficulty] : middle })
      }
    }
    // Then skills the first part did not reach, then anything else.
    const tested = new Set(area.skills.map(s => s.label))
    for (const skill of Array.from(new Set(pool.map(q => classify(q).skill)))) if (!tested.has(skill)) targets.push({ skill, rank: middle })

    let taken = 0
    for (const t of targets) {
      if (taken >= n) break
      const q = takeNearest(pool, t.skill, t.rank)
      if (q) {
        picks.push(q)
        taken++
      }
    }
    while (taken < n) {
      const q = takeNearest(pool, null, middle)
      if (!q) break
      picks.push(q)
      taken++
    }
  }

  const order = mulberry32(seed)
  return picks
    .map(q => ({ id: q.id, rank: DIFFICULTY_RANK[q.difficulty], key: order() }))
    .sort((a, b) => a.rank - b.rank || a.key - b.key)
    .map(p => p.id)
}

/**
 * Reading's second part is one more text: the unread text whose questions
 * lean most towards the question types still unsettled. Texts in `prefer` are
 * used when any are left (see selectReading). Empty when nothing is unsettled
 * or no text is left.
 */
export function selectReadingFollowUp(
  bank: readonly BankQuestion[],
  report: DiagnosticReport,
  seed: number,
  prefer?: ReadonlySet<string>,
  exclude?: ReadonlySet<string>
): string[] {
  const asked = new Set(report.items.map(i => i.id))
  const readTexts = new Set(bank.filter(q => asked.has(q.id) || exclude?.has(q.id)).map(q => q.stimulus_id))
  const unread = readingTexts(bank, report.year).filter(t => !readTexts.has(t.id))
  const preferred = prefer ? unread.filter(t => prefer.has(t.id)) : []
  const candidates = preferred.length ? preferred : unread
  if (!candidates.length) return []

  const priorities = new Map(report.areas.map(a => [a.id, areaPriority(a)]))
  // A question type the first two texts never asked is the least settled of all.
  for (const a of areasFor('reading', report.year)) if (!priorities.has(a.id)) priorities.set(a.id, 1)
  if (Math.max(...Array.from(priorities.values())) <= WORTH_ASKING) return []

  const rand = mulberry32((seed ^ hashSeed('follow-up')) >>> 0)
  const scored = shuffle(candidates, rand).map(t => {
    const questions = t.questions.slice(0, READING_MAX_PER_TEXT)
    return { questions, value: questions.reduce((n, q) => n + (priorities.get(classify(q).area.id) ?? 0), 0) }
  })
  scored.sort((a, b) => b.value - a.value)
  return scored[0].questions.map(q => q.id)
}
