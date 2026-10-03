import { NextResponse } from 'next/server'
import { getAccess } from '@/lib/auth/access'
import { loadResult } from '@/lib/diagnostic/load'
import { paperOpen, paperRights } from '@/lib/diagnostic/access'
import { generatePaper } from '@/lib/diagnostic/papers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Generates the next weak-areas paper for a result: POST, no body. Anyone who
 * can see the result may ask; what they get depends on their plan (see
 * paperRights). Returns { paperId }, or an error with a `code` the page reads:
 * 'locked' (no plan), 'limit' (this month's papers used) or 'exhausted' (no
 * unseen questions left for the weak areas).
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const loaded = await loadResult(params.id)
  if (!loaded.ok) {
    return NextResponse.json({ error: loaded.status === 401 ? 'Sign in to generate a paper' : 'Result not found' }, { status: loaded.status })
  }
  const access = await getAccess()
  if (access.failed) return NextResponse.json({ error: 'Could not check your plan just now. Please try again.' }, { status: 503 })
  const { result, viewerId } = loaded
  const outcome = await generatePaper({
    result,
    viewerId,
    rights: paperRights(result.year, access),
    isOpen: id => paperOpen({ id, year: result.year }, access),
  })
  if (!outcome.ok) return NextResponse.json({ error: outcome.error, code: outcome.code }, { status: outcome.status })
  return NextResponse.json({ paperId: outcome.paperId, existing: outcome.existing ?? false })
}
