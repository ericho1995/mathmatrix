// Holds the diagnostic to its accuracy. Simulated children with known
// strengths and weaknesses sit every offered test — first part, follow-ups and
// all — and the build fails if the report starts getting them wrong more often
// than it did when the evidence model was tuned (2026-10-02). See
// scripts/lib/diagnosticSim.mjs for how a simulated child answers, and
// `node scripts/diagnostic-audit.mjs --simulate` for the full table.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { QUESTION_BANK } from '../../src/lib/questions/bank.ts'
import { offeredTests } from '../../src/lib/diagnostic/blueprint.ts'
import { errorRates } from '../lib/diagnosticSim.mjs'

const byId = new Map(QUESTION_BANK.map(q => [q.id, q]))
const offered = offeredTests(QUESTION_BANK)
const pct = x => `${(100 * x).toFixed(1)}%`

// Measured at tuning: false focus ≤ 2.2%, wrong clear calls ≤ 6.3%, a strong
// area shown as focus (even as an early sign) ≤ 4.4%. The limits leave room
// for sampling noise and nothing more.
const LIMITS = { falseFocus: 0.04, clearWrong: 0.1, strongFocus: 0.08 }

for (const o of offered) {
  test(`${o.year} ${o.subject}: no confident weakness where there is none`, () => {
    const r = errorRates(QUESTION_BANK, byId, { year: o.year, subject: o.subject, children: 100 })
    assert.ok(r.falseFocus <= LIMITS.falseFocus, `areas the child is fine at reported as a focus area: ${pct(r.falseFocus)}`)
    assert.ok(r.clearWrong <= LIMITS.clearWrong, `clear results that are wrong: ${pct(r.clearWrong)}`)
    assert.ok(r.strongFocus <= LIMITS.strongFocus, `strong areas shown as a focus area: ${pct(r.strongFocus)}`)
  })
}

test('the follow-up questions find more of the real weaknesses than the first part alone', () => {
  let without = 0
  let withFollowUps = 0
  const sample = offered.filter((_o, i) => i % 3 === 0)
  for (const o of sample) {
    without += errorRates(QUESTION_BANK, byId, { year: o.year, subject: o.subject, children: 100, followUps: false }).missedWeak
    withFollowUps += errorRates(QUESTION_BANK, byId, { year: o.year, subject: o.subject, children: 100 }).missedWeak
  }
  assert.ok(withFollowUps < without * 0.9, `missed weaknesses: ${pct(without / sample.length)} → ${pct(withFollowUps / sample.length)}`)
})
