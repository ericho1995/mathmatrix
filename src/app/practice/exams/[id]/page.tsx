'use client'

import { useRouter } from 'next/navigation'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { SELECTIVE_SUBJECTS } from '@/lib/curriculum'
import { PREMIUM_PRICE } from '@/lib/pricing'
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

  if (exam.premium) {
    const subject = SELECTIVE_SUBJECTS.find(s => s.slug === exam.subject)
    return (
      <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
        <div className="text-3xl mb-3">🔒</div>
        <h1 className="text-2xl font-medium tracking-tight mb-2">{exam.title}</h1>
        <p className="text-gray-500 mb-1">
          This is a premium {subject?.label ?? 'selective subject'} exam paper — {PREMIUM_PRICE}.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Payments aren&apos;t live yet, so premium papers can&apos;t be purchased right now.
        </p>
        <button disabled className="btn-primary w-full mb-3 opacity-50 cursor-not-allowed">
          Unlock for {PREMIUM_PRICE} — coming soon
        </button>
        <button onClick={() => router.push('/practice/exams')} className="btn-secondary w-full">
          Back to exams
        </button>
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
