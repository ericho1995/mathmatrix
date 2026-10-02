import { notFound } from 'next/navigation'
import PaperRunner from '@/components/papers/PaperRunner'
import { devPaper } from '@/lib/diagnostic/devPaper'
import { onlinePaper } from '@/lib/diagnostic/online'

export const dynamic = 'force-dynamic'

/**
 * Development only: a weak-areas paper for a sample result, on screen, with
 * no account. Handing it in marks it; nothing is saved.
 *   /dev/paper?year=year_12&subject=specialist_maths&seed=2&seq=1
 */
export default function DevPaperPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const exam = devPaper(searchParams)
  if (!exam) notFound()
  const query = new URLSearchParams(Object.entries(searchParams).filter((e): e is [string, string] => typeof e[1] === 'string')).toString()
  return (
    <PaperRunner
      paperId={`dev-${query}`}
      paper={onlinePaper(exam)}
      name="Mia"
      backHref={`/dev/diagnostic-report?${query}&papers=2`}
      checkUrl={`/api/dev/paper-check?${query}`}
      marksUrl={null}
    />
  )
}
