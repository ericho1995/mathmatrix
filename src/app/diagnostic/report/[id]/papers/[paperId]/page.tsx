import type { Metadata, Route } from 'next'
import { notFound, redirect } from 'next/navigation'
import DataLoadError from '@/components/DataLoadError'
import PaperRunner from '@/components/papers/PaperRunner'
import { getAccess } from '@/lib/auth/access'
import { loadPaper } from '@/lib/diagnostic/papers'
import { paperOpen } from '@/lib/diagnostic/access'
import { onlinePaper } from '@/lib/diagnostic/online'

export const metadata: Metadata = {
  title: 'Practice paper — PrepNest',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

/** A weak-areas paper sat on screen. Open to whoever can download it whole. */
export default async function PaperOnScreenPage({ params }: { params: { id: string; paperId: string } }) {
  const report = `/diagnostic/report/${params.id}`
  const loaded = await loadPaper(params.paperId)
  if (!loaded.ok) {
    if (loaded.status === 401) redirect(`/auth/login?next=${encodeURIComponent(`${report}/papers/${params.paperId}`)}` as Route)
    if (loaded.status === 404) notFound()
    return <DataLoadError title="Practice paper" what="this paper" />
  }
  const { paper, result } = loaded
  if (paper.resultId !== params.id) notFound()
  if (!paperOpen({ id: paper.id, year: paper.year }, await getAccess())) redirect(`${report}#paper-${paper.id}` as Route)

  return (
    <PaperRunner
      paperId={paper.id}
      paper={onlinePaper(paper.exam)}
      name={result.childName}
      backHref={`${report}#paper-${paper.id}`}
      checkUrl={`/api/diagnostic/papers/${paper.id}/check`}
      marksUrl={`/api/diagnostic/papers/${paper.id}/marks`}
    />
  )
}
