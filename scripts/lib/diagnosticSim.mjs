// Simulated children sitting the real diagnostic, for measuring how often it
// gets a child wrong. Used by scripts/tests/diagnostic-simulation.test.mjs
// (which fails the build if the error rates rise) and by
// scripts/diagnostic-audit.mjs --simulate (which prints them).
//
// A simulated child has a true mastery per area: the chance they know the
// answer to a typical question there, a little higher on foundation questions
// and lower on advanced ones. A question they do not know they skip some of
// the time and otherwise guess, so multiple choice is sometimes right by luck
// — the same noise a real sitting has.

import { testSpec } from '../../src/lib/diagnostic/blueprint.ts'
import { selectTest, selectReading } from '../../src/lib/diagnostic/select.ts'
import { buildReport } from '../../src/lib/diagnostic/score.ts'
import { classify } from '../../src/lib/diagnostic/areas.ts'
import { selectFollowUps, selectReadingFollowUp } from '../../src/lib/diagnostic/followup.ts'
import { levelFor } from '../../src/lib/diagnostic/evidence.ts'
import { mulberry32 } from '../../src/lib/diagnostic/rng.ts'

const SHIFT = { foundation: 0.12, developing: 0.04, proficient: -0.04, advanced: -0.12 }

/** The share a child of this mastery is expected to answer correctly, guessing included. */
export function expectedShare(mastery, options = 4, skipRate = 0.3) {
  return mastery + (1 - mastery) * (1 - skipRate) * (1 / options)
}

function respond(q, mastery, rand, skipRate) {
  const know = Math.min(0.98, Math.max(0.02, mastery + SHIFT[q.difficulty]))
  const ms = 8000 + Math.floor(rand() * 40000)
  if (rand() < know) return { id: q.id, a: q.format === 'short_answer' ? q.expected_answer : q.correct_index, ms }
  if (rand() < skipRate) return { id: q.id, a: null, ms }
  if (q.format === 'short_answer') return { id: q.id, a: 'not sure', ms }
  return { id: q.id, a: Math.floor(rand() * q.options.length), ms }
}

/**
 * One sitting. `mastery` maps area id → true mastery (missing areas use
 * `rest`). Returns the first-part report and the final report.
 */
export function sit(bank, byId, { year, subject, mastery, rest = 0.6, seed, skipRate = 0.3, followUps = true }) {
  const rand = mulberry32(seed * 7919 + 13)
  const m = q => mastery[classify(q).area.id] ?? rest
  const ids = subject === 'reading' ? selectReading(bank, year, seed) : selectTest(bank, testSpec(bank, year, subject), seed)
  const first = ids.map(id => respond(byId.get(id), m(byId.get(id)), rand, skipRate))
  const firstReport = buildReport(byId, year, subject, first)
  if (!followUps) return { first: firstReport, final: firstReport, asked: ids.length }
  const more = subject === 'reading' ? selectReadingFollowUp(bank, firstReport, seed) : selectFollowUps(bank, firstReport, seed)
  const second = more.map(id => ({ ...respond(byId.get(id), m(byId.get(id)), rand, skipRate), f: true }))
  return { first: firstReport, final: buildReport(byId, year, subject, [...first, ...second]), asked: ids.length + more.length }
}

/**
 * Error rates over many simulated children, each with one weak, one strong
 * and the rest middling areas (which area is which rotates).
 *
 * - `falseFocus`   — a middling or strong area reported as a focus area *with confidence*
 *                    (likely or clear): the over-prediction the owner asked to avoid
 * - `strongFocus`  — a strong area reported as a focus area at all
 * - `missedWeak`   — a weak area reported as anything but a focus area
 * - `clearWrong`   — of the calls marked clear, the share not matching the child's true level
 */
export function errorRates(bank, byId, { year, subject, children = 200, weak = 0.2, middle = 0.6, strong = 0.92, followUps = true }) {
  const areaIds = (() => {
    const { final } = sit(bank, byId, { year, subject, mastery: {}, seed: 1, followUps: false })
    return final.areas.map(a => a.id).sort()
  })()
  const truth = mastery => levelFor(Math.round(100 * expectedShare(mastery)))
  let middleOrStrong = 0, falseFocus = 0, strongCount = 0, strongFocus = 0, weakCount = 0, missedWeak = 0, clear = 0, clearWrong = 0, questions = 0
  for (let child = 0; child < children; child++) {
    const weakArea = areaIds[child % areaIds.length]
    const strongArea = areaIds[(child + 1) % areaIds.length]
    const mastery = Object.fromEntries(areaIds.map(id => [id, id === weakArea ? weak : id === strongArea ? strong : middle]))
    const { final, asked } = sit(bank, byId, { year, subject, mastery, seed: 1000 + child, followUps })
    questions += asked
    for (const a of final.areas) {
      const m = mastery[a.id]
      if (a.confidence === 'clear') {
        clear++
        if (a.level !== truth(m)) clearWrong++
      }
      if (m === weak) {
        weakCount++
        if (a.level !== 'focus') missedWeak++
      } else {
        middleOrStrong++
        if (a.level === 'focus' && a.confidence !== 'early') falseFocus++
        if (m === strong) {
          strongCount++
          if (a.level === 'focus') strongFocus++
        }
      }
    }
  }
  const rate = (n, d) => (d ? n / d : 0)
  return {
    falseFocus: rate(falseFocus, middleOrStrong),
    strongFocus: rate(strongFocus, strongCount),
    missedWeak: rate(missedWeak, weakCount),
    clearWrong: rate(clearWrong, clear),
    questions: questions / children,
  }
}
