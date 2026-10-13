'use client'

import { useState } from 'react'
import { Atom, Gauge, Zap } from 'lucide-react'
import AtomBuilder from './AtomBuilder'
import CircuitLab from './CircuitLab'
import MotionLab from './MotionLab'

const LABS = [
  { id: 'atoms', title: 'Build an atom', area: 'Chemistry', years: 'Years 8–10 · VCE Unit 1', icon: Atom, blurb: 'Protons, neutrons and electrons: elements, isotopes, ions and the periodic table.' },
  { id: 'circuits', title: 'Circuit lab', area: 'Physics', years: 'Years 9–10 · VCE Unit 1', icon: Zap, blurb: "Series and parallel circuits, Ohm's law and why some bulbs glow brighter." },
  { id: 'motion', title: 'Motion graphs', area: 'Physics', years: 'Years 9–10 · VCE Unit 2', icon: Gauge, blurb: 'Move the bird and watch distance–time and velocity–time graphs draw themselves.' },
] as const

/** The three labs behind one row of tabs; only the open one is mounted. */
export default function ScienceLab() {
  const [open, setOpen] = useState<(typeof LABS)[number]['id']>('atoms')
  const lab = LABS.find(l => l.id === open)!
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3" role="tablist" aria-label="Labs">
        {LABS.map(l => {
          const Icon = l.icon
          const on = l.id === open
          return (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setOpen(l.id)}
              className={`rounded-2xl border-2 border-b-4 p-4 text-left transition-colors ${on ? 'border-brand-500 bg-white' : 'border-line bg-white/70 hover:bg-white'}`}
            >
              <span className="flex items-center gap-2">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${on ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-600'}`}>
                  <Icon className="w-5 h-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-extrabold text-ink">{l.title}</span>
                  <span className="block text-xs font-bold text-gray-500">
                    {l.area} · {l.years}
                  </span>
                </span>
              </span>
              <span className="mt-2 block text-sm text-gray-600">{l.blurb}</span>
            </button>
          )
        })}
      </div>
      <section className="mt-6" role="tabpanel" aria-label={lab.title}>
        {open === 'atoms' && <AtomBuilder />}
        {open === 'circuits' && <CircuitLab />}
        {open === 'motion' && <MotionLab />}
      </section>
    </div>
  )
}
