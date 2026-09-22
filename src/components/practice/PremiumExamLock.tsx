import Link from 'next/link'
import type { Route } from 'next'
import { BUNDLE_PRICE } from '@/lib/pricing'
import type { PaperSummary } from '@/lib/catalogue'
import type { YearLevel } from '@/types'
import BuyBundleButton from './BuyBundleButton'
import PaperFacts from './PaperFacts'

/**
 * The screen between a visitor and a paid paper.
 *
 * It answers the three questions in the order a parent asks them: what is in
 * this paper, what does the $29 actually cover, and can I try one first. The
 * free sample link matters most — it is the difference between "pay to find
 * out" and "you have already seen what you are buying".
 *
 * Deliberately makes no promise about papers added later. The entitlement
 * would cover them as built, but "future papers included" is a commercial
 * commitment for the owner to make, not a line of UI copy.
 */
export default function PremiumExamLock({
  title,
  yearLevel,
  yearLabel,
  summary,
  sellable,
  bundle,
  freeSample,
  backHref,
}: {
  title: string
  yearLevel: YearLevel
  yearLabel: string
  summary?: PaperSummary
  sellable: boolean
  /** What one purchase unlocks at this year level. */
  bundle: { papers: number; subjects: string[] }
  /** The free paper in the same subject and year, when there is one. */
  freeSample?: { id: string; title: string; subjectLabel: string }
  backHref?: Route
}) {
  return (
    <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
      <div className="text-3xl mb-3" aria-hidden>
        🔒
      </div>
      <h1 className="text-2xl font-medium tracking-tight mb-2">{title}</h1>
      <p className="text-gray-500 mb-6">
        Part of the {yearLabel} bundle — {bundle.papers} papers across {bundle.subjects.join(', ')}, each with a
        printable exam and a separate answer key, for {BUNDLE_PRICE} once.
      </p>

      {summary && <PaperFacts summary={summary} />}

      <BuyBundleButton yearLevel={yearLevel} yearLabel={yearLabel} sellable={sellable} className="mb-3" />

      {freeSample && (
        <Link
          href={`/practice/exams/${freeSample.id}` as Route}
          className="btn-secondary w-full block text-center mb-3"
        >
          Try the free {yearLabel} {freeSample.subjectLabel} paper first
        </Link>
      )}

      <p className="text-xs text-gray-400 mb-6">
        One payment — no subscription.{' '}
        <Link href={'/pricing' as Route} className="underline hover:text-gray-600">
          How pricing works
        </Link>
      </p>

      {backHref && (
        <Link href={backHref} className="text-sm text-gray-400 hover:text-gray-600 underline">
          Back to exam papers
        </Link>
      )}
    </main>
  )
}
