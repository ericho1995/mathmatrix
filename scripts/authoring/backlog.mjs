// The question-bank backlog: for every diagnostic test on offer, how many
// catalogue questions each skill area has for weak-areas papers to draw on,
// thinnest first. The same pool and areas the papers use (tailor.ts
// paperPool, areas.ts classify), so it predicts the admin alerts before
// children hit them.
//
//   node scripts/authoring/backlog.mjs [--all] [--below=24]
//
// "papers" is roughly how many weak-areas papers one child could get from the
// area before it runs dry, at about 10 questions of an area per paper.
import { QUESTION_BANK } from '../../src/lib/questions/bank.ts'
import { PRACTICE_EXAMS } from '../../src/lib/questions/exams.ts'
import { offeredTests } from '../../src/lib/diagnostic/blueprint.ts'
import { paperPool } from '../../src/lib/diagnostic/tailor.ts'
import { classify, areasFor } from '../../src/lib/diagnostic/areas.ts'

const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')))
const below = Number(args.below ?? 24)
const PER_PAPER = 10

const catalogue = new Set(PRACTICE_EXAMS.flatMap(e => e.sections.flatMap(s => s.question_ids)))
const bank = QUESTION_BANK.filter(q => catalogue.has(q.id))

const rows = []
for (const { year, subject } of offeredTests(QUESTION_BANK)) {
  const pool = paperPool(bank, year, subject)
  const counts = new Map(areasFor(subject, year).map(a => [a.id, { label: a.label, n: 0 }]))
  for (const q of pool) {
    const a = classify(q).area
    if (!counts.has(a.id)) counts.set(a.id, { label: a.label, n: 0 })
    counts.get(a.id).n++
  }
  for (const [id, { label, n }] of counts) rows.push({ year, subject, area: id, label, n, papers: Math.floor(n / PER_PAPER) })
}
rows.sort((a, b) => a.n - b.n)
const shown = args.all ? rows : rows.filter(r => r.n < below)
const pad = (s, n) => String(s).padEnd(n)
console.log(pad('year', 9) + pad('subject', 16) + pad('area', 34) + pad('questions', 11) + 'papers')
for (const r of shown) console.log(pad(r.year, 9) + pad(r.subject, 16) + pad(r.label, 34) + pad(r.n, 11) + r.papers)
console.log(`\n${shown.length} of ${rows.length} areas under ${below} questions; ${rows.reduce((s, r) => s + r.n, 0)} questions in all`)
