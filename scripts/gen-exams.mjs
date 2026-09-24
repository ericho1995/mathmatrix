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
import { loadMagazines, loadStimuli } from './lib/content.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const bankPath = join(repoRoot, 'src/lib/questions/bank.ts')
const examsPath = join(repoRoot, 'src/lib/questions/exams.ts')

const src = readFileSync(bankPath, 'utf8').replace(/\r\n/g, '\n') // tolerate a Windows (CRLF) checkout
const jsSrc = src
  .replace(/^import type .+\n/m, '')
  .replace(/^type BankQuestion =[\s\S]*?\n\n/m, '')
  .replace(/const (\w+): BankQuestion\[\] = \[/g, 'const $1 = [')
const tmpPath = join(repoRoot, '.bank-tmp2.mjs')
writeFileSync(tmpPath, jsSrc)
const { QUESTION_BANK } = await import('file://' + tmpPath)
unlinkSync(tmpPath)

// Reading magazines: a Reading paper is composed from one magazine, and every
// block of questions names the text and the page it prints on.
const MAGAZINES = await loadMagazines(repoRoot)
const STIMULI = await loadStimuli(repoRoot)

const TOPIC_TO_SUBJECT = {
  number_operations: 'math', number_patterns: 'math', algebra_equations: 'math', geometry_measurement: 'math', statistics_probability: 'math',
  reading_comprehension: 'reading', reading_literary_analysis: 'reading', grammar_punctuation: 'english', vocabulary: 'english',
  life_science: 'science', physical_science: 'science', earth_space: 'science',
  chem_atomic_structure: 'chemistry', chem_reactions: 'chemistry',
  phys_mechanics: 'physics', phys_electricity: 'physics',
  mm_functions: 'maths_methods', mm_algebra: 'maths_methods', mm_calculus: 'maths_methods', mm_probability: 'maths_methods',
  gm_data_analysis: 'general_maths', gm_financial: 'general_maths',
  gm_matrices: 'general_maths', gm_networks: 'general_maths',
  sm_complex_numbers: 'specialist_maths', sm_vectors: 'specialist_maths',
  sm_proof: 'specialist_maths', sm_functions: 'specialist_maths', sm_calculus: 'specialist_maths', sm_statistics: 'specialist_maths',
}
const SELECTIVE_SUBJECTS = new Set(['chemistry', 'physics', 'maths_methods', 'general_maths', 'specialist_maths'])
// VCAA exams give students 15 minutes of reading time (no writing allowed) before the writing time starts.
const VCE_READING_MINUTES = 15
const SUBJECT_LABEL = {
  math: 'Maths', english: 'Language Conventions', reading: 'Reading', science: 'Science',
  chemistry: 'Chemistry', physics: 'Physics', maths_methods: 'Mathematical Methods',
  general_maths: 'General Mathematics', specialist_maths: 'Specialist Mathematics',
}
const GRADE_LABEL = {
  grade_3: 'Grade 3', grade_4: 'Grade 4', grade_5: 'Grade 5', grade_6: 'Grade 6',
  year_7: 'Year 7', year_8: 'Year 8', year_9: 'Year 9', year_10: 'Year 10',
  year_11: 'Unit 1 & 2',
}
const EXAM_SIZE = 10
// How many papers to try for. Each is only published while it stays mostly new
// (MAX_REPEAT_SHARE), so these are ceilings, not promises: a thin pool yields fewer.
const EXAM_COUNT = { general_maths: 5, maths_methods: 5, math: 4 } // default 3 otherwise
const NAPLAN_SUBJECTS = new Set(['math', 'english'])
// Years 10 is not a NAPLAN year — NAPLAN is sat at 3, 5, 7 and 9 — but every
// school year uses NAPLAN's paper format as the house standard, pitched at the
// year level being taught. Leaving Year 10 out of this set was why it fell
// through to the generic 10-question builder and looked nothing like the rest.
const NAPLAN_GRADES = new Set(['grade_3', 'grade_4', 'grade_5', 'grade_6', 'year_7', 'year_8', 'year_9', 'year_10'])
// The years NAPLAN is actually sat. Science is not a NAPLAN test, so these years
// carry Reading, Language Conventions and Numeracy only; the years between keep
// Science as general practice.
const NAPLAN_TEST_YEARS = new Set(['grade_3', 'grade_5', 'year_7', 'year_9'])
const READING_TOPICS = new Set(['reading_comprehension', 'reading_literary_analysis'])
const LANGUAGE_TOPICS = new Set(['grammar_punctuation', 'vocabulary'])
const NUMERACY_CALC_SPLIT_GRADES = new Set(['year_7', 'year_8', 'year_9', 'year_10'])
// Questions per section in a NAPLAN-style paper. Real papers run ~30-55 items
// per section; a section falls short of this only when its pool cannot fill it.
const SECTION_SIZE = 30
// The floor below which a paper is not worth putting a price on. A section
// thinner than this is a sample, not an exam, and shipping one next to a full
// paper at the same price is how a catalogue loses trust.
const MIN_SELLABLE_SECTION = 20

// The most of a paid paper that may repeat questions from earlier papers in the
// same subject and year level. The pickers allow any question into two papers,
// and with small pools that quietly produced premium papers that were the free
// sample again: every paid science paper was identical to its free one, and the
// paid English papers repeated 87-98% of theirs. A customer paying for a
// catalogue is paying for new questions, so a paper that is mostly repeats is
// not published — the fix for a short catalogue is a bigger pool.
const MAX_REPEAT_SHARE = 1 / 3

/** Share of a paper's questions that already appeared in the given earlier papers. */
function repeatShare(questionIds, earlierIds) {
  if (!questionIds.length) return 0
  return questionIds.filter(id => earlierIds.has(id)).length / questionIds.length
}

/** True when every section of a paper is long enough to be worth downloading. */
function isSellable(exam) {
  return exam.sections.length > 0 && exam.sections.every(s => s.question_ids.length >= MIN_SELLABLE_SECTION)
}

// Group questions: general subjects by subject+grade, selective subjects by subject alone.
const groups = new Map() // key -> { subject, yearLevel, questions: [] }
for (const question of QUESTION_BANK) {
  const subject = TOPIC_TO_SUBJECT[question.topic]
  if (!subject) continue
  // Always keyed by year level: VCE Unit 1 & 2 (year_11) and Unit 3 & 4
  // (year_12) are different courses and must not share a question pool.
  const key = `${subject}__${question.year_level}`
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
// Picture answer options make an item graphical just as a diagram does.
const isGraphical = q => Boolean(q.diagram || q.option_diagrams?.length)
const DIFFICULTY_RANK = { foundation: 0, developing: 1, proficient: 2, advanced: 3 }

// Real numeracy papers keep their strand mix steady from paper to paper:
// about half number and algebra, a third measurement and space, the rest
// statistics and probability. Picking by usage alone left it to the hash —
// one Grade 6 paper had 4 geometry questions and the next had 11.
const STRAND = {
  number_operations: 'number', number_patterns: 'number', algebra_equations: 'number',
  geometry_measurement: 'space', statistics_probability: 'stats',
}
const STRAND_SHARE = { number: 0.5, space: 0.3, stats: 0.2 }

/** How many questions each strand gets, moved to other strands when one runs short. */
function strandQuotas(available, count) {
  const strands = Object.keys(STRAND_SHARE)
  const quota = Object.fromEntries(strands.map(s => [s, Math.round(count * STRAND_SHARE[s])]))
  quota.number += count - strands.reduce((a, s) => a + quota[s], 0)
  let spare = 0
  for (const s of strands) {
    if (quota[s] > available[s]) { spare += quota[s] - available[s]; quota[s] = available[s] }
  }
  for (const s of strands) {
    const take = Math.min(spare, available[s] - quota[s])
    quota[s] += take
    spare -= take
  }
  return quota
}

function pickBalancedNumeracy(pool, usage, count) {
  const open = pool.filter(q => usage.get(q.id) < 2)
  const strands = Object.keys(STRAND_SHARE)
  const bucket = (s, g) => open.filter(q => (STRAND[q.topic] ?? 'number') === s && isGraphical(q) === g)
  const graphicalOf = Object.fromEntries(strands.map(s => [s, bucket(s, true)]))
  const plainOf = Object.fromEntries(strands.map(s => [s, bucket(s, false)]))
  const quota = strandQuotas(Object.fromEntries(strands.map(s => [s, graphicalOf[s].length + plainOf[s].length])), count)

  // Spread the half-graphical target across the strands. Each strand must take
  // enough pictures to cover what its plain items can't; then add pictures one
  // at a time wherever the most unused picture items are left. When plain
  // items run out entirely the paper goes over half rather than coming up
  // short (the third Year 8 paper once shipped at 21 questions a session).
  //
  // Only unused items count as available here. Counting items already in an
  // earlier paper let a strand fill its plain share with repeats while fresh
  // picture items sat unused, which made later papers fail MAX_REPEAT_SHARE with
  // new questions still in the pool. On a fresh pool this is the same as before.
  const fresh = qs => qs.filter(q => usage.get(q.id) === 0).length
  const pictures = Object.fromEntries(strands.map(s => [s, Math.min(Math.max(0, quota[s] - fresh(plainOf[s])), quota[s], graphicalOf[s].length)]))
  for (const s of strands) pictures[s] = Math.max(pictures[s], quota[s] - plainOf[s].length)
  const target = Math.ceil(count / 2)
  // A picture is only added towards the half-graphical target when it costs no
  // freshness: either an unused picture is left in that strand, or the strand
  // has run out of unused plain items anyway. Once the unused pictures are gone,
  // a later paper comes out a little under half graphical rather than filling
  // its picture quota with questions the buyer has already seen.
  for (let total = strands.reduce((a, s) => a + pictures[s], 0); total < target; total++) {
    const room = strands.filter(s => pictures[s] < Math.min(quota[s], graphicalOf[s].length)
      && (fresh(graphicalOf[s]) > pictures[s] || fresh(plainOf[s]) < quota[s] - pictures[s]))
    if (!room.length) break
    room.sort((a, b) => (fresh(graphicalOf[b]) - pictures[b]) - (fresh(graphicalOf[a]) - pictures[a]) || (graphicalOf[b].length - pictures[b]) - (graphicalOf[a].length - pictures[a]))
    pictures[room[0]]++
  }

  const chosenDiagram = roundRobinByTopic(strands.map(s => pickLeastUsed(graphicalOf[s], usage, pictures[s])))
  const chosenPlain = roundRobinByTopic(strands.map(s => pickLeastUsed(plainOf[s], usage, quota[s] - pictures[s])))
  // Interleave rather than block-group, so the paper doesn't read as
  // "all graphical questions, then all plain ones".
  const merged = []
  const maxLen = Math.max(chosenDiagram.length, chosenPlain.length)
  for (let i = 0; i < maxLen; i++) {
    if (chosenPlain[i]) merged.push(chosenPlain[i])
    if (chosenDiagram[i]) merged.push(chosenDiagram[i])
  }
  // Real papers open easy and finish hard. The sort is stable, so within a
  // difficulty band the plain/graphical interleave above survives.
  return merged.sort((a, b) => (DIFFICULTY_RANK[a.difficulty] ?? 1) - (DIFFICULTY_RANK[b.difficulty] ?? 1))
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
  // Every section targets SECTION_SIZE questions. Times follow the real NAPLAN
  // papers: Reading runs 45 min in the primary years and 65 min from Year 7,
  // Language Conventions 45 min at every year level.
  const isSecondary = ['year_7', 'year_8', 'year_9', 'year_10'].includes(yearLevel)
  const readingPool = [...(questionsByTopic.reading_comprehension ?? []), ...(questionsByTopic.reading_literary_analysis ?? [])]
  if (readingPool.length) {
    sections.push({
      title: 'Reading',
      time_minutes: isSecondary ? 65 : 45,
      question_ids: buildReadingSection(readingPool, usage, SECTION_SIZE),
    })
  }
  // NAPLAN Language Conventions is spelling plus grammar & punctuation, split
  // roughly half and half — spelling is always short-answer (write the word
  // correctly), grammar and punctuation always multiple choice. Synonym and
  // antonym items live in the `vocabulary` topic and are deliberately NOT drawn
  // here: they are a reading-vocabulary skill, not one NAPLAN tests in this
  // paper. They remain available to the free practice builder, which mixes
  // topics on demand.
  const languageTopicPool = questionsByTopic.grammar_punctuation ?? []
  const spellingPool = languageTopicPool.filter(q => q.format === 'short_answer')
  const grammarPool = languageTopicPool.filter(q => q.format !== 'short_answer')
  if (languageTopicPool.length) {
    const sectionSize = SECTION_SIZE
    const chosenSpelling = pickLeastUsed(spellingPool, usage, Math.floor(sectionSize / 2))
    const chosenGrammar = pickLeastUsed(grammarPool, usage, sectionSize - chosenSpelling.length)
    // Interleave so the paper alternates rather than running all the spelling
    // items together, matching how the real paper mixes them.
    const merged = []
    const maxLen = Math.max(chosenGrammar.length, chosenSpelling.length)
    for (let i = 0; i < maxLen; i++) {
      if (chosenGrammar[i]) merged.push(chosenGrammar[i])
      if (chosenSpelling[i]) merged.push(chosenSpelling[i])
    }
    sections.push({ title: 'Language Conventions', time_minutes: 45, question_ids: merged.map(q => q.id) })
  }
  const numeracyTopics = ['number_operations', 'number_patterns', 'algebra_equations', 'geometry_measurement', 'statistics_probability']
  const numeracyPool = roundRobinByTopic(numeracyTopics.map(t => questionsByTopic[t] ?? []))
  if (numeracyPool.length) {
    if (NUMERACY_CALC_SPLIT_GRADES.has(yearLevel)) {
      const nonCalc = numeracyPool.filter(q => !q.calculator_allowed)
      const calc = numeracyPool.filter(q => q.calculator_allowed)
      const sectionSize = SECTION_SIZE
      if (nonCalc.length) sections.push({ title: 'Numeracy — non-calculator', time_minutes: 40, calculator_allowed: false, question_ids: pickBalancedNumeracy(nonCalc, usage, sectionSize).map(q => q.id) })
      if (calc.length) sections.push({ title: 'Numeracy — calculator', time_minutes: 40, calculator_allowed: true, question_ids: pickBalancedNumeracy(calc, usage, sectionSize).map(q => q.id) })
    } else {
      sections.push({ title: 'Numeracy', time_minutes: 45, question_ids: pickBalancedNumeracy(numeracyPool, usage, SECTION_SIZE).map(q => q.id) })
    }
  }
  const gradeLabel = GRADE_LABEL[yearLevel] ?? yearLevel
  return {
    id: `${subject}-${yearLevel}-${examIndex + 1}`,
    subject,
    yearLevel,
    title: `${SUBJECT_LABEL[subject]} ${gradeLabel} — Practice Exam ${examIndex + 1}`,
    sections: sections.filter(s => s.question_ids.length > 0),
    // The first paper of each subject and year level is the free sample. A
    // visitor who can never see a finished paper has no reason to buy one.
    premium: examIndex > 0,
  }
}

// ── VCE Unit 3 & 4 ──────────────────────────────────────────────────────────
// A real VCAA Methods paper is two separate exams sat on different days, not
// one paper with two sections: Exam 1 is technology-free, 9 questions and 40
// marks in an hour; Exam 2 allows CAS and runs Section A (20 multiple choice,
// 20 marks) then Section B (4 extended questions, 60 marks) over two hours.
// Both get 15 minutes of reading time first.
function buildVceUnit34Exams(subject, yearLevel, questions, examIndex) {
  const exams = []
  const label = `${SUBJECT_LABEL[subject]} Unit 3 & 4`

  const techFree = questions.filter(q => q.format === 'extended_response' && q.calculator_allowed === false)
  if (techFree.length) {
    exams.push({
      id: `${subject}-${yearLevel}-${examIndex + 1}-exam1`,
      subject,
      yearLevel,
      title: `${label} — Examination 1 (Practice ${examIndex + 1})`,
      sections: [{
        title: 'Examination 1 — technology-free',
        time_minutes: 60,
        calculator_allowed: false,
        question_ids: techFree.map(q => q.id),
      }],
      // The free sample is the FIRST PAPER of a subject and year level, not the
      // first practice set. These builders emit two papers per set, so keying
      // the rule on examIndex alone made both free — and since only set 1
      // exists, that gave away the whole of Year 12.
      premium: examIndex > 0 || exams.length > 0,
      reading_minutes: VCE_READING_MINUTES,
    })
  }

  const mc = questions.filter(q => q.calculator_allowed === true && q.format !== 'extended_response')
  const extended = questions.filter(q => q.format === 'extended_response' && q.calculator_allowed === true)
  const sections = []
  if (mc.length) {
    sections.push({ title: 'Section A — multiple choice', time_minutes: 45, calculator_allowed: true, restart_numbering: true, question_ids: mc.map(q => q.id) })
  }
  if (extended.length) {
    sections.push({ title: 'Section B — extended response', time_minutes: 75, calculator_allowed: true, restart_numbering: true, question_ids: extended.map(q => q.id) })
  }
  if (sections.length) {
    exams.push({
      id: `${subject}-${yearLevel}-${examIndex + 1}-exam2`,
      subject,
      yearLevel,
      title: `${label} — Examination 2 (Practice ${examIndex + 1})`,
      sections,
      premium: examIndex > 0 || exams.length > 0,
      reading_minutes: VCE_READING_MINUTES,
    })
  }
  return exams
}

// ── General Mathematics Unit 3 & 4 ──────────────────────────────────────────
// Structured from VCAA's published examination specifications (2023-2027), not
// inferred from a paper: both examinations are 15 minutes reading plus 1 hour
// 30 minutes writing, both permit CAS, and both are divided into the same four
// content areas with a MANDATED split.
//
//   Examination 1 — 40 multiple choice, 1 mark each: 16 data analysis,
//                   8 recursion and financial modelling, 8 matrices,
//                   8 networks and decision mathematics.
//   Examination 2 — 60 marks of short and extended answer: 24 / 12 / 12 / 12.
//
// Unlike Methods, neither paper is technology-free, so calculator_allowed
// cannot tell the two apart — format does. Examination 1 is entirely multiple
// choice, Examination 2 entirely extended response.
const GM_AREAS = [
  { topic: 'gm_data_analysis', title: 'Data analysis' },
  { topic: 'gm_financial', title: 'Recursion and financial modelling' },
  { topic: 'gm_matrices', title: 'Matrices' },
  { topic: 'gm_networks', title: 'Networks and decision mathematics' },
]
const GM_WRITING_MINUTES = 90

function buildGeneralMathsUnit34Exams(subject, yearLevel, questions, examIndex) {
  const exams = []
  const label = `${SUBJECT_LABEL[subject]} Unit 3 & 4`

  // Reading time is for the whole paper; the per-area minutes below are a
  // pacing guide proportional to each area's share of the MARKS, and always
  // sum to 90. Marks rather than question count, because Examination 2's four
  // data analysis questions are worth 24 marks while its four matrices
  // questions are worth 12 — splitting by count would tell a student to spend
  // as long on the half-weight area. (In Examination 1 every question is worth
  // one mark, so the two measures agree.)
  const weightOf = q => (q.format === 'extended_response'
    ? q.parts.reduce((sum, p) => sum + p.marks, 0)
    : (q.marks ?? 1))
  const areaSections = pool => {
    const byArea = GM_AREAS.map(a => ({ ...a, items: pool.filter(q => q.topic === a.topic) }))
      .filter(a => a.items.length > 0)
      .map(a => ({ ...a, weight: a.items.reduce((sum, q) => sum + weightOf(q), 0) }))
    const totalWeight = byArea.reduce((sum, a) => sum + a.weight, 0)
    if (!totalWeight) return []
    let allocated = 0
    return byArea.map((a, i) => {
      // The last area absorbs the rounding so the sections always total 90.
      const minutes = i === byArea.length - 1
        ? GM_WRITING_MINUTES - allocated
        : Math.round((a.weight / totalWeight) * GM_WRITING_MINUTES)
      allocated += minutes
      return {
        title: a.title,
        time_minutes: minutes,
        calculator_allowed: true,
        question_ids: a.items.map(q => q.id),
      }
    })
  }

  const mc = questions.filter(q => (q.format ?? 'multiple_choice') === 'multiple_choice')
  const extended = questions.filter(q => q.format === 'extended_response')

  const exam1Sections = areaSections(mc)
  if (exam1Sections.length) {
    exams.push({
      id: `${subject}-${yearLevel}-${examIndex + 1}-exam1`,
      subject,
      yearLevel,
      title: `${label} — Examination 1 (Practice ${examIndex + 1})`,
      sections: exam1Sections,
      // One free sample per subject and year level — see the note in
      // buildVceUnit34Exams. Two papers come out of each practice set here too.
      premium: examIndex > 0 || exams.length > 0,
      reading_minutes: VCE_READING_MINUTES,
    })
  }

  const exam2Sections = areaSections(extended)
  if (exam2Sections.length) {
    exams.push({
      id: `${subject}-${yearLevel}-${examIndex + 1}-exam2`,
      subject,
      yearLevel,
      title: `${label} — Examination 2 (Practice ${examIndex + 1})`,
      sections: exam2Sections,
      premium: examIndex > 0 || exams.length > 0,
      reading_minutes: VCE_READING_MINUTES,
    })
  }
  return exams
}

// ── Reading papers ──────────────────────────────────────────────────────────
// One paper per magazine. Each text becomes a section whose title tells the
// student where to read, exactly as the real paper does ("Read Wombats on page
// 3 of the magazine"), and the questions run 1..n straight through the paper.
// Times follow the real tests: 45 minutes at Year 3, 50 at Year 5, 65 from
// Year 7.
const READING_MINUTES = { grade_3: 45, grade_4: 45, grade_5: 50, grade_6: 50, year_7: 65, year_8: 65, year_9: 65, year_10: 65 }

function buildReadingExams(yearLevel, questions) {
  const magazines = MAGAZINES.filter(m => m.yearLevel === yearLevel).sort((a, b) => a.set - b.set)
  if (!magazines.length) return buildPassageReadingExam(yearLevel, questions)
  const exams = []
  for (const magazine of magazines) {
    const mine = questions.filter(q => (q.practice_set ?? 1) === magazine.set)
    if (!mine.length) continue
    const sections = []
    for (const text of magazine.texts) {
      const ids = mine.filter(q => q.stimulus_id === text.id).map(q => q.id)
      if (!ids.length) continue
      sections.push({
        title: `${text.title} — page ${text.page} of the magazine`,
        time_minutes: 0,
        question_ids: ids,
      })
    }
    if (!sections.length) continue
    const gradeLabel = GRADE_LABEL[yearLevel] ?? yearLevel
    exams.push({
      id: `reading-${yearLevel}-${magazine.set}`,
      subject: 'reading',
      yearLevel,
      title: `Reading ${gradeLabel} — Practice Paper ${magazine.set}`,
      // The whole paper is one sitting; the per-section times are 0 because the
      // sections are texts, not timed parts.
      total_minutes: READING_MINUTES[yearLevel] ?? 50,
      magazine_id: magazine.id,
      sections,
      premium: magazine.set > 1,
    })
  }
  return exams
}

// A level with no magazine still gets a Reading paper: the authored passages,
// each printed in the paper above its own questions, which is how the English
// papers carried Reading before it became its own subject. This covers the
// years between NAPLAN tests, which have no magazine.
function buildPassageReadingExam(yearLevel, questions) {
  const passageOrder = new Map(STIMULI.map((s, i) => [s.id, i]))
  const titleOf = new Map(STIMULI.map(s => [s.id, s.title]))
  const byPassage = new Map()
  const standalone = []
  for (const q of questions) {
    if (!q.stimulus_id) standalone.push(q)
    else if (titleOf.has(q.stimulus_id)) {
      if (!byPassage.has(q.stimulus_id)) byPassage.set(q.stimulus_id, [])
      byPassage.get(q.stimulus_id).push(q)
    }
  }
  const sections = [...byPassage.entries()]
    .sort(([a], [b]) => passageOrder.get(a) - passageOrder.get(b))
    .map(([id, qs]) => ({ title: titleOf.get(id), time_minutes: 0, question_ids: qs.map(q => q.id) }))
  // Items that quote their own sentence or two, rather than pointing at a passage.
  if (standalone.length) sections.push({ title: 'Short texts', time_minutes: 0, question_ids: standalone.map(q => q.id) })
  const count = sections.reduce((n, s) => n + s.question_ids.length, 0)
  if (count < MIN_SELLABLE_SECTION) return []
  const gradeLabel = GRADE_LABEL[yearLevel] ?? yearLevel
  return [{
    id: `reading-${yearLevel}-1`,
    subject: 'reading',
    yearLevel,
    title: `Reading ${gradeLabel} — Practice Paper 1`,
    total_minutes: READING_MINUTES[yearLevel] ?? 50,
    sections,
    premium: false,
  }]
}

const practiceExams = []
for (const { subject, yearLevel, questions } of groups.values()) {
  if (subject === 'reading') {
    practiceExams.push(...buildReadingExams(yearLevel, questions))
    continue
  }
  // NAPLAN does not test Science, so the NAPLAN years do not sell it.
  if (subject === 'science' && NAPLAN_TEST_YEARS.has(yearLevel)) continue
  if (yearLevel === 'year_12') {
    // Each practice set is a complete Examination 1 + Examination 2 pair, built
    // from the questions tagged with that set. Sets are never mixed: a VCAA-style
    // paper is balanced as a whole, and reusing a question across sets would sell
    // the same item twice.
    const build = subject === 'general_maths' ? buildGeneralMathsUnit34Exams : buildVceUnit34Exams
    const sets = [...new Set(questions.map(q => q.practice_set ?? 1))].sort((a, b) => a - b)
    for (const set of sets) {
      practiceExams.push(...build(subject, yearLevel, questions.filter(q => (q.practice_set ?? 1) === set), set - 1))
    }
    continue
  }
  if (NAPLAN_SUBJECTS.has(subject) && NAPLAN_GRADES.has(yearLevel)) {
    const questionsByTopic = {}
    for (const q of questions) {
      (questionsByTopic[q.topic] ??= []).push(q)
    }
    const usage = new Map(questions.map(q => [q.id, 0]))
    const examCount = EXAM_COUNT[subject] ?? 3
    const published = new Set()
    for (let i = 0; i < examCount; i++) {
      const exam = buildNaplanExam(subject, yearLevel, questionsByTopic, usage, i)
      // Stop as soon as the pool can no longer fill a real paper. Building a
      // fixed three regardless produced a "Grade 3 English Practice Exam 3"
      // with a two-question Reading section, sold for the same price as the
      // full ones. Two real papers is a smaller catalogue and an honest one.
      if (!isSellable(exam)) break
      const ids = exam.sections.flatMap(s => s.question_ids)
      if (repeatShare(ids, published) > MAX_REPEAT_SHARE) break
      ids.forEach(id => published.add(id))
      practiceExams.push(exam)
    }
    continue
  }
  // Fill the paper first, then decide how many papers the pool supports —
  // rather than fixing the count and letting the size collapse. Every question
  // may be used twice, so a pool of n supports 2n slots.
  //
  // Science has 24 questions a level: as three papers that was 16 questions
  // each, and as two it is a full 24. Year 11 Maths Methods has 55: as five
  // papers that was 22 each, and as three it is the full 30.
  const examSize = Math.min(SECTION_SIZE, questions.length)
  const examCount = Math.max(
    1,
    Math.min(EXAM_COUNT[subject] ?? 3, Math.floor((questions.length * 2) / examSize))
  )
  if (examSize < MIN_SELLABLE_SECTION) continue
  const exams = buildExams(questions, examCount, examSize)
  // Keep papers only while each is mostly new (see MAX_REPEAT_SHARE).
  const published = new Set()
  const fresh = []
  for (const ids of exams) {
    if (repeatShare(ids, published) > MAX_REPEAT_SHARE) break
    ids.forEach(id => published.add(id))
    fresh.push(ids)
  }
  fresh.forEach((questionIds, i) => {
    const gradeLabel = GRADE_LABEL[yearLevel] ?? yearLevel
    practiceExams.push({
      id: `${subject}-${yearLevel}-${i + 1}`,
      subject,
      yearLevel,
      title: `${SUBJECT_LABEL[subject]} ${gradeLabel} — Practice Exam ${i + 1}`,
      // Named after the subject rather than the generic "Questions", so the
      // running header reads like the rest of the catalogue.
      sections: [{
        title: SUBJECT_LABEL[subject],
        // Roughly a minute and a half per question, the pace the NAPLAN
        // sections use.
        time_minutes: Math.max(20, Math.round((questionIds.length * 1.5) / 5) * 5),
        question_ids: questionIds,
      }],
      premium: i > 0,
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
  /** Start this section's question numbers again at 1. VCAA papers number
   * within each section, so Section B opens at Question 1, not Question 21. */
  restart_numbering?: boolean
  question_ids: string[]
}

export interface PracticeExam {
  id: string
  /** Reading papers only: the magazine the student reads alongside the paper. */
  magazine_id?: string
  /** Reading papers only: minutes for the whole paper, since its sections are texts. */
  total_minutes?: number
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
