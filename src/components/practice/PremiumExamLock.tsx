import Link from 'next/link'
import type { Route } from 'next'
import { FROM_PER_MONTH, VCE_PAPER_PRICE } from '@/lib/pricing'
import type { PaperSummary } from '@/lib/catalogue'
import CheckoutButton from './CheckoutButton'
import PaperFacts from './PaperFacts'
import { Lock } from 'lucide-react'

/**
 * The screen between a visitor and a paid paper.
 *
 * It answers the three questions in the order a parent asks them: what is in
 * this paper, what does paying actually get me, and can I try one first. The
 * free sample link matters most — it is the difference between "pay to find
 * out" and "you have already seen what you are buying".
 *
 * Grade 3 – Year 10 papers come with a plan, so this points at the plan
 * choice. VCE papers are sold one at a time, so this is the checkout.
 */
export default function PremiumExamLock({
  examId,
  title,
  pairedWith,
  yearLabel,
  summary,
  vce,
  sellable,
  plan,
  freeSample,
  backHref,
  preview,
}: {
  examId: string
  title: string
  /** The other exam of a two-paper VCE set, which this purchase also covers. */
  pairedWith?: string
  yearLabel: string
  summary?: PaperSummary
  vce: boolean
  sellable: boolean
  /** What a plan unlocks, for the non-VCE message. */
  plan: { range: string; papers: number }
  /** The free paper in the same subject and year, when there is one. */
  freeSample?: { id: string; title: string; subjectLabel: string }
  backHref?: Route
  /**
   * Set when paid papers offer a free preview (lib/pdf/previewPolicy.ts). The
   * PDF routes serve the preview to this visitor on their own; this only
   * shows the buttons.
   */
  preview?: { shown: number; total: number; magazine?: boolean }
}) {
  return (
    <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
      <span
        aria-hidden
        className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 inline-flex items-center justify-center mb-4"
      >
        <Lock className="w-7 h-7" />
      </span>
      <h1 className="text-2xl font-medium tracking-tight mb-2">{title}</h1>
      <p className="text-gray-500 mb-6">
        {vce && pairedWith
          ? `Purchase this set for ${VCE_PAPER_PRICE} — this paper and ${pairedWith}, each printable with its full answer key, yours to keep.`
          : vce
          ? `Purchase this paper for ${VCE_PAPER_PRICE} — the printable exam and its full answer key, yours to keep.`
          : `Included with a PrepNest plan: every ${plan.range} paper (${plan.papers} today, more on the way), each with a printable answer key, from ${FROM_PER_MONTH} a month.`}
      </p>

      {summary && <PaperFacts summary={summary} />}

      {vce ? (
        <CheckoutButton
          purchase={{ examId }}
          label={pairedWith ? `Purchase both exams — ${VCE_PAPER_PRICE}` : `Purchase this paper — ${VCE_PAPER_PRICE}`}
          sellable={sellable}
          className="mb-3"
        />
      ) : sellable ? (
        <Link href={'/pricing' as Route} className="btn-primary w-full block text-center mb-3">
          See plans — from {FROM_PER_MONTH} a month
        </Link>
      ) : (
        <p className="text-xs text-gray-400 mb-3">Plans open soon. The free sample papers are available now.</p>
      )}

      {preview && (
        <div className="card text-left mb-3">
          <p className="font-medium text-sm mb-1">Try part of it first</p>
          <p className="text-sm text-gray-600 mb-3">
            Download the first {preview.shown} of the {preview.total} questions and their answers, free.
          </p>
          {preview.magazine && (
            <a href={`/api/exams/${examId}/magazine`} className="btn-secondary w-full mb-2 block text-center">
              Download magazine preview (PDF)
            </a>
          )}
          <a href={`/api/exams/${examId}/pdf`} className="btn-secondary w-full mb-2 block text-center">
            Download free preview (PDF)
          </a>
          <a href={`/api/exams/${examId}/answers`} className="text-sm text-brand-600 underline">
            Preview answers (PDF)
          </a>
        </div>
      )}

      {freeSample && (
        <Link
          href={`/practice/exams/${freeSample.id}` as Route}
          className="btn-secondary w-full block text-center mb-3"
        >
          Try the free {yearLabel} {freeSample.subjectLabel} paper first
        </Link>
      )}

      <p className="text-xs text-gray-400 mb-6">
        {vce ? 'One-off payment — no subscription.' : 'Cancel anytime.'}{' '}
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
