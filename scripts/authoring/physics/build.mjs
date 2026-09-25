// Writes every Physics Unit 3 & 4 practice exam into bank.ts.
//
//   node scripts/authoring/physics/build.mjs [--dry]
//
// Reads set-1.mjs, set-2.mjs, … from this folder and replaces the whole
// BANK_PHYSICS_U34 array in bank.ts, so it is safe to re-run after any edit.
// Question ids come from the set and the question's place in the paper, so an
// edited question keeps its id. Afterwards: npm run gen && npm run verify-bank.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '../../..')
const bankPath = join(repoRoot, 'src/lib/questions/bank.ts')
const dry = process.argv.includes('--dry')

const files = readdirSync(here).filter(f => /^set-\d+\.mjs$/.test(f)).sort((a, b) => parseInt(a.slice(4)) - parseInt(b.slice(4)))
const items = []
for (const f of files) items.push(...(await import(pathToFileURL(join(here, f)).href + '?t=' + Date.now())).ITEMS)

// ── Validate ──
const fail = msg => { console.error('✗ ' + msg); process.exitCode = 1 }
const bySet = new Map()
for (const i of items) {
  const where = `set ${i.set} ${i.key}`
  if (!i.topic || !i.set || !i.difficulty || !i.stem || !i.code) fail(`${where}: incomplete`)
  if (i.options) {
    if (i.options.length !== 4) fail(`${where}: needs 4 options`)
    if (new Set(i.options).size !== 4) fail(`${where}: duplicate options`)
    if (!i.explanation || i.explanation.length < 30) fail(`${where}: needs a worked explanation`)
    if (i.option_headers && i.options.some(o => o.split(' | ').length !== i.option_headers.length)) fail(`${where}: table option cells do not match the headers`)
  } else {
    if (!i.parts?.length) fail(`${where}: no parts`)
    for (const p of i.parts ?? []) {
      const whole = i.parts.length === 1 && p.label === '' && p.prompt === ''
      if ((!whole && (!p.label || !p.prompt)) || !Number.isInteger(p.marks) || p.marks < 1 || !p.expected_answer || !p.explanation) fail(`${where} part ${p.label}: incomplete`)
    }
  }
  if (!bySet.has(i.set)) bySet.set(i.set, [])
  bySet.get(i.set).push(i)
}
const marks = i => (i.parts ? i.parts.reduce((s, p) => s + p.marks, 0) : 1)
for (const [set, list] of bySet) {
  const a = list.filter(i => i.key.startsWith('a'))
  const b = list.filter(i => i.key.startsWith('b'))
  const mb = b.reduce((s, i) => s + marks(i), 0)
  const letters = [0, 0, 0, 0]
  for (const i of a) letters[i.index]++
  const byTopic = {}
  for (const i of list) byTopic[i.topic.replace('phys_', '')] = (byTopic[i.topic.replace('phys_', '')] ?? 0) + marks(i)
  console.log(`set ${set}: Section A ${a.length}; Section B ${b.length} questions / ${mb} marks; letters A-D ${letters.join('/')}; marks by area ${JSON.stringify(byTopic)}`)
  if (a.length !== 20) fail(`set ${set}: Section A has ${a.length} questions, not 20`)
  if (mb !== 100) fail(`set ${set}: Section B is ${mb} marks, not 100`)
}
if (process.exitCode) process.exit(1)

// ── Emit ──
const uuid = key => {
  const h = createHash('sha1').update(`prepnest|physics-u34|${key}`).digest('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h[16], 16) & 3) | 8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`
}
const s = v => JSON.stringify(v)
// A number never parts from its unit at a line break ("2.0 | m"), nor a unit
// from its partner ("m | s⁻¹"): join them with a no-break space, outside maths.
const UNIT = String.raw`(?:[kMGmμnc]?(?:m|s|g|N|V|A|Ω|Hz|eV|Wb|T|W|J|C|K)|ly|light-years?|years?|hours?|h|min|°C|%)`
const NUM_UNIT = new RegExp(String.raw`([\d⁰¹²³⁴⁵⁶⁷⁸⁹]) (${UNIT})(?=[\s⁻¹²³.,;:)]|$)`, 'g')
const UNIT_UNIT = /(^|[\s ])([A-Za-zΩ]{1,2}) ([A-Za-z]{1,2}[⁻¹²³]+)/g
const nb = text => text.split(/(\\\(.*?\\\)|\\\[.*?\\\])/s)
  .map((p, k) => (k % 2 ? p : p.replace(NUM_UNIT, '$1 $2').replace(UNIT_UNIT, '$1$2 $3').replace(/\b(Figure|Table) (\d)/g, '$1 $2')))
  .join('')
for (const i of items) {
  i.stem = nb(i.stem)
  if (i.explanation) i.explanation = nb(i.explanation)
  if (i.options) i.options = i.options.map(nb)
  for (const p of i.parts ?? []) Object.assign(p, { prompt: nb(p.prompt), expected_answer: nb(p.expected_answer), explanation: nb(p.explanation) })
}
const lines = []
for (const i of items) {
  const f = [`    id: '${uuid(`set${i.set}|${i.key}`)}',`, `    topic: '${i.topic}',`, `    year_level: 'year_12',`, `    difficulty: '${i.difficulty}',`]
  if (i.parts) f.push(`    format: 'extended_response',`)
  f.push(`    calculator_allowed: true,`)
  if (i.options) f.push(`    marks: 1,`)
  f.push(`    practice_set: ${i.set},`)
  if (i.diagram) f.push(`    diagram: ${s(i.diagram)},`)
  f.push(`    question_text: ${s(i.stem)},`)
  if (i.options) {
    f.push(`    options: ${s(i.options)},`, `    correct_index: ${i.index},`)
    if (i.option_headers) f.push(`    option_headers: ${s(i.option_headers)},`)
    f.push(`    explanation: ${s(i.explanation)},`)
  } else {
    f.push(`    parts: [`)
    for (const p of i.parts) {
      const extra = [p.lines !== undefined ? `lines: ${p.lines}` : null, p.unit !== undefined ? `unit: ${s(p.unit)}` : null, p.diagram ? `diagram: ${s(p.diagram)}` : null].filter(Boolean)
      f.push(`      { label: ${s(p.label)}, prompt: ${s(p.prompt)}, marks: ${p.marks}, expected_answer: ${s(p.expected_answer)}, explanation: ${s(p.explanation)}${extra.length ? ', ' + extra.join(', ') : ''} },`)
    }
    f.push(`    ],`, `    explanation: "See the worked solutions for each part.",`)
  }
  f.push(`    curriculum_code: '${i.code}',`)
  lines.push(`  {\n${f.join('\n')}\n  },`)
}

const raw = readFileSync(bankPath, 'utf8')
const crlf = raw.includes('\r\n')
let bank = raw.replace(/\r\n/g, '\n')
const NAME = 'BANK_PHYSICS_U34'
const start = bank.indexOf(`const ${NAME}: BankQuestion[] = [`)
if (start >= 0) {
  const end = bank.indexOf('\n]\n', start)
  bank = bank.slice(0, start) + bank.slice(end + 3).replace(/^\n/, '')
  bank = bank.replace(`, ...${NAME}]`, ']')
}
const block = `const ${NAME}: BankQuestion[] = [\n${lines.join('\n')}\n]\n\n`
const at = bank.indexOf('export const QUESTION_BANK')
bank = bank.slice(0, at) + block + bank.slice(at)
bank = bank.replace(/(export const QUESTION_BANK: BankQuestion\[\] = \[[^\]]*)\]/, (_m, head) => `${head}, ...${NAME}]`)
console.log(`${items.length} Physics Unit 3 & 4 items from ${files.length} set file(s)`)
if (!dry) writeFileSync(bankPath, crlf ? bank.replace(/\n/g, '\r\n') : bank)
