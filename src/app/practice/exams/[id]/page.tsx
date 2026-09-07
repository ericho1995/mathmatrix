'use client'

import { useRouter } from 'next/navigation'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { QUESTION_BANK } from '@/lib/questions/bank'
import QuizRunner from '@/components/practice/QuizRunner'

export default function ExamPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const exam = PRACTICE_EXAMS.find(e => e.id === params.id)

  if (!exam) {
    return (
      <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
        <h1 className="text-2xl font-medium tracking-tight mb-2">Exam not found</h1>
        <p className="text-gray-500">This practice exam doesn&apos;t exist or has been removed.</p>
      </main>
    )
  }

  const questions = exam.questionIds
    .map(id => QUESTION_BANK.find(q => q.id === id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))

  return (
    <QuizRunner
      key={exam.id}
      questions={questions}
      primaryTopic={questions[0]?.topic}
      primaryYearLevel={exam.yearLevel}
      onExit={() => router.push('/practice/exams')}
    />
  )
}
