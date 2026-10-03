import Link from 'next/link'
import type { Route } from 'next'
import { CheckSquare, Download, FileText, MonitorPlay } from 'lucide-react'
import CheckoutButton from '@/components/practice/CheckoutButton'
import GeneratePaperButton from './GeneratePaperButton'
import type { PaperRights } from '@/lib/diagnostic/access'
import type { FocusLine } from '@/lib/diagnostic/tailor'
import type { Level } from '@/lib/diagnostic/types'
import { FROM_PER_MONTH, VCE_PAPER_PRICE } from '@/lib/pricing'

const LEVEL_WORD: Record<Level, string> = { focus: 'to work on', developing: 'developing', strength: 'lowest area' }

export interface PaperSummary {
  id: string
  seq: number
  createdAt: string
  questions: number
  focus: FocusLine[]
  /** Whole paper available (plan, purchase or admin); a preview otherwise. */
  open: boolean
  marked: { got: number; of: number; at: string } | null
}

export interface WeakPapersProps {
  resultId: string
  name: string | null
  weak: { label: string; level: Level }[]
  /** The test found no weak area; papers use the lowest two. */
  fallback: boolean
  rights: PaperRights
  /** Plan holders: papers generated this month, and when the count resets. */
  allowance: { used: number; limit: number; resets: string } | null
  papers: PaperSummary[]
  /** False until the papers migration has run. */
  ready: boolean
  /** Whether VCE papers can be purchased (Stripe price configured). */
  sellable: boolean
  /** The paper just generated, to highlight. */
  fresh?: string
  /** The exam built with the report before papers existed, kept for those who marked or purchased it. */
  legacy?: { full: boolean } | null
}

const dateOf = (iso: string) => new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', timeZone: 'Australia/Melbourne' })

/**
 * Practice papers on the child's weak areas, generated one at a time on
 * request: the areas they cover, the button that makes the next one, the
 * month's allowance, and every paper made so far — to sit on screen, print,
 * or mark.
 */
export default function WeakPapersCard(p: WeakPapersProps) {
  const who = p.name ?? 'your child'
  const whose = p.name ? `${p.name}’s` : 'your child’s'
  const left = p.allowance ? Math.max(0, p.allowance.limit - p.allowance.used) : null
  const waiting = p.rights.kind === 'per_paper' ? p.papers.find(x => !x.open) : undefined

  return (
    <section className="card p-6 sm:p-8 border-brand-200 bg-brand-50/60" id="papers">
      <div className="flex items-start gap-3 mb-4">
        <FileText className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Practice papers on {whose} weak areas</h2>
          <p className="text-sm text-gray-600">
            Every question practices an area still to work on — nothing from {whose} strengths. Each paper is new: no question from the test or an
            earlier paper comes back, except a short “second chance” section of ones {who} got wrong. Sit it on screen, or print it with its answer key.
          </p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-2 mb-2">
        {p.weak.map(w => (
          <li key={w.label} className="text-xs rounded-full bg-white border border-gray-200 px-3 py-1 text-gray-700">
            {w.label} <span className="text-gray-400">({p.fallback ? LEVEL_WORD.strength : LEVEL_WORD[w.level]})</span>
          </li>
        ))}
      </ul>
      {p.fallback && <p className="text-xs text-gray-500 mb-2">The test found no weak area, so papers practice the two lowest areas.</p>}

      <div className="mt-5 print:hidden">
        {!p.ready ? (
          <p className="text-sm text-gray-600">Practice papers are being set up. Check back soon.</p>
        ) : p.rights.kind === 'locked' ? (
          <Locked resultId={p.resultId} />
        ) : p.rights.kind === 'per_paper' ? (
          waiting ? (
            <p className="text-sm text-gray-600">Paper {waiting.seq} is ready below — purchase it to download it whole or sit it on screen.</p>
          ) : (
            <>
              <GeneratePaperButton resultId={p.resultId} label={p.papers.length ? 'Generate another paper' : 'Generate a practice paper'} />
              <p className="text-xs text-gray-500 mt-2">You can preview each paper before purchasing it. Each is {VCE_PAPER_PRICE}, purchased once and kept.</p>
            </>
          )
        ) : (
          <>
            <GeneratePaperButton resultId={p.resultId} label={p.papers.length ? 'Generate another paper' : 'Generate a practice paper'} disabled={left === 0} />
            <p className="text-xs text-gray-500 mt-2">
              {p.allowance === null
                ? 'Admin: no monthly limit.'
                : left === 0
                  ? `You’ve used this month’s ${p.allowance.limit} papers. More on ${p.allowance.resets}.`
                  : `${left} of ${p.allowance.limit} papers left this month · resets ${p.allowance.resets}.`}
            </p>
          </>
        )}
      </div>

      {p.papers.length > 0 && (
        <ol className="mt-6 space-y-3">
          {[...p.papers].reverse().map(paper => (
            <PaperRow key={paper.id} paper={paper} resultId={p.resultId} fresh={paper.id === p.fresh} vce={p.rights.kind === 'per_paper'} sellable={p.sellable} />
          ))}
        </ol>
      )}

      {p.legacy && (
        <div className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>The practice exam built with this report:</span>
          <a href={`/api/diagnostic/${p.resultId}/exam?doc=paper`} className="text-brand-600 underline">
            {p.legacy.full ? 'Paper' : 'Preview'}
          </a>
          <a href={`/api/diagnostic/${p.resultId}/exam?doc=answers`} className="text-brand-600 underline">
            Answer key
          </a>
          {p.legacy.full && (
            <Link href={`/diagnostic/report/${p.resultId}/mark` as Route} className="text-brand-600 underline">
              Mark it
            </Link>
          )}
        </div>
      )}
    </section>
  )
}

function Locked({ resultId }: { resultId: string }) {
  const base = `/api/diagnostic/${resultId}/papers/preview`
  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4">
        <a href={`${base}?doc=paper`} className="btn-secondary inline-flex items-center gap-2">
          <Download className="w-4 h-4" aria-hidden />
          Preview the first paper
        </a>
        <a href={`${base}?doc=answers`} className="btn-secondary inline-flex items-center gap-2">
          <Download className="w-4 h-4" aria-hidden />
          Preview answers
        </a>
      </div>
      <p className="text-sm text-gray-700 mb-3">
        Practice papers are included in the Grade 3 – Year 10 plan, from {FROM_PER_MONTH} a month: up to three new papers a month, with every practice
        paper on the site.
      </p>
      <Link href="/pricing" className="btn-primary">
        See the plans
      </Link>
    </>
  )
}

function PaperRow({ paper, resultId, fresh, vce, sellable }: { paper: PaperSummary; resultId: string; fresh: boolean; vce: boolean; sellable: boolean }) {
  const base = `/api/diagnostic/papers/${paper.id}/pdf`
  const here = `/diagnostic/report/${resultId}/papers/${paper.id}`
  return (
    <li id={`paper-${paper.id}`} className={`rounded-2xl border-2 bg-white p-4 scroll-mt-24 ${fresh ? 'border-brand-400 ring-4 ring-brand-100' : 'border-line'}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <p className="font-bold text-ink">
          Paper {paper.seq} <span className="font-normal text-gray-500 text-sm">· {paper.questions} questions · {dateOf(paper.createdAt)}</span>
        </p>
        {paper.marked && (
          <p className="text-sm font-bold text-teal-600">
            Marked: {paper.marked.got} of {paper.marked.of}
          </p>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-3">{paper.focus.map(f => `${f.label} ${f.questions}`).join(' · ')}</p>
      {paper.open ? (
        <div className="flex flex-wrap gap-2">
          <Link href={here as Route} className="btn-primary inline-flex items-center gap-2 py-2 text-sm">
            <MonitorPlay className="w-4 h-4" aria-hidden />
            {paper.marked ? 'Sit it again on screen' : 'Do it online'}
          </Link>
          <a href={`${base}?doc=paper`} className="btn-secondary inline-flex items-center gap-2 py-2 text-sm">
            <Download className="w-4 h-4" aria-hidden />
            Print (PDF)
          </a>
          <a href={`${base}?doc=answers`} className="btn-secondary inline-flex items-center gap-2 py-2 text-sm">
            <Download className="w-4 h-4" aria-hidden />
            Answer key
          </a>
          <Link href={`${here}/mark` as Route} className="btn-secondary inline-flex items-center gap-2 py-2 text-sm">
            <CheckSquare className="w-4 h-4" aria-hidden />
            Mark the printed paper
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <a href={`${base}?doc=paper`} className="btn-secondary inline-flex items-center gap-2 py-2 text-sm">
            <Download className="w-4 h-4" aria-hidden />
            Preview
          </a>
          {vce ? (
            <CheckoutButton purchase={{ diagnosticPaperId: paper.id }} label={`Purchase this paper — ${VCE_PAPER_PRICE}`} sellable={sellable} />
          ) : (
            <Link href="/pricing" className="btn-primary py-2 text-sm">
              See the plans
            </Link>
          )}
        </div>
      )}
    </li>
  )
}
