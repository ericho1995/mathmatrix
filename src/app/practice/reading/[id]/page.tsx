import type { Metadata, Route } from 'next'
import { notFound, redirect } from 'next/navigation'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { MAGAZINES } from '@/lib/questions/magazines'
import { resolveExam, firstQuestionNumbers, type ResolvedQuestion } from '@/lib/pdf/resolveExam'
import { getAccess } from '@/lib/auth/access'
import { paperDownload } from '@/lib/pdf/paperDownload'
import { lockPropsFor } from '@/lib/exams/lockProps'
import { paperMinutes } from '@/lib/exams/paperTime'
import PremiumExamLock from '@/components/practice/PremiumExamLock'
import ReadingRunner, { type RunnerPart, type RunnerQuestion } from '@/components/reading/ReadingRunner'
import type { ReadingText } from '@/types/reading'
import type { Stimulus } from '@/types'

function readingExam(id: string) {
  const exam = PRACTICE_EXAMS.find(e => e.id === id)
  return exam && exam.subject === 'reading' ? exam : undefined
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const exam = readingExam(params.id)
  if (!exam) return { title: 'Paper not found — PrepNest' }
  return {
    title: `${exam.title} on screen — PrepNest`,
    description: 'Read each text and answer its questions on screen, the way NAPLAN Online works, with every answer explained when you finish.',
  }
}

/** A plain passage from stimuli.ts, as paragraphs the reader can lay out. */
function passageAsText(s: Stimulus): ReadingText {
  return {
    id: s.id,
    page: 0,
    title: s.title,
    type: 'report',
    blocks: s.body.split(/\n\s*\n/).map(t => ({ kind: 'para' as const, text: t.trim() })).filter(b => b.text),
  }
}

function toRunnerQuestion(q: ResolvedQuestion, n: number): RunnerQuestion {
  const base = { id: q.id, n, text: q.question_text, explanation: q.explanation }
  if (q.format === 'short_answer') return { ...base, answer: q.expected_answer, accepted: q.accepted_answers }
  return { ...base, options: q.options ?? [], correct: q.correct_index ?? 0 }
}

/**
 * Any Reading paper, on screen. Gated exactly like its PDFs: the free sample is
 * open to everyone, the rest to a plan or purchase that covers it.
 */
export default async function ReadingOnScreenPage({ params }: { params: { id: string } }) {
  const exam = readingExam(params.id)
  const resolved = exam ? resolveExam(exam.id) : null
  if (!exam || !resolved) notFound()

  // On screen, the whole paper is shown, so only a visitor who may download
  // the whole paper gets it; a preview-only visitor goes to the paper page.
  const access = await getAccess()
  const download = paperDownload(exam, access)
  if (download?.mode === 'preview') redirect(`/practice/exams/${exam.id}` as Route)
  if (!download) return <PremiumExamLock {...lockPropsFor(exam)} />

  const magazine = exam.magazine_id ? MAGAZINES.find(m => m.id === exam.magazine_id) : undefined
  const starts = firstQuestionNumbers(resolved.sections)
  const parts: RunnerPart[] = resolved.sections.map((s, i) => {
    const first = s.questions[0]
    const magazineText = magazine && first?.stimulus_id ? magazine.texts.find(t => t.id === first.stimulus_id) : undefined
    const passage = !magazine ? first?.stimulus : undefined
    const text = magazineText ?? (passage ? passageAsText(passage) : undefined)
    return {
      section: i,
      title: magazineText?.title ?? passage?.title ?? s.section.title,
      text,
      questions: s.questions.map((q, qi) => toRunnerQuestion(q, starts[i] + qi + 1)),
    }
  })

  return <ReadingRunner examId={exam.id} title={exam.title} minutes={paperMinutes(exam)} parts={parts} signedIn={access.signedIn} />
}
