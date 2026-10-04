'use client'

import { useEffect, useState } from 'react'
import { Check, Target } from 'lucide-react'

export interface Challenge {
  id: string
  task: string
  /** True when what is on screen meets the task. */
  met: boolean
  /** Shown once it is solved: the science behind it. */
  why: string
  hint?: string
}

/**
 * Goals for a lab, worked through in order. A goal is solved the moment the
 * lab's state meets it (no Check button to press), and stays solved; its
 * explanation appears straight away, the way a tutor would say it.
 */
export default function Challenges({ items, onAllDone }: { items: Challenge[]; onAllDone?: () => void }) {
  const [solved, setSolved] = useState<Set<string>>(new Set())
  const current = items.find(c => !solved.has(c.id))

  useEffect(() => {
    if (current?.met) {
      setSolved(s => new Set(s).add(current.id))
    }
  }, [current])

  useEffect(() => {
    if (solved.size === items.length) onAllDone?.()
  }, [solved, items.length, onAllDone])

  return (
    <div className="rounded-2xl border-2 border-line bg-white p-4">
      <p className="flex items-center gap-2 font-bold text-ink">
        <Target className="w-5 h-5 text-brand-600" aria-hidden />
        Challenges
        <span className="ml-auto text-sm font-bold text-gray-500">
          {solved.size} of {items.length}
        </span>
      </p>
      <ol className="mt-3 space-y-2">
        {items.map((c, i) => {
          const done = solved.has(c.id)
          const isCurrent = c.id === current?.id
          return (
            <li
              key={c.id}
              className={`rounded-xl border-2 px-3 py-2 text-sm transition-colors ${done ? 'border-teal-200 bg-teal-50' : isCurrent ? 'border-brand-200 bg-brand-50' : 'border-line bg-white opacity-60'}`}
            >
              <div className="flex items-start gap-2">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-teal-500 text-white' : 'bg-white border-2 border-line text-gray-500'}`}>
                  {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden /> : i + 1}
                </span>
                <div>
                  <p className={`font-bold ${done ? 'text-teal-600' : 'text-ink'}`}>{c.task}</p>
                  {done && <p className="mt-1 text-gray-700">{c.why}</p>}
                  {!done && isCurrent && c.hint && <p className="mt-1 text-gray-500">Hint: {c.hint}</p>}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
      {solved.size === items.length && <p className="mt-3 text-sm font-bold text-teal-600">All done. Try changing things to see what else happens.</p>}
    </div>
  )
}
