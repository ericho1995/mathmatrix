import type { Confidence, Level } from './types.ts'
import { callFor } from './evidence.ts'

// ─────────────────────────────────────────────────────────────────────────────
// What several sittings say together.
//
// One test is a snapshot. A child who sits the diagnostic again — a few weeks
// on, after working through the tailored exam — adds to the evidence rather
// than replacing it: an area called a focus on four questions in the first
// test and on five more in the second is a firmer result than either alone,
// and an area that was weak and is now answered correctly shows as improving
// rather than flipping on the strength of one sitting.
//
// The newest sitting counts in full and each older one for half of the one
// after it, so the picture follows the child as they improve while still
// being steadied by what came before.
// ─────────────────────────────────────────────────────────────────────────────

export interface SittingArea {
  id: string
  label: string
  /** Correct answers among the evidence. */
  secure: number
  /** Answers used as evidence. */
  evidence: number
}

export interface Sitting {
  id: string
  /** When it was sat (ISO). */
  at: string
  areas: readonly SittingArea[]
}

export type Change = 'up' | 'down' | 'same'

export interface ProfileArea {
  id: string
  label: string
  pct: number
  level: Level
  confidence: Confidence
  certainty: number
  /** Questions behind the call, across every sitting. */
  questions: number
  /** The latest sitting on its own, or null when it did not ask about this area. */
  latest: { pct: number; level: Level } | null
  /** How the call moved with the latest sitting; null with only one sitting. */
  change: Change | null
}

export interface Profile {
  sittings: number
  questions: number
  /** Weakest first. */
  areas: ProfileArea[]
}

const HALF = 0.5
const RANK: Record<Level, number> = { focus: 0, developing: 1, strength: 2 }

function pooled(sittings: readonly Sitting[]): Map<string, { label: string; right: number; asked: number; questions: number }> {
  const out = new Map<string, { label: string; right: number; asked: number; questions: number }>()
  // Newest last; the newest has weight 1.
  sittings.forEach((s, i) => {
    const weight = Math.pow(HALF, sittings.length - 1 - i)
    for (const a of s.areas) {
      const sum = out.get(a.id) ?? { label: a.label, right: 0, asked: 0, questions: 0 }
      sum.right += a.secure * weight
      sum.asked += a.evidence * weight
      sum.questions += a.evidence
      out.set(a.id, sum)
    }
  })
  return out
}

export function buildProfile(sittings: readonly Sitting[]): Profile {
  const ordered = [...sittings].sort((a, b) => a.at.localeCompare(b.at))
  const now = pooled(ordered)
  const before = ordered.length > 1 ? pooled(ordered.slice(0, -1)) : null
  const last = ordered[ordered.length - 1]

  const areas: ProfileArea[] = Array.from(now, ([id, sum]) => {
    const call = callFor(sum.right, sum.asked)
    const mine = last?.areas.find(a => a.id === id)
    const latest = mine && mine.evidence > 0 ? callFor(mine.secure, mine.evidence) : null
    const was = before?.get(id)
    let change: Change | null = null
    if (was && was.asked > 0 && latest) {
      const diff = RANK[call.level] - RANK[callFor(was.right, was.asked).level]
      change = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same'
    }
    return {
      id,
      label: sum.label,
      ...call,
      questions: sum.questions,
      latest: latest ? { pct: latest.pct, level: latest.level } : null,
      change,
    }
  }).sort((x, y) => x.pct - y.pct || y.questions - x.questions)

  return { sittings: ordered.length, questions: areas.reduce((n, a) => n + a.questions, 0), areas }
}
