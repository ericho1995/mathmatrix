import Link from 'next/link'
import type { Route } from 'next'
import { CheckSquare, Download, FileText } from 'lucide-react'
import CheckoutButton from '@/components/practice/CheckoutButton'
import type { TailoredExam } from '@/lib/diagnostic/tailor'
import type { TailoredAccess } from '@/lib/diagnostic/access'
import { FROM_PER_MONTH, VCE_PAPER_PRICE } from '@/lib/pricing'
import { isVcePaperSellable } from '@/lib/stripe'

const LEVEL_WORD = { focus: 'to work on', developing: 'developing', strength: 'kept sharp' } as const

/**
 * The practice exam built from this result: what it concentrates on, and the
 * paper and answer key to download — whole for a plan holder or buyer, as a
 * preview otherwise, with the way to get the rest.
 */
export default function TailoredExamCard({ resultId, exam, access, name }: { resultId: string; exam: TailoredExam; access: TailoredAccess; name: string | null }) {
  const questions = exam.sections.reduce((n, s) => n + s.question_ids.length, 0)
  const full = access.mode === 'full'
  const base = `/api/diagnostic/${resultId}/exam`
  return (
    <section className="card p-6 sm:p-8 border-brand-200 bg-brand-50/60">
      <div className="flex items-start gap-3 mb-4">
        <FileText className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{name ? `${name}’s practice exam` : 'The practice exam built from this result'}</h2>
          <p className="text-sm text-gray-600">
            {questions} questions in {exam.sections.length} {exam.sections.length === 1 ? 'section' : 'sections'}, printable, with a
            separate answer key. None of them were in the test
            {exam.secondChance ? `, except a last “second chance” section of ${exam.secondChance} ${name ?? 'your child'} got wrong` : ''}.
          </p>
        </div>
      </div>
      <ul className="flex flex-wrap gap-2 mb-6">
        {exam.focus.map(f => (
          <li key={f.area} className="text-xs rounded-full bg-white border border-gray-200 px-3 py-1 text-gray-700">
            {f.label}: <strong className="font-medium">{f.questions}</strong> <span className="text-gray-400">({LEVEL_WORD[f.level]})</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3 print:hidden">
        <a href={`${base}?doc=paper`} className="btn-primary inline-flex items-center gap-2">
          <Download className="w-4 h-4" aria-hidden />
          {full ? 'Download the paper' : 'Download a preview'}
        </a>
        <a href={`${base}?doc=answers`} className="btn-secondary inline-flex items-center gap-2">
          <Download className="w-4 h-4" aria-hidden />
          {full ? 'Answer key' : 'Preview answers'}
        </a>
        {full && (
          <Link href={`/diagnostic/report/${resultId}/mark` as Route} className="btn-secondary inline-flex items-center gap-2">
            <CheckSquare className="w-4 h-4" aria-hidden />
            Mark it on screen
          </Link>
        )}
      </div>

      {!full && (
        <div className="mt-6 border-t border-gray-100 pt-5 print:hidden">
          {access.purchase === 'plan' ? (
            <>
              <p className="text-sm text-gray-700 mb-3">
                The full exam is included in the Grade 3 – Year 10 plan, from {FROM_PER_MONTH} a month, with every practice
                paper on the site.
              </p>
              <Link href="/pricing" className="btn-primary">
                See the plans
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700 mb-3">The full exam and its answer key are {VCE_PAPER_PRICE}, purchased once and kept.</p>
              <CheckoutButton purchase={{ tailoredId: resultId }} label={`Purchase the full exam — ${VCE_PAPER_PRICE}`} sellable={isVcePaperSellable()} />
            </>
          )}
        </div>
      )}
    </section>
  )
}
