'use client'

import { useEffect, useState } from 'react'
import Challenges from './Challenges'

type Mode = 'series' | 'parallel'
type Pt = [number, number]

const VOLTAGES = [1.5, 3, 4.5, 6, 9, 12]
// The frame of the circuit drawing.
const L = 70, R = 450, T = 60, B = 250, CELL_TOP = 147, CELL_BOT = 163, BRANCH = 330
const SW_A = 140, SW_B = 182

/**
 * A battery, a switch, an ammeter and two bulbs, in series or in parallel.
 * Everything is worked out with Ohm's law (I = V ÷ R) as the controls move:
 * the current in each part, the voltage across each bulb and how brightly it
 * glows (its power, P = I²R). Moving dots show the current, faster where more
 * flows, travelling from + to − as conventional current does.
 */
export default function CircuitLab() {
  const [mode, setMode] = useState<Mode>('series')
  const [v, setV] = useState(6)
  const [r1, setR1] = useState(10)
  const [r2, setR2] = useState(10)
  const [closed, setClosed] = useState(false)
  const [t, setT] = useState(0)

  useEffect(() => {
    if (!closed) return
    let raf = 0
    const t0 = performance.now()
    const tick = () => {
      setT((performance.now() - t0) / 1000)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [closed])

  // Ohm's law, part by part.
  const on = closed ? 1 : 0
  const series = mode === 'series'
  const i1 = on * (series ? v / (r1 + r2) : v / r1)
  const i2 = on * (series ? v / (r1 + r2) : v / r2)
  const total = series ? i1 : i1 + i2
  const v1 = i1 * r1
  const v2 = i2 * r2
  const p1 = i1 * i1 * r1
  const p2 = i2 * i2 * r2

  const paths: { pts: Pt[]; i: number }[] = series
    ? [{ pts: [[L, CELL_TOP], [L, T], [R, T], [R, B], [L, B], [L, CELL_BOT]], i: total }]
    : [
        { pts: [[L, CELL_TOP], [L, T], [BRANCH, T]], i: total },
        { pts: [[BRANCH, T], [BRANCH, B]], i: i1 },
        { pts: [[BRANCH, T], [R, T], [R, B], [BRANCH, B]], i: i2 },
        { pts: [[BRANCH, B], [L, B], [L, CELL_BOT]], i: total },
      ]

  const bulb1At: Pt = series ? [BRANCH, T] : [BRANCH, (T + B) / 2]
  const bulb2At: Pt = [R, (T + B) / 2]
  const near = (a: number, b: number) => Math.abs(a - b) < 1e-9

  const challenges = [
    {
      id: 'close',
      task: 'Close the switch to light the bulbs.',
      hint: 'Tap the switch in the top wire.',
      met: closed,
      why: 'Current only flows around a complete loop. With the switch open there is a gap, so no charge can flow and the bulbs stay dark.',
    },
    {
      id: 'half',
      task: 'In series, make the ammeter read exactly 0.50 A.',
      hint: 'In series, I = V ÷ (R₁ + R₂).',
      met: closed && series && near(total, 0.5),
      why: `In a series circuit the same current flows through everything, and the resistances add: I = V ÷ (R₁ + R₂). Here ${fmtV(v)} ÷ ${r1 + r2} Ω = 0.50 A.`,
    },
    {
      id: 'bright-series',
      task: 'Still in series, make bulb 1 clearly brighter than bulb 2.',
      hint: 'Both bulbs carry the same current. What else changes the power?',
      met: closed && series && p1 > p2 * 1.2,
      why: 'In series both bulbs carry the same current, so the one with the larger resistance has more voltage across it and turns more energy into light (P = I²R). The bigger resistance glows brighter.',
    },
    {
      id: 'bright-parallel',
      task: 'Switch to parallel, then make bulb 2 clearly brighter than bulb 1.',
      met: closed && !series && p2 > p1 * 1.2,
      why: 'In parallel each bulb has the full battery voltage across it, so the bulb with the smaller resistance draws more current and is brighter (P = V² ÷ R). That is the opposite of series.',
    },
    {
      id: 'three',
      task: 'In parallel, make the ammeter read exactly 3.00 A.',
      hint: 'The branch currents add up: I = V ÷ R₁ + V ÷ R₂.',
      met: closed && !series && near(total, 3),
      why: `In parallel the current splits between the branches and adds back together: ${fmtA(i1)} + ${fmtA(i2)} = 3.00 A. Adding a branch always increases the total current, which is why too many appliances on one power board can overload it.`,
    },
  ]

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        <div className="rounded-2xl border-2 border-line bg-white p-3">
          <svg viewBox="0 0 520 310" className="w-full h-auto" role="img" aria-label={`A ${mode} circuit with a ${fmtV(v)} battery and two bulbs of ${r1} and ${r2} ohms. The switch is ${closed ? 'closed' : 'open'}.`}>
            {/* Wires, with a gap where the switch is. */}
            <g fill="none" stroke="#3C3C3C" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
              <polyline points={pts([[L, CELL_TOP], [L, T], [SW_A, T]])} />
              <polyline points={pts([[SW_B, T], [R, T], [R, B], [L, B], [L, CELL_BOT]])} />
              {!series && <line x1={BRANCH} y1={T} x2={BRANCH} y2={B} />}
            </g>
            {!series && (
              <>
                <circle cx={BRANCH} cy={T} r={5} fill="#3C3C3C" />
                <circle cx={BRANCH} cy={B} r={5} fill="#3C3C3C" />
              </>
            )}

            {/* Moving charge. */}
            {closed &&
              paths.map((path, k) => {
                const len = pathLength(path.pts)
                const gap = 26
                const speed = Math.min(170, 26 * path.i)
                const phase = (t * speed) % gap
                return Array.from({ length: Math.floor(len / gap) + 1 }, (_, j) => {
                  const d = phase + j * gap
                  if (d > len) return null
                  const [x, y] = pointAt(path.pts, d)
                  return <circle key={`${k}-${j}`} cx={x} cy={y} r={3.2} fill="#FFC530" stroke="#8A6100" strokeWidth={0.8} />
                })
              })}

            {/* The battery: long plate +, short thick plate −. */}
            <rect x={L - 22} y={CELL_TOP} width={44} height={CELL_BOT - CELL_TOP} fill="white" />
            <line x1={L - 20} y1={CELL_TOP} x2={L + 20} y2={CELL_TOP} stroke="#3C3C3C" strokeWidth={3} />
            <line x1={L - 10} y1={CELL_BOT} x2={L + 10} y2={CELL_BOT} stroke="#3C3C3C" strokeWidth={7} />
            <text x={L + 26} y={CELL_TOP + 4} fontSize={14} fontWeight={800} fill="#3C3C3C">+</text>
            <text x={L - 28} y={(CELL_TOP + CELL_BOT) / 2 + 5} fontSize={15} fontWeight={800} fill="#1D74CC" textAnchor="end">{fmtV(v)}</text>

            {/* The switch: tap to open or close. */}
            <g role="switch" aria-checked={closed} aria-label="Switch" tabIndex={0} className="cursor-pointer" onClick={() => setClosed(c => !c)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setClosed(c => !c))}>
              <rect x={SW_A - 14} y={T - 40} width={SW_B - SW_A + 28} height={56} fill="transparent" />
              <circle cx={SW_A} cy={T} r={5} fill="#3C3C3C" />
              <circle cx={SW_B} cy={T} r={5} fill="#3C3C3C" />
              <line x1={SW_A} y1={T} x2={closed ? SW_B : SW_B - 6} y2={closed ? T : T - 26} stroke={closed ? '#2E7D00' : '#C76400'} strokeWidth={4} strokeLinecap="round" />
              <text x={(SW_A + SW_B) / 2} y={T - 30} fontSize={12} fontWeight={800} fill={closed ? '#2E7D00' : '#C76400'} textAnchor="middle">{closed ? 'ON' : 'OFF'}</text>
            </g>

            {/* The ammeter reads the total current. */}
            <circle cx={240} cy={T} r={17} fill="white" stroke="#3C3C3C" strokeWidth={3} />
            <text x={240} y={T + 6} fontSize={17} fontWeight={800} fill="#3C3C3C" textAnchor="middle">A</text>
            <text x={240} y={T - 26} fontSize={15} fontWeight={800} fill="#1D74CC" textAnchor="middle">{fmtA(total)}</text>

            <Bulb at={bulb1At} power={p1} label="1" />
            <Bulb at={bulb2At} power={p2} label="2" />
            <Reading at={bulb1At} r={r1} i={i1} v={v1} />
            <Reading at={bulb2At} r={r2} i={i2} v={v2} />
          </svg>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-line bg-white p-3">
            <p className="text-sm font-bold text-gray-600">Connect the bulbs in</p>
            <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Circuit type">
              {(['series', 'parallel'] as const).map(m => (
                <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={`rounded-xl border-2 border-b-4 px-3 py-2 font-bold capitalize ${mode === m ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line bg-white text-gray-600'}`}>
                  {m}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm font-bold text-gray-600">Battery</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {VOLTAGES.map(x => (
                <button key={x} type="button" aria-pressed={v === x} onClick={() => setV(x)} className={`rounded-lg border-2 px-2.5 py-1 text-sm font-bold ${v === x ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line text-gray-600'}`}>
                  {fmtV(x)}
                </button>
              ))}
            </div>
            <button type="button" className={`mt-3 w-full ${closed ? 'btn-secondary' : 'btn-primary'}`} onClick={() => setClosed(c => !c)}>
              {closed ? 'Open the switch' : 'Close the switch'}
            </button>
          </div>
          <div className="rounded-2xl border-2 border-line bg-white p-3 space-y-3">
            <Slider label="Bulb 1 resistance" value={r1} onChange={setR1} />
            <Slider label="Bulb 2 resistance" value={r2} onChange={setR2} />
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <dt className="text-gray-500">Total current</dt>
              <dd className="font-bold text-ink">{fmtA(total)}</dd>
              <dt className="text-gray-500">Bulb 1 power</dt>
              <dd className="font-bold text-ink">{p1.toFixed(2)} W</dd>
              <dt className="text-gray-500">Bulb 2 power</dt>
              <dd className="font-bold text-ink">{p2.toFixed(2)} W</dd>
            </dl>
          </div>
        </div>
      </div>

      <Challenges items={challenges} />
    </div>
  )
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm font-bold text-gray-600">
        {label}
        <span className="text-ink">{value} Ω</span>
      </span>
      <input type="range" min={1} max={20} step={1} value={value} onChange={e => onChange(Number(e.target.value))} className="mt-1 w-full accent-brand-600" />
    </label>
  )
}

/** A lamp symbol (a circle with a cross) that glows with its power. */
function Bulb({ at: [x, y], power, label }: { at: Pt; power: number; label: string }) {
  const glow = Math.min(1, Math.log10(1 + 4 * power) / Math.log10(1 + 4 * 20))
  return (
    <g>
      {glow > 0 && <circle cx={x} cy={y} r={20 + 34 * glow} fill="url(#lab-glow)" opacity={0.25 + 0.75 * glow} />}
      <defs>
        <radialGradient id="lab-glow">
          <stop offset="0%" stopColor="#FFE07A" stopOpacity={1} />
          <stop offset="100%" stopColor="#FFE07A" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={18} fill={glow > 0 ? `rgba(255, 197, 48, ${0.25 + 0.75 * glow})` : 'white'} stroke="#3C3C3C" strokeWidth={3} />
      <line x1={x - 12} y1={y - 12} x2={x + 12} y2={y + 12} stroke="#3C3C3C" strokeWidth={2.5} />
      <line x1={x - 12} y1={y + 12} x2={x + 12} y2={y - 12} stroke="#3C3C3C" strokeWidth={2.5} />
      <text x={x + 24} y={y - 18} fontSize={12} fontWeight={800} fill="#3C3C3C">{label}</text>
    </g>
  )
}

/** A bulb's resistance, current and voltage, centred under it. */
function Reading({ at: [x, y], r, i, v }: { at: Pt; r: number; i: number; v: number }) {
  return (
    <text x={x} y={y + 37} fontSize={13} fill="#555" textAnchor="middle">
      <tspan x={x} fontWeight={800} fill="#3C3C3C">{r} Ω</tspan>
      <tspan x={x} dy={15}>{fmtA(i)} · {fmtV(v)}</tspan>
    </text>
  )
}

const fmtA = (i: number) => `${i.toFixed(2)} A`
const fmtV = (v: number) => `${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)} V`
const pts = (p: Pt[]) => p.map(q => q.join(',')).join(' ')

function pathLength(p: Pt[]): number {
  let s = 0
  for (let k = 1; k < p.length; k++) s += Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1])
  return s
}

function pointAt(p: Pt[], d: number): Pt {
  for (let k = 1; k < p.length; k++) {
    const seg = Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1])
    if (d <= seg) {
      const f = seg ? d / seg : 0
      return [p[k - 1][0] + f * (p[k][0] - p[k - 1][0]), p[k - 1][1] + f * (p[k][1] - p[k - 1][1])]
    }
    d -= seg
  }
  return p[p.length - 1]
}
