'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Caveat } from 'next/font/google'
import { Check, HelpCircle, NotebookPen, PenLine, Printer, Smartphone, Sparkles, Target, Timer, X } from 'lucide-react'
import Bird, { BirdMark } from '@/components/brand/Bird'
import { Sparkle, Star } from '@/components/brand/Decor'
import QuestionView from '@/components/diagnostic/QuestionView'
import LevelChip from '@/components/diagnostic/LevelChip'
import AreaBar from '@/components/diagnostic/AreaBar'
import type { ScreenQuestion } from '@/lib/web/questionHtml'
import type { Headline } from '@/lib/diagnostic/score'

const hand = Caveat({ subsets: ['latin'], weight: ['700'] })

// ─────────────────────────────────────────────────────────────────────────────
// "The right practice": a 1080×1920 Reels/TikTok ad as a pure function of time.
// Nothing animates by itself; every position, size and opacity is worked out
// from `t`, so render.mjs can step through it (window.__setAdTime) and every
// render is identical. ?play runs it in real time.
//
// The voice decides the timing: timings.json (from audio.py) gives each
// line's start and end, every word's start, and the cuts, which sit on the
// beat of the score. Scenes are laid out relative to those.
// ─────────────────────────────────────────────────────────────────────────────

export interface ReelTimings {
  length: number
  bpm: number
  /** Scene starts: hook, "more practice", "right practice", test, report, papers, gaps close, call to action. */
  cuts: number[]
  lines: { start: number; end: number; text: string; words: { w: string; s: number; e: number }[] }[]
}

export interface ReelData {
  timings: ReelTimings
  test: [ScreenQuestion, ScreenQuestion]
  testOf: number
  headline: Headline
  focusId: string
  paperQuestion: ScreenQuestion
  pages: [string, string]
}

const W = 1080
const H = 1920

// ── Motion ────────────────────────────────────────────────────────────────────
const clamp = (x: number) => Math.max(0, Math.min(1, x))
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const out3 = (p: number) => 1 - Math.pow(1 - p, 3)
const outExpo = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p))
const in3 = (p: number) => p * p * p
const inOut3 = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const back = (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2))
/** A damped spring from 0 to 1, settling by p = 1. */
const spring = (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.exp(-6.2 * p) * Math.cos(9.4 * p))
const lerp = (a: number, b: number, p: number) => a + (b - a) * p

/** Deterministic pseudo-random numbers, so confetti lands the same way every render. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let x = Math.imul(a ^ (a >>> 15), 1 | a)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

// ── Colours ──────────────────────────────────────────────────────────────────
const INK = '#1F2430'
const RED = '#E23D3D'
const BLUE = '#2F8FEA'
const BLUE_DARK = '#1D74CC'
const SUN = '#FFC530'
const GREEN = '#58CC02'
const ORANGE = '#FF9600'
const GRAPE = '#CE82FF'

// ── Pieces ───────────────────────────────────────────────────────────────────

/** One word, sliding up out of a mask when `at` arrives. */
function Word({ t, at, children, className = '', style, dur = 0.42 }: { t: number; at: number; children: React.ReactNode; className?: string; style?: React.CSSProperties; dur?: number }) {
  const p = outExpo(prog(t, at - 0.06, at - 0.06 + dur))
  return (
    <span className="inline-block overflow-hidden align-top pb-[0.12em] -mb-[0.12em] pr-[0.04em]">
      <span className={`inline-block ${className}`} style={{ transform: `translateY(${(1 - p) * 112}%) rotate(${(1 - p) * 4}deg)`, transformOrigin: '0 100%', ...style }}>
        {children}
      </span>
    </span>
  )
}

/** A line of words, each arriving with its spoken word. */
function Said({ t, words, text, className = '', gap = '0.24em', wordClass }: { t: number; words: { s: number }[]; text: string; className?: string; gap?: string; wordClass?: (i: number, w: string) => string }) {
  const ws = text.split(' ')
  return (
    <span className={className}>
      {ws.map((w, i) => (
        <span key={i} style={{ marginRight: i < ws.length - 1 ? gap : 0 }} className="inline-block">
          <Word t={t} at={words[Math.min(i, words.length - 1)].s} className={wordClass?.(i, w) ?? ''}>
            {w}
          </Word>
        </span>
      ))}
    </span>
  )
}

/** A hand-drawn stroke that draws itself between `a` and `b`. */
function Stroke({ d, t, a, b, color = RED, width = 10, length = 1200, opacity = 1 }: { d: string; t: number; a: number; b: number; color?: string; width?: number; length?: number; opacity?: number }) {
  const p = out3(prog(t, a, b))
  if (p <= 0) return null
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={length} strokeDashoffset={length * (1 - p)} opacity={opacity} />
}

/** A finger tap: a soft dot that presses, then a ring that spreads. */
function Tap({ t, at, x, y, scale = 1 }: { t: number; at: number; x: number; y: number; scale?: number }) {
  const d = t - at
  if (d < -0.22 || d > 0.6) return null
  const appear = out3(prog(t, at - 0.22, at - 0.05))
  const press = d < 0 ? 1 : d < 0.12 ? 1 - 0.18 * Math.sin((d / 0.12) * Math.PI) : 1
  const fade = 1 - prog(t, at + 0.25, at + 0.6)
  const ring = out3(prog(t, at, at + 0.5))
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y, transform: `translate(-50%,-50%) scale(${scale})`, zIndex: 50 }}>
      <div className="absolute rounded-full border-[3px] border-white" style={{ width: 44, height: 44, left: -22, top: -22, transform: `scale(${1 + ring * 1.6})`, opacity: (1 - ring) * 0.9, boxShadow: '0 0 0 2px rgba(31,36,48,0.15)' }} />
      <div className="absolute rounded-full bg-white/70 border-2 border-[#1F2430]/25" style={{ width: 40, height: 40, left: -20, top: -20, transform: `scale(${press * appear})`, opacity: fade, boxShadow: '0 6px 16px rgba(0,0,0,0.25)' }} />
    </div>
  )
}

/** A phone, drawn in CSS: the screen is laid out 390 px wide and scaled to fit. */
function Phone({ width, children, style, screenBg = '#fff' }: { width: number; children: React.ReactNode; style?: React.CSSProperties; screenBg?: string }) {
  const height = width * 2.05
  const bezel = width * 0.028
  const radius = width * 0.15
  const s = (width - bezel * 2) / 390
  return (
    <div className="absolute" style={{ width, height, ...style }}>
      <div
        className="absolute inset-0"
        style={{ borderRadius: radius, background: 'linear-gradient(145deg,#3a3f4a,#0d0f13 45%,#1b1e24)', boxShadow: '0 60px 90px -30px rgba(15,30,60,0.55), 0 25px 40px -20px rgba(15,30,60,0.35), inset 0 0 0 2px rgba(255,255,255,0.08)' }}
      />
      <div className="absolute overflow-hidden" style={{ left: bezel, top: bezel, right: bezel, bottom: bezel, borderRadius: radius - bezel, background: screenBg }}>
        <div className="relative" style={{ width: 390, height: (height - bezel * 2) / s, transform: `scale(${s})`, transformOrigin: '0 0' }}>
          <StatusBar />
          {children}
        </div>
        <div className="absolute left-1/2 rounded-full bg-black" style={{ top: bezel * 0.9, width: width * 0.3, height: width * 0.085, transform: 'translateX(-50%)' }} />
      </div>
    </div>
  )
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-7 pt-4 h-[54px] text-[15px] font-bold text-ink">
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <span className="flex items-end gap-[2px]">
          {[5, 7, 9, 11].map(h => (
            <span key={h} className="w-[3px] rounded-sm bg-ink" style={{ height: h }} />
          ))}
        </span>
        <span className="ml-1 w-[24px] h-[12px] rounded-[4px] border-2 border-ink/70 p-[1px]">
          <span className="block h-full w-[80%] rounded-[2px] bg-ink" />
        </span>
      </span>
    </div>
  )
}

/** Centres of the answer buttons inside `root`, in its own (unscaled) pixels. */
function useOptionCentres(root: React.RefObject<HTMLDivElement>) {
  const [pts, setPts] = useState<{ x: number; y: number }[]>([])
  useLayoutEffect(() => {
    const r = root.current
    if (!r) return
    const found = Array.from(r.querySelectorAll<HTMLElement>('[role=radiogroup] button')).map(el => {
      let x = el.offsetWidth / 2
      let y = el.offsetHeight / 2
      let n: HTMLElement | null = el
      while (n && n !== r) {
        x += n.offsetLeft
        y += n.offsetTop
        n = n.offsetParent as HTMLElement | null
      }
      return { x, y }
    })
    setPts(prev => (JSON.stringify(prev) === JSON.stringify(found) ? prev : found))
  })
  return pts
}

/** Film grain, drawn once and shifted every frame. */
function useGrain() {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')!
    const img = g.createImageData(256, 256)
    const r = rng(42)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (r() - 0.5) * 255
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    g.putImageData(img, 0, 0)
    setUrl(c.toDataURL())
  }, [])
  return url
}

function Rays({ t, color = 'rgba(255,255,255,0.09)', at = '50% 42%', speed = 6 }: { t: number; color?: string; at?: string; speed?: number }) {
  return (
    <div
      className="absolute"
      style={{ inset: -400, background: `repeating-conic-gradient(from ${t * speed}deg at ${at}, ${color} 0deg 9deg, transparent 9deg 18deg)` }}
    />
  )
}

function Confetti({ t, at, x, y, seed = 3, count = 90, palette }: { t: number; at: number; x: number; y: number; seed?: number; count?: number; palette: string[] }) {
  const d = t - at
  if (d < 0 || d > 3) return null
  const r = rng(seed)
  const bits = Array.from({ length: count }, (_, i) => {
    const ang = -Math.PI / 2 + (r() - 0.5) * 2.3
    const speed = 900 + r() * 1300
    const vx = Math.cos(ang) * speed
    const vy = Math.sin(ang) * speed
    const drag = Math.exp(-1.6 * d)
    const px = x + (vx * (1 - drag)) / 1.6 + Math.sin(d * (3 + r() * 4) + i) * 30 * d
    const py = y + (vy * (1 - drag)) / 1.6 + 0.5 * 1500 * d * d
    const spin = d * (360 + r() * 720) * (r() > 0.5 ? 1 : -1)
    const flutter = Math.cos(d * (8 + r() * 10) + i)
    const w = 12 + r() * 12
    const h = 20 + r() * 16
    const c = palette[i % palette.length]
    const round = r() > 0.75
    return (
      <span
        key={i}
        className="absolute"
        style={{ left: px, top: py, width: round ? w : w, height: round ? w : h, background: c, borderRadius: round ? '50%' : 3, transform: `translate(-50%,-50%) rotate(${spin}deg) scaleY(${round ? 1 : flutter})`, opacity: 1 - prog(t, at + 2.2, at + 3) }}
      />
    )
  })
  return <>{bits}</>
}

function Logo({ className = '', size = 1 }: { className?: string; size?: number }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-white shadow-[0_8px_24px_-8px_rgba(15,30,60,0.35)] ${className}`} style={{ gap: 12 * size, padding: `${10 * size}px ${22 * size}px ${10 * size}px ${12 * size}px` }}>
      <span className="shrink-0 inline-block" style={{ width: 58 * size, height: 58 * size }}><BirdMark className="w-full h-full" /></span>
      <span className="font-black tracking-tight text-ink" style={{ fontSize: 34 * size, letterSpacing: '-0.02em' }}>
        Prep<span className="text-brand-500">Nest</span>
      </span>
    </span>
  )
}

// ── The ad ───────────────────────────────────────────────────────────────────

export default function RightPractice(d: ReelData) {
  const [t, setT] = useState(0)
  const grain = useGrain()
  const T = d.timings
  const L = T.lines
  const C = T.cuts
  const end = T.length

  useEffect(() => {
    ;(window as unknown as { __setAdTime: (x: number) => void }).__setAdTime = (x: number) => flushSync(() => setT(x))
    if (new URLSearchParams(location.search).has('play')) {
      const t0 = performance.now()
      let raf = 0
      const tick = () => {
        setT(((performance.now() - t0) / 1000) % end)
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }
    const at = new URLSearchParams(location.search).get('t')
    if (at) setT(Number(at))
  }, [end])

  /** When word `w` (or the k-th word) of line `i` is spoken. */
  const ws = (i: number, w: string | number) => {
    const words = L[i].words
    if (typeof w === 'number') return words[Math.min(w, words.length - 1)].s
    const k = words.findIndex(x => x.w.toLowerCase().replace(/[^a-z']/g, '').startsWith(w.toLowerCase()))
    return (k >= 0 ? words[k] : words[0]).s
  }

  const show = (i: number, before = 0.4, after = 0.6) => t >= C[i] - before && t < (C[i + 1] ?? end + 1) + after

  return (
    <div className="fixed left-0 top-0 z-[100] overflow-hidden font-sans bg-white" style={{ width: W, height: H }}>
      {show(0) && <Hook t={t} d={d} ws={ws} />}
      {show(1, 0.3) && <More t={t} d={d} ws={ws} />}
      {show(2, 0.3) && <Right t={t} d={d} ws={ws} />}
      {show(3, 0.3) && <Test t={t} d={d} ws={ws} />}
      {show(4, 0.3) && <Report t={t} d={d} ws={ws} />}
      {show(5, 0.3) && <Papers t={t} d={d} ws={ws} />}
      {show(6, 0.3) && <Gaps t={t} d={d} ws={ws} />}
      {t >= C[7] - 0.3 && <Cta t={t} d={d} ws={ws} />}

      {/* The brand, small, until the call to action takes over. */}
      <div className="absolute left-[56px] top-[250px]" style={{ opacity: out3(prog(t, 0.15, 0.6)) * (1 - prog(t, C[7] - 0.2, C[7] + 0.1)), transform: `translateY(${(1 - out3(prog(t, 0.15, 0.6))) * -30}px)` }}>
        <Logo size={0.82} />
      </div>

      {grain && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `url(${grain})`, backgroundPosition: `${Math.floor(t * 30 * 37) % 256}px ${Math.floor(t * 30 * 53) % 256}px`, opacity: 0.055, mixBlendMode: 'overlay' }}
        />
      )}
    </div>
  )
}

type SceneProps = { t: number; d: ReelData; ws: (i: number, w: string | number) => number }

// ── 1. The hook: hours of practice, same mistakes ────────────────────────────
function Hook({ t, d, ws }: SceneProps) {
  const C = d.timings.cuts
  const L = d.timings.lines
  const leave = inOut3(prog(t, C[1] - 0.25, C[1] + 0.2))
  const push = lerp(1.0, 1.07, prog(t, 0, C[1]))
  const pageIn = (k: number) => spring(prog(t, 0.05 + k * 0.11, 0.6 + k * 0.11))
  const pages = [
    { rot: -9, x: -40, y: 30 },
    { rot: 7, x: 30, y: 10 },
    { rot: -2.5, x: 0, y: 0 },
  ]
  const PW = 720
  const PH = PW * 1.414
  const sx = PW / 1100
  const mark = (cx: number, cy: number, at: number, k: number) => {
    const x = cx * sx
    const y = cy * sx
    const s = 34
    return (
      <g key={k}>
        <Stroke d={`M ${x - s} ${y - s * 0.9} Q ${x} ${y - 2}, ${x + s * 1.05} ${y + s}`} t={t} a={at} b={at + 0.12} width={11} length={140} />
        <Stroke d={`M ${x + s} ${y - s} Q ${x + 4} ${y + 3}, ${x - s * 0.95} ${y + s * 0.95}`} t={t} a={at + 0.1} b={at + 0.22} width={11} length={140} />
      </g>
    )
  }
  const sameAt = ws(0, 'same')
  const penAt = Math.max(ws(0, 'hours') + 0.12, 0.7)
  return (
    <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 50% 45%, #FBF7EF 0%, #EFE7D8 70%, #E3D8C4 100%)' }}>
      {/* The desk and its papers, the camera slowly pushing in. */}
      <div className="absolute inset-0" style={{ transform: `translateX(${-leave * 1300}px) rotate(${-leave * 8}deg) scale(${push})`, transformOrigin: '50% 60%' }}>
        {pages.map((p, k) => {
          const s = pageIn(k)
          return (
            <div
              key={k}
              className="absolute bg-white"
              style={{
                left: (W - PW) / 2 + p.x,
                top: 700 + p.y,
                width: PW,
                height: PH,
                transform: `rotate(${p.rot + (1 - s) * 6}deg) scale(${lerp(1.25, 1, s)})`,
                opacity: clamp(s * 3),
                boxShadow: `0 ${lerp(70, 26, s)}px ${lerp(90, 50, s)}px -20px rgba(70,50,20,${lerp(0.15, 0.35, s)})`,
              }}
            >
              <img src={d.pages[0]} alt="" className="w-full h-full object-cover" />
              {k === 2 && (
                <svg className="absolute inset-0" width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`}>
                  {/* Once the papers have landed: audio.py puts the pen sounds at the same times. */}
                  {mark(319, 562, penAt, 1)}
                  {mark(319, 923, penAt + 0.3, 2)}
                  {mark(802, 1377, penAt + 0.6, 3)}
                  {/* Same mistake, circled again. */}
                  <Stroke d={`M ${802 * sx - 190} ${1377 * sx + 4} C ${802 * sx - 190} ${1377 * sx - 70}, ${802 * sx + 200} ${1377 * sx - 74}, ${802 * sx + 196} ${1377 * sx + 2} C ${802 * sx + 192} ${1377 * sx + 66}, ${802 * sx - 170} ${1377 * sx + 72}, ${802 * sx - 186} ${1377 * sx - 8} C ${802 * sx - 190} ${1377 * sx - 40}, ${802 * sx - 120} ${1377 * sx - 62}, ${802 * sx - 40} ${1377 * sx - 66}`} t={t} a={sameAt} b={sameAt + 0.45} width={8} length={1300} />
                </svg>
              )}
            </div>
          )
        })}
        {/* "again?!" in red pen beside the circled answer. */}
        <div
          className={`absolute ${hand.className}`}
          style={{ left: 640, top: 1560, color: RED, fontSize: 108, transform: `rotate(-8deg) scale(${spring(prog(t, sameAt + 0.3, sameAt + 0.9))})`, transformOrigin: '20% 80%' }}
        >
          again?!
        </div>
      </div>

      {/* A clock racing: the hours going by. */}
      <div className="absolute" style={{ left: 836, top: 612, width: 180, height: 180, transform: `scale(${spring(prog(t, ws(0, 'hours') - 0.1, ws(0, 'hours') + 0.5)) * (1 - leave)}) rotate(8deg)` }}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_14px_rgba(70,50,20,0.25)]">
          <circle cx="50" cy="50" r="45" fill="#fff" stroke={INK} strokeWidth="6" />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1="50" y1="11" x2="50" y2={i % 3 ? 15 : 18} stroke={INK} strokeWidth={i % 3 ? 2 : 3.5} strokeLinecap="round" transform={`rotate(${i * 30} 50 50)`} />
          ))}
          <line x1="50" y1="50" x2="50" y2="22" stroke={INK} strokeWidth="5" strokeLinecap="round" transform={`rotate(${t * 900} 50 50)`} />
          <line x1="50" y1="50" x2="50" y2="31" stroke={RED} strokeWidth="6" strokeLinecap="round" transform={`rotate(${t * 75} 50 50)`} />
          <circle cx="50" cy="50" r="5" fill={INK} />
        </svg>
      </div>

      {/* The words. */}
      <div className="absolute left-[64px] right-[64px] top-[360px] font-black tracking-tight" style={{ transform: `translateY(${-leave * 140}px)`, opacity: 1 - leave, letterSpacing: '-0.03em' }}>
        <p className="text-[94px] leading-[1.04]" style={{ color: INK }}>
          <Said t={t} words={L[0].words.slice(0, 3)} text="Hours of practice." />
        </p>
        <p className="text-[138px] leading-[1.0]" style={{ color: RED }}>
          <Said t={t} words={L[0].words.slice(3)} text="Same mistakes?" />
        </p>
      </div>
    </div>
  )
}

// ── 2. Maybe they don't need more practice ──────────────────────────────────
function More({ t, d, ws }: SceneProps) {
  const C = d.timings.cuts
  const L = d.timings.lines
  const wipe = inOut3(prog(t, C[1] - 0.22, C[1] + 0.22))
  const x0 = lerp(W + 700, -700, wipe)
  const strike = ws(1, 'practice') + 0.28
  return (
    <div className="absolute inset-0" style={{ background: SUN, clipPath: `polygon(${x0}px 0, ${W + 900}px 0, ${W + 900}px ${H}px, ${x0 - 520}px ${H}px)` }}>
      <div className="absolute rounded-full" style={{ left: -260, top: 1180, width: 900, height: 900, background: 'radial-gradient(circle, rgba(255,255,255,0.35), rgba(255,255,255,0) 65%)' }} />
      <div className="absolute left-[64px] right-[40px] top-[470px] font-black tracking-tight text-[124px] leading-[1.04]" style={{ color: INK, letterSpacing: '-0.035em' }}>
        <p>
          <Said t={t} words={L[1].words.slice(0, 2)} text="Maybe they" />
        </p>
        <p>
          <Said t={t} words={L[1].words.slice(2, 4)} text="don't need" />
        </p>
        <p className="relative inline-block">
          <span className="relative inline-block">
            <Word t={t} at={ws(1, 'more')}>more</Word>
            <svg className="absolute left-[-12px] top-[38%] overflow-visible" width="330" height="60" viewBox="0 0 330 60">
              <Stroke d="M 4 34 C 80 22, 170 40, 326 18" t={t} a={strike} b={strike + 0.18} color={RED} width={16} length={360} />
              <Stroke d="M 14 50 C 110 36, 200 46, 318 34" t={t} a={strike + 0.12} b={strike + 0.28} color={RED} width={11} length={340} />
            </svg>
          </span>
          <span className="inline-block ml-[0.24em]">
            <Word t={t} at={ws(1, 'practice')}>practice.</Word>
          </span>
        </p>
      </div>
      <div className="absolute" style={{ left: 560, top: 1080 + Math.sin(t * 3.2) * 12, width: 470, height: 470, transform: `scale(${spring(prog(t, C[1] + 0.05, C[1] + 0.7))}) rotate(${-4 + Math.sin(t * 2) * 3}deg)` }}>
        <Bird pose="think" className="w-full h-full" />
      </div>
    </div>
  )
}

// ── 3. They need the right practice ─────────────────────────────────────────
function Right({ t, d, ws }: SceneProps) {
  const C = d.timings.cuts
  const L = d.timings.lines
  const r = inOut3(prog(t, C[2] - 0.12, C[2] + 0.26)) * 2400
  const leave = inOut3(prog(t, C[3] - 0.2, C[3] + 0.25))
  const rightAt = ws(2, 'right')
  const pop = spring(prog(t, rightAt - 0.05, rightAt + 0.6))
  const punch = 1 + 0.08 * (1 - out3(prog(t, C[2], C[2] + 0.4)))
  const hl = outExpo(prog(t, rightAt + 0.05, rightAt + 0.35))
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: BLUE, clipPath: `circle(${r}px at 540px 980px)`, transform: `translateY(${-leave * H}px)` }}>
      <Rays t={t} at="50% 50%" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(70% 45% at 50% 50%, rgba(255,255,255,0.18), rgba(255,255,255,0) 70%)' }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-black tracking-tight text-white" style={{ transform: `scale(${punch})`, letterSpacing: '-0.035em' }}>
        <p className="text-[104px] leading-none">
          <Said t={t} words={L[2].words.slice(0, 3)} text="They need the" />
        </p>
        <div className="relative my-6" style={{ transform: `scale(${lerp(0.3, 1, pop)}) rotate(${lerp(-14, -4, pop)}deg)`, opacity: clamp(pop * 4) }}>
          <span className="absolute rounded-[28px]" style={{ left: -34, right: -34, top: 46, bottom: 18, background: SUN, transform: `scaleX(${hl}) skewX(-8deg)`, transformOrigin: '0 50%', boxShadow: '0 14px 0 #E0A400' }} />
          <span className="relative block text-[268px] leading-[0.95]" style={{ color: INK }}>
            RIGHT
          </span>
        </div>
        <p className="text-[124px] leading-none">
          <Word t={t} at={ws(2, 'practice')}>practice.</Word>
        </p>
      </div>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.3
        const p = out3(prog(t, rightAt, rightAt + 0.8))
        const dist = 330 + p * 260 + (i % 3) * 50
        return (
          <div key={i} className="absolute" style={{ left: 540 + Math.cos(a) * dist * 1.25, top: 960 + Math.sin(a) * dist, width: i % 2 ? 54 : 74, height: i % 2 ? 54 : 74, transform: `translate(-50%,-50%) rotate(${t * 90 + i * 40}deg) scale(${p > 0 ? 1 - prog(t, rightAt + 0.9, rightAt + 1.6) * 0.6 : 0})`, opacity: p > 0 ? 1 : 0 }}>
            {i % 2 ? <Sparkle className="w-full h-full" fill={i % 4 === 1 ? '#fff' : SUN} /> : <Star className="w-full h-full" />}
          </div>
        )
      })}
    </div>
  )
}

// ── 4. The free test, that feels like a game ────────────────────────────────
function Test({ t, d, ws }: SceneProps) {
  const C = d.timings.cuts
  const L = d.timings.lines
  const enter = inOut3(prog(t, C[3] - 0.2, C[3] + 0.25))
  const zoomOut = in3(prog(t, C[4] - 0.15, C[4] + 0.3))
  const rise = spring(prog(t, C[3] - 0.05, C[3] + 0.85))
  const root = useRef<HTMLDivElement>(null)
  const span = Math.max(2.6, C[4] - C[3])
  const tap1 = C[3] + span * 0.36
  const next1 = tap1 + 0.42
  const tap2 = next1 + 0.62
  const next2 = tap2 + 0.36
  const second = t >= next1 + 0.12
  const slide = inOut3(prog(t, next1 + 0.02, next1 + 0.3))
  const q = second ? d.test[1] : d.test[0]
  const pts = useOptionCentres(root)
  const choice = second ? (t >= tap2 ? 2 : null) : t >= tap1 ? 1 : null
  const n0 = d.test[0].n
  const nNow = t < next1 ? n0 : t < next2 ? n0 + 1 : lerp(n0 + 1, d.testOf - 2, out3(prog(t, next2, next2 + 0.6)))
  const pct = (nNow / d.testOf) * 100
  const pressNext = (at: number) => (t >= at && t < at + 0.14 ? 4 : 0)
  const freeAt = ws(3, 'free')
  const gameAt = ws(3, 'game')
  const tilt = lerp(16, 0, rise)
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ transform: `translateY(${(1 - enter) * H}px)`, background: 'linear-gradient(180deg,#E7F2FE 0%,#F5FAFF 55%,#DCEEFF 100%)' }}>
      <div className="absolute rounded-full" style={{ left: -300, top: 900, width: 900, height: 900, background: 'radial-gradient(circle, rgba(47,143,234,0.22), rgba(47,143,234,0) 65%)' }} />
      <div className="absolute rounded-full" style={{ left: 560, top: 300, width: 800, height: 800, background: 'radial-gradient(circle, rgba(255,197,48,0.25), rgba(255,197,48,0) 65%)' }} />

      <div className="absolute left-[64px] right-[64px] top-[360px] font-black tracking-tight leading-[1.0]" style={{ letterSpacing: '-0.035em', opacity: 1 - zoomOut }}>
        <p className="text-[120px]" style={{ color: BLUE_DARK }}>
          <Word t={t} at={freeAt}>Free</Word> <Word t={t} at={ws(3, 'test')}>test.</Word>
        </p>
        <p className="text-[84px] mt-2" style={{ color: INK }}>
          <Said t={t} words={L[3].words.slice(-5)} text="It feels like a game." gap="0.22em" />
        </p>
      </div>

      {/* The phone rises, tilted back, and settles. */}
      <div className="absolute inset-0" style={{ perspective: 2200, transform: `scale(${1 + zoomOut * 1.4})`, transformOrigin: '540px 1150px', opacity: 1 - zoomOut }}>
        <div className="absolute" style={{ left: 0, top: 0, width: W, height: H, transform: `translateY(${(1 - rise) * 1100}px) rotateX(${tilt}deg) rotateY(${Math.sin(t * 0.9) * 3 - 2}deg)`, transformOrigin: '540px 1400px', transformStyle: 'preserve-3d' }}>
          <Phone width={600} style={{ left: 240, top: 690 }}>
            <div ref={root} className="relative px-5 pt-2" style={{ transform: `translateX(${second ? (1 - slide) * 390 : 0}px)` }}>
              <div className="flex items-center gap-3 mb-4">
                <X className="w-6 h-6 text-gray-400 shrink-0" aria-hidden />
                <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-teal-400 relative" style={{ width: `${pct}%` }}>
                    <span className="absolute left-2 right-2 top-1 h-1 rounded-full bg-white/40" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-500">Question {Math.round(nNow)} of {d.testOf}</span>
                <span className="inline-block rounded-full bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1">Grade 5 Maths</span>
              </div>
              <div className="[&_.text-xl]:!text-[21px] [&_.sm\:text-2xl]:!text-[21px]">
                <QuestionView compact question={q} answer={choice} onAnswer={() => {}} />
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500">
                  <HelpCircle className="w-4 h-4" aria-hidden />
                  I&apos;m not sure
                </span>
                <span className="btn-primary" style={{ transform: `translateY(${pressNext(second ? next2 : next1)}px)` }}>
                  Next
                </span>
              </div>
              {pts[second ? 2 : 1] && <Tap t={t} at={second ? tap2 : tap1} x={pts[second ? 2 : 1].x} y={pts[second ? 2 : 1].y} />}
            </div>
          </Phone>
        </div>
      </div>

      {/* Stickers: free, and every year level. */}
      <div className="absolute flex items-center justify-center rounded-full font-black text-[44px]" style={{ left: 780, top: 640, width: 210, height: 210, background: SUN, color: INK, boxShadow: '0 10px 0 #E0A400, 0 30px 40px -10px rgba(0,0,0,0.25)', transform: `rotate(${12 + Math.sin(t * 2.4) * 4}deg) scale(${spring(prog(t, freeAt, freeAt + 0.6)) * (1 - zoomOut)})`, letterSpacing: '-0.02em' }}>
        FREE
      </div>
      <div className="absolute inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-[34px] font-black" style={{ left: 40, top: 1120, color: INK, boxShadow: '0 8px 0 #D6E4F5, 0 24px 34px -14px rgba(15,30,60,0.3)', transform: `rotate(-5deg) scale(${spring(prog(t, gameAt - 0.1, gameAt + 0.5)) * (1 - zoomOut)})` }}>
        <Sparkles className="w-9 h-9 text-brand-500" aria-hidden />
        Grade 3 to Year 12
      </div>
      <div className="absolute" style={{ left: 760, top: 1290 + Math.sin(t * 3) * 10, width: 300, height: 300, transform: `scale(${spring(prog(t, gameAt, gameAt + 0.7)) * (1 - zoomOut)}) rotate(6deg)` }}>
        <Bird pose="cheer" className="w-full h-full" />
      </div>
    </div>
  )
}

// ── 5. The report: strong skills, and exactly what needs work ───────────────
function ScoreRing({ correct, total, p }: { correct: number; total: number; p: number }) {
  const r = 30
  const c = 2 * Math.PI * r
  const share = total ? (correct / total) * p : 0
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 72 72" className="w-20 h-20 -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#EEF6FE" strokeWidth="9" />
        <circle cx="36" cy="36" r={r} fill="none" stroke="#2F8FEA" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${c * share} ${c}`} />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold leading-none">{Math.round(correct * p)}</span>
        <span className="text-[11px] text-gray-500">of {total}</span>
      </span>
    </div>
  )
}

function Report({ t, d, ws }: SceneProps) {
  const C = d.timings.cuts
  const h = d.headline
  // Wipes up over the zooming phone: no double exposure of two busy screens.
  const wipe = inOut3(prog(t, C[4] - 0.15, C[4] + 0.25))
  const enter = out3(prog(t, C[4] - 0.05, C[4] + 0.45))
  const leave = inOut3(prog(t, C[5] - 0.15, C[5] + 0.3))
  const strongAt = ws(4, 5)
  const exactlyAt = ws(4, 7)
  const fill = (i: number) => out3(prog(t, C[4] + 0.25 + i * 0.16, C[4] + 0.95 + i * 0.16))
  const spot = out3(prog(t, exactlyAt - 0.05, exactlyAt + 0.35))
  const focusIdx = h.areas.findIndex(a => a.id === d.focusId)
  const scale = 2.0
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(${(1 - wipe) * 100}% 0 0 0 round ${(1 - wipe) * 120}px ${(1 - wipe) * 120}px 0 0)`, transform: `translateX(${-leave * W}px)`, background: 'linear-gradient(180deg,#F4F9FF 0%,#FFFFFF 50%,#F1F7EC 100%)' }}>
      <div className="absolute rounded-full" style={{ left: 520, top: 1200, width: 900, height: 900, background: 'radial-gradient(circle, rgba(88,204,2,0.16), rgba(88,204,2,0) 65%)' }} />
      <div className="absolute left-[64px] right-[64px] top-[360px] font-black tracking-tight leading-[1.02]" style={{ letterSpacing: '-0.035em' }}>
        <p className="text-[76px]" style={{ color: '#2E7D00' }}>
          <Word t={t} at={ws(4, 3)}>Strong</Word> <Word t={t} at={strongAt}>skills.</Word>
        </p>
        <p className="text-[108px] leading-[0.98]" style={{ color: '#C76400' }}>
          {/* "…and exactly which need work": words 7 to 10. */}
          <Word t={t} at={exactlyAt}>Exactly</Word> <Word t={t} at={ws(4, 8)}>what</Word>
          <br />
          <Word t={t} at={ws(4, 9)}>needs</Word> <Word t={t} at={ws(4, 10)}>work.</Word>
        </p>
      </div>

      <div className="absolute" style={{ left: 60, top: 790, width: 480, transform: `scale(${scale * lerp(0.92, 1, enter)}) translateY(${(1 - enter) * 60}px)`, transformOrigin: '0 0' }}>
        <div className="rounded-[26px] bg-white border-2 border-b-[7px] border-[#E5E7EB] p-6" style={{ boxShadow: '0 30px 60px -30px rgba(15,30,60,0.35)' }}>
          <div className="flex items-start gap-4 mb-4">
            <ScoreRing correct={h.correct} total={h.total} p={out3(prog(t, C[4] + 0.1, C[4] + 1.1))} />
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-brand-600 mb-1">Grade 5 Maths</p>
              <h2 className="text-[22px] font-black tracking-tight leading-tight">{h.name}&rsquo;s results</h2>
              <p className="text-[13px] text-gray-500 mt-1 leading-snug">Every area, weakest first, with how sure the result is.</p>
            </div>
          </div>
          <ul className="divide-y divide-gray-100">
            {h.areas.map((a, i) => {
              const isFocus = i === focusIdx
              const dim = isFocus ? 1 : 1 - spot * 0.55
              const chip = back(prog(t, C[4] + 0.75 + i * 0.16, C[4] + 1.1 + i * 0.16))
              return (
                <li key={a.id} className="relative py-3" style={{ opacity: dim }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[15px] font-black text-gray-900">{a.label}</span>
                    <span style={{ transform: `scale(${chip})`, transformOrigin: '100% 50%', display: 'inline-block' }}>
                      <LevelChip level={a.level} />
                    </span>
                  </div>
                  <AreaBar pct={a.pct * fill(i)} level={a.level} label={a.label} />
                  <p className="text-xs text-gray-500 mt-1.5">
                    {Math.round(a.correct * fill(i))} of {a.total} correct
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
        {/* The weak area, circled in pen. */}
        {focusIdx >= 0 && (
          <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0 }} width="480" height="600">
            <Stroke
              d={`M 30 ${150 + focusIdx * 76} C 20 ${118 + focusIdx * 76}, 200 ${108 + focusIdx * 76}, 455 ${120 + focusIdx * 76} C 482 ${124 + focusIdx * 76}, 486 ${196 + focusIdx * 76}, 440 ${200 + focusIdx * 76} C 300 ${212 + focusIdx * 76}, 60 ${210 + focusIdx * 76}, 22 ${186 + focusIdx * 76} C 6 ${170 + focusIdx * 76}, 16 ${140 + focusIdx * 76}, 60 ${128 + focusIdx * 76}`}
              t={t}
              a={exactlyAt}
              b={exactlyAt + 0.45}
              color={ORANGE}
              width={4.5}
              length={1300}
            />
          </svg>
        )}
      </div>

      <div
        className="absolute inline-flex items-center gap-3 rounded-full px-8 py-5 text-[40px] font-black text-white"
        style={{ right: 40, top: 1530, background: ORANGE, boxShadow: '0 10px 0 #C76400, 0 28px 40px -14px rgba(0,0,0,0.3)', transform: `rotate(-3deg) scale(${spring(prog(t, exactlyAt + 0.2, exactlyAt + 0.8))})`, transformOrigin: '80% 50%' }}
      >
        <Target className="w-11 h-11" aria-hidden />
        Focus: {h.areas[focusIdx]?.label}
      </div>
    </div>
  )
}

// ── 6. Practice papers on just those skills, on screen or printed ───────────
function Papers({ t, d, ws }: SceneProps) {
  const C = d.timings.cuts
  const L = d.timings.lines
  const enter = inOut3(prog(t, C[5] - 0.15, C[5] + 0.3))
  const focus = d.headline.areas.find(a => a.id === d.focusId)?.label ?? ''
  const tapAt = C[5] + 0.45
  const screenAt = ws(5, 'screen')
  const printedAt = ws(5, 'printed')
  const made = spring(prog(t, tapAt + 0.15, tapAt + 0.85))
  const phoneIn = spring(prog(t, screenAt - 0.45, screenAt + 0.4))
  const pageIn = spring(prog(t, printedAt - 0.45, printedAt + 0.45))
  const secs = Math.max(0, 25 * 60 - Math.floor((t - C[5]) * 1) - 78)
  const clock = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ transform: `translateX(${(1 - enter) * W}px)`, background: 'linear-gradient(180deg,#F8F0FF 0%,#FBF7FF 50%,#F1E3FF 100%)' }}>
      <div className="absolute rounded-full" style={{ left: -200, top: 1200, width: 900, height: 900, background: 'radial-gradient(circle, rgba(206,130,255,0.25), rgba(206,130,255,0) 65%)' }} />
      <div className="absolute left-[64px] right-[64px] top-[360px] font-black tracking-tight leading-[1.02]" style={{ letterSpacing: '-0.035em', color: INK }}>
        <p className="text-[92px]">
          <Said t={t} words={L[5].words.slice(1, 3)} text="Practice papers" />
        </p>
        <p className="text-[92px]">
          <Word t={t} at={ws(5, 'on')}>on</Word>{' '}
          <span className="relative inline-block">
            <span className="absolute rounded-[18px]" style={{ left: -12, right: -12, top: 28, bottom: 6, background: '#E2B8FF', transform: `scaleX(${outExpo(prog(t, ws(5, 'just'), ws(5, 'skills') + 0.2))}) skewX(-8deg)`, transformOrigin: '0 50%' }} />
            <span className="relative">
              <Said t={t} words={L[5].words.slice(4, 7)} text="just those skills." gap="0.22em" />
            </span>
          </span>
        </p>
      </div>

      {/* The focus area, carried over, and the button that makes a paper. */}
      <div className="absolute left-[64px] top-[640px] flex items-center gap-4" style={{ opacity: 1 - prog(t, screenAt - 0.5, screenAt - 0.2) }}>
        <span className="inline-flex items-center gap-3 rounded-full px-7 py-4 text-[38px] font-black text-white" style={{ background: ORANGE, boxShadow: '0 8px 0 #C76400' }}>
          <Target className="w-10 h-10" aria-hidden />
          {focus}
        </span>
      </div>
      <div className="absolute left-[64px] top-[790px]" style={{ opacity: 1 - prog(t, screenAt - 0.5, screenAt - 0.2) }}>
        <span className="relative inline-block rounded-[26px] px-12 py-7 text-[46px] font-black text-white" style={{ background: BLUE, boxShadow: `0 ${t >= tapAt && t < tapAt + 0.15 ? 3 : 12}px 0 #165EA6`, transform: `translateY(${t >= tapAt && t < tapAt + 0.15 ? 9 : 0}px)` }}>
          Generate a practice paper
          <Tap t={t} at={tapAt} x={560} y={58} scale={2} />
        </span>
      </div>
      <div className="absolute left-[64px] top-[960px] flex gap-4" style={{ opacity: made * (1 - prog(t, screenAt - 0.5, screenAt - 0.2)) }}>
        {[1, 2, 3].map(n => (
          <span key={n} className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-[32px] font-black" style={{ color: INK, boxShadow: '0 6px 0 #E2D2F2', transform: `translateY(${(1 - spring(prog(t, tapAt + 0.15 + n * 0.1, tapAt + 0.75 + n * 0.1))) * 80}px)`, opacity: prog(t, tapAt + 0.15 + n * 0.1, tapAt + 0.25 + n * 0.1) }}>
            <NotebookPen className="w-8 h-8 text-grape-500" aria-hidden />
            Paper {n}
          </span>
        ))}
      </div>

      {/* On screen: the paper on a phone. */}
      <div className="absolute inset-0" style={{ transform: `translateY(${(1 - phoneIn) * 1300}px)` }}>
        <div className="absolute" style={{ left: 30, top: 700, width: 470, height: 1100, transform: 'rotate(-6deg)' }}>
          <Phone width={470} style={{ left: 0, top: 0 }}>
            <div className="px-5 pt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-black text-grape-600 uppercase tracking-wider">{focus} · Paper 1</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[13px] font-bold text-gray-600">
                  <Timer className="w-3.5 h-3.5" aria-hidden />
                  {clock}
                </span>
              </div>
              <div className="[&_.text-xl]:!text-[19px] [&_.sm\:text-2xl]:!text-[19px]">
                <QuestionView compact question={d.paperQuestion} answer={null} onAnswer={() => {}} />
              </div>
              <div className="flex gap-2 mt-4">
                <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-line px-3 py-1.5 text-[13px] font-bold text-gray-500">
                  <PenLine className="w-4 h-4" aria-hidden />
                  Draw
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-brand-500 bg-brand-50 px-3 py-1.5 text-[13px] font-bold text-brand-700">
                  <NotebookPen className="w-4 h-4" aria-hidden />
                  Notes
                </span>
              </div>
            </div>
          </Phone>
        </div>
        <div className="absolute inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-[40px] font-black" style={{ left: 64, top: 650, color: INK, boxShadow: '0 8px 0 #E2D2F2, 0 24px 34px -14px rgba(60,20,90,0.3)', transform: `rotate(-6deg) scale(${spring(prog(t, screenAt, screenAt + 0.5))})` }}>
          <Smartphone className="w-10 h-10 text-brand-500" aria-hidden />
          On screen
        </div>
      </div>

      {/* Or printed: real pages of the paper and its answers. */}
      <div className="absolute inset-0" style={{ transform: `translateX(${(1 - pageIn) * 900}px)` }}>
        {[1, 0].map(k => (
          <div key={k} className="absolute bg-white" style={{ left: 520 + k * 40, top: 760 - k * 30, width: 500, height: 500 * 1.414, transform: `rotate(${5 + k * 5}deg)`, boxShadow: '0 30px 50px -18px rgba(60,20,90,0.35)' }}>
            <img src={d.pages[k]} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="absolute inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-[40px] font-black" style={{ left: 640, top: 650, color: INK, boxShadow: '0 8px 0 #E2D2F2, 0 24px 34px -14px rgba(60,20,90,0.3)', transform: `rotate(4deg) scale(${spring(prog(t, printedAt, printedAt + 0.5))})` }}>
          <Printer className="w-10 h-10 text-grape-500" aria-hidden />
          Or printed
        </div>
      </div>
    </div>
  )
}

// ── 7. Watch the gaps close ─────────────────────────────────────────────────
function Gaps({ t, d, ws }: SceneProps) {
  const C = d.timings.cuts
  const L = d.timings.lines
  const r = inOut3(prog(t, C[6] - 0.12, C[6] + 0.3)) * 2400
  const area = d.headline.areas.find(a => a.id === d.focusId) ?? d.headline.areas[0]
  const closeAt = ws(6, 'gaps')
  const grow = inOut3(prog(t, C[6] + 0.25, closeAt + 0.55))
  const done = t >= closeAt + 0.5
  const pct = lerp(area.pct, 100, grow)
  const correct = Math.round(lerp(area.correct, area.total, grow))
  const flip = prog(t, closeAt + 0.42, closeAt + 0.66)
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: GREEN, clipPath: `circle(${r}px at 540px 1250px)` }}>
      <Rays t={t} at="50% 62%" color="rgba(255,255,255,0.12)" />
      <div className="absolute left-[64px] right-[64px] top-[360px] text-center font-black tracking-tight text-white leading-[1.0]" style={{ letterSpacing: '-0.035em', textShadow: '0 8px 0 rgba(46,125,0,0.55)' }}>
        <p className="text-[112px]">
          <Said t={t} words={L[6].words.slice(3, 5)} text="Watch the" />
        </p>
        <p className="text-[140px]">
          <Said t={t} words={L[6].words.slice(5)} text="gaps close." />
        </p>
      </div>

      <div className="absolute" style={{ left: 90, top: 760, width: 450, transform: `scale(2) translateY(${(1 - spring(prog(t, C[6], C[6] + 0.6))) * 300}px)`, transformOrigin: '0 0' }}>
        <div className="rounded-[22px] bg-white border-2 border-b-[7px] border-[#2E7D00]/30 px-5 py-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-[16px] font-black text-gray-900">{area.label}</span>
            <span className="inline-block" style={{ transform: `rotateX(${flip < 0.5 ? flip * 180 : (1 - flip) * 180}deg)` }}>
              {flip < 0.5 ? <LevelChip level={area.level} /> : <LevelChip level="strength" />}
            </span>
          </div>
          <AreaBar pct={pct} level={done ? 'strength' : area.level} label={area.label} />
          <p className="text-xs text-gray-500 mt-1.5">
            {correct} of {area.total} correct
          </p>
        </div>
        <div className="flex gap-2 mt-3">
          {[1, 2, 3].map(n => {
            const at = C[6] + 0.25 + n * ((closeAt + 0.3 - C[6] - 0.25) / 3.2)
            const p = back(prog(t, at, at + 0.3))
            return (
              <span key={n} className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-[13px] font-black text-ink" style={{ transform: `scale(${p})` }}>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-400 text-white">
                  <Check className="w-3.5 h-3.5" strokeWidth={4} aria-hidden />
                </span>
                Paper {n}
              </span>
            )
          })}
        </div>
      </div>

      <Confetti t={t} at={closeAt + 0.5} x={540} y={1000} palette={['#FFFFFF', SUN, BLUE, ORANGE, GRAPE]} />
      <div className="absolute" style={{ left: 290, top: 1180 + Math.sin(t * 3) * 10, width: 500, height: 500, transform: `scale(${spring(prog(t, closeAt + 0.35, closeAt + 1.0))})` }}>
        <Bird pose="trophy" className="w-full h-full" />
      </div>
    </div>
  )
}

// ── 8. Try the free test now ────────────────────────────────────────────────
function Cta({ t, d, ws }: SceneProps) {
  const C = d.timings.cuts
  const L = d.timings.lines
  const r = inOut3(prog(t, C[7] - 0.15, C[7] + 0.35)) * 2400
  const tryAt = ws(7, 'try')
  const nowAt = ws(7, 'now')
  const urlAt = ws(7, 'prep')
  const lastWord = L[7].words[L[7].words.length - 1].e
  const btn = spring(prog(t, tryAt - 0.1, tryAt + 0.55))
  const pressed = t >= nowAt + 0.05 && t < nowAt + 0.2
  const pulse = t > lastWord ? 1 + 0.035 * Math.max(0, Math.sin((t - lastWord) * 6)) : 1
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: BLUE, clipPath: `circle(${r}px at 540px 1300px)` }}>
      <Rays t={t} at="50% 26%" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 35% at 50% 26%, rgba(255,255,255,0.22), rgba(255,255,255,0) 70%)' }} />
      {[
        { x: 150, y: 330, s: 80, k: 0 },
        { x: 880, y: 300, s: 96, k: 1 },
        { x: 120, y: 820, s: 60, k: 2 },
        { x: 930, y: 760, s: 64, k: 3 },
      ].map(o => (
        <div key={o.k} className="absolute" style={{ left: o.x, top: o.y + Math.sin(t * 2.2 + o.k) * 14, width: o.s, height: o.s, transform: `translate(-50%,-50%) rotate(${t * (o.k % 2 ? 30 : -24)}deg) scale(${spring(prog(t, C[7] + 0.3 + o.k * 0.08, C[7] + 0.9 + o.k * 0.08))})` }}>
          {o.k % 2 ? <Star className="w-full h-full" /> : <Sparkle className="w-full h-full" fill={o.k === 2 ? '#fff' : SUN} />}
        </div>
      ))}
      <div className="absolute" style={{ left: 290, top: 300 + Math.sin(t * 3) * 12, width: 500, height: 500, transform: `scale(${spring(prog(t, C[7] + 0.05, C[7] + 0.75))})` }}>
        <div className="absolute inset-[44px] rounded-full" style={{ background: SUN, boxShadow: 'inset 0 -14px 0 rgba(224,164,0,0.6)' }} />
        <Bird pose="cheer" className="relative w-full h-full" />
      </div>
      <div className="absolute left-0 right-0 flex justify-center" style={{ top: 830, transform: `scale(${spring(prog(t, C[7] + 0.25, C[7] + 0.85))})` }}>
        <Logo size={1.9} />
      </div>
      <div className="absolute left-0 right-0 flex justify-center" style={{ top: 1010, transform: `scale(${btn * pulse})` }}>
        <span className="relative inline-block rounded-[34px] px-14 py-8 text-[64px] font-black" style={{ color: INK, background: SUN, letterSpacing: '-0.02em', boxShadow: `0 ${pressed ? 4 : 14}px 0 #E0A400, 0 34px 50px -18px rgba(0,0,0,0.35)`, transform: `translateY(${pressed ? 10 : 0}px)` }}>
          Try the free test now
          <Tap t={t} at={nowAt + 0.05} x={640} y={70} scale={2.2} />
        </span>
      </div>
      <p className="absolute left-0 right-0 text-center font-black text-white" style={{ top: 1200, fontSize: 70, letterSpacing: '-0.02em', textShadow: '0 6px 0 rgba(22,94,166,0.6)' }}>
        <Word t={t} at={urlAt}>prepnest.com.au</Word>
      </p>
      <p className="absolute left-0 right-0 text-center font-black text-white/85" style={{ top: 1305, fontSize: 36, opacity: out3(prog(t, lastWord + 0.1, lastWord + 0.5)), transform: `translateY(${(1 - out3(prog(t, lastWord + 0.1, lastWord + 0.5))) * 20}px)` }}>
        Grade 3 to Year 12 · No account needed to start
      </p>
    </div>
  )
}
