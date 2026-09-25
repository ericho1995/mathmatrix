// Prints what the existing Physics sets already ask, one line per question,
// so a new set can choose different archetypes and contexts without reading
// every set file. Also prints the answer-letter spread per area of study.
//
//   node scripts/authoring/physics/coverage.mjs [--topic phys_fields]
import { readdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const topicArg = process.argv.indexOf('--topic')
const only = topicArg > 0 ? process.argv[topicArg + 1] : null
const plain = s => s.replace(/\\\(|\\\)|\\\[|\\\]/g, '').replace(/\\(dfrac|frac)\{([^}]*)\}\{([^}]*)\}/g, '($2)/($3)').replace(/\\[a-zA-Z]+/g, m => m.slice(1)).replace(/[{}]/g, '').replace(/\s+/g, ' ')

const letters = {}
const files = readdirSync(here).filter(f => /^set-\d+\.mjs$/.test(f)).sort((a, b) => parseInt(a.slice(4)) - parseInt(b.slice(4)))
for (const f of files) {
  const { ITEMS } = await import(pathToFileURL(join(here, f)).href)
  console.log(`\n# ${f}`)
  for (const i of ITEMS) {
    const area = i.topic.replace('phys_', '')
    if (i.options) (letters[area] ??= [0, 0, 0, 0])[i.index]++
    if (only && i.topic !== only) continue
    const marks = i.parts ? i.parts.reduce((s, p) => s + p.marks, 0) : 1
    const parts = i.parts && i.parts.length > 1 ? ` [${i.parts.map(p => p.label).join('')}]` : ''
    const answer = i.options ? ` → ${'ABCD'[i.index]}` : ''
    console.log(`${i.key.startsWith('a') ? 'A' : 'B'} ${i.key.padEnd(5)} ${area.padEnd(17)} ${String(marks).padStart(2)}m ${plain(i.stem).slice(0, 95)}${parts}${answer}`)
  }
}
console.log('\nSection A answer letters by area (A/B/C/D) — steer new sets towards the smaller counts:')
for (const [area, n] of Object.entries(letters)) console.log(`  ${area.padEnd(17)} ${n.join('/')}`)
