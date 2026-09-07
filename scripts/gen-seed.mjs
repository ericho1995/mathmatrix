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

// Strip TS-only syntax so the array literal can be evaluated as plain JS.
const jsSrc = src
  .replace(/^import type .+\n/m, '')
  .replace(/export const QUESTION_BANK:[^=]+=\s*\[/, 'export const QUESTION_BANK = [')

const tmpPath = join(repoRoot, '.bank-tmp.mjs')
writeFileSync(tmpPath, jsSrc)
const { QUESTION_BANK } = await import('file://' + tmpPath)
unlinkSync(tmpPath)

console.log(`Parsed ${QUESTION_BANK.length} questions.`)

function sqlQuote(str) {
  return `'${String(str).replace(/'/g, "''")}'`
}

const sqlLines = QUESTION_BANK.map(q => {
  const options = `'${JSON.stringify(q.options).replace(/'/g, "''")}'::jsonb`
  const curriculumCode = q.curriculum_code ? sqlQuote(q.curriculum_code) : 'null'
  return `(${sqlQuote(q.id)}, ${sqlQuote(q.topic)}, ${sqlQuote(q.year_level)}, ${sqlQuote(q.difficulty)}, ${sqlQuote(q.question_text)}, ${options}, ${q.correct_index}, ${sqlQuote(q.explanation)}, ${curriculumCode}, true)`
})

const sql = `-- ─────────────────────────────────────────────────────────────────────────────
-- PrepNest — Question bank seed
-- Auto-generated from src/lib/questions/bank.ts — do not hand-edit.
-- Regenerate with \`node scripts/gen-seed.mjs\` if the bank changes.
-- Run this in the Supabase SQL editor AFTER schema.sql.
-- ─────────────────────────────────────────────────────────────────────────────

insert into questions (id, topic, year_level, difficulty, question_text, options, correct_index, explanation, curriculum_code, is_published)
values
${sqlLines.join(',\n')}
on conflict (id) do update set
  topic = excluded.topic,
  year_level = excluded.year_level,
  difficulty = excluded.difficulty,
  question_text = excluded.question_text,
  options = excluded.options,
  correct_index = excluded.correct_index,
  explanation = excluded.explanation,
  curriculum_code = excluded.curriculum_code,
  is_published = excluded.is_published;
`

writeFileSync(seedPath, sql)
console.log(`Wrote supabase/seed.sql (${sqlLines.length} rows).`)
