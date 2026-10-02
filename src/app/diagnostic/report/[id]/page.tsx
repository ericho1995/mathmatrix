import type { Metadata, Route } from 'next'
import { notFound, redirect } from 'next/navigation'
import DataLoadError from '@/components/DataLoadError'
import ReportView from '@/components/diagnostic/report/ReportView'
import { getAccess } from '@/lib/auth/access'
import { loadProfile, loadResult } from '@/lib/diagnostic/load'
import { tailoredAccess } from '@/lib/diagnostic/access'
import { markedAreas } from '@/lib/diagnostic/marking'

export const metadata: Metadata = {
  title: 'Diagnostic report — PrepNest',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

/** A saved diagnostic result, for its owner or a linked parent. */
export default async function ReportPage({ params, searchParams }: { params: { id: string }; searchParams: { purchased?: string } }) {
  const loaded = await loadResult(params.id)
  if (!loaded.ok) {
    if (loaded.status === 401) redirect(`/auth/login?next=${encodeURIComponent(`/diagnostic/report/${params.id}`)}` as Route)
    if (loaded.status === 404) notFound()
    return <DataLoadError title="Diagnostic report" what="this report" />
  }
  const { result, viewerId } = loaded
  const [access, profile] = await Promise.all([getAccess(), loadProfile(result)])

  return (
    <ReportView
      resultId={result.id}
      report={result.report}
      exam={result.exam}
      childName={result.childName}
      createdAt={result.createdAt}
      access={tailoredAccess({ id: result.id, year: result.year }, access)}
      profile={profile?.profile ?? null}
      marked={result.marks && result.markedAt ? { areas: markedAreas(result.marks), at: result.markedAt } : null}
      canDelete={result.userId === viewerId}
      purchased={searchParams.purchased === '1'}
    />
  )
}
