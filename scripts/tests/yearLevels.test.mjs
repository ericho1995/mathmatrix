import { test } from 'node:test'
import assert from 'node:assert/strict'
import { YEAR_STAGES, yearLabel, yearTag, stageTag } from '../../src/lib/yearLevels.ts'

test('stages cover Grade 3 to Year 12 once each, in order', () => {
  const all = YEAR_STAGES.flatMap(s => s.years)
  assert.deepEqual(all, ['grade_3', 'grade_4', 'grade_5', 'grade_6', 'year_7', 'year_8', 'year_9', 'year_10', 'year_11', 'year_12'])
})

test('labels and tags', () => {
  assert.equal(yearLabel('grade_3'), 'Grade 3')
  assert.equal(yearLabel('year_12'), 'Year 12')
  assert.equal(yearTag('grade_5'), 'NAPLAN')
  assert.equal(yearTag('grade_4'), null)
  assert.equal(yearTag('year_12'), 'Units 3 & 4')
  assert.equal(stageTag('year_9'), 'NAPLAN year')
  assert.equal(stageTag('year_11'), 'VCE Units 1 & 2')
  assert.equal(stageTag('year_8'), '')
})
