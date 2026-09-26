import type { Difficulty, YearLevel } from '../../types'
import type { BankQuestion, TestSpec } from './types.ts'
import { classify } from './areas.ts'
import { READING_MAX_PER_TEXT, READING_TEXTS, readingTexts, screenablePool } from './blueprint.ts'
import { hashSeed, mulberry32, shuffle } from './rng.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Choosing a test's questions.
//
// Within each area the picks go round the area's skills — so eight number
// questions test eight different things where the bank allows — and spread
// across the difficulties present, so a report can say "the easier fraction
// questions were right, the harder ones were not". The paper then runs easiest
// first with areas interleaved, which is gentler on a nervous child than
// starting with the hardest question in the first topic.
//
// Everything is seeded, so a test (and a result) can always be rebuilt.
// ─────────────────────────────────────────────────────────────────────────────

export const DIFFICULTY_RANK: Record<Difficulty, number> = { foundation: 0, developing: 1, proficient: 2, advanced: 3 }

/**
 * `n` questions from one area: round-robin over its skills, each pick the
 * question nearest the next difficulty target.
 */
export function pickSpread(pool: readonly BankQuestion[], n: number, rand: () => number): BankQuestion[] {
  if (n <= 0) return []
  if (pool.length <= n) return shuffle(pool, rand)

  const bySkill = new Map<string, BankQuestion[]>()
  for (const q of shuffle(pool, rand)) {
    const skill = classify(q).skill
    const list = bySkill.get(skill) ?? []
    list.push(q)
    bySkill.set(skill, list)
  }
  const skills = shuffle(Array.from(bySkill.keys()), rand)

  const ranks = Array.from(new Set(pool.map(q => DIFFICULTY_RANK[q.difficulty]))).sort((a, b) => a - b)
  const targets = Array.from({ length: n }, (_, i) =>
    ranks[Math.round(n === 1 ? (ranks.length - 1) / 2 : (i * (ranks.length - 1)) / (n - 1))]
  )

  const chosen: BankQuestion[] = []
  let next = 0
  for (const target of shuffle(targets, rand)) {
    for (let tries = 0; tries < skills.length; tries++) {
      const list = bySkill.get(skills[(next + tries) % skills.length])
      if (!list?.length) continue
      let best = 0
      for (let i = 1; i < list.length; i++) {
        if (Math.abs(DIFFICULTY_RANK[list[i].difficulty] - target) < Math.abs(DIFFICULTY_RANK[list[best].difficulty] - target)) best = i
      }
      chosen.push(list.splice(best, 1)[0])
      next = (next + tries + 1) % skills.length
      break
    }
  }
  return chosen
}

/** The question ids of a test, in the order they are asked. */
export function selectTest(bank: readonly BankQuestion[], spec: TestSpec, seed: number, exclude?: ReadonlySet<string>): string[] {
  const byArea = new Map<string, BankQuestion[]>()
  for (const q of screenablePool(bank, spec.year, spec.subject)) {
    if (exclude?.has(q.id)) continue
    const area = classify(q).area.id
    const list = byArea.get(area) ?? []
    list.push(q)
    byArea.set(area, list)
  }

  const picks: BankQuestion[] = []
  for (const { area, count } of spec.allocation) {
    picks.push(...pickSpread(byArea.get(area) ?? [], count, mulberry32((seed ^ hashSeed(area)) >>> 0)))
  }

  const order = mulberry32(seed)
  return picks
    .map(q => ({ id: q.id, rank: DIFFICULTY_RANK[q.difficulty], key: order() }))
    .sort((a, b) => a.rank - b.rank || a.key - b.key)
    .map(p => p.id)
}

/**
 * Reading: two texts, and up to seven of each text's questions in the order
 * the paper asks them. Texts in `prefer` — the free Reading paper's, which are
 * already public — are used when there are enough of them, so the free test
 * does not give away texts from the paid papers.
 */
export function selectReading(bank: readonly BankQuestion[], year: YearLevel, seed: number, prefer?: ReadonlySet<string>): string[] {
  const texts = readingTexts(bank, year)
  const preferred = prefer ? texts.filter(t => prefer.has(t.id)) : []
  const pool = preferred.length >= READING_TEXTS ? preferred : texts
  if (pool.length < READING_TEXTS) return []

  const rand = mulberry32(seed)
  const avg = (qs: readonly BankQuestion[]) => qs.reduce((n, q) => n + DIFFICULTY_RANK[q.difficulty], 0) / qs.length
  return shuffle(pool, rand)
    .slice(0, READING_TEXTS)
    .map(t => t.questions.slice(0, READING_MAX_PER_TEXT))
    // The easier text first.
    .sort((a, b) => avg(a) - avg(b))
    .flatMap(qs => qs.map(q => q.id))
}
