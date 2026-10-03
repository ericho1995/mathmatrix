'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import { ArrowRight, BookOpen, Check, Download, Eye, FileText, Sparkles, Unlock, X } from 'lucide-react'
import Bird from '@/components/brand/Bird'
import QuestionView from '@/components/diagnostic/QuestionView'
import ReadingTextView from '@/components/reading/ReadingTextView'
import PdfPages from './PdfPages'
import { matchShortAnswer } from '@/lib/questions/matchShortAnswer'
import type { Answer } from '@/lib/diagnostic/types'
import type { SamplePreview, Tone, TryQuestion } from '@/lib/samplePreview'

// Full class strings per tone, so Tailwind sees them.
// `band` is the bright decorative strip on a tile; `head` the deeper shade
// behind the dialog's white title text, which needs AA contrast.
const TONE: Record<Tone, { tile: string; band: string; head: string }> = {
  brand: { tile: 'bg-brand-50 border-brand-200', band: 'bg-brand-500', head: 'bg-brand-600' },
  teal: { tile: 'bg-teal-50 border-teal-200', band: 'bg-teal-400', head: 'bg-teal-600' },
  amber: { tile: 'bg-amber-50 border-amber-200', band: 'bg-amber-400', head: 'bg-amber-600' },
  grape: { tile: 'bg-grape-50 border-grape-200', band: 'bg-grape-400', head: 'bg-grape-600' },
}

/**
 * "Look inside" as something to try: each sample paper is a bright tile, and
 * opening it gives a mini sample test — three real questions from that paper,
 * marked on the spot with the explanation — beside the whole printed paper,
 * every page of it, with the way to sit it on screen or download it.
 */
export default function LookInsideGallery({ previews }: { previews: SamplePreview[] }) {
  const [open, setOpen] = useState<{ index: number; tab: 'try' | 'page' } | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  const grid =
    previews.length <= 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : previews.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  const current = open ? previews[open.index] : null

  return (
    <>
      <ul className={`grid ${grid} gap-5`}>
        {previews.map((p, i) => {
          const t = TONE[p.tone]
          const tryable = p.questions.length > 0 || Boolean(p.written)
          return (
            <li key={p.key} className={`rounded-3xl border-2 border-b-[6px] overflow-hidden flex flex-col transition-transform hover:-translate-y-1 ${t.tile}`}>
              <button
                type="button"
                onClick={() => setOpen({ index: i, tab: tryable ? 'try' : 'page' })}
                className="relative h-44 overflow-hidden px-6 pt-6 group"
                aria-label={`Preview ${p.title}`}
              >
                <span className={`absolute inset-x-0 top-0 h-20 ${t.band}`} aria-hidden />
                <span className="relative block rounded-lg bg-white ring-1 ring-black/5 overflow-hidden -rotate-2 transition-transform group-hover:rotate-0 group-hover:scale-[1.03]">
                  <Image src={p.image} alt={p.alt} sizes="(min-width: 1024px) 240px, 80vw" placeholder="blur" className="w-full h-auto" />
                </span>
              </button>
              <div className="p-5 pt-4 flex flex-col flex-1">
                <p className="font-bold text-lg text-ink">{p.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed mt-1 flex-1">{p.caption}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {tryable && (
                    <button type="button" onClick={() => setOpen({ index: i, tab: 'try' })} className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" aria-hidden />
                      {p.written ? 'Try a question' : `Try ${p.questions.length} questions`}
                    </button>
                  )}
                  <button type="button" onClick={() => setOpen({ index: i, tab: 'page' })} className="btn-secondary text-sm px-4 py-1.5 inline-flex items-center gap-1.5">
                    <Eye className="w-4 h-4" aria-hidden />
                    Flip through the paper
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        // A click on the backdrop lands on the dialog element itself.
        onClick={e => e.target === dialog.current && setOpen(null)}
        className={`m-auto w-full ${current?.text && open?.tab === 'try' ? 'max-w-5xl' : open?.tab === 'page' ? 'max-w-3xl' : 'max-w-2xl'} bg-transparent p-3 sm:p-4 backdrop:bg-gray-950/70`}
        aria-label={current?.title}
      >
        {current && open && (
          <div className="rounded-3xl bg-white overflow-hidden border-b-[6px] border-line">
            <div className={`relative px-5 py-4 ${TONE[current.tone].head}`}>
              <div className="flex items-center gap-3 pr-10">
                <span className="inline-flex w-14 h-14 rounded-2xl bg-white items-center justify-center shrink-0">
                  <Bird pose={open.tab === 'try' ? 'think' : 'read'} className="w-12 h-12" />
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-lg text-white leading-tight">{current.title}</p>
                  <p className="text-sm font-semibold text-white truncate">From {current.paperTitle}</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(null)} className="absolute top-3 right-3 rounded-full p-2 text-white hover:bg-white/20" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(current.questions.length > 0 || current.written) && (
              <div className="flex gap-2 px-5 pt-4" role="tablist">
                <Tab active={open.tab === 'try'} onClick={() => setOpen({ ...open, tab: 'try' })} icon={Sparkles}>
                  Try it
                </Tab>
                <Tab active={open.tab === 'page'} onClick={() => setOpen({ ...open, tab: 'page' })} icon={FileText}>
                  Flip through
                </Tab>
              </div>
            )}

            <div className="p-5 max-h-[72vh] overflow-y-auto">
              {open.tab === 'page' ? (
                <PageView preview={current} />
              ) : current.written ? (
                <WrittenTry preview={current} />
              ) : (
                <QuizTry key={current.key} preview={current} />
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}

function Tab({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: typeof Eye; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl border-2 border-b-4 px-4 py-1.5 text-sm font-bold transition-colors ${
        active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line bg-white text-gray-500 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-4 h-4" aria-hidden />
      {children}
    </button>
  )
}

/**
 * Flip through the paper, every page, with a switch between its booklets
 * (magazine, paper, answer key). Without a plan the first half is open and the
 * rest locked and blurred (PdfPages).
 */
function PageView({ preview }: { preview: SamplePreview }) {
  const [doc, setDoc] = useState(preview.doc)
  const current = preview.docs[doc] ?? preview.docs[0]
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Booklets">
        {preview.docs.map((d, i) => (
          <button
            key={d.url}
            type="button"
            role="tab"
            aria-selected={i === doc}
            onClick={() => setDoc(i)}
            className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${i === doc ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-gray-100 p-3 sm:p-4">
        <PdfPages key={current.url} url={current.url} title={`${preview.paperTitle} — ${current.label}`} unlock={preview.unlock} />
      </div>
      <DownloadRow preview={preview} />
    </div>
  )
}

function DownloadRow({ preview }: { preview: SamplePreview }) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-5">
      <Link href={preview.unlock.href as Route} className="btn-primary inline-flex items-center justify-center gap-2">
        <Unlock className="w-4 h-4" aria-hidden />
        {preview.unlock.label === 'See the plans' ? 'Unlock the whole paper' : preview.unlock.label}
      </Link>
      <Link href={`/practice/exams/${preview.paperId}` as Route} className="btn-secondary inline-flex items-center justify-center gap-2">
        <Download className="w-4 h-4" aria-hidden />
        Download the first half free
      </Link>
      <Link href={'/diagnostic' as Route} className="btn-secondary inline-flex items-center justify-center gap-2">
        Find your child&apos;s weak spots
        <ArrowRight className="w-4 h-4" aria-hidden />
      </Link>
    </div>
  )
}

const isRight = (q: TryQuestion, a: Answer) =>
  q.kind === 'text'
    ? typeof a === 'string' && a.trim() !== '' && matchShortAnswer(a, { expected_answer: q.accepted[0] ?? '', accepted_answers: q.accepted.slice(1) })
    : a === q.correct

/** Three questions, one at a time: answer, check, see why, next. */
function QuizTry({ preview }: { preview: SamplePreview }) {
  const qs = preview.questions
  const [i, setI] = useState(0)
  const [answer, setAnswer] = useState<Answer>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [showText, setShowText] = useState(false)
  const done = i >= qs.length

  if (done) {
    return (
      <div className="text-center py-4">
        <Bird pose={score === qs.length ? 'trophy' : 'cheer'} className="w-32 h-32 mx-auto" />
        <p className="text-3xl font-bold text-ink mt-2">
          {score} of {qs.length} right!
        </p>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          That was {qs.length} of the {preview.paperQuestions} questions in {preview.paperTitle}. The first half is free to flip
          through; the whole paper, with every answer explained, comes with a plan.
        </p>
        <div className="flex justify-center">
          <DownloadRow preview={preview} />
        </div>
        <button
          type="button"
          onClick={() => {
            setI(0)
            setScore(0)
            setAnswer(null)
            setChecked(false)
          }}
          className="text-sm font-bold text-gray-500 hover:text-brand-600 mt-5"
        >
          Try again
        </button>
      </div>
    )
  }

  const q = qs[i]
  const right = checked && isRight(q, answer)
  const answered = answer !== null && !(typeof answer === 'string' && answer.trim() === '')

  const quiz = (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-sm font-bold text-gray-500 whitespace-nowrap">
          Question {i + 1} of {qs.length}
        </span>
        <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-teal-400 transition-all duration-300" style={{ width: `${((i + (checked ? 1 : 0)) / qs.length) * 100}%` }} />
        </div>
      </div>
      <fieldset disabled={checked} className="contents">
        <QuestionView question={q.question} answer={answer} onAnswer={setAnswer} />
      </fieldset>

      {checked && (
        <div className={`mt-5 rounded-2xl border-2 p-4 ${right ? 'border-teal-200 bg-teal-50' : 'border-amber-200 bg-amber-50'}`} role="status">
          <p className={`font-bold text-lg flex items-center gap-2 ${right ? 'text-teal-600' : 'text-amber-600'}`}>
            {right ? <Check className="w-5 h-5" strokeWidth={3} aria-hidden /> : null}
            {right ? 'Correct!' : 'Not quite.'}
          </p>
          {!right && (
            <p className="text-ink mt-1">
              The answer is <span className="font-bold" dangerouslySetInnerHTML={{ __html: q.answerHtml }} />.
            </p>
          )}
          <p className="text-gray-700 mt-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: q.explanationHtml }} />
        </div>
      )}

      <div className="flex justify-end mt-5">
        {checked ? (
          <button
            type="button"
            className="btn-primary px-8"
            onClick={() => {
              setI(i + 1)
              setAnswer(null)
              setChecked(false)
            }}
          >
            {i + 1 >= qs.length ? 'See my score' : 'Next question'}
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary px-8 disabled:opacity-40"
            disabled={!answered}
            onClick={() => {
              setChecked(true)
              if (isRight(q, answer)) setScore(s => s + 1)
            }}
          >
            Check
          </button>
        )}
      </div>
    </div>
  )

  if (!preview.text) return quiz
  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-8">
      <div className="lg:hidden mb-4">
        <button type="button" onClick={() => setShowText(s => !s)} className="btn-secondary text-sm inline-flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" aria-hidden />
          {showText ? 'Hide the text' : 'Read the text'}
        </button>
      </div>
      <div className={`${showText ? 'block' : 'hidden'} lg:block rounded-2xl border-2 border-line p-4 mb-5 lg:mb-0 lg:max-h-[60vh] lg:overflow-y-auto`}>
        <ReadingTextView text={preview.text} />
      </div>
      {quiz}
    </div>
  )
}

/** A VCE written question: work it out, then reveal the solution and where the marks go. */
function WrittenTry({ preview }: { preview: SamplePreview }) {
  const w = preview.written!
  const [shown, setShown] = useState<Set<string>>(new Set())
  const toggle = (label: string) =>
    setShown(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  return (
    <div>
      <p className="text-sm font-bold text-gray-500 mb-2">
        Written question · {w.marks} marks · no calculator
      </p>
      <div className="text-lg font-semibold text-ink leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: w.stemHtml }} />
      {w.diagramHtml && <div className="rounded-2xl border-2 border-line bg-white p-3 mb-4 flex justify-center" dangerouslySetInnerHTML={{ __html: w.diagramHtml }} />}
      <ol className="space-y-4">
        {w.parts.map(p => (
          <li key={p.label} className="rounded-2xl border-2 border-line p-4">
            <div className="flex items-start gap-3">
              <span className="font-bold text-ink">{p.label}.</span>
              <div className="flex-1 text-ink leading-relaxed" dangerouslySetInnerHTML={{ __html: p.promptHtml }} />
              <span className="text-sm font-bold text-gray-500 whitespace-nowrap">
                {p.marks} {p.marks === 1 ? 'mark' : 'marks'}
              </span>
            </div>
            {shown.has(p.label) ? (
              <div className="mt-3 rounded-xl bg-teal-50 border-2 border-teal-200 p-3">
                <p className="text-sm font-bold text-teal-600 mb-1">Worked solution</p>
                <div className="text-ink leading-relaxed" dangerouslySetInnerHTML={{ __html: p.answerHtml }} />
                <p className="text-sm font-bold text-teal-600 mt-3 mb-1">Where the marks go</p>
                <div className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: p.guideHtml }} />
              </div>
            ) : (
              <button type="button" onClick={() => toggle(p.label)} className="btn-secondary text-sm mt-3">
                Show the worked solution
              </button>
            )}
          </li>
        ))}
      </ol>
      <DownloadRow preview={preview} />
    </div>
  )
}
