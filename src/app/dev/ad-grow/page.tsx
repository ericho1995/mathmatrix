import { notFound } from 'next/navigation'
import { Caveat } from 'next/font/google'
import HeadlineResults from '@/components/diagnostic/HeadlineResults'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { catalogueOnlinePaper } from '@/lib/exams/onScreen'
import { SHOWCASE } from '@/lib/diagnostic/showcase'
import { SAMPLES } from '@/lib/samples'
import AdGrowTimeline from './AdGrowTimeline'

export const dynamic = 'force-dynamic'

const hand = Caveat({ subsets: ['latin'], weight: ['600', '700'] })

/**
 * Development only: the stop-motion "They grow up so quickly" reel
 * (AdGrowTimeline), about a minute long, drawn with the real product: a real
 * Grade 3 and Year 9 question, the sample child's report, real paper pages
 * and the bird. Captured frame by frame by marketing/instagram/render-ad.mjs
 * (--page=/dev/ad-grow); add ?play to watch it in real time.
 */
export default function AdGrowPage() {
  if (process.env.NODE_ENV === 'production' || !SHOWCASE) notFound()
  const question = (examId: string, n: number) => {
    const exam = PRACTICE_EXAMS.find(e => e.id === examId)!
    return catalogueOnlinePaper(exam)!.sections.flatMap(s => s.questions).find(q => q.n === n)!
  }
  return (
    <AdGrowTimeline
      hand={hand.className}
      young={question('math-grade_3-2', 1)}
      older={question('math-year_9-1', 5)}
      report={<HeadlineResults headline={SHOWCASE.headline} sample />}
      focus={SHOWCASE.report.areas[0].label}
      pages={[SAMPLES.numeracy.image.src, SAMPLES.conventions.image.src, SAMPLES.answerKey.image.src]}
    />
  )
}
