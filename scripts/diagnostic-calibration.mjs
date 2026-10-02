#!/usr/bin/env node
/**
 * Checks the diagnostic's questions against how children actually answer them.
 *
 * The evidence model (src/lib/diagnostic/evidence.ts) assumes each question
 * measures its area fairly. A question that is mis-tagged, ambiguous or wrong
 * breaks that silently: a "foundation" question most children miss produces
 * false weaknesses in every report it appears in. Once real results exist,
 * this lists the questions that behave unlike their tag, so they can be fixed
 * or retired before they mislead more parents.
 *
 * For every question asked at least MIN_ASKED times (follow-ups included):
 *   - facility:       the share answered correctly (answers given in under
 *                     2.5 seconds and lucky guesses left out, as in a report)
 *   - discrimination: the correlation between getting it right and doing well
 *                     on the rest of the same test. Near zero or negative means
 *                     the question does not measure what the test measures.
 *
 * Flags: a foundation question under 40% facility, an advanced one over 90%,
 * discrimination under 0.1, and options no one chooses (for multiple choice).
 *
 * Read-only. Needs SUPABASE_SERVICE_ROLE_KEY in .env.local (results are not
 * readable with the anon key). Prints counts and question ids, never answers
 * or names.
 *
 *   node scripts/diagnostic-calibration.mjs            questions asked ≥ 20 times
 *   node scripts/diagnostic-calibration.mjs 10         a lower threshold
 */
import { readFileSync } from 'node:fs'
import { QUESTION_BANK } from '../src/lib/questions/bank.ts'
import { classify } from '../src/lib/diagnostic/areas.ts'
import { isCorrect, RAPID_MS } from '../src/lib/diagnostic/score.ts'

const MIN_ASKED = Number(process.argv[2] ?? 20)

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      const env = {}
      for (const line of readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
        if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
      }
      return env
    } catch {
      /* try the next one */
    }
  }
  return {}
}

const env = loadEnv()
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL_BASE || !KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing from .env.local')
  process.exit(2)
}

async function fetchAll() {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const res = await fetch(`${URL_BASE}/rest/v1/diagnostic_results?select=year_level,subject,responses&order=created_at`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Range: `${from}-${from + 999}` },
    })
    if (!res.ok) {
      console.error(`Could not read diagnostic_results (${res.status}): ${await res.text()}`)
      process.exit(1)
    }
    const page = await res.json()
    rows.push(...page)
    if (page.length < 1000) return rows
  }
}

const byId = new Map(QUESTION_BANK.map(q => [q.id, q]))
const rows = await fetchAll()
console.log(`\n${rows.length} saved diagnostic results.\n`)

/** Per question: [correct (0/1), rest-of-test share] pairs, and option counts. */
const stats = new Map()
for (const row of rows) {
  const counted = row.responses
    .map(r => ({ r, q: byId.get(r.id) }))
    .filter(({ r, q }) => q && !(typeof r.ms === 'number' && r.ms < RAPID_MS && r.a !== null))
    .map(({ r, q }) => ({ id: q.id, right: isCorrect(q, r.a) ? 1 : 0, guessed: r.g === true, a: r.a }))
    .filter(x => !(x.guessed && x.right))
  const total = counted.reduce((n, x) => n + x.right, 0)
  for (const x of counted) {
    const s = stats.get(x.id) ?? { pairs: [], options: new Map() }
    const rest = counted.length > 1 ? (total - x.right) / (counted.length - 1) : 0
    s.pairs.push([x.right, rest])
    if (typeof x.a === 'number') s.options.set(x.a, (s.options.get(x.a) ?? 0) + 1)
    stats.set(x.id, s)
  }
}

function correlation(pairs) {
  const n = pairs.length
  const mx = pairs.reduce((a, [x]) => a + x, 0) / n
  const my = pairs.reduce((a, [, y]) => a + y, 0) / n
  let sxy = 0, sxx = 0, syy = 0
  for (const [x, y] of pairs) {
    sxy += (x - mx) * (y - my)
    sxx += (x - mx) ** 2
    syy += (y - my) ** 2
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0
}

const flagged = []
let checked = 0
for (const [id, s] of stats) {
  if (s.pairs.length < MIN_ASKED) continue
  checked++
  const q = byId.get(id)
  const facility = s.pairs.reduce((a, [x]) => a + x, 0) / s.pairs.length
  const disc = correlation(s.pairs)
  const reasons = []
  if (q.difficulty === 'foundation' && facility < 0.4) reasons.push('foundation but mostly missed')
  if (q.difficulty === 'advanced' && facility > 0.9) reasons.push('advanced but nearly always right')
  if (disc < 0.1) reasons.push(`does not track the rest of the test (r = ${disc.toFixed(2)})`)
  if ('options' in q && q.options && q.format !== 'short_answer') {
    const unused = q.options.map((_, i) => i).filter(i => i !== q.correct_index && !s.options.get(i))
    if (unused.length && s.pairs.length >= 40) reasons.push(`option${unused.length > 1 ? 's' : ''} ${unused.map(i => 'ABCDEF'[i]).join(', ')} never chosen`)
  }
  if (reasons.length) {
    flagged.push({ id, year: q.year_level, area: classify(q).area.label, difficulty: q.difficulty, asked: s.pairs.length, facility, reasons })
  }
}

console.log(`${checked} questions asked at least ${MIN_ASKED} times; ${flagged.length} to look at.\n`)
for (const f of flagged.sort((a, b) => b.asked - a.asked)) {
  console.log(`${f.id}  ${f.year}  ${f.area}  ${f.difficulty}  asked ${f.asked}, ${Math.round(f.facility * 100)}% right`)
  for (const r of f.reasons) console.log(`    - ${r}`)
}
if (!checked) console.log('Not enough results yet. Run this again once more children have sat the test.')
console.log()
