import { test } from 'node:test'
import assert from 'node:assert/strict'
import { QUESTION_BANK } from '../../src/lib/questions/bank.ts'
import { offeredTests, testSpec, isScreenable } from '../../src/lib/diagnostic/blueprint.ts'
import { selectTest, selectReading } from '../../src/lib/diagnostic/select.ts'
import { buildReport } from '../../src/lib/diagnostic/score.ts'
import { classify } from '../../src/lib/diagnostic/areas.ts'
import { selectFollowUps, selectReadingFollowUp, followUpBudget, areaPriority } from '../../src/lib/diagnostic/followup.ts'

const byId = new Map(QUESTION_BANK.map(q => [q.id, q]))
const wrongAnswer = q => (q.format === 'short_answer' ? 'zzz' : (q.correct_index + 1) % q.options.length)
const rightAnswer = q => (q.format === 'short_answer' ? q.expected_answer : q.correct_index)
const answer = (ids, isRight) => ids.map((id, i) => ({ id, a: isRight(byId.get(id), i) ? rightAnswer(byId.get(id)) : wrongAnswer(byId.get(id)) }))

function firstPart(year, subject, seed, isRight) {
  const ids = selectTest(QUESTION_BANK, testSpec(QUESTION_BANK, year, subject), seed)
  return { ids, report: buildReport(byId, year, subject, answer(ids, isRight)) }
}

test('a clear area is not asked about again; an unsettled one is', () => {
  const clear = { level: 'strength', confidence: 'clear', certainty: 93, evidence: 8, skills: [] }
  const unsettled = { level: 'developing', confidence: 'early', certainty: 40, evidence: 4, skills: [] }
  assert.equal(areaPriority(clear), 0)
  assert.ok(areaPriority(unsettled) > 0.5)
  // A possible weakness matters more than a possible strength at the same certainty.
  const base = { confidence: 'likely', certainty: 65, evidence: 6, skills: [] }
  assert.ok(areaPriority({ ...base, level: 'focus' }) > areaPriority({ ...base, level: 'strength' }))
})

test('every offered test: follow-ups are new, screenable, in budget and from the same year', () => {
  for (const o of offeredTests(QUESTION_BANK).filter(o => o.subject !== 'reading')) {
    for (const seed of [1, 2, 3]) {
      const { ids, report } = firstPart(o.year, o.subject, seed, (_q, i) => i % 2 === 0)
      const more = selectFollowUps(QUESTION_BANK, report, seed)
      assert.ok(more.length <= followUpBudget(o.subject, o.year), `${o.year} ${o.subject}`)
      assert.equal(new Set(more).size, more.length)
      for (const id of more) {
        const q = byId.get(id)
        assert.ok(q && isScreenable(q))
        assert.equal(q.year_level, o.year)
        assert.ok(!ids.includes(id), 'repeats the first part')
      }
      assert.deepEqual(selectFollowUps(QUESTION_BANK, report, seed), more, 'same seed, same follow-ups')
    }
  }
})

test('a mixed first part earns follow-ups in Maths', () => {
  const { report } = firstPart('grade_5', 'math', 7, (_q, i) => i % 2 === 0)
  assert.ok(selectFollowUps(QUESTION_BANK, report, 7).length >= 6)
})

test('follow-ups go to the unsettled areas, not the settled ones', () => {
  // Number all right (eight of eight: clear); everything else half right.
  let flip = false
  const { report } = firstPart('grade_5', 'math', 3, q => (q.topic === 'number_operations' ? true : (flip = !flip)))
  const number = report.areas.find(a => a.id === 'number_operations')
  assert.notEqual(number.confidence, 'early')
  assert.ok(areaPriority(number) < 0.15)
  const areas = selectFollowUps(QUESTION_BANK, report, 3).map(id => classify(byId.get(id)).area.id)
  assert.ok(areas.length > 0)
  assert.ok(!areas.includes('number_operations'), 'asked again about a clear strength')
})

test('a skill missed once is asked again', () => {
  // Wrong on exactly one geometry question, right on everything else.
  const spec = testSpec(QUESTION_BANK, 'year_8', 'math')
  const ids = selectTest(QUESTION_BANK, spec, 5)
  const missed = ids.map(id => byId.get(id)).find(q => q.topic === 'geometry_measurement')
  const report = buildReport(byId, 'year_8', 'math', answer(ids, q => q.id !== missed.id))
  const skill = classify(missed).skill
  assert.equal(report.areas.find(a => a.id === 'geometry_measurement').skills.find(s => s.label === skill).state, 'one_miss')
  const more = selectFollowUps(QUESTION_BANK, report, 5).map(id => byId.get(id))
  assert.ok(more.some(q => q.topic === 'geometry_measurement' && classify(q).skill === skill), `no second ${skill} question`)
})

test('follow-ups leave at least half of what an area has left', () => {
  for (const year of ['grade_6', 'year_8', 'year_10']) {
    const { ids, report } = firstPart(year, 'science', 2, (_q, i) => i % 2 === 0)
    const more = selectFollowUps(QUESTION_BANK, report, 2)
    const used = new Set([...ids, ...more])
    for (const area of report.areas) {
      const pool = QUESTION_BANK.filter(q => q.year_level === year && isScreenable(q) && q.topic === area.id)
      const leftBefore = pool.filter(q => !ids.includes(q.id)).length
      const leftAfter = pool.filter(q => !used.has(q.id)).length
      assert.ok(leftAfter >= Math.ceil(leftBefore / 2), `${year} ${area.id}: ${leftAfter} of ${leftBefore} left`)
    }
  }
})

test('previously seen questions can be excluded', () => {
  const { report } = firstPart('year_9', 'math', 4, (_q, i) => i % 2 === 0)
  const first = selectFollowUps(QUESTION_BANK, report, 4)
  const second = selectFollowUps(QUESTION_BANK, report, 4, new Set(first))
  assert.equal(second.filter(id => first.includes(id)).length, 0)
})

test('a clear-cut first part needs no second part', () => {
  const { report } = firstPart('year_11', 'maths_methods', 1, () => true)
  assert.deepEqual(selectFollowUps(QUESTION_BANK, report, 1), [])
})

test('reading adds one unread text, and none when nothing is left', () => {
  for (const year of ['grade_3', 'grade_5', 'year_7', 'year_9']) {
    const ids = selectReading(QUESTION_BANK, year, 3)
    const report = buildReport(byId, year, 'reading', answer(ids, (_q, i) => i % 2 === 0))
    const more = selectReadingFollowUp(QUESTION_BANK, report, 3)
    assert.ok(more.length >= 4 && more.length <= 7, `${year}: ${more.length}`)
    const read = new Set(ids.map(id => byId.get(id).stimulus_id))
    const texts = new Set(more.map(id => byId.get(id).stimulus_id))
    assert.equal(texts.size, 1)
    assert.ok(![...texts].some(t => read.has(t)), 'a text already read')
    const everything = new Set(QUESTION_BANK.map(q => q.id))
    assert.deepEqual(selectReadingFollowUp(QUESTION_BANK, report, 3, undefined, everything), [])
  }
})
