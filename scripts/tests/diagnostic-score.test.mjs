import { test } from 'node:test'
import assert from 'node:assert/strict'
import { QUESTION_BANK } from '../../src/lib/questions/bank.ts'
import { levelFor, isCorrect, buildReport, summarySentence, headlineOf, listJoin, skillState, qualityNotes, RAPID_MS } from '../../src/lib/diagnostic/score.ts'
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
  quality: { skipped: 0, guessed: 0, rapid: 0, minutes: null, flags: [] },
  areas: levels.map(([label, level, confidence = 'clear']) => ({ id: label, label, level, confidence, correct: 1, total: 1, pct: 0, skills: [] })),
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

test('a weakness the evidence does not yet support is worded as a possibility', () => {
  assert.equal(
    summarySentence(fakeReport([['Measurement', 'focus', 'early'], ['Number', 'strength']]), 'Mia'),
    'Mia answered 17 of 24 questions correctly. Number is a strength. Measurement may need work: that is an early sign, not yet a firm result.'
  )
  assert.equal(
    summarySentence(fakeReport([['Chance', 'focus', 'early'], ['Measurement', 'focus', 'likely']]), null),
    'Your child answered 17 of 24 questions correctly. The area to focus on is Measurement. Chance may need work too, but there were too few questions to be sure.'
  )
})

test('skill states', () => {
  assert.equal(skillState(1, 1), 'one_right')
  assert.equal(skillState(0, 1), 'one_miss')
  assert.equal(skillState(2, 2), 'secure')
  assert.equal(skillState(3, 4), 'secure')
  assert.equal(skillState(1, 2), 'mixed')
  assert.equal(skillState(0, 2), 'gap')
  assert.equal(skillState(1, 3), 'gap')
})

const answers = (ids, fn) => ids.map((id, i) => {
  const q = byId.get(id)
  const right = fn(q, i)
  return { id, a: q.format === 'short_answer' ? (right ? q.expected_answer : 'zzz') : right ? q.correct_index : (q.correct_index + 1) % q.options.length }
})

test('a lucky guess and a two-second answer count in the score but not as evidence', () => {
  const ids = selectTest(QUESTION_BANK, testSpec(QUESTION_BANK, 'grade_5', 'math'), 4)
  const responses = answers(ids, () => true).map((r, i) => ({ ...r, ms: 20_000, ...(i === 0 ? { g: true } : {}), ...(i === 1 ? { ms: RAPID_MS - 1 } : {}) }))
  const report = buildReport(byId, 'grade_5', 'math', responses)
  assert.equal(report.correct, ids.length, 'the score counts every right answer')
  assert.equal(report.items[0].guessed, true)
  assert.equal(report.items[0].counted, false)
  assert.equal(report.items[1].rapid, true)
  assert.equal(report.items[1].counted, false)
  assert.equal(report.areas.reduce((n, a) => n + a.evidence, 0), ids.length - 2)
  assert.equal(report.quality.guessed, 1)
  assert.equal(report.quality.rapid, 1)
  assert.equal(report.quality.minutes, Math.round(((ids.length - 1) * 20_000 + RAPID_MS - 1) / 6000) / 10)
  // A guess that was wrong is still evidence: the child did not know it.
  const wrongGuess = buildReport(byId, 'grade_5', 'math', answers(ids, (_q, i) => i !== 0).map((r, i) => (i === 0 ? { ...r, g: true } : r)))
  assert.equal(wrongGuess.items[0].counted, true)
})

test('a sitting that tailed off or was rushed says so', () => {
  const ids = selectTest(QUESTION_BANK, testSpec(QUESTION_BANK, 'year_9', 'math'), 2)
  const tail = answers(ids, () => true).map((r, i) => (i >= ids.length - 7 ? { ...r, a: null } : r))
  const tailed = buildReport(byId, 'year_9', 'math', tail)
  assert.deepEqual(tailed.quality.flags, ['ran_out'])
  const rushed = buildReport(byId, 'year_9', 'math', answers(ids, (_q, i) => i % 2 === 0).map((r, i) => ({ ...r, ms: i < 8 ? 900 : 15_000 })))
  assert.ok(rushed.quality.flags.includes('rushed'))
  assert.match(qualityNotes(rushed.quality, 'Mia')[0], /^8 answers were given in under three seconds/)
  const sound = buildReport(byId, 'year_9', 'math', answers(ids, (_q, i) => i % 3 !== 0).map(r => ({ ...r, ms: 30_000 })))
  assert.deepEqual(sound.quality.flags, [])
  assert.deepEqual(qualityNotes(sound.quality, null), [])
})

test('the headline carries no skill detail', () => {
  const h = headlineOf(fakeReport([['A', 'focus']]), 'Mia')
  assert.equal(h.name, 'Mia')
  assert.equal('skills' in h.areas[0], false)
  assert.match(h.summary, /^Mia answered/)
  assert.deepEqual(h.notes, [])
})
