import { test } from 'node:test'
import assert from 'node:assert/strict'
import { QUESTION_BANK } from '../../src/lib/questions/bank.ts'
import { classify, areasFor, subjectOfTopic } from '../../src/lib/diagnostic/areas.ts'

const SCHOOL_YEARS = ['grade_3', 'grade_4', 'grade_5', 'grade_6', 'year_7', 'year_8', 'year_9', 'year_10']

test('every question classifies into an area of its own subject and year', () => {
  for (const q of QUESTION_BANK) {
    const c = classify(q)
    const ids = areasFor(subjectOfTopic(q.topic), q.year_level).map(a => a.id)
    assert.ok(ids.includes(c.area.id), `${q.id} (${q.topic}, ${q.year_level}) → ${c.area.id}, not in [${ids}]`)
    assert.ok(c.area.label.length > 0)
    assert.ok(c.skill.length > 0)
  }
})

test('English splits into the four conventions at every school year', () => {
  for (const y of SCHOOL_YEARS) {
    const seen = new Set(
      QUESTION_BANK.filter(q => q.year_level === y && subjectOfTopic(q.topic) === 'english').map(q => classify(q).area.id)
    )
    for (const a of ['spelling', 'grammar', 'punctuation', 'vocabulary']) assert.ok(seen.has(a), `${y} has no ${a}`)
  }
})

test('Maths areas are the curriculum topics for the year band', () => {
  assert.deepEqual(areasFor('math', 'grade_4').map(a => a.id), ['number_operations', 'number_patterns', 'geometry_measurement', 'statistics_probability'])
  assert.deepEqual(areasFor('math', 'year_8').map(a => a.id), ['number_operations', 'algebra_equations', 'geometry_measurement', 'statistics_probability'])
})

test('spot checks read the way a parent would expect', () => {
  const find = start => {
    const q = QUESTION_BANK.find(x => x.question_text.startsWith(start))
    assert.ok(q, `no question starting "${start}"`)
    return classify(q)
  }
  assert.equal(find('One word in this sentence is spelt incorrectly').area.id, 'spelling')
  assert.equal(find('What is the antonym (opposite) of').area.id, 'vocabulary')
  assert.equal(find('Which sentence needs a question mark at the end?').area.id, 'punctuation')
  assert.equal(find('Pia ate 2/8 of a pizza').skill, 'Fractions')
  assert.equal(find('What is 10% of $80?').skill, 'Percentages')
  assert.equal(find('Leo paid for these items with a $20 note').skill, 'Money')
  assert.equal(find('A plane leaves at 21:15').skill, 'Time')
  assert.equal(find('Ravi spins this spinner once').skill, 'Chance & probability')
  assert.equal(find('What is the value of 20 − 3 × 4?').skill, 'Order of operations')
})
