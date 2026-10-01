import HeadlineResults from './HeadlineResults'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { sampleResult } from '@/lib/diagnostic/sample'
import { headlineOf, type Headline } from '@/lib/diagnostic/score'

/**
 * A made-up Grade 5 Maths result, drawn with the real report components and
 * labelled as a sample, so a parent sees what they will get before starting.
 * The seed is the first that gives a firm focus area beside a strength — the
 * shape of result the report exists to explain.
 */
function pickSample(): Headline | null {
  for (let seed = 1; seed <= 40; seed++) {
    const s = sampleResult(QUESTION_BANK, 'grade_5', 'math', seed)
    if (!s) continue
    const firmFocus = s.report.areas.some(a => a.level === 'focus' && a.confidence !== 'early')
    const strength = s.report.areas.some(a => a.level === 'strength')
    if (firmFocus && strength && !s.report.quality.flags.length) return headlineOf(s.report, 'Mia')
  }
  return null
}

const SAMPLE = pickSample()

export default function SampleReport() {
  if (!SAMPLE) return null
  return (
    <figure className="relative">
      <div className="pointer-events-none select-none" aria-label="Sample report">
        <HeadlineResults headline={SAMPLE} sample />
      </div>
      <figcaption className="text-xs text-gray-400 mt-3 text-center">Sample report for a made-up Grade 5 student.</figcaption>
    </figure>
  )
}
