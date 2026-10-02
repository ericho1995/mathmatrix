import type { Confidence, Level } from './types.ts'

// ─────────────────────────────────────────────────────────────────────────────
// How far a handful of answers can be trusted.
//
// Four questions on statistics cannot tell a child who knows half of it from
// one who knows most of it: one slip moves the score by 25 points. So a level
// is never reported on its own. Each comes with the chance that the area
// really sits in that level, worked out from how many answers there are and
// how they fell, and the report words itself accordingly — "is the area to
// focus on" only when the evidence is there, "may need work" when it is not.
//
// The sum is the standard one. Before any answers, a child's true score in an
// area is assumed to be typical — about two thirds right, held as loosely as
// four questions' worth of evidence (a Beta(4, 2) distribution). Each answer
// then moves it: `right` correct out of `asked` leaves Beta(right + 4,
// asked − right + 2). The chance of a level is the share of that distribution
// inside the level's band, and only a high chance is reported as a finding.
//
// Starting from "typical" rather than "anything is equally likely" is what
// stops two wrong answers being reported as a weakness. The numbers were set
// by sitting simulated children through the real tests (scripts/lib/
// diagnosticSim.mjs): with them, under 3% of areas a child is fine at are
// reported as a confident focus area, and over 95% of clear results are right.
// scripts/tests/diagnostic-simulation.test.mjs holds the build to that.
// ─────────────────────────────────────────────────────────────────────────────

/** Under this share of answers correct, an area is one to focus on. */
export const FOCUS_BELOW = 0.5
/** At or over this share, a strength. */
export const STRENGTH_FROM = 0.75

/** 75% or more is a strength, 50–74% developing, under 50% an area to focus on. */
export function levelFor(pct: number): Level {
  if (pct >= STRENGTH_FROM * 100) return 'strength'
  if (pct >= FOCUS_BELOW * 100) return 'developing'
  return 'focus'
}

/** The typical child: Beta(4, 2), mean two thirds, worth four questions of evidence. */
const PRIOR_RIGHT = 4
const PRIOR_WRONG = 2

const STEPS = 400

/**
 * The share of a Beta(a, b) distribution lying below `x`, by Simpson's rule.
 * `a` and `b` are at least 1 here, so the density is bounded and a few hundred
 * steps are accurate to well under a percentage point — all that is needed.
 */
export function betaBelow(x: number, a: number, b: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const density = (p: number) => Math.pow(p, a - 1) * Math.pow(1 - p, b - 1)
  const simpson = (to: number) => {
    const h = to / STEPS
    let sum = density(0) + density(to)
    for (let i = 1; i < STEPS; i++) sum += density(i * h) * (i % 2 ? 4 : 2)
    return (sum * h) / 3
  }
  return Math.min(1, Math.max(0, simpson(x) / simpson(1)))
}

/** The chance (0–1) that the true score sits in each level, given the answers. */
export function levelChances(right: number, asked: number): Record<Level, number> {
  const a = right + PRIOR_RIGHT
  const b = asked - right + PRIOR_WRONG
  const belowFocus = betaBelow(FOCUS_BELOW, a, b)
  const belowStrength = betaBelow(STRENGTH_FROM, a, b)
  return { focus: belowFocus, developing: belowStrength - belowFocus, strength: 1 - belowStrength }
}

/** Fewer answers than this can never be more than an early sign. */
export const LIKELY_MIN_EVIDENCE = 3
/** Fewer than this can never be a clear result. */
export const CLEAR_MIN_EVIDENCE = 6
/** The chance a level must reach to be reported as likely, and as clear. */
const LIKELY_FROM = 0.75
const CLEAR_FROM = 0.9

export function confidenceFor(certainty: number, asked: number): Confidence {
  if (asked >= CLEAR_MIN_EVIDENCE && certainty >= CLEAR_FROM) return 'clear'
  if (asked >= LIKELY_MIN_EVIDENCE && certainty >= LIKELY_FROM) return 'likely'
  return 'early'
}

export interface Call {
  /** Whole-number percentage of the evidence answered correctly. */
  pct: number
  level: Level
  /** 0–100. */
  certainty: number
  confidence: Confidence
}

/**
 * The level a set of answers points to and how far to trust it. `right` and
 * `asked` may be fractional: older sittings count for less (see profile.ts).
 */
export function callFor(right: number, asked: number): Call {
  if (asked <= 0) return { pct: 0, level: 'developing', certainty: 0, confidence: 'early' }
  const pct = Math.round((100 * right) / asked)
  const level = levelFor(pct)
  const certainty = levelChances(right, asked)[level]
  return { pct, level, certainty: Math.round(certainty * 100), confidence: confidenceFor(certainty, asked) }
}

/**
 * The share of the true score an area is expected to be missing: the mean of
 * the distribution rather than the raw percentage, so none right out of two
 * is treated as "probably weak" (0.75), not "knows nothing" (1.0). Used to
 * weight the tailored exam, where a thin result should not swing the paper.
 */
export function expectedNeed(right: number, asked: number): number {
  return 1 - (right + 1) / (asked + 2)
}

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  clear: 'Clear result',
  likely: 'Likely',
  early: 'Early sign',
}
