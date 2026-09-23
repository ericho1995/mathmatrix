// Appends plain four-option multiple-choice items for one year level to
// bank.ts as a new BANK_PART.
//
//   node scripts/authoring/append-mc.mjs <items.mjs> <year_level> <PART_NAME> [--dry]
//
// Run from the repository root. The items file exports HEADER and ITEMS:
//
//   { topic, d, q, options, correct: 0, e, code? }
//
// Write each item's correct option first; balance() spreads the answer
// letters within each topic (numeric options are sorted ascending instead, as
// papers print them). Refuses to write if an item repeats a question already
// in the bank at this year level or its options are malformed. Afterwards run
// `npm run gen` and `npm run verify-bank`, which also checks the arithmetic in
// explanations.
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { balance } from './balance.mjs'

const [itemsPath, yearLevel, partName, flag] = process.argv.slice(2)
if (!itemsPath || !yearLevel || !partName) {
  console.error('Usage: node scripts/authoring/append-mc.mjs <items.mjs> <year_level> <PART_NAME> [--dry]')
  process.exit(2)
}
const dry = flag === '--dry'
const { HEADER, ITEMS } = await import(pathToFileURL(resolve(itemsPath)).href + '?t=' + Date.now())

const bankPath = 'src/lib/questions/bank.ts'
let bank = readFileSync(bankPath, 'utf8').replace(/\r\n/g, '\n')
if (bank.includes(`const ${partName}:`)) throw new Error(`${partName} already exists`)

const levelRe = new RegExp(`\\{\\s*id: '[^']+',\\s*topic: '\\w+',\\s*year_level: '${yearLevel}'[\\s\\S]*?\\n  \\},`, 'g')
const existingStems = new Set()
for (const m of bank.matchAll(levelRe)) {
  const qt = m[0].match(/question_text: (["'])((?:\\.|(?!\1).)*)\1/)
  if (qt) existingStems.add((qt[1] === '"' ? JSON.parse(`"${qt[2]}"`) : qt[2].replace(/\\n/g, '\n').replace(/\\'/g, "'")).trim())
}

const items = balance(ITEMS)
const problems = []
const stems = new Set()
const byTopic = {}
for (const [k, i] of items.entries()) {
  const where = `item ${k + 1} (${i.q.slice(0, 45).replace(/\n/g, ' ')}…)`
  if (!i.topic || !i.d || !i.q || !i.e) problems.push(`${where}: needs topic, d, q and e`)
  if (!Array.isArray(i.options) || i.options.length !== 4) problems.push(`${where}: needs 4 options`)
  else if (new Set(i.options).size !== 4) problems.push(`${where}: duplicate options`)
  const t = i.q.trim()
  if (existingStems.has(t)) problems.push(`${where}: repeats an existing ${yearLevel} question`)
  if (stems.has(t)) problems.push(`${where}: same question twice in this batch`)
  stems.add(t)
  if (/practis/i.test(i.q + i.e + i.options.join(' '))) problems.push(`${where}: uses "practis-"`)
  ;(byTopic[i.topic] ??= [0, 0, 0, 0])[i.correct]++
}
console.log('answer positions by topic', JSON.stringify(byTopic))
for (const [topic, pos] of Object.entries(byTopic)) {
  const n = pos.reduce((a, b) => a + b, 0)
  if (n >= 8 && Math.max(...pos) / n > 0.4) problems.push(`${topic}: one answer position holds ${Math.max(...pos)} of ${n}`)
}
if (problems.length) {
  console.error('\nProblems:\n  ' + problems.join('\n  '))
  process.exit(1)
}

const q = s => JSON.stringify(s)
const emit = i => [
  '  {',
  `    topic: '${i.topic}',`,
  `    year_level: '${yearLevel}',`,
  `    difficulty: '${i.d}',`,
  `    question_text: ${q(i.q)},`,
  `    options: ${JSON.stringify(i.options)},`,
  `    correct_index: ${i.correct},`,
  `    explanation: ${q(i.e)},`,
  ...(i.code ? [`    curriculum_code: '${i.code}',`] : []),
  '  },',
].join('\n')

const block = `${HEADER.trim().split('\n').map(l => `// ${l}`.trimEnd()).join('\n')}
const ${partName}: BankQuestion[] = [
${items.map(emit).join('\n')}
]

`
const exportAt = bank.indexOf('export const QUESTION_BANK: BankQuestion[] = [')
if (exportAt < 0) throw new Error('QUESTION_BANK export not found')
bank = bank.slice(0, exportAt) + block + bank.slice(exportAt)
bank = bank.replace(/(export const QUESTION_BANK: BankQuestion\[\] = \[[^\]]*)\]/, `$1, ...${partName}]`)
console.log(`appending ${items.length} ${yearLevel} items as ${partName}`)
if (dry) console.log('(dry run — bank.ts not written)')
else writeFileSync(bankPath, bank)
