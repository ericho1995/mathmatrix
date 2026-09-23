import Link from 'next/link'
import type { Route } from 'next'
import type { PaperSummary } from '@/lib/catalogue'
import type { AccessReason } from '@/lib/auth/access'
import type { YearLevel } from '@/types'
import PaperFacts from './PaperFacts'

export default function ExamDownload({
  examId,
  title,
  splitEligible,
  access,
  summary,
  yearLevel,
  onScreen,
}: {
  examId: string
  title: string
  splitEligible?: boolean
  /** Reading papers can also be sat on screen, NAPLAN Online style. */
  onScreen?: boolean
  /** Why this visitor may download — changes only the note under the title. */
  access: AccessReason
  summary?: PaperSummary
  yearLevel?: YearLevel
}) {
  const note = {
    admin: 'Admin access — no payment required. Regular visitors see the paywall here.',
    free: 'This is the free sample paper for this year level.',
    plan: 'Included in your plan.',
    paper: 'You own this paper.',
    purchased: 'You have full access to this year level.',
  }[access]
  const yearHref = (yearLevel ? `/practice/exams?year=${yearLevel}` : '/practice/exams') as Route

  return (
    <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
      <div className="text-3xl mb-3" aria-hidden>
        {access === 'admin' ? '🛠️' : '📄'}
      </div>
      <h1 className="text-2xl font-medium tracking-tight mb-2">{title}</h1>
      <p className="text-sm text-gray-400 mb-6">{note}</p>

      {summary && <PaperFacts summary={summary} />}

      {onScreen && (
        <div className="card text-left mb-6 border-brand-100 bg-brand-50/40">
          <p className="font-medium text-sm mb-1">Prefer a screen?</p>
          <p className="text-sm text-gray-600 mb-3">
            NAPLAN Reading is sat online. Read each text and answer its questions side by side, then see every answer
            explained.
          </p>
          <Link href={`/practice/reading/${examId}` as Route} className="btn-primary w-full block text-center">
            Read it on screen
          </Link>
        </div>
      )}

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
      ) : summary?.magazine ? (
        // A Reading paper is two booklets, as the real test is: the magazine
        // of texts and the question paper that points into it.
        <>
          <a href={`/api/exams/${examId}/magazine`} className="btn-primary w-full mb-3 block text-center">
            Download reading magazine (PDF)
          </a>
          <a href={`/api/exams/${examId}/pdf`} className="btn-primary w-full mb-3 block text-center">
            Download question paper (PDF)
          </a>
          <a href={`/api/exams/${examId}/answers`} className="btn-secondary w-full mb-3 block text-center">
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

      {/* How the product is meant to be used, said once, where the paper is.
          The answer key is a separate file on purpose — this is why. */}
      <div className="card text-left mt-6 mb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Getting the most from it</p>
        <ol className="text-sm text-gray-600 flex flex-col gap-2 list-decimal list-inside">
          <li>
            {summary?.magazine
              ? 'Print the magazine and the question paper. Keep the answer key somewhere else.'
              : 'Print the exam paper. Keep the answer key somewhere else.'}
          </li>
          <li>Sit it in one go, timed, without notes — the way the real test runs.</li>
          <li>Mark it together afterwards using the answer key.</li>
          <li>Enter the marks below to see which topics to practice next.</li>
        </ol>
      </div>

      {/* The step that used to be missing: a sat paper had nowhere to go once it
          was marked. This turns the answer key into a diagnosis and a next step. */}
      <div className="border-t border-gray-100 pt-6">
        <p className="text-sm text-gray-500 mb-3">Already sat this paper?</p>
        <Link href={`/practice/exams/${examId}/mark` as Route} className="btn-secondary w-full mb-6 block text-center">
          Enter results
        </Link>
      </div>

      {access === 'free' && (
        <p className="text-sm text-gray-500 mb-6">
          Found it useful?{' '}
          <Link href={yearHref} className="text-brand-600 underline">
            See the rest of this year level
          </Link>
        </p>
      )}

      <Link href={yearHref} className="text-sm text-gray-400 hover:text-gray-600 underline">
        Back to exam papers
      </Link>
    </main>
  )
}
