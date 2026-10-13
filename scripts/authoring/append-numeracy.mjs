// Appends numeracy items for one year level to bank.ts as a new BANK_PART:
// four-option multiple choice, picture-option multiple choice and short answer,
// with or without a calculator.
//
//   node scripts/authoring/append-numeracy.mjs <items.mjs> <year_level> <PART_NAME> [--dry]
//
// Run from the repository root. The items file exports HEADER and ITEMS:
//
//   multiple choice  { topic, d, q, options, correct: 0, e, calc?, code?, diagram? }
//   picture options  { topic, d, q, option_diagrams, correct, e, calc?, code?, diagram? }
//   short answer     { topic, d, q, answer, accept?, e, calc?, code?, diagram? }
//
// `calc` is required from Year 7, where a numeracy paper has a calculator and a
// non-calculator section. Write each multiple-choice item's correct option
// first; balance() spreads the answer letters within each topic and section
// (numeric options are sorted ascending instead, as papers print them).
// Picture-option items keep the `correct` they are given. Refuses to write if
// an item repeats a question already in the bank at this year level, or its
// options or answer are malformed. Afterwards run `npm run gen` and
// `npm run verify-bank`, which also checks the arithmetic in explanations.
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { balance } from './balance.mjs'

const [itemsPath, yearLevel, partName, flag] = process.argv.slice(2)
if (!itemsPath || !yearLevel || !partName) {
  console.error('Usage: node scripts/authoring/append-numeracy.mjs <items.mjs> <year_level> <PART_NAME> [--dry]')
  process.exit(2)
}
const dry = flag === '--dry'
const { HEADER, ITEMS } = await import(pathToFileURL(resolve(itemsPath)).href + '?t=' + Date.now())

const TOPICS = new Set(['number_operations', 'number_patterns', 'algebra_equations', 'geometry_measurement', 'statistics_probability'])
const LEVELS = new Set(['foundation', 'developing', 'proficient', 'advanced'])
const CALC_YEARS = new Set(['year_7', 'year_8', 'year_9', 'year_10'])

const bankPath = 'src/lib/questions/bank.ts'
let bank = readFileSync(bankPath, 'utf8').replace(/\r\n/g, '\n')
if (bank.includes(`const ${partName}:`)) throw new Error(`${partName} already exists`)

const levelRe = new RegExp(`\\{\\s*id: '[^']+',\\s*topic: '\\w+',\\s*year_level: '${yearLevel}'[\\s\\S]*?\\n  \\},`, 'g')
const existingStems = new Set()
for (const m of bank.matchAll(levelRe)) {
  const qt = m[0].match(/question_text: (["'])((?:\\.|(?!\1).)*)\1/)
  if (qt) existingStems.add((qt[1] === '"' ? JSON.parse(`"${qt[2]}"`) : qt[2].replace(/\\n/g, '\n').replace(/\\'/g, "'")).trim())
}

const items = balance(ITEMS.map(i => ({ ...i, sa: i.answer !== undefined, keep: Boolean(i.option_diagrams) })))
const problems = []
const stems = new Set()
const byKey = {}
const tally = { mc: 0, sa: 0, graphical: 0, calc: 0 }
for (const [k, i] of items.entries()) {
  const where = `item ${k + 1} (${String(i.q).slice(0, 45).replace(/\n/g, ' ')}…)`
  if (!TOPICS.has(i.topic)) problems.push(`${where}: unknown numeracy topic ${i.topic}`)
  if (!LEVELS.has(i.d)) problems.push(`${where}: unknown difficulty ${i.d}`)
  if (!i.q || !i.e) problems.push(`${where}: needs q and e`)
  if (CALC_YEARS.has(yearLevel) && typeof i.calc !== 'boolean') problems.push(`${where}: needs calc: true or false at ${yearLevel}`)
  if (i.sa) {
    if (typeof i.answer !== 'string' || !i.answer.trim()) problems.push(`${where}: answer must be a non-empty string`)
    if (i.options || i.option_diagrams) problems.push(`${where}: a short answer has no options`)
    if (i.accept && !Array.isArray(i.accept)) problems.push(`${where}: accept must be an array`)
    tally.sa++
  } else if (i.option_diagrams) {
    if (!Array.isArray(i.option_diagrams) || i.option_diagrams.length !== 4) problems.push(`${where}: needs 4 option_diagrams`)
    else if (new Set(i.option_diagrams.map(d => JSON.stringify(d))).size !== 4) problems.push(`${where}: duplicate option_diagrams`)
    if (![0, 1, 2, 3].includes(i.correct)) problems.push(`${where}: picture options need correct 0-3`)
    tally.mc++
  } else {
    if (!Array.isArray(i.options) || i.options.length !== 4) problems.push(`${where}: needs 4 options`)
    else if (new Set(i.options).size !== 4) problems.push(`${where}: duplicate options`)
    tally.mc++
  }
  if (i.diagram || i.option_diagrams) tally.graphical++
  if (i.calc) tally.calc++
  const t = String(i.q).trim()
  if (existingStems.has(t)) problems.push(`${where}: repeats an existing ${yearLevel} question`)
  if (stems.has(t)) problems.push(`${where}: same question twice in this batch`)
  stems.add(t)
  if (/practis/i.test([i.q, i.e, ...(i.options ?? []), i.answer ?? ''].join(' '))) problems.push(`${where}: uses "practis-"`)
  if (!i.sa) (byKey[`${i.topic}${CALC_YEARS.has(yearLevel) ? (i.calc ? ' calc' : ' no-calc') : ''}`] ??= [0, 0, 0, 0])[i.correct]++
}
console.log(`${items.length} items: ${tally.mc} multiple choice, ${tally.sa} short answer, ${tally.graphical} graphical${CALC_YEARS.has(yearLevel) ? `, ${tally.calc} calculator` : ''}`)
console.log('answer positions', JSON.stringify(byKey))
for (const [key, pos] of Object.entries(byKey)) {
  const n = pos.reduce((a, b) => a + b, 0)
  if (n >= 8 && Math.max(...pos) / n > 0.4) problems.push(`${key}: one answer position holds ${Math.max(...pos)} of ${n}`)
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
  ...(i.sa ? [`    format: 'short_answer',`] : []),
  ...(typeof i.calc === 'boolean' ? [`    calculator_allowed: ${i.calc},`] : []),
  ...(i.diagram ? [`    diagram: ${JSON.stringify(i.diagram)},`] : []),
  ...(i.option_diagrams ? [`    option_diagrams: ${JSON.stringify(i.option_diagrams)},`] : []),
  `    question_text: ${q(i.q)},`,
  ...(i.sa
    ? [`    expected_answer: ${q(i.answer)},`, ...(i.accept?.length ? [`    accepted_answers: ${JSON.stringify(i.accept)},`] : [])]
    : [`    options: ${JSON.stringify(i.option_diagrams ? ['', '', '', ''] : i.options)},`, `    correct_index: ${i.correct},`]),
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
