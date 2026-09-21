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
//
// The threshold was 0.6, which was far too generous: it passed seventeen groups
// where guessing one letter scored over 45%, including a Year 9 Reading section
// where B was the answer 26 times out of 32. With four options an even spread is
// 25%, so anything above 40% in a group of eight or more is worth a look.
const ANSWER_SHARE_LIMIT = 0.4
for (const [key, qs] of groups) {
  const mc = qs.filter((q) => typeof q.correct_index === 'number')
  if (mc.length < 8) continue
  const counts = {}
  for (const q of mc) counts[q.correct_index] = (counts[q.correct_index] ?? 0) + 1
  const top = Math.max(...Object.values(counts))
  if (top / mc.length > ANSWER_SHARE_LIMIT) {
    const pct = Math.round((top / mc.length) * 100)
    warn(`${key}: ${top}/${mc.length} answers share one position (${pct}%) — ${JSON.stringify(counts)}`)
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
    // What matters is the operation, not the magnitude. ACARA has Year 4
    // rounding, comparing, adding and subtracting four-digit numbers, so
    // flagging those produced six warnings that were all correct content and
    // taught everyone to skim the list. Multiplying or dividing a number that
    // large is a different matter, and stays flagged.
    const isPlaceValue = /digit|place|written|value of the|round(ed)? to|nearest/i.test(q.question_text)
    const isAddSubtract = /\b(left|remain|altogether|in total|how many more|fewer|sold|sum|difference)\b/i.test(q.question_text)
      && !/\b(each|per|share[ds]?|divide[ds]?|equally|times|multiplie[ds]?)\b/i.test(q.question_text)
    if (big.length && !isPlaceValue && !isAddSubtract) {
      warn(`${q.year_level}: multiplies or divides with ${big[0]} — above year level?`, q.id)
    }
  }
}
const STATS_TERMS = /\b(mean|median|interquartile|standard deviation)\b/i
// Maths topics only. "mean" is also an ordinary English verb, so without this
// the check fires on every reading question that asks what a writer means.
const MATHS_TOPICS = new Set([
  'number_operations', 'number_patterns', 'algebra_equations',
  'geometry_measurement', 'statistics_probability',
])
for (const q of QUESTION_BANK) {
  if (!['grade_3', 'grade_4', 'grade_5'].includes(q.year_level)) continue
  if (!MATHS_TOPICS.has(q.topic)) continue
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

// ─── 8. Mathematical Methods Unit 3 & 4 paper structure ──────────────────────
// VCAA fixes these totals, so a drifting mark count means the paper no longer
// matches the exam it is practice for.
//
// Every filter here is scoped by topic, not just by year level. Year 12 now
// holds more than one VCE subject, and General Mathematics questions are also
// year_12 with calculator_allowed — without the topic test they get counted as
// Methods questions and the Exam 2 checks fire against the wrong paper.
const isMethods = q => q.topic.startsWith('mm_')
const vceExam1 = QUESTION_BANK.filter(
  q => isMethods(q) && q.year_level === 'year_12' && q.format === 'extended_response' && q.calculator_allowed === false
)
if (vceExam1.length) {
  const marks = vceExam1.reduce((sum, q) => sum + q.parts.reduce((t, p) => t + p.marks, 0), 0)
  if (vceExam1.length !== 9) warn(`VCE Exam 1 has ${vceExam1.length} questions; the real paper has 9`)
  if (marks !== 40) warn(`VCE Exam 1 totals ${marks} marks; the real paper is 40`)
}

// Exam 2 is CAS-permitted: Section A is 20 one-mark multiple choice, Section B
// is 4 extended-response questions worth 60 marks. Section A also uses five
// options, unlike every NAPLAN question in the bank, which uses four.
const vceYear12 = QUESTION_BANK.filter(q => isMethods(q) && q.year_level === 'year_12' && q.calculator_allowed === true)
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

// ─── 9. Numeracy question mix ────────────────────────────────────────────────
// A paper of nothing but four-option word problems is not a NAPLAN paper, and
// this drifted without anyone noticing: Year 10 shipped at 0% short answer and
// 3% diagrams, and Grades 4 and 6 and Year 8 had no diagrams at all.
//
// The targets come from the real papers rather than taste. The 2013 Year 9
// answer keys give the format of every question — a letter is multiple choice, a
// number is written in — and they run 8 of 32 short answer on the calculator
// paper and 10 of 32 on the non-calculator one, so 25-31%. Those papers also
// carry a table or figure on almost every page; the composer already aims for
// half the paper to be graphical, which it can only do if the pool supports it.
//
// Warnings, not errors: a pool that is still being built should report the gap
// rather than block the commit that starts closing it.
const NUMERACY_TOPICS = new Set([
  'number_operations', 'number_patterns', 'algebra_equations',
  'geometry_measurement', 'statistics_probability',
])
const MIN_SHORT_ANSWER_SHARE = 0.25
const MIN_DIAGRAM_SHARE = 0.4
const numeracyByYear = new Map()
for (const q of QUESTION_BANK) {
  if (!NUMERACY_TOPICS.has(q.topic)) continue
  if (!['grade_3', 'grade_4', 'grade_5', 'grade_6', 'year_7', 'year_8', 'year_9', 'year_10'].includes(q.year_level)) continue
  if (!numeracyByYear.has(q.year_level)) numeracyByYear.set(q.year_level, [])
  numeracyByYear.get(q.year_level).push(q)
}
for (const [yearLevel, pool] of numeracyByYear) {
  if (pool.length < 20) continue
  const shortAnswer = pool.filter(q => q.format === 'short_answer').length
  const withDiagram = pool.filter(q => q.diagram || q.option_diagrams?.length).length
  const saShare = shortAnswer / pool.length
  const diaShare = withDiagram / pool.length
  if (saShare < MIN_SHORT_ANSWER_SHARE) {
    warn(`${yearLevel} numeracy is ${Math.round(saShare * 100)}% short answer (${shortAnswer}/${pool.length}); real NAPLAN papers run 25-31%`)
  }
  if (diaShare < MIN_DIAGRAM_SHARE) {
    warn(`${yearLevel} numeracy is ${Math.round(diaShare * 100)}% graphical (${withDiagram}/${pool.length}); the composer aims to fill half a paper with diagrams`)
  }
}

// ─── 10. Diagrams are rendered BELOW the question text ───────────────────────
// ExamPaperDocument prints the question, then its diagram. A question that says
// "the graph above" therefore points at the previous question's graphic — which
// no check catches at render time and no reader notices until they are holding
// the paper. Wording this wrong has slipped through twice.
// Only questions that actually carry a diagram: "scored above 86" is ordinary
// English, and flagging it would train everyone to ignore this check.
for (const q of QUESTION_BANK) {
  if (!q.diagram) continue
  const refersUp = text => / above\b/.test(text)
  if (refersUp(q.question_text)) {
    err('question_text says "above" but its diagram renders below the text — say "below"', q.id)
  }
  for (const part of q.parts ?? []) {
    if (refersUp(part.prompt)) {
      err(`part ${part.label} says "above" but the diagram renders below the text — say "below"`, q.id)
    }
  }
}

// ─── 10. General Mathematics Unit 3 & 4 paper structure ──────────────────────
// VCAA's published specifications mandate the split between the four content
// areas, so these are not style preferences — a paper that misses them is not
// the exam it claims to be practice for. Exam 1 is 40 one-mark multiple choice
// (16/8/8/8 by area); Exam 2 is 60 marks of extended response (24/12/12/12).
const GM_EXAM1_QUESTIONS = { gm_data_analysis: 16, gm_financial: 8, gm_matrices: 8, gm_networks: 8 }
const GM_EXAM2_MARKS = { gm_data_analysis: 24, gm_financial: 12, gm_matrices: 12, gm_networks: 12 }

const gmYear12 = QUESTION_BANK.filter(q => q.year_level === 'year_12' && q.topic.startsWith('gm_'))
if (gmYear12.length) {
  const gmExam1 = gmYear12.filter(q => (q.format ?? 'multiple_choice') === 'multiple_choice')
  const gmExam2 = gmYear12.filter(q => q.format === 'extended_response')

  for (const q of gmExam1) {
    if (q.options && q.options.length !== 5) {
      err(`General Maths Exam 1 question has ${q.options.length} options; VCAA multiple choice offers five (A-E)`, q.id)
    }
    if ((q.marks ?? 0) !== 1) warn(`General Maths Exam 1 question is worth ${q.marks ?? 0} marks; every one is worth 1`, q.id)
    if (q.calculator_allowed !== true) {
      warn('General Maths Exam 1 question is not marked calculator_allowed; neither General paper is technology-free', q.id)
    }
  }
  for (const q of gmExam2) {
    if (q.calculator_allowed !== true) {
      warn('General Maths Exam 2 question is not marked calculator_allowed; neither General paper is technology-free', q.id)
    }
  }

  // Only check the split once a paper looks complete — a half-authored area
  // should not produce four warnings on every run while it is being written.
  if (gmExam1.length) {
    if (gmExam1.length !== 40) warn(`General Maths Exam 1 has ${gmExam1.length} questions; the specifications require 40`)
    for (const [topic, want] of Object.entries(GM_EXAM1_QUESTIONS)) {
      const got = gmExam1.filter(q => q.topic === topic).length
      if (got !== want) warn(`General Maths Exam 1 has ${got} ${topic} questions; the specifications require ${want}`)
    }
  }
  if (gmExam2.length) {
    const marksFor = topic => gmExam2
      .filter(q => q.topic === topic)
      .reduce((sum, q) => sum + q.parts.reduce((t, p) => t + p.marks, 0), 0)
    const total = Object.keys(GM_EXAM2_MARKS).reduce((sum, t) => sum + marksFor(t), 0)
    if (total !== 60) warn(`General Maths Exam 2 totals ${total} marks; the specifications require 60`)
    for (const [topic, want] of Object.entries(GM_EXAM2_MARKS)) {
      const got = marksFor(topic)
      if (got !== want) warn(`General Maths Exam 2 allocates ${got} marks to ${topic}; the specifications require ${want}`)
    }
  }
}

// ─── 11. Diagrams are well-formed ────────────────────────────────────────────
// A diagram that type-checks can still be wrong in ways only the renderer
// notices — a figure segment naming a point that does not exist throws at render
// time and takes the whole paper's PDF down with it. These are the structural
// mistakes that are cheap to catch here and expensive to catch from a customer.
const VENN_TWO = new Set(['A', 'B', 'AB', 'none'])
const VENN_THREE = new Set(['A', 'B', 'C', 'AB', 'AC', 'BC', 'ABC', 'none'])
const NON_SCALING = new Set(['simple_shape'])

function checkDiagram(d, id, where) {
  const bad = msg => err(`${where} ${d.kind}: ${msg}`, id)
  switch (d.kind) {
    case 'figure': {
      const ids = new Set(d.points.map(p => p.id))
      if (ids.size !== d.points.length) bad('duplicate point ids')
      for (const s of d.segments ?? []) for (const p of [s.from, s.to]) if (!ids.has(p)) bad(`segment names unknown point "${p}"`)
      for (const a of d.angles ?? []) for (const p of [a.at, a.from, a.to]) if (!ids.has(p)) bad(`angle names unknown point "${p}"`)
      for (const g of d.polygons ?? []) {
        if (g.points.length < 3) bad('polygon needs at least 3 points')
        for (const p of g.points) if (!ids.has(p)) bad(`polygon names unknown point "${p}"`)
      }
      for (const c of d.circles ?? []) if (!ids.has(c.center)) bad(`circle centre "${c.center}" is not a point`)
      for (const p of d.points) if (p.x < 0 || p.y < 0 || p.x > d.width || p.y > d.height) bad(`point ${p.id} lies outside ${d.width}×${d.height}`)
      break
    }
    case 'venn': {
      const allowed = d.sets.length === 3 ? VENN_THREE : VENN_TWO
      for (const r of [...Object.keys(d.values ?? {}), ...(d.shaded ?? [])]) if (!allowed.has(r)) bad(`region "${r}" does not exist in a ${d.sets.length}-set diagram`)
      break
    }
    case 'bar_chart': {
      const values = d.series ? d.series.flatMap(s => s.values) : (d.bars ?? []).map(b => b.value)
      if (!d.bars?.length && !(d.categories?.length && d.series?.length)) bad('needs bars, or categories with series')
      if (d.series) for (const s of d.series) if (s.values.length !== (d.categories ?? []).length) bad(`series "${s.label}" has ${s.values.length} values for ${(d.categories ?? []).length} categories`)
      if (d.yStep && d.yMax !== undefined && Math.max(...values) > d.yMax) bad(`a value exceeds yMax ${d.yMax}`)
      break
    }
    case 'line_graph':
      for (const s of d.series) if (s.values.length !== d.xLabels.length) bad(`series has ${s.values.length} values for ${d.xLabels.length} x-labels`)
      for (const v of d.series.flatMap(s => s.values)) if (v !== null && (v < d.yMin || v > d.yMax)) bad(`value ${v} is outside ${d.yMin}–${d.yMax}`)
      break
    case 'pictograph':
      for (const r of d.rows) if (Math.round(r.count * 2) !== r.count * 2) bad(`row "${r.label}" count ${r.count} must be a whole or half icon`)
      break
    case 'data_table':
      for (const r of d.rows) if (r.length !== d.columns.length) bad(`a row has ${r.length} cells for ${d.columns.length} columns`)
      if (d.footer && d.footer.length !== d.columns.length) bad('footer width differs from the columns')
      if (d.style === 'tally' && (d.tallyColumn === undefined || d.tallyColumn >= d.columns.length)) bad('tally table needs a valid tallyColumn')
      break
    case 'number_line': {
      const inRange = v => v >= d.min - 1e-9 && v <= d.max + 1e-9
      for (const p of d.points ?? []) if (!inRange(p.value)) bad(`point ${p.value} is off the line`)
      for (const j of d.jumps ?? []) if (!inRange(j.from) || !inRange(j.to)) bad('a jump runs off the line')
      if (d.arrowAt !== undefined && !inRange(d.arrowAt)) bad('arrowAt is off the line')
      break
    }
    case 'spinner':
      if (d.sectors.length < 2 || d.sectors.length > 12) bad(`${d.sectors.length} sectors; use 2–12`)
      if (d.pointer !== undefined && (d.pointer < 0 || d.pointer >= d.sectors.length)) bad('pointer names a sector that does not exist')
      break
    case 'clock':
      if (d.minute < 0 || d.minute > 59) bad(`minute ${d.minute}`)
      if ((d.style ?? 'analog') === 'analog' ? d.hour < 1 || d.hour > 12 : d.hour < 0 || d.hour > 23) bad(`hour ${d.hour}`)
      break
    case 'grid_shape':
      if ((d.cells ?? []).length > d.rows) bad('more cell rows than grid rows')
      for (const row of d.cells ?? []) if (row.length > d.cols) bad('a cell row is wider than the grid')
      break
    case 'fraction_model':
      if (d.shaded > d.parts * (d.wholes ?? 1) && d.model !== 'grid') bad('more parts shaded than exist')
      if (d.model === 'grid' && d.shaded > (d.rows ?? 1) * (d.cols ?? d.parts) * (d.wholes ?? 1)) bad('more cells shaded than exist')
      break
    case 'measure':
      if (d.instrument === 'jug' && (d.level < 0 || d.level > d.max)) bad('liquid level is outside the scale')
      if (d.instrument === 'thermometer' && (d.value < d.min || d.value > d.max)) bad('reading is outside the scale')
      if (d.instrument === 'dial' && (d.value < 0 || d.value > d.max)) bad('reading is outside the scale')
      if (d.instrument === 'ruler' && d.object && (d.object.start < d.from || d.object.end > d.to)) bad('object runs off the ruler')
      if (d.instrument === 'protractor' && (d.angle <= 0 || d.angle >= 180)) bad('protractor angle must be between 0 and 180')
      break
    case 'price_tags':
      if (d.items.length < 1 || d.items.length > 4) bad(`${d.items.length} items; the row fits 1–4`)
      break
    case 'calendar':
      if (d.startDay < 0 || d.startDay > 6) bad('startDay must be 0 (Monday) to 6')
      for (const n of [...(d.circled ?? []), ...(d.shaded ?? [])]) if (n < 1 || n > d.days) bad(`day ${n} is not in the month`)
      break
    case 'illustration':
      if (!ILLUSTRATIONS[d.id]) bad(`illustration "${d.id}" does not exist`)
      break
  }
}

for (const q of QUESTION_BANK) {
  if (q.diagram) checkDiagram(q.diagram, q.id, 'diagram')
  if (q.option_diagrams) {
    if (!q.options || q.option_diagrams.length !== q.options.length) err('option_diagrams must pair one-to-one with options (captions may be empty)', q.id)
    if (q.option_diagrams.length < 2 || q.option_diagrams.length > 4) err(`${q.option_diagrams.length} picture options; the grid holds 2–4`, q.id)
    q.option_diagrams.forEach((d, i) => {
      if (NON_SCALING.has(d.kind)) err(`option ${i} uses ${d.kind}, which cannot shrink into an answer panel`, q.id)
      checkDiagram(d, q.id, `option ${i}`)
    })
  }
}

// ─── 12. Tables belong in diagrams, not in the question text ─────────────────
// Typing a table into question_text with pipes produced items that told the
// student "a column graph shows" above a block of ASCII. A data_table renders as
// a real table, and a bar_chart as a real graph.
for (const q of QUESTION_BANK) {
  const pipeLines = q.question_text.split('\n').filter(l => (l.match(/\|/g) ?? []).length >= 1)
  if (pipeLines.length >= 2) warn('table typed into question_text — use a data_table diagram', q.id)
  if (!q.diagram && !q.option_diagrams && /\b(graph|chart|diagram|table|map|spinner|picture|shown)\b/i.test(q.question_text)
      && /\b(the|this) (column |bar |line |pie )?(graph|chart|diagram|table|map|spinner|picture)\b|\bshown\b/i.test(q.question_text)
      && !q.stimulus_id && NUMERACY_TOPICS.has(q.topic)) {
    warn('refers to a graph, table or picture but has no diagram', q.id)
  }
}

// ─── 13. Picture variety within a year level ─────────────────────────────────
// The user's complaint about the imagery was that it was "constantly the same
// style". If one kind of picture carries more than a quarter of a NAPLAN-year
// numeracy pool's graphical items, the papers composed from it will feel
// repetitive however good each picture is.
for (const [yearLevel, pool] of numeracyByYear) {
  const kinds = pool.flatMap(q => [q.diagram, ...(q.option_diagrams ?? [])].filter(Boolean).slice(0, 1)).map(d => d.kind)
  if (kinds.length < 12) continue
  const counts = {}
  for (const k of kinds) counts[k] = (counts[k] ?? 0) + 1
  for (const [kind, n] of Object.entries(counts)) {
    if (n / kinds.length > 0.25) warn(`${yearLevel} numeracy: ${kind} is ${n}/${kinds.length} of the graphical items — vary the pictures`)
  }
  const distinct = Object.keys(counts).length
  if (distinct < 8) warn(`${yearLevel} numeracy uses only ${distinct} kinds of picture; real papers use far more`)
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
