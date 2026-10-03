import { NextRequest, NextResponse } from 'next/server'
import { getAccess } from '@/lib/auth/access'
import { loadPaper, savePaperMarks } from '@/lib/diagnostic/papers'
import { paperOpen } from '@/lib/diagnostic/access'
import { answerKey, onlineMarks, parsePaperAnswers } from '@/lib/diagnostic/online'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Hands in a paper sat on screen: POST { answers: [{ id, a }] }. Returns the
 * answer key with every automatic answer marked. A paper with no written
 * questions is fully marked here and saved; one with written questions is
 * saved once their marks are given (POST …/marks with the same answers).
 */
export async function POST(req: NextRequest, { params }: { params: { paperId: string } }) {
  const loaded = await loadPaper(params.paperId)
  if (!loaded.ok) return NextResponse.json({ error: loaded.status === 401 ? 'Sign in to hand in' : 'Paper not found' }, { status: loaded.status })
  const { paper } = loaded
  if (!paperOpen({ id: paper.id, year: paper.year }, await getAccess())) {
    return NextResponse.json({ error: 'This paper has not been purchased' }, { status: 402 })
  }
  let body: { answers?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Malformed request' }, { status: 400 })
  }
  const answers = parsePaperAnswers(paper.exam, body.answers)
  if (!answers) return NextResponse.json({ error: 'An answer does not match this paper' }, { status: 400 })

  const key = answerKey(paper.exam, answers)
  let saved = false
  let saveError: string | undefined
  if (!key.some(k => k.written)) {
    const marks = onlineMarks(paper.exam, answers, new Map())
    const outcome = marks ? await savePaperMarks(paper.id, marks, Array.from(answers, ([id, a]) => ({ id, a }))) : null
    saved = Boolean(outcome?.ok)
    if (outcome && !outcome.ok) saveError = outcome.error
  }
  return NextResponse.json({ key, saved, ...(saveError ? { saveError } : {}) })
}
