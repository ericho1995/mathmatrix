import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { resolveExam, selectExamSession } from '@/lib/pdf/resolveExam'
import { ExamPaperDocument } from '@/lib/pdf/ExamPaperDocument'
import { denyIfNotEntitled } from '@/lib/pdf/examAccess'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const resolved = resolveExam(params.id)
  if (!resolved) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  const denied = await denyIfNotEntitled(resolved)
  if (denied) return denied

  const { resolved: examToRender, session } = selectExamSession(resolved, req.nextUrl.searchParams.get('session'))
  const filename = session ? `${resolved.exam.id}-numeracy-${session}-exam.pdf` : `${resolved.exam.id}-exam.pdf`

  const buffer = await renderToBuffer(<ExamPaperDocument resolved={examToRender} />)
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
