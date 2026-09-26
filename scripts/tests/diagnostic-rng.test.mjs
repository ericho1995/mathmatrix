import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hashSeed, mulberry32, shuffle } from '../../src/lib/diagnostic/rng.ts'

test('hashSeed is stable and unsigned', () => {
  assert.equal(hashSeed('abc'), hashSeed('abc'))
  assert.notEqual(hashSeed('abc'), hashSeed('abd'))
  assert.ok(hashSeed('x') >= 0)
  assert.ok(Number.isInteger(hashSeed('a long string with spaces')))
})

test('mulberry32 is deterministic and in [0, 1)', () => {
  const a = mulberry32(42)
  const b = mulberry32(42)
  for (let i = 0; i < 100; i++) {
    const x = a()
    assert.equal(x, b())
    assert.ok(x >= 0 && x < 1)
  }
  assert.notEqual(mulberry32(1)(), mulberry32(2)())
})

test('shuffle keeps every item and does not mutate its input', () => {
  const src = [1, 2, 3, 4, 5, 6, 7, 8]
  const out = shuffle(src, mulberry32(7))
  assert.deepEqual([...out].sort((x, y) => x - y), src)
  assert.deepEqual(src, [1, 2, 3, 4, 5, 6, 7, 8])
  assert.deepEqual(shuffle(src, mulberry32(7)), out)
})
