import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { resolveExam } from '@/lib/pdf/resolveExam'
import { ReadingMagazineDocument } from '@/lib/pdf/ReadingMagazineDocument'
import { gatePdf } from '@/lib/pdf/examAccess'
import { previewOf } from '@/lib/pdf/preview'
import { MAGAZINES } from '@/lib/questions/magazines'

export const runtime = 'nodejs'

/** The Reading Magazine that goes with a Reading paper. Same purchase, same gate. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const resolved = resolveExam(params.id)
  const magazine = resolved?.exam.magazine_id ? MAGAZINES.find(m => m.id === resolved.exam.magazine_id) : undefined
  if (!resolved || !magazine) {
    return NextResponse.json({ error: 'Magazine not found' }, { status: 404 })
  }

  const gate = await gatePdf(resolved)
  if (gate.denied) return gate.denied

  // A preview's magazine holds only the texts its questions use. Texts are
  // placed by their page number, so leaving out later ones moves nothing.
  let toRender = magazine
  if (gate.preview) {
    const used = new Set(previewOf(resolved).resolved.sections.flatMap(s => s.questions.map(q => q.stimulus_id)))
    toRender = { ...magazine, texts: magazine.texts.filter(t => used.has(t.id)) }
  }

  const buffer = await renderToBuffer(<ReadingMagazineDocument magazine={toRender} title={resolved.exam.title} />)
  const filename = gate.preview ? `${resolved.exam.id}-magazine-preview.pdf` : `${resolved.exam.id}-magazine.pdf`
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
