'use client'

import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { Target } from 'lucide-react'
import Bird, { BirdMark, type BirdPose } from '@/components/brand/Bird'
import { CheckSticker, Cloud, PencilSticker, Sparkle, Star } from '@/components/brand/Decor'
import QuestionView from '@/components/diagnostic/QuestionView'
import type { ScreenQuestion } from '@/lib/web/questionHtml'
import timings from '../../../../marketing/instagram/ad-grow/timings.json'

// ─────────────────────────────────────────────────────────────────────────────
// "They grow up so quickly": a reel for parents, 1080×1920, about 50 seconds,
// as a function of time. A hand-drawn storybook look: warm mottled paper,
// ink outlines, handwritten words, smooth eased motion, a slow camera push on
// every scene and soft crossfades between them.
//
// Nothing animates by itself, so marketing/instagram/render-ad.mjs can step
// through it (window.__setAdTime) and every render is identical. Open it with
// ?play to watch it in real time. The voice lines and their timings come from
// the soundtrack (marketing/instagram/ad-grow: kokoro_voice.py, then
// audio.py); re-voice it and the scenes follow.
// ─────────────────────────────────────────────────────────────────────────────

const L = timings.lines
export const AD_LENGTH = timings.length
const TEXT = [
  'They grow up so quickly.',
  "One day, it's counting on their fingers. The next, it's algebra you haven't seen in years.",
  'Between school runs, work and dinner, the weeks just fly by.',
  "And it's so easy to miss the quiet moment they start to fall behind.",
  'A topic that never quite clicked. A question they were too shy to ask.',
  'You wonder. Are they keeping up? Am I doing enough?',
  "PrepNest helps you see what's really going on.",
  'Our free test shows exactly where your child needs help.',
  'Then their practice is made just for those skills.',
  'So nothing slips through the cracks, and they grow up confident.',
  'Try the free test now, at prepnest.com.au',
]
const INK = '#3B2F2A'
/** The first line of each scene (lines 4 and 5 share the staircase). */
const SCENE_LINES = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10]
const FADE = 0.55

/** A scene begins just before its first line. */
const sceneStart = (s: number) => (s === 0 ? 0 : L[SCENE_LINES[s]].start - 0.45)
const sceneEnd = (s: number) => (s + 1 < SCENE_LINES.length ? sceneStart(s + 1) + FADE : AD_LENGTH)

/** When word `k` of a line is spoken: paced by letters, with a breath at punctuation. */
const wordAt = (line: number, k: number) => {
  const weights = TEXT[line].split(' ').map(w => w.length + 1 + (/[.?!]$/.test(w) ? 6 : /,$/.test(w) ? 3 : 0))
  const total = weights.reduce((a, b) => a + b, 0)
  const before = weights.slice(0, k).reduce((a, b) => a + b, 0)
  return L[line].start + ((L[line].end - L[line].start) * before) / total
}

const clamp = (x: number) => Math.max(0, Math.min(1, x))
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3)
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const back = (p: number) => {
  const c1 = 1.5
  const c3 = c1 + 1
  return p <= 0 ? 0 : 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2)
}

// Paper: a fine grain over soft, blotchy mottling, like watercolour paper.
const svgTile = (body: string, size: number) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>${body}</svg>`)}")`
const GRAIN = svgTile(
  `<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0 0.1  0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/>`,
  300
)
const MOTTLE = svgTile(
  `<filter id='m'><feTurbulence type='fractalNoise' baseFrequency='0.006' numOctaves='4' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.15  0 0 0 0.38 -0.1'/></filter><rect width='100%' height='100%' filter='url(#m)'/>`,
  1100
)
const SOFT_SHADOW = 'drop-shadow(0 10px 14px rgba(70,45,15,0.18))'
const inked = (width = 4): React.CSSProperties => ({ border: `${width}px solid ${INK}` })

function Backdrop({ color, layers, children }: { color: string; layers?: string; children?: React.ReactNode }) {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: color, backgroundImage: [GRAIN, MOTTLE, layers].filter(Boolean).join(', ') }}>
      {children}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 58%, rgba(60,38,12,0.22) 100%)' }} />
    </div>
  )
}

export interface AdGrowData {
  hand: string
  young: ScreenQuestion
  older: ScreenQuestion
  report: React.ReactNode
  focus: string
  pages: string[]
}

export default function AdGrowTimeline(d: AdGrowData) {
  const [t, setT] = useState(0)
  // Drawn in the browser only, so server and browser maths never disagree.
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
  const scenes = [doorFrame, homework, weeksFly, staircase, night, prepnest, report, practice, stairsFixed, callToAction]

  // The current scene, with the one before it still fading out underneath.
  const visible = scenes.map((_, s) => s).filter(s => t >= sceneStart(s) && t < sceneEnd(s))
  if (!mounted) return null

  return (
    <div className="fixed left-0 top-0 z-[100] overflow-hidden font-sans bg-[#EFE3CC]" style={{ width: 1080, height: 1920 }}>
      {visible.map(s => {
        const u = t - sceneStart(s)
        const span = sceneEnd(s) - sceneStart(s)
        const push = 1 + 0.045 * easeInOut(clamp(u / span))
        return (
          <div key={s} className="absolute inset-0" style={{ opacity: s === 0 ? 1 : easeInOut(prog(u, 0, FADE)), transform: `scale(${push})`, transformOrigin: '50% 58%' }}>
            {scenes[s](u)}
          </div>
        )
      })}
      <Caption t={t} hand={hand} />
    </div>
  )

  // ── 1. The door frame: they grow up so quickly ───────────────────────────
  function doorFrame(u: number) {
    const marks = ['Grade 3', 'Grade 5', 'Year 7', 'Year 9', 'Year 11']
    const markAt = (k: number) => 0.9 + k * 0.5
    const markY = (k: number) => 1500 - k * 170
    // The pencil glides from mark to mark.
    const pk = clamp((u - markAt(0)) / (markAt(4) - markAt(0))) * 4
    const base = Math.min(3, Math.floor(pk))
    const pencilY = markY(base) + (markY(base + 1) - markY(base)) * easeInOut(pk - base)
    return (
      <Backdrop color="#F1E4CB" layers="repeating-linear-gradient(90deg, rgba(255,255,255,0.28) 0 50px, transparent 50px 100px)">
        <div className="absolute left-[60px] top-[560px] w-[230px] h-[280px] rounded-[10px] bg-[#D9EBF2]" style={{ ...inked(5), transform: 'rotate(-2deg)' }}>
          <div className="absolute inset-[14px]" style={{ border: `4px solid ${INK}`, background: 'linear-gradient(#BFE0FA, #E8F4FB)' }} />
          <div className="absolute left-1/2 top-[14px] bottom-[14px] w-[4px] -ml-[2px]" style={{ background: INK }} />
          <div className="absolute top-1/2 left-[14px] right-[14px] h-[4px] -mt-[2px]" style={{ background: INK }} />
        </div>
        <div className="absolute left-[330px] top-[420px] w-[160px] h-[1300px]" style={{ ...inked(5), backgroundColor: '#C8965F', backgroundImage: `${GRAIN}, repeating-linear-gradient(90deg, rgba(90,55,20,0.16) 0 3px, transparent 3px 26px)` }} />
        <div className="absolute left-0 right-0 top-[1700px] h-[220px]" style={{ borderTop: `5px solid ${INK}`, backgroundColor: '#B98756', backgroundImage: `${GRAIN}, repeating-linear-gradient(90deg, rgba(60,35,10,0.2) 0 4px, transparent 4px 180px)` }} />
        {marks.map((label, k) => {
          const p = easeOut(prog(u, markAt(k), markAt(k) + 0.35))
          return (
            <div key={label} className="absolute left-[330px] flex items-center" style={{ top: markY(k) }}>
              <span className="block h-[6px] rounded-full" style={{ width: 210 * p, background: INK }} />
              <span className={`${hand} ml-5 text-[66px] leading-none`} style={{ color: INK, opacity: prog(u, markAt(k) + 0.15, markAt(k) + 0.45) }}>
                {label}
              </span>
            </div>
          )
        })}
        <div className="absolute w-[150px] h-[150px]" style={{ left: 470, top: pencilY - 120, opacity: prog(u, 0.5, 0.8), transform: 'rotate(-35deg)' }}>
          <PencilSticker className="w-full h-full" />
        </div>
      </Backdrop>
    )
  }

  // ── 2. Homework: from counting to algebra ───────────────────────────────
  function homework(u: number) {
    const at = wordAt(1, 7) - 0.15 - sceneStart(1) // "The next, it's algebra"
    return (
      <Backdrop color="#E2C79B" layers="repeating-linear-gradient(0deg, rgba(90,55,20,0.22) 0 4px, transparent 4px 250px)">
        <div className="absolute left-[50px] top-[600px] w-[980px] rounded-[30px] bg-[#FFFDF7] p-8" style={{ ...inked(5), filter: SOFT_SHADOW, transform: `translateY(${1300 * (1 - easeOut(prog(u, 0.15, 0.85)))}px) rotate(-2deg)` }}>
          <div style={{ zoom: 1.75 }}>
            <QuestionView question={d.young} answer={null} onAnswer={() => {}} />
          </div>
        </div>
        <Note hand={hand} text="Grade 3" color="#FFE38A" x={760} y={540} rot={6} p={prog(u, 0.8, 1.15)} />
        <div className="absolute left-[50px] top-[900px] w-[980px] rounded-[30px] bg-[#FFFDF7] p-8" style={{ ...inked(5), filter: SOFT_SHADOW, transform: `translateX(${1200 * (1 - easeOut(prog(u, at, at + 0.7)))}px) rotate(2.5deg)` }}>
          <div style={{ zoom: 1.75 }}>
            <QuestionView question={d.older} answer={null} onAnswer={() => {}} />
          </div>
          <p className={`${hand} mt-5 text-[60px]`} style={{ color: INK, clipPath: `inset(0 ${100 - 100 * prog(u, at + 1.2, at + 2.0)}% 0 0)` }}>
            6x − 15 ... ?
          </p>
        </div>
        <Note hand={hand} text="Year 9" color="#FFB9C9" x={770} y={840} rot={-5} p={prog(u, at + 0.6, at + 0.95)} />
        <Mug x={720} y={1570} p={prog(u, at + 1.0, at + 1.4)} t={t} steam />
      </Backdrop>
    )
  }

  // ── 3. The weeks fly by ─────────────────────────────────────────────────
  function weeksFly(u: number) {
    return (
      <Backdrop color="#D8E7EC">
        <TearOffCalendar u={u} hand={hand} />
        <PaperClock u={u} />
      </Backdrop>
    )
  }

  // ── 4. The staircase with a missing step ────────────────────────────────
  function staircase() {
    // Hops up the first three steps, then stops at the edge of the gap.
    const hop = (t - L[3].start) / 0.85
    const k = Math.max(0, Math.min(2, Math.floor(hop)))
    const p = clamp(hop - Math.floor(hop))
    const moving = hop > 0 && hop < 2
    const x = STEP_X(k) + (moving ? (STEP_X(k + 1) - STEP_X(k)) * easeInOut(p) : 0)
    const y = STEP_TOP(k) - (moving ? Math.sin(Math.PI * p) * 140 + (STEP_TOP(k) - STEP_TOP(k + 1)) * easeInOut(p) : 0)
    const pose: BirdPose = t > wordAt(3, 9) ? 'think' : 'read'
    const shy = prog(t, wordAt(4, 9), wordAt(4, 10)) * (1 - prog(t, wordAt(4, 13), L[4].end + 0.2))
    return (
      <Backdrop color="#F1E4CB">
        <Staircase hand={hand} missing={prog(t, L[4].start - 0.3, L[4].start + 0.5)} fill={0} />
        <div className="absolute w-[280px] h-[280px]" style={{ left: x - 58, top: y - 268 + (moving ? 0 : Math.sin(t * 2.2) * 4) }}>
          <Bird pose={pose} className="w-full h-full" />
        </div>
        {shy > 0 && (
          <div className="absolute flex items-center justify-center rounded-full bg-[#FFFDF7] font-bold" style={{ ...inked(4), color: INK, left: x + 170, top: y - 400, width: 150, height: 150, fontSize: 96, transform: `scale(${back(shy)})`, opacity: Math.min(1, shy * 2) }}>
            ?
          </div>
        )}
      </Backdrop>
    )
  }

  // ── 5. Night: the worries ───────────────────────────────────────────────
  function night() {
    return (
      <Backdrop color="#24304F">
        <svg className="absolute" style={{ left: 740, top: 520, transform: `rotate(${Math.sin(t * 0.5) * 3}deg)` }} width="240" height="240" viewBox="0 0 240 240">
          <path d="M150 20 A100 100 0 1 0 220 170 A80 80 0 1 1 150 20 Z" fill="#F6E5AF" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        </svg>
        {[[120, 580, 60], [300, 480, 44], [620, 660, 50], [950, 860, 40], [180, 900, 36]].map(([x, y, s], i) => (
          <div key={i} className="absolute" style={{ left: x, top: y, width: s, height: s, opacity: 0.65 + 0.35 * Math.sin(t * 2 + i * 1.7), transform: `scale(${0.9 + 0.1 * Math.sin(t * 1.6 + i)})` }}>
            <Star className="w-full h-full" />
          </div>
        ))}
        <div className="absolute left-0 right-0 top-[1580px] h-[340px]" style={{ borderTop: `5px solid ${INK}`, backgroundColor: '#8A5A33', backgroundImage: `${GRAIN}, repeating-linear-gradient(0deg, rgba(40,20,5,0.25) 0 4px, transparent 4px 120px)` }} />
        <Mug x={690} y={1350} p={1} t={t} steam />
        <Thought hand={hand} text="Are they keeping up?" x={80} y={850} p={prog(t, wordAt(5, 2) - 0.15, wordAt(5, 2) + 0.35)} />
        <Thought hand={hand} text="Am I doing enough?" x={330} y={1120} p={prog(t, wordAt(5, 6) - 0.15, wordAt(5, 6) + 0.35)} />
      </Backdrop>
    )
  }

  // ── 6. PrepNest ─────────────────────────────────────────────────────────
  function prepnest(u: number) {
    return (
      <Backdrop color="#DCEBF0">
        {[[40, 640, 260, 18], [770, 780, 220, -14], [120, 1400, 200, 10]].map(([x, y, w, v], i) => (
          <div key={i} className="absolute" style={{ left: x + v * u, top: y, width: w, height: w * 0.6 }}>
            <Cloud className="w-full h-full" />
          </div>
        ))}
        <div className="absolute rounded-full bg-sun-400" style={{ ...inked(6), left: 220, top: 600, width: 640, height: 640, transform: `scale(${back(prog(u, 0.1, 0.7))})` }} />
        <div className="absolute" style={{ left: 240, top: 560, width: 600, height: 600, transform: `translateY(${360 * (1 - back(prog(u, 0.45, 1.15)))}px)`, opacity: prog(u, 0.45, 0.6) }}>
          <Bird pose="nest" className="w-full h-full" />
        </div>
        <div className="absolute left-0 right-0 top-[1310px] flex justify-center" style={{ transform: `scale(${back(prog(u, 1.2, 1.7))})` }}>
          <Wordmark />
        </div>
      </Backdrop>
    )
  }

  // ── 7. The free test's report, under the magnifier ──────────────────────
  function report(u: number) {
    const m = easeInOut(prog(u, 1.1, 2.2))
    return (
      <Backdrop color="#F1E4CB">
        <div className="absolute left-[40px] top-[560px] w-[1000px] rounded-[30px] bg-[#FFFDF7] p-4" style={{ ...inked(5), filter: SOFT_SHADOW, transform: `translateY(${1400 * (1 - easeOut(prog(u, 0.15, 0.85)))}px) rotate(-1.5deg)` }}>
          <div style={{ zoom: 1.4 }}>{d.report}</div>
        </div>
        <div className="absolute" style={{ left: 600 - 420 * m, top: 1560 - 800 * m, opacity: prog(u, 1.0, 1.3), transform: 'rotate(-20deg)' }}>
          <div className="w-[300px] h-[300px] rounded-full" style={{ border: '24px solid #6B4F2F', outline: `4px solid ${INK}`, background: 'rgba(214,235,251,0.25)' }} />
          <div className="absolute left-[250px] top-[250px] w-[60px] h-[200px] rounded-full bg-[#6B4F2F]" style={{ ...inked(4), transform: 'rotate(-45deg)', transformOrigin: 'top center' }} />
        </div>
        <div className="absolute left-[120px] top-[1490px] inline-flex items-center gap-3 rounded-full bg-amber-400 px-8 py-4 text-5xl font-bold text-white" style={{ ...inked(4), transform: `rotate(-3deg) scale(${back(prog(u, 2.3, 2.75))})` }}>
          <Target className="w-12 h-12" aria-hidden />
          Focus: {d.focus}
        </div>
      </Backdrop>
    )
  }

  // ── 8. Practice made for those skills ──────────────────────────────────
  function practice(u: number) {
    return (
      <Backdrop color="#E2C79B" layers="repeating-linear-gradient(0deg, rgba(90,55,20,0.22) 0 4px, transparent 4px 250px)">
        {d.pages.map((src, i) => {
          const at = 0.2 + i * 0.4
          return (
            <div
              key={src}
              className="absolute w-[560px] rounded-[10px] bg-white p-3"
              style={{ ...inked(4), filter: SOFT_SHADOW, left: [80, 300, 470][i], top: [620, 700, 780][i], transform: `translateY(${1400 * (1 - easeOut(prog(u, at, at + 0.7)))}px) rotate(${[-7, 2, 8][i]}deg)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="block w-full" />
              <span className={`${hand} absolute -top-9 left-6 rounded-md bg-[#FFE38A] px-5 py-1 text-[48px] leading-tight`} style={{ ...inked(3), color: INK }}>
                Paper {i + 1}
              </span>
              <div className="absolute -right-6 -bottom-6 w-[130px] h-[130px]" style={{ transform: `scale(${back(prog(u, 1.7 + i * 0.3, 2.1 + i * 0.3))})` }}>
                <CheckSticker className="w-full h-full" />
              </div>
            </div>
          )
        })}
      </Backdrop>
    )
  }

  // ── 9. The missing step goes in; up they go ─────────────────────────────
  function stairsFixed(u: number) {
    const hop = (u - 1.2) / 0.7 // from step 2 to the top
    const k = Math.max(0, Math.min(2, Math.floor(hop)))
    const p = clamp(hop - Math.floor(hop))
    const done = hop >= 3
    const a = done ? 5 : 2 + k
    const b = Math.min(5, a + 1)
    const moving = hop > 0 && !done
    const x = STEP_X(a) + (moving ? (STEP_X(b) - STEP_X(a)) * easeInOut(p) : 0)
    const y = STEP_TOP(a) - (moving ? Math.sin(Math.PI * p) * 140 + (STEP_TOP(a) - STEP_TOP(b)) * easeInOut(p) : 0)
    return (
      <Backdrop color="#F1E4CB">
        <Staircase hand={hand} missing={0} fill={easeOut(prog(u, 0.3, 1.0))} />
        <div className="absolute w-[280px] h-[280px]" style={{ left: x - 58, top: y - 268 + (moving ? 0 : Math.sin(t * 2.2) * 4) }}>
          <Bird pose={done ? 'cheer' : 'read'} className="w-full h-full" />
        </div>
        {[[-110, -300, 70], [120, -360, 80], [10, -440, 56]].map(([dx, dy, s], i) => (
          <div key={i} className="absolute" style={{ left: x + dx, top: y + dy, width: s, height: s, transform: `scale(${back(prog(hop, 3 + i * 0.25, 3.6 + i * 0.25))}) rotate(${t * 30}deg)` }}>
            <Sparkle className="w-full h-full" />
          </div>
        ))}
      </Backdrop>
    )
  }

  // ── 10. Try the free test now ───────────────────────────────────────────
  function callToAction(u: number) {
    return (
      <Backdrop color="#F3E8D2">
        {[[150, 560, 70], [860, 600, 90], [890, 1130, 56], [120, 1160, 50]].map(([x, y, s], i) => (
          <div key={i} className="absolute" style={{ left: x, top: y + Math.sin(t * 1.4 + i) * 8, width: s, height: s, opacity: prog(u, 0.8 + i * 0.15, 1.2 + i * 0.15), transform: `rotate(${t * 20 * (i % 2 ? 1 : -1)}deg)` }}>
            {i % 2 ? <Star className="w-full h-full" /> : <Sparkle className="w-full h-full" fill="#2F8FEA" />}
          </div>
        ))}
        <div className="absolute rounded-full bg-sun-400" style={{ ...inked(6), left: 270, top: 560, width: 540, height: 540, transform: `scale(${back(prog(u, 0.15, 0.7))})` }} />
        <div className="absolute" style={{ left: 260, top: 520 + Math.sin(t * 2) * 6, width: 560, height: 560, transform: `scale(${back(prog(u, 0.4, 0.95))})` }}>
          <Bird pose="cheer" className="w-full h-full" />
        </div>
        <div className="absolute left-0 right-0 top-[1140px] flex justify-center" style={{ transform: `scale(${back(prog(u, 0.9, 1.4))})` }}>
          <Wordmark />
        </div>
        <div className="absolute left-0 right-0 top-[1330px] flex justify-center" style={{ transform: `scale(${back(prog(u, 1.4, 1.9))})` }}>
          <span className="rounded-[2rem] bg-sun-400 px-14 py-7 text-6xl font-bold text-ink" style={{ ...inked(5), boxShadow: `0 10px 0 ${INK}` }}>
            Try the free test now
          </span>
        </div>
        <p className={`${hand} absolute left-0 right-0 top-[1510px] text-center text-[76px] font-bold text-brand-600`} style={{ clipPath: `inset(0 ${100 - 100 * easeInOut(prog(u, 2.0, 2.9))}% 0 0)` }}>
          prepnest.com.au
        </p>
        <p className="absolute left-0 right-0 top-[1620px] text-center text-3xl font-semibold" style={{ color: INK, opacity: prog(u, 2.9, 3.4) }}>
          Grade 3 to Year 12 · no account to start
        </p>
      </Backdrop>
    )
  }
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
    <div className="absolute left-[56px] right-[56px] top-[170px] flex justify-center" style={{ opacity: easeInOut(card), transform: `translateY(${(1 - easeOut(card)) * -16}px)` }}>
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

function Wordmark() {
  return (
    <span className="inline-flex items-center gap-4 rounded-full bg-white px-9 py-5" style={inked(5)}>
      <BirdMark className="w-20 h-20" />
      <span className="text-7xl font-bold tracking-tight text-ink">
        Prep<span className="text-brand-500">Nest</span>
      </span>
    </span>
  )
}

function Note({ hand, text, color, x, y, rot, p }: { hand: string; text: string; color: string; x: number; y: number; rot: number; p: number }) {
  if (p <= 0) return null
  return (
    <div className={`${hand} absolute px-7 py-3 text-[64px] leading-none`} style={{ ...inked(4), color: INK, left: x, top: y, background: color, transform: `rotate(${rot}deg) scale(${back(p)})` }}>
      {text}
    </div>
  )
}

function Thought({ hand, text, x, y, p }: { hand: string; text: string; x: number; y: number; p: number }) {
  if (p <= 0) return null
  return (
    <div className="absolute" style={{ left: x, top: y, transform: `scale(${back(p)})`, transformOrigin: '75% 100%', opacity: Math.min(1, p * 2) }}>
      <div className={`${hand} rounded-[90px] bg-[#FFFBF0] px-12 py-8 text-[72px] font-bold leading-none`} style={{ ...inked(4), color: INK }}>
        {text}
      </div>
      <div className="absolute right-[90px] -bottom-[48px] w-[46px] h-[46px] rounded-full bg-[#FFFBF0]" style={inked(4)} />
      <div className="absolute right-[56px] -bottom-[92px] w-[28px] h-[28px] rounded-full bg-[#FFFBF0]" style={inked(4)} />
    </div>
  )
}

/** A mug of tea, its steam curling smoothly. */
function Mug({ x, y, p, t, steam }: { x: number; y: number; p: number; t: number; steam?: boolean }) {
  if (p <= 0) return null
  return (
    <div className="absolute" style={{ left: x, top: y, transform: `scale(${back(p)})`, transformOrigin: 'bottom center' }}>
      {steam &&
        [0, 1, 2].map(i => {
          const a = Math.sin(t * 1.8 + i * 1.3) * 14
          const b = Math.cos(t * 1.5 + i) * 14
          return (
            <svg key={i} className="absolute" style={{ left: 40 + i * 52, top: -170, opacity: 0.55 + 0.25 * Math.sin(t * 1.2 + i) }} width="40" height="150" viewBox="0 0 40 150">
              <path d={`M20 145 C ${20 + a} 110, ${20 - a} 80, 20 55 S ${20 + b} 15, 20 5`} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="8" strokeLinecap="round" />
            </svg>
          )
        })}
      <div className="absolute -right-[64px] top-[34px] w-[100px] h-[118px] rounded-r-[60px]" style={{ border: `5px solid ${INK}`, borderLeft: 0, background: 'transparent' }}>
        <div className="absolute inset-[14px] rounded-r-[44px]" style={{ border: `5px solid ${INK}`, borderLeft: 0 }} />
      </div>
      <div className="relative w-[220px] h-[200px] rounded-b-[60px] rounded-t-[14px] bg-[#E9765B] overflow-hidden" style={inked(5)}>
        <div className="absolute left-0 right-0 top-0 h-[26px] bg-[#C9563E]" style={{ borderBottom: `4px solid ${INK}` }} />
      </div>
    </div>
  )
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** A tear-off calendar: pages come away faster and faster and drift to the floor. */
function TearOffCalendar({ u, hand }: { u: number; hand: string }) {
  // Page k comes off at tearAt(k); the gaps shrink, so it speeds up.
  const tearAt = (k: number) => 0.5 + Math.pow(k / 2.6, 0.62)
  const torn = Array.from({ length: 40 }, (_, k) => k).filter(k => u >= tearAt(k))
  const days = (k: number) => (k < 6 ? k : 6 + (k - 6) * 6) // a day at a time, then weeks
  const shown = new Date(Date.UTC(2026, 0, 28 + days(torn.length)))
  return (
    <>
      {/* Torn pages drifting down, then settling into a pile. */}
      {torn.map(k => {
        const f = clamp((u - tearAt(k)) / 0.9)
        const r = (n: number) => {
          const s = Math.sin((k + 1) * n * 12.9898) * 43758.5453
          return s - Math.floor(s)
        }
        const endX = 110 + r(1) * 620
        const endY = 1480 + r(2) * 170 - Math.min(k, 30) * 3
        const x = 90 + (endX - 90) * easeInOut(f)
        const y = 760 + (endY - 760) * easeInOut(f) - Math.sin(Math.PI * f) * 60
        return (
          <div key={k} className="absolute w-[230px] h-[260px] rounded-[10px] bg-[#FFFDF7] overflow-hidden" style={{ ...inked(3), left: x, top: y, transform: `rotate(${(r(3) - 0.5) * 80 * f + Math.sin(f * 6) * 8 * (1 - f)}deg)` }}>
            <div className="h-[48px] bg-[#E2574C]" style={{ borderBottom: `3px solid ${INK}` }} />
            <p className="text-center text-[110px] font-bold leading-[1.5]" style={{ color: INK, opacity: 0.85 }}>
              {new Date(Date.UTC(2026, 0, 28 + days(k))).getUTCDate()}
            </p>
          </div>
        )
      })}
      <div className="absolute left-[90px] top-[620px] w-[580px] h-[660px] rounded-[18px] bg-[#FFFDF7] overflow-hidden" style={{ ...inked(5), filter: SOFT_SHADOW }}>
        <div className="h-[130px] bg-[#E2574C] flex items-center justify-center text-white text-[64px] font-bold tracking-wide" style={{ borderBottom: `5px solid ${INK}` }}>
          {MONTHS[shown.getUTCMonth()]}
        </div>
        <p className="text-center text-[300px] font-bold leading-[1.1]" style={{ color: INK }}>
          {shown.getUTCDate()}
        </p>
        <p className={`${hand} text-center text-[72px] leading-none text-gray-500`}>{DAYS[shown.getUTCDay()]}</p>
      </div>
    </>
  )
}

function PaperClock({ u }: { u: number }) {
  const minute = 360 * Math.pow(u, 1.5) * 0.9
  return (
    <div className="absolute left-[720px] top-[660px] w-[300px] h-[300px] rounded-full bg-[#FFFDF7]" style={inked(6)}>
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className="absolute left-1/2 top-1/2 block w-[8px] h-[24px] -ml-[4px] rounded" style={{ background: INK, transform: `rotate(${i * 30}deg) translateY(-112px)` }} />
      ))}
      <span className="absolute left-1/2 top-1/2 block w-[14px] h-[74px] -ml-[7px] -mt-[74px] rounded-full origin-bottom" style={{ background: INK, transform: `rotate(${minute / 12}deg)` }} />
      <span className="absolute left-1/2 top-1/2 block w-[10px] h-[104px] -ml-[5px] -mt-[104px] rounded-full bg-[#E2574C] origin-bottom" style={{ transform: `rotate(${minute}deg)` }} />
      <span className="absolute left-1/2 top-1/2 block w-[26px] h-[26px] -ml-[13px] -mt-[13px] rounded-full" style={{ background: INK }} />
    </div>
  )
}

const STEPS = ['Counting', 'Place value', 'Times tables', 'Fractions', 'Decimals', 'Percent']
const STEP_W = 160
const STEP_X = (k: number) => 40 + k * STEP_W
const STEP_TOP = (k: number) => 1580 - k * 150
const STEP_COLOURS = ['#BFE0FA', '#A6D3F7', '#8CC5F3', '#FFC530', '#5FAEEF', '#3E9BEA']

/** Six steps of skills. `missing` fades in the gap's outline; `fill` lowers the missing step into place. */
function Staircase({ hand, missing, fill }: { hand: string; missing: number; fill: number }) {
  return (
    <>
      <div className="absolute left-0 right-0 top-[1760px] h-[160px]" style={{ borderTop: `5px solid ${INK}`, backgroundColor: '#B98756', backgroundImage: GRAIN }} />
      {STEPS.map((label, k) => {
        const gap = k === 3
        const top = STEP_TOP(k)
        if (gap && fill <= 0) {
          return (
            missing > 0 && (
              <div key={label} className="absolute rounded-[10px] border-[6px] border-dashed border-[#D9483B] flex flex-col items-center pt-5" style={{ left: STEP_X(k), top, width: STEP_W - 8, height: 1762 - top, opacity: missing }}>
                <span className={`${hand} text-[40px] leading-none text-[#D9483B]`}>{label}</span>
                <span className="mt-4 text-[90px] font-bold text-[#D9483B]">?</span>
              </div>
            )
          )
        }
        const drop = gap ? (1 - fill) * -900 : 0
        const dim = !gap && k > 3 ? 1 - 0.4 * missing : 1
        return (
          <div
            key={label}
            className="absolute rounded-[10px] flex justify-center pt-4"
            style={{ ...inked(5), left: STEP_X(k), top: top + drop, width: STEP_W - 8, height: 1764 - top, background: STEP_COLOURS[k], backgroundImage: GRAIN, opacity: dim }}
          >
            <span className={`${hand} text-center text-[46px] leading-[0.95] font-bold px-2`} style={{ color: INK }}>
              {label}
            </span>
          </div>
        )
      })}
    </>
  )
}
