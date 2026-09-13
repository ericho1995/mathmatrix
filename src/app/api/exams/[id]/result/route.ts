import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/logError'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { paperQuestionMapWithIds } from '@/lib/exams/paperQuestions'
import type { TopicSlug } from '@/types'

export const runtime = 'nodejs'

/**
 * Records the marks from a paper sat away from the screen.
 *
 * The client posts only the positions it marked wrong — never question ids and
 * never answers. The server maps positions back to questions itself, which
 * keeps the marking screen's payload minimal and means a hand-edited request
 * cannot invent an attempt against a question that is not on this paper.
 *
 * Writes the same shape an on-screen quiz writes, so the parent dashboard's
 * per-topic accuracy picks it up with no further work.
 */

/** Marked-wrong position: section index and the question number printed on it. */
interface WrongMark {
  s: number
  n: number
}

// A self-reported result awards no XP. The marks come from whoever typed them,
// so paying points for them would put the leaderboard one honest mistake — or
// one bored teenager — away from being meaningless. The value here is the
// diagnosis and the parent's record of it, not the score.
const XP_FOR_SELF_REPORTED = 0

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const exam = PRACTICE_EXAMS.find(e => e.id === params.id)
  if (!exam) return NextResponse.json({ error: 'Unknown exam' }, { status: 404 })

  let body: { wrong?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Malformed request' }, { status: 400 })
  }

  const wrongRaw = Array.isArray(body.wrong) ? body.wrong : null
  if (!wrongRaw) return NextResponse.json({ error: 'Expected a list of marks' }, { status: 400 })

  const wrong = new Set<string>()
  for (const mark of wrongRaw as WrongMark[]) {
    if (typeof mark?.s !== 'number' || typeof mark?.n !== 'number') {
      return NextResponse.json({ error: 'Expected a list of marks' }, { status: 400 })
    }
    wrong.add(`${mark.s}:${mark.n}`)
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // 401 rather than an error page: the marking screen uses this to offer signing
  // in, having already shown the diagnosis, which never needed an account.
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const sections = paperQuestionMapWithIds(exam.id)
  if (!sections?.length) return NextResponse.json({ error: 'This paper has no questions' }, { status: 400 })

  const attempts: { question_id: string; is_correct: boolean; topic: TopicSlug }[] = []
  sections.forEach((section, s) => {
    for (const q of section.questions) {
      attempts.push({ question_id: q.id, is_correct: !wrong.has(`${s}:${q.n}`), topic: q.topic })
    }
  })

  const correctCount = attempts.filter(a => a.is_correct).length

  // practice_sessions carries one topic and a paper spans several, so the tag is
  // the topic with the most questions. It is only a label: the dashboard reads
  // accuracy from the individual attempts below, not from this.
  const counts = new Map<TopicSlug, number>()
  for (const a of attempts) counts.set(a.topic, (counts.get(a.topic) ?? 0) + 1)
  const dominantTopic = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0]

  const { data: session, error: sessionError } = await supabase
    .from('practice_sessions')
    .insert({
      student_id: user.id,
      topic: dominantTopic,
      year_level: exam.yearLevel,
      mode: 'paper',
      completed_at: new Date().toISOString(),
      total_questions: attempts.length,
      correct_count: correctCount,
      xp_earned: XP_FOR_SELF_REPORTED,
    })
    .select('id')
    .single()

  if (queryFailed('paperResult.createSession', sessionError, { userId: user.id, examId: exam.id }) || !session) {
    return NextResponse.json({ error: 'Could not save this result' }, { status: 500 })
  }

  const { error: attemptsError } = await supabase.from('question_attempts').insert(
    attempts.map(a => ({
      session_id: session.id,
      question_id: a.question_id,
      selected_index: -1, // not applicable: the paper was marked, not answered here
      is_correct: a.is_correct,
      time_taken_seconds: 0,
    }))
  )

  if (queryFailed('paperResult.saveAttempts', attemptsError, { sessionId: session.id, examId: exam.id })) {
    return NextResponse.json({ error: 'Could not save this result' }, { status: 500 })
  }

  return NextResponse.json({ saved: true, correct: correctCount, total: attempts.length })
}
