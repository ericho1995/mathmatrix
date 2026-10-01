import type { Metadata, Route } from 'next'
import { notFound, redirect } from 'next/navigation'
import DataLoadError from '@/components/DataLoadError'
import PaperMarking from '@/components/practice/PaperMarking'
import { getAccess } from '@/lib/auth/access'
import { loadResult } from '@/lib/diagnostic/load'
import { tailoredAccess } from '@/lib/diagnostic/access'
import { markingSections } from '@/lib/diagnostic/marking'

export const metadata: Metadata = {
  title: 'Mark the practice exam — PrepNest',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

/**
 * Entering the marks of a tailored exam sat on paper. Open to whoever can
 * download the whole exam; a preview was not the paper that was sat.
 */
export default async function MarkTailoredPage({ params }: { params: { id: string } }) {
  const here = `/diagnostic/report/${params.id}`
  const loaded = await loadResult(params.id)
  if (!loaded.ok) {
    if (loaded.status === 401) redirect(`/auth/login?next=${encodeURIComponent(`${here}/mark`)}` as Route)
    if (loaded.status === 404) notFound()
    return <DataLoadError title="Mark the practice exam" what="this exam" />
  }
  const { result } = loaded
  if (tailoredAccess({ id: result.id, year: result.year }, await getAccess()).mode !== 'full') redirect(here as Route)

  return (
    <PaperMarking
      sections={markingSections(result)}
      examId={result.exam.id}
      subject={result.subject}
      yearLevel={result.year}
      examTitle={result.exam.title}
      backHref={here}
      backLabel="Back to the report"
      saveUrl={`/api/diagnostic/${result.id}/marks`}
      groupLabel="By area"
      practiceLink={{
        href: `/diagnostic?year=${result.year}`,
        label: 'Plan the re-test',
        text: 'The marks are saved with the report. In three to six weeks, sit the diagnostic again to see how each area has moved.',
      }}
    />
  )
}
