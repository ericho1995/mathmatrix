import { test } from 'node:test'
import assert from 'node:assert/strict'
import { QUESTION_BANK } from '../../src/lib/questions/bank.ts'
import { offeredTests } from '../../src/lib/diagnostic/blueprint.ts'
import { areasFor } from '../../src/lib/diagnostic/areas.ts'
import { guidanceFor, hasGuidance } from '../../src/lib/diagnostic/guidance.ts'

test('every area of every offered test has guidance for its year', () => {
  for (const o of offeredTests(QUESTION_BANK)) {
    for (const area of areasFor(o.subject, o.year)) {
      assert.ok(hasGuidance(area.id), `${o.year} ${o.subject}: no guidance for ${area.id}`)
      const g = guidanceFor(o.subject, o.year, area.id)
      assert.ok(g.covers.length > 20)
      assert.equal(g.tips.length, 3)
      for (const t of g.tips) assert.ok(t.length > 30)
    }
  }
})

test('guidance follows the house copy rules', () => {
  for (const o of offeredTests(QUESTION_BANK)) {
    for (const area of areasFor(o.subject, o.year)) {
      const g = guidanceFor(o.subject, o.year, area.id)
      for (const text of [g.covers, ...g.tips]) {
        assert.doesNotMatch(text, /practis|\bbuy|refund/i, text)
      }
    }
  }
})

test('primary and secondary guidance differ where both exist', () => {
  assert.notEqual(guidanceFor('math', 'grade_3', 'number_operations').covers, guidanceFor('math', 'year_9', 'number_operations').covers)
})
