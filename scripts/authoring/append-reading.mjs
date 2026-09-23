// Appends the questions for one Reading Magazine to bank.ts as a new BANK_PART.
//
//   node scripts/authoring/append-reading.mjs <items.mjs> <year_level> <PART_NAME> [--dry]
//
// Run from the repository root. The items file exports SET (the magazine
// number), HEADER (the comment printed above the part) and ITEMS. Each item
// points at a magazine text through `stim`:
//
//   { topic, difficulty, code, stim, q, options, correct, e }
//   { topic, difficulty, code, stim, q, sa: true, answer, accepted?, e }
//
// Write each item's correct option first and pass the list through balance()
// from ./balance.mjs, which spreads the answer letters. This refuses to write
// anything if a stimulus id is not a text in the magazine, a text has no
// questions, a question names a page (the paper supplies the page), or one
// answer letter dominates. Afterwards run `npm run gen` and `npm run verify-bank`.
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { loadMagazines } from '../lib/content.mjs'

const [itemsPath, yearLevel, partName, flag] = process.argv.slice(2)
if (!itemsPath || !yearLevel || !partName) {
  console.error('Usage: node scripts/authoring/append-reading.mjs <items.mjs> <year_level> <PART_NAME> [--dry]')
  process.exit(2)
}
const dry = flag === '--dry'
const { ITEMS, HEADER, SET } = await import(pathToFileURL(resolve(itemsPath)).href + '?t=' + Date.now())
const READING = new Set(['reading_comprehension', 'reading_literary_analysis'])

const bankPath = 'src/lib/questions/bank.ts'
let bank = readFileSync(bankPath, 'utf8').replace(/\r\n/g, '\n')
if (bank.includes(`const ${partName}:`)) throw new Error(`${partName} already exists`)

const MAGAZINES = await loadMagazines(process.cwd())
const magazine = MAGAZINES.find(m => m.yearLevel === yearLevel && m.set === SET)
if (!magazine) throw new Error(`no magazine for ${yearLevel} set ${SET}`)
const byId = new Map(magazine.texts.map(t => [t.id, t]))
// An item may name its text by page number (`stim: 3`) instead of by id.
for (const i of ITEMS) {
  if (typeof i.stim === 'number') {
    const text = magazine.texts.find(t => t.page === i.stim)
    if (!text) throw new Error(`no text on page ${i.stim} of ${magazine.id}`)
    i.stim = text.id
  }
}

const problems = []
const perText = new Map()
const norm = s => s.replace(/\s+/g, ' ').trim().toLowerCase()
const seen = new Set()
for (const [idx, i] of ITEMS.entries()) {
  const where = `item ${idx + 1} (${i.q.slice(0, 45).replace(/\n/g, ' ')}…)`
  if (!READING.has(i.topic)) problems.push(`${where}: topic must be a reading topic`)
  if (!i.difficulty || !i.code || !i.e) problems.push(`${where}: missing difficulty/code/explanation`)
  if (!byId.has(i.stim)) problems.push(`${where}: stimulus id is not a text in this magazine`)
  else perText.set(i.stim, (perText.get(i.stim) ?? 0) + 1)
  if (i.sa) {
    if (!i.answer) problems.push(`${where}: short answer without an answer`)
    if (i.options) problems.push(`${where}: short answer with options`)
  } else {
    if (!Array.isArray(i.options) || i.options.length !== 4) problems.push(`${where}: needs 4 options`)
    if (!(i.correct >= 0 && i.correct < 4)) problems.push(`${where}: bad correct index`)
    if (new Set(i.options).size !== i.options.length) problems.push(`${where}: duplicate options`)
  }
  if (/\bpage \d/.test(i.q)) problems.push(`${where}: the page reference belongs to the paper, not the question`)
  if (/\\n/.test(i.q + i.e)) problems.push(`${where}: literal backslash-n in the text`)
  const t = norm(i.q)
  if (seen.has(t)) problems.push(`${where}: same question text twice in this batch`)
  seen.add(t)
}
for (const t of magazine.texts) {
  const n = perText.get(t.id) ?? 0
  console.log(`  p${t.page} ${t.title.padEnd(34)} ${t.type.padEnd(12)} ${n} questions`)
  if (!n) problems.push(`text "${t.title}" has no questions`)
}
const sa = ITEMS.filter(i => i.sa).length
console.log(`${ITEMS.length} questions (${sa} short answer) across ${magazine.texts.length} texts`)
const pos = [0, 0, 0, 0]
for (const i of ITEMS.filter(x => !x.sa)) pos[i.correct]++
console.log('answer positions', JSON.stringify(pos))
if (Math.max(...pos) / ITEMS.filter(i => !i.sa).length > 0.35) problems.push(`one answer position holds ${Math.max(...pos)} of ${ITEMS.length - sa}`)
if (problems.length) {
  console.error('\nProblems:\n  ' + problems.join('\n  '))
  process.exit(1)
}

const q = s => JSON.stringify(s)
// Questions print in magazine page order, then in the order written.
const order = new Map(magazine.texts.map((t, k) => [t.id, k]))
const sorted = [...ITEMS].sort((a, b) => order.get(a.stim) - order.get(b.stim))
const emit = i => {
  const lines = ['  {', `    topic: '${i.topic}',`, `    year_level: '${yearLevel}',`, `    difficulty: '${i.difficulty}',`]
  if (i.sa) lines.push(`    format: 'short_answer',`)
  lines.push(`    stimulus_id: '${i.stim}',`)
  lines.push(`    practice_set: ${SET},`)
  lines.push(`    question_text: ${q(i.q)},`)
  if (i.sa) {
    lines.push(`    expected_answer: ${q(i.answer)},`)
    if (i.accepted?.length) lines.push(`    accepted_answers: ${JSON.stringify(i.accepted)},`)
  } else {
    lines.push(`    options: ${JSON.stringify(i.options)},`)
    lines.push(`    correct_index: ${i.correct},`)
  }
  lines.push(`    explanation: ${q(i.e)},`)
  lines.push(`    curriculum_code: '${i.code}',`)
  lines.push('  },')
  return lines.join('\n')
}

const block = `${HEADER.trim().split('\n').map(l => `// ${l}`.trimEnd()).join('\n')}
const ${partName}: BankQuestion[] = [
${sorted.map(emit).join('\n')}
]

`
const exportAt = bank.indexOf('export const QUESTION_BANK: BankQuestion[] = [')
if (exportAt < 0) throw new Error('QUESTION_BANK export not found')
bank = bank.slice(0, exportAt) + block + bank.slice(exportAt)
bank = bank.replace(/(export const QUESTION_BANK: BankQuestion\[\] = \[[^\]]*)\]/, `$1, ...${partName}]`)
console.log(`\nappending ${ITEMS.length} ${yearLevel} reading questions as ${partName}`)
if (dry) console.log('(dry run — bank.ts not written)')
else writeFileSync(bankPath, bank)
