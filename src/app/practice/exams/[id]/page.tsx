import type { Metadata } from 'next'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { getUserRole } from '@/lib/auth/getUserRole'
import { hasEntitlement } from '@/lib/auth/getEntitlements'
import { resolveExam, isSplitEligible } from '@/lib/pdf/resolveExam'
import { summarisePaper } from '@/lib/catalogue'
import { lockPropsFor } from '@/lib/exams/lockProps'
import PremiumExamLock from '@/components/practice/PremiumExamLock'
import ExamDownload from '@/components/practice/ExamDownload'

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const exam = PRACTICE_EXAMS.find(e => e.id === params.id)
  if (!exam) return { title: 'Exam not found — PrepNest' }
  const summary = summarisePaper(exam)
  return {
    title: `${exam.title} — PrepNest`,
    description: `A printable ${summary.questions}-question practice paper with a separate answer key. ${
      exam.premium ? 'Part of the year-level bundle.' : 'Free to download.'
    }`,
  }
}

export default async function ExamPage({ params }: { params: { id: string } }) {
  const exam = PRACTICE_EXAMS.find(e => e.id === params.id)

  if (!exam) {
    return (
      <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
        <h1 className="text-2xl font-medium tracking-tight mb-2">Exam not found</h1>
        <p className="text-gray-500">This practice exam doesn&apos;t exist or has been removed.</p>
      </main>
    )
  }

  // Three ways to reach the download: the paper is the free sample, the visitor
  // bought this year level, or they are an admin. The PDF routes re-check this
  // independently — this page only decides what to render.
  const access = !exam.premium
    ? ('free' as const)
    : (await getUserRole()) === 'admin'
      ? ('admin' as const)
      : (await hasEntitlement(exam.yearLevel))
        ? ('purchased' as const)
        : null

  if (access) {
    const resolved = resolveExam(exam.id)
    return (
      <ExamDownload
        examId={exam.id}
        title={exam.title}
        splitEligible={resolved ? isSplitEligible(resolved) : false}
        access={access}
        summary={summarisePaper(exam)}
        yearLevel={exam.yearLevel}
      />
    )
  }

  return <PremiumExamLock {...lockPropsFor(exam)} />
}
