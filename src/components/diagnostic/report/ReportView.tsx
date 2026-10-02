import Link from 'next/link'
import type { Route } from 'next'
import { CalendarClock, CheckSquare, FileText, RefreshCw } from 'lucide-react'
import HeadlineResults from '../HeadlineResults'
import AreaCard from './AreaCard'
import TailoredExamCard from './TailoredExamCard'
import QuestionReview from './QuestionReview'
import ProgressPanel from './ProgressPanel'
import ReportActions from './ReportActions'
import { headlineOf } from '@/lib/diagnostic/score'
import { SELECTIVE_SUBJECTS, SUBJECTS } from '@/lib/curriculum'
import { yearLabel } from '@/lib/yearLevels'
import type { DiagnosticReport } from '@/lib/diagnostic/types'
import type { TailoredExam } from '@/lib/diagnostic/tailor'
import type { TailoredAccess } from '@/lib/diagnostic/access'
import type { Profile } from '@/lib/diagnostic/profile'
import type { MarkedArea } from '@/lib/diagnostic/marking'

const SUBJECT = new Map([...SUBJECTS, ...SELECTIVE_SUBJECTS].map(s => [s.slug, s.label]))

export interface ReportViewProps {
  resultId: string
  report: DiagnosticReport
  exam: TailoredExam
  childName: string | null
  createdAt: string
  access: TailoredAccess
  profile: Profile | null
  marked: { areas: MarkedArea[]; at: string } | null
  canDelete: boolean
  purchased?: boolean
}

/**
 * The full report, in the order a parent reads it: the summary, the practice
 * exam, then every area weakest first, every question, and what to do next.
 */
export default function ReportView(p: ReportViewProps) {
  const { report, childName: name } = p
  const headline = headlineOf(report, name)
  const date = new Date(p.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Melbourne' })
  const subject = SUBJECT.get(report.subject) ?? report.subject

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-1">Diagnostic report</p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {name ? `${name}’s` : 'Your child’s'} {yearLabel(report.year)} {subject}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sat on {date}</p>
        </div>
        <ReportActions resultId={p.resultId} canDelete={p.canDelete} />
      </header>

      {p.purchased && (
        <p className="rounded-xl bg-teal-50 border border-teal-400/30 px-4 py-3 text-sm text-teal-600" role="status">
          Thank you — your purchase is being confirmed. If the full exam still shows as a preview, refresh in a minute.
        </p>
      )}

      <HeadlineResults headline={headline} />

      <TailoredExamCard resultId={p.resultId} exam={p.exam} access={p.access} name={name} />

      {p.profile && p.profile.sittings > 1 && <ProgressPanel profile={p.profile} name={name} />}

      {p.marked && (
        <section className="card p-6">
          <h2 className="text-lg font-semibold tracking-tight mb-1">How the practice exam went</h2>
          <p className="text-sm text-gray-500 mb-4">Marked on {new Date(p.marked.at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', timeZone: 'Australia/Melbourne' })}. The exam is pitched to build up from where the test found {name ?? 'your child'}, so compare it with the next test rather than this one.</p>
          <ul className="space-y-1.5">
            {p.marked.areas.map(a => (
              <li key={a.id} className="flex justify-between text-sm">
                <span>{a.label}</span>
                <span className="text-gray-500">
                  {a.correct} of {a.total}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">Area by area, weakest first</h2>
        <div className="space-y-4">
          {report.areas.map(a => (
            <AreaCard key={a.id} area={a} subject={report.subject} year={report.year} name={name} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">Every question, with the answer explained</h2>
        <QuestionReview report={report} />
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight mb-4">What to do next</h2>
        <ol className="space-y-4">
          <Next icon={FileText} title="Sit the practice exam">
            Print it and have {name ?? 'your child'} sit it in one go, timed if you like. Most of it is on the areas to work on.
          </Next>
          <Next icon={CheckSquare} title="Mark it together">
            Use the answer key and go through every wrong answer — the explanations show the working. You can enter the marks on
            screen to see how each area went.
          </Next>
          <Next icon={CalendarClock} title="Practice the gaps a little at a time">
            Ten to fifteen minutes a few times a week does more than a long session once. The tips on each area are a good start.
          </Next>
          <Next icon={RefreshCw} title="Re-test in three to six weeks">
            <Link href={`/diagnostic?year=${report.year}` as Route} className="text-brand-600 underline">
              Sit the diagnostic again
            </Link>
            . It never repeats a question, and the report will show which areas have moved.
          </Next>
        </ol>
      </section>

      <p className="text-xs text-gray-400 leading-relaxed">
        This report comes from a short test and is a snapshot, not a formal assessment or a comparison with other children. Each
        area says how firm its result is; an early sign needs another look before anything is read into it.
      </p>
    </main>
  )
}

function Next({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <Icon className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
      </div>
    </li>
  )
}
