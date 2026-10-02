'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { ArrowLeft, ArrowRight, BookOpen, Check, ListChecks, Minus, Plus, Timer, X } from 'lucide-react'
import Bird from '@/components/brand/Bird'
import QuestionView from '@/components/diagnostic/QuestionView'
import ReadingTextView from '@/components/reading/ReadingTextView'
import WorkingPad, { PAD_BAR, PAD_ROOM, WorkingPadButton, newWorkingPages, type WorkingPages } from '@/components/working/WorkingPad'
import type { ScreenQuestion } from '@/lib/web/questionHtml'
import type { Answer } from '@/lib/diagnostic/types'
import type { KeyItem, OnlinePaper } from '@/lib/exams/onScreen'

type Screen = 'intro' | 'question' | 'review' | 'checking' | 'results'
type SaveState = { state: 'idle' | 'saving' | 'saved' | 'signin' } | { state: 'error'; message: string }

interface Stored {
  answers: Record<string, Answer>
  written: Record<string, string[]>
  index: number
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const storageKey = (paperId: string) => `prepnest:paper:${paperId}`

function readStored(paperId: string): Stored | null {
  try {
    const raw = window.localStorage.getItem(storageKey(paperId))
    return raw ? (JSON.parse(raw) as Stored) : null
  } catch {
    return null
  }
}

function writeStored(paperId: string, s: Stored | null) {
  try {
    if (s) window.localStorage.setItem(storageKey(paperId), JSON.stringify(s))
    else window.localStorage.removeItem(storageKey(paperId))
  } catch {
    /* private window or storage full: the paper still works, it just won't survive a reload */
  }
}

/** A written answer as one string: each part's text under its label. */
function joinWritten(q: ScreenQuestion, parts: string[] | undefined): string | null {
  if (!parts?.some(t => t.trim())) return null
  return (q.parts ?? [])
    .map((p, i) => ((parts[i] ?? '').trim() ? `${p.label ? `(${p.label}) ` : ''}${parts[i].trim()}` : ''))
    .filter(Boolean)
    .join('\n\n')
    .slice(0, 4000)
}

/**
 * Any paper sat on screen — a catalogue practice exam or a weak-areas paper.
 *
 * One question per screen, numbered as the printed paper is, with a timer and
 * a working-out pad (draw or type) beside it. Nothing is marked until the
 * paper is handed in; then the server returns the answer key. Multiple choice
 * and short answers are marked automatically; written questions show their
 * marking guide and the parent or child gives the marks, exactly as with the
 * printed answer key.
 *
 * Saving: a weak-areas paper saves its marks to the paper (`marks`); a
 * catalogue paper records which questions were wrong through the same route
 * as marking a printed paper (`result`), so it reaches the dashboard either way.
 */
export default function PaperRunner({
  paperId,
  paper,
  name,
  backHref,
  checkUrl,
  marksUrl,
  saveMode = 'marks',
  blurb = 'Every question practices an area still to work on.',
  backLabel = 'Back to the report',
  signInHref,
  signedIn = true,
}: {
  paperId: string
  paper: OnlinePaper
  name: string | null
  backHref: string
  checkUrl: string
  /** Where the result is saved; null where nothing is saved (the dev preview). */
  marksUrl: string | null
  saveMode?: 'marks' | 'result'
  /** A line about the paper on the opening screen. */
  blurb?: string
  backLabel?: string
  /** Where to sign in to keep a result, when saving needs an account. */
  signInHref?: string
  /** False for a visitor with no account: the result is marked but cannot be kept. */
  signedIn?: boolean
}) {
  const items = useMemo(() => paper.sections.flatMap((s, si) => s.questions.map(q => ({ q, si }))), [paper])
  const [screen, setScreen] = useState<Screen>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [written, setWritten] = useState<Record<string, string[]>>({})
  const [key, setKey] = useState<KeyItem[] | null>(null)
  const [given, setGiven] = useState<Record<string, number>>({})
  const [save, setSave] = useState<SaveState>({ state: 'idle' })
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'text' | 'questions'>('text')
  const [padOpen, setPadOpen] = useState(false)
  const pages = useRef<WorkingPages>(newWorkingPages())
  const [secondsLeft, setSecondsLeft] = useState(paper.minutes * 60)
  const restored = useRef(false)

  useEffect(() => {
    const s = readStored(paperId)
    if (s) {
      setAnswers(s.answers ?? {})
      setWritten(s.written ?? {})
      setIndex(Math.min(Math.max(0, s.index ?? 0), items.length - 1))
    }
    restored.current = true
  }, [paperId, items.length])

  useEffect(() => {
    if (restored.current && screen !== 'results') writeStored(paperId, { answers, written, index })
  }, [paperId, answers, written, index, screen])

  // The clock runs while the paper is being sat, and only counts down: running out says so but stops nothing.
  useEffect(() => {
    if (screen !== 'question' && screen !== 'review') return
    const t = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [screen])

  const answered = (q: ScreenQuestion) => (q.kind === 'written' ? Boolean(joinWritten(q, written[q.id])) : answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '')

  // The pad stays open from question to question (each has its own page) and closes for the review.
  function goTo(i: number) {
    if (i >= items.length) {
      setPadOpen(false)
      setScreen('review')
    } else {
      setIndex(Math.max(0, i))
      setScreen('question')
    }
    window.scrollTo({ top: 0 })
  }

  function payload() {
    return items.map(({ q }) => ({ id: q.id, a: q.kind === 'written' ? joinWritten(q, written[q.id]) : answers[q.id] ?? null }))
  }

  async function handIn() {
    setScreen('checking')
    setError(null)
    try {
      const res = await fetch(checkUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: payload() }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? `Something went wrong (${res.status}).`)
      setKey(data.key as KeyItem[])
      if (saveMode === 'result' && !(data.key as KeyItem[]).some(k => k.written)) void saveResult(data.key as KeyItem[], {})
      if (data.saved) {
        setSave({ state: 'saved' })
        writeStored(paperId, null)
      } else if (data.saveError) {
        setSave({ state: 'error', message: data.saveError })
      }
      setScreen('results')
      window.scrollTo({ top: 0 })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setScreen('review')
    }
  }

  /** A catalogue paper's result: which questions were wrong, as the printed paper's marking screen sends it. */
  async function saveResult(k: KeyItem[], marks: Record<string, number>) {
    if (!marksUrl) return
    setSave({ state: 'saving' })
    const wrong = k.filter(x => (x.written ? (marks[x.id] ?? 0) < x.marks : !x.correct)).map(x => ({ s: x.s, n: x.n }))
    try {
      const res = await fetch(marksUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wrong }) })
      if (res.status === 401) return setSave({ state: 'signin' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? `Something went wrong (${res.status}).`)
      setSave({ state: 'saved' })
      writeStored(paperId, null)
    } catch (e) {
      setSave({ state: 'error', message: e instanceof Error ? e.message : 'The result could not be saved.' })
    }
  }

  async function saveMarks() {
    if (!marksUrl || !key) return
    if (saveMode === 'result') return saveResult(key, given)
    setSave({ state: 'saving' })
    try {
      const res = await fetch(marksUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: payload(), written: key.filter(k => k.written).map(k => ({ id: k.id, m: given[k.id] ?? 0 })) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? `Something went wrong (${res.status}).`)
      setSave({ state: 'saved' })
      writeStored(paperId, null)
    } catch (e) {
      setSave({ state: 'error', message: e instanceof Error ? e.message : 'The marks could not be saved.' })
    }
  }

  const who = name ?? 'your child'
  const total = items.length

  if (screen === 'intro') {
    const started = Object.keys(answers).length + Object.keys(written).length > 0
    return (
      <Shell>
        <Bird pose="think" className="w-32 h-32 mb-4 -ml-3" />
        <p className="text-sm font-bold text-brand-600 mb-2">Practice paper on screen</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{paper.title}</h1>
        <div className="text-gray-600 text-lg leading-relaxed space-y-3 mb-8">
          <p>
            {total} questions in {paper.sections.length} {paper.sections.length === 1 ? 'part' : 'parts'}, about {paper.minutes} minutes. {blurb}
          </p>
          <p>
            Use <strong>Working out</strong> at the top to draw or type notes beside any question. Nothing is marked until you hand the paper in —
            then every answer is explained.
          </p>
          {!signedIn && signInHref && (
            <p className="text-base rounded-2xl bg-sun-50 border-2 border-sun-200 px-4 py-3">
              You can sit it without an account, but the result won’t be kept.{' '}
              <Link href={signInHref as Route} className="font-bold underline">
                Sign in first
              </Link>{' '}
              to save it to your dashboard.
            </p>
          )}
        </div>
        <button type="button" className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-10 py-3.5 w-full sm:w-auto" onClick={() => goTo(started ? index : 0)}>
          {started ? 'Carry on' : 'Start'}
          <ArrowRight className="w-5 h-5" aria-hidden />
        </button>
        <p className="text-sm text-gray-400 mt-6">
          Progress saves on this device as {who} goes.{' '}
          <Link href={backHref as Route} className="underline">
            {backLabel}
          </Link>
        </p>
      </Shell>
    )
  }

  if (screen === 'checking') {
    return (
      <Shell>
        <Bird pose="read" className="w-28 h-28 mb-4 animate-pulse" />
        <p className="text-lg font-semibold text-gray-600" role="status">
          Marking the paper…
        </p>
      </Shell>
    )
  }

  if (screen === 'review') {
    const missing = items.filter(({ q }) => !answered(q)).length
    return (
      <Shell>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Check and hand in</h1>
        <p className="text-gray-500 mb-6">
          Tap a number to go back to it. {missing ? `${missing === 1 ? 'One question has' : `${missing} questions have`} no answer yet.` : 'Every question has an answer.'}
        </p>
        <div className="space-y-5 mb-8">
          {paper.sections.map((s, si) => (
            <div key={si}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{s.title}</p>
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                {items.map(({ q, si: qs }, i) =>
                  qs !== si ? null : (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => goTo(i)}
                      className={`aspect-square rounded-xl border-2 border-b-4 text-sm font-bold ${answered(q) ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-amber-400 bg-amber-50 text-amber-600'}`}
                      aria-label={`Question ${q.n}: ${answered(q) ? 'answered' : 'no answer'}`}
                    >
                      {q.n}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600 mb-4">
            {error} The answers are saved on this device — try again.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={() => goTo(total - 1)}>
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Back
          </button>
          <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={handIn}>
            Hand in the paper
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </Shell>
    )
  }

  if (screen === 'results' && key) {
    const byId = new Map(items.map(({ q }) => [q.id, q]))
    const auto = key.filter(k => !k.written)
    const writtenKeys = key.filter(k => k.written)
    const autoRight = auto.filter(k => k.correct).length
    const marksAvailable = auto.length + writtenKeys.reduce((n, k) => n + k.marks, 0)
    const marksGot = autoRight + writtenKeys.reduce((n, k) => n + (given[k.id] ?? 0), 0)
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full">
        <div className="flex items-center gap-4 mb-6">
          <Bird pose="cheer" className="w-24 h-24 shrink-0 -ml-2" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Paper handed in</h1>
            <p className="text-gray-600 mt-1">
              {writtenKeys.length ? (
                <>
                  {auto.length ? `${autoRight} of ${auto.length} right in the multiple choice. ` : ''}Give the marks for the written {writtenKeys.length === 1 ? 'question' : 'questions'} below,
                  using the marking guide, then save.
                </>
              ) : (
                <>
                  {autoRight} of {auto.length} right. Go through each wrong answer together — the explanations show the working.
                </>
              )}
            </p>
          </div>
        </div>

        {writtenKeys.length > 0 && (
          <p className="card px-5 py-3 mb-6 text-sm text-gray-700">
            Total so far: <strong>{marksGot}</strong> of {marksAvailable} marks
          </p>
        )}

        <ol className="space-y-3 mb-8">
          {key.map((k, i) => {
            const q = byId.get(k.id)!
            const heading = i === 0 || key[i - 1].s !== k.s ? paper.sections[k.s]?.title : null
            return (
              <li key={k.id}>
                {heading && <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-6 mb-2">{heading}</p>}
                <div className={`card p-5 border-l-4 ${k.written ? 'border-l-brand-400' : k.correct ? 'border-l-teal-400' : 'border-l-red-400'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <span className="font-bold text-gray-500 w-8 shrink-0">{k.n}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink mb-2" dangerouslySetInnerHTML={{ __html: q.stem }} />
                      {k.written ? (
                        <WrittenResult k={k} parts={written[k.id]} value={given[k.id]} onChange={m => setGiven(g => ({ ...g, [k.id]: m }))} disabled={save.state === 'saved'} />
                      ) : (
                        <>
                          <p className="text-sm flex items-center gap-1.5 mb-1">
                            {k.correct ? <Check className="w-4 h-4 text-teal-600" aria-hidden /> : <X className="w-4 h-4 text-red-500" aria-hidden />}
                            <span className="text-gray-500">Your answer:</span> <YourAnswer q={q} a={answers[k.id]} />
                          </p>
                          {!k.correct && (
                            <p className="text-sm mb-1">
                              <span className="text-gray-500">Answer:</span> <span dangerouslySetInnerHTML={{ __html: k.answer }} />
                            </p>
                          )}
                          <p className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: k.explanation }} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        <div className="flex flex-wrap items-center gap-3">
          {writtenKeys.length > 0 && marksUrl && save.state !== 'saved' && (
            <button type="button" className="btn-primary" onClick={saveMarks} disabled={save.state === 'saving'}>
              {save.state === 'saving' ? 'Saving…' : saveMode === 'result' ? 'Save the result' : 'Save the marks'}
            </button>
          )}
          <Link href={backHref as Route} className={save.state === 'saved' || !writtenKeys.length ? 'btn-primary' : 'btn-secondary'}>
            {backLabel}
          </Link>
          {save.state === 'saved' && (
            <p className="text-sm text-teal-600" role="status">
              {saveMode === 'result' ? 'Saved to your progress — it counts towards your topic scores.' : 'Saved with the report.'}
            </p>
          )}
          {save.state === 'signin' && (
            <p className="text-sm text-gray-600" role="status">
              The marking above is complete.{' '}
              {signInHref ? (
                <Link href={signInHref as Route} className="underline font-bold">
                  Sign in
                </Link>
              ) : (
                'Sign in'
              )}{' '}
              before your next paper to keep results on your dashboard.
            </p>
          )}
          {save.state === 'error' && (
            <p className="text-sm text-red-600" role="alert">
              {save.message}
            </p>
          )}
          {!marksUrl && <p className="text-xs text-gray-400">Preview: marks are not saved.</p>}
        </div>
      </main>
    )
  }

  // ── A question ─────────────────────────────────────────────────────────────
  const { q, si } = items[index]
  const section = paper.sections[si]
  const text = q.textId ? paper.texts[q.textId] : undefined
  const progress = ((index + 1) / total) * 100
  const firstOfSection = index === 0 || items[index - 1].si !== si

  const body = (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{section.title}</p>
      {firstOfSection && section.instructions?.length ? (
        <ul className="text-sm text-gray-500 mb-5 space-y-1">
          {section.instructions.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : null}
      {q.kind === 'written' ? (
        <WrittenView question={q} parts={written[q.id] ?? []} onChange={parts => setWritten(w => ({ ...w, [q.id]: parts }))} onPad={() => setPadOpen(true)} />
      ) : (
        <QuestionView question={q} answer={answers[q.id] ?? null} onAnswer={a => setAnswers(prev => ({ ...prev, [q.id]: a }))} />
      )}
      <div className={`sticky bottom-0 ${padOpen ? PAD_BAR : ''} z-10 -mx-4 px-4 py-3 bg-white border-t-2 border-line flex items-center gap-2 mt-8 sm:static sm:mx-0 sm:px-0 sm:py-0 sm:border-0 sm:gap-3`}>
        <button
          type="button"
          className="btn-secondary inline-flex items-center gap-2 px-4 sm:px-5 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          <span className="hidden sm:inline">Back</span>
        </button>
        <button type="button" className="btn-primary inline-flex items-center justify-center gap-2 ml-auto px-6 sm:px-8 flex-1 sm:flex-none" onClick={() => goTo(index + 1)}>
          {index + 1 >= total ? 'Review' : answered(q) ? 'Next' : 'Skip for now'}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  )

  return (
    <main className={`flex-1 w-full ${padOpen ? PAD_ROOM : ''}`}>
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b-2 border-line">
        <div className={`${text ? 'max-w-6xl' : 'max-w-3xl'} mx-auto px-4 py-3 flex items-center gap-3 sm:gap-4`}>
          <p className="text-sm font-bold text-gray-600 whitespace-nowrap">
            Question {q.n} <span className="text-gray-400 hidden sm:inline">· {index + 1} of {total}</span>
          </p>
          <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total}>
            <div className="h-full rounded-full bg-teal-400 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className={`hidden sm:inline-flex items-center gap-1 text-sm font-bold tabular-nums ${secondsLeft === 0 ? 'text-amber-600' : 'text-gray-500'}`} aria-live="off" title="Time left">
            <Timer className="w-4 h-4" aria-hidden />
            {secondsLeft === 0 ? 'Time’s up' : `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`}
          </span>
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
      <WorkingPad open={padOpen} onClose={() => setPadOpen(false)} pageKey={q.id} pages={pages.current} label={`Question ${q.n}`} />
    </main>
  )
}

/** A written question: the stem, then each part with its marks and a box to answer in. */
function WrittenView({ question: q, parts, onChange, onPad }: { question: ScreenQuestion; parts: string[]; onChange: (parts: string[]) => void; onPad: () => void }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="text-lg sm:text-xl font-bold leading-snug text-ink" dangerouslySetInnerHTML={{ __html: q.stem }} />
        {q.marks ? <span className="shrink-0 text-xs font-bold rounded-full bg-gray-100 text-gray-600 px-2.5 py-1">{q.marks} marks</span> : null}
      </div>
      {q.diagram && (
        <div className="rounded-2xl border-2 border-line bg-white text-[#1a1a1a] p-3 mb-6 overflow-x-auto flex justify-center" dangerouslySetInnerHTML={{ __html: q.diagram }} />
      )}
      <div className="space-y-6">
        {(q.parts ?? []).map((p, i) => (
          <div key={i}>
            {(p.label || p.prompt) && (
              <div className="flex items-start gap-2 mb-2">
                {p.label && <span className="font-bold text-gray-700">{p.label}.</span>}
                <div className="flex-1 text-base leading-relaxed text-ink" dangerouslySetInnerHTML={{ __html: p.prompt }} />
                <span className="shrink-0 text-xs text-gray-500">
                  {p.marks} {p.marks === 1 ? 'mark' : 'marks'}
                </span>
              </div>
            )}
            {p.diagram && <div className="rounded-xl border-2 border-line bg-white text-[#1a1a1a] p-2 mb-2 overflow-x-auto flex justify-center" dangerouslySetInnerHTML={{ __html: p.diagram }} />}
            <textarea
              className="input w-full min-h-[6rem] text-base"
              value={parts[i] ?? ''}
              onChange={e => {
                const next = parts.slice()
                next[i] = e.target.value
                onChange(next)
              }}
              maxLength={1500}
              placeholder={p.unit ? `Your answer (${p.unit})` : 'Your answer and working'}
              aria-label={p.label ? `Answer to part ${p.label}` : 'Your answer'}
            />
          </div>
        ))}
      </div>
      <button type="button" onClick={onPad} className="mt-3 text-sm font-bold text-brand-600 hover:underline">
        Easier to draw it? Open the working-out pad
      </button>
    </div>
  )
}

function YourAnswer({ q, a }: { q: ScreenQuestion; a: Answer | undefined }) {
  if (a === undefined || a === null || a === '') return <span className="text-gray-400">no answer</span>
  if (typeof a === 'number') {
    const text = q.options?.[a]
    return (
      <span>
        <strong>{LETTERS[a]}</strong>
        {text ? <span dangerouslySetInnerHTML={{ __html: ` — ${text.replace(/ \| /g, ' · ')}` }} /> : null}
      </span>
    )
  }
  return <span>{a}</span>
}

/** A written question once handed in: what was written, the guide, and the marks to give. */
function WrittenResult({
  k,
  parts,
  value,
  onChange,
  disabled,
}: {
  k: KeyItem
  parts: string[] | undefined
  value: number | undefined
  onChange: (m: number) => void
  disabled: boolean
}) {
  const m = value ?? 0
  return (
    <div className="space-y-4">
      {(k.parts ?? [{ label: '', marks: k.marks, answer: k.answer, explanation: k.explanation }]).map((p, i) => (
        <div key={i} className="text-sm">
          {p.label && (
            <p className="font-bold text-gray-700 mb-1">
              {p.label}. <span className="font-normal text-gray-500">({p.marks} {p.marks === 1 ? 'mark' : 'marks'})</span>
            </p>
          )}
          <p className="text-gray-500 mb-1">Written:</p>
          <p className="whitespace-pre-wrap rounded-lg bg-gray-50 px-3 py-2 mb-2 text-gray-800">{parts?.[i]?.trim() || <span className="text-gray-400">nothing written</span>}</p>
          {p.answer && (
            <>
              <p className="text-gray-500 mb-1">Model answer:</p>
              <div className="mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.answer }} />
            </>
          )}
          <p className="text-gray-500 mb-1">How the marks are given:</p>
          <div className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.explanation }} />
        </div>
      ))}
      <div className="flex items-center gap-3 pt-2 border-t border-line">
        <span className="text-sm font-bold text-gray-700">Marks for question {k.n}</span>
        <button type="button" className="btn-secondary px-2.5 py-1.5" onClick={() => onChange(Math.max(0, m - 1))} disabled={disabled || m <= 0} aria-label="One mark fewer">
          <Minus className="w-4 h-4" aria-hidden />
        </button>
        <span className="text-lg font-bold w-16 text-center" aria-live="polite">
          {m} / {k.marks}
        </span>
        <button type="button" className="btn-secondary px-2.5 py-1.5" onClick={() => onChange(Math.min(k.marks, m + 1))} disabled={disabled || m >= k.marks} aria-label="One mark more">
          <Plus className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="max-w-2xl mx-auto px-4 py-16 flex-1 w-full">{children}</main>
}
