import Link from 'next/link'

export default function AdminExamDownload({ examId, title, splitEligible }: { examId: string; title: string; splitEligible?: boolean }) {
  return (
    <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
      <div className="text-3xl mb-3">🛠️</div>
      <h1 className="text-2xl font-medium tracking-tight mb-2">{title}</h1>
      <p className="text-sm text-gray-400 mb-8">
        Admin access — no payment required. Regular visitors see the paywall here.
      </p>
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
      <Link href="/practice/exams" className="text-sm text-gray-400 hover:text-gray-600 underline">
        Back to exams
      </Link>
    </main>
  )
}
