#!/usr/bin/env node
// Regenerates supabase/seed.sql from src/lib/questions/bank.ts.
//
// Safe to re-run: existing `id:` fields in bank.ts are kept as-is (so
// question_attempts rows already saved against them stay valid); only
// newly added questions without an id get one assigned.
//
// Usage: node scripts/gen-seed.mjs

import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const bankPath = join(repoRoot, 'src/lib/questions/bank.ts')
const stimuliPath = join(repoRoot, 'src/lib/questions/stimuli.ts')
const seedPath = join(repoRoot, 'supabase/seed.sql')

let src = readFileSync(bankPath, 'utf8')

// Assign an id to any question object that doesn't already have one.
let added = 0
src = src.replace(/\{\n(\s+)(?!id:)topic:/g, (m, indent) => {
  added++
  return `{\n${indent}id: '${randomUUID()}',\n${indent}topic:`
})
if (added > 0) {
  writeFileSync(bankPath, src)
  console.log(`Assigned ids to ${added} new question(s) in bank.ts.`)
}

let stimuliSrc = readFileSync(stimuliPath, 'utf8')
let stimuliAdded = 0
stimuliSrc = stimuliSrc.replace(/\{\n(\s+)(?!id:)type:/g, (m, indent) => {
  stimuliAdded++
  return `{\n${indent}id: '${randomUUID()}',\n${indent}type:`
})
if (stimuliAdded > 0) {
  writeFileSync(stimuliPath, stimuliSrc)
  console.log(`Assigned ids to ${stimuliAdded} new stimulus/stimuli in stimuli.ts.`)
}

// Strip TS-only syntax so the array literal can be evaluated as plain JS.
const jsSrc = src
  .replace(/^import type .+\n/m, '')
  .replace(/^type BankQuestion =[\s\S]*?\n\n/m, '')
  .replace(/const (\w+): BankQuestion\[\] = \[/g, 'const $1 = [')

const tmpPath = join(repoRoot, '.bank-tmp.mjs')
writeFileSync(tmpPath, jsSrc)
const { QUESTION_BANK } = await import('file://' + tmpPath)
unlinkSync(tmpPath)

console.log(`Parsed ${QUESTION_BANK.length} questions.`)

const stimuliJsSrc = stimuliSrc
  .replace(/^import type .+\n/m, '')
  .replace(/export const STIMULI:[^=]+=\s*\[/, 'export const STIMULI = [')
const stimuliTmpPath = join(repoRoot, '.stimuli-tmp.mjs')
writeFileSync(stimuliTmpPath, stimuliJsSrc)
const { STIMULI } = await import('file://' + stimuliTmpPath)
unlinkSync(stimuliTmpPath)
console.log(`Parsed ${STIMULI.length} stimuli.`)

function sqlQuote(str) {
  return `'${String(str).replace(/'/g, "''")}'`
}

const stimuliSqlLines = STIMULI.map(s => {
  const wordCount = s.word_count ?? 'null'
  return `(${sqlQuote(s.id)}, ${sqlQuote(s.type)}, ${sqlQuote(s.title)}, ${sqlQuote(s.body)}, ${sqlQuote(s.subject)}, ${sqlQuote(s.year_level)}, ${wordCount})`
})
const stimuliSql = stimuliSqlLines.length ? `insert into stimuli (id, type, title, body, subject, year_level, word_count)
values
${stimuliSqlLines.join(',\n')}
on conflict (id) do update set
  type = excluded.type,
  title = excluded.title,
  body = excluded.body,
  subject = excluded.subject,
  year_level = excluded.year_level,
  word_count = excluded.word_count;

` : ''

const sqlLines = QUESTION_BANK.map(q => {
  const format = q.format ?? 'multiple_choice'
  const options = q.options ? `'${JSON.stringify(q.options).replace(/'/g, "''")}'::jsonb` : 'null'
  const correctIndex = q.correct_index ?? 'null'
  const curriculumCode = q.curriculum_code ? sqlQuote(q.curriculum_code) : 'null'
  const stimulusId = q.stimulus_id ? sqlQuote(q.stimulus_id) : 'null'
  const calculatorAllowed = q.calculator_allowed === undefined ? 'null' : q.calculator_allowed
  const expectedAnswer = q.expected_answer ? sqlQuote(q.expected_answer) : 'null'
  // VCE multi-part: the parts carry the marks and the marking guidance, so
  // dropping them would leave the database holding only the scenario.
  const parts = q.parts ? `'${JSON.stringify(q.parts).replace(/'/g, "''")}'::jsonb` : 'null'
  const marks = q.marks ?? 'null'
  const acceptedAnswers = q.accepted_answers && q.accepted_answers.length
    ? `ARRAY[${q.accepted_answers.map(sqlQuote).join(', ')}]::text[]`
    : 'null'
  return `(${sqlQuote(q.id)}, ${sqlQuote(q.topic)}, ${sqlQuote(q.year_level)}, ${sqlQuote(q.difficulty)}, ${sqlQuote(format)}, ${sqlQuote(q.question_text)}, ${options}, ${correctIndex}, ${sqlQuote(q.explanation)}, ${curriculumCode}, ${stimulusId}, ${calculatorAllowed}, true, ${expectedAnswer}, ${acceptedAnswers}, ${parts}, ${marks})`
})

const sql = `-- ─────────────────────────────────────────────────────────────────────────────
-- PrepNest — Question bank seed
-- Auto-generated from src/lib/questions/bank.ts — do not hand-edit.
-- Regenerate with \`node scripts/gen-seed.mjs\` if the bank changes.
-- Run this in the Supabase SQL editor AFTER schema.sql.
-- ─────────────────────────────────────────────────────────────────────────────

${stimuliSql}insert into questions (id, topic, year_level, difficulty, format, question_text, options, correct_index, explanation, curriculum_code, stimulus_id, calculator_allowed, is_published, expected_answer, accepted_answers, parts, marks)
values
${sqlLines.join(',\n')}
on conflict (id) do update set
  topic = excluded.topic,
  year_level = excluded.year_level,
  difficulty = excluded.difficulty,
  format = excluded.format,
  question_text = excluded.question_text,
  options = excluded.options,
  correct_index = excluded.correct_index,
  explanation = excluded.explanation,
  curriculum_code = excluded.curriculum_code,
  stimulus_id = excluded.stimulus_id,
  calculator_allowed = excluded.calculator_allowed,
  is_published = excluded.is_published,
  expected_answer = excluded.expected_answer,
  accepted_answers = excluded.accepted_answers,
  parts = excluded.parts,
  marks = excluded.marks;
`

writeFileSync(seedPath, sql)
console.log(`Wrote supabase/seed.sql (${sqlLines.length} rows).`)
