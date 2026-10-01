import { test } from 'node:test'
import assert from 'node:assert/strict'
import { QUESTION_BANK } from '../../src/lib/questions/bank.ts'
import { offeredTests, testSpec } from '../../src/lib/diagnostic/blueprint.ts'
import { selectTest, selectReading } from '../../src/lib/diagnostic/select.ts'
import { buildReport } from '../../src/lib/diagnostic/score.ts'
import { classify } from '../../src/lib/diagnostic/areas.ts'
import { composeTailoredExam, allocate, tailoredExamId, isTailoredExamId, resultIdOfExam } from '../../src/lib/diagnostic/tailor.ts'

const byId = new Map(QUESTION_BANK.map(q => [q.id, q]))
const wrongAnswer = q => (q.format === 'short_answer' ? 'zzz' : (q.correct_index + 1) % q.options.length)
const rightAnswer = q => (q.format === 'short_answer' ? q.expected_answer : q.correct_index)

/** A result where the first area of the blueprint went badly and the rest well. */
function simulate(o, seed) {
  const ids =
    o.subject === 'reading'
      ? selectReading(QUESTION_BANK, o.year, seed)
      : selectTest(QUESTION_BANK, testSpec(QUESTION_BANK, o.year, o.subject), seed)
  const weakArea = classify(byId.get(ids[0])).area.id
  const responses = ids.map(id => {
    const q = byId.get(id)
    return { id, a: classify(q).area.id === weakArea ? wrongAnswer(q) : rightAnswer(q) }
  })
  return { ids, weakArea, report: buildReport(byId, o.year, o.subject, responses) }
}

test('ids round-trip', () => {
  assert.equal(tailoredExamId('abc'), 'tailored-abc')
  assert.ok(isTailoredExamId('tailored-abc'))
  assert.equal(resultIdOfExam('tailored-abc'), 'abc')
})

test('allocate gives every area at least two and the rest by weight', () => {
  const counts = allocate(
    [
      { id: 'weak', weight: 1.1, available: 50 },
      { id: 'mid', weight: 0.6, available: 50 },
      { id: 'strong', weight: 0.2, available: 50 },
    ],
    30
  )
  assert.equal([...counts.values()].reduce((a, b) => a + b, 0), 30)
  assert.ok(counts.get('strong') >= 2)
  assert.ok(counts.get('weak') > counts.get('mid'))
  assert.ok(counts.get('mid') > counts.get('strong'))
  const capped = allocate([{ id: 'a', weight: 1, available: 3 }, { id: 'b', weight: 0.2, available: 40 }], 20)
  // A strength never gets more than the area that needs work: the paper is shorter instead.
  assert.equal(capped.get('a'), 3)
  assert.equal(capped.get('b'), 3)
})

for (const o of offeredTests(QUESTION_BANK)) {
  test(`tailored exam for ${o.year} ${o.subject}`, () => {
    const { ids, weakArea, report } = simulate(o, 21)
    const exam = composeTailoredExam(QUESTION_BANK, { resultId: `r-${o.year}-${o.subject}`, report, childName: 'Mia' })

    assert.match(exam.title, /Mia’s practice exam/)
    assert.ok(exam.sections.length > 0)
    const all = exam.sections.flatMap(s => s.question_ids)
    assert.equal(new Set(all).size, all.length, 'no question twice')
    const SCHOOL = ['grade_3', 'grade_4', 'grade_5', 'grade_6', 'year_7', 'year_8', 'year_9', 'year_10']
    for (const id of all) {
      const q = byId.get(id)
      assert.ok(q, `unknown id ${id}`)
      // School subjects may borrow from the next year down or up; VCE may not.
      if (SCHOOL.includes(o.year)) {
        assert.ok(Math.abs(SCHOOL.indexOf(q.year_level) - SCHOOL.indexOf(o.year)) <= 1, `${q.year_level} in a ${o.year} paper`)
      } else {
        assert.equal(q.year_level, o.year)
      }
    }
    for (const s of exam.sections) assert.ok(s.question_ids.length > 0, `empty section ${s.title}`)

    // Only the second-chance section repeats the diagnostic, and only wrong answers.
    const diagnostic = new Set(ids)
    const wrong = new Set(report.items.filter(i => !i.correct).map(i => i.id))
    const last = exam.sections[exam.sections.length - 1]
    for (const s of exam.sections) {
      const repeats = s.question_ids.filter(id => diagnostic.has(id))
      if (s === last && exam.secondChance > 0) {
        assert.equal(repeats.length, s.question_ids.length)
        assert.ok(repeats.length <= 5)
        for (const id of repeats) assert.ok(wrong.has(id))
      } else {
        assert.equal(repeats.length, 0, `${s.title} repeats the diagnostic`)
      }
    }

    // The weak area gets the most new questions (Reading chooses whole texts, so it is exempt).
    if (o.subject !== 'reading') {
      const top = exam.focus[0]
      assert.equal(top.area, weakArea, `${o.year} ${o.subject}: most questions went to ${top.area}, not ${weakArea}`)
    }

    // Reading prints three texts, borrowing from a neighbouring year when its own runs short.
    if (o.subject === 'reading') {
      assert.equal(exam.sections.length, 3, `${o.year}: ${exam.sections.length} texts`)
      const texts = exam.sections.map(s => new Set(s.question_ids.map(id => byId.get(id).stimulus_id)))
      for (const t of texts) assert.equal(t.size, 1, 'a section mixes texts')
      const read = new Set(ids.map(id => byId.get(id).stimulus_id))
      for (const t of texts) assert.ok(!read.has([...t][0]), 'a text the diagnostic used')
    }

    // Same result, same paper.
    assert.deepEqual(composeTailoredExam(QUESTION_BANK, { resultId: `r-${o.year}-${o.subject}`, report, childName: 'Mia' }), exam)
  })
}

test('a school paper is about thirty questions', () => {
  const o = { year: 'grade_5', subject: 'math' }
  const { report } = simulate(o, 5)
  const exam = composeTailoredExam(QUESTION_BANK, { resultId: 'x', report, childName: null })
  const n = exam.sections.reduce((a, s) => a + s.question_ids.length, 0)
  assert.ok(n >= 28 && n <= 30, `${n} questions`)
  assert.match(exam.title, /Tailored practice exam/)
})

test('Year 7–10 Maths splits into no-calculator and calculator parts', () => {
  const { report } = simulate({ year: 'year_9', subject: 'math' }, 5)
  const exam = composeTailoredExam(QUESTION_BANK, { resultId: 'y9', report, childName: null })
  assert.equal(exam.sections[0].calculator_allowed, false)
  assert.equal(exam.sections[1].calculator_allowed, true)
  for (const id of exam.sections[1].question_ids) assert.equal(byId.get(id).calculator_allowed, true)
})

test('Year 12 papers have multiple choice, written questions, reading time and a formula sheet where due', () => {
  const { report } = simulate({ year: 'year_12', subject: 'specialist_maths' }, 5)
  const exam = composeTailoredExam(QUESTION_BANK, { resultId: 'sm', report, childName: null })
  assert.equal(exam.reading_minutes, 15)
  assert.equal(exam.formula_sheet, 'specialist_maths')
  assert.match(exam.sections[0].title, /multiple choice/)
  const written = exam.sections.slice(1).flatMap(s => s.question_ids).filter(id => byId.get(id).format === 'extended_response')
  assert.ok(written.length >= 2, `${written.length} written questions`)
  const methods = composeTailoredExam(QUESTION_BANK, { resultId: 'mm', report: simulate({ year: 'year_12', subject: 'maths_methods' }, 5).report, childName: null })
  assert.equal(methods.formula_sheet, undefined)
})

test('a thin weak area borrows from the next year rather than shrinking the paper', () => {
  // Grade 3 has only a handful of punctuation questions, and the diagnostic uses most of them.
  const o = { year: 'grade_3', subject: 'english' }
  const ids = selectTest(QUESTION_BANK, testSpec(QUESTION_BANK, o.year, o.subject), 21)
  const responses = ids.map(id => {
    const q = byId.get(id)
    return { id, a: classify(q).area.id === 'punctuation' ? wrongAnswer(q) : rightAnswer(q) }
  })
  const report = buildReport(byId, o.year, o.subject, responses)
  const exam = composeTailoredExam(QUESTION_BANK, { resultId: 'thin', report, childName: null })
  const n = exam.sections.reduce((a, s) => a + s.question_ids.length, 0)
  assert.ok(n >= 25, `only ${n} questions`)
  assert.equal(exam.focus[0].area, 'punctuation')
})
