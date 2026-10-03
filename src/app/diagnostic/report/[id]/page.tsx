import type { Metadata, Route } from 'next'
import { notFound, redirect } from 'next/navigation'
import DataLoadError from '@/components/DataLoadError'
import ReportView from '@/components/diagnostic/report/ReportView'
import { getAccess } from '@/lib/auth/access'
import { loadCohort, loadProfile, loadResult } from '@/lib/diagnostic/load'
import { markedAreas } from '@/lib/diagnostic/marking'
import { papersPanel } from '@/lib/diagnostic/papersPanel'

export const metadata: Metadata = {
  title: 'Diagnostic report — PrepNest',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

/** A saved diagnostic result, for its owner or a linked parent. */
export default async function ReportPage({ params, searchParams }: { params: { id: string }; searchParams: { purchased?: string; paper?: string } }) {
  const loaded = await loadResult(params.id)
  if (!loaded.ok) {
    if (loaded.status === 401) redirect(`/auth/login?next=${encodeURIComponent(`/diagnostic/report/${params.id}`)}` as Route)
    if (loaded.status === 404) notFound()
    return <DataLoadError title="Diagnostic report" what="this report" />
  }
  const { result, viewerId } = loaded
  const [access, profile, cohort] = await Promise.all([getAccess(), loadProfile(result), loadCohort(result.year, result.subject)])
  const papers = await papersPanel(result, access, viewerId, searchParams.paper)

  return (
    <ReportView
      resultId={result.id}
      report={result.report}
      childName={result.childName}
      createdAt={result.createdAt}
      papers={papers}
      profile={profile?.profile ?? null}
      marked={result.marks && result.markedAt ? { areas: markedAreas(result.marks), at: result.markedAt } : null}
      canDelete={result.userId === viewerId}
      purchased={searchParams.purchased === '1'}
      cohort={cohort}
    />
  )
}
