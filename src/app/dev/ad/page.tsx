import { notFound } from 'next/navigation'
import HeadlineResults from '@/components/diagnostic/HeadlineResults'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { catalogueOnlinePaper } from '@/lib/exams/onScreen'
import { SHOWCASE } from '@/lib/diagnostic/showcase'
import AdTimeline from './AdTimeline'

export const dynamic = 'force-dynamic'

/**
 * Development only: the 15-second Reels/TikTok ad (AdTimeline), drawn with
 * the real product: a real Grade 5 question, the report for the sample child,
 * her practice papers, and the bird. Captured frame by frame by
 * marketing/instagram/render-ad.mjs; add ?play to watch it in real time.
 */
export default function AdPage() {
  if (process.env.NODE_ENV === 'production' || !SHOWCASE) notFound()
  const exam = PRACTICE_EXAMS.find(e => e.id === 'math-grade_5-1')!
  const paper = catalogueOnlinePaper(exam)!
  const questions = paper.sections.flatMap(s => s.questions)
  const q = (n: number) => questions.find(x => x.n === n)!
  return (
    <AdTimeline
      question={q(5)}
      questionOf={questions.length}
      question2={q(28)}
      report={<HeadlineResults headline={SHOWCASE.headline} sample />}
      focus={SHOWCASE.report.areas[0].label}
      papers={SHOWCASE.papers.slice(0, 2).concat(SHOWCASE.papers.slice(0, 1).map(p => ({ ...p, seq: 3 }))).map(p => ({ seq: p.seq, label: p.focus.slice(0, 2).map(f => f.label).join(' · ') }))}
    />
  )
}
