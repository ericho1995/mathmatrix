import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { resolveExam, selectExamSession } from '@/lib/pdf/resolveExam'
import { ExamPaperDocument } from '@/lib/pdf/ExamPaperDocument'
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

  // A preview is the whole paper cut short, so it ignores the numeracy
  // calculator/non-calculator split.
  if (gate.preview) {
    const preview = previewOf(resolved)
    const buffer = await renderToBuffer(<ExamPaperDocument resolved={preview.resolved} preview={preview.info} />)
    return pdfResponse(buffer, `${resolved.exam.id}-preview.pdf`)
  }

  const { resolved: examToRender, session } = selectExamSession(resolved, req.nextUrl.searchParams.get('session'))
  const filename = session ? `${resolved.exam.id}-numeracy-${session}-exam.pdf` : `${resolved.exam.id}-exam.pdf`

  const buffer = await renderToBuffer(<ExamPaperDocument resolved={examToRender} />)
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
