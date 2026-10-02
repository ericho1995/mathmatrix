import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildReport } from '@/lib/diagnostic/score'
import { saveResult } from '@/lib/diagnostic/save'
import { RECEIPT_TTL_MS, diagnosticKey, isFresh, verifyClaims, type ReceiptClaims } from '@/lib/diagnostic/token'
import { BY_ID, isOffered, parseAnswers } from '@/lib/diagnostic/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

/**
 * Saves a signed-out result to the signed-in account: POST { receipt }.
 *
 * The receipt carries the answers, not a score; they are marked again here.
 * A receipt saves once — sending it again returns the same result, and a
 * receipt already saved by another account is refused.
 */
export async function POST(req: NextRequest) {
  const key = diagnosticKey()
  if (!key) return NextResponse.json({ error: 'Saving results is not available right now.' }, { status: 503, headers: noStore })

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to save this result' }, { status: 401, headers: noStore })

  let body: { receipt?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: noStore })
  }
  const claims = verifyClaims<ReceiptClaims>(body.receipt, key)
  if (!claims || !Array.isArray(claims.a) || !isOffered(claims.y, claims.s)) {
    return NextResponse.json({ error: 'This result could not be read.' }, { status: 400, headers: noStore })
  }
  if (!isFresh(claims.d, RECEIPT_TTL_MS)) {
    return NextResponse.json({ error: 'This result is too old to save. Please sit the test again.' }, { status: 410, headers: noStore })
  }
  const responses = parseAnswers(claims.a, claims)
  if (!responses) return NextResponse.json({ error: 'This result could not be read.' }, { status: 400, headers: noStore })

  const saved = await saveResult({
    userId: user.id,
    year: claims.y,
    subject: claims.s,
    childName: claims.n,
    responses,
    report: buildReport(BY_ID, claims.y, claims.s, responses),
    receiptRef: claims.r,
  })
  if (!saved.ok) return NextResponse.json({ error: saved.error }, { status: saved.status, headers: noStore })
  return NextResponse.json({ id: saved.id }, { headers: noStore })
}
