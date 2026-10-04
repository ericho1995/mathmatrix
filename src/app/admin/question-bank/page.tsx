import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AlertTriangle, CircleSlash, MailPlus } from 'lucide-react'
import ResolveAlertButton from '@/components/papers/ResolveAlertButton'
import RequestStatusButtons from '@/components/papers/RequestStatusButtons'
import { listPaperRequests, subjectLabel } from '@/lib/paperRequests'
import { getUserRole } from '@/lib/auth/getUserRole'
import { listBankAlerts } from '@/lib/diagnostic/papers'
import { SELECTIVE_SUBJECTS, SUBJECTS } from '@/lib/curriculum'
import { yearLabel } from '@/lib/yearLevels'

export const metadata: Metadata = {
  title: 'Requests and question bank — PrepNest',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

const SUBJECT = new Map([...SUBJECTS, ...SELECTIVE_SUBJECTS].map(s => [s.slug, s.label]))
const when = (iso: string) => new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', timeZone: 'Australia/Melbourne' })

/**
 * Where the question bank is running out. Each weak-areas paper avoids every
 * question a child has already seen, so a small area runs dry after a few
 * papers; this lists those areas, worst first, so new questions go where
 * customers are waiting for them. Admins only.
 */
export default async function QuestionBankAlertsPage() {
  const role = await getUserRole()
  if (role === null) redirect(`/auth/login?next=${encodeURIComponent('/admin/question-bank')}` as Route)
  if (role !== 'admin') notFound()

  const [listed, requested] = await Promise.all([listBankAlerts(), listPaperRequests()])
  const openRequests = requested.ok ? requested.requests.filter(r => r.status !== 'done') : []
  const doneRequests = requested.ok ? requested.requests.filter(r => r.status === 'done') : []
  const open = listed.ok ? listed.alerts.filter(a => !a.resolvedAt) : []
  const done = listed.ok ? listed.alerts.filter(a => a.resolvedAt) : []

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full">
      <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-1">Admin</p>
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">Requests and question bank</h1>
      <p className="text-gray-600 mb-8 max-w-prose">
        Practice papers never repeat a question a child has seen, and draw only on catalogue questions. When a child’s weak area has fewer unseen
        questions left than one more paper needs, it is listed here. <strong>Out of questions</strong> means a parent asked for a paper and none could be
        made. Add questions for the area (year, subject and area as shown), include them in a catalogue paper, then mark the alert as added.
      </p>

      <section className="mb-12">
        <h2 className="text-lg font-bold text-ink mb-1">Requests from families</h2>
        <p className="text-sm text-gray-600 mb-4 max-w-prose">
          Parents who have worked through the papers for their child&apos;s year and subject and asked for more. Reply from your own email, then mark the
          request done once the papers are in the catalogue.
        </p>
        {!requested.ok ? (
          <p className="card p-5 text-sm text-gray-600">
            {requested.missing ? 'The requests table is not set up yet — run supabase/schema_paper_requests.sql.' : 'The requests could not be loaded. Try again shortly.'}
          </p>
        ) : openRequests.length === 0 ? (
          <p className="card p-5 text-sm text-gray-600">No requests waiting.</p>
        ) : (
          <ul className="space-y-3">
            {openRequests.map(r => (
              <li key={r.id} className={`card p-4 flex flex-wrap items-start gap-4 border-l-4 ${r.status === 'new' ? 'border-l-brand-500' : 'border-l-amber-400'}`}>
                <MailPlus className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" aria-hidden />
                <div className="flex-1 min-w-[14rem]">
                  <p className="font-bold text-ink">
                    {yearLabel(r.year)} {subjectLabel(r.subject)}
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${r.status === 'new' ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-600'}`}>
                      {r.status === 'new' ? 'New' : 'In progress'}
                    </span>
                  </p>
                  {r.note && <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{r.note}</p>}
                  <p className="text-sm text-gray-500 mt-1">
                    <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Your request for more ${yearLabel(r.year)} ${subjectLabel(r.subject)} papers`)}`} className="text-brand-600 underline">
                      {r.email}
                    </a>{' '}
                    · asked {when(r.createdAt)}
                    {r.source ? ` · from ${r.source === 'weak_papers' ? 'the weak-areas papers' : r.source === 'paper' ? 'a paper' : 'the catalogue'}` : ''}
                  </p>
                </div>
                <RequestStatusButtons id={r.id} status={r.status} />
              </li>
            ))}
          </ul>
        )}
        {doneRequests.length > 0 && (
          <details className="mt-4">
            <summary className="text-sm font-bold text-gray-500 cursor-pointer">Done ({doneRequests.length})</summary>
            <ul className="mt-3 space-y-1 text-sm text-gray-500">
              {doneRequests.map(r => (
                <li key={r.id}>
                  {yearLabel(r.year)} {subjectLabel(r.subject)} · {r.email} · asked {when(r.createdAt)}, done {when(r.updatedAt)}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <h2 className="text-lg font-bold text-ink mb-4">Areas running low</h2>
      {!listed.ok ? (
        <p className="card p-5 text-sm text-gray-600">
          {listed.missing ? 'The alerts table is not set up yet — run supabase/schema_diagnostic_papers.sql.' : 'The alerts could not be loaded. Try again shortly.'}
        </p>
      ) : open.length === 0 ? (
        <p className="card p-5 text-sm text-gray-600">Nothing is running low.</p>
      ) : (
        <ul className="space-y-3">
          {open.map(a => (
            <li key={a.id} className={`card p-4 flex flex-wrap items-center gap-4 border-l-4 ${a.exhausted ? 'border-l-red-400' : 'border-l-amber-400'}`}>
              {a.exhausted ? <CircleSlash className="w-5 h-5 text-red-500 shrink-0" aria-hidden /> : <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" aria-hidden />}
              <div className="flex-1 min-w-[14rem]">
                <p className="font-bold text-ink">
                  {yearLabel(a.year)} {SUBJECT.get(a.subject) ?? a.subject} — {a.areaLabel}
                </p>
                <p className="text-sm text-gray-500">
                  {a.exhausted ? 'Out of questions' : 'Running low'} · fewest left for a child: {a.remaining} · raised {a.hits} {a.hits === 1 ? 'time' : 'times'} · since{' '}
                  {when(a.firstSeen)}, last {when(a.lastSeen)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {a.year} / {a.subject} / {a.areaId}
                </p>
              </div>
              <ResolveAlertButton id={a.id} />
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <details className="mt-10">
          <summary className="text-sm font-bold text-gray-500 cursor-pointer">Handled ({done.length})</summary>
          <ul className="mt-3 space-y-1 text-sm text-gray-500">
            {done.map(a => (
              <li key={a.id}>
                {yearLabel(a.year)} {SUBJECT.get(a.subject) ?? a.subject} — {a.areaLabel} · handled {when(a.resolvedAt!)}
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="mt-10 text-sm">
        <Link href="/account" className="text-brand-600 underline">
          Back to the account
        </Link>
      </p>
    </main>
  )
}
