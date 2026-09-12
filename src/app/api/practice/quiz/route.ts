import { NextRequest, NextResponse } from 'next/server'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { TOPICS, GRADES } from '@/lib/curriculum'
import type { TopicSlug, YearLevel } from '@/types'

export const runtime = 'nodejs'

// The free practice quiz needs real question content in the browser — it marks
// answers and shows explanations client-side. What it must NOT do is hand over
// the whole bank, which is what importing QUESTION_BANK into a client component
// did. This route returns only the handful of questions for one quiz.
//
// The limits below are the security boundary, not UI convenience: without them
// this endpoint is simply a more convenient way to dump the bank than reading it
// out of the JS bundle.
const MAX_QUESTIONS = 20
const MAX_TOPICS = 12

const VALID_TOPICS = new Set<string>(TOPICS.map(t => t.slug))
const VALID_YEAR_LEVELS = new Set<string>(GRADES.map(g => g.value))

/** Only the fields QuizRunner renders. Notably drops curriculum_code, difficulty
 * and diagram — the client has no use for them. */
function toQuizQuestion(q: (typeof QUESTION_BANK)[number]) {
  return {
    id: q.id,
    question_text: q.question_text,
    explanation: q.explanation,
    format: q.format,
    options: 'options' in q ? q.options : undefined,
    correct_index: 'correct_index' in q ? q.correct_index : undefined,
    expected_answer: 'expected_answer' in q ? q.expected_answer : undefined,
    accepted_answers: 'accepted_answers' in q ? q.accepted_answers : undefined,
  }
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { topics, yearLevel, count } = (body ?? {}) as {
    topics?: unknown
    yearLevel?: unknown
    count?: unknown
  }

  if (!Array.isArray(topics) || topics.length === 0) {
    return NextResponse.json({ error: 'topics must be a non-empty array' }, { status: 400 })
  }

  const requestedTopics = topics
    .filter((t): t is TopicSlug => typeof t === 'string' && VALID_TOPICS.has(t))
    .slice(0, MAX_TOPICS)

  if (requestedTopics.length === 0) {
    return NextResponse.json({ error: 'No valid topics supplied' }, { status: 400 })
  }

  // A year level is optional (selective subjects span Year 11 only), but if one
  // is given it has to be real.
  let year: YearLevel | null = null
  if (yearLevel !== null && yearLevel !== undefined) {
    if (typeof yearLevel !== 'string' || !VALID_YEAR_LEVELS.has(yearLevel)) {
      return NextResponse.json({ error: 'Invalid yearLevel' }, { status: 400 })
    }
    year = yearLevel as YearLevel
  }

  const requestedCount = typeof count === 'number' && Number.isFinite(count) ? Math.floor(count) : 10
  const limit = Math.min(Math.max(requestedCount, 1), MAX_QUESTIONS)

  const topicSet = new Set(requestedTopics)
  const pool = QUESTION_BANK.filter(
    q => topicSet.has(q.topic) && (year === null || q.year_level === year)
  )

  // Fisher-Yates rather than sort(() => Math.random() - 0.5), which is biased.
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return NextResponse.json(
    { questions: shuffled.slice(0, limit).map(toQuizQuestion) },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
