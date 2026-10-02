import HeadlineResults from './HeadlineResults'
import { SHOWCASE } from '@/lib/diagnostic/showcase'

/**
 * A made-up Grade 5 Maths result, drawn with the real report components and
 * labelled as a sample, so a parent sees what they will get before starting.
 */
export default function SampleReport() {
  if (!SHOWCASE) return null
  return (
    <figure className="relative">
      <div className="pointer-events-none select-none" aria-label="Sample report">
        <HeadlineResults headline={SHOWCASE.headline} sample />
      </div>
      <figcaption className="text-xs text-gray-400 mt-3 text-center">Sample report for a made-up Grade 5 student.</figcaption>
    </figure>
  )
}
