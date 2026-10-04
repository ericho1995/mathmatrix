'use client'

import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { ELEMENTS, byZ, ionSymbol, shells, type ElementKind } from '@/lib/lab/elements'
import Challenges from './Challenges'

const P_MAX = 20
const N_MAX = 24
const E_MAX = 20

const KIND: Record<ElementKind, { label: string; cell: string }> = {
  metal: { label: 'Metal', cell: 'bg-amber-50 border-amber-200' },
  nonmetal: { label: 'Non-metal', cell: 'bg-teal-50 border-teal-200' },
  metalloid: { label: 'Metalloid', cell: 'bg-grape-50 border-grape-200' },
  noble: { label: 'Noble gas', cell: 'bg-brand-50 border-brand-200' },
}

/**
 * Build an atom from protons, neutrons and electrons and see what it is: the
 * element (set by the protons), the isotope (protons + neutrons), and whether
 * it is a neutral atom or an ion (protons − electrons), with its electron
 * shells drawn and the first 20 elements of the periodic table to pick from.
 */
export default function AtomBuilder() {
  const [p, setP] = useState(6)
  const [n, setN] = useState(6)
  const [e, setE] = useState(6)
  const el = byZ(p)
  const mass = p + n
  const charge = p - e
  const config = shells(e)
  const common = el ? el.mass - el.z : null

  const pick = (z: number) => {
    const x = byZ(z)!
    setP(z)
    setN(x.mass - z)
    setE(z)
  }

  const challenges = [
    {
      id: 'o16',
      task: 'Build a neutral atom of oxygen-16.',
      hint: 'Oxygen is element 8. The 16 is protons + neutrons.',
      met: p === 8 && n === 8 && e === 8,
      why: 'Every oxygen atom has 8 protons: that is what makes it oxygen (its atomic number). Its mass number, 16, counts protons and neutrons together, so it has 8 neutrons. A neutral atom has as many electrons as protons: 8, arranged in shells as 2, 6.',
    },
    {
      id: 'c14',
      task: 'Now build carbon-14, the isotope used to date fossils.',
      hint: 'Same element, different number of neutrons.',
      met: p === 6 && n === 8 && e === 6,
      why: 'Isotopes of an element have the same number of protons but different numbers of neutrons. Carbon-12 has 6 neutrons; carbon-14 has 8. Carbon-14 is radioactive and decays slowly, which is how scientists date things that were once alive.',
    },
    {
      id: 'na+',
      task: 'Build a sodium ion, Na⁺ (from sodium-23).',
      hint: 'An ion has a different number of electrons from protons.',
      met: p === 11 && n === 12 && e === 10,
      why: 'Sodium (2, 8, 1) loses its single outer electron, leaving a full outer shell (2, 8). With 11 positive protons and only 10 negative electrons, it has a charge of +1.',
    },
    {
      id: 'cl-',
      task: 'Build a chloride ion, Cl⁻ (from chlorine-35).',
      met: p === 17 && n === 18 && e === 18,
      why: 'Chlorine (2, 8, 7) gains one electron to fill its outer shell (2, 8, 8). With 17 protons and 18 electrons it has a charge of −1. Na⁺ and Cl⁻ attract each other: together they make sodium chloride, table salt.',
    },
    {
      id: 'ca',
      task: 'Build a neutral atom of the element in period 4, group 2.',
      hint: 'Use the periodic table below: periods are rows, groups are columns.',
      met: p === 20 && n === 20 && e === 20,
      why: 'Calcium is in period 4 because its electrons fill four shells (2, 8, 8, 2), and in group 2 because it has 2 electrons in its outer shell. That is the pattern of the periodic table: the period gives the number of shells and the group the outer electrons.',
    },
  ]

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border-2 border-line bg-white p-3">
            <AtomDrawing p={p} n={n} config={config} />
          </div>
          <div className="rounded-2xl border-2 border-line bg-white p-5 flex flex-col">
            <div className="flex items-center gap-4">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-b-4 border-line bg-sky">
                <span className="absolute left-2 top-1 text-sm font-bold text-gray-600">{mass}</span>
                <span className="absolute left-2 bottom-1 text-sm font-bold text-gray-600">{p}</span>
                <span className="text-4xl font-extrabold text-ink">{el ? ionSymbol(el.symbol, charge) : '?'}</span>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-ink capitalize">{el ? `${el.name}-${mass}` : 'No element'}</p>
                <p className={`font-bold ${charge === 0 ? 'text-teal-600' : 'text-amber-600'}`}>
                  {charge === 0 ? 'Neutral atom' : charge > 0 ? `Positive ion (charge ${'+' + charge})` : `Negative ion (charge ${'−' + -charge})`}
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-500">Atomic number</dt>
              <dd className="font-bold text-ink">{p}</dd>
              <dt className="text-gray-500">Mass number</dt>
              <dd className="font-bold text-ink">{mass}</dd>
              <dt className="text-gray-500">Electron shells</dt>
              <dd className="font-bold text-ink">{config.length ? config.join(', ') : 'none'}</dd>
              <dt className="text-gray-500">Most common isotope</dt>
              <dd className="font-bold text-ink capitalize">{el ? `${el.name}-${el.mass}` : '–'}</dd>
            </dl>
            {el && common !== null && n !== common && (
              <p className="mt-3 text-sm text-gray-600">
                {Math.abs(n - common) > 2 ? 'An unusual isotope: ' : 'An isotope: '}
                {el.name}-{el.mass} has {common} neutrons.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Counter label="Protons" colour="bg-[#E2574C]" value={p} min={1} max={P_MAX} onChange={setP} />
          <Counter label="Neutrons" colour="bg-gray-400" value={n} min={0} max={N_MAX} onChange={setN} />
          <Counter label="Electrons" colour="bg-brand-500" value={e} min={0} max={E_MAX} onChange={setE} />
        </div>

        <PeriodicTable current={p} onPick={pick} />
      </div>

      <Challenges items={challenges} />
    </div>
  )
}

function Counter({ label, colour, value, min, max, onChange }: { label: string; colour: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-2xl border-2 border-line bg-white p-3">
      <p className="flex items-center gap-2 text-sm font-bold text-gray-600">
        <span className={`inline-block h-3 w-3 rounded-full ${colour}`} aria-hidden />
        {label}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button type="button" className="btn-secondary h-11 w-11 !p-0 flex items-center justify-center" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`One fewer ${label.toLowerCase().slice(0, -1)}`}>
          <Minus className="w-5 h-5" aria-hidden />
        </button>
        <span className="text-3xl font-extrabold text-ink tabular-nums" aria-live="polite">
          {value}
        </span>
        <button type="button" className="btn-primary h-11 w-11 !p-0 flex items-center justify-center" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`One more ${label.toLowerCase().slice(0, -1)}`}>
          <Plus className="w-5 h-5" aria-hidden />
        </button>
      </div>
    </div>
  )
}

/** The nucleus as a packed cluster, and electrons circling on their shells. */
function AtomDrawing({ p, n, config }: { p: number; n: number; config: number[] }) {
  const size = 340
  const c = size / 2
  // Protons and neutrons spread evenly through the cluster.
  const nucleons = useMemo(() => {
    const total = p + n
    const kinds: ('p' | 'n')[] = []
    let pp = 0
    for (let i = 0; i < total; i++) {
      const wantP = Math.round(((i + 1) * p) / total)
      if (pp < wantP) {
        kinds.push('p')
        pp++
      } else kinds.push('n')
    }
    return kinds.map((k, i) => {
      const r = 7 * Math.sqrt(i + 0.5)
      const a = i * 2.39996
      return { k, x: c + r * Math.cos(a), y: c + r * Math.sin(a) }
    })
  }, [p, n, c])
  const SHELL_R = [76, 106, 136, 162]
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto" role="img" aria-label={`An atom with ${p} protons, ${n} neutrons and electrons arranged ${config.join(', ') || 'none'}`}>
      {config.map((count, k) => {
        const r = SHELL_R[k]
        return (
          <g key={k} style={{ transformOrigin: `${c}px ${c}px`, transformBox: 'view-box', animation: `lab-spin ${14 + k * 8}s linear infinite` }} className="motion-reduce:[animation:none]">
            <circle cx={c} cy={c} r={r} fill="none" stroke="#C9D8E6" strokeWidth={2} strokeDasharray="4 5" />
            {Array.from({ length: count }, (_, i) => {
              const a = (i / count) * Math.PI * 2 - Math.PI / 2
              return <circle key={i} cx={c + r * Math.cos(a)} cy={c + r * Math.sin(a)} r={8} fill="#2F8FEA" stroke="#165EA6" strokeWidth={1.5} />
            })}
          </g>
        )
      })}
      {nucleons.map((q, i) => (
        <circle key={i} cx={q.x} cy={q.y} r={7.5} fill={q.k === 'p' ? '#E2574C' : '#A3A3A3'} stroke={q.k === 'p' ? '#B23B32' : '#7A7A7A'} strokeWidth={1.2} />
      ))}
    </svg>
  )
}

function PeriodicTable({ current, onPick }: { current: number; onPick: (z: number) => void }) {
  return (
    <div className="rounded-2xl border-2 border-line bg-white p-3">
      <p className="mb-2 text-sm font-bold text-gray-600">The first 20 elements: tap one to build its most common atom</p>
      <div className="overflow-x-auto">
        <div className="grid min-w-[36rem] gap-1" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
          {ELEMENTS.map(x => (
            <button
              key={x.z}
              type="button"
              onClick={() => onPick(x.z)}
              style={{ gridColumn: x.group, gridRow: x.period }}
              className={`rounded-lg border-2 px-0.5 py-1 text-center leading-tight transition-transform hover:-translate-y-0.5 ${KIND[x.kind].cell} ${x.z === current ? 'ring-2 ring-brand-500 ring-offset-1' : ''}`}
              aria-label={`${x.name}, element ${x.z}`}
              aria-pressed={x.z === current}
            >
              <span className="block text-[10px] text-gray-500">{x.z}</span>
              <span className="block text-sm font-extrabold text-ink">{x.symbol}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
        {Object.values(KIND).map(k => (
          <span key={k.label} className="flex items-center gap-1">
            <span className={`inline-block h-3 w-3 rounded border-2 ${k.cell}`} aria-hidden />
            {k.label}
          </span>
        ))}
      </div>
    </div>
  )
}
