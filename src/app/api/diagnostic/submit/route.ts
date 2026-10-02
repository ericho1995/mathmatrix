import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildReport, headlineOf } from '@/lib/diagnostic/score'
import { saveResult } from '@/lib/diagnostic/save'
import { TEST_TTL_MS, diagnosticKey, isFresh, signClaims, verifyClaims, type ReceiptClaims, type TestClaims } from '@/lib/diagnostic/token'
import { BY_ID, answersOf, parseAnswers } from '@/lib/diagnostic/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

/**
 * Submits a test: POST { token, answers }.
 *
 * Marks it on the server. Signed in, the result is saved and its id returned.
 * Signed out — or if saving fails — the headline comes back with a signed
 * receipt, which can be saved to an account after sign-up (POST /claim).
 */
export async function POST(req: NextRequest) {
  const key = diagnosticKey()
  if (!key) return NextResponse.json({ error: 'The diagnostic is not available right now.' }, { status: 503, headers: noStore })

  let body: { token?: unknown; answers?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: noStore })
  }
  const claims = verifyClaims<TestClaims>(body.token, key)
  if (!claims) return NextResponse.json({ error: 'This test could not be read. Please start again.' }, { status: 400, headers: noStore })
  if (!isFresh(claims.t, TEST_TTL_MS)) return NextResponse.json({ error: 'This test has expired. Please start a new one.' }, { status: 410, headers: noStore })
  const responses = parseAnswers(body.answers, claims)
  if (!responses) return NextResponse.json({ error: 'The answers could not be read.' }, { status: 400, headers: noStore })

  const report = buildReport(BY_ID, claims.y, claims.s, responses)
  const receiptClaims: ReceiptClaims = { ...claims, a: answersOf(responses), d: Date.now() }
  const receipt = signClaims(receiptClaims, key)
  const headline = headlineOf(report, claims.n)

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ saved: false, receipt, headline }, { headers: noStore })

  const saved = await saveResult({
    userId: user.id,
    year: claims.y,
    subject: claims.s,
    childName: claims.n,
    responses,
    report,
    receiptRef: claims.r,
  })
  if (saved.ok) return NextResponse.json({ saved: true, id: saved.id }, { headers: noStore })
  // Not lost: the receipt lets the results page try again.
  return NextResponse.json({ saved: false, receipt, headline, saveError: saved.error }, { headers: noStore })
}
