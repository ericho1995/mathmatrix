import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { testSpec } from '@/lib/diagnostic/blueprint'
import { selectReading, selectTest } from '@/lib/diagnostic/select'
import { followUpBudget } from '@/lib/diagnostic/followup'
import { cleanName, diagnosticKey, signClaims, type TestClaims } from '@/lib/diagnostic/token'
import { BANK, OFFERED, freeReadingTexts, isOffered, newNonce, newSeed, screenQuestions, textsFor } from '@/lib/diagnostic/server'
import type { SubjectSlug } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

/**
 * Starts a diagnostic: POST { year, subject, name? }.
 *
 * Returns the first part's questions — HTML with no answers — and a signed
 * token naming them. A signed-in family never sees a question twice: earlier
 * sittings in the same subject and year are left out.
 */
export async function POST(req: NextRequest) {
  const key = diagnosticKey()
  if (!key) {
    console.error('[diagnostic.start] SUPABASE_SERVICE_ROLE_KEY is not set')
    return NextResponse.json({ error: 'The diagnostic is not available right now.' }, { status: 503, headers: noStore })
  }

  let body: { year?: unknown; subject?: unknown; name?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: noStore })
  }
  const { year, subject } = body
  if (!isOffered(year, subject)) return NextResponse.json({ error: 'That test is not offered' }, { status: 400, headers: noStore })
  const s = subject as SubjectSlug

  const seen = await previouslySeen(year, s)
  const seed = newSeed()
  const ids =
    s === 'reading'
      ? selectReading(BANK.filter(q => !seen.has(q.id)), year, seed, freeReadingTexts(year))
      : selectTest(BANK, testSpec(BANK, year, s)!, seed, seen)
  if (!ids.length) return NextResponse.json({ error: 'That test is not available right now.' }, { status: 503, headers: noStore })

  const claims: TestClaims = { v: 1, y: year, s, q: ids, n: cleanName(body.name), t: Date.now(), r: newNonce(), p: 1, c: ids.length, e: seed }
  const offered = OFFERED.find(o => o.year === year && o.subject === s)!
  return NextResponse.json(
    {
      token: signClaims(claims, key),
      part: 1,
      minutes: offered.minutes,
      // Follow-ups are at most this many questions (Reading: one more text).
      followUps: followUpBudget(s, year),
      questions: screenQuestions(ids),
      ...(s === 'reading' ? { texts: textsFor(ids) } : {}),
    },
    { headers: noStore }
  )
}

/** Questions this account has already sat in this subject and year. */
async function previouslySeen(year: string, subject: string): Promise<Set<string>> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Set()
  const { data, error } = await supabase.from('diagnostic_results').select('responses').eq('user_id', user.id).eq('year_level', year).eq('subject', subject)
  if (error) {
    // Not fatal: the test still works, it may just repeat a question.
    console.error('[diagnostic.start] previous sittings could not be read', { userId: user.id, error: error.message })
    return new Set()
  }
  return new Set((data ?? []).flatMap(row => (row.responses as { id: string }[]).map(r => r.id)))
}
