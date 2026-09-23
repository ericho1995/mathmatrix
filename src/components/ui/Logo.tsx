/**
 * The PrepNest mark and wordmark. The mark is the same blue "P" square as the
 * favicon, app icon and ads, so the site, a browser tab and an ad in a feed all
 * read as one brand.
 */
export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const mark = size === 'sm' ? 'w-6 h-6 text-[13px] rounded-[7px]' : 'w-8 h-8 text-base rounded-[9px]'
  const word = size === 'sm' ? 'text-sm' : 'text-lg'
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={`${mark} bg-brand-600 text-white font-bold flex items-center justify-center shadow-sm shadow-brand-600/30`}
      >
        P
      </span>
      <span className={`${word} font-semibold tracking-tight text-gray-900`}>
        Prep<span className="text-brand-400">Nest</span>
      </span>
    </span>
  )
}
