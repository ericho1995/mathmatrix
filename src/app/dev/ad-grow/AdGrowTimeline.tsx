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
// "They grow up so quickly": a stop-motion reel for parents, 1080×1920, about
// a minute long, as a function of time. Everything is paper on a table, moved
// a little between frames: the clock runs at 12 frames a second and every
// piece shifts by a pixel or two each frame, the way hand-moved paper does.
//
// Nothing animates by itself, so marketing/instagram/render-ad.mjs can step
// through it (window.__setAdTime) and every render is identical. Open it with
// ?play to watch it in real time. The voice lines and their timings come from
// the soundtrack (marketing/instagram/ad-grow/audio.py): re-voice it and the
// scenes follow.
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
const FPS = 12

/** A scene begins just before its first line. */
const sceneStart = (line: number) => (line === 0 ? 0 : L[line].start - 0.4)
/** Roughly when word `k` of a line is spoken (words are about evenly paced). */
const wordAt = (line: number, k: number) => L[line].start + ((L[line].end - L[line].start) * k) / TEXT[line].split(' ').length

const clamp = (x: number) => Math.max(0, Math.min(1, x))
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3)
const back = (p: number) => {
  const c1 = 1.9
  const c3 = c1 + 1
  return p <= 0 ? 0 : 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2)
}
const hash = (n: number) => {
  const s = Math.sin(n * 12.9898) * 43758.5453
  return s - Math.floor(s)
}

// Paper grain, as an SVG noise tile.
const grain = (alpha: number, freq = 0.85) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0 0.1  0 0 0 ${alpha} 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
  )}")`
const PAPER_SHADOW = 'drop-shadow(0 4px 0 rgba(60,40,10,0.08)) drop-shadow(0 14px 14px rgba(60,40,10,0.22))'

function Backdrop({ color, stripes, children }: { color: string; stripes?: string; children?: React.ReactNode }) {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: color, backgroundImage: [grain(0.5), stripes].filter(Boolean).join(', ') }}>
      {children}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(40,25,5,0.28) 100%)' }} />
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
  const [rt, setT] = useState(0)
  // Drawn in the browser only: the wobble's floating point differs between server and browser.
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

  // The stop-motion clock: time moves in whole frames.
  const f = Math.floor(rt * FPS + 1e-6)
  const t = f / FPS
  /** A frame-to-frame wobble, different for every piece of paper. */
  const jit = (seed: number, amp: number) => (hash(f * 7.13 + seed * 3.71) - 0.5) * 2 * amp
  const wob = (seed: number, rot = 0, amp = 1.6): React.CSSProperties => ({
    transform: `translate(${jit(seed, amp)}px, ${jit(seed + 50, amp)}px) rotate(${rot + jit(seed + 99, 0.35)}deg)`,
  })

  const line = Math.max(0, L.findIndex((_, i) => i === L.length - 1 || t < sceneStart(i + 1)))
  const scene = line === 4 ? 3 : line // lines 4 and 5 share the staircase
  const u = t - sceneStart(scene === 3 ? 3 : line)

  const hand = d.hand
  const caption = (dark = false) => <CaptionStrip t={t} line={line} hand={hand} wob={wob(1, -1)} dark={dark} />
  if (!mounted) return null

  return (
    <div className="fixed left-0 top-0 z-[100] overflow-hidden font-sans" style={{ width: 1080, height: 1920 }}>
      {/* ── 1. The door frame: they grow up so quickly ─────────────────── */}
      {scene === 0 && (
        <Backdrop color="#F3E6D0" stripes="repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0 46px, transparent 46px 92px)">
          <div className="absolute left-[300px] top-[430px] w-[150px] h-[1500px]" style={{ ...wob(2, 0, 0.8), backgroundColor: '#C8965F', backgroundImage: `${grain(0.6, 0.5)}, repeating-linear-gradient(90deg, rgba(90,55,20,0.18) 0 3px, transparent 3px 23px)`, filter: PAPER_SHADOW }} />
          <div className="absolute left-0 right-0 top-[1760px] h-[160px] bg-white" style={{ backgroundImage: grain(0.4), filter: PAPER_SHADOW }} />
          {['Grade 3', 'Grade 5', 'Year 7', 'Year 9', 'Year 11'].map((label, k) => {
            const y = 1580 - k * 165
            const at = 0.3 + k * 0.42
            return (
              t >= at && (
                <div key={label} className="absolute left-[300px] flex items-center" style={{ top: y, ...wob(10 + k, -1) }}>
                  <span className="block w-[200px] h-[7px] rounded-full bg-[#3B3F4A]" style={{ width: 150 + 60 * prog(t, at, at + 0.25) }} />
                  <span className={`${hand} ml-4 text-[64px] leading-none text-[#3B3F4A]`}>{label}</span>
                </div>
              )
            )
          })}
          <div className="absolute w-[150px] h-[150px]" style={{ left: 410, top: 1500 - Math.min(4, Math.floor((t - 0.3) / 0.42)) * 165, ...wob(30, -35) }}>
            <PencilSticker className="w-full h-full" />
          </div>
          {caption()}
        </Backdrop>
      )}

      {/* ── 2. Homework: from counting to algebra ─────────────────────── */}
      {scene === 1 && (
        <Backdrop color="#DDB98A" stripes="repeating-linear-gradient(0deg, rgba(110,70,25,0.16) 0 4px, transparent 4px 240px)">
          <div className="absolute left-[50px] w-[980px] rounded-[28px] bg-white p-8" style={{ ...wob(3, -2), filter: PAPER_SHADOW, top: 560 + 1300 * (1 - easeOut(prog(u, 0.1, 0.6))) }}>
            <div style={{ zoom: 1.75 }}>
              <QuestionView question={d.young} answer={null} onAnswer={() => {}} />
            </div>
          </div>
          <Sticky hand={hand} text="Grade 3" color="#FFE27A" x={760} y={500} rot={6} show={prog(u, 0.6, 0.8)} wob={wob(4, 6)} />
          {/* "The next, it's algebra": a Year 9 page lands on top. */}
          {(() => {
            const at = wordAt(1, 7) - 0.2
            return (
              <>
                <div className="absolute w-[980px] rounded-[28px] bg-white p-8" style={{ ...wob(5, 3), filter: PAPER_SHADOW, top: 860, left: 50 + 1200 * (1 - easeOut(prog(t, at, at + 0.45))) }}>
                  <div style={{ zoom: 1.75 }}>
                    <QuestionView question={d.older} answer={null} onAnswer={() => {}} />
                  </div>
                  <p className={`${hand} mt-6 text-[60px] text-[#3B3F4A]`} style={{ opacity: prog(t, at + 1.2, at + 1.3) }}>
                    6x − 15 ... ?
                  </p>
                </div>
                <Sticky hand={hand} text="Year 9" color="#FFB3C7" x={760} y={800} rot={-5} show={prog(t, at + 0.5, at + 0.7)} wob={wob(6, -5)} />
                <Mug x={720} y={1560} show={prog(t, at + 0.9, at + 1.2)} wob={wob(7)} f={f} />
              </>
            )
          })()}
          {caption()}
        </Backdrop>
      )}

      {/* ── 3. The weeks fly by ─────────────────────────────────────────── */}
      {scene === 2 && (
        <Backdrop color="#CFE3F2">
          <TearOffCalendar u={u} hand={hand} wob={wob} />
          <PaperClock u={u} wob={wob(8)} />
          {caption()}
        </Backdrop>
      )}

      {/* ── 4. The staircase with a missing step ──────────────────────── */}
      {scene === 3 && (
        <Backdrop color="#F4E9D8">
          <Staircase hand={hand} wob={wob} missing={line === 4 ? prog(t, L[4].start - 0.2, L[4].start + 0.3) : 0} />
          {(() => {
            // Hops up the first three steps, then stops at the edge of the gap.
            const hop = (t - L[3].start) / 0.8
            const k = Math.max(0, Math.min(2, Math.floor(hop)))
            const p = hop >= 3 ? 1 : clamp(hop - Math.floor(hop))
            const moving = hop > 0 && hop < 2
            const x = STEP_X(k) + (moving ? (STEP_X(k + 1) - STEP_X(k)) * easeOut(p) : 0)
            const y = STEP_TOP(k) - (moving ? Math.sin(Math.PI * p) * 140 + (STEP_TOP(k) - STEP_TOP(k + 1)) * easeOut(p) : 0)
            const pose: BirdPose = line === 4 || t > wordAt(3, 9) ? 'think' : 'read'
            const shy = line === 4 ? prog(t, wordAt(4, 6), wordAt(4, 7)) * (1 - prog(t, wordAt(4, 12), L[4].end)) : 0
            return (
              <>
                <div className="absolute w-[280px] h-[280px]" style={{ left: x - 58, top: y - 268, ...wob(20) }}>
                  <Bird pose={pose} className="w-full h-full" />
                </div>
                {shy > 0 && (
                  <div className="absolute flex items-center justify-center rounded-full bg-white text-brand-600 font-bold" style={{ left: x + 170, top: y - 400, width: 150, height: 150, fontSize: 96, filter: PAPER_SHADOW, transform: `scale(${shy})` }}>
                    ?
                  </div>
                )}
              </>
            )
          })()}
          {caption()}
        </Backdrop>
      )}

      {/* ── 5. Night: the worries ──────────────────────────────────────── */}
      {scene === 5 && (
        <Backdrop color="#1F2B4D">
          <div className="absolute rounded-full" style={{ left: 760, top: 520, width: 210, height: 210, background: '#F7E6B0', backgroundImage: grain(0.4), ...wob(21), filter: PAPER_SHADOW }} />
          <div className="absolute rounded-full" style={{ left: 800, top: 490, width: 200, height: 200, background: '#1F2B4D', backgroundImage: grain(0.5), ...wob(21) }} />
          {[[120, 560, 60], [300, 470, 44], [620, 640, 50], [940, 820, 40], [180, 860, 36]].map(([x, y, s], i) => (
            <div key={i} className="absolute" style={{ left: x, top: y, width: s, height: s, opacity: 0.6 + 0.4 * hash(f * 0.37 + i), ...wob(40 + i, 0, 1) }}>
              <Star className="w-full h-full" />
            </div>
          ))}
          <div className="absolute left-0 right-0 top-[1560px] h-[360px]" style={{ backgroundColor: '#8A5A33', backgroundImage: `${grain(0.6, 0.5)}, repeating-linear-gradient(0deg, rgba(40,20,5,0.25) 0 4px, transparent 4px 120px)`, filter: PAPER_SHADOW }} />
          <Mug x={680} y={1330} show={1} wob={wob(22)} f={f} steam />
          <Thought hand={hand} text="Are they keeping up?" x={90} y={830} show={prog(t, wordAt(5, 2) - 0.1, wordAt(5, 2) + 0.15)} wob={wob(23, -2)} />
          <Thought hand={hand} text="Am I doing enough?" x={330} y={1100} show={prog(t, wordAt(5, 6) - 0.1, wordAt(5, 6) + 0.15)} wob={wob(24, 2)} />
          {caption(true)}
        </Backdrop>
      )}

      {/* ── 6. PrepNest ────────────────────────────────────────────────── */}
      {scene === 6 && (
        <Backdrop color="#D6EBFB">
          {[[60, 640, 260], [760, 760, 220], [140, 1380, 200]].map(([x, y, w], i) => (
            <div key={i} className="absolute" style={{ left: x + Math.floor(u * 6) * 4 * (i % 2 ? -1 : 1), top: y, width: w, height: w * 0.6, ...wob(60 + i) }}>
              <Cloud className="w-full h-full" />
            </div>
          ))}
          <div className="absolute rounded-full border-[16px] border-white bg-sun-400" style={{ left: 220, top: 600, width: 640, height: 640, backgroundImage: grain(0.4), filter: PAPER_SHADOW, transform: `${wob(61).transform} scale(${back(prog(u, 0.05, 0.5))})` }} />
          <div className="absolute" style={{ left: 240, top: 560, width: 600, height: 600, transform: `${wob(62).transform} translateY(${380 * (1 - back(prog(u, 0.35, 0.9)))}px)` }}>
            <Bird pose="nest" className="w-full h-full" />
          </div>
          <div className="absolute left-0 right-0 top-[1300px] flex justify-center" style={{ transform: `scale(${back(prog(u, 1.0, 1.4))})` }}>
            <span className="inline-flex items-center gap-4 rounded-full bg-white px-9 py-5" style={{ ...wob(63, -2), filter: PAPER_SHADOW }}>
              <BirdMark className="w-20 h-20" />
              <span className="text-7xl font-bold tracking-tight text-ink">
                Prep<span className="text-brand-500">Nest</span>
              </span>
            </span>
          </div>
          {caption()}
        </Backdrop>
      )}

      {/* ── 7. The free test's report, under the magnifier ────────────── */}
      {scene === 7 && (
        <Backdrop color="#F4E9D8">
          <div className="absolute left-[40px] w-[1000px] rounded-[28px] bg-white p-4" style={{ top: 560 + 1400 * (1 - easeOut(prog(u, 0.1, 0.6))), ...wob(70, -1.5), filter: PAPER_SHADOW }}>
            <div style={{ zoom: 1.4 }}>{d.report}</div>
          </div>
          <div className="absolute" style={{ left: 600 - 420 * easeOut(prog(u, 1.0, 1.9)), top: 1560 - 800 * easeOut(prog(u, 1.0, 1.9)), opacity: u > 0.9 ? 1 : 0, ...wob(71, -20) }}>
            <div className="w-[300px] h-[300px] rounded-full border-[26px] border-[#6B4F2F]" style={{ background: 'rgba(214,235,251,0.25)', filter: PAPER_SHADOW }} />
            <div className="absolute left-[250px] top-[250px] w-[60px] h-[200px] rounded-full bg-[#6B4F2F]" style={{ transform: 'rotate(-45deg)', transformOrigin: 'top center' }} />
          </div>
          <div
            className="absolute left-[120px] top-[1480px] inline-flex items-center gap-3 rounded-full bg-amber-400 border-b-8 border-amber-600 px-8 py-4 text-5xl font-bold text-white"
            style={{ transform: `${wob(72, -3).transform} scale(${back(prog(u, 2.2, 2.5))})`, filter: PAPER_SHADOW }}
          >
            <Target className="w-12 h-12" aria-hidden />
            Focus: {d.focus}
          </div>
          {caption()}
        </Backdrop>
      )}

      {/* ── 8. Practice made for those skills ─────────────────────────── */}
      {scene === 8 && (
        <Backdrop color="#DDB98A" stripes="repeating-linear-gradient(0deg, rgba(110,70,25,0.16) 0 4px, transparent 4px 240px)">
          {d.pages.map((src, i) => {
            const at = 0.15 + i * 0.45
            return (
              <div
                key={src}
                className="absolute w-[560px] rounded-[10px] bg-white p-3"
                style={{ left: [80, 300, 470][i], top: [620, 700, 780][i] + 1400 * (1 - easeOut(prog(u, at, at + 0.4))), ...wob(80 + i, [-7, 2, 8][i]), filter: PAPER_SHADOW }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="block w-full" />
                <span className={`${hand} absolute -top-8 left-6 rounded-md bg-[#FFE27A] px-5 py-1 text-[44px] leading-tight text-ink`} style={{ filter: PAPER_SHADOW }}>
                  Paper {i + 1}
                </span>
                <div className="absolute -right-6 -bottom-6 w-[130px] h-[130px]" style={{ transform: `scale(${back(prog(u, 1.9 + i * 0.35, 2.2 + i * 0.35))})` }}>
                  <CheckSticker className="w-full h-full" />
                </div>
              </div>
            )
          })}
          {caption()}
        </Backdrop>
      )}

      {/* ── 9. The missing step goes in; up they go ───────────────────── */}
      {scene === 9 && (
        <Backdrop color="#F4E9D8">
          <Staircase hand={hand} wob={wob} missing={0} fill={easeOut(prog(u, 0.3, 0.9))} />
          {(() => {
            const hop = (u - 1.1) / 0.65 // from step 2 to the top
            const k = Math.max(0, Math.min(3, Math.floor(hop)))
            const p = hop >= 3 ? 1 : clamp(hop - Math.floor(hop))
            const a = 2 + (hop >= 3 ? 3 : k)
            const b = Math.min(5, a + 1)
            const moving = hop > 0 && hop < 3
            const x = STEP_X(a) + (moving ? (STEP_X(b) - STEP_X(a)) * easeOut(p) : 0)
            const y = STEP_TOP(a) - (moving ? Math.sin(Math.PI * p) * 140 + (STEP_TOP(a) - STEP_TOP(b)) * easeOut(p) : 0)
            return (
              <>
                <div className="absolute w-[280px] h-[280px]" style={{ left: x - 58, top: y - 268, ...wob(90) }}>
                  <Bird pose={hop >= 3 ? 'cheer' : 'read'} className="w-full h-full" />
                </div>
                {hop >= 3 &&
                  [[-110, -300, 70], [120, -360, 80], [10, -440, 56]].map(([dx, dy, s], i) => (
                    <div key={i} className="absolute" style={{ left: x + dx, top: y + dy, width: s, height: s, transform: `scale(${back(prog(hop, 3 + i * 0.2, 3.4 + i * 0.2))})` }}>
                      <Sparkle className="w-full h-full" />
                    </div>
                  ))}
              </>
            )
          })()}
          {caption()}
        </Backdrop>
      )}

      {/* ── 10. Try the free test now ─────────────────────────────────── */}
      {scene === 10 && (
        <Backdrop color="#2F8FEA">
          {[[150, 560, 70], [860, 600, 90], [890, 1150, 56], [120, 1180, 50]].map(([x, y, s], i) => (
            <div key={i} className="absolute" style={{ left: x, top: y, width: s, height: s, opacity: prog(u, 0.6 + i * 0.15, 0.7 + i * 0.15), ...wob(100 + i, f * 3) }}>
              {i % 2 ? <Star className="w-full h-full" /> : <Sparkle className="w-full h-full" fill="#FFFFFF" />}
            </div>
          ))}
          <div className="absolute rounded-full border-[16px] border-white/40 bg-sun-400" style={{ left: 270, top: 560, width: 540, height: 540, backgroundImage: grain(0.4), filter: PAPER_SHADOW, transform: `${wob(110).transform} scale(${back(prog(u, 0.1, 0.5))})` }} />
          <div className="absolute" style={{ left: 260, top: 520, width: 560, height: 560, transform: `${wob(111).transform} scale(${back(prog(u, 0.3, 0.7))})` }}>
            <Bird pose="cheer" className="w-full h-full" />
          </div>
          <div className="absolute left-0 right-0 top-[1140px] flex justify-center" style={{ transform: `scale(${back(prog(u, 0.8, 1.2))})` }}>
            <span className="inline-flex items-center gap-4 rounded-full bg-white px-9 py-5" style={{ ...wob(112, -2), filter: PAPER_SHADOW }}>
              <BirdMark className="w-20 h-20" />
              <span className="text-7xl font-bold tracking-tight text-ink">
                Prep<span className="text-brand-500">Nest</span>
              </span>
            </span>
          </div>
          <div className="absolute left-0 right-0 top-[1330px] flex justify-center" style={{ transform: `scale(${back(prog(u, 1.3, 1.7))})` }}>
            <span className="rounded-[2rem] bg-sun-400 border-b-[10px] border-amber-600 px-14 py-7 text-6xl font-bold text-ink" style={{ ...wob(113, 2), filter: PAPER_SHADOW }}>
              Try the free test now
            </span>
          </div>
          <p className="absolute left-0 right-0 top-[1510px] text-center text-5xl font-bold text-white" style={{ opacity: prog(u, 2.0, 2.3), ...wob(114) }}>
            prepnest.com.au
          </p>
          <p className="absolute left-0 right-0 top-[1585px] text-center text-3xl font-semibold text-white/90" style={{ opacity: prog(u, 2.6, 2.9) }}>
            Grade 3 to Year 12 · no account to start
          </p>
          {caption()}
        </Backdrop>
      )}
    </div>
  )
}

/** The words, on a strip of paper, appearing as they are spoken. */
function CaptionStrip({ t, line, hand, wob, dark }: { t: number; line: number; hand: string; wob: React.CSSProperties; dark?: boolean }) {
  const words = TEXT[line].split(' ')
  const shown = Math.ceil(words.length * prog(t, L[line].start - 0.05, L[line].end - 0.2))
  if (shown === 0) return null
  const size = words.length > 12 ? 58 : words.length > 7 ? 66 : 80
  return (
    <div className="absolute left-[56px] right-[56px] top-[170px] flex justify-center">
      <p
        className={`${hand} rounded-[6px] px-9 py-5 text-center leading-[1.05] ${dark ? 'bg-[#FFF8E6] text-ink' : 'bg-white text-ink'}`}
        style={{ ...wob, fontSize: size, fontWeight: 700, filter: PAPER_SHADOW, backgroundImage: grain(0.25) }}
      >
        {words.map((w, i) => (
          <span key={i} className={`inline-block mr-[0.25em] ${i < shown ? 'opacity-100' : 'opacity-0'} ${i === shown - 1 && t < L[line].end ? 'text-brand-600' : ''}`}>
            {w}
          </span>
        ))}
      </p>
    </div>
  )
}

function Sticky({ hand, text, color, x, y, rot, show, wob }: { hand: string; text: string; color: string; x: number; y: number; rot: number; show: number; wob: React.CSSProperties }) {
  if (show <= 0) return null
  return (
    <div className="absolute" style={{ left: x, top: y, transform: `scale(${back(show)})` }}>
      <div className={`${hand} px-7 py-3 text-[64px] leading-none text-ink`} style={{ ...wob, transform: `${wob.transform} rotate(${rot}deg)`, background: color, backgroundImage: grain(0.3), filter: PAPER_SHADOW }}>
        {text}
      </div>
    </div>
  )
}

function Thought({ hand, text, x, y, show, wob }: { hand: string; text: string; x: number; y: number; show: number; wob: React.CSSProperties }) {
  if (show <= 0) return null
  return (
    <div className="absolute" style={{ left: x, top: y, transform: `scale(${back(show)})`, transformOrigin: 'bottom right' }}>
      <div style={wob}>
        <div className={`${hand} rounded-[90px] bg-white px-12 py-8 text-[72px] font-bold leading-none text-ink`} style={{ backgroundImage: grain(0.25), filter: PAPER_SHADOW }}>
          {text}
        </div>
        <div className="absolute right-[90px] -bottom-[46px] w-[44px] h-[44px] rounded-full bg-white" style={{ filter: PAPER_SHADOW }} />
        <div className="absolute right-[60px] -bottom-[88px] w-[26px] h-[26px] rounded-full bg-white" style={{ filter: PAPER_SHADOW }} />
      </div>
    </div>
  )
}

/** A paper mug; with steam that changes shape every frame. */
function Mug({ x, y, show, wob, f, steam }: { x: number; y: number; show: number; wob: React.CSSProperties; f: number; steam?: boolean }) {
  if (show <= 0) return null
  return (
    <div className="absolute" style={{ left: x, top: y, transform: `scale(${back(show)})` }}>
      <div style={{ ...wob, filter: PAPER_SHADOW }}>
        {steam &&
          [0, 1, 2].map(i => (
            <svg key={i} className="absolute" style={{ left: 40 + i * 52, top: -170 }} width="40" height="150" viewBox="0 0 40 150">
              <path d={`M20 145 C ${f % 2 ? 0 : 40} 110, ${f % 2 ? 40 : 0} 80, 20 55 S ${f % 3 ? 0 : 40} 15, 20 5`} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="9" strokeLinecap="round" />
            </svg>
          ))}
        <div className="relative w-[220px] h-[200px] rounded-b-[60px] rounded-t-[14px] bg-[#F06A4E]" style={{ backgroundImage: grain(0.4) }}>
          <div className="absolute left-0 right-0 top-0 h-[26px] rounded-t-[14px] bg-[#C9472F]" />
          <div className="absolute -right-[70px] top-[40px] w-[96px] h-[110px] rounded-r-[60px] border-[22px] border-l-0 border-[#F06A4E]" />
        </div>
      </div>
    </div>
  )
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** A tear-off calendar, a page a frame, faster and faster; the torn pages pile up. */
function TearOffCalendar({ u, hand, wob }: { u: number; hand: string; wob: (seed: number, rot?: number, amp?: number) => React.CSSProperties }) {
  const frame = Math.max(0, Math.floor(u * FPS))
  // A day a frame for the first second, then a few a frame.
  const day = frame <= 12 ? frame : 12 + (frame - 12) * 4
  const date = new Date(Date.UTC(2026, 0, 28 + day))
  const torn = Math.min(26, frame)
  return (
    <>
      {/* The pile on the floor. */}
      {Array.from({ length: torn }, (_, i) => (
        <div key={i} className="absolute w-[300px] h-[220px] bg-white" style={{ left: 120 + hash(i) * 600, top: 1500 + hash(i + 9) * 160 - i * 3, transform: `rotate(${(hash(i + 3) - 0.5) * 70}deg)`, backgroundImage: grain(0.25), filter: PAPER_SHADOW }} />
      ))}
      {/* The page tearing off right now. */}
      {frame > 0 && (
        <div className="absolute w-[520px] h-[420px] bg-white" style={{ left: 300, top: 880, transform: `rotate(${18 + (frame % 3) * 9}deg)`, backgroundImage: grain(0.25), filter: PAPER_SHADOW, opacity: 0.95 }} />
      )}
      <div className="absolute left-[90px] top-[600px] w-[580px] h-[660px] rounded-[18px] bg-white overflow-hidden" style={{ ...wob(50, -2), filter: PAPER_SHADOW, backgroundImage: grain(0.25) }}>
        <div className="h-[130px] bg-[#E2574C] flex items-center justify-center text-white text-[64px] font-bold tracking-wide">{MONTHS[date.getUTCMonth()]}</div>
        <p className="text-center text-[300px] font-bold leading-[1.1] text-ink">{date.getUTCDate()}</p>
        <p className={`${hand} text-center text-[72px] leading-none text-gray-500`}>{DAYS[date.getUTCDay()]}</p>
      </div>
    </>
  )
}

function PaperClock({ u, wob }: { u: number; wob: React.CSSProperties }) {
  const minute = u * 900
  return (
    <div className="absolute left-[720px] top-[640px] w-[300px] h-[300px] rounded-full bg-white border-[14px] border-[#2F8FEA]" style={{ ...wob, filter: PAPER_SHADOW, backgroundImage: grain(0.25) }}>
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className="absolute left-1/2 top-1/2 block w-[8px] h-[22px] -ml-[4px] rounded bg-gray-400" style={{ transform: `rotate(${i * 30}deg) translateY(-106px)` }} />
      ))}
      <span className="absolute left-1/2 top-1/2 block w-[14px] h-[70px] -ml-[7px] -mt-[70px] rounded-full bg-ink origin-bottom" style={{ transform: `rotate(${minute / 12}deg)` }} />
      <span className="absolute left-1/2 top-1/2 block w-[10px] h-[100px] -ml-[5px] -mt-[100px] rounded-full bg-[#E2574C] origin-bottom" style={{ transform: `rotate(${minute}deg)` }} />
      <span className="absolute left-1/2 top-1/2 block w-[26px] h-[26px] -ml-[13px] -mt-[13px] rounded-full bg-ink" />
    </div>
  )
}

const STEPS = ['Counting', 'Place value', 'Times tables', 'Fractions', 'Decimals', 'Percent']
const STEP_W = 160
const STEP_X = (k: number) => 40 + k * STEP_W
const STEP_TOP = (k: number) => 1580 - k * 150
const STEP_COLOURS = ['#BFE0FA', '#A6D3F7', '#8CC5F3', '#FFC530', '#5FAEEF', '#3E9BEA']

/** Six paper steps of skills. `missing` fades in the gap's outline; `fill` drops the missing step in. */
function Staircase({ hand, wob, missing, fill }: { hand: string; wob: (seed: number, rot?: number, amp?: number) => React.CSSProperties; missing: number; fill?: number }) {
  return (
    <>
      <div className="absolute left-0 right-0 top-[1760px] h-[160px]" style={{ backgroundColor: '#C8965F', backgroundImage: grain(0.6, 0.5) }} />
      {STEPS.map((label, k) => {
        const gap = k === 3
        const placed = gap ? (fill ?? 0) : 1
        const top = STEP_TOP(k)
        if (gap && placed <= 0) {
          return (
            missing > 0 && (
              <div key={label} className="absolute rounded-[10px] border-[6px] border-dashed border-[#E2574C] flex flex-col items-center pt-5" style={{ left: STEP_X(k), top, width: STEP_W - 8, height: 1760 - top, opacity: missing, ...wob(200 + k) }}>
                <span className={`${hand} text-[40px] leading-none text-[#E2574C]`}>{label}</span>
                <span className="mt-4 text-[90px] font-bold text-[#E2574C]">?</span>
              </div>
            )
          )
        }
        const drop = gap ? (1 - placed) * -900 : 0
        const behind = !gap && k > 3 && missing > 0 ? 1 - 0.45 * missing : 1
        return (
          <div
            key={label}
            className="absolute rounded-[10px] flex justify-center pt-4"
            style={{ left: STEP_X(k), top: top + drop, width: STEP_W - 8, height: 1760 - top, background: STEP_COLOURS[k], backgroundImage: grain(0.35), opacity: behind, filter: PAPER_SHADOW, ...wob(200 + k, 0, 1.2) }}
          >
            <span className={`${hand} text-center text-[46px] leading-[0.95] font-bold text-ink px-2`}>{label}</span>
          </div>
        )
      })}
    </>
  )
}
