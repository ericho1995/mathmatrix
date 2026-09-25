import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isGuardianRole, roleLabel, dashboardLabel } from '../../src/lib/auth/roles.ts'

test('parents and teachers are guardians; students and admins are not', () => {
  assert.equal(isGuardianRole('parent'), true)
  assert.equal(isGuardianRole('teacher'), true)
  assert.equal(isGuardianRole('student'), false)
  assert.equal(isGuardianRole('admin'), false)
  assert.equal(isGuardianRole(null), false)
})

test('labels', () => {
  assert.equal(roleLabel('teacher'), 'Teacher or tutor')
  assert.equal(roleLabel('parent'), 'Parent')
  assert.equal(roleLabel('admin'), 'Admin')
  assert.equal(roleLabel(undefined), 'Student')
  assert.equal(dashboardLabel('teacher'), 'Teacher dashboard')
  assert.equal(dashboardLabel('parent'), 'Parent dashboard')
})
