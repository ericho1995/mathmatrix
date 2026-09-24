import { test } from 'node:test'
import assert from 'node:assert/strict'
import { vcePartnerId, ownsVcePaper, setNumber, groupIntoSets } from '../../src/lib/auth/vceSets.ts'

test('partner of exam 1 is exam 2 of the same set, and back', () => {
  assert.equal(vcePartnerId('maths_methods-year_12-3-exam1'), 'maths_methods-year_12-3-exam2')
  assert.equal(vcePartnerId('maths_methods-year_12-3-exam2'), 'maths_methods-year_12-3-exam1')
})

test('single-paper subjects have no partner', () => {
  assert.equal(vcePartnerId('physics-year_12-2'), null)
  assert.equal(vcePartnerId('chemistry-year_11-1'), null)
})

test('buying either exam of a set owns both', () => {
  const bought = new Set(['specialist_maths-year_12-4-exam2'])
  assert.equal(ownsVcePaper('specialist_maths-year_12-4-exam1', bought), true)
  assert.equal(ownsVcePaper('specialist_maths-year_12-4-exam2', bought), true)
  assert.equal(ownsVcePaper('specialist_maths-year_12-5-exam1', bought), false)
})

test('set number', () => {
  assert.equal(setNumber('general_maths-year_12-5-exam1'), 5)
  assert.equal(setNumber('physics-year_12-2'), null)
})

test('groups exam pairs into sets and leaves single papers alone', () => {
  const ids = ['m-year_12-1-exam1', 'm-year_12-1-exam2', 'm-year_12-2-exam1', 'm-year_12-2-exam2', 'p-year_12-1']
  const grouped = groupIntoSets(ids.map(id => ({ id })))
  assert.equal(grouped.length, 3)
  assert.deepEqual(grouped[0], { set: 1, exams: [{ id: 'm-year_12-1-exam1' }, { id: 'm-year_12-1-exam2' }] })
  assert.deepEqual(grouped[2], { id: 'p-year_12-1' })
})
