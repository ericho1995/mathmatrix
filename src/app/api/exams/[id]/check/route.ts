import { NextRequest, NextResponse } from 'next/server'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { getAccess } from '@/lib/auth/access'
import { paperDownload } from '@/lib/pdf/paperDownload'
import { answerKeyFor, idsOf, numberedCatalogue, parseAnswersFor } from '@/lib/exams/onScreen'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Hands in a catalogue paper sat on screen: POST { answers: [{ id, a }] }.
 * Returns the answer key with every automatic answer marked. Nothing is saved
 * here — the page then records the result through …/result, the same route as
 * marking a printed paper.
 *
 * Open to whoever may download the whole paper: the key it returns is the one
 * in that paper's answer key PDF.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const exam = PRACTICE_EXAMS.find(e => e.id === params.id)
  if (!exam) return NextResponse.json({ error: 'Unknown exam' }, { status: 404 })
  if (paperDownload(exam, await getAccess())?.mode !== 'full') {
    return NextResponse.json({ error: 'This paper is not open to you' }, { status: 402 })
  }
  const sections = numberedCatalogue(exam)
  if (!sections) return NextResponse.json({ error: 'This paper has no questions' }, { status: 400 })

  let body: { answers?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Malformed request' }, { status: 400 })
  }
  const answers = parseAnswersFor(idsOf(sections), body.answers)
  if (!answers) return NextResponse.json({ error: 'An answer does not match this paper' }, { status: 400 })
  return NextResponse.json({ key: answerKeyFor(sections, answers) })
}
