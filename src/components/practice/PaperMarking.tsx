'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import type { PaperSection } from '@/lib/exams/paperQuestions'
import type { SubjectSlug, TopicSlug, YearLevel } from '@/types'

/**
 * Marking a sat paper, and what the result means.
 *
 * The interaction is built around what the person doing it is actually holding:
 * a marked paper and an answer key. They already know which questions were
 * wrong, so the fastest possible entry is to assume everything is right and tap
 * only the mistakes — eight taps for a 40-question paper, not forty.
 *
 * No correct answers are present in this component or its props. See
 * lib/exams/paperQuestions.ts.
 */
/** Whether this result made it into the student's record. The diagnosis is
 * shown regardless — saving is what an account adds, not what it unlocks. */
type SaveState = 'idle' | 'saving' | 'saved' | 'signed-out' | 'failed'

export default function PaperMarking({
  sections,
  examId,
  subject,
  yearLevel,
  examTitle,
  backHref,
}: {
  sections: PaperSection[]
  examId: string
  subject: SubjectSlug
  yearLevel: YearLevel
  examTitle: string
  backHref: string
}) {
  const [wrong, setWrong] = useState<Set<number>>(new Set())
  const [screen, setScreen] = useState<'mark' | 'result'>('mark')
  const [saveState, setSaveState] = useState<SaveState>('idle')

  const allQuestions = useMemo(() => sections.flatMap(s => s.questions), [sections])

  // Sections in a split paper each restart at 1, so a question is identified by
  // its section index and number together, never by number alone.
  const keyOf = (sectionIndex: number, n: number) => sectionIndex * 1000 + n

  function toggle(sectionIndex: number, n: number) {
    const k = keyOf(sectionIndex, n)
    setWrong(prev => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  const byTopic = useMemo(() => {
    const map = new Map<TopicSlug, { label: string; total: number; correct: number }>()
    sections.forEach((section, si) => {
      for (const q of section.questions) {
        const entry = map.get(q.topic) ?? { label: q.label, total: 0, correct: 0 }
        entry.total += 1
        if (!wrong.has(keyOf(si, q.n))) entry.correct += 1
        map.set(q.topic, entry)
      }
    })
    return Array.from(map.entries())
      .map(([topic, v]) => ({ topic, ...v, pct: Math.round((v.correct / v.total) * 100) }))
      .sort((a, b) => a.pct - b.pct)
  }, [sections, wrong])

  const total = allQuestions.length
  const correct = total - wrong.size
  const overallPct = total ? Math.round((correct / total) * 100) : 0

  // Anything under 70% is worth practising. If everything is above that, offer
  // the weakest two anyway rather than an empty call to action.
  const weakTopics = useMemo(() => {
    const under = byTopic.filter(t => t.pct < 70)
    return (under.length ? under : byTopic.slice(0, 2)).map(t => t.topic)
  }, [byTopic])

  const practiceHref =
    `/practice?subject=${subject}&grade=${yearLevel}&topics=${weakTopics.join(',')}` as Route

  /** Sends the marked positions — never question ids, never answers. */
  async function saveResult() {
    setSaveState('saving')
    const marks = sections.flatMap((section, s) =>
      section.questions.filter(q => wrong.has(keyOf(s, q.n))).map(q => ({ s, n: q.n }))
    )
    try {
      const res = await fetch(`/api/exams/${examId}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wrong: marks }),
      })
      if (res.status === 401) return setSaveState('signed-out')
      if (!res.ok) return setSaveState('failed')
      setSaveState('saved')
    } catch {
      setSaveState('failed')
    }
  }

  function showResult() {
    setScreen('result')
    // Attempted once per visit to the result screen. Re-marking and coming back
    // saves again, which is correct — the earlier row was a different result.
    void saveResult()
  }

  // ── Marking ───────────────────────────────────────────────────────────────
  if (screen === 'mark') {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10 flex-1 w-full">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">Enter results</p>
        <h1 className="text-2xl font-medium tracking-tight mb-1">{examTitle}</h1>
        <p className="text-gray-500 mb-8">
          Mark the paper with the answer key, then tap the questions your child got wrong.
          Everything starts marked correct.
        </p>

        {sections.map((section, si) => (
          <div key={si} className="mb-8">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">
              {section.title}
            </p>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
              {section.questions.map(q => {
                const isWrong = wrong.has(keyOf(si, q.n))
                return (
                  <button
                    key={q.n}
                    onClick={() => toggle(si, q.n)}
                    aria-pressed={isWrong}
                    aria-label={`Question ${q.n}, ${q.label}, ${isWrong ? 'marked wrong' : 'marked correct'}`}
                    className={`aspect-square rounded-lg border text-sm font-medium transition-colors
                      ${isWrong
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    {q.n}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <div className="sticky bottom-4 bg-white/90 backdrop-blur rounded-xl p-3 border border-gray-100">
          <p className="text-sm text-gray-500 text-center mb-2">
            {wrong.size === 0
              ? 'No mistakes marked yet'
              : `${wrong.size} marked wrong · ${correct} of ${total} correct`}
          </p>
          <button onClick={showResult} className="btn-primary w-full">
            See what to work on
          </button>
        </div>

        <p className="text-center mt-6">
          <Link href={backHref as Route} className="text-sm text-gray-400 hover:text-gray-600 underline">
            Back to the paper
          </Link>
        </p>
      </main>
    )
  }

  // ── Result ────────────────────────────────────────────────────────────────
  return (
    <main className="max-w-2xl mx-auto px-4 py-10 flex-1 w-full">
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">Results</p>
      <h1 className="text-2xl font-medium tracking-tight mb-1">{examTitle}</h1>
      <p className="text-gray-500 mb-8">
        {correct} out of {total} correct — {overallPct}%
      </p>

      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">
        By topic, weakest first
      </p>
      <div className="flex flex-col gap-3 mb-8">
        {byTopic.map(t => (
          <div key={t.topic}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium">{t.label}</span>
              <span className="text-sm text-gray-500 tabular-nums">
                {t.correct}/{t.total}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full ${t.pct < 50 ? 'bg-red-400' : t.pct < 70 ? 'bg-amber-400' : 'bg-teal-500'}`}
                style={{ width: `${t.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-4">
        <p className="text-sm text-gray-700 mb-3">
          {wrong.size === 0
            ? 'A clean sweep. Keep the streak going with a short set on the same topics.'
            : `Practise the ${weakTopics.length === 1 ? 'topic' : 'topics'} that cost the most marks.`}
        </p>
        <Link href={practiceHref} className="btn-primary w-full block text-center">
          Practise these topics
        </Link>
      </div>

      {/* The diagnosis above never needed an account. This is only about
          whether the result is kept, so it sits under the useful part. */}
      {saveState === 'signed-out' && (
        <div className="card mb-4 bg-gray-50">
          <p className="text-sm text-gray-700 mb-3">
            Create a free account to keep this result and watch these topics improve over time.
          </p>
          <Link href={'/auth/register' as Route} className="btn-secondary w-full block text-center">
            Create an account
          </Link>
        </div>
      )}
      {saveState === 'saved' && (
        <p className="text-sm text-teal-700 mb-4">Saved to your progress.</p>
      )}
      {saveState === 'failed' && (
        <p className="text-sm text-amber-700 mb-4">
          Your results above are correct, but we couldn&apos;t save them to your account just now.
        </p>
      )}

      <div className="flex gap-3">
        <button onClick={() => setScreen('mark')} className="btn-secondary flex-1">
          Change marks
        </button>
        <Link href={backHref as Route} className="btn-secondary flex-1 text-center">
          Back to the paper
        </Link>
      </div>
    </main>
  )
}
