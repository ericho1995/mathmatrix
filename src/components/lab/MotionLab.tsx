'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import Bird from '@/components/brand/Bird'
import Challenges from './Challenges'

const TRACK = 20 // metres
const DURATION = 10 // seconds
const PASS = 1.5 // metres: the average gap to a target that counts as a match

interface Target {
  id: string
  task: string
  hint: string
  why: string
  at: (t: number) => number
}

const TARGETS: Target[] = [
  {
    id: 'steady',
    task: 'Walk away from the start at a steady speed, reaching 20 m at 10 s.',
    hint: 'Press Record, then drag the bird along the track at an even pace.',
    at: t => 2 * t,
    why: 'A steady speed makes a straight, sloping distance–time line. Its slope is the speed: 20 m in 10 s is 2 m/s, and the velocity–time graph is a flat line at 2 m/s.',
  },
  {
    id: 'wait-return',
    task: 'Stand still at 10 m for 4 seconds, then walk back to the start by 8 s.',
    hint: 'Start the bird at 10 m before you press Record.',
    at: t => (t < 4 ? 10 : t < 8 ? 10 - 2.5 * (t - 4) : 0),
    why: 'Standing still makes a flat distance–time line (no change in distance) and zero on the velocity–time graph. Walking back towards the start makes the line slope down, and the velocity goes negative: about −2.5 m/s here.',
  },
  {
    id: 'speed-up',
    task: 'Speed up: start slowly and go faster and faster, reaching 20 m at 10 s.',
    hint: 'Move only a little at first, then more and more each second.',
    at: t => 0.2 * t * t,
    why: 'Speeding up makes the distance–time graph curve upwards, getting steeper as the speed grows. The velocity–time graph slopes up: that slope is the acceleration, here 0.4 m/s every second.',
  },
]

interface Run {
  target: string
  samples: { t: number; x: number }[]
  error: number
}

/**
 * Move the bird along a 20 m track while the clock runs, and watch its
 * distance–time and velocity–time graphs draw themselves. Each challenge
 * shows a target graph to match; a run within 1.5 m of it on average counts.
 */
export default function MotionLab() {
  const [x, setX] = useState(0)
  const xRef = useRef(0)
  const [recording, setRecording] = useState(false)
  const [samples, setSamples] = useState<{ t: number; x: number }[]>([])
  const [runs, setRuns] = useState<Run[]>([])
  const [targetIdx, setTargetIdx] = useState(0)
  const target = TARGETS[targetIdx]
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const move = useCallback((v: number) => {
    const c = Math.max(0, Math.min(TRACK, v))
    xRef.current = c
    setX(c)
  }, [])

  // The clock: sample the position every frame for ten seconds.
  useEffect(() => {
    if (!recording) return
    let raf = 0
    const t0 = performance.now()
    const got: { t: number; x: number }[] = []
    const tick = () => {
      const t = (performance.now() - t0) / 1000
      got.push({ t: Math.min(t, DURATION), x: xRef.current })
      setSamples([...got])
      if (t >= DURATION) {
        setRecording(false)
        const error = got.reduce((s, p) => s + Math.abs(p.x - target.at(p.t)), 0) / got.length
        setRuns(r => [...r, { target: target.id, samples: got, error }])
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [recording, target])

  const last = runs[runs.length - 1]
  const fromPointer = (clientX: number) => {
    const el = trackRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    move(((clientX - r.left) / r.width) * TRACK)
  }

  const challenges = TARGETS.map(tg => ({
    id: tg.id,
    task: tg.task,
    hint: tg.hint,
    why: tg.why,
    met: runs.some(r => r.target === tg.id && r.error < PASS),
  }))
  // Once the target on screen is matched, the next Record moves on to the first unmatched one.
  const currentMet = challenges[targetIdx].met
  const nextIdx = challenges.findIndex(c => !c.met)
  const record = () => {
    if (currentMet && nextIdx >= 0) setTargetIdx(nextIdx)
    setSamples([])
    setRecording(true)
  }

  const velocity = velocities(samples)
  const targetPts = Array.from({ length: 101 }, (_, k) => ({ t: (k / 100) * DURATION, x: target.at((k / 100) * DURATION) }))
  const targetV = velocities(targetPts)

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        <div className="rounded-2xl border-2 border-line bg-white p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-primary inline-flex items-center gap-2" disabled={recording} onClick={record}>
              <Play className="w-4 h-4" aria-hidden />
              {recording ? 'Recording…' : currentMet && nextIdx >= 0 ? `Record target ${nextIdx + 1}` : 'Record 10 seconds'}
            </button>
            <button type="button" className="btn-secondary inline-flex items-center gap-2" disabled={recording} onClick={() => { move(0); setSamples([]) }}>
              <RotateCcw className="w-4 h-4" aria-hidden />
              Back to the start
            </button>
            <label className="text-sm font-bold text-gray-600">
              Target{' '}
              <select className="ml-1 rounded-lg border-2 border-line px-2 py-1 font-bold text-ink" value={targetIdx} disabled={recording} onChange={e => { setTargetIdx(Number(e.target.value)); setSamples([]) }}>
                {TARGETS.map((tg, k) => (
                  <option key={tg.id} value={k}>
                    {k + 1}. {['Steady speed', 'Wait, then come back', 'Speed up'][k]}
                  </option>
                ))}
              </select>
            </label>
            {recording && <span className="font-bold text-brand-600 tabular-nums">{(samples[samples.length - 1]?.t ?? 0).toFixed(1)} s</span>}
          </div>

          {/* The track: drag the bird, or use the slider below. */}
          <div
            ref={trackRef}
            className="relative mx-8 mt-5 h-28 touch-none select-none"
            onPointerDown={e => {
              dragging.current = true
              try {
                ;(e.target as Element).setPointerCapture?.(e.pointerId)
              } catch {}
              fromPointer(e.clientX)
            }}
            onPointerMove={e => dragging.current && fromPointer(e.clientX)}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
          >
            <div className="absolute inset-x-0 bottom-6 h-3 rounded-full bg-sun-100 border-2 border-sun-200" />
            {Array.from({ length: TRACK / 2 + 1 }, (_, k) => (
              <span key={k} className="absolute bottom-0 -translate-x-1/2 text-[11px] font-bold text-gray-500" style={{ left: `${(k * 2 * 100) / TRACK}%` }}>
                {k * 2}
              </span>
            ))}
            <div className="absolute bottom-7 -translate-x-1/2 w-20 h-20 cursor-grab active:cursor-grabbing" style={{ left: `${(x / TRACK) * 100}%` }}>
              <Bird pose="read" className="w-full h-full pointer-events-none" />
            </div>
          </div>
          <label className="mt-2 block">
            <span className="sr-only">Position on the track</span>
            <input type="range" min={0} max={TRACK} step={0.1} value={x} onChange={e => move(Number(e.target.value))} className="w-full accent-brand-600" />
          </label>
          <p className="mt-1 text-sm text-gray-600">
            Distance from the start: <span className="font-bold text-ink tabular-nums">{x.toFixed(1)} m</span>
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Graph
            title="Distance–time"
            yLabel="Distance (m)"
            yMin={0}
            yMax={TRACK}
            yStep={5}
            line={samples.map(s => [s.t, s.x])}
            target={targetPts.map(s => [s.t, s.x])}
          />
          <Graph
            title="Velocity–time"
            yLabel="Velocity (m/s)"
            yMin={-5}
            yMax={5}
            yStep={2.5}
            line={velocity.map(s => [s.t, s.x])}
            target={targetV.map(s => [s.t, s.x])}
          />
        </div>
        {last && !recording && (
          <p className={`rounded-xl px-4 py-3 text-sm font-bold ${last.error < PASS ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'}`}>
            {last.error < PASS
              ? `A match: on average your run was ${last.error.toFixed(1)} m from the target.${nextIdx >= 0 ? ' Press Record for the next target.' : ''}`
              : `On average your run was ${last.error.toFixed(1)} m from the target. Get within ${PASS} m to match it; watch the dashed line and try again.`}
          </p>
        )}
      </div>

      <Challenges items={challenges} />
    </div>
  )
}

/** Velocity from positions: the change over the last 0.4 s, so a wobbly hand gives a readable line. */
function velocities(s: { t: number; x: number }[]): { t: number; x: number }[] {
  const out: { t: number; x: number }[] = []
  let j = 0
  for (let k = 0; k < s.length; k++) {
    while (j < k - 1 && s[k].t - s[j].t > 0.4) j++ // the previous sample at least, if frames came slowly
    const dt = s[k].t - s[j].t
    if (dt > 0.15) out.push({ t: s[k].t, x: Math.max(-5, Math.min(5, (s[k].x - s[j].x) / dt)) })
  }
  return out
}

function Graph({ title, yLabel, yMin, yMax, yStep, line, target }: { title: string; yLabel: string; yMin: number; yMax: number; yStep: number; line: [number, number][]; target: [number, number][] }) {
  const W = 340, H = 220, l = 44, r = 10, t = 14, b = 34
  const sx = (v: number) => l + (v / DURATION) * (W - l - r)
  const sy = (v: number) => t + (1 - (v - yMin) / (yMax - yMin)) * (H - t - b)
  const ticks: number[] = []
  for (let v = yMin; v <= yMax + 1e-9; v += yStep) ticks.push(v)
  const poly = (p: [number, number][]) => p.map(([a, c]) => `${sx(a).toFixed(1)},${sy(c).toFixed(1)}`).join(' ')
  return (
    <div className="rounded-2xl border-2 border-line bg-white p-3">
      <p className="text-sm font-bold text-ink">{title}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`${title} graph`}>
        {ticks.map(v => (
          <g key={v}>
            <line x1={l} y1={sy(v)} x2={W - r} y2={sy(v)} stroke={v === 0 ? '#9CA3AF' : '#EEE'} strokeWidth={v === 0 ? 1.5 : 1} />
            <text x={l - 6} y={sy(v) + 4} fontSize={10} fill="#666" textAnchor="end">{Number.isInteger(v) ? v : v.toFixed(1)}</text>
          </g>
        ))}
        {Array.from({ length: DURATION + 1 }, (_, s) => (
          <text key={s} x={sx(s)} y={H - b + 14} fontSize={10} fill="#666" textAnchor="middle">{s}</text>
        ))}
        <text x={(l + W - r) / 2} y={H - 4} fontSize={10} fill="#444" textAnchor="middle" fontWeight={700}>Time (s)</text>
        <text x={10} y={(t + H - b) / 2} fontSize={10} fill="#444" textAnchor="middle" fontWeight={700} transform={`rotate(-90 10 ${(t + H - b) / 2})`}>{yLabel}</text>
        <polyline points={poly(target)} fill="none" stroke="#FF9600" strokeWidth={2.5} strokeDasharray="6 5" />
        {line.length > 1 && <polyline points={poly(line)} fill="none" stroke="#1D74CC" strokeWidth={3} strokeLinejoin="round" />}
      </svg>
      <p className="mt-1 flex gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-5 bg-brand-600" aria-hidden />Your run</span>
        <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-amber-400" aria-hidden />Target</span>
      </p>
    </div>
  )
}
