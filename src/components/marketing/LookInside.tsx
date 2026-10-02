import { samplePreview } from '@/lib/samplePreview'
import type { SampleKey } from '@/lib/samples'
import LookInsideGallery from './LookInsideGallery'

/**
 * "Look inside": the free sample papers as bright tiles that open into a mini
 * sample test — three real questions marked on the spot — and the real printed
 * page. Every preview links to the free paper it came from, so the step after
 * "that looks good" is downloading the whole thing.
 *
 * Server component: the questions, diagrams and maths are drawn here.
 */
export default function LookInside({ items }: { items: SampleKey[] }) {
  return <LookInsideGallery previews={items.map(samplePreview)} />
}
