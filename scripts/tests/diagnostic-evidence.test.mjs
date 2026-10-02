import { test } from 'node:test'
import assert from 'node:assert/strict'
import { betaBelow, levelChances, callFor, confidenceFor, expectedNeed, levelFor } from '../../src/lib/diagnostic/evidence.ts'
import { buildProfile } from '../../src/lib/diagnostic/profile.ts'

const near = (a, b, tol = 0.005) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`)

test('levels', () => {
  assert.equal(levelFor(100), 'strength')
  assert.equal(levelFor(75), 'strength')
  assert.equal(levelFor(74), 'developing')
  assert.equal(levelFor(50), 'developing')
  assert.equal(levelFor(49), 'focus')
  assert.equal(levelFor(0), 'focus')
})

test('the Beta integral matches values worked by hand', () => {
  near(betaBelow(0.5, 1, 1), 0.5)
  // Beta(2, 4) below a half: P(Bin(5, ½) ≥ 2) = 26/32.
  near(betaBelow(0.5, 2, 4), 26 / 32)
  // Beta(1, 5) below a half: 1 − (½)⁵.
  near(betaBelow(0.5, 1, 5), 31 / 32)
  // Beta(9, 1) below three quarters: 0.75⁹.
  near(betaBelow(0.75, 9, 1), Math.pow(0.75, 9))
  assert.equal(betaBelow(0, 3, 3), 0)
  assert.equal(betaBelow(1, 3, 3), 1)
})

test('the three chances add to one', () => {
  for (const [right, asked] of [[0, 4], [2, 4], [7, 8], [3.5, 9.25], [0, 0]]) {
    const c = levelChances(right, asked)
    near(c.focus + c.developing + c.strength, 1, 1e-9)
  }
})

test('a few questions are never a clear result, however they fall', () => {
  assert.equal(callFor(0, 4).level, 'focus')
  assert.notEqual(callFor(0, 4).confidence, 'clear')
  assert.notEqual(callFor(4, 4).confidence, 'clear')
  assert.equal(callFor(1, 2).confidence, 'early')
  assert.equal(callFor(0, 2).confidence, 'early')
  assert.equal(confidenceFor(0.99, 5), 'likely')
  assert.equal(confidenceFor(0.99, 2), 'early')
})

test('a result on a boundary is an early sign; the same share over more questions firms up', () => {
  // Two of four: could be a focus area, could be a strength.
  assert.equal(callFor(2, 4).confidence, 'early')
  // Three of four is 75%, but one slip away from 50%.
  assert.equal(callFor(3, 4).level, 'strength')
  assert.equal(callFor(3, 4).confidence, 'early')
  // Starting from a typical child, it takes a run of answers to call an area clearly.
  assert.equal(callFor(1, 4).confidence, 'early')
  assert.equal(callFor(0, 6).confidence, 'likely')
  assert.equal(callFor(1, 8).confidence, 'likely')
  assert.equal(callFor(0, 8).confidence, 'clear')
  assert.equal(callFor(8, 8).confidence, 'likely')
  assert.equal(callFor(10, 10).confidence, 'clear')
  assert.ok(callFor(2, 8).certainty > callFor(1, 4).certainty, 'the same 25% is surer over eight questions than four')
})

test('nothing asked is no result at all', () => {
  assert.deepEqual(callFor(0, 0), { pct: 0, level: 'developing', certainty: 0, confidence: 'early' })
})

test('expected need shrinks a thin result towards the middle', () => {
  assert.equal(expectedNeed(0, 0), 0.5)
  assert.equal(expectedNeed(0, 2), 0.75)
  assert.equal(expectedNeed(0, 8), 0.9)
  assert.ok(expectedNeed(8, 8) < expectedNeed(2, 2))
})

const sitting = (id, at, areas) => ({ id, at, areas: Object.entries(areas).map(([k, [secure, evidence]]) => ({ id: k, label: k, secure, evidence })) })

test('one sitting: the profile is that sitting, with no change to report', () => {
  const p = buildProfile([sitting('a', '2026-10-01', { number: [7, 8], measurement: [1, 6] })])
  assert.equal(p.sittings, 1)
  assert.equal(p.questions, 14)
  assert.deepEqual(p.areas.map(a => a.id), ['measurement', 'number'])
  assert.equal(p.areas[0].level, 'focus')
  assert.equal(p.areas[0].change, null)
  assert.equal(p.areas[0].pct, callFor(1, 6).pct)
})

test('two sittings that agree are surer than either alone', () => {
  const first = sitting('a', '2026-09-01', { measurement: [1, 4] })
  const second = sitting('b', '2026-10-01', { measurement: [1, 4] })
  const one = buildProfile([second]).areas[0]
  const both = buildProfile([second, first]).areas[0]
  assert.equal(both.level, 'focus')
  assert.ok(both.certainty > one.certainty)
  assert.equal(both.change, 'same')
  assert.equal(both.questions, 8)
})

test('the newest sitting counts most, so improvement shows', () => {
  const first = sitting('a', '2026-09-01', { measurement: [1, 8] })
  const second = sitting('b', '2026-10-01', { measurement: [7, 8] })
  const area = buildProfile([first, second]).areas[0]
  // Pooled evenly this would be 8 of 16, the bottom of developing; weighted to the newest it is 7.5 of 12.
  assert.equal(area.pct, 63)
  assert.equal(area.level, 'developing')
  assert.equal(area.change, 'up')
  assert.deepEqual(area.latest, { pct: 88, level: 'strength' })
  // And one good test after a bad one is not yet a strength.
  assert.notEqual(area.level, 'strength')
})

test('an area the latest sitting did not ask keeps its earlier call', () => {
  const p = buildProfile([sitting('a', '2026-09-01', { number: [6, 6], chance: [0, 6] }), sitting('b', '2026-10-01', { number: [6, 6] })])
  const chance = p.areas.find(a => a.id === 'chance')
  assert.equal(chance.level, 'focus')
  assert.equal(chance.latest, null)
  assert.equal(chance.change, null)
})
