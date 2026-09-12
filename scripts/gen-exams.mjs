#!/usr/bin/env node
// Builds src/lib/questions/exams.ts — fixed, pre-composed practice exams
// (as opposed to the custom exam builder on /practice, which mixes topics
// on demand). 3 exams per subject+grade for the general subjects, 5 for
// General Mathematics and Maths Methods (their Unit 1&2 pool is deliberately
// sized for that). Each question is reused at most twice across a subject's
// exams, picked greedily by least-used-first so usage stays balanced.
//
// Safe to re-run whenever bank.ts changes — regenerates the whole file.
// Usage: node scripts/gen-exams.mjs

import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const bankPath = join(repoRoot, 'src/lib/questions/bank.ts')
const examsPath = join(repoRoot, 'src/lib/questions/exams.ts')

const src = readFileSync(bankPath, 'utf8')
const jsSrc = src
  .replace(/^import type .+\n/m, '')
  .replace(/^type BankQuestion =[\s\S]*?\n\n/m, '')
  .replace(/const (\w+): BankQuestion\[\] = \[/g, 'const $1 = [')
const tmpPath = join(repoRoot, '.bank-tmp2.mjs')
writeFileSync(tmpPath, jsSrc)
const { QUESTION_BANK } = await import('file://' + tmpPath)
unlinkSync(tmpPath)

const TOPIC_TO_SUBJECT = {
  number_operations: 'math', number_patterns: 'math', algebra_equations: 'math', geometry_measurement: 'math', statistics_probability: 'math',
  reading_comprehension: 'english', reading_literary_analysis: 'english', grammar_punctuation: 'english', vocabulary: 'english',
  life_science: 'science', physical_science: 'science', earth_space: 'science',
  chem_atomic_structure: 'chemistry', chem_reactions: 'chemistry',
  phys_mechanics: 'physics', phys_electricity: 'physics',
  mm_calculus: 'maths_methods', mm_probability: 'maths_methods',
  gm_data_analysis: 'general_maths', gm_financial: 'general_maths',
  sm_complex_numbers: 'specialist_maths', sm_vectors: 'specialist_maths',
}
const SELECTIVE_SUBJECTS = new Set(['chemistry', 'physics', 'maths_methods', 'general_maths', 'specialist_maths'])
// VCAA exams give students 15 minutes of reading time (no writing allowed) before the writing time starts.
const VCE_READING_MINUTES = 15
const SUBJECT_LABEL = {
  math: 'Maths', english: 'English', science: 'Science',
  chemistry: 'Chemistry', physics: 'Physics', maths_methods: 'Maths Methods',
  general_maths: 'General Mathematics', specialist_maths: 'Specialist Mathematics',
}
const GRADE_LABEL = {
  grade_3: 'Grade 3', grade_4: 'Grade 4', grade_5: 'Grade 5', grade_6: 'Grade 6',
  year_7: 'Year 7', year_8: 'Year 8', year_9: 'Year 9', year_10: 'Year 10',
  year_11: 'Unit 1 & 2',
}
const EXAM_SIZE = 10
const EXAM_COUNT = { general_maths: 5, maths_methods: 5 } // default 3 otherwise
const NAPLAN_SUBJECTS = new Set(['math', 'english'])
const NAPLAN_GRADES = new Set(['grade_3', 'grade_4', 'grade_5', 'grade_6', 'year_7', 'year_8', 'year_9'])
const READING_TOPICS = new Set(['reading_comprehension', 'reading_literary_analysis'])
const LANGUAGE_TOPICS = new Set(['grammar_punctuation', 'vocabulary'])
const NUMERACY_CALC_SPLIT_GRADES = new Set(['year_7', 'year_8', 'year_9'])

// Group questions: general subjects by subject+grade, selective subjects by subject alone.
const groups = new Map() // key -> { subject, yearLevel, questions: [] }
for (const question of QUESTION_BANK) {
  const subject = TOPIC_TO_SUBJECT[question.topic]
  if (!subject) continue
  const key = SELECTIVE_SUBJECTS.has(subject) ? subject : `${subject}__${question.year_level}`
  if (!groups.has(key)) {
    groups.set(key, { subject, yearLevel: question.year_level, questions: [] })
  }
  groups.get(key).questions.push(question)
}

function buildExams(questions, examCount, examSize) {
  const usage = new Array(questions.length).fill(0)
  const exams = []
  for (let e = 0; e < examCount; e++) {
    const candidates = questions.map((_, i) => i).filter(i => usage[i] < 2)
    candidates.sort((a, b) => usage[a] - usage[b] || a - b)
    const chosen = candidates.slice(0, examSize)
    if (chosen.length < examSize) {
      throw new Error(`Not enough distinct questions to build exam ${e + 1} (need ${examSize}, pool has ${questions.length}).`)
    }
    chosen.forEach(i => usage[i]++)
    exams.push(chosen.map(i => questions[i].id))
  }
  return exams
}

// Deterministic per-question ordering key (FNV-1a over the id). Used only to
// break ties between equally-used questions: a plain stable sort would take the
// first N in bank order every time, so exam 1 was always built from whichever
// questions happened to be written first and newly added ones never surfaced.
// Hashing the id spreads the picks across the whole pool while keeping
// regeneration reproducible.
function tieBreakKey(id) {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pickLeastUsed(pool, usage, count) {
  const candidates = pool.filter(q => usage.get(q.id) < 2)
  candidates.sort((a, b) => usage.get(a.id) - usage.get(b.id) || tieBreakKey(a.id) - tieBreakKey(b.id))
  const chosen = candidates.slice(0, count)
  chosen.forEach(q => usage.set(q.id, usage.get(q.id) + 1))
  return chosen
}

// Like pickLeastUsed, but guarantees at least half the picks carry a `diagram`
// (real NAPLAN numeracy papers are roughly half graphical — maps, graphs,
// dot plots, etc. — see docs/superpowers/specs/2026-09-11-naplan-visual-format-
// design.md Phase 2). Falls back to whatever's available if the diagram pool
// is smaller than half of `count`.
function pickBalancedNumeracy(pool, usage, count) {
  const withDiagram = pool.filter(q => q.diagram)
  const withoutDiagram = pool.filter(q => !q.diagram)
  const diagramTarget = Math.ceil(count / 2)
  const chosenDiagram = pickLeastUsed(withDiagram, usage, diagramTarget)
  const remaining = count - chosenDiagram.length
  const chosenPlain = pickLeastUsed(withoutDiagram, usage, remaining)
  // Interleave rather than block-group, so the paper doesn't read as
  // "all graphical questions, then all plain ones".
  const merged = []
  const maxLen = Math.max(chosenDiagram.length, chosenPlain.length)
  for (let i = 0; i < maxLen; i++) {
    if (chosenPlain[i]) merged.push(chosenPlain[i])
    if (chosenDiagram[i]) merged.push(chosenDiagram[i])
  }
  return merged
}

// Interleaves several topic pools one-at-a-time (round robin) instead of
// concatenating them block-by-block. pickLeastUsed's sort is stable, so when
// every candidate starts at usage 0 (the common case for a fresh exam 1),
// taking the first N of a block-concatenated pool would silently exhaust
// whichever topic happens to be listed first — e.g. a 30-question calculator
// section pulled entirely from number_operations once that topic's pool grew
// to 30, starving algebra/geometry/statistics of any representation at all.
// Round-robin merging keeps every topic's items spread through the array, so
// a stable least-used-first pick naturally samples across topics too.
function roundRobinByTopic(topicArrays) {
  const merged = []
  const maxLen = Math.max(0, ...topicArrays.map(a => a.length))
  for (let i = 0; i < maxLen; i++) {
    for (const arr of topicArrays) {
      if (arr[i]) merged.push(arr[i])
    }
  }
  return merged
}

function buildReadingSection(questions, usage, targetCount) {
  // Group by stimulus_id so a passage's questions never get split up.
  const byStimulus = new Map() // stimulus_id -> question[]
  const standalone = []
  for (const q of questions) {
    if (q.stimulus_id) {
      if (!byStimulus.has(q.stimulus_id)) byStimulus.set(q.stimulus_id, [])
      byStimulus.get(q.stimulus_id).push(q)
    } else {
      standalone.push(q)
    }
  }
  const groups = [...byStimulus.values(), ...standalone.map(q => [q])]
  const eligible = groups.filter(g => g.every(q => usage.get(q.id) < 2))
  eligible.sort((a, b) => usage.get(a[0].id) - usage.get(b[0].id))
  const chosen = []
  for (const g of eligible) {
    if (chosen.length >= targetCount) break
    g.forEach(q => usage.set(q.id, usage.get(q.id) + 1))
    chosen.push(...g)
  }
  return chosen.map(q => q.id)
}

function buildNaplanExam(subject, yearLevel, questionsByTopic, usage, examIndex) {
  const sections = []
  const readingPool = [...(questionsByTopic.reading_comprehension ?? []), ...(questionsByTopic.reading_literary_analysis ?? [])]
  if (readingPool.length) {
    sections.push({ title: 'Reading', time_minutes: 45, question_ids: buildReadingSection(readingPool, usage, 8) })
  }
  const languagePool = [...(questionsByTopic.grammar_punctuation ?? []), ...(questionsByTopic.vocabulary ?? [])]
  if (languagePool.length) {
    const ids = pickLeastUsed(languagePool, usage, 10).map(q => q.id)
    sections.push({ title: 'Language Conventions', time_minutes: 40, question_ids: ids })
  }
  const numeracyTopics = ['number_operations', 'number_patterns', 'algebra_equations', 'geometry_measurement', 'statistics_probability']
  const numeracyPool = roundRobinByTopic(numeracyTopics.map(t => questionsByTopic[t] ?? []))
  if (numeracyPool.length) {
    if (NUMERACY_CALC_SPLIT_GRADES.has(yearLevel)) {
      const nonCalc = numeracyPool.filter(q => !q.calculator_allowed)
      const calc = numeracyPool.filter(q => q.calculator_allowed)
      const sectionSize = 30 // matches real NAPLAN Yr7-9 numeracy paper length
      if (nonCalc.length) sections.push({ title: 'Numeracy — non-calculator', time_minutes: 40, calculator_allowed: false, question_ids: pickBalancedNumeracy(nonCalc, usage, sectionSize).map(q => q.id) })
      if (calc.length) sections.push({ title: 'Numeracy — calculator', time_minutes: 40, calculator_allowed: true, question_ids: pickBalancedNumeracy(calc, usage, sectionSize).map(q => q.id) })
    } else {
      sections.push({ title: 'Numeracy', time_minutes: 45, question_ids: pickBalancedNumeracy(numeracyPool, usage, 15).map(q => q.id) })
    }
  }
  const gradeLabel = GRADE_LABEL[yearLevel] ?? yearLevel
  return {
    id: `${subject}-${yearLevel}-${examIndex + 1}`,
    subject,
    yearLevel,
    title: `${SUBJECT_LABEL[subject]} ${gradeLabel} — Practice Exam ${examIndex + 1}`,
    sections: sections.filter(s => s.question_ids.length > 0),
    premium: true,
  }
}

const practiceExams = []
for (const { subject, yearLevel, questions } of groups.values()) {
  if (NAPLAN_SUBJECTS.has(subject) && NAPLAN_GRADES.has(yearLevel)) {
    const questionsByTopic = {}
    for (const q of questions) {
      (questionsByTopic[q.topic] ??= []).push(q)
    }
    const usage = new Map(questions.map(q => [q.id, 0]))
    const examCount = EXAM_COUNT[subject] ?? 3
    for (let i = 0; i < examCount; i++) {
      practiceExams.push(buildNaplanExam(subject, yearLevel, questionsByTopic, usage, i))
    }
    continue
  }
  const examCount = EXAM_COUNT[subject] ?? 3
  const examSize = Math.min(EXAM_SIZE, questions.length)
  const exams = buildExams(questions, examCount, examSize)
  exams.forEach((questionIds, i) => {
    const gradeLabel = GRADE_LABEL[yearLevel] ?? yearLevel
    practiceExams.push({
      id: `${subject}-${yearLevel}-${i + 1}`,
      subject,
      yearLevel,
      title: `${SUBJECT_LABEL[subject]} ${gradeLabel} — Practice Exam ${i + 1}`,
      sections: [{ title: 'Questions', time_minutes: 20, question_ids: questionIds }],
      premium: true,
      ...(SELECTIVE_SUBJECTS.has(subject) ? { reading_minutes: VCE_READING_MINUTES } : {}),
    })
  })
}

const ts = `// ─────────────────────────────────────────────────────────────────────────────
// Auto-generated by scripts/gen-exams.mjs — do not hand-edit.
// Fixed, pre-composed practice exams (as opposed to the custom exam builder
// on /practice, which mixes topics on demand). Regenerate after bank.ts
// changes with: node scripts/gen-exams.mjs
// ─────────────────────────────────────────────────────────────────────────────

import type { SubjectSlug, YearLevel } from '@/types'

export interface PracticeExamSection {
  title: string
  time_minutes: number
  calculator_allowed?: boolean
  question_ids: string[]
}

export interface PracticeExam {
  id: string
  subject: SubjectSlug
  yearLevel: YearLevel
  title: string
  sections: PracticeExamSection[]
  /** Selective/VCE-subject exams are premium — paid content (UI-only paywall for now). */
  premium: boolean
  /** VCE-style exams only: minutes of reading time (no writing allowed) before section timers start. */
  reading_minutes?: number
}

export const PRACTICE_EXAMS: PracticeExam[] = ${JSON.stringify(practiceExams, null, 2)}
`

writeFileSync(examsPath, ts)
console.log(`Wrote ${practiceExams.length} practice exams to src/lib/questions/exams.ts.`)
const bySubject = {}
practiceExams.forEach(e => { bySubject[e.subject] = (bySubject[e.subject] || 0) + 1 })
console.log(bySubject)
