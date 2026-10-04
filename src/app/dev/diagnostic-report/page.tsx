import { notFound } from 'next/navigation'
import ReportView from '@/components/diagnostic/report/ReportView'
import type { PaperSummary } from '@/components/papers/WeakPapersCard'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { sampleResult } from '@/lib/diagnostic/sample'
import { composeTailoredExam, weakAreas } from '@/lib/diagnostic/tailor'
import { buildProfile } from '@/lib/diagnostic/profile'
import { paperRights } from '@/lib/diagnostic/access'
import { CATALOGUE_IDS } from '@/lib/diagnostic/server'
import { monthWindow, PAPERS_PER_MONTH } from '@/lib/diagnostic/weakPapers'
import type { SubjectSlug, YearLevel } from '@/types'
import { mulberry32 } from '@/lib/diagnostic/rng'
import type { Cohort } from '@/lib/diagnostic/cohort'

export const dynamic = 'force-dynamic'

/**
 * Development only: the full report for a sample result, with no account, so
 * the page can be checked without signing in to the live project.
 *   /dev/diagnostic-report?year=grade_5&subject=math&seed=2&access=plan|locked|vce|admin&papers=2&used=1&retest=1&cohort=open|closed
 * `papers` sample papers are listed (the first one marked); `used` is this month's count.
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

  const mode = searchParams.access ?? 'plan'
  const rights = paperRights(year, {
    admin: mode === 'admin',
    plan: mode === 'plan' ? { plan: undefined, status: 'active', periodEnd: '2099-01-01', cancelAtPeriodEnd: false } : null,
    legacyYears: new Set(),
  })
  const used = new Set<string>()
  const papers: PaperSummary[] = []
  for (let seq = 1; seq <= (Number(searchParams.papers ?? 0) || 0); seq++) {
    const exam = composeTailoredExam(QUESTION_BANK, { resultId, report: sample.report, childName: 'Mia' }, { weakOnly: true, seq, used, allowed: CATALOGUE_IDS, id: `dev-${seq}` })
    for (const s of exam.sections) for (const id of s.question_ids) used.add(id)
    const questions = exam.sections.reduce((n, s) => n + s.question_ids.length, 0)
    papers.push({
      id: `00000000-0000-4000-8000-00000000000${seq}`,
      seq,
      createdAt: `2026-10-0${seq}T09:30:00+10:00`,
      questions,
      focus: exam.focus,
      // A VCE paper waits to be purchased; the others are open.
      open: rights.kind !== 'per_paper' || seq === 1,
      marked: seq === 1 ? { got: Math.round(questions * 0.6), of: questions, at: '2026-10-02T10:00:00+10:00' } : null,
    })
  }
  const weak = weakAreas(sample.report)
  // Development only: a made-up spread of 120 scores, to see the comparison card open.
  const rand = mulberry32(seed)
  const cohort: Cohort | null =
    searchParams.cohort === 'open'
      ? { open: true, students: 120, pcts: Array.from({ length: 120 }, () => Math.round(Math.min(100, Math.max(5, 62 + (rand() + rand() + rand() - 1.5) * 40)))).sort((a, b) => a - b) }
      : searchParams.cohort === 'closed'
        ? { open: false }
        : null

  return (
    <ReportView
      resultId={resultId}
      report={sample.report}
      childName="Mia"
      createdAt="2026-10-01T09:30:00+10:00"
      papers={{
        resultId,
        name: 'Mia',
        weak: weak.areas.map(a => ({ label: a.label, level: a.level })),
        fallback: weak.fallback,
        rights,
        allowance:
          rights.kind === 'allowance' && rights.limit !== null
            ? { used: Number(searchParams.used ?? papers.length) || 0, limit: PAPERS_PER_MONTH, resets: monthWindow().resets.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', timeZone: 'Australia/Melbourne' }) }
            : null,
        papers,
        ready: true,
        sellable: true,
        fresh: searchParams.fresh,
      }}
      profile={profile}
      marked={null}
      canDelete
      cohort={cohort}
    />
  )
}
