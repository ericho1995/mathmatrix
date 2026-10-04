import { notFound } from 'next/navigation'
import { Caveat } from 'next/font/google'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { catalogueOnlinePaper } from '@/lib/exams/onScreen'
import { SAMPLES } from '@/lib/samples'
import FilmTimeline from './FilmTimeline'
import home from './screens/home.png'

export const dynamic = 'force-dynamic'

const hand = Caveat({ subsets: ['latin'], weight: ['600', '700'] })

/**
 * Development only: "Gold star", the wordless short film (FilmTimeline).
 * Captured frame by frame by marketing/instagram/render-ad.mjs
 * (--page=dev/ad-film); add ?play to watch it in real time.
 */
export default function FilmPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  const exam = PRACTICE_EXAMS.find(e => e.id === 'math-grade_5-1')!
  const question = catalogueOnlinePaper(exam)!.sections.flatMap(s => s.questions).find(q => q.n === 5)!
  return <FilmTimeline hand={hand.className} home={home.src} practicePage={SAMPLES.numeracy.image.src} question={question} />
}
