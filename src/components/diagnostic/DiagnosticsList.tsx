import Link from 'next/link'
import type { Route } from 'next'
import { ArrowRight, ClipboardList } from 'lucide-react'
import DataLoadError from '@/components/DataLoadError'
import { listResults } from '@/lib/diagnostic/load'
import { SELECTIVE_SUBJECTS, SUBJECTS } from '@/lib/curriculum'
import { yearLabel } from '@/lib/yearLevels'

const SUBJECT = new Map([...SUBJECTS, ...SELECTIVE_SUBJECTS].map(s => [s.slug as string, s.label]))

/**
 * Every diagnostic the visitor can see — their own and their linked
 * children's — newest first, each linking to its report. A failed read says
 * so rather than showing an empty list.
 */
export default async function DiagnosticsList() {
  const list = await listResults()
  if (!list.ok) return <DataLoadError title="Diagnostic tests" what="your diagnostic results" />

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400">Diagnostic tests</h2>
        <Link href="/diagnostic" className="text-sm text-brand-600 hover:text-brand-800">
          New test
        </Link>
      </div>
      {list.results.length === 0 ? (
        <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
          <ClipboardList className="w-8 h-8 text-brand-600 shrink-0" aria-hidden />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Find out where your child needs help</p>
            <p className="text-sm text-gray-500">A free on-screen test with a report for you and a practice exam built from the result.</p>
          </div>
          <Link href="/diagnostic" className="btn-primary whitespace-nowrap">
            Start a test
          </Link>
        </div>
      ) : (
        <ul className="card p-0 divide-y divide-gray-100">
          {list.results.map(r => {
            const work = r.areas.filter(a => a.level === 'focus' && a.confidence !== 'early').map(a => a.label)
            const watch = r.areas.filter(a => a.level === 'focus' && a.confidence === 'early').map(a => a.label)
            return (
              <li key={r.id}>
                <Link href={`/diagnostic/report/${r.id}` as Route} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {r.childName ?? 'Your child'} · {yearLabel(r.year)} {SUBJECT.get(r.subject) ?? r.subject}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {new Date(r.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Australia/Melbourne' })} ·{' '}
                      {r.correct} of {r.total} correct
                      {work.length ? ` · Focus: ${work.join(', ')}` : watch.length ? ` · To watch: ${watch.join(', ')}` : ''}
                      {r.markedAt ? ' · exam marked' : ''}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
