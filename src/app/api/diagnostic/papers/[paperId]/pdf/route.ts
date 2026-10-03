import { NextRequest, NextResponse } from 'next/server'
import { getAccess } from '@/lib/auth/access'
import { loadPaper } from '@/lib/diagnostic/papers'
import { paperOpen } from '@/lib/diagnostic/access'
import { paperFileName, paperPdfResponse } from '@/lib/diagnostic/paperPdf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * A generated paper as a PDF: GET ?doc=paper (default) or ?doc=answers.
 * Whole when the plan covers it or it was purchased; the preview otherwise.
 */
export async function GET(req: NextRequest, { params }: { params: { paperId: string } }) {
  const loaded = await loadPaper(params.paperId)
  if (!loaded.ok) {
    return NextResponse.json({ error: loaded.status === 401 ? 'Sign in to download this paper' : 'Paper not found' }, { status: loaded.status })
  }
  const { paper, result } = loaded
  return paperPdfResponse({
    exam: paper.exam,
    childName: result.childName,
    resultId: result.id,
    full: paperOpen({ id: paper.id, year: paper.year }, await getAccess()),
    answers: req.nextUrl.searchParams.get('doc') === 'answers',
    name: paperFileName(result.childName, paper.year, paper.subject, paper.seq),
  })
}
