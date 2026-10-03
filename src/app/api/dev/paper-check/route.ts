import { NextRequest, NextResponse } from 'next/server'
import { devPaper } from '@/lib/diagnostic/devPaper'
import { answerKey, parsePaperAnswers } from '@/lib/diagnostic/online'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Development only: marks the /dev/paper sample paper, as …/check does a real one. Nothing is saved. */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const exam = devPaper(Object.fromEntries(req.nextUrl.searchParams))
  if (!exam) return NextResponse.json({ error: 'No sample for that test' }, { status: 404 })
  const body = await req.json().catch(() => ({}))
  const answers = parsePaperAnswers(exam, body.answers)
  if (!answers) return NextResponse.json({ error: 'An answer does not match this paper' }, { status: 400 })
  return NextResponse.json({ key: answerKey(exam, answers), saved: false })
}
