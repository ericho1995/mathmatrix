import Link from 'next/link'
import type { Route } from 'next'
import { Check, Lock } from 'lucide-react'

/** What a visitor can do with a paper: free sample, already theirs, or locked (VCE shows its price). */
export type TileState = 'free' | 'unlocked' | 'locked' | { price: string }

function stateWords(state: TileState): string {
  if (state === 'free') return 'free'
  if (state === 'unlocked') return 'unlocked'
  if (state === 'locked') return 'locked'
  return `${state.price}`
}

/**
 * One printed page: a small portrait sheet with a folded corner, the paper's
 * number and its state. Showing papers as pages — rather than a list of
 * "Practice Exam 1, 2, 3" — makes the size of the library visible at a glance.
 */
function Sheet({ label, state }: { label: string; state: TileState }) {
  const free = state === 'free'
  const owned = state === 'unlocked'
  return (
    <span
      className={`relative flex flex-col items-center justify-center gap-1 w-12 h-16 rounded-md border bg-white text-xs
        shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-150 group-hover:-translate-y-0.5
        group-hover:shadow-[0_4px_10px_rgba(16,24,40,0.10)] ${
          free ? 'border-teal-400' : owned ? 'border-teal-400/60' : 'border-gray-200 group-hover:border-brand-200'
        }`}
    >
      <span aria-hidden className="absolute top-0 right-0 w-2.5 h-2.5 rounded-bl-sm border-l border-b border-gray-200 bg-gray-50" />
      <span className="font-semibold text-gray-900">{label}</span>
      {free ? (
        <span className="text-[11px] font-medium text-teal-600">Free</span>
      ) : owned ? (
        <Check className="w-3.5 h-3.5 text-teal-600" strokeWidth={2.5} aria-hidden />
      ) : (
        <Lock className="w-3.5 h-3.5 text-gray-400" aria-hidden />
      )}
    </span>
  )
}

export function PaperTile({
  href,
  number,
  state,
  ariaTitle,
}: {
  href: string
  number: number | string
  state: TileState
  /** Spoken name, e.g. "Maths practice exam 2". */
  ariaTitle: string
}) {
  const price = typeof state === 'object' ? state.price : null
  return (
    <Link href={href as Route} className="group flex flex-col items-center gap-1" aria-label={`${ariaTitle}, ${stateWords(state)}`}>
      <Sheet label={String(number)} state={state} />
      {price && <span className="text-[11px] text-gray-500">{price}</span>}
    </Link>
  )
}

/** Exam 1 and Exam 2 of a VCE practice set: two joined pages, one purchase. */
export function SetTile({
  set,
  papers,
  price,
}: {
  set: number
  papers: { href: string; label: string; state: TileState; ariaTitle: string }[]
  /** Shown when some paper in the set is still locked, e.g. "$20 both" or "$20". */
  price?: string
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex gap-1 rounded-lg bg-gray-50 p-1">
        {papers.map(p => (
          <Link key={p.href} href={p.href as Route} className="group" aria-label={`${p.ariaTitle}, ${stateWords(p.state)}`}>
            <Sheet label={p.label} state={p.state} />
          </Link>
        ))}
      </div>
      <span className="text-[11px] text-gray-500">
        Set {set}
        {price && <span className="text-gray-700"> · {price}</span>}
      </span>
    </div>
  )
}
