'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, BookOpen, HelpCircle, ListChecks } from 'lucide-react'
import ReadingTextView from '@/components/reading/ReadingTextView'
import Bird from '@/components/brand/Bird'
import QuestionView from './QuestionView'
import WorkingPad, { PAD_BAR, PAD_ROOM, WorkingPadButton, newWorkingPages, type WorkingPages } from '@/components/working/WorkingPad'
import { SELECTIVE_SUBJECTS, SUBJECTS } from '@/lib/curriculum'
import { yearLabel } from '@/lib/yearLevels'
import {
  answersPayload,
  clearTest,
  emptyAnswer,
  loadTest,
  saveResultLocal,
  saveTest,
  type AnswerState,
  type StoredTest,
} from '@/lib/diagnostic/storage'
import type { Answer } from '@/lib/diagnostic/types'
import { track } from '@/lib/analytics/track'

type Screen = 'loading' | 'none' | 'intro' | 'question' | 'review' | 'more' | 'sending'

const SUBJECT = new Map([...SUBJECTS, ...SELECTIVE_SUBJECTS].map(s => [s.slug, s.label]))
/** Time away longer than this on one visit is not counted: the child stepped away. */
const MAX_VISIT_MS = 10 * 60_000

/**
 * The diagnostic test, as the child sits it.
 *
 * One question per screen, with Back, "I'm not sure" and Next. Nothing is
 * marked during the test. The first part ends on a review screen; the server
 * then chooses a few follow-up questions from the answers, and the second part
 * ends on its own review before submitting. Every change is kept in local
 * storage, and the time on each question, answer changes and the child's own
 * "I guessed" flag go with the answers as evidence.
 */
export default function DiagnosticRunner() {
  const router = useRouter()
  const [test, setTest] = useState<StoredTest | null>(null)
  const [screen, setScreen] = useState<Screen>('loading')
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'text' | 'questions'>('text')
  const shownAt = useRef<number | null>(null)
  const [padOpen, setPadOpen] = useState(false)
  const pages = useRef<WorkingPages>(newWorkingPages())

  useEffect(() => {
    const t = loadTest()
    if (!t) return setScreen('none')
    setTest(t)
    setScreen(t.index < 0 ? 'intro' : t.index >= t.questions.length ? 'review' : 'question')
  }, [])

  const persist = useCallback((t: StoredTest) => {
    setTest(t)
    saveTest(t)
  }, [])

  /** Adds the time since the question was shown to its answer. */
  const banked = useCallback((t: StoredTest): StoredTest => {
    if (shownAt.current === null || t.index < 0 || t.index >= t.questions.length) return t
    const spent = Math.min(Date.now() - shownAt.current, MAX_VISIT_MS)
    shownAt.current = Date.now()
    const answers = t.answers.slice()
    answers[t.index] = { ...answers[t.index], ms: answers[t.index].ms + spent }
    return { ...t, answers }
  }, [])

  // Time runs only while a question is on screen and the page is visible.
  useEffect(() => {
    if (screen !== 'question') {
      shownAt.current = null
      return
    }
    shownAt.current = Date.now()
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setTest(t => {
          if (!t) return t
          const next = banked(t)
          saveTest(next)
          shownAt.current = null
          return next
        })
      } else {
        shownAt.current = Date.now()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [screen, banked])

  const lower = test ? (test.part === 2 ? test.partOne : 0) : 0

  function goTo(index: number) {
    if (!test) return
    const t = banked(test)
    const next = { ...t, index }
    persist(next)
    setScreen(index >= t.questions.length ? 'review' : 'question')
    window.scrollTo({ top: 0 })
  }

  function answer(a: Answer) {
    if (!test) return
    const answers = test.answers.slice()
    const prev = answers[test.index]
    const changed = prev.done && prev.a !== null && a !== null && prev.a !== a && typeof a === 'number'
    answers[test.index] = { ...prev, a, done: a !== null && !(typeof a === 'string' && a.trim() === ''), ch: prev.ch + (changed ? 1 : 0), g: a === null ? false : prev.g }
    persist({ ...test, answers })
  }

  function setGuess(g: boolean) {
    if (!test) return
    const answers = test.answers.slice()
    answers[test.index] = { ...answers[test.index], g }
    persist({ ...test, answers })
  }

  function notSure() {
    if (!test) return
    const answers = test.answers.slice()
    answers[test.index] = { ...answers[test.index], a: null, g: false, done: true }
    const t = banked({ ...test, answers })
    persist({ ...t, index: t.index + 1 })
    setScreen(t.index + 1 >= t.questions.length ? 'review' : 'question')
    window.scrollTo({ top: 0 })
  }

  /** After the first part: ask the server for follow-ups. */
  async function finishPartOne() {
    if (!test) return
    setScreen('sending')
    setError(null)
    try {
      const res = await fetch('/api/diagnostic/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: test.token, answers: answersPayload(test.answers) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? `Something went wrong (${res.status}).`)
      const next: StoredTest = {
        ...test,
        token: data.token,
        part: 2,
        questions: [...test.questions, ...data.questions],
        texts: { ...(test.texts ?? {}), ...(data.texts ?? {}) },
        answers: [...test.answers, ...data.questions.map(emptyAnswer)],
        index: test.questions.length,
      }
      persist(next)
      if (!data.questions.length) return submit(next)
      setScreen('more')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setScreen('review')
    }
  }

  async function submit(t: StoredTest) {
    setScreen('sending')
    setError(null)
    try {
      const res = await fetch('/api/diagnostic/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: t.token, answers: answersPayload(t.answers) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? `Something went wrong (${res.status}).`)
      track('CompleteFreeTest')
      if (data.saved) {
        clearTest()
        router.push(`/diagnostic/report/${data.id}`)
        return
      }
      saveResultLocal({ receipt: data.receipt, headline: data.headline, savedAt: Date.now(), ...(data.saveError ? { saveError: data.saveError } : {}) })
      clearTest()
      router.push('/diagnostic/results')
    } catch (e) {
      // The answers are still saved on this device; the review screen offers a retry.
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setScreen('review')
    }
  }

  // Keyboard: A–D or 1–4 choose, Enter moves on.
  useEffect(() => {
    if (screen !== 'question' || !test) return
    const q = test.questions[test.index]
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.metaKey || e.ctrlKey || e.altKey) return
      const options = q?.kind === 'choice' ? (q.optionDiagrams?.length ?? q.options?.length ?? 0) : 0
      const k = e.key.toLowerCase()
      const i = 'abcdef'.indexOf(k) >= 0 ? 'abcdef'.indexOf(k) : '123456'.indexOf(k)
      if (i >= 0 && i < options) answer(i)
      else if (e.key === 'Enter' && test.answers[test.index].done) goTo(test.index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (screen === 'loading') return <Shell><p className="text-gray-500">Loading the test…</p></Shell>

  if (screen === 'none' || !test) {
    return (
      <Shell>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">No test in progress</h1>
        <p className="text-gray-500 mb-6">There is no diagnostic test open on this device.</p>
        <Link href="/diagnostic" className="btn-primary">
          Choose a test
        </Link>
      </Shell>
    )
  }

  const total = test.questions.length
  const subject = SUBJECT.get(test.subject) ?? test.subject
  const who = test.name ?? 'your child'

  if (screen === 'intro') {
    return (
      <Shell>
        <Bird pose="think" className="w-36 h-36 mb-4 -ml-3" />
        <p className="text-sm font-bold text-brand-600 mb-2">
          {yearLabel(test.year)} {subject}
        </p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">{test.name ? `Over to you, ${test.name}!` : 'Ready when you are!'}</h1>
        <div className="text-gray-600 text-lg leading-relaxed space-y-3 mb-8">
          <p>
            There are {test.partOne} questions{test.followUps ? ', then a few more' : ''}. Take your time — this is not a race,
            and nobody expects you to know everything.
          </p>
          <p>
            If you don&apos;t know an answer, press <strong>I&apos;m not sure</strong>. That&apos;s much better than guessing.
            If you do guess, tick <strong>I guessed this one</strong>.
          </p>
          {test.subject === 'reading' && <p>Read each text first. You can look back at it as often as you like.</p>}
        </div>
        <button type="button" className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-10 py-3.5 w-full sm:w-auto" onClick={() => goTo(0)}>
          Start
          <ArrowRight className="w-5 h-5" aria-hidden />
        </button>
        <p className="text-sm text-gray-400 mt-6">Parent: hand the device to {who} now. Progress saves as they go.</p>
      </Shell>
    )
  }

  if (screen === 'sending') {
    return (
      <Shell>
        <Bird pose="read" className="w-28 h-28 mb-4 animate-pulse" />
        <p className="text-lg font-semibold text-gray-600" role="status">
          {test.part === 1 ? 'Saving your answers…' : 'Finishing up…'}
        </p>
      </Shell>
    )
  }

  if (screen === 'more') {
    return (
      <Shell>
        <Bird pose="cheer" className="w-36 h-36 mb-4 -ml-3" />
        <h1 className="text-4xl font-bold tracking-tight mb-4">Nice work! A few more to go.</h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          {total - test.partOne === 1 ? 'One more question' : `${total - test.partOne} more questions`}
          {test.subject === 'reading' ? ', about one more text' : ''}. Same as before: I&apos;m not sure is fine.
        </p>
        <button type="button" className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-10 py-3.5 w-full sm:w-auto" onClick={() => goTo(test.partOne)}>
          Keep going
          <ArrowRight className="w-5 h-5" aria-hidden />
        </button>
      </Shell>
    )
  }

  if (screen === 'review') {
    const range = test.answers.map((a, i) => ({ a, i })).slice(lower)
    const unanswered = range.filter(x => !x.a.done).length
    return (
      <Shell>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">{test.part === 1 ? 'Check your answers' : 'All done — check and finish'}</h1>
        <p className="text-gray-500 mb-6">
          Tap a number to go back to it.{' '}
          {unanswered ? `${unanswered === 1 ? 'One question has' : `${unanswered} questions have`} no answer yet.` : 'Every question has an answer.'}
        </p>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 mb-6">
          {range.map(({ a, i }) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`aspect-square rounded-xl border-2 border-b-4 text-sm font-bold ${
                !a.done ? 'border-amber-400 bg-amber-50 text-amber-600' : a.a === null ? 'border-line bg-gray-50 text-gray-500' : 'border-brand-200 bg-brand-50 text-brand-700'
              }`}
              aria-label={`Question ${i + 1}: ${!a.done ? 'no answer' : a.a === null ? 'not sure' : 'answered'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <ul className="flex flex-wrap gap-4 text-xs text-gray-500 mb-8">
          <Legend cls="border-brand-200 bg-brand-50">Answered</Legend>
          <Legend cls="border-gray-200 bg-gray-50">Not sure</Legend>
          <Legend cls="border-amber-400 bg-amber-50">No answer yet</Legend>
        </ul>
        {error && (
          <p role="alert" className="text-sm text-red-600 mb-4">
            {error} Your answers are saved on this device — try again.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={() => goTo(total - 1)}>
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Back
          </button>
          <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={() => (test.part === 1 ? finishPartOne() : submit(test))}>
            {test.part === 1 ? 'Carry on' : 'Finish the test'}
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </Shell>
    )
  }

  // ── A question ─────────────────────────────────────────────────────────────
  const q = test.questions[test.index]
  const state: AnswerState = test.answers[test.index]
  const text = q.textId ? test.texts?.[q.textId] : undefined
  const progress = ((test.index + 1) / total) * 100
  const canNext = state.done

  const body = (
    <div>
      <QuestionView question={q} answer={state.a} onAnswer={answer} />
      {/* Always laid out, only shown once there is an answer, so the buttons below never jump. */}
      <label
        className={`mt-4 inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none ${state.a !== null && state.done ? '' : 'invisible'}`}
        aria-hidden={!(state.a !== null && state.done)}
      >
        <input
          type="checkbox"
          className="w-4 h-4 accent-brand-600"
          checked={state.g}
          onChange={e => setGuess(e.target.checked)}
          tabIndex={state.a !== null && state.done ? 0 : -1}
        />
        I guessed this one
      </label>
      <div className={`sticky bottom-0 ${padOpen ? PAD_BAR : ''} z-10 -mx-4 px-4 py-3 bg-white border-t-2 border-line flex items-center gap-2 mt-8 sm:static sm:mx-0 sm:px-0 sm:py-0 sm:border-0 sm:gap-3 sm:flex-wrap`}>
        <button
          type="button"
          className="btn-secondary inline-flex items-center gap-2 px-4 sm:px-5 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => goTo(test.index - 1)}
          disabled={test.index <= lower}
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          <span className="hidden sm:inline">Back</span>
        </button>
        <button type="button" className="btn-secondary inline-flex items-center gap-2 whitespace-nowrap px-4 sm:px-5" onClick={notSure}>
          <HelpCircle className="w-4 h-4" aria-hidden />
          I&apos;m not sure
        </button>
        <button type="button" className="btn-primary inline-flex items-center justify-center gap-2 ml-auto px-6 sm:px-8 flex-1 sm:flex-none disabled:opacity-40 disabled:cursor-not-allowed" onClick={() => goTo(test.index + 1)} disabled={!canNext}>
          {test.index + 1 >= total ? 'Review' : 'Next'}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  )

  return (
    <main className={`flex-1 w-full ${padOpen ? PAD_ROOM : ''}`}>
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b-2 border-line">
        <div className={`${text ? 'max-w-6xl' : 'max-w-3xl'} mx-auto px-4 py-3 flex items-center gap-4`}>
          <p className="text-sm font-bold text-gray-600 whitespace-nowrap">
            Question {test.index + 1} <span className="text-gray-400">of {total}</span>
          </p>
          <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden" role="progressbar" aria-valuenow={test.index + 1} aria-valuemin={1} aria-valuemax={total}>
            <div className="h-full rounded-full bg-teal-400 transition-all duration-300 relative" style={{ width: `${progress}%` }}>
              <span className="absolute left-2 right-2 top-1 h-1 rounded-full bg-white/40" aria-hidden />
            </div>
          </div>
          <WorkingPadButton open={padOpen} onToggle={() => setPadOpen(o => !o)} />
          <button type="button" className="text-sm font-bold text-gray-500 hover:text-brand-600 inline-flex items-center gap-1" onClick={() => goTo(total)}>
            <ListChecks className="w-4 h-4" aria-hidden />
            <span className="hidden sm:inline">Review</span>
          </button>
        </div>
      </div>

      {text ? (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="lg:hidden flex gap-2 mb-4" role="tablist">
            <button type="button" role="tab" aria-selected={view === 'text'} className={view === 'text' ? 'btn-primary py-2' : 'btn-secondary py-2'} onClick={() => setView('text')}>
              <BookOpen className="w-4 h-4 inline mr-1.5" aria-hidden />
              Read the text
            </button>
            <button type="button" role="tab" aria-selected={view === 'questions'} className={view === 'questions' ? 'btn-primary py-2' : 'btn-secondary py-2'} onClick={() => setView('questions')}>
              Question
            </button>
          </div>
          <div className="lg:grid lg:grid-cols-2 lg:gap-10">
            <div className={`${view === 'text' ? 'block' : 'hidden'} lg:block lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-4 rounded-2xl border-2 border-line p-5 bg-white`}>
              <ReadingTextView text={text} />
            </div>
            <div className={`${view === 'questions' ? 'block' : 'hidden'} lg:block`}>{body}</div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-4 py-8">{body}</div>
      )}
      <WorkingPad open={padOpen} onClose={() => setPadOpen(false)} pageKey={q.id} pages={pages.current} label={`Question ${test.index + 1}`} />
    </main>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="max-w-2xl mx-auto px-4 py-16 flex-1 w-full">{children}</main>
}

function Legend({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={`inline-block w-4 h-4 rounded border ${cls}`} aria-hidden />
      {children}
    </li>
  )
}
