import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tailoredAccess } from '../../src/lib/diagnostic/access.ts'

const none = { signedIn: true, admin: false, plan: null, papers: new Set(), legacyYears: new Set(), failed: false }
const plan = { ...none, plan: { plan: undefined, status: 'active', periodEnd: '2099-01-01', cancelAtPeriodEnd: false } }

test('Grade 3 – Year 10: the plan opens the tailored exam', () => {
  assert.deepEqual(tailoredAccess({ id: 'r1', year: 'grade_5' }, none), { mode: 'preview', purchase: 'plan' })
  assert.deepEqual(tailoredAccess({ id: 'r1', year: 'grade_5' }, plan), { mode: 'full', reason: 'plan' })
  assert.deepEqual(tailoredAccess({ id: 'r1', year: 'year_9' }, { ...none, legacyYears: new Set(['year_9']) }), { mode: 'full', reason: 'purchased' })
})

test('VCE: only a purchase of this exact exam opens it, not the plan', () => {
  assert.deepEqual(tailoredAccess({ id: 'r2', year: 'year_12' }, plan), { mode: 'preview', purchase: 'vce' })
  assert.deepEqual(tailoredAccess({ id: 'r2', year: 'year_12' }, { ...none, papers: new Set(['tailored-r2']) }), { mode: 'full', reason: 'purchased' })
  assert.deepEqual(tailoredAccess({ id: 'r2', year: 'year_12' }, { ...none, papers: new Set(['tailored-other']) }), { mode: 'preview', purchase: 'vce' })
})

test('admins see everything', () => {
  assert.equal(tailoredAccess({ id: 'r3', year: 'year_11' }, { ...none, admin: true }).mode, 'full')
})
