'use client'

import QuestionView from '@/components/diagnostic/QuestionView'
import type { ScreenQuestion } from '@/lib/web/questionHtml'

/** The real question screen with nothing chosen, for a still picture of it. */
export default function StaticQuestion({ question }: { question: ScreenQuestion }) {
  return <QuestionView question={question} answer={null} onAnswer={() => {}} />
}
