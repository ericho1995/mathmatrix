#!/usr/bin/env node
/**
 * Checks the payment environment variables in Vercel are present AND the right
 * kind of value — without printing any of them.
 *
 * Presence alone proves little. The mistakes that actually happen here all
 * produce a variable that exists and is wrong: a product id (prod_) pasted
 * where a price id (price_) belongs, the anon key pasted as the service-role
 * key (both are long JWTs from the same settings page), a test secret key next
 * to a live webhook secret. Each one fails later, at checkout or in the
 * webhook, with an error that doesn't name the variable.
 *
 * Pulls Production values to a temp file, inspects prefixes and the JWT role
 * claim, deletes the file, and prints names and verdicts only.
 *
 *   node scripts/check-vercel-env.mjs [--environment production|preview]
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, rmSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const argv = process.argv.slice(2)
const envFlag = argv.indexOf('--environment')
const ENVIRONMENT = envFlag === -1 ? 'production' : argv[envFlag + 1]

const PRICE_VARS = [
  'STRIPE_PRICE_GRADE_3', 'STRIPE_PRICE_GRADE_4', 'STRIPE_PRICE_GRADE_5', 'STRIPE_PRICE_GRADE_6',
  'STRIPE_PRICE_YEAR_7', 'STRIPE_PRICE_YEAR_8', 'STRIPE_PRICE_YEAR_9', 'STRIPE_PRICE_YEAR_10',
  'STRIPE_PRICE_YEAR_11',
]

const dir = mkdtempSync(join(tmpdir(), 'prepnest-env-'))
const file = join(dir, '.env.check')
let vars = {}
try {
  // shell:true so Windows resolves vercel.cmd; the arguments are all fixed.
  execFileSync('vercel', ['env', 'pull', file, `--environment=${ENVIRONMENT}`, '--yes'], {
    stdio: ['ignore', 'ignore', 'pipe'],
    shell: true,
  })
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/)
    if (m) vars[m[1]] = m[2]
  }
} catch (error) {
  console.error(`Could not pull ${ENVIRONMENT} variables from Vercel: ${error.stderr?.toString().trim() || error.message}`)
  process.exit(2)
} finally {
  // The pulled file holds live secrets. It never outlives this process.
  rmSync(dir, { recursive: true, force: true })
}

/** Reads the role claim from a Supabase key without verifying it — we only need to tell anon from service_role. */
function jwtRole(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
    return payload.role ?? null
  } catch {
    return null
  }
}

const results = []
function check(name, test) {
  const value = vars[name]
  if (value === undefined) return results.push([name, false, 'missing'])
  // Vercel will not hand back a variable marked Sensitive, so it arrives empty.
  if (value === '') return results.push([name, null, 'set, but marked Sensitive — cannot inspect'])
  const problem = test(value)
  results.push([name, !problem, problem ?? 'ok'])
}

let keyMode = null
check('STRIPE_SECRET_KEY', v => {
  if (v.startsWith('sk_test_')) { keyMode = 'test'; return null }
  if (v.startsWith('sk_live_')) { keyMode = 'live'; return null }
  if (v.startsWith('pk_')) return 'this is the PUBLISHABLE key (pk_) — you need the SECRET key (sk_)'
  if (v.startsWith('rk_')) return 'this is a restricted key (rk_) — use the standard secret key (sk_)'
  return 'should start with sk_test_ or sk_live_'
})

check('STRIPE_WEBHOOK_SECRET', v =>
  v.startsWith('whsec_') ? null : 'should start with whsec_ — it is the endpoint’s signing secret, not an API key')

for (const name of PRICE_VARS) {
  check(name, v => {
    if (v.startsWith('price_')) return null
    if (v.startsWith('prod_')) return 'this is a PRODUCT id (prod_) — open the product and copy the PRICE id (price_)'
    return 'should start with price_'
  })
}

check('SUPABASE_SERVICE_ROLE_KEY', v => {
  const role = jwtRole(v)
  if (role === 'service_role') return null
  if (role === 'anon') return 'this is the ANON key — use the service_role key from the same page'
  if (v.startsWith('sb_secret_')) return null // Supabase's newer secret-key format
  if (v.startsWith('sb_publishable_')) return 'this is the publishable key — use the secret / service_role key'
  return 'does not look like a Supabase service_role key'
})

// Every price must be distinct: two year levels sharing one price id means one
// of them was pasted twice and a year level is selling the wrong product.
const priceValues = PRICE_VARS.map(n => vars[n]).filter(Boolean)
const duplicates = priceValues.length !== new Set(priceValues).size

console.log(`\nVercel ${ENVIRONMENT} — payment variables\n`)
for (const [name, ok, note] of results) {
  const mark = ok === true ? '✓' : ok === null ? '?' : '✗'
  console.log(`  ${mark} ${name.padEnd(28)} ${note}`)
}
if (duplicates) console.log('\n  ✗ Two or more year levels share the same price id — one was pasted twice.')
if (keyMode) console.log(`\n  Stripe is in ${keyMode.toUpperCase()} mode.`)

const failures = results.filter(([, ok]) => ok === false).length + (duplicates ? 1 : 0)
console.log(
  failures === 0
    ? '\nAll set. Redeploy production for these to take effect.\n'
    : `\n${failures} to fix. Nothing takes effect until they are right AND production is redeployed.\n`
)
process.exit(failures === 0 ? 0 : 1)
