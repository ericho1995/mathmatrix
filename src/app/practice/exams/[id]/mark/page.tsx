import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { SUBJECTS, SELECTIVE_SUBJECTS } from '@/lib/curriculum'
import { getUserRole } from '@/lib/auth/getUserRole'
import { hasEntitlement } from '@/lib/auth/getEntitlements'
import { paperQuestionMap } from '@/lib/exams/paperQuestions'
import PremiumExamLock from '@/components/practice/PremiumExamLock'
import PaperMarking from '@/components/practice/PaperMarking'

/**
 * Entering the results of a paper that was sat away from the screen.
 *
 * Gated exactly like the download it follows: if you could not get the paper,
 * you did not sit it. Free sample papers are therefore markable with no account
 * at all, which is the point — a visitor who took the free paper gets the
 * diagnosis without signing up, and signing up is what keeps it.
 */
export default async function MarkPaperPage({ params }: { params: { id: string } }) {
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

  const allowed =
    !exam.premium ||
    (await getUserRole()) === 'admin' ||
    (await hasEntitlement(exam.yearLevel))

  if (!allowed) {
    return (
      <PremiumExamLock
        title={exam.title}
        subjectLabel={subject?.label ?? 'exam'}
        yearLevel={exam.yearLevel}
        backHref="/practice/exams"
      />
    )
  }

  const sections = paperQuestionMap(exam.id)
  if (!sections?.length) {
    return (
      <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
        <h1 className="text-2xl font-medium tracking-tight mb-2">Nothing to mark</h1>
        <p className="text-gray-500">This paper has no questions to score.</p>
      </main>
    )
  }

  return (
    <PaperMarking
      sections={sections}
      examId={exam.id}
      subject={exam.subject}
      yearLevel={exam.yearLevel}
      examTitle={exam.title}
      backHref={`/practice/exams/${exam.id}`}
    />
  )
}
