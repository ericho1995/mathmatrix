// Writes every Specialist Mathematics Unit 3 & 4 practice set into bank.ts.
//
//   node scripts/authoring/specialist/build.mjs [--dry]
//
// Reads set-1.mjs, set-2.mjs, … from this folder and replaces the whole
// BANK_SPECIALIST_U34 array in bank.ts with them, so it is safe to re-run after
// any edit. Question ids are derived from the set and the question's place in
// the paper, so an edited question keeps its id (and its attempt history).
// Year 12 Specialist questions anywhere else in the bank are removed — the
// sets here are the whole of the Year 12 Specialist catalogue.
//
// Afterwards: npm run gen && npm run verify-bank.
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
for (const f of files) {
  const mod = await import(pathToFileURL(join(here, f)).href + '?t=' + Date.now())
  items.push(...mod.ITEMS)
}

// ── Validate ──
const fail = msg => { console.error('✗ ' + msg); process.exitCode = 1 }
const bySet = new Map()
for (const i of items) {
  const where = `set ${i.set} ${i.key}`
  if (!i.topic || !i.set || !i.difficulty || !i.stem || !i.code) fail(`${where}: incomplete`)
  if (i.options) {
    if (i.options.length !== 4) fail(`${where}: needs 4 options`)
    if (new Set(i.options).size !== i.options.length) fail(`${where}: duplicate options`)
    if (!i.explanation || i.explanation.length < 30) fail(`${where}: needs a worked explanation`)
  } else {
    if (!i.parts?.length) fail(`${where}: no parts`)
    for (const p of i.parts ?? []) {
      // A question with no sub-parts is one part with an empty label and prompt.
      const whole = i.parts.length === 1 && p.label === '' && p.prompt === ''
      if ((!whole && (!p.label || !p.prompt)) || !Number.isInteger(p.marks) || p.marks < 1 || !p.expected_answer || !p.explanation) fail(`${where} part ${p.label}: incomplete`)
    }
    const labels = (i.parts ?? []).map(p => p.label)
    if (new Set(labels).size !== labels.length) fail(`${where}: duplicate part labels`)
  }
  if (!bySet.has(i.set)) bySet.set(i.set, [])
  bySet.get(i.set).push(i)
}
const marks = i => (i.parts ? i.parts.reduce((s, p) => s + p.marks, 0) : 1)
for (const [set, list] of bySet) {
  const e1 = list.filter(i => i.key.startsWith('e1'))
  const a = list.filter(i => i.key.startsWith('a'))
  const b = list.filter(i => i.key.startsWith('b'))
  const m1 = e1.reduce((s, i) => s + marks(i), 0)
  const mb = b.reduce((s, i) => s + marks(i), 0)
  const letters = [0, 0, 0, 0]
  for (const i of a) letters[i.index]++
  console.log(`set ${set}: Exam 1 ${e1.length} questions / ${m1} marks; Section A ${a.length}; Section B ${b.length} questions / ${mb} marks; answer letters A-D ${letters.join('/')}`)
  if (m1 !== 40) fail(`set ${set}: Exam 1 is ${m1} marks, not 40`)
  if (a.length !== 20) fail(`set ${set}: Section A has ${a.length} questions, not 20`)
  if (mb !== 60) fail(`set ${set}: Section B is ${mb} marks, not 60`)
}
if (process.exitCode) process.exit(1)

// ── Emit ──
const uuid = key => {
  const h = createHash('sha1').update(`prepnest|specialist-u34|${key}`).digest('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h[16], 16) & 3) | 8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`
}
const s = v => JSON.stringify(v)
const lines = []
for (const i of items) {
  const f = [
    `    id: '${uuid(`set${i.set}|${i.key}`)}',`,
    `    topic: '${i.topic}',`,
    `    year_level: 'year_12',`,
    `    difficulty: '${i.difficulty}',`,
  ]
  if (i.parts) f.push(`    format: 'extended_response',`)
  f.push(`    calculator_allowed: ${i.calc},`)
  if (i.options) f.push(`    marks: 1,`)
  f.push(`    practice_set: ${i.set},`)
  if (i.diagram) f.push(`    diagram: ${s(i.diagram)},`)
  f.push(`    question_text: ${s(i.stem)},`)
  if (i.options) {
    f.push(`    options: ${s(i.options)},`, `    correct_index: ${i.index},`, `    explanation: ${s(i.explanation)},`)
  } else {
    f.push(`    parts: [`)
    for (const p of i.parts) {
      const extra = [p.lines !== undefined ? `lines: ${p.lines}` : null, p.diagram ? `diagram: ${s(p.diagram)}` : null].filter(Boolean)
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

const NAME = 'BANK_SPECIALIST_U34'
// Remove this script's own block (from an earlier run) and its export entry.
const start = bank.indexOf(`const ${NAME}: BankQuestion[] = [`)
if (start >= 0) {
  const end = bank.indexOf('\n]\n', start)
  bank = bank.slice(0, start) + bank.slice(end + 3).replace(/^\n/, '')
  bank = bank.replace(`, ...${NAME}]`, ']')
}

// Drop Year 12 Specialist questions held anywhere else in the bank.
const out = []
let removed = 0
const src = bank.split('\n')
for (let k = 0; k < src.length; k++) {
  if (src[k] !== '  {') { out.push(src[k]); continue }
  let j = k
  while (j < src.length && src[j] !== '  },') j++
  const block = src.slice(k, j + 1).join('\n')
  if (/topic: 'sm_\w+'/.test(block) && /year_level: 'year_12'/.test(block)) removed++
  else out.push(...src.slice(k, j + 1))
  k = j
}
bank = out.join('\n')

const block = `const ${NAME}: BankQuestion[] = [\n${lines.join('\n')}\n]\n\n`
const at = bank.indexOf('export const QUESTION_BANK')
bank = bank.slice(0, at) + block + bank.slice(at)
bank = bank.replace(/(export const QUESTION_BANK: BankQuestion\[\] = \[[^\]]*)\]/, (_m, head) => `${head}, ...${NAME}]`)
console.log(`${items.length} Specialist items from ${files.length} set file(s); ${removed} earlier Year 12 Specialist items removed`)
if (!dry) writeFileSync(bankPath, crlf ? bank.replace(/\n/g, '\r\n') : bank)
