import Link from 'next/link'
import type { Route } from 'next'
import { ArrowRight, ClipboardList } from 'lucide-react'

/**
 * The invitation to the free diagnostic, for the NAPLAN, VCE, pricing and help
 * pages: one line of why, and the button.
 */
export default function DiagnosticCta({
  title = 'Not sure where to start?',
  body = 'The free diagnostic test finds what your child is confident with and the exact skills to work on, then builds a practice exam around the result.',
  year,
}: {
  title?: string
  body?: string
  /** Opens the test with this year level chosen. */
  year?: string
}) {
  return (
    <div className="card flex flex-col sm:flex-row sm:items-center gap-4 border-brand-100 bg-brand-50/50">
      <ClipboardList className="w-8 h-8 text-brand-600 shrink-0" aria-hidden />
      <div className="flex-1">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{body}</p>
      </div>
      <Link href={(year ? `/diagnostic?year=${year}` : '/diagnostic') as Route} className="btn-primary whitespace-nowrap inline-flex items-center gap-1.5">
        Free diagnostic test
        <ArrowRight className="w-4 h-4" aria-hidden />
      </Link>
    </div>
  )
}
