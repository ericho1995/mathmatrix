import { BirdMark } from '@/components/brand/Bird'

/**
 * The PrepNest logo: the bird peeking over its nest, and the two-tone
 * wordmark — "Prep" in ink, "Nest" in the bird's blue. The same mark is the
 * favicon and app icon, so the site, a browser tab and a home-screen icon read
 * as one brand.
 */
export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const mark = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10'
  const word = size === 'sm' ? 'text-lg' : 'text-2xl'
  return (
    <span className="inline-flex items-center gap-1.5">
      <BirdMark className={`${mark} shrink-0`} />
      <span className={`${word} font-bold tracking-tight text-ink`}>
        Prep<span className="text-brand-500">Nest</span>
      </span>
    </span>
  )
}
