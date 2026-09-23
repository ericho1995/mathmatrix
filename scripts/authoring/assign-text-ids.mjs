// Gives every magazine text written as `id: 'new'` a fresh UUID.
//
//   node scripts/authoring/assign-text-ids.mjs
//
// Run from the repository root after adding texts to
// src/lib/questions/magazines.ts. Text ids become stimuli.id in the database,
// which is a uuid column, so a readable placeholder cannot stay.
import { readFileSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'

const path = 'src/lib/questions/magazines.ts'
const src = readFileSync(path, 'utf8')
let n = 0
const out = src.replace(/id: 'new'/g, () => {
  n++
  return `id: '${randomUUID()}'`
})
if (n) writeFileSync(path, out)
console.log(n ? `assigned ${n} text id(s)` : 'no new texts')
