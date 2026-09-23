import type { Metadata } from 'next'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { accessReason, getAccess } from '@/lib/auth/access'
import { resolveExam, isSplitEligible } from '@/lib/pdf/resolveExam'
import { summarisePaper } from '@/lib/catalogue'
import { lockPropsFor } from '@/lib/exams/lockProps'
import { isVceYear, VCE_PAPER_PRICE } from '@/lib/pricing'
import PremiumExamLock from '@/components/practice/PremiumExamLock'
import PurchaseBanner from '@/components/practice/PurchaseBanner'
import ExamDownload from '@/components/practice/ExamDownload'

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const exam = PRACTICE_EXAMS.find(e => e.id === params.id)
  if (!exam) return { title: 'Exam not found — PrepNest' }
  const summary = summarisePaper(exam)
  const offer = !exam.premium
    ? 'Free to download.'
    : isVceYear(exam.yearLevel)
      ? `${VCE_PAPER_PRICE}, yours to keep.`
      : 'Included with a PrepNest plan.'
  return {
    title: `${exam.title} — PrepNest`,
    description: `A printable ${summary.questions}-question practice paper with a separate answer key. ${offer}`,
  }
}

export default async function ExamPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { purchased?: string }
}) {
  const exam = PRACTICE_EXAMS.find(e => e.id === params.id)

  if (!exam) {
    return (
      <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
        <h1 className="text-2xl font-medium tracking-tight mb-2">Exam not found</h1>
        <p className="text-gray-500">This practice exam doesn&apos;t exist or has been removed.</p>
      </main>
    )
  }

  // What this page renders. The PDF routes re-check access independently.
  const access = await getAccess()
  const reason = accessReason(exam, access)
  // Stripe's success_url for a VCE paper lands here. Only a signed-in visitor
  // can have paid, so anyone else who typed the parameter sees nothing.
  const justBought = access.signedIn && searchParams?.purchased === '1' && exam.premium

  if (reason) {
    const resolved = resolveExam(exam.id)
    return (
      <>
        {justBought && (
          <div className="max-w-md mx-auto px-4 pt-8 w-full">
            <PurchaseBanner kind="paper" settled />
          </div>
        )}
        <ExamDownload
          examId={exam.id}
          title={exam.title}
          splitEligible={resolved ? isSplitEligible(resolved) : false}
          access={reason}
          summary={summarisePaper(exam)}
          yearLevel={exam.yearLevel}
          onScreen={exam.subject === 'reading'}
        />
      </>
    )
  }

  return (
    <>
      {justBought && (
        <div className="max-w-md mx-auto px-4 pt-8 w-full">
          <PurchaseBanner kind="paper" settled={false} />
        </div>
      )}
      <PremiumExamLock {...lockPropsFor(exam)} />
    </>
  )
}
