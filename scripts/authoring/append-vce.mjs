// Appends a batch of VCE Unit 3 & 4 items (multiple choice and extended
// response) to bank.ts as a new BANK_PART.
//
//   node scripts/authoring/append-vce.mjs <items.mjs> [--dry]
//
// The items file exports ITEMS, each either
//
//   multiple choice: { t: topic, s: practice_set, d: difficulty, calc: boolean,
//                      q, o: [correct, ...four distractors], e, code, diagram? }
//   extended:        { t, s, d, calc, q, p: [[label, prompt, marks, expected, explanation], ...],
//                      code, diagram? }
//
// Write the correct option first. VCAA multiple choice has five options (A-E):
// numeric option sets are printed in ascending order, as the real papers do,
// and text options are rotated onto the least-used letter within each
// subject and practice set, so no paper leans on one letter. Afterwards run
// `npm run gen` and `npm run verify-bank`.
import { readFileSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const [itemsPath, flag] = process.argv.slice(2)
if (!itemsPath) {
  console.error('Usage: node scripts/authoring/append-vce.mjs <items.mjs> [--dry]')
  process.exit(2)
}
const { ITEMS } = await import(pathToFileURL(resolve(itemsPath)).href + '?t=' + Date.now())

const bankPath = 'src/lib/questions/bank.ts'
const raw = readFileSync(bankPath, 'utf8')
const crlf = raw.includes('\r\n')
let bank = raw.replace(/\r\n/g, '\n')

const num = s => {
  const m = String(s).replace(/[−–]/g, '-').replace(/[$,\s]/g, '').match(/^-?\d*\.?\d+/)
  return m && /^[-−–$\d.,\s]+[%a-zA-Z²³ ]*$/.test(String(s)) ? Number(m[0]) : NaN
}

// ── Validate and balance ──
const counts = {}
const keyOf = i => `${i.t.split('_')[0]}|${i.s}`
const out = ITEMS.map(i => ({ ...i }))
const textItems = []
for (const i of out) {
  if (!i.t || !i.s || !i.d || typeof i.calc !== 'boolean' || !i.q || !i.code) throw new Error(`incomplete item: ${String(i.q).slice(0, 60)}`)
  if (i.o) {
    if (i.o.length !== 5) throw new Error(`needs 5 options: ${i.q.slice(0, 60)}`)
    if (new Set(i.o).size !== 5) throw new Error(`duplicate options: ${i.q.slice(0, 60)}`)
    if (!i.e) throw new Error(`no explanation: ${i.q.slice(0, 60)}`)
    const vals = i.o.map(num)
    const numeric = vals.every(v => !Number.isNaN(v)) && new Set(vals).size === 5
    if (numeric && !i.keep) {
      const right = i.o[0]
      i.o = i.o.map((o, k) => [o, vals[k]]).sort((a, b) => a[1] - b[1]).map(x => x[0])
      i.correct = i.o.indexOf(right)
      ;(counts[keyOf(i)] ??= [0, 0, 0, 0, 0])[i.correct]++
    } else if (i.keep) {
      i.correct = i.keep === true ? 0 : i.keep
      ;(counts[keyOf(i)] ??= [0, 0, 0, 0, 0])[i.correct]++
    } else textItems.push(i)
  } else if (i.p) {
    for (const part of i.p) {
      if (part.length !== 5 || !Number.isInteger(part[2]) || part[2] < 1) throw new Error(`bad part in: ${i.q.slice(0, 60)}`)
    }
  } else throw new Error(`neither options nor parts: ${i.q.slice(0, 60)}`)
}
for (const i of textItems) {
  const c = (counts[keyOf(i)] ??= [0, 0, 0, 0, 0])
  const target = c.indexOf(Math.min(...c))
  const [right, ...rest] = i.o
  i.o = [...rest.slice(0, target), right, ...rest.slice(target)]
  i.correct = target
  c[target]++
}

// ── Emit ──
const s = v => JSON.stringify(v)
const lines = []
for (const i of out) {
  const f = [`    id: '${randomUUID()}',`, `    topic: '${i.t}',`, `    year_level: 'year_12',`, `    difficulty: '${i.d}',`]
  if (i.p) f.push(`    format: 'extended_response',`)
  f.push(`    calculator_allowed: ${i.calc},`)
  if (i.o) f.push(`    marks: 1,`)
  f.push(`    practice_set: ${i.s},`)
  if (i.diagram) f.push(`    diagram: ${s(i.diagram)},`)
  f.push(`    question_text: ${s(i.q)},`)
  if (i.o) {
    f.push(`    options: ${s(i.o)},`, `    correct_index: ${i.correct},`, `    explanation: ${s(i.e)},`)
  } else {
    f.push(`    parts: [`)
    for (const [label, prompt, marks, expected, explanation] of i.p) {
      f.push(`      { label: ${s(label)}, prompt: ${s(prompt)}, marks: ${marks}, expected_answer: ${s(expected)}, explanation: ${s(explanation)} },`)
    }
    f.push(`    ],`, `    explanation: "See the per-part marking guidance.",`)
  }
  f.push(`    curriculum_code: '${i.code}',`)
  lines.push(`  {\n${f.join('\n')}\n  },`)
}

const parts = [...bank.matchAll(/const BANK_PART_(\d+): BankQuestion\[\]/g)].map(m => Number(m[1]))
const partName = `BANK_PART_${Math.max(...parts) + 1}`
const block = `const ${partName}: BankQuestion[] = [\n${lines.join('\n')}\n]\n\n`
const exportAt = bank.indexOf('export const QUESTION_BANK')
bank = bank.slice(0, exportAt) + block + bank.slice(exportAt)
bank = bank.replace(/(export const QUESTION_BANK: BankQuestion\[\] = \[[^\]]*)\]/, `$1, ...${partName}]`)

const summary = {}
for (const i of out) summary[keyOf(i) + (i.o ? ' mc' : ' ext')] = (summary[keyOf(i) + (i.o ? ' mc' : ' ext')] ?? 0) + 1
console.log(partName, out.length, 'items', summary, 'answer letters', counts)
if (flag !== '--dry') writeFileSync(bankPath, crlf ? bank.replace(/\n/g, '\r\n') : bank)
