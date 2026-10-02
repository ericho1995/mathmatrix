import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { hydrateExam } from '@/lib/pdf/resolveExam'
import { ExamPaperDocument } from '@/lib/pdf/ExamPaperDocument'
import { AnswerKeyDocument } from '@/lib/pdf/AnswerKeyDocument'
import { previewOf } from '@/lib/pdf/preview'
import { sampleResult } from '@/lib/diagnostic/sample'
import { composeTailoredExam } from '@/lib/diagnostic/tailor'
import { devPaper } from '@/lib/diagnostic/devPaper'
import { tailoredAsPractice, tailoredCoverNote } from '@/lib/diagnostic/paper'
import { headlineOf } from '@/lib/diagnostic/score'
import { YEAR_STAGES } from '@/lib/yearLevels'
import type { SubjectSlug, YearLevel } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Development only: a sample diagnostic result, its report data and its
 * tailored exam, with no account.
 *
 *   /api/dev/diagnostic?year=grade_5&subject=math&doc=report
 *   /api/dev/diagnostic?year=year_12&subject=specialist_maths&doc=paper|answers|preview&seed=3
 *   …&seq=2  weak-areas paper 2 instead of the original tailored exam
 *
 * Refuses to run in a production build or off localhost: it prints paid content.
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  if (process.env.NODE_ENV === 'production' || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const params = req.nextUrl.searchParams
  const year = (params.get('year') ?? 'grade_5') as YearLevel
  const subject = (params.get('subject') ?? 'math') as SubjectSlug
  const seed = Number(params.get('seed') ?? 1) || 1
  const doc = params.get('doc') ?? 'report'
  if (!YEAR_STAGES.some(s => (s.years as readonly string[]).includes(year))) return NextResponse.json({ error: 'Unknown year' }, { status: 400 })

  const sample = sampleResult(QUESTION_BANK, year, subject, seed)
  if (!sample) return NextResponse.json({ error: 'That test is not offered' }, { status: 404 })
  const resultId = `sample-${year}-${subject}-${seed}`
  const name = 'Mia'
  const exam = params.get('seq')
    ? devPaper(Object.fromEntries(params))!
    : composeTailoredExam(QUESTION_BANK, { resultId, report: sample.report, childName: name })

  if (doc === 'report') {
    return NextResponse.json({ headline: headlineOf(sample.report, name), report: sample.report, exam })
  }

  const resolved = hydrateExam(tailoredAsPractice(exam))
  const coverNote = tailoredCoverNote(exam, name)
  let pdf
  if (doc === 'preview') {
    const { resolved: cut, info } = previewOf(resolved)
    pdf = <ExamPaperDocument resolved={cut} preview={{ ...info, url: 'https://prepnest.com.au/diagnostic' }} coverNote={coverNote} />
  } else if (doc === 'answers') {
    pdf = <AnswerKeyDocument resolved={resolved} />
  } else {
    pdf = <ExamPaperDocument resolved={resolved} coverNote={coverNote} />
  }
  const buffer = await renderToBuffer(pdf)
  return new NextResponse(new Uint8Array(buffer), { headers: { 'Content-Type': 'application/pdf' } })
}
