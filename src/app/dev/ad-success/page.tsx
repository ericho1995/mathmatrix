import { notFound } from 'next/navigation'
import { Caveat } from 'next/font/google'
import HeadlineResults from '@/components/diagnostic/HeadlineResults'
import { SHOWCASE } from '@/lib/diagnostic/showcase'
import { SAMPLES } from '@/lib/samples'
import AdSuccessTimeline from './AdSuccessTimeline'

export const dynamic = 'force-dynamic'

const hand = Caveat({ subsets: ['latin'], weight: ['600', '700'] })

/**
 * Development only: the "gold star" reel (AdSuccessTimeline), about 30
 * seconds, drawn with the real product: a real paper page, the sample
 * child's report and real practice pages, with the bird as the student.
 * Captured frame by frame by marketing/instagram/render-ad.mjs
 * (--page=dev/ad-success); add ?play to watch it in real time.
 */
export default function AdSuccessPage() {
  if (process.env.NODE_ENV === 'production' || !SHOWCASE) notFound()
  return (
    <AdSuccessTimeline
      hand={hand.className}
      page={SAMPLES.numeracy.image.src}
      report={<HeadlineResults headline={SHOWCASE.headline} sample />}
      focus={SHOWCASE.report.areas[0].label}
      practice={[SAMPLES.numeracy.image.src, SAMPLES.conventions.image.src, SAMPLES.readingQuestions.image.src]}
    />
  )
}
