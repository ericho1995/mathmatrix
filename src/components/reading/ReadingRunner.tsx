'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import ReadingTextView from './ReadingTextView'
import { matchShortAnswer } from '@/lib/questions/matchShortAnswer'
import type { ReadingText } from '@/types/reading'

/**
 * A Reading paper on screen, laid out the way NAPLAN Online lays it out: the
 * text on one side and its questions on the other, one text at a time.
 *
 * The page only renders this for someone who may open the paper — a free
 * sample, or a paper their plan or purchase covers — so the answers it carries
 * are ones that visitor could already read in the answer key PDF.
 */

export interface RunnerQuestion {
  id: string
  /** The question number as printed on the paper. */
  n: number
  text: string
  options?: string[]
  correct?: number
  answer?: string
  accepted?: string[]
  explanation: string
}

export interface RunnerPart {
  /** Index of this part in the exam's sections, which is how results are recorded. */
  section: number
  title: string
  /** The text to read. Absent for a part whose questions each quote their own. */
  text?: ReadingText
  questions: RunnerQuestion[]
}

type Save = 'idle' | 'saving' | 'saved' | 'signin' | 'error'

export default function ReadingRunner({
  examId,
  title,
  minutes,
  parts,
  signedIn,
}: {
  examId: string
  title: string
  minutes: number
  parts: RunnerPart[]
  /** Only a signed-in student has somewhere to save a result. */
  signedIn: boolean
}) {
  const [p, setP] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | string>>({})
  const [view, setView] = useState<'text' | 'questions'>('text')
  const [finished, setFinished] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60)
  const [save, setSave] = useState<Save>('idle')
  const textPanel = useRef<HTMLElement>(null)
  const questionPanel = useRef<HTMLElement>(null)

  useEffect(() => {
    if (finished) return
    const t = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [finished])

  const all = useMemo(() => parts.flatMap(part => part.questions), [parts])
  const answered = all.filter(q => isAnswered(answers[q.id])).length
  const isCorrect = (q: RunnerQuestion) => {
    const a = answers[q.id]
    if (q.options) return a === q.correct
    return typeof a === 'string' && a.trim() !== '' && matchShortAnswer(a, { expected_answer: q.answer ?? '', accepted_answers: q.accepted })
  }
  const score = finished ? all.filter(isCorrect).length : 0

  const part = parts[p]

  function go(i: number) {
    setP(i)
    setView('text')
    setConfirming(false)
    // Each text starts at its top, not wherever the last one was scrolled to.
    textPanel.current?.scrollTo({ top: 0 })
    questionPanel.current?.scrollTo({ top: 0 })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function finish() {
    setFinished(true)
    setConfirming(false)
    if (!signedIn) {
      setSave('signin')
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSave('saving')
    // Same endpoint as marking a printed paper, so an on-screen sitting shows
    // up in the parent dashboard's topic accuracy with no extra work.
    const wrong = parts.flatMap(pt => pt.questions.filter(q => !isCorrect(q)).map(q => ({ s: pt.section, n: q.n })))
    try {
      const res = await fetch(`/api/exams/${examId}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wrong }),
      })
      setSave(res.status === 401 ? 'signin' : res.ok ? 'saved' : 'error')
    } catch {
      setSave('error')
    }
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const mm = Math.floor(secondsLeft / 60)
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-brand-600">Reading on screen</p>
          <h1 className="text-xl font-medium tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {!finished && (
            <span className={secondsLeft === 0 ? 'text-amber-600 font-medium' : 'text-gray-500'} aria-live="polite">
              {secondsLeft === 0 ? 'Time is up — finish when you are ready' : `${mm}:${ss} left`}
            </span>
          )}
          <span className="text-gray-500">
            <strong className="text-gray-900">{answered}</strong> of {all.length} answered
          </span>
        </div>
      </div>

      {finished && (
        <div className="card mb-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-20 h-20 shrink-0 rounded-full bg-brand-50 border-2 border-brand-400 flex items-center justify-center">
            <span className="text-2xl font-medium text-brand-600">{Math.round((score / all.length) * 100)}%</span>
          </div>
          <div className="flex-1">
            <p className="font-medium">
              {score} of {all.length} correct
            </p>
            <p className="text-sm text-gray-500">
              Each question now shows the answer and why. Work through the ones you missed, text by text.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {save === 'saving' && 'Saving to your progress…'}
              {save === 'saved' && 'Saved to your progress — it counts towards your topic scores.'}
              {save === 'signin' && (
                <>
                  <Link href={`/auth/login?next=/practice/reading/${examId}` as Route} className="underline">Sign in</Link> to keep your results next time.
                </>
              )}
              {save === 'error' && 'This result could not be saved, but your marking below is complete.'}
            </p>
          </div>
          <Link href={`/practice/exams/${examId}` as Route} className="btn-secondary text-sm text-center">
            Printable version
          </Link>
        </div>
      )}

      {/* One tab per text, with how many of its questions are answered or right. */}
      <nav className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1" aria-label="Texts">
        {parts.map((pt, i) => {
          const done = pt.questions.filter(q => isAnswered(answers[q.id])).length
          const right = finished ? pt.questions.filter(isCorrect).length : 0
          const active = i === p
          return (
            <button
              key={pt.section}
              onClick={() => go(i)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${active ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
              aria-current={active ? 'true' : undefined}
            >
              <span className="font-medium">{i + 1}.</span> {pt.title}
              <span className="ml-2 text-xs text-gray-400">
                {finished ? `${right}/${pt.questions.length}` : `${done}/${pt.questions.length}`}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Small screens show the text or the questions; large screens show both side by side. */}
      <div className="lg:hidden grid grid-cols-2 gap-2 mb-4">
        <button onClick={() => setView('text')} className={view === 'text' ? 'btn-primary' : 'btn-secondary'}>Read the text</button>
        <button onClick={() => setView('questions')} className={view === 'questions' ? 'btn-primary' : 'btn-secondary'}>
          Questions ({part.questions.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section ref={textPanel} className={`card lg:max-h-[calc(100vh-13rem)] lg:overflow-y-auto ${view === 'text' ? '' : 'hidden lg:block'}`} aria-label="Text">
          {part.text ? (
            <ReadingTextView text={part.text} />
          ) : (
            <p className="text-sm text-gray-500">Each question in this part includes its own short text. Read it in the question, then choose your answer.</p>
          )}
          <button onClick={() => setView('questions')} className="btn-primary w-full mt-6 lg:hidden">
            Answer the questions
          </button>
        </section>

        <section ref={questionPanel} className={`flex flex-col gap-4 lg:max-h-[calc(100vh-13rem)] lg:overflow-y-auto lg:pr-1 ${view === 'questions' ? '' : 'hidden lg:flex'}`} aria-label="Questions">
          {part.questions.map(q => (
            <Question
              key={q.id}
              q={q}
              value={answers[q.id]}
              finished={finished}
              correct={finished ? isCorrect(q) : undefined}
              onAnswer={v => setAnswers(a => ({ ...a, [q.id]: v }))}
            />
          ))}

          <div className="flex flex-wrap gap-3 pt-2">
            {p > 0 && (
              <button onClick={() => go(p - 1)} className="btn-secondary">
                Previous text
              </button>
            )}
            {p < parts.length - 1 ? (
              <button onClick={() => go(p + 1)} className="btn-primary flex-1">
                Next text
              </button>
            ) : !finished ? (
              confirming ? (
                <div className="flex-1 card border-amber-200 bg-amber-50">
                  <p className="text-sm text-gray-800 mb-3">
                    {all.length - answered} question{all.length - answered === 1 ? ' is' : 's are'} still unanswered. Finish anyway?
                  </p>
                  <div className="flex gap-2">
                    <button onClick={finish} className="btn-primary">Finish and mark</button>
                    <button onClick={() => setConfirming(false)} className="btn-secondary">Keep going</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => (answered < all.length ? setConfirming(true) : finish())} className="btn-primary flex-1">
                  Finish and mark
                </button>
              )
            ) : null}
          </div>
        </section>
      </div>
    </main>
  )
}

function isAnswered(v: number | string | undefined) {
  return typeof v === 'number' || (typeof v === 'string' && v.trim() !== '')
}

const LETTERS = ['A', 'B', 'C', 'D', 'E']

function Question({
  q,
  value,
  finished,
  correct,
  onAnswer,
}: {
  q: RunnerQuestion
  value: number | string | undefined
  finished: boolean
  correct?: boolean
  onAnswer: (v: number | string) => void
}) {
  return (
    <div className={`card ${finished ? (correct ? 'border-teal-200' : 'border-red-200') : ''}`}>
      <p className="font-medium leading-relaxed mb-3">
        <span className="text-gray-400 mr-1.5">{q.n}.</span>
        {q.text}
      </p>
      {q.options ? (
        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => {
            const chosen = value === i
            const isRight = finished && i === q.correct
            const isWrongPick = finished && chosen && i !== q.correct
            const cls = isRight
              ? 'border-teal-500 bg-teal-50 text-teal-800'
              : isWrongPick
                ? 'border-red-400 bg-red-50 text-red-700'
                : chosen
                  ? 'border-brand-600 bg-brand-50 text-brand-800'
                  : 'border-gray-200 bg-white hover:border-gray-300'
            return (
              <button
                key={i}
                onClick={() => onAnswer(i)}
                disabled={finished}
                aria-pressed={chosen}
                className={`text-left text-sm rounded-xl border px-3.5 py-2.5 transition-colors ${cls}`}
              >
                <span className="font-medium mr-2">{LETTERS[i]}</span>
                {opt}
              </button>
            )
          })}
        </div>
      ) : (
        <input
          className="input"
          value={typeof value === 'string' ? value : ''}
          onChange={e => onAnswer(e.target.value)}
          disabled={finished}
          placeholder="Type your answer"
          aria-label={`Answer to question ${q.n}`}
        />
      )}
      {finished && (
        <div className={`mt-3 rounded-xl p-3 text-sm ${correct ? 'bg-teal-50 text-teal-800' : 'bg-red-50 text-red-800'}`}>
          <p className="font-medium mb-0.5">
            {correct ? 'Correct.' : q.options ? `The answer is ${LETTERS[q.correct ?? 0]}.` : `The answer is ${q.answer}.`}
          </p>
          <p>{q.explanation}</p>
        </div>
      )}
    </div>
  )
}
