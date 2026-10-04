import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { notFound } from 'next/navigation'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { catalogueOnlinePaper } from '@/lib/exams/onScreen'
import { SHOWCASE } from '@/lib/diagnostic/showcase'
import { BY_ID, CATALOGUE_BANK } from '@/lib/diagnostic/server'
import { toScreenQuestion } from '@/lib/web/questionHtml'
import numeracyPage from '@/assets/samples/numeracy-page.webp'
import answerKey from '@/assets/samples/numeracy-answer-key.webp'
import RightPractice, { type ReelTimings } from './RightPractice'

export const dynamic = 'force-dynamic'

/**
 * Development only: "The right practice", a 30-second Reels/TikTok ad drawn
 * with the real product: two real Grade 5 test questions, the report for the
 * sample child (Mia), a real Number Patterns question on the paper screen and
 * real printed pages. The voice timings come from the soundtrack
 * (marketing/instagram/ad-right/timings.json, written by audio.py).
 * Captured frame by frame by marketing/instagram/ad-right/render.mjs; add
 * ?play to watch it in real time.
 */
export default function AdRightPage() {
  if (process.env.NODE_ENV === 'production' || !SHOWCASE) notFound()
  const timings = JSON.parse(readFileSync(join(process.cwd(), 'marketing/instagram/ad-right/timings.json'), 'utf8')) as ReelTimings

  const exam = PRACTICE_EXAMS.find(e => e.id === 'math-grade_5-1')!
  const paper = catalogueOnlinePaper(exam)!
  const questions = paper.sections.flatMap(s => s.questions)
  // Short stems with a picture read best on a phone in a second or two.
  const visual = questions.filter(q => q.kind === 'choice' && q.diagram && q.stem.length < 90 && (q.options?.length ?? 0) === 4)

  const h = SHOWCASE.headline
  const focus = h.areas.find(a => a.level === 'focus') ?? h.areas[0]
  // The paper scene shows a question from the focus area, with a picture, that is not already on the test screen.
  const shown = new Set(visual.slice(0, 2).map(q => q.id))
  const mc = (q: (typeof CATALOGUE_BANK)[number]) => (q.format ?? 'multiple_choice') === 'multiple_choice'
  const pattern =
    CATALOGUE_BANK.find(q => q.topic === focus.id && q.year_level === 'grade_5' && q.diagram && mc(q) && !shown.has(q.id) && q.question_text.length < 80) ??
    CATALOGUE_BANK.find(q => q.topic === focus.id && q.year_level === 'grade_5' && mc(q))!
  return (
    <RightPractice
      timings={timings}
      test={[visual[0], visual[1] ?? visual[0]]}
      testOf={questions.length}
      headline={h}
      focusId={focus.id}
      paperQuestion={toScreenQuestion(BY_ID.get(pattern.id)!, 4)}
      pages={[numeracyPage.src, answerKey.src]}
    />
  )
}
