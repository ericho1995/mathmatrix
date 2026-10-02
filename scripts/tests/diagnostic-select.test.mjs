import { test } from 'node:test'
import assert from 'node:assert/strict'
import { QUESTION_BANK } from '../../src/lib/questions/bank.ts'
import { offeredTests, testSpec, isScreenable } from '../../src/lib/diagnostic/blueprint.ts'
import { selectTest, selectReading, DIFFICULTY_RANK } from '../../src/lib/diagnostic/select.ts'
import { classify } from '../../src/lib/diagnostic/areas.ts'

const byId = new Map(QUESTION_BANK.map(q => [q.id, q]))
const offered = offeredTests(QUESTION_BANK)
const has = (y, s) => offered.some(o => o.year === y && o.subject === s)

test('the tests the design promises are offered', () => {
  for (const y of ['grade_3', 'grade_4', 'grade_5', 'grade_6', 'year_7', 'year_8', 'year_9', 'year_10']) {
    assert.ok(has(y, 'math'), `${y} maths`)
    assert.ok(has(y, 'english'), `${y} english`)
    assert.ok(has(y, 'reading'), `${y} reading`)
  }
  for (const y of ['grade_6', 'year_8', 'year_10']) assert.ok(has(y, 'science'), `${y} science`)
  for (const y of ['grade_3', 'grade_4', 'grade_5', 'year_7', 'year_9']) assert.ok(!has(y, 'science'), `no ${y} science`)
  for (const s of ['maths_methods', 'general_maths', 'specialist_maths', 'physics']) assert.ok(has('year_12', s), `year 12 ${s}`)
  for (const s of ['maths_methods', 'general_maths', 'specialist_maths', 'physics', 'chemistry']) assert.ok(has('year_11', s), `year 11 ${s}`)
  assert.ok(!has('year_12', 'chemistry'), 'no Year 12 Chemistry content yet')
})

test('every offered test fills its blueprint with distinct, screenable questions from its own year', () => {
  for (const o of offered.filter(o => o.subject !== 'reading')) {
    const spec = testSpec(QUESTION_BANK, o.year, o.subject)
    const size = spec.allocation.reduce((n, a) => n + a.count, 0)
    assert.equal(o.questions, size)
    for (let seed = 1; seed <= 8; seed++) {
      const ids = selectTest(QUESTION_BANK, spec, seed)
      assert.equal(ids.length, size, `${o.year} ${o.subject} seed ${seed}`)
      assert.equal(new Set(ids).size, ids.length, 'no repeats')
      const counts = {}
      for (const id of ids) {
        const q = byId.get(id)
        assert.ok(q && isScreenable(q))
        assert.equal(q.year_level, o.year)
        const area = classify(q).area.id
        counts[area] = (counts[area] ?? 0) + 1
      }
      for (const a of spec.allocation) assert.equal(counts[a.area] ?? 0, a.count, `${o.year} ${o.subject} ${a.area}`)
    }
  }
})

test('the same seed gives the same test, and different seeds differ', () => {
  const spec = testSpec(QUESTION_BANK, 'grade_5', 'math')
  assert.deepEqual(selectTest(QUESTION_BANK, spec, 11), selectTest(QUESTION_BANK, spec, 11))
  assert.notDeepEqual(selectTest(QUESTION_BANK, spec, 11), selectTest(QUESTION_BANK, spec, 12))
})

test('a test starts with its easiest questions', () => {
  const spec = testSpec(QUESTION_BANK, 'grade_4', 'math')
  const ranks = selectTest(QUESTION_BANK, spec, 3).map(id => DIFFICULTY_RANK[byId.get(id).difficulty])
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b))
})

test('an area spreads across skills where the bank allows', () => {
  const spec = testSpec(QUESTION_BANK, 'year_8', 'math')
  const ids = selectTest(QUESTION_BANK, spec, 9)
  const number = ids.map(id => byId.get(id)).filter(q => q.topic === 'number_operations')
  const skills = new Set(number.map(q => classify(q).skill))
  assert.ok(skills.size >= Math.min(5, number.length), `only ${skills.size} skills across ${number.length} number questions`)
})

test('excluded questions are not used', () => {
  const spec = testSpec(QUESTION_BANK, 'year_9', 'math')
  const first = selectTest(QUESTION_BANK, spec, 1)
  const second = selectTest(QUESTION_BANK, spec, 2, new Set(first))
  assert.equal(second.filter(id => first.includes(id)).length, 0)
})

test('reading picks two texts and keeps each text’s questions together', () => {
  for (const y of ['grade_3', 'grade_4', 'grade_6', 'year_9', 'year_10']) {
    const ids = selectReading(QUESTION_BANK, y, 3)
    const texts = ids.map(id => byId.get(id).stimulus_id)
    assert.equal(new Set(texts).size, 2, y)
    assert.ok(ids.length >= 8 && ids.length <= 14, `${y}: ${ids.length} questions`)
    // Grouped: the text changes exactly once.
    assert.equal(texts.filter((t, i) => i > 0 && t !== texts[i - 1]).length, 1)
  }
})

test('reading prefers the texts it is told to', () => {
  const all = selectReading(QUESTION_BANK, 'grade_5', 1)
  const texts = new Set(all.map(id => byId.get(id).stimulus_id))
  const again = selectReading(QUESTION_BANK, 'grade_5', 99, texts)
  assert.deepEqual(new Set(again.map(id => byId.get(id).stimulus_id)), texts)
})
