import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { hydrateExam } from '@/lib/pdf/resolveExam'
import { ExamPaperDocument } from '@/lib/pdf/ExamPaperDocument'
import { AnswerKeyDocument } from '@/lib/pdf/AnswerKeyDocument'
import { previewOf } from '@/lib/pdf/preview'
import type { TailoredExam } from './tailor'
import { tailoredAsPractice, tailoredCoverNote } from './paper'

const SITE = 'https://prepnest.com.au'

/**
 * A generated paper or its answer key as a PDF download: whole, or the
 * preview (the first third and a page describing the rest, linking back to
 * the report). Server-only.
 */
export async function paperPdfResponse(input: {
  exam: TailoredExam
  childName: string | null
  resultId: string
  full: boolean
  answers: boolean
  /** File name without the extension. */
  name: string
}): Promise<NextResponse> {
  const { exam, childName, full, answers } = input
  const resolved = hydrateExam(tailoredAsPractice(exam))
  const coverNote = tailoredCoverNote(exam, childName)
  let doc
  let filename
  if (full) {
    doc = answers ? <AnswerKeyDocument resolved={resolved} /> : <ExamPaperDocument resolved={resolved} coverNote={coverNote} />
    filename = `${input.name}${answers ? '-answers' : ''}.pdf`
  } else {
    const { resolved: cut, info } = previewOf(resolved)
    const preview = { ...info, url: `${SITE}/diagnostic/report/${input.resultId}` }
    doc = answers ? <AnswerKeyDocument resolved={cut} preview={preview} /> : <ExamPaperDocument resolved={cut} preview={preview} coverNote={coverNote} />
    filename = `${input.name}-preview${answers ? '-answers' : ''}.pdf`
  }
  const buffer = await renderToBuffer(doc)
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** "mia-grade_5-math-weak-areas-2". */
export const paperFileName = (childName: string | null, year: string, subject: string, seq: number | null) =>
  `${childName ? `${slug(childName)}-` : ''}${year}-${subject}-weak-areas${seq ? `-${seq}` : ''}`
