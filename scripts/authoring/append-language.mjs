// Appends Language Conventions items (spelling and grammar & punctuation) for
// one year level to bank.ts as a new BANK_PART.
//
//   node scripts/authoring/append-language.mjs <items.mjs> <year_level> <PART_NAME> [--dry]
//
// Run from the repository root. The items file exports HEADER, SPELLING and
// GRAMMAR:
//
//   SPELLING: { wrong, word, s, d, tip? }
//     `s` is the sentence as printed, containing `wrong` (the misspelling);
//     `word` is the correct spelling the student writes. `tip` is an optional
//     spelling rule added to the explanation.
//   GRAMMAR:  { q, options, correct: 0, e, d, code? }
//     Written with the correct option first; this script spreads the answer
//     letters across the part.
//
// Refuses to write if a misspelling is missing from its sentence, a spelling
// word is already tested at this year level, a question repeats one already in
// the bank, or the options are malformed. Afterwards run `npm run gen` and
// `npm run verify-bank`.
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { balance } from './balance.mjs'

const [itemsPath, yearLevel, partName, flag] = process.argv.slice(2)
if (!itemsPath || !yearLevel || !partName) {
  console.error('Usage: node scripts/authoring/append-language.mjs <items.mjs> <year_level> <PART_NAME> [--dry]')
  process.exit(2)
}
const dry = flag === '--dry'
const { HEADER, SPELLING = [], GRAMMAR = [] } = await import(pathToFileURL(resolve(itemsPath)).href + '?t=' + Date.now())

// Curriculum codes by year level, matching the existing items.
const CODES = {
  grade_3: { spelling: 'AC9E3LY09', grammar: 'AC9E3LA07' },
  grade_4: { spelling: 'AC9E4LY10', grammar: 'AC9E4LA07' },
  grade_5: { spelling: 'AC9E5LY09', grammar: 'AC9E5LA07' },
  grade_6: { spelling: 'AC9E6LY10', grammar: 'AC9E6LA07' },
  year_7: { spelling: 'AC9E7LY09', grammar: 'AC9E7LA07' },
  year_8: { spelling: 'AC9E8LY09', grammar: 'AC9E8LA07' },
  year_9: { spelling: 'AC9E9LY09', grammar: 'AC9E9LA07' },
  year_10: { spelling: 'AC9E10LY09', grammar: 'AC9E10LA07' },
}
const codes = CODES[yearLevel]
if (!codes) throw new Error(`no curriculum codes for ${yearLevel}`)

const bankPath = 'src/lib/questions/bank.ts'
let bank = readFileSync(bankPath, 'utf8').replace(/\r\n/g, '\n')
if (bank.includes(`const ${partName}:`)) throw new Error(`${partName} already exists`)

// What this year level already tests, so nothing is asked twice.
const levelRe = new RegExp(`\\{\\s*id: '[^']+',\\s*topic: 'grammar_punctuation',\\s*year_level: '${yearLevel}'[\\s\\S]*?\\n  \\},`, 'g')
const existingWords = new Set()
const existingStems = new Set()
for (const m of bank.matchAll(levelRe)) {
  const ea = m[0].match(/expected_answer: ["']([^"']+)/)
  if (ea) existingWords.add(ea[1].toLowerCase())
  const qt = m[0].match(/question_text: (["'])((?:\\.|(?!\1).)*)\1/)
  if (qt) {
    const text = qt[1] === '"' ? JSON.parse(`"${qt[2]}"`) : qt[2].replace(/\\n/g, '\n').replace(/\\'/g, "'")
    existingStems.add(text.trim())
  }
}

const SPELL_PROMPT = 'One word in this sentence is spelt incorrectly. Write the correct spelling of that word.\n'
const problems = []
const seenWords = new Set()
const items = []
for (const [k, sp] of SPELLING.entries()) {
  const where = `spelling ${k + 1} (${sp.word})`
  if (!sp.wrong || !sp.word || !sp.s || !sp.d) problems.push(`${where}: needs wrong, word, s and d`)
  else {
    if (!new RegExp(`\\b${sp.wrong}\\b`).test(sp.s)) problems.push(`${where}: the sentence does not contain "${sp.wrong}"`)
    if (new RegExp(`\\b${sp.word}\\b`, 'i').test(sp.s)) problems.push(`${where}: the sentence already contains the correct spelling`)
    if (sp.wrong.toLowerCase() === sp.word.toLowerCase()) problems.push(`${where}: misspelling equals the word`)
    if (existingWords.has(sp.word.toLowerCase())) problems.push(`${where}: "${sp.word}" is already tested at ${yearLevel}`)
    if (seenWords.has(sp.word.toLowerCase())) problems.push(`${where}: "${sp.word}" appears twice in this batch`)
    seenWords.add(sp.word.toLowerCase())
  }
  items.push({
    kind: 'spelling',
    difficulty: sp.d,
    question_text: SPELL_PROMPT + sp.s,
    expected_answer: sp.word,
    explanation: `The correct spelling is "${sp.word}".${sp.tip ? ' ' + sp.tip : ''}`,
    code: codes.spelling,
  })
}
const grammar = balance(GRAMMAR.map(g => ({ ...g, topic: 'grammar_punctuation' })))
for (const [k, g] of grammar.entries()) {
  const where = `grammar ${k + 1} (${g.q.slice(0, 40).replace(/\n/g, ' ')}…)`
  if (!g.q || !g.e || !g.d) problems.push(`${where}: needs q, e and d`)
  if (!Array.isArray(g.options) || g.options.length !== 4) problems.push(`${where}: needs 4 options`)
  else if (new Set(g.options).size !== 4) problems.push(`${where}: duplicate options`)
  items.push({
    kind: 'grammar',
    difficulty: g.d,
    question_text: g.q,
    options: g.options,
    correct_index: g.correct,
    explanation: g.e,
    code: g.code ?? codes.grammar,
  })
}
const stems = new Set()
for (const it of items) {
  const t = it.question_text.trim()
  if (existingStems.has(t)) problems.push(`repeats an existing ${yearLevel} question: ${t.slice(0, 60)}`)
  if (stems.has(t)) problems.push(`same question twice in this batch: ${t.slice(0, 60)}`)
  stems.add(t)
  if (/practis/i.test(t + (it.explanation ?? '') + (it.options ?? []).join(' '))) problems.push(`uses "practis-": ${t.slice(0, 60)}`)
}
const pos = [0, 0, 0, 0]
for (const g of grammar) pos[g.correct]++
console.log(`${SPELLING.length} spelling, ${GRAMMAR.length} grammar & punctuation; answer positions ${JSON.stringify(pos)}`)
if (grammar.length && Math.max(...pos) / grammar.length > 0.35) problems.push(`one answer position holds ${Math.max(...pos)} of ${grammar.length}`)
if (problems.length) {
  console.error('\nProblems:\n  ' + problems.join('\n  '))
  process.exit(1)
}

const q = s => JSON.stringify(s)
const emit = it => {
  const lines = ['  {', `    topic: 'grammar_punctuation',`, `    year_level: '${yearLevel}',`, `    difficulty: '${it.difficulty}',`]
  if (it.kind === 'spelling') lines.push(`    format: 'short_answer',`)
  lines.push(`    question_text: ${q(it.question_text)},`)
  if (it.kind === 'spelling') lines.push(`    expected_answer: ${q(it.expected_answer)},`)
  else {
    lines.push(`    options: ${JSON.stringify(it.options)},`)
    lines.push(`    correct_index: ${it.correct_index},`)
  }
  lines.push(`    explanation: ${q(it.explanation)},`)
  lines.push(`    curriculum_code: '${it.code}',`)
  lines.push('  },')
  return lines.join('\n')
}
const block = `${HEADER.trim().split('\n').map(l => `// ${l}`.trimEnd()).join('\n')}
const ${partName}: BankQuestion[] = [
${items.map(emit).join('\n')}
]

`
const exportAt = bank.indexOf('export const QUESTION_BANK: BankQuestion[] = [')
if (exportAt < 0) throw new Error('QUESTION_BANK export not found')
bank = bank.slice(0, exportAt) + block + bank.slice(exportAt)
bank = bank.replace(/(export const QUESTION_BANK: BankQuestion\[\] = \[[^\]]*)\]/, `$1, ...${partName}]`)
console.log(`appending ${items.length} ${yearLevel} Language Conventions items as ${partName}`)
if (dry) console.log('(dry run — bank.ts not written)')
else writeFileSync(bankPath, bank)
