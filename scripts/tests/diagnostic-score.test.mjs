import { test } from 'node:test'
import assert from 'node:assert/strict'
import { QUESTION_BANK } from '../../src/lib/questions/bank.ts'
import { levelFor, isCorrect, buildReport, summarySentence, headlineOf, listJoin } from '../../src/lib/diagnostic/score.ts'
import { testSpec } from '../../src/lib/diagnostic/blueprint.ts'
import { selectTest } from '../../src/lib/diagnostic/select.ts'

const byId = new Map(QUESTION_BANK.map(q => [q.id, q]))
const mc = QUESTION_BANK.find(q => (q.format ?? 'multiple_choice') === 'multiple_choice' && q.options && typeof q.correct_index === 'number')
const sa = QUESTION_BANK.find(q => q.format === 'short_answer' && q.expected_answer === '5/8')

test('levels', () => {
  assert.equal(levelFor(100), 'strength')
  assert.equal(levelFor(75), 'strength')
  assert.equal(levelFor(74), 'developing')
  assert.equal(levelFor(50), 'developing')
  assert.equal(levelFor(49), 'focus')
  assert.equal(levelFor(0), 'focus')
})

test('marking a multiple-choice answer', () => {
  assert.equal(isCorrect(mc, mc.correct_index), true)
  assert.equal(isCorrect(mc, (mc.correct_index + 1) % mc.options.length), false)
  assert.equal(isCorrect(mc, null), false)
  assert.equal(isCorrect(mc, String(mc.correct_index)), false)
})

test('marking a typed answer', () => {
  assert.ok(sa, 'a short-answer question with answer 5/8')
  assert.equal(isCorrect(sa, ' 5/8 '), true)
  assert.equal(isCorrect(sa, '3/8'), false)
  assert.equal(isCorrect(sa, ''), false)
  assert.equal(isCorrect(sa, null), false)
})

test('a report counts every answered question, per area and per skill, weakest area first', () => {
  const spec = testSpec(QUESTION_BANK, 'grade_5', 'math')
  const ids = selectTest(QUESTION_BANK, spec, 4)
  // Right on number questions only.
  const responses = ids.map(id => {
    const q = byId.get(id)
    const right = q.topic === 'number_operations'
    if (q.format === 'short_answer') return { id, a: right ? q.expected_answer : 'zzz' }
    return { id, a: right ? q.correct_index : (q.correct_index + 1) % q.options.length }
  })
  const report = buildReport(byId, 'grade_5', 'math', responses)
  assert.equal(report.total, ids.length)
  assert.equal(report.correct, 8)
  assert.equal(report.areas[report.areas.length - 1].id, 'number_operations')
  assert.equal(report.areas[report.areas.length - 1].level, 'strength')
  for (const a of report.areas.slice(0, -1)) assert.equal(a.level, 'focus')
  for (const a of report.areas) {
    assert.equal(a.skills.reduce((n, s) => n + s.total, 0), a.total)
  }
  assert.deepEqual(report.items.map(i => i.id), ids)
})

test('unknown question ids are skipped', () => {
  const report = buildReport(byId, 'grade_5', 'math', [{ id: 'no-such-question', a: 1 }, { id: mc.id, a: mc.correct_index }])
  assert.equal(report.total, 1)
})

const fakeReport = levels => ({
  year: 'grade_5',
  subject: 'math',
  correct: 17,
  total: 24,
  pct: 71,
  items: [],
  areas: levels.map(([label, level]) => ({ id: label, label, level, correct: 1, total: 1, pct: 0, skills: [] })),
})

test('summary sentences', () => {
  assert.equal(
    summarySentence(fakeReport([['Measurement', 'focus'], ['Statistics', 'developing'], ['Number', 'strength']]), 'Mia'),
    'Mia answered 17 of 24 questions correctly. Number is a strength. The area to focus on is Measurement.'
  )
  assert.equal(
    summarySentence(fakeReport([['A', 'developing'], ['B', 'strength'], ['C', 'strength']]), null),
    'Your child answered 17 of 24 questions correctly. B and C are strengths. Nothing stood out as a weakness; A is still developing.'
  )
  assert.equal(
    summarySentence(fakeReport([['A', 'strength'], ['B', 'strength']]), 'Leo'),
    'Leo answered 17 of 24 questions correctly. Every area was a strength, so the tailored exam will stretch them with harder questions.'
  )
  assert.equal(listJoin(['A', 'B', 'C']), 'A, B and C')
})

test('the headline carries no skill detail', () => {
  const h = headlineOf(fakeReport([['A', 'focus']]), 'Mia')
  assert.equal(h.name, 'Mia')
  assert.equal('skills' in h.areas[0], false)
  assert.match(h.summary, /^Mia answered/)
})
