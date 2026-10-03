import { NextRequest, NextResponse } from 'next/server'
import { loadResult } from '@/lib/diagnostic/load'
import { previewPaper } from '@/lib/diagnostic/papers'
import { paperFileName, paperPdfResponse } from '@/lib/diagnostic/paperPdf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * A preview of the first weak-areas paper this result would get — the first
 * third and a page describing the rest — for a visitor without a plan.
 * GET ?doc=paper (default) or ?doc=answers.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const loaded = await loadResult(params.id)
  if (!loaded.ok) {
    return NextResponse.json({ error: loaded.status === 401 ? 'Sign in to see this preview' : 'Result not found' }, { status: loaded.status })
  }
  const { result } = loaded
  return paperPdfResponse({
    exam: previewPaper(result),
    childName: result.childName,
    resultId: result.id,
    full: false,
    answers: req.nextUrl.searchParams.get('doc') === 'answers',
    name: paperFileName(result.childName, result.year, result.subject, null),
  })
}
