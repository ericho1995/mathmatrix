#!/usr/bin/env node
/**
 * Reports which migrations have actually reached the live Supabase project.
 *
 * The repo's SQL files being correct has never meant the database matches
 * them — migrations here are applied by hand in the dashboard, and this
 * project has twice shipped with code that assumed a column the live database
 * did not have. The failures are invisible from the UI because the app wraps
 * its reads, so the only honest check is to ask PostgREST directly.
 *
 * Read-only. Uses the anon key from .env.local, which is safe to run anywhere.
 *
 *   node scripts/check-live-schema.mjs
 */
import { readFileSync } from 'node:fs'

function loadEnv() {
  let text
  for (const file of ['.env.local', '.env']) {
    try {
      text = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
      break
    } catch {
      /* try the next one */
    }
  }
  if (!text) {
    console.error('Could not read .env.local — run this from the repo root.')
    process.exit(2)
  }
  const env = {}
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
  return env
}

const env = loadEnv()
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!URL_BASE || !KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing from .env.local')
  process.exit(2)
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` }

async function get(path, extraHeaders = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    headers: { ...headers, ...extraHeaders },
  })
  return { status: res.status, body: await res.text(), headers: res.headers }
}

/** A table exists if PostgREST can describe it (an empty result still means yes). */
async function tableExists(table) {
  const { body } = await get(`${table}?select=*&limit=1`)
  return !body.includes('PGRST205')
}

/** A column exists if selecting it does not come back as "does not exist". */
async function columnExists(table, column) {
  const { body } = await get(`${table}?select=${column}&limit=1`)
  return !body.includes('does not exist')
}

/** An enum value exists if filtering on it is accepted, even with no rows. */
async function enumValueExists(table, column, value) {
  const { body } = await get(`${table}?select=id&${column}=eq.${value}&limit=1`)
  return !body.includes('invalid input value')
}

async function rowCount(table) {
  const { headers: h } = await get(`${table}?select=id&limit=1`, { Prefer: 'count=exact' })
  const range = h.get('content-range')
  const total = range?.split('/')[1]
  return total === undefined ? null : Number(total)
}

// Each migration is identified by something it creates that nothing else does.
const MIGRATIONS = [
  {
    file: 'schema_topics_and_longform.sql',
    checks: [
      () => enumValueExists('questions', 'topic', 'number_patterns'),
      () => columnExists('questions', 'format'),
      () => columnExists('question_attempts', 'response_text'),
    ],
  },
  {
    file: 'schema_general_maths_rename.sql',
    checks: [() => enumValueExists('questions', 'topic', 'gm_data_analysis')],
  },
  {
    file: 'schema_stimuli.sql',
    checks: [() => tableExists('stimuli'), () => columnExists('questions', 'calculator_allowed')],
  },
  {
    file: 'schema_short_answer.sql',
    checks: [() => columnExists('questions', 'expected_answer')],
  },
  {
    file: 'schema_vce_unit34.sql',
    checks: [
      () => enumValueExists('questions', 'topic', 'mm_functions'),
      () => columnExists('questions', 'parts'),
      () => columnExists('questions', 'marks'),
    ],
  },
  {
    file: 'schema_general_maths_unit34.sql',
    checks: [() => enumValueExists('questions', 'topic', 'gm_matrices')],
  },
  {
    // Nothing can query a session_mode enum value without a row to filter, so
    // this one is checked by attempting the filter on practice_sessions.
    file: 'schema_paper_results.sql',
    checks: [() => enumValueExists('practice_sessions', 'mode', 'paper')],
  },
  {
    file: 'schema_entitlements.sql',
    checks: [() => tableExists('entitlements')],
  },
  {
    file: 'schema_subscriptions.sql',
    checks: [() => tableExists('subscriptions'), () => tableExists('paper_purchases')],
  },
]

const EXPECTED_QUESTIONS = 1800 // seed.sql currently carries 1,825

console.log(`\nLive project: ${URL_BASE}\n`)

let pending = 0
for (const migration of MIGRATIONS) {
  const results = await Promise.all(migration.checks.map(c => c()))
  const applied = results.every(Boolean)
  if (!applied) pending++
  console.log(`  ${applied ? '✓ applied' : '✗ PENDING'}   ${migration.file}`)
}

const questions = await rowCount('questions')
const seedLoaded = questions !== null && questions >= EXPECTED_QUESTIONS
if (!seedLoaded) pending++
console.log(
  `  ${seedLoaded ? '✓ applied' : '✗ PENDING'}   seed.sql  (${questions ?? '?'} question rows, expected ≥ ${EXPECTED_QUESTIONS})`
)

console.log()
if (pending === 0) {
  console.log('All migrations are live. The database is ready to take payments.\n')
} else {
  console.log(
    `${pending} still to run. Apply them in the order listed above — each as its own\n` +
      `query in the Supabase SQL editor, seed.sql last. See docs/LAUNCH-RUNBOOK.md.\n`
  )
}
process.exit(pending === 0 ? 0 : 1)
