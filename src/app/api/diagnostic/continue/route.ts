import { NextRequest, NextResponse } from 'next/server'
import { buildReport } from '@/lib/diagnostic/score'
import { selectFollowUps, selectReadingFollowUp } from '@/lib/diagnostic/followup'
import { TEST_TTL_MS, diagnosticKey, isFresh, signClaims, verifyClaims, type TestClaims } from '@/lib/diagnostic/token'
import { BANK, BY_ID, freeReadingTexts, parseAnswers, screenQuestions, textsFor } from '@/lib/diagnostic/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

/**
 * The second part of a test: POST { token, answers } for the first part.
 *
 * Marks the first part privately and chooses follow-up questions where the
 * result could still go either way (see followup.ts). Returns a new token
 * naming every question and the new questions only — nothing about how the
 * first part went. An empty list means the first part was clear-cut and the
 * test can be submitted.
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
  if (!claims || claims.p !== 1) return NextResponse.json({ error: 'This test could not be read. Please start again.' }, { status: 400, headers: noStore })
  if (!isFresh(claims.t, TEST_TTL_MS)) return NextResponse.json({ error: 'This test has expired. Please start a new one.' }, { status: 410, headers: noStore })
  const responses = parseAnswers(body.answers, claims)
  if (!responses) return NextResponse.json({ error: 'The answers could not be read.' }, { status: 400, headers: noStore })

  const report = buildReport(BY_ID, claims.y, claims.s, responses)
  const seed = claims.e ?? 1
  const more =
    claims.s === 'reading'
      ? selectReadingFollowUp(BANK, report, seed, freeReadingTexts(claims.y))
      : selectFollowUps(BANK, report, seed)

  const next: TestClaims = { ...claims, q: [...claims.q, ...more], c: claims.q.length, p: 2 }
  return NextResponse.json(
    {
      token: signClaims(next, key),
      part: 2,
      questions: screenQuestions(more, claims.q.length + 1),
      ...(claims.s === 'reading' && more.length ? { texts: textsFor(more) } : {}),
    },
    { headers: noStore }
  )
}
