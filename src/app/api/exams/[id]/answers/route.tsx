import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { resolveExam, selectExamSession } from '@/lib/pdf/resolveExam'
import { AnswerKeyDocument } from '@/lib/pdf/AnswerKeyDocument'
import { gatePdf } from '@/lib/pdf/examAccess'
import { previewOf } from '@/lib/pdf/preview'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const resolved = resolveExam(params.id)
  if (!resolved) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  const gate = await gatePdf(resolved)
  if (gate.denied) return gate.denied

  // Answers to the preview's questions only: enough to show how thoroughly
  // every mark is explained, without giving away the rest of the key.
  if (gate.preview) {
    const preview = previewOf(resolved)
    const buffer = await renderToBuffer(<AnswerKeyDocument resolved={preview.resolved} preview={preview.info} />)
    return pdfResponse(buffer, `${resolved.exam.id}-preview-answers.pdf`)
  }

  const { resolved: examToRender, session } = selectExamSession(resolved, req.nextUrl.searchParams.get('session'))
  const filename = session ? `${resolved.exam.id}-numeracy-${session}-answers.pdf` : `${resolved.exam.id}-answers.pdf`

  const buffer = await renderToBuffer(<AnswerKeyDocument resolved={examToRender} />)
  return pdfResponse(buffer, filename)
}

function pdfResponse(buffer: Buffer, filename: string) {
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
