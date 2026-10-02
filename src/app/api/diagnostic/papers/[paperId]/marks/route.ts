import { NextRequest, NextResponse } from 'next/server'
import { getAccess } from '@/lib/auth/access'
import { loadPaper, savePaperMarks } from '@/lib/diagnostic/papers'
import { paperOpen } from '@/lib/diagnostic/access'
import { marksFromWrong } from '@/lib/diagnostic/marking'
import { onlineMarks, parsePaperAnswers } from '@/lib/diagnostic/online'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Records a paper's marks, either way it was sat:
 *   on paper   POST { wrong: [{ s, n }] }                          the positions marked wrong
 *   on screen  POST { answers: [{ id, a }], written: [{ id, m }] } the marks given to written questions
 */
export async function POST(req: NextRequest, { params }: { params: { paperId: string } }) {
  const loaded = await loadPaper(params.paperId)
  if (!loaded.ok) return NextResponse.json({ error: loaded.status === 401 ? 'Sign in to save' : 'Paper not found' }, { status: loaded.status })
  const { paper } = loaded
  if (!paperOpen({ id: paper.id, year: paper.year }, await getAccess())) {
    return NextResponse.json({ error: 'This paper has not been purchased' }, { status: 402 })
  }
  let body: { wrong?: unknown; answers?: unknown; written?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Malformed request' }, { status: 400 })
  }

  if (Array.isArray(body.wrong)) {
    const raw = body.wrong
    if (raw.length > 200 || raw.some(w => typeof w?.s !== 'number' || typeof w?.n !== 'number')) {
      return NextResponse.json({ error: 'Expected a list of marks' }, { status: 400 })
    }
    const marks = marksFromWrong(paper.exam, raw as { s: number; n: number }[])
    if (!marks) return NextResponse.json({ error: 'A mark does not match a question on this paper' }, { status: 400 })
    const saved = await savePaperMarks(paper.id, marks)
    if (!saved.ok) return NextResponse.json({ error: saved.error }, { status: saved.status })
    return NextResponse.json({ saved: true })
  }

  const answers = parsePaperAnswers(paper.exam, body.answers)
  const written = Array.isArray(body.written) ? body.written : null
  if (!answers || !written || written.length > 50 || written.some(w => typeof w?.id !== 'string' || typeof w?.m !== 'number')) {
    return NextResponse.json({ error: 'Expected the answers and the written marks' }, { status: 400 })
  }
  const marks = onlineMarks(paper.exam, answers, new Map((written as { id: string; m: number }[]).map(w => [w.id, w.m])))
  if (!marks) return NextResponse.json({ error: 'Every written question needs a mark' }, { status: 400 })
  const saved = await savePaperMarks(paper.id, marks, Array.from(answers, ([id, a]) => ({ id, a })))
  if (!saved.ok) return NextResponse.json({ error: saved.error }, { status: saved.status })
  return NextResponse.json({ saved: true })
}
