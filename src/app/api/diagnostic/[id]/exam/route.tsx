import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { hydrateExam } from '@/lib/pdf/resolveExam'
import { ExamPaperDocument } from '@/lib/pdf/ExamPaperDocument'
import { AnswerKeyDocument } from '@/lib/pdf/AnswerKeyDocument'
import { previewOf } from '@/lib/pdf/preview'
import { getAccess } from '@/lib/auth/access'
import { loadResult } from '@/lib/diagnostic/load'
import { tailoredAccess } from '@/lib/diagnostic/access'
import { tailoredAsPractice, tailoredCoverNote } from '@/lib/diagnostic/paper'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE = 'https://prepnest.com.au'

/**
 * The tailored exam built from a saved result, as a PDF:
 * GET ?doc=paper (default) or ?doc=answers.
 *
 * Only someone who can see the result may download its exam. A plan holder
 * (Grade 3 – Year 10) or a buyer (VCE) gets it whole; anyone else gets the
 * preview, whose last page links back to the report.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const loaded = await loadResult(params.id)
  if (!loaded.ok) {
    const error = loaded.status === 401 ? 'Sign in to download this exam' : loaded.status === 404 ? 'Result not found' : 'Could not load this result'
    return NextResponse.json({ error }, { status: loaded.status })
  }
  const { result } = loaded
  const resolved = hydrateExam(tailoredAsPractice(result.exam))
  const access = tailoredAccess({ id: result.id, year: result.year }, await getAccess())
  const answers = req.nextUrl.searchParams.get('doc') === 'answers'
  const coverNote = tailoredCoverNote(result.exam, result.childName)
  const base = `${result.childName ? `${result.childName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-` : ''}${result.year}-${result.subject}-practice-exam`

  let doc
  let filename
  if (access.mode === 'full') {
    doc = answers ? <AnswerKeyDocument resolved={resolved} /> : <ExamPaperDocument resolved={resolved} coverNote={coverNote} />
    filename = `${base}${answers ? '-answers' : ''}.pdf`
  } else {
    const { resolved: cut, info } = previewOf(resolved)
    const preview = { ...info, url: `${SITE}/diagnostic/report/${result.id}` }
    doc = answers ? <AnswerKeyDocument resolved={cut} preview={preview} /> : <ExamPaperDocument resolved={cut} preview={preview} coverNote={coverNote} />
    filename = `${base}-preview${answers ? '-answers' : ''}.pdf`
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
