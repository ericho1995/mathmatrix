import { test } from 'node:test'
import assert from 'node:assert/strict'
import { signClaims, verifyClaims, deriveKey, isFresh, cleanName, TEST_TTL_MS } from '../../src/lib/diagnostic/token.ts'

const key = deriveKey('service-role-secret')
const claims = { v: 1, y: 'grade_5', s: 'math', q: ['a', 'b'], n: 'Mia', t: 1000, r: 'nonce' }

test('a signed token verifies and round-trips its claims', () => {
  const token = signClaims(claims, key)
  assert.deepEqual(verifyClaims(token, key), claims)
})

test('tampering, a wrong key or a malformed token is rejected', () => {
  const token = signClaims(claims, key)
  const [payload, sig] = token.split('.')
  const flipped = payload.slice(0, -2) + (payload.at(-2) === 'A' ? 'B' : 'A') + payload.at(-1)
  assert.equal(verifyClaims(`${flipped}.${sig}`, key), null)
  assert.equal(verifyClaims(token, deriveKey('another secret')), null)
  assert.equal(verifyClaims('not-a-token', key), null)
  assert.equal(verifyClaims(`${payload}.${sig}.extra`, key), null)
  assert.equal(verifyClaims(undefined, key), null)
  assert.equal(verifyClaims(signClaims({ v: 2 }, key), key), null)
})

test('the derived key is stable and not the secret itself', () => {
  assert.equal(deriveKey('x'), deriveKey('x'))
  assert.notEqual(deriveKey('x'), 'x')
  assert.equal(deriveKey('x').length, 64)
})

test('freshness', () => {
  const now = 10 * 86_400_000
  assert.equal(isFresh(now - 1000, TEST_TTL_MS, now), true)
  assert.equal(isFresh(now - TEST_TTL_MS - 1, TEST_TTL_MS, now), false)
  assert.equal(isFresh(now + 3_600_000, TEST_TTL_MS, now), false, 'issued in the future')
  assert.equal(isFresh(Number.NaN, TEST_TTL_MS, now), false)
})

test('names are cleaned', () => {
  assert.equal(cleanName('  Mia  '), 'Mia')
  assert.equal(cleanName('Mia\nRose'), 'Mia Rose')
  assert.equal(cleanName('Mary   Jane'), 'Mary Jane')
  assert.equal(cleanName('<script>'), 'script')
  assert.equal(cleanName('x'.repeat(60)).length, 40)
  assert.equal(cleanName(''), null)
  assert.equal(cleanName('   '), null)
  assert.equal(cleanName(42), null)
})
