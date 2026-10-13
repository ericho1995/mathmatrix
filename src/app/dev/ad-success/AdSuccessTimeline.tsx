'use client'

import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { Target } from 'lucide-react'
import Bird, { BirdMark, type BirdPose } from '@/components/brand/Bird'
import { Sparkle, Star } from '@/components/brand/Decor'
import timings from '../../../../marketing/instagram/ad-success/timings.json'

// ─────────────────────────────────────────────────────────────────────────────
// The "gold star" reel: a happy story for parents, 1080×1920, about 30
// seconds. The bird is the student. A test comes home covered in red; the free
// test finds the skills to work on; practice papers on just those; then the
// test comes home with a gold star, and it goes on the fridge.
//
// The storybook look of the earlier reels (warm paper, ink outlines,
// handwritten words, smooth eased motion, slow camera pushes and crossfades),
// with the real product on every desk: a real paper page, the sample report
// and real practice pages.
//
// Nothing animates by itself, so marketing/instagram/render-ad.mjs can step
// through it (window.__setAdTime). Timings come from the soundtrack
// (marketing/instagram/ad-success: chatterbox_voice.py, then audio.py).
// ─────────────────────────────────────────────────────────────────────────────

const L = timings.lines
export const AD_LENGTH = timings.length
const STAR_AT = timings.star
const TEXT = [
  'Some days, the test comes home covered in red.',
  'So we find out why. Our free test shows exactly which skills need work.',
  'Then practice papers on just those skills, one step at a time.',
  'Until the day it comes home with a gold star!',
  'And that proud smile says it all.',
  'Start with the free test at prepnest.com.au',
]
const INK = '#3B2F2A'
const RED = '#D9483B'
const FADE = 0.5

const sceneStart = (s: number) => (s === 0 ? 0 : L[s].start - 0.4)
const sceneEnd = (s: number) => (s + 1 < L.length ? sceneStart(s + 1) + FADE : AD_LENGTH)
const wordAt = (line: number, k: number) => {
  const weights = TEXT[line].split(' ').map(w => w.length + 1 + (/[.?!]$/.test(w) ? 6 : /,$/.test(w) ? 3 : 0))
  const total = weights.reduce((a, b) => a + b, 0)
  return L[line].start + ((L[line].end - L[line].start) * weights.slice(0, k).reduce((a, b) => a + b, 0)) / total
}

const clamp = (x: number) => Math.max(0, Math.min(1, x))
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3)
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const back = (p: number) => {
  const c1 = 1.6
  const c3 = c1 + 1
  return p <= 0 ? 0 : 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2)
}
const rnd = (n: number) => {
  const s = Math.sin(n * 12.9898) * 43758.5453
  return s - Math.floor(s)
}

const svgTile = (body: string, size: number) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>${body}</svg>`)}")`
const GRAIN = svgTile(
  `<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0 0.1  0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/>`,
  300
)
const MOTTLE = svgTile(
  `<filter id='m'><feTurbulence type='fractalNoise' baseFrequency='0.006' numOctaves='4' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.15  0 0 0 0.3 -0.08'/></filter><rect width='100%' height='100%' filter='url(#m)'/>`,
  1100
)
const SOFT_SHADOW = 'drop-shadow(0 12px 16px rgba(70,45,15,0.2))'
const inked = (w = 4): React.CSSProperties => ({ border: `${w}px solid ${INK}` })

function Backdrop({ color, layers, children }: { color: string; layers?: string; children?: React.ReactNode }) {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: color, backgroundImage: [GRAIN, MOTTLE, layers].filter(Boolean).join(', ') }}>
      {children}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 60%, rgba(60,38,12,0.2) 100%)' }} />
    </div>
  )
}

export interface AdSuccessData {
  hand: string
  page: string
  report: React.ReactNode
  focus: string
  practice: string[]
}

export default function AdSuccessTimeline(d: AdSuccessData) {
  const [t, setT] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    ;(window as unknown as { __setAdTime: (x: number) => void }).__setAdTime = (x: number) => flushSync(() => setT(x))
    if (new URLSearchParams(location.search).has('play')) {
      const t0 = performance.now()
      let raf = 0
      const tick = () => {
        setT(((performance.now() - t0) / 1000) % AD_LENGTH)
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }
  }, [])

  const hand = d.hand
  const scenes = [redTest, findOut, practiceUp, goldStar, fridge, callToAction]
  const visible = scenes.map((_, s) => s).filter(s => t >= sceneStart(s) && t < sceneEnd(s))
  if (!mounted) return null

  return (
    <div className="fixed left-0 top-0 z-[100] overflow-hidden font-sans bg-[#F3E3C6]" style={{ width: 1080, height: 1920 }}>
      {visible.map(s => {
        const u = t - sceneStart(s)
        const span = sceneEnd(s) - sceneStart(s)
        const push = 1 + 0.04 * easeInOut(clamp(u / span))
        return (
          <div key={s} className="absolute inset-0" style={{ opacity: s === 0 ? 1 : easeInOut(prog(u, 0, FADE)), transform: `scale(${push})`, transformOrigin: '50% 55%' }}>
            {scenes[s](u)}
          </div>
        )
      })}
      <Caption t={t} hand={hand} />
    </div>
  )

  /** The bird, as the student, bobbing gently. */
  function Student({ pose, x, y, size, enter = 0, jump = 0 }: { pose: BirdPose; x: number; y: number; size: number; enter?: number; jump?: number }) {
    const hop = jump > 0 ? Math.abs(Math.sin(t * 6)) * 70 * jump : Math.sin(t * 2.2) * 6
    return (
      <div className="absolute" style={{ left: x, top: y - hop, width: size, height: size, transform: `scale(${back(enter)})`, transformOrigin: 'bottom center' }}>
        <Bird pose={pose} className="w-full h-full" />
      </div>
    )
  }

  // ── 1. The test comes home covered in red ─────────────────────────────────
  function redTest(u: number) {
    const marks = [0.27, 0.41, 0.55, 0.69, 0.83]
    const markAt = (k: number) => 0.9 + k * 0.32
    return (
      <Backdrop color="#F3E3C6">
        <Classroom hand={hand} board="Maths test today" />
        <Paper src={d.page} x={210} y={640} w={660} rot={-3} enter={prog(u, 0.05, 0.7)}>
          {marks.map((yy, k) => (k === 2 ? <Tick key={k} x={0.86} y={yy} p={prog(u, markAt(k), markAt(k) + 0.25)} /> : <Cross key={k} x={0.86} y={yy} p={prog(u, markAt(k), markAt(k) + 0.25)} />))}
          <ScoreCircle hand={hand} text="12/30" p={prog(u, markAt(5), markAt(5) + 0.5)} />
        </Paper>
        <Student pose="think" x={20} y={1360} size={400} enter={prog(u, 0.4, 0.9)} />
      </Backdrop>
    )
  }

  // ── 2. The free test finds out why ────────────────────────────────────────
  function findOut(u: number) {
    return (
      <Backdrop color="#DCEBF0">
        <div className="absolute left-[40px] top-[560px] w-[1000px] rounded-[30px] bg-[#FFFDF7] p-4" style={{ ...inked(5), filter: SOFT_SHADOW, transform: `translateY(${1300 * (1 - easeOut(prog(u, 0.1, 0.8)))}px) rotate(-1.5deg)` }}>
          <div style={{ zoom: 1.4 }}>{d.report}</div>
        </div>
        <div className="absolute left-[60px] top-[1450px] inline-flex items-center gap-3 rounded-full bg-amber-400 px-8 py-4 text-5xl font-bold text-white" style={{ ...inked(4), transform: `rotate(-3deg) scale(${back(prog(u, 1.6, 2.05))})` }}>
          <Target className="w-12 h-12" aria-hidden />
          Focus: {d.focus}
        </div>
        <Student pose="search" x={730} y={1590} size={320} enter={prog(u, 0.6, 1.1)} />
      </Backdrop>
    )
  }

  // ── 3. Practice papers on just those skills, scores climbing ──────────────
  function practiceUp(u: number) {
    const scores = ['17/30', '22/30', '26/30']
    const chart = [12, 17, 22, 26]
    const drawn = easeInOut(prog(u, 0.6, 2.6))
    return (
      <Backdrop color="#E2C79B" layers="repeating-linear-gradient(0deg, rgba(90,55,20,0.22) 0 4px, transparent 4px 250px)">
        {d.practice.map((src, i) => {
          const at = 0.15 + i * 0.55
          return (
            <Paper key={src} src={src} x={[70, 270, 440][i]} y={[700, 760, 820][i]} w={540} rot={[-7, 2, 7][i]} enter={prog(u, at, at + 0.6)}>
              <span className={`${hand} absolute -top-9 left-6 rounded-md bg-[#FFE38A] px-5 py-1 text-[48px] leading-tight`} style={{ ...inked(3), color: INK }}>
                Paper {i + 1}
              </span>
              <ScoreCircle hand={hand} text={scores[i]} p={prog(u, at + 0.7, at + 1.1)} small left />
            </Paper>
          )
        })}
        {/* The marks climbing, drawn as they come in. */}
        <div className="absolute left-[560px] top-[470px] w-[460px] h-[300px] rounded-[22px] bg-[#FFFDF7] p-4" style={{ ...inked(4), filter: SOFT_SHADOW, transform: `rotate(2deg) scale(${back(prog(u, 0.3, 0.8))})` }}>
          <p className={`${hand} text-[44px] leading-none`} style={{ color: INK }}>
            Marks so far
          </p>
          <svg viewBox="0 0 420 210" className="w-full h-auto">
            {[0, 10, 20, 30].map(v => (
              <line key={v} x1={30} x2={410} y1={190 - v * 6} y2={190 - v * 6} stroke="#E8DCC4" strokeWidth={2} />
            ))}
            <polyline points={chart.map((v, k) => `${40 + k * 120},${190 - v * 6}`).join(' ')} fill="none" stroke="#2F8FEA" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - drawn} />
            {chart.map((v, k) =>
              drawn >= k / 3 - 0.01 ? <circle key={k} cx={40 + k * 120} cy={190 - v * 6} r={11} fill={k === 3 ? '#58CC02' : '#2F8FEA'} stroke={INK} strokeWidth={3} /> : null
            )}
          </svg>
        </div>
        <Student pose="read" x={700} y={1430} size={350} enter={prog(u, 0.5, 1.0)} />
      </Backdrop>
    )
  }

  // ── 4. The test comes home with a gold star ───────────────────────────────
  function goldStar(u: number) {
    const s0 = sceneStart(3)
    const star = STAR_AT - s0
    const ticks = [0.27, 0.41, 0.55, 0.69, 0.83]
    return (
      <Backdrop color="#F3E3C6">
        <Classroom hand={hand} board="Test results" />
        <Paper src={d.page} x={210} y={640} w={660} rot={2} enter={prog(u, 0.05, 0.7)}>
          {ticks.map((yy, k) => (
            <Tick key={k} x={0.86} y={yy} p={prog(u, 0.7 + k * 0.18, 0.9 + k * 0.18)} />
          ))}
          <ScoreCircle hand={hand} text="28/30" p={prog(u, star - 0.9, star - 0.4)} />
          <div className={`${hand} absolute left-[3%] top-[66%] rounded-md bg-[#FFE38A] px-6 py-3 text-[60px] font-bold leading-none`} style={{ ...inked(4), color: RED, transform: `rotate(-7deg) scale(${back(prog(u, star - 0.5, star - 0.1))})` }}>
            Excellent work!
          </div>
          <div className="absolute" style={{ left: '62%', top: '30%', width: 260, height: 260, transform: `scale(${back(prog(u, star, star + 0.45))}) rotate(${-20 + 20 * easeOut(prog(u, star, star + 0.6))}deg)`, filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.12))' }}>
            <Star className="w-full h-full" />
          </div>
        </Paper>
        <Confetti u={u - star} />
        <Student pose={u < star ? 'think' : 'trophy'} x={10} y={1340} size={u < star ? 400 : 440} enter={1} jump={u > star ? Math.min(1, (u - star) * 2) * (1 - prog(u, star + 2.2, star + 3)) : 0} />
      </Backdrop>
    )
  }

  // ── 5. On the fridge ───────────────────────────────────────────────────────
  function fridge(u: number) {
    return (
      <Backdrop color="#DCEBF0" layers="repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0 60px, transparent 60px 120px)">
        <div className="absolute left-[170px] top-[440px] w-[740px] h-[1480px] rounded-[48px] bg-[#FBFBF7]" style={{ ...inked(6), filter: SOFT_SHADOW }}>
          <div className="absolute left-0 right-0 top-[420px] h-[6px]" style={{ background: INK }} />
          <div className="absolute right-[40px] top-[120px] w-[22px] h-[220px] rounded-full bg-[#D8D8D2]" style={inked(4)} />
          <div className="absolute right-[40px] top-[480px] w-[22px] h-[300px] rounded-full bg-[#D8D8D2]" style={inked(4)} />
        </div>
        <Paper src={d.page} x={300} y={600 - 700 * (1 - easeOut(prog(u, 0.1, 0.7)))} w={440} rot={-4} enter={1}>
          <ScoreCircle hand={hand} text="28/30" p={1} small />
          <div className="absolute" style={{ left: '58%', top: '22%', width: 170, height: 170 }}>
            <Star className="w-full h-full" />
          </div>
          {/* Two magnets hold it up. */}
          {[0.12, 0.78].map((x, k) => (
            <span key={k} className="absolute -top-6 h-14 w-14 rounded-full" style={{ left: `${x * 100}%`, background: k ? '#58CC02' : '#FF9600', ...inked(4), transform: `scale(${back(prog(u, 0.7 + k * 0.15, 1.0 + k * 0.15))})` }} />
          ))}
        </Paper>
        {Array.from({ length: 5 }, (_, k) => {
          const life = (u * 0.6 + k * 0.23) % 1
          return (
            <svg key={k} className="absolute" style={{ left: 120 + k * 50 + Math.sin(u * 2 + k) * 20, top: 1500 - life * 520, opacity: u > 0.8 ? Math.sin(Math.PI * life) : 0 }} width="60" height="56" viewBox="0 0 60 56">
              <path d="M30 52 C4 34 2 16 14 8 C22 3 28 8 30 14 C32 8 38 3 46 8 C58 16 56 34 30 52 Z" fill="#FF8FA8" stroke={INK} strokeWidth={4} />
            </svg>
          )
        })}
        <Student pose="cheer" x={10} y={1400} size={400} enter={prog(u, 0.4, 0.9)} />
      </Backdrop>
    )
  }

  // ── 6. Try the free test now ───────────────────────────────────────────────
  function callToAction(u: number) {
    return (
      <Backdrop color="#F3E8D2">
        {[[150, 560, 70], [860, 600, 90], [890, 1130, 56], [120, 1160, 50]].map(([x, y, s], i) => (
          <div key={i} className="absolute" style={{ left: x, top: y + Math.sin(t * 1.4 + i) * 8, width: s, height: s, opacity: prog(u, 0.6 + i * 0.12, 1.0 + i * 0.12), transform: `rotate(${t * 22 * (i % 2 ? 1 : -1)}deg)` }}>
            {i % 2 ? <Star className="w-full h-full" /> : <Sparkle className="w-full h-full" fill="#2F8FEA" />}
          </div>
        ))}
        <div className="absolute rounded-full bg-sun-400" style={{ ...inked(6), left: 270, top: 560, width: 540, height: 540, transform: `scale(${back(prog(u, 0.1, 0.6))})` }} />
        <div className="absolute" style={{ left: 250, top: 510 + Math.sin(t * 2) * 6, width: 580, height: 580, transform: `scale(${back(prog(u, 0.3, 0.85))})` }}>
          <Bird pose="trophy" className="w-full h-full" />
        </div>
        <div className="absolute left-0 right-0 top-[1140px] flex justify-center" style={{ transform: `scale(${back(prog(u, 0.8, 1.25))})` }}>
          <span className="inline-flex items-center gap-4 rounded-full bg-white px-9 py-5" style={inked(5)}>
            <BirdMark className="w-20 h-20" />
            <span className="text-7xl font-bold tracking-tight text-ink">
              Prep<span className="text-brand-500">Nest</span>
            </span>
          </span>
        </div>
        <div className="absolute left-0 right-0 top-[1330px] flex justify-center" style={{ transform: `scale(${back(prog(u, 1.2, 1.65))})` }}>
          <span className="rounded-[2rem] bg-sun-400 px-14 py-7 text-6xl font-bold text-ink" style={{ ...inked(5), boxShadow: `0 10px 0 ${INK}` }}>
            Try the free test now
          </span>
        </div>
        <p className={`${hand} absolute left-0 right-0 top-[1510px] text-center text-[76px] font-bold text-brand-600`} style={{ clipPath: `inset(0 ${100 - 100 * easeInOut(prog(u, 1.7, 2.5))}% 0 0)` }}>
          prepnest.com.au
        </p>
        <p className="absolute left-0 right-0 top-[1620px] text-center text-3xl font-semibold" style={{ color: INK, opacity: prog(u, 2.4, 2.9) }}>
          Grade 3 to Year 12 · no account to start
        </p>
      </Backdrop>
    )
  }
}

/** The classroom wall: a whiteboard with the day's note, bunting, and a desk. */
function Classroom({ hand, board }: { hand: string; board: string }) {
  return (
    <>
      <div className="absolute left-[150px] top-[420px] w-[780px] h-[150px] rounded-[16px] bg-white" style={{ ...inked(5), filter: SOFT_SHADOW }}>
        <p className={`${hand} absolute inset-0 flex items-center justify-center text-[78px] font-bold`} style={{ color: '#1D74CC' }}>
          {board}
        </p>
      </div>
      <svg className="absolute left-0 top-[330px]" width="1080" height="80" viewBox="0 0 1080 80">
        <path d="M0 10 Q540 70 1080 10" fill="none" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 11 }, (_, k) => {
          const x = 50 + k * 98
          const y = 10 + 60 * (1 - Math.pow((x - 540) / 540, 2)) * 0.95
          return <path key={k} d={`M${x - 26} ${y} L${x + 26} ${y} L${x} ${y + 46} Z`} fill={['#FF9600', '#2F8FEA', '#58CC02', '#FFC530', '#CE82FF'][k % 5]} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        })}
      </svg>
      <div className="absolute left-0 right-0 top-[1640px] h-[280px]" style={{ borderTop: `6px solid ${INK}`, backgroundColor: '#C8965F', backgroundImage: `${GRAIN}, repeating-linear-gradient(0deg, rgba(60,35,10,0.18) 0 4px, transparent 4px 70px)` }} />
    </>
  )
}

/** A printed page on the desk: the real paper, with marks laid over it. */
function Paper({ src, x, y, w, rot, enter, children }: { src: string; x: number; y: number; w: number; rot: number; enter: number; children?: React.ReactNode }) {
  return (
    <div
      className="absolute rounded-[10px] bg-white p-3"
      style={{ ...inked(4), left: x, top: y, width: w, filter: SOFT_SHADOW, transform: `translateY(${1400 * (1 - easeOut(enter))}px) rotate(${rot}deg)` }}
    >
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="block w-full" />
        {children}
      </div>
    </div>
  )
}

/** A teacher's red cross, drawn stroke by stroke. */
function Cross({ x, y, p }: { x: number; y: number; p: number }) {
  if (p <= 0) return null
  const a = clamp(p * 2)
  const b = clamp(p * 2 - 1)
  return (
    <svg className="absolute" style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: 70, height: 70, transform: 'translate(-50%, -50%)' }} viewBox="0 0 70 70">
      <path d="M12 12 L58 58" stroke={RED} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - a} />
      <path d="M58 12 L12 58" stroke={RED} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - b} />
    </svg>
  )
}

/** A teacher's red tick, drawn in one stroke. */
function Tick({ x, y, p }: { x: number; y: number; p: number }) {
  if (p <= 0) return null
  return (
    <svg className="absolute" style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: 80, height: 70, transform: 'translate(-50%, -50%)' }} viewBox="0 0 80 70">
      <path d="M8 38 L30 60 L74 10" fill="none" stroke={RED} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - easeOut(p)} />
    </svg>
  )
}

/** The mark, circled in red pen at the top of the page. */
function ScoreCircle({ hand, text, p, small, left }: { hand: string; text: string; p: number; small?: boolean; left?: boolean }) {
  if (p <= 0) return null
  const s = small ? 0.7 : 1
  return (
    <div className="absolute" style={{ ...(left ? { left: '2%', top: '9%' } : { right: '3%', top: small ? '2%' : '3%' }), width: 230 * s, height: 150 * s }}>
      <svg className="absolute inset-0" viewBox="0 0 230 150" width="100%" height="100%">
        <ellipse cx={115} cy={75} rx={104} ry={62} fill="none" stroke={RED} strokeWidth={8} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - easeOut(p)} transform="rotate(-6 115 75)" />
      </svg>
      <p className={`${hand} absolute inset-0 flex items-center justify-center font-bold`} style={{ color: RED, fontSize: 86 * s, opacity: prog(p, 0.4, 0.9) }}>
        {text}
      </p>
    </div>
  )
}

/** A burst of paper confetti from above the page. */
function Confetti({ u }: { u: number }) {
  if (u <= 0 || u > 4) return null
  const colours = ['#FF9600', '#2F8FEA', '#58CC02', '#FFC530', '#CE82FF', '#FF6B8B']
  return (
    <>
      {Array.from({ length: 110 }, (_, i) => {
        const vx = (rnd(i + 1) - 0.5) * 1300
        const vy = -(500 + rnd(i + 7) * 900)
        const x = 540 + (rnd(i + 3) - 0.5) * 160 + vx * u
        const y = 900 + vy * u + 0.5 * 1500 * u * u
        const spin = (rnd(i + 5) - 0.5) * 1400 * u
        if (y > 2000) return null
        return (
          <span
            key={i}
            className="absolute block"
            style={{
              left: x,
              top: y,
              width: 18 + rnd(i + 9) * 14,
              height: 10 + rnd(i + 11) * 10,
              background: colours[i % colours.length],
              border: `2px solid ${INK}`,
              borderRadius: i % 3 === 0 ? 999 : 3,
              transform: `rotate(${spin}deg) scaleY(${Math.cos(u * 8 + i)})`,
              opacity: 1 - prog(u, 3.2, 4),
            }}
          />
        )
      })}
    </>
  )
}

/** The line being spoken, handwritten on a card, each word easing in as it is said. */
function Caption({ t, hand }: { t: number; hand: string }) {
  const line = L.findIndex((l, i) => t >= l.start - 0.35 && (i === L.length - 1 || t < L[i + 1].start - 0.35))
  if (line < 0) return null
  const next = line + 1 < L.length ? L[line + 1].start - 0.35 : AD_LENGTH + 1
  const card = prog(t, L[line].start - 0.35, L[line].start - 0.05) * (1 - prog(t, next - 0.3, next))
  if (card <= 0) return null
  const words = TEXT[line].split(' ')
  const size = words.length > 12 ? 60 : words.length > 7 ? 68 : 82
  return (
    <div className="absolute left-[56px] right-[56px] top-[150px] flex justify-center" style={{ opacity: easeInOut(card), transform: `translateY(${(1 - easeOut(card)) * -16}px)` }}>
      <p className={`${hand} rounded-[18px] bg-[#FFFBF0] px-10 py-5 text-center leading-[1.08]`} style={{ ...inked(4), color: INK, fontSize: size, fontWeight: 700, boxShadow: '0 10px 24px rgba(60,38,12,0.18)' }}>
        {words.map((w, i) => {
          const p = easeOut(prog(t, wordAt(line, i) - 0.06, wordAt(line, i) + 0.28))
          return (
            <span key={i} className="inline-block mr-[0.25em]" style={{ opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
              {w}
            </span>
          )
        })}
      </p>
    </div>
  )
}
