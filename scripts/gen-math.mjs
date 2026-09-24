#!/usr/bin/env node
// Builds src/lib/pdf/math/cache.json — every piece of typeset maths the PDFs
// print, pre-rendered by MathJax into glyph outlines.
//
// Question text marks maths with \( … \) (inline) and \[ … \] (displayed on its
// own line). The PDF renderer draws each fragment from this cache, so MathJax
// never runs in production and a TeX error fails this script (and CI) instead
// of a customer's download. Run after any bank.ts or formula-sheet edit; it is
// part of `npm run gen`.
//
// Usage: node scripts/gen-math.mjs
import { readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import ts from 'typescript'
import { buildCache, fragments } from './lib/math.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const outDir = join(repoRoot, 'src/lib/pdf/math')
const outPath = join(outDir, 'cache.json')

// bank.ts: strip the types, the same way gen-exams.mjs reads it.
const src = readFileSync(join(repoRoot, 'src/lib/questions/bank.ts'), 'utf8').replace(/\r\n/g, '\n')
const jsSrc = src
  .replace(/^import type .+\n/m, '')
  .replace(/^type BankQuestion =[\s\S]*?\n\n/m, '')
  .replace(/const (\w+): BankQuestion\[\] = \[/g, 'const $1 = [')
const bankTmp = join(repoRoot, '.bank-tmp-math.mjs')
writeFileSync(bankTmp, jsSrc)
const { QUESTION_BANK } = await import('file://' + bankTmp)
unlinkSync(bankTmp)

// formulaSheets.ts has no runtime imports, so a plain transpile is enough.
const sheetSrc = readFileSync(join(repoRoot, 'src/lib/pdf/formulaSheets.ts'), 'utf8')
const sheetTmp = join(repoRoot, '.formula-sheets-tmp.mjs')
writeFileSync(sheetTmp, ts.transpileModule(sheetSrc, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText)
const { FORMULA_SHEETS } = await import('file://' + sheetTmp)
unlinkSync(sheetTmp)

const texts = []
for (const q of QUESTION_BANK) {
  texts.push(q.question_text, q.explanation, ...(q.options ?? []))
  for (const p of q.parts ?? []) texts.push(p.prompt, p.expected_answer, p.explanation)
}
for (const sheet of Object.values(FORMULA_SHEETS)) {
  for (const section of sheet.sections) {
    for (const row of section.rows) texts.push(row.label, ...row.cells)
  }
}

const list = texts.flatMap(fragments)
const { cache, errors } = buildCache(list)
if (errors.length) {
  console.error(`gen-math: ${errors.length} formula(s) failed to typeset:`)
  for (const e of errors) console.error('  ' + e)
  process.exit(1)
}

// One formula per line, so a content change shows up as a readable diff.
const lines = [
  '{',
  `"v":${cache.v},`,
  '"glyphs":[',
  cache.glyphs.map(g => JSON.stringify(g)).join(',\n'),
  '],',
  '"f":{',
  Object.entries(cache.f).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n'),
  '}',
  '}',
]
mkdirSync(outDir, { recursive: true })
writeFileSync(outPath, lines.join('\n') + '\n')
console.log(`Wrote ${Object.keys(cache.f).length} formulas (${cache.glyphs.length} glyphs) to src/lib/pdf/math/cache.json`)
