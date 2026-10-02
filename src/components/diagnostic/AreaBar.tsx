import type { Level } from '@/lib/diagnostic/types'
import { LEVEL_COLOUR } from './LevelChip'

/**
 * An area's score as a bar, with the two level boundaries (50% and 75%) marked,
 * so a parent can see how near a boundary — and so how settled — a result is.
 */
export default function AreaBar({ pct, level, label }: { pct: number; level: Level; label: string }) {
  return (
    <div className="relative h-2.5 rounded-full bg-gray-100" role="img" aria-label={`${label}: ${pct}%`}>
      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(2, pct)}%`, backgroundColor: LEVEL_COLOUR[level] }} />
      <span className="absolute inset-y-[-3px] left-1/2 w-px bg-white" aria-hidden />
      <span className="absolute inset-y-[-3px] left-3/4 w-px bg-white" aria-hidden />
    </div>
  )
}
