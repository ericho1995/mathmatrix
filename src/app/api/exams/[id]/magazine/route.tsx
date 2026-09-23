import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { resolveExam } from '@/lib/pdf/resolveExam'
import { ReadingMagazineDocument } from '@/lib/pdf/ReadingMagazineDocument'
import { denyIfNotEntitled } from '@/lib/pdf/examAccess'
import { MAGAZINES } from '@/lib/questions/magazines'

export const runtime = 'nodejs'

/** The Reading Magazine that goes with a Reading paper. Same purchase, same gate. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const resolved = resolveExam(params.id)
  const magazine = resolved?.exam.magazine_id ? MAGAZINES.find(m => m.id === resolved.exam.magazine_id) : undefined
  if (!resolved || !magazine) {
    return NextResponse.json({ error: 'Magazine not found' }, { status: 404 })
  }

  const denied = await denyIfNotEntitled(resolved)
  if (denied) return denied

  const buffer = await renderToBuffer(<ReadingMagazineDocument magazine={magazine} title={resolved.exam.title} />)
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${resolved.exam.id}-magazine.pdf"`,
    },
  })
}
