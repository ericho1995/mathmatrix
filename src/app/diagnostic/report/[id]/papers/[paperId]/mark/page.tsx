import type { Metadata, Route } from 'next'
import { notFound, redirect } from 'next/navigation'
import DataLoadError from '@/components/DataLoadError'
import PaperMarking from '@/components/practice/PaperMarking'
import { getAccess } from '@/lib/auth/access'
import { loadPaper } from '@/lib/diagnostic/papers'
import { paperOpen } from '@/lib/diagnostic/access'
import { markingSections } from '@/lib/diagnostic/marking'

export const metadata: Metadata = {
  title: 'Mark the practice paper — PrepNest',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

/** Entering the marks of a weak-areas paper sat on paper. Open to whoever can download it whole. */
export default async function MarkPaperPage({ params }: { params: { id: string; paperId: string } }) {
  const report = `/diagnostic/report/${params.id}`
  const loaded = await loadPaper(params.paperId)
  if (!loaded.ok) {
    if (loaded.status === 401) redirect(`/auth/login?next=${encodeURIComponent(`${report}/papers/${params.paperId}/mark`)}` as Route)
    if (loaded.status === 404) notFound()
    return <DataLoadError title="Mark the practice paper" what="this paper" />
  }
  const { paper } = loaded
  if (paper.resultId !== params.id) notFound()
  if (!paperOpen({ id: paper.id, year: paper.year }, await getAccess())) redirect(`${report}#paper-${paper.id}` as Route)

  return (
    <PaperMarking
      sections={markingSections(paper.exam)}
      examId={paper.exam.id}
      subject={paper.subject}
      yearLevel={paper.year}
      examTitle={paper.exam.title}
      backHref={`${report}#paper-${paper.id}`}
      backLabel="Back to the report"
      saveUrl={`/api/diagnostic/papers/${paper.id}/marks`}
      groupLabel="By area"
      practiceLink={{
        href: `${report}#papers`,
        label: 'Generate the next paper',
        text: 'The marks are saved with the report. The next paper practices the same areas with new questions.',
      }}
    />
  )
}
