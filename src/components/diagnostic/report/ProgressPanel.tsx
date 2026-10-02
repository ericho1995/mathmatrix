import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Profile } from '@/lib/diagnostic/profile'
import LevelChip from '../LevelChip'
import AreaBar from '../AreaBar'

const CHANGE = {
  up: { icon: ArrowUpRight, text: 'Improved', cls: 'text-teal-600' },
  down: { icon: ArrowDownRight, text: 'Slipped', cls: 'text-amber-400' },
  same: { icon: ArrowRight, text: 'Holding steady', cls: 'text-gray-500' },
} as const

/**
 * Every sitting of this test so far, taken together. The newest counts most;
 * agreeing sittings firm a result up, and a change shows as a direction rather
 * than a flip on one test.
 */
export default function ProgressPanel({ profile, name }: { profile: Profile; name: string | null }) {
  return (
    <section className="card p-6 sm:p-8">
      <h2 className="text-lg font-semibold tracking-tight mb-1">Over time</h2>
      <p className="text-sm text-gray-500 mb-5">
        {name ?? 'Your child'} has sat this test {profile.sittings} times ({profile.questions} questions in all). Together they say:
      </p>
      <ul className="divide-y divide-gray-100">
        {profile.areas.map(a => {
          const change = a.change ? CHANGE[a.change] : null
          return (
            <li key={a.id} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mb-2">
                <span className="font-medium text-gray-900">{a.label}</span>
                <span className="flex items-center gap-3">
                  {change && (
                    <span className={`inline-flex items-center gap-1 text-xs ${change.cls}`}>
                      <change.icon className="w-3.5 h-3.5" aria-hidden />
                      {change.text}
                    </span>
                  )}
                  <LevelChip level={a.level} confidence={a.confidence} />
                </span>
              </div>
              <AreaBar pct={a.pct} level={a.level} label={a.label} />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
