'use client'

import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { SUBJECTS, SELECTIVE_SUBJECTS } from '@/lib/curriculum'
import PremiumExamLock from '@/components/practice/PremiumExamLock'

export default function ExamPage({ params }: { params: { id: string } }) {
  const exam = PRACTICE_EXAMS.find(e => e.id === params.id)

  if (!exam) {
    return (
      <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
        <h1 className="text-2xl font-medium tracking-tight mb-2">Exam not found</h1>
        <p className="text-gray-500">This practice exam doesn&apos;t exist or has been removed.</p>
      </main>
    )
  }

  const subject = [...SUBJECTS, ...SELECTIVE_SUBJECTS].find(s => s.slug === exam.subject)
  return <PremiumExamLock title={exam.title} subjectLabel={subject?.label ?? 'exam'} />
}
