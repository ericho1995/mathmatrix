import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { resolveExam } from '@/lib/pdf/resolveExam'
import { AnswerKeyDocument } from '@/lib/pdf/AnswerKeyDocument'
import { PREMIUM_PRICE } from '@/lib/pricing'
import { getUserRole } from '@/lib/auth/getUserRole'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const resolved = resolveExam(params.id)
  if (!resolved) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  if (resolved.exam.premium && (await getUserRole()) !== 'admin') {
    return NextResponse.json({ error: 'Payment required', price: PREMIUM_PRICE }, { status: 402 })
  }

  const buffer = await renderToBuffer(<AnswerKeyDocument resolved={resolved} />)
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${resolved.exam.id}-answers.pdf"`,
    },
  })
}
