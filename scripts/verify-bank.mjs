#!/usr/bin/env node
// Checks the question bank for the defect classes that have actually shipped
// here before. Every check below exists because something got through without
// it: questions pitched two year levels too high, four near-identical items in
// one paper, an item built from emoji the PDF font cannot render, options that
// no longer matched their own explanation.
//
// Errors fail the build. Warnings are reported but do not, because they are
// judgement calls that can legitimately be overridden.
//
// Usage: node scripts/verify-bank.mjs [--quiet]

import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const quiet = process.argv.includes('--quiet')

const errors = []
const warnings = []
const err = (msg, id) => errors.push(id ? `${msg}  [${id}]` : msg)
const warn = (msg, id) => warnings.push(id ? `${msg}  [${id}]` : msg)

function loadModule(relPath, exportName, transform = (s) => s) {
  const src = readFileSync(join(repoRoot, relPath), 'utf8')
  const js = transform(
    src
      .replace(/^import type .+\n/m, '')
      .replace(/^type BankQuestion =[\s\S]*?\n\n/m, '')
      .replace(/const (\w+): BankQuestion\[\] = \[/g, 'const $1 = [')
  )
  const tmp = join(repoRoot, `.verify-tmp-${exportName}.mjs`)
  writeFileSync(tmp, js)
  return import('file://' + tmp).then((m) => {
    unlinkSync(tmp)
    return m[exportName]
  })
}

const QUESTION_BANK = await loadModule('src/lib/questions/bank.ts', 'QUESTION_BANK')
const STIMULI = await loadModule('src/lib/questions/stimuli.ts', 'STIMULI', (s) =>
  s.replace(/export const STIMULI: Stimulus\[\] = \[/, 'export const STIMULI = [')
)
const ILLUSTRATIONS = existsSync(join(repoRoot, 'src/lib/questions/illustrations.ts'))
  ? await loadModule('src/lib/questions/illustrations.ts', 'ILLUSTRATIONS', (s) =>
      s.replace(/export const ILLUSTRATIONS: Record<string, Illustration> = \{/, 'export const ILLUSTRATIONS = {')
    )
  : {}

// ─── 1. Structure ────────────────────────────────────────────────────────────
for (const q of QUESTION_BANK) {
  const required = ['id', 'topic', 'year_level', 'difficulty', 'question_text', 'explanation']
  for (const f of required) if (!q[f]) err(`missing "${f}"`, q.id ?? '(no id)')

  if (q.format === 'long_form') {
    if (q.options || q.correct_index !== undefined) err('long_form must not carry options/correct_index', q.id)
  } else if (q.format === 'extended_response') {
    // VCE multi-part. The marks are the point of the format — a part worth no
    // marks, or a question whose parts do not add up, is a broken exam paper.
    if (!Array.isArray(q.parts) || q.parts.length === 0) {
      err('extended_response needs at least one part', q.id)
    } else {
      const labels = new Set()
      for (const p of q.parts) {
        if (!p.label) err('part is missing a label', q.id)
        else if (labels.has(p.label)) err(`part label "${p.label}" is used twice`, q.id)
        else labels.add(p.label)
        if (!p.prompt) err(`part ${p.label}: missing prompt`, q.id)
        if (!p.expected_answer) err(`part ${p.label}: missing expected_answer`, q.id)
        if (!p.explanation) err(`part ${p.label}: missing marking guidance`, q.id)
        if (typeof p.marks !== 'number' || !Number.isInteger(p.marks) || p.marks < 1)
          err(`part ${p.label}: marks must be a positive integer, got ${p.marks}`, q.id)
      }
    }
    if (q.options || q.correct_index !== undefined) err('extended_response must not carry options/correct_index', q.id)
  } else if (q.format === 'short_answer') {
    if (!q.expected_answer) err('short_answer missing expected_answer', q.id)
    if (q.options || q.correct_index !== undefined) err('short_answer must not carry options/correct_index', q.id)
  } else {
    if (!Array.isArray(q.options) || q.options.length < 2) err('multiple choice needs at least 2 options', q.id)
    else {
      if (new Set(q.options).size !== q.options.length) err(`duplicate option values: ${JSON.stringify(q.options)}`, q.id)
      if (typeof q.correct_index !== 'number' || q.correct_index < 0 || q.correct_index >= q.options.length)
        err(`correct_index ${q.correct_index} out of range`, q.id)
    }
  }
}

// ─── 2. Identity and duplication ─────────────────────────────────────────────
const byId = new Map()
for (const q of QUESTION_BANK) {
  if (byId.has(q.id)) err(`duplicate id`, q.id)
  byId.set(q.id, q)
}

const byStem = new Map()
for (const q of QUESTION_BANK) {
  const key = `${q.year_level}||${q.question_text.trim()}`
  if (!byStem.has(key)) byStem.set(key, [])
  byStem.get(key).push(q.id)
}
for (const [key, ids] of byStem) {
  if (ids.length > 1) err(`same question text appears ${ids.length}x in ${key.split('||')[0]}: ${ids.join(', ')}`)
}

// Near-duplicate option sets within the same topic + year level. Two questions
// sharing 3 of 4 option values are almost always the same item reworded, which
// is how a paper ends up asking the same thing twice.
const groups = new Map()
for (const q of QUESTION_BANK) {
  if (!Array.isArray(q.options)) continue
  const key = `${q.topic}||${q.year_level}`
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(q)
}
for (const [key, qs] of groups) {
  for (let i = 0; i < qs.length; i++) {
    for (let j = i + 1; j < qs.length; j++) {
      const a = new Set(qs[i].options)
      const shared = qs[j].options.filter((o) => a.has(o)).length
      const size = Math.min(qs[i].options.length, qs[j].options.length)
      // Only flag a fully identical answer set. Sharing 3 of 4 is common and
      // usually innocent — many science and probability items legitimately draw
      // from the same small set of plausible values.
      if (size >= 3 && shared === size && qs[i].options.length === qs[j].options.length) {
        warn(`${key}: identical answer set to ${qs[j].id}`, qs[i].id)
      }
    }
  }
}

// ─── 3. Answer-position distribution ─────────────────────────────────────────
// A batch generated without shuffling distractors lands every answer on the same
// index. That has shipped here before — 259 questions with correct_index 0.
for (const [key, qs] of groups) {
  const mc = qs.filter((q) => typeof q.correct_index === 'number')
  if (mc.length < 8) continue
  const counts = {}
  for (const q of mc) counts[q.correct_index] = (counts[q.correct_index] ?? 0) + 1
  const top = Math.max(...Object.values(counts))
  if (top / mc.length > 0.6) {
    warn(`${key}: ${top}/${mc.length} answers share one position — ${JSON.stringify(counts)}`)
  }
}

// ─── 4. Renderability ────────────────────────────────────────────────────────
// The embedded PDF font has no glyphs beyond the BMP. An emoji renders as a
// broken box, which once made a question unanswerable.
for (const q of QUESTION_BANK) {
  const partText = (q.parts ?? []).flatMap(p => [p.prompt, p.expected_answer, p.explanation])
  const text = [q.question_text, q.explanation, ...(q.options ?? []), q.expected_answer ?? '', ...partText].join('')
  for (const ch of text) {
    if (ch.codePointAt(0) > 0xffff) {
      err(`character U+${ch.codePointAt(0).toString(16).toUpperCase()} has no glyph in the PDF font`, q.id)
      break
    }
  }
}

// ─── 5. References resolve ───────────────────────────────────────────────────
const stimulusIds = new Set(STIMULI.map((s) => s.id))
for (const q of QUESTION_BANK) {
  if (q.stimulus_id && !stimulusIds.has(q.stimulus_id)) err(`stimulus_id ${q.stimulus_id} does not exist`, q.id)
  if (q.diagram?.kind === 'illustration' && !ILLUSTRATIONS[q.diagram.id])
    err(`illustration "${q.diagram.id}" does not exist`, q.id)
}

// ─── 6. Year-level calibration ───────────────────────────────────────────────
// Derived from the real ACARA papers. Warnings, not errors: a deliberate stretch
// item is legitimate, a whole batch two years too high is not.
const PRIMARY = new Set(['grade_3', 'grade_4'])
for (const q of QUESTION_BANK) {
  if (!PRIMARY.has(q.year_level)) continue
  if (q.topic === 'number_operations') {
    // Real Year 3 computation stays inside two digits; larger numbers appear
    // only for place-value naming and comparison.
    const nums = (q.question_text.match(/\b\d[\d,]*\b/g) ?? []).map((n) => Number(n.replace(/,/g, '')))
    const big = nums.filter((n) => n >= 1000)
    const isPlaceValue = /digit|place|written|value of the/i.test(q.question_text)
    if (big.length && !isPlaceValue) warn(`${q.year_level}: computation involves ${big[0]} — above year level?`, q.id)
  }
}
const STATS_TERMS = /\b(mean|median|interquartile|standard deviation)\b/i
for (const q of QUESTION_BANK) {
  if (!['grade_3', 'grade_4', 'grade_5'].includes(q.year_level)) continue
  if (STATS_TERMS.test(q.question_text)) warn(`${q.year_level}: uses a statistic not introduced until Year 6-7`, q.id)
}

// ─── 7. Arithmetic in explanations ───────────────────────────────────────────
// Catches an explanation whose numbers no longer match after an edit.
//
// Deliberately conservative. A naive "a op b = c" regex fires constantly on
// perfectly correct prose: it reads "4 + 3 + 1 = 8" as "3 + 1 = 8", treats the
// chain "15 × 24 = 15 × 20 + 15 × 4 = 360" as "15 × 24 = 15", and mistakes the
// fraction 1/5 for a division. A checker that cries wolf 127 times gets ignored,
// so this one only evaluates a clause it can parse completely and skips
// division entirely, fractions being far more common than division in these
// explanations.
const norm = (s) =>
  s.replace(/[−–—]/g, '-').replace(/[×✕]/g, '*').replace(/,(?=\d{3}\b)/g, '')

/** Evaluates a + - * expression with * binding tighter. Returns null for
 * anything it cannot parse completely, which is the safe outcome — a check that
 * guesses is worse than one that abstains.
 *
 * Tokenised rather than split on operators, because splitting cannot tell the
 * minus in "10 × -2 + 4" (a negative operand) from the one in "10 - 2"
 * (subtraction), and reads the first as 10 × 0 - 2 + 4. */
function evalSimple(expr) {
  const s = expr.trim()
  const tokens = []
  let i = 0
  let expectNumber = true
  while (i < s.length) {
    if (/\s/.test(s[i])) { i++; continue }
    if (expectNumber) {
      const m = /^-?\d+(?:\.\d+)?/.exec(s.slice(i))
      if (!m) return null
      tokens.push(Number(m[0]))
      i += m[0].length
      expectNumber = false
    } else {
      if (!'+-*'.includes(s[i])) return null
      tokens.push(s[i])
      i++
      expectNumber = true
    }
  }
  if (expectNumber || tokens.length < 3) return null

  const terms = [tokens[0]]
  for (let k = 1; k < tokens.length; k += 2) {
    const op = tokens[k]
    const val = tokens[k + 1]
    if (typeof val !== 'number') return null
    if (op === '*') terms.push(terms.pop() * val)
    else terms.push(op === '-' ? -val : val)
  }
  return terms.reduce((a, b) => a + b, 0)
}

// The evaluator is the one piece here that can silently produce wrong answers
// rather than just missing things, so it gets its own assertions. Run with
// --self-test. It has already shipped one bug: splitting on operators turned
// "10 * -2 + 4" into 10 × 0 - 2 + 4 and flagged a correct question.
if (process.argv.includes('--self-test')) {
  const cases = [
    ['10 * -2 + 4', -16],
    ['4 + 3 + 1', 8],
    ['15 * 24', 360],
    ['2 + 4', 6],
    ['5 - 12', -7],
    ['1 + 2 * 3', 7],
    ['100 - 20 - 30', 50],
    ['-5 + 3', -2],
  ]
  let failed = 0
  for (const [expr, want] of cases) {
    const got = evalSimple(expr)
    if (got !== want) {
      console.error(`  ✗ evalSimple("${expr}") = ${got}, expected ${want}`)
      failed++
    }
  }
  // Things it must refuse rather than guess at.
  for (const expr of ['1 / 2', '2 ^ 3', 'x + 1', '5 +', '']) {
    if (evalSimple(expr) !== null) {
      console.error(`  ✗ evalSimple("${expr}") should return null`)
      failed++
    }
  }
  console.log(failed ? `self-test: ${failed} failure(s)` : `self-test: all ${cases.length + 5} cases pass`)
  if (failed) process.exit(1)
}

for (const q of QUESTION_BANK) {
  // Split into clauses so one sentence's arithmetic cannot bleed into the next.
  for (const clause of norm(q.explanation ?? '').split(/[.;:,]\s|\band\b|\bthen\b|\bso\b/)) {
    const halves = clause.split('=')
    if (halves.length !== 2) continue // skip chained equalities like a = b = c
    const lhs = halves[0].trim()
    const rhsMatch = halves[1].trim().match(/^\$?(-?\d+(?:\.\d+)?)\b/)
    if (!rhsMatch) continue
    const got = evalSimple(lhs.replace(/^\$/, ''))
    if (got === null) continue
    const want = Number(rhsMatch[1])
    // Tolerate a rounded result in the prose.
    if (Math.abs(got - want) > 0.011 && Math.abs(got - want) / Math.max(1, Math.abs(got)) > 0.005) {
      err(`explanation arithmetic: "${lhs} = ${want}" but ${lhs} is ${Math.round(got * 1000) / 1000}`, q.id)
    }
  }
}

// ─── 8. VCE paper structure ──────────────────────────────────────────────────
// VCAA fixes these totals, so a drifting mark count means the paper no longer
// matches the exam it is practice for.
const vceExam1 = QUESTION_BANK.filter(
  q => q.year_level === 'year_12' && q.format === 'extended_response' && q.calculator_allowed === false
)
if (vceExam1.length) {
  const marks = vceExam1.reduce((sum, q) => sum + q.parts.reduce((t, p) => t + p.marks, 0), 0)
  if (vceExam1.length !== 9) warn(`VCE Exam 1 has ${vceExam1.length} questions; the real paper has 9`)
  if (marks !== 40) warn(`VCE Exam 1 totals ${marks} marks; the real paper is 40`)
}

// Exam 2 is CAS-permitted: Section A is 20 one-mark multiple choice, Section B
// is 4 extended-response questions worth 60 marks. Section A also uses five
// options, unlike every NAPLAN question in the bank, which uses four.
const vceYear12 = QUESTION_BANK.filter(q => q.year_level === 'year_12' && q.calculator_allowed === true)
const vceSectionA = vceYear12.filter(q => q.format !== 'extended_response')
const vceSectionB = vceYear12.filter(q => q.format === 'extended_response')
if (vceSectionA.length || vceSectionB.length) {
  if (vceSectionA.length !== 20) warn(`VCE Exam 2 Section A has ${vceSectionA.length} questions; the real paper has 20`)
  const aMarks = vceSectionA.reduce((sum, q) => sum + (q.marks ?? 0), 0)
  if (aMarks !== 20) warn(`VCE Exam 2 Section A totals ${aMarks} marks; the real paper is 20 (1 mark each)`)
  for (const q of vceSectionA) {
    if (q.options && q.options.length !== 5) {
      err(`VCE Exam 2 Section A question has ${q.options.length} options; VCAA multiple choice offers five (A-E)`, q.id)
    }
  }
  if (vceSectionB.length !== 4) warn(`VCE Exam 2 Section B has ${vceSectionB.length} questions; the real paper has 4`)
  const bMarks = vceSectionB.reduce((sum, q) => sum + q.parts.reduce((t, p) => t + p.marks, 0), 0)
  if (bMarks !== 60) warn(`VCE Exam 2 Section B totals ${bMarks} marks; the real paper is 60`)
}

// ─── Report ──────────────────────────────────────────────────────────────────
if (!quiet || errors.length) {
  console.log(`Checked ${QUESTION_BANK.length} questions, ${STIMULI.length} passages, ${Object.keys(ILLUSTRATIONS).length} illustrations.`)
}
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`)
  for (const w of warnings.slice(0, 40)) console.log('  ⚠ ' + w)
  if (warnings.length > 40) console.log(`  … and ${warnings.length - 40} more`)
}
if (errors.length) {
  console.error(`\n${errors.length} error(s):`)
  for (const e of errors.slice(0, 60)) console.error('  ✗ ' + e)
  if (errors.length > 60) console.error(`  … and ${errors.length - 60} more`)
  process.exit(1)
}
console.log(`\nNo errors.${warnings.length ? ` ${warnings.length} warning(s) above.` : ''}`)
