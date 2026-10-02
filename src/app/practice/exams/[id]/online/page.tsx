import type { Metadata, Route } from 'next'
import { notFound, redirect } from 'next/navigation'
import PaperRunner from '@/components/papers/PaperRunner'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { getAccess } from '@/lib/auth/access'
import { paperDownload } from '@/lib/pdf/paperDownload'
import { catalogueOnlinePaper } from '@/lib/exams/onScreen'

export const dynamic = 'force-dynamic'

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const exam = PRACTICE_EXAMS.find(e => e.id === params.id)
  if (!exam) return { title: 'Paper not found — PrepNest' }
  return {
    title: `${exam.title} on screen — PrepNest`,
    description: 'Sit the whole practice paper on screen, with a timer and a working-out pad, then see every answer explained and how each topic went.',
  }
}

/**
 * Any practice paper, sat on screen from start to finish. Gated exactly like
 * its PDF: only a visitor who may download the whole paper sits it here;
 * anyone else goes to the paper's page. Reading papers keep their own
 * side-by-side layout, the way NAPLAN Online sets them.
 */
export default async function ExamOnScreenPage({ params }: { params: { id: string } }) {
  const exam = PRACTICE_EXAMS.find(e => e.id === params.id)
  if (!exam) notFound()
  if (exam.subject === 'reading') redirect(`/practice/reading/${exam.id}` as Route)

  const here = `/practice/exams/${exam.id}`
  const access = await getAccess()
  if (paperDownload(exam, access)?.mode !== 'full') redirect(here as Route)
  const paper = catalogueOnlinePaper(exam)
  if (!paper) notFound()

  return (
    <PaperRunner
      paperId={`exam-${exam.id}`}
      paper={paper}
      name={null}
      backHref={here}
      backLabel="Back to the paper"
      checkUrl={`/api/exams/${exam.id}/check`}
      marksUrl={`/api/exams/${exam.id}/result`}
      saveMode="result"
      blurb="Sit it in one go if you can, the way the real test runs."
      signInHref={`/auth/login?next=${encodeURIComponent(`${here}/online`)}`}
      signedIn={access.signedIn}
    />
  )
}
