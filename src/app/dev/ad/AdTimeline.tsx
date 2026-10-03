'use client'

import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { Check, NotebookPen, PenLine, Target, Timer } from 'lucide-react'
import Bird, { BirdMark } from '@/components/brand/Bird'
import { Sparkle, Star } from '@/components/brand/Decor'
import QuestionView from '@/components/diagnostic/QuestionView'
import type { ScreenQuestion } from '@/lib/web/questionHtml'

// ─────────────────────────────────────────────────────────────────────────────
// The 15-second Reels/TikTok ad, 1080×1920, as a function of time. Nothing
// animates by itself: every position and opacity is worked out from `t`, so
// marketing/instagram/render-ad.mjs can step through it frame by frame
// (window.__setAdTime) and every render is identical. Open it in a browser
// with ?play to watch it run in real time.
//
// The voice lines and their timings come from the soundtrack (audio.py).
// ─────────────────────────────────────────────────────────────────────────────

export const AD_LENGTH = 15

export const LINES = [
  { start: 0.4, end: 2.333, text: 'Not sure where your child needs help?' },
  { start: 3.033, end: 5.875, text: 'Our free test finds the exact skills to work on.' },
  { start: 6.575, end: 8.994, text: 'Then practice papers target just those.' },
  { start: 9.694, end: 13.114, text: 'Try the free test now at prepnest.com.au' },
]

const clamp = (x: number) => Math.max(0, Math.min(1, x))
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3)
const easeIn = (p: number) => p * p * p
const back = (p: number) => {
  const c1 = 1.9
  const c3 = c1 + 1
  return p <= 0 ? 0 : 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2)
}

/** A scene's group: slides up and fades out over [out, out + 0.3]. */
const exitStyle = (t: number, out: number): React.CSSProperties => {
  const p = easeIn(prog(t, out, out + 0.3))
  return { opacity: 1 - p, transform: `translateY(${-80 * p}px)` }
}

/** Words appear as they are spoken, the current one in the accent colour. */
function Caption({ t, line, className = '', accent = 'text-sun-400' }: { t: number; line: (typeof LINES)[number]; className?: string; accent?: string }) {
  const words = line.text.split(' ')
  const shown = Math.ceil(words.length * prog(t, line.start - 0.05, line.end - 0.25))
  return (
    <p className={className}>
      {words.map((w, i) => (
        <span key={i} className={`inline-block mr-[0.28em] transition-none ${i < shown ? 'opacity-100' : 'opacity-0'} ${i === shown - 1 && t < line.end ? accent : ''}`}>
          {w}
        </span>
      ))}
    </p>
  )
}

export interface AdData {
  question: ScreenQuestion
  questionOf: number
  question2: ScreenQuestion
  report: React.ReactNode
  focus: string
  papers: { seq: number; label: string }[]
}

export default function AdTimeline(d: AdData) {
  const [t, setT] = useState(0)

  useEffect(() => {
    ;(window as unknown as { __setAdTime: (x: number) => void }).__setAdTime = (x: number) => flushSync(() => setT(x))
    if (new URLSearchParams(location.search).has('play')) {
      const t0 = performance.now()
      let raf = 0
      const tick = () => {
        const x = ((performance.now() - t0) / 1000) % AD_LENGTH
        setT(x)
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }
  }, [])

  const bob = (speed: number, amp: number) => Math.sin(t * speed) * amp
  const scene = t < 3 ? 1 : t < 6.5 ? 2 : t < 9.7 ? 3 : 4

  // Scene 4's blue grows out from the middle.
  const wipe = easeOut(prog(t, 9.55, 10.05)) * 1400

  return (
    <div className="fixed left-0 top-0 z-[100] overflow-hidden bg-sky font-sans" style={{ width: 1080, height: 1920 }}>
      {/* The logo, small, top left through the first three scenes. */}
      {scene < 4 && (
        <div className="absolute left-14 top-[170px] inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-sm" style={{ opacity: easeOut(prog(t, 0.1, 0.5)) }}>
          <BirdMark className="w-12 h-12" />
          <span className="text-4xl font-bold tracking-tight text-ink">
            Prep<span className="text-brand-500">Nest</span>
          </span>
        </div>
      )}

      {/* ── Scene 1: the hook ─────────────────────────────────────────── */}
      {scene === 1 && (
        <div className="absolute inset-0" style={exitStyle(t, 2.75)}>
          <Caption t={t} line={LINES[0]} className="absolute left-14 right-14 top-[330px] text-[104px] leading-[1.02] font-bold tracking-tight text-brand-700" accent="text-brand-500" />
          {[0, 1, 2].map(i => {
            const p = prog(t, 0.5 + i * 0.35, 3)
            return (
              <span
                key={i}
                className="absolute flex items-center justify-center rounded-full bg-white border-4 border-brand-200 text-brand-600 font-bold"
                style={{
                  left: [230, 760, 830][i],
                  top: [980, 900, 1240][i] - p * 160,
                  width: [110, 140, 96][i],
                  height: [110, 140, 96][i],
                  fontSize: [64, 84, 56][i],
                  opacity: p > 0 ? Math.min(1, p * 4) * (1 - prog(t, 2.4, 2.8)) : 0,
                  transform: `rotate(${[-12, 10, -6][i]}deg) scale(${back(prog(t, 0.5 + i * 0.35, 0.9 + i * 0.35))})`,
                }}
              >
                ?
              </span>
            )
          })}
          <div className="absolute" style={{ left: 250, top: 860 + bob(3, 12), width: 580, height: 580, transform: `scale(${back(prog(t, 0, 0.55))})` }}>
            <Bird pose="think" className="w-full h-full" />
          </div>
        </div>
      )}

      {/* ── Scene 2: the test, then the report ───────────────────────────── */}
      {scene === 2 && (
        <div className="absolute inset-0" style={exitStyle(t, 6.2)}>
          <Caption t={t} line={LINES[1]} className="absolute left-14 right-14 top-[300px] text-[80px] leading-[1.05] font-bold tracking-tight text-ink" accent="text-brand-500" />

          {/* The question screen slides up, an answer is chosen, then it moves off to the left. */}
          <div
            className="absolute left-[60px] w-[960px] top-[640px]"
            style={{ transform: `translate(${-1150 * easeIn(prog(t, 4.55, 4.9))}px, ${900 * (1 - easeOut(prog(t, 3.0, 3.45)))}px)` }}
          >
            <div className="rounded-[2.5rem] bg-white border-4 border-b-[14px] border-line p-10">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-bold text-gray-500 whitespace-nowrap">
                  Question {d.question.n} of {d.questionOf}
                </span>
                <div className="flex-1 h-5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-teal-400" style={{ width: `${(d.question.n / d.questionOf) * 100}%` }} />
                </div>
              </div>
              <div style={{ zoom: 1.2 }}>
                <QuestionView question={d.question} answer={t > 3.95 ? 1 : null} onAnswer={() => {}} />
              </div>
            </div>
          </div>

          {/* The report comes in from the right, and the focus area is called out. */}
          <div
            className="absolute left-[40px] w-[1000px] top-[560px]"
            style={{ transform: `translateX(${1150 * (1 - easeOut(prog(t, 4.7, 5.15)))}px)` }}
          >
            <div style={{ zoom: 1.45 }}>{d.report}</div>
          </div>
          <div
            className="absolute right-14 top-[1500px] inline-flex items-center gap-3 rounded-full bg-amber-400 border-b-8 border-amber-600 px-8 py-4 text-4xl font-bold text-white shadow-lg"
            style={{ transform: `scale(${back(prog(t, 5.35, 5.75))}) rotate(-3deg)`, transformOrigin: 'center' }}
          >
            <Target className="w-10 h-10" aria-hidden />
            Focus: {d.focus}
          </div>
        </div>
      )}

      {/* ── Scene 3: practice papers on just those ─────────────────────────── */}
      {scene === 3 && (
        <div className="absolute inset-0" style={exitStyle(t, 9.4)}>
          <Caption t={t} line={LINES[2]} className="absolute left-14 right-14 top-[300px] text-[84px] leading-[1.05] font-bold tracking-tight text-ink" accent="text-brand-500" />

          <div className="absolute left-[50px] top-[620px] w-[600px]" style={{ transform: `translateY(${900 * (1 - easeOut(prog(t, 6.5, 6.95)))}px)` }}>
            <div className="rounded-[2.5rem] bg-white border-4 border-b-[12px] border-line p-8">
              <div className="flex items-center justify-between mb-4 text-2xl font-bold text-gray-500">
                <span>Question {d.question2.n}</span>
                <span className="inline-flex items-center gap-2">
                  <Timer className="w-7 h-7" aria-hidden />
                  18:42
                </span>
              </div>
              <QuestionView question={d.question2} answer={null} onAnswer={() => {}} />
            </div>
          </div>
          <div
            className="absolute right-[50px] top-[700px] w-[380px] h-[560px] rounded-[2.5rem] bg-white border-4 border-b-[12px] border-line overflow-hidden flex flex-col"
            style={{ transform: `translateX(${600 * (1 - easeOut(prog(t, 6.75, 7.2)))}px)` }}
          >
            <div className="px-6 pt-6 pb-4 border-b-4 border-line">
              <p className="text-2xl font-bold text-gray-700">Working out</p>
              <div className="flex gap-3 mt-4">
                <span className="inline-flex items-center gap-2 rounded-xl border-4 border-line px-4 py-2 text-xl font-bold text-gray-500">
                  <PenLine className="w-6 h-6" aria-hidden />
                  Draw
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl border-4 border-brand-500 bg-brand-50 px-4 py-2 text-xl font-bold text-brand-700">
                  <NotebookPen className="w-6 h-6" aria-hidden />
                  Notes
                </span>
              </div>
            </div>
            <div className="flex-1 p-6 text-3xl leading-[48px] text-ink font-semibold" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(29,78,216,0.12) 1px, transparent 1px)', backgroundSize: '100% 48px' }}>
              {['Design 1: 4 tiles', 'Design 2: 7 tiles', 'Design 3: 10 tiles', '+3 each time'].map((line, i) => (
                <p key={line} className={i === 3 ? 'text-brand-700' : ''} style={{ opacity: prog(t, 7.2 + i * 0.25, 7.35 + i * 0.25) }}>
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* The papers stack up, each ticked off. */}
          <div className="absolute left-[50px] right-[50px] top-[1330px] flex gap-5">
            {d.papers.map((p, i) => (
              <div
                key={p.seq}
                className="relative flex-1 rounded-3xl bg-white border-4 border-b-[10px] border-brand-200 px-6 py-5"
                style={{ transform: `translateY(${400 * (1 - back(prog(t, 7.6 + i * 0.25, 8.0 + i * 0.25)))}px)`, opacity: prog(t, 7.6 + i * 0.25, 7.7 + i * 0.25) }}
              >
                <p className="text-3xl font-bold text-ink">Paper {p.seq}</p>
                <p className="text-xl text-gray-500 mt-1 leading-snug">{p.label}</p>
                <span
                  className="absolute -top-5 -right-4 flex items-center justify-center w-16 h-16 rounded-full bg-teal-500 border-b-4 border-teal-700 text-white"
                  style={{ transform: `scale(${back(prog(t, 8.35 + i * 0.2, 8.65 + i * 0.2))})` }}
                >
                  <Check className="w-9 h-9" strokeWidth={3.5} aria-hidden />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Scene 4: the bird, the logo and the call to action ───────────── */}
      {t >= 9.55 && (
        <div className="absolute inset-0 bg-brand-500" style={{ clipPath: `circle(${wipe}px at 540px 900px)` }}>
          <div className="absolute w-16 h-16" style={{ left: 170, top: 420 + bob(2, 14), opacity: prog(t, 10.2, 10.5) }}>
            <Sparkle className="w-full h-full" />
          </div>
          <div className="absolute w-20 h-20" style={{ left: 850, top: 470 + bob(2.4, 12), opacity: prog(t, 10.3, 10.6), transform: `rotate(${t * 20}deg)` }}>
            <Star className="w-full h-full" />
          </div>
          <div className="absolute w-12 h-12" style={{ left: 880, top: 960 + bob(2.2, 10), opacity: prog(t, 10.4, 10.7) }}>
            <Sparkle className="w-full h-full" fill="#FFFFFF" />
          </div>
          <div className="absolute" style={{ left: 240, top: 330 + bob(3.4, 14), width: 600, height: 600, transform: `scale(${back(prog(t, 9.75, 10.25))})` }}>
            <div className="absolute inset-[40px] rounded-full bg-sun-400 border-[14px] border-white/30" />
            <Bird pose="cheer" className="relative w-full h-full" />
          </div>
          <div className="absolute left-0 right-0 top-[1000px] flex justify-center" style={{ transform: `scale(${back(prog(t, 10.3, 10.7))})` }}>
            <span className="inline-flex items-center gap-4 rounded-full bg-white px-9 py-5 shadow-lg">
              <BirdMark className="w-20 h-20" />
              <span className="text-7xl font-bold tracking-tight text-ink">
                Prep<span className="text-brand-500">Nest</span>
              </span>
            </span>
          </div>
          <div className="absolute left-0 right-0 top-[1210px] flex justify-center" style={{ transform: `scale(${back(prog(t, 10.6, 11.0)) * (1 + 0.03 * Math.max(0, Math.sin((t - 11.5) * 5)))})` }}>
            <span className="rounded-[2rem] bg-sun-400 border-b-[10px] border-amber-600 px-14 py-7 text-6xl font-bold text-ink">Try the free test now</span>
          </div>
          <p className="absolute left-0 right-0 top-[1400px] text-center text-5xl font-bold text-white" style={{ opacity: prog(t, 11.2, 11.6) }}>
            prepnest.com.au
          </p>
          <p className="absolute left-0 right-0 top-[1480px] text-center text-3xl font-semibold text-white/90" style={{ opacity: prog(t, 11.8, 12.2) }}>
            Grade 3 to Year 12 · no account to start
          </p>
        </div>
      )}
    </div>
  )
}
