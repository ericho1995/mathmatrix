import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { resolveExam } from '@/lib/pdf/resolveExam'
import { ExamPaperDocument } from '@/lib/pdf/ExamPaperDocument'
import { AnswerKeyDocument } from '@/lib/pdf/AnswerKeyDocument'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Development only: any catalogue paper or its answer key, with no entitlement
 * check, so an authored paper can be read exactly as a customer receives it.
 *
 *   /api/dev/exam?id=specialist_maths-year_12-2-exam1&doc=paper
 *   /api/dev/exam?id=specialist_maths-year_12-2-exam1&doc=answers
 *
 * Refuses to run in a production build or off localhost: it prints paid
 * content.
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  if (process.env.NODE_ENV === 'production' || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const id = req.nextUrl.searchParams.get('id') ?? ''
  const resolved = resolveExam(id)
  if (!resolved) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  const doc = req.nextUrl.searchParams.get('doc') === 'answers'
    ? <AnswerKeyDocument resolved={resolved} />
    : <ExamPaperDocument resolved={resolved} />
  const buffer = await renderToBuffer(doc)
  return new NextResponse(new Uint8Array(buffer), { headers: { 'Content-Type': 'application/pdf' } })
}
