#!/usr/bin/env node
/**
 * Loads the question bank into the live `questions` table through the Supabase
 * REST API — the alternative to pasting supabase/seed-parts/ into the SQL
 * editor seven times.
 *
 * Why the live table matters at all: practice questions are served from
 * bank.ts, but `question_attempts.question_id` references `questions.id`. A
 * question that exists in the bank and not in the table can be shown and
 * answered, and then the attempt fails to save — silently, because the app
 * wraps its database writes. Every content rewrite changes ids, so run this
 * after each one.
 *
 *   node scripts/load-questions.mjs          report what is missing (anon key, read-only)
 *   node scripts/load-questions.mjs --write  upsert every question (needs SUPABASE_SERVICE_ROLE_KEY in .env.local)
 *
 * Upserts are idempotent: re-running is safe, and rows whose content changed
 * are updated. Nothing is deleted — ids retired from the bank stay in the
 * table, where old attempts still point at them.
 */
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadMagazines, loadStimuli, magazineStimuli } from './lib/content.mjs'

const repo = join(dirname(fileURLToPath(import.meta.url)), '..')
const write = process.argv.includes('--write')

const env = {}
for (const line of readFileSync(join(repo, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}
const base = env.NEXT_PUBLIC_SUPABASE_URL
const key = write ? env.SUPABASE_SERVICE_ROLE_KEY : env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!base || !key) {
  console.error(write
    ? 'Add SUPABASE_SERVICE_ROLE_KEY=... to .env.local (Supabase → Project Settings → API Keys → secret key). .env.local is gitignored.'
    : 'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing from .env.local.')
  process.exit(2)
}
// New-format keys (sb_secret_…, sb_publishable_…) go in the apikey header only;
// the gateway rejects them as a Bearer token because they are not JWTs.
const headers = { apikey: key, 'Content-Type': 'application/json' }
if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`

// Load bank.ts the way the generators do.
const src = readFileSync(join(repo, 'src/lib/questions/bank.ts'), 'utf8').replace(/\r\n/g, '\n') // tolerate a Windows (CRLF) checkout
  .replace(/^import type .+\n/m, '')
  .replace(/^type BankQuestion =[\s\S]*?\n\n/m, '')
  .replace(/const (\w+): BankQuestion\[\] = \[/g, 'const $1 = [')
const tmp = join(repo, '.bank-load-tmp.mjs')
writeFileSync(tmp, src)
const { QUESTION_BANK } = await import('file://' + tmp)
unlinkSync(tmp)

const live = new Set()
for (let from = 0; ; from += 1000) {
  const res = await fetch(`${base}/rest/v1/questions?select=id`, { headers: { ...headers, Range: `${from}-${from + 999}` } })
  const rows = await res.json()
  if (!res.ok || !Array.isArray(rows)) { console.error('Could not read questions:', rows); process.exit(1) }
  rows.forEach(r => live.add(r.id))
  if (rows.length < 1000) break
}
const missing = QUESTION_BANK.filter(q => !live.has(q.id))
console.log(`Bank: ${QUESTION_BANK.length} questions. Live table: ${live.size} rows. Missing from live: ${missing.length}.`)
if (!write) {
  if (missing.length) console.log('Run with --write to load them.')
  process.exit(missing.length ? 1 : 0)
}

// The same columns and values gen-seed.mjs writes.
const row = q => ({
  id: q.id,
  topic: q.topic,
  year_level: q.year_level,
  difficulty: q.difficulty,
  format: q.format ?? 'multiple_choice',
  question_text: q.question_text,
  options: q.options ?? null,
  correct_index: q.correct_index ?? null,
  explanation: q.explanation,
  curriculum_code: q.curriculum_code ?? null,
  stimulus_id: q.stimulus_id ?? null,
  calculator_allowed: q.calculator_allowed ?? null,
  is_published: true,
  expected_answer: q.expected_answer ?? null,
  accepted_answers: q.accepted_answers?.length ? q.accepted_answers : null,
  parts: q.parts ?? null,
  marks: q.marks ?? null,
})

// Passages and magazine texts first: questions.stimulus_id references
// stimuli.id, so a question whose text is not in the table is refused and
// takes its whole batch down with it.
const stimuli = [...(await loadStimuli(repo)), ...magazineStimuli(await loadMagazines(repo))]
const stimulusRes = await fetch(`${base}/rest/v1/stimuli?on_conflict=id`, {
  method: 'POST',
  headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
  body: JSON.stringify(stimuli.map(s => ({
    id: s.id, type: s.type, title: s.title, body: s.body, subject: s.subject, year_level: s.year_level, word_count: s.word_count ?? null,
  }))),
})
if (!stimulusRes.ok) {
  console.error(`Stimuli failed (${stimulusRes.status}): ${await stimulusRes.text()}`)
  process.exit(1)
}
console.log(`  upserted ${stimuli.length} stimuli`)

let done = 0
for (let i = 0; i < QUESTION_BANK.length; i += 200) {
  const batch = QUESTION_BANK.slice(i, i + 200).map(row)
  const res = await fetch(`${base}/rest/v1/questions?on_conflict=id`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(batch),
  })
  if (!res.ok) {
    console.error(`Batch starting at ${i} failed (${res.status}): ${await res.text()}`)
    process.exit(1)
  }
  done += batch.length
  process.stdout.write(`\r  upserted ${done}/${QUESTION_BANK.length}`)
}
console.log('\nDone. Re-run without --write to confirm nothing is missing.')
