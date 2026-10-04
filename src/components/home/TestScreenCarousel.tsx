'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react'
import QuestionView from '@/components/diagnostic/QuestionView'
import type { HomeSample } from '@/lib/homeSamples'

/**
 * The test screen as a child sees it, for several year levels: swipe (or use
 * the arrows) to go from Grade 3 to VCE. Each card is the real question screen
 * with a real question, nothing chosen; choosing an option just shows it.
 * The track takes the height of the card on show, not the tallest one, so a
 * short question does not sit above a gap left by a long one.
 */
export default function TestScreenCarousel({ samples }: { samples: HomeSample[] }) {
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number | string | null>>({})
  const [height, setHeight] = useState<number>()

  useEffect(() => {
    const slide = track.current?.children[active] as HTMLElement | undefined
    if (!slide) return
    const measure = () => setHeight(slide.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(slide)
    return () => ro.disconnect()
  }, [active])

  function go(i: number) {
    const el = track.current
    if (!el) return
    const next = Math.max(0, Math.min(samples.length - 1, i))
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
  }

  function onScroll() {
    const el = track.current
    if (el) setActive(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)))
  }

  return (
    <div>
      <div
        ref={track}
        onScroll={onScroll}
        style={{ height }}
        className="flex items-start overflow-x-auto overflow-y-hidden snap-x snap-mandatory transition-[height] duration-300 motion-reduce:transition-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-roledescription="carousel"
        aria-label="Sample questions, Grade 3 to VCE"
      >
        {samples.map((s, i) => (
          <div key={s.question.id} className="w-full shrink-0 snap-center px-1" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${samples.length}: ${s.label}`}>
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-bold text-gray-500 whitespace-nowrap">
                  Question {s.question.n} of {s.of}
                </span>
                <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-teal-400 relative" style={{ width: `${Math.max(8, (s.question.n / s.of) * 100)}%` }}>
                    <span className="absolute left-2 right-2 top-1 h-1 rounded-full bg-white/40" />
                  </div>
                </div>
              </div>
              <p className="inline-block rounded-full bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1 mb-4">{s.label}</p>
              <div>
                <QuestionView compact question={s.question} answer={answers[i] ?? null} onAnswer={a => setAnswers(prev => ({ ...prev, [i]: a }))} />
              </div>
              <div className="flex items-center justify-between mt-5">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500">
                  <HelpCircle className="w-4 h-4" aria-hidden />
                  I&apos;m not sure
                </span>
                <span className="btn-primary pointer-events-none">Next</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 mt-5">
        <button type="button" onClick={() => go(active - 1)} disabled={active === 0} className="btn-secondary p-2 disabled:opacity-40" aria-label="Previous question">
          <ArrowLeft className="w-5 h-5" aria-hidden />
        </button>
        <div className="flex gap-2" role="tablist" aria-label="Choose a sample question">
          {samples.map((s, i) => (
            <button
              key={s.question.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={s.label}
              onClick={() => go(i)}
              className={`h-3 rounded-full transition-all ${i === active ? 'w-8 bg-brand-500' : 'w-3 bg-gray-300 hover:bg-gray-400'}`}
            />
          ))}
        </div>
        <button type="button" onClick={() => go(active + 1)} disabled={active === samples.length - 1} className="btn-secondary p-2 disabled:opacity-40" aria-label="Next question">
          <ArrowRight className="w-5 h-5" aria-hidden />
        </button>
      </div>
      <p className="text-center text-sm font-semibold text-gray-500 mt-2">{samples[active]?.label} · swipe for more</p>
    </div>
  )
}
