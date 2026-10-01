import { notFound } from 'next/navigation'
import ReportView from '@/components/diagnostic/report/ReportView'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { sampleResult } from '@/lib/diagnostic/sample'
import { composeTailoredExam } from '@/lib/diagnostic/tailor'
import { buildProfile } from '@/lib/diagnostic/profile'
import type { SubjectSlug, YearLevel } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * Development only: the full report for a sample result, with no account, so
 * the page can be checked without signing in to the live project.
 *   /dev/diagnostic-report?year=grade_5&subject=math&seed=2&access=full|plan|vce&retest=1
 */
export default function DevReportPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const year = (searchParams.year ?? 'grade_5') as YearLevel
  const subject = (searchParams.subject ?? 'math') as SubjectSlug
  const seed = Number(searchParams.seed ?? 2) || 2
  const sample = sampleResult(QUESTION_BANK, year, subject, seed)
  if (!sample) notFound()
  const resultId = '00000000-0000-4000-8000-000000000000'
  const earlier = searchParams.retest ? sampleResult(QUESTION_BANK, year, subject, seed + 7) : null
  const toSitting = (id: string, at: string, r: typeof sample.report) => ({ id, at, areas: r.areas.map(a => ({ id: a.id, label: a.label, secure: a.secure, evidence: a.evidence })) })
  const profile = earlier ? buildProfile([toSitting('a', '2026-08-20', earlier.report), toSitting('b', '2026-10-01', sample.report)]) : null
  const access = searchParams.access === 'full' ? ({ mode: 'full', reason: 'plan' } as const) : ({ mode: 'preview', purchase: searchParams.access === 'vce' ? 'vce' : 'plan' } as const)

  return (
    <ReportView
      resultId={resultId}
      report={sample.report}
      exam={composeTailoredExam(QUESTION_BANK, { resultId, report: sample.report, childName: 'Mia' })}
      childName="Mia"
      createdAt="2026-10-01T09:30:00+10:00"
      access={access}
      profile={profile}
      marked={null}
      canDelete
    />
  )
}
