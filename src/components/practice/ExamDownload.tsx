import Link from 'next/link'
import type { Route } from 'next'

export default function ExamDownload({
  examId,
  title,
  splitEligible,
  access,
}: {
  examId: string
  title: string
  splitEligible?: boolean
  /** Why this visitor may download — changes only the note under the title. */
  access: 'free' | 'purchased' | 'admin'
}) {
  const note =
    access === 'admin'
      ? 'Admin access — no payment required. Regular visitors see the paywall here.'
      : access === 'free'
        ? 'This is the free sample paper for this year level.'
        : 'You have full access to this year level.'
  return (
    <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
      <div className="text-3xl mb-3">{access === 'admin' ? '🛠️' : '📄'}</div>
      <h1 className="text-2xl font-medium tracking-tight mb-2">{title}</h1>
      <p className="text-sm text-gray-400 mb-8">{note}</p>
      {splitEligible ? (
        <>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">Numeracy — non-calculator</p>
          <a href={`/api/exams/${examId}/pdf?session=non-calculator`} className="btn-primary w-full mb-3 block text-center">
            Download exam paper (PDF)
          </a>
          <a href={`/api/exams/${examId}/answers?session=non-calculator`} className="btn-secondary w-full mb-6 block text-center">
            Download answer key (PDF)
          </a>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">Numeracy — calculator</p>
          <a href={`/api/exams/${examId}/pdf?session=calculator`} className="btn-primary w-full mb-3 block text-center">
            Download exam paper (PDF)
          </a>
          <a href={`/api/exams/${examId}/answers?session=calculator`} className="btn-secondary w-full mb-3 block text-center">
            Download answer key (PDF)
          </a>
        </>
      ) : (
        <>
          <a href={`/api/exams/${examId}/pdf`} className="btn-primary w-full mb-3 block text-center">
            Download exam paper (PDF)
          </a>
          <a href={`/api/exams/${examId}/answers`} className="btn-secondary w-full mb-3 block text-center">
            Download answer key (PDF)
          </a>
        </>
      )}
      {/* The step that used to be missing: a sat paper had nowhere to go once it
          was marked. This turns the answer key into a diagnosis and a next step. */}
      <div className="border-t border-gray-100 pt-6 mt-3">
        <p className="text-sm text-gray-500 mb-3">Already sat this paper?</p>
        <Link href={`/practice/exams/${examId}/mark` as Route} className="btn-secondary w-full mb-6 block text-center">
          Enter results
        </Link>
      </div>
      <Link href="/practice/exams" className="text-sm text-gray-400 hover:text-gray-600 underline">
        Back to exams
      </Link>
    </main>
  )
}
