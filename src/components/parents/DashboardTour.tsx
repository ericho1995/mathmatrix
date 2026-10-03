'use client'

import { useRef, useState } from 'react'

export interface TourTab {
  id: string
  label: string
  icon: React.ReactNode
  /** What this view is, in a sentence or two. */
  intro: React.ReactNode
  /** How a parent uses it. */
  use: string
  /** The view itself, drawn with sample data. */
  panel: React.ReactNode
}

/**
 * The parent's dashboard, one view at a time: tabs on the left (a scrolling
 * row on a phone), and the real component on the right with what it shows and
 * how to use it. The panels are rendered on the server and only switched here.
 */
export default function DashboardTour({ tabs }: { tabs: TourTab[] }) {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKey(e: React.KeyboardEvent, i: number) {
    const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (i + step + tabs.length) % tabs.length
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-6 lg:gap-10 items-start">
      <div role="tablist" aria-label="Dashboard views" aria-orientation="vertical" className="flex lg:flex-col gap-2 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 pb-1 lg:sticky lg:top-24">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={el => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`tour-tab-${t.id}`}
            aria-selected={i === active}
            aria-controls={`tour-panel-${t.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={e => onKey(e, i)}
            className={`shrink-0 flex items-center gap-3 rounded-2xl border-2 border-b-4 px-4 py-3 text-left font-bold whitespace-nowrap lg:whitespace-normal transition-colors ${
              i === active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className={`inline-flex w-9 h-9 rounded-xl items-center justify-center shrink-0 ${i === active ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`tour-panel-${t.id}`} aria-labelledby={`tour-tab-${t.id}`} hidden={i !== active}>
          <div className="text-lg text-gray-700 leading-relaxed mb-3">{t.intro}</div>
          <p className="text-sm font-bold text-teal-600 mb-6">How to use it: <span className="font-semibold text-gray-600">{t.use}</span></p>
          {/* A picture of the product, not the product: inert, so nothing in it can be clicked or tabbed to (set directly — React 18 has no inert prop). */}
          <div className="relative" ref={el => el?.setAttribute('inert', '')}>
            <div className="pointer-events-none select-none">{t.panel}</div>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">Sample for a made-up Grade 5 student, drawn with the real dashboard.</p>
        </div>
      ))}
    </div>
  )
}
