import Link from 'next/link'
import type { Route } from 'next'
import { YEAR_STAGES, yearLabel, yearTag } from '@/lib/yearLevels'
import type { YearLevel } from '@/types'

export interface YearPickerItem {
  yearLevel: YearLevel
  /** Second line, e.g. "8 papers". Falls back to the NAPLAN or VCE tag. */
  sub?: string
  /** The visitor already owns every paper at this level. */
  done?: boolean
}

/**
 * The year levels as grouped tiles — Primary, Secondary, VCE — each naming the
 * level in full and what it holds, instead of a row of "Gr 3" pills.
 *
 * Link mode (`hrefFor`) for browsing: the catalogue and the homepage. Button
 * mode (`onSelect`) for choosing: the sign-up form, a client component, which
 * is why this file imports nothing server-only. On a phone the stages sit side
 * by side in one row that scrolls sideways.
 */
export default function YearPicker({
  items,
  selected,
  hrefFor,
  onSelect,
  compact = false,
}: {
  items: YearPickerItem[]
  selected?: YearLevel | null
  hrefFor?: (y: YearLevel) => string
  onSelect?: (y: YearLevel) => void
  /** Hide the stage notes (NAPLAN years), for tight spaces such as sign-up. */
  compact?: boolean
}) {
  const byYear = new Map(items.map(i => [i.yearLevel, i]))
  return (
    <div className="flex gap-6 w-max sm:w-auto sm:flex-col sm:gap-4">
      {YEAR_STAGES.map(stage => {
        const years = stage.years.filter(y => byYear.has(y))
        if (years.length === 0) return null
        return (
          <div key={stage.id} className="shrink-0">
            <p className="text-xs text-gray-500 mb-2">
              <span className="font-medium text-gray-700">{stage.label}</span>
              {!compact && <span className="hidden sm:inline"> · {stage.note}</span>}
            </p>
            <div className="flex gap-2 sm:grid sm:grid-cols-4">
              {years.map(y => {
                const item = byYear.get(y)!
                const active = selected === y
                const cls = `block text-left rounded-xl border px-3.5 py-2.5 min-w-[7.5rem] transition-colors ${
                  active
                    ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                    : 'border-gray-200 bg-white hover:border-brand-200 hover:bg-brand-50/50'
                }`
                const body = (
                  <>
                    <span className={`block text-sm font-medium ${active ? 'text-brand-800' : 'text-gray-900'}`}>
                      {yearLabel(y)}
                      {item.done && (
                        <span className="text-teal-600" aria-label="unlocked">
                          {' '}
                          ✓
                        </span>
                      )}
                    </span>
                    <span className={`block text-xs mt-0.5 ${active ? 'text-brand-600' : 'text-gray-500'}`}>
                      {item.sub ?? yearTag(y) ?? ' '}
                    </span>
                  </>
                )
                return hrefFor ? (
                  <Link key={y} href={hrefFor(y) as Route} className={cls} aria-current={active ? 'page' : undefined}>
                    {body}
                  </Link>
                ) : (
                  <button key={y} type="button" onClick={() => onSelect?.(y)} className={cls} aria-pressed={active}>
                    {body}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
