'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { useSearchParams } from 'next/navigation'
import type { SubjectSlug, TopicSlug, YearLevel } from '@/types'
import { topicCountAt } from '@/lib/questions/coverage'
import { isVceYear } from '@/lib/pricing'
import {
  ALL_SUBJECTS,
  PRACTICE_YEARS,
  YEAR_GROUPS,
  practiceRange,
  subjectsAt,
  topicBlurb,
  topicsAt,
  yearLabel,
} from '@/lib/practice'
import QuizRunner, { type QuizQuestion } from '@/components/practice/QuizRunner'
import SubjectIcon from '@/components/ui/SubjectIcon'

const LENGTHS = [
  { count: 5, label: 'Quick' },
  { count: 10, label: 'Standard' },
  { count: 20, label: 'Longer' },
]

/**
 * The free on-screen quiz: year level → subject → topics → length.
 *
 * It is step four of the loop the homepage sells (download, sit, mark, practice
 * the gaps), and the free taste of the question bank for someone not ready to
 * print a paper. So it says what it is for, sends people on to the papers, and
 * takes the weak topics a marked paper hands it.
 *
 * The old page stacked two mode toggles ("Build your own / Ready-made exam",
 * "General practice / Selective subjects") above a form. The first duplicated
 * the nav; the second used "selective", which in Australia means the entry test
 * for selective schools, for VCE. Year level now decides the subjects on its own.
 */
export default function PracticeBuilder({ signedIn }: { signedIn: boolean }) {
  const searchParams = useSearchParams()

  const [year, setYear] = useState<YearLevel | null>(null)
  const [subject, setSubject] = useState<SubjectSlug | null>(null)
  const [topics, setTopics] = useState<Set<TopicSlug>>(new Set())
  const [count, setCount] = useState(10)
  const [fromPaper, setFromPaper] = useState(false)

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [inQuiz, setInQuiz] = useState(false)
  const [quizKey, setQuizKey] = useState(0)
  const [building, setBuilding] = useState(false)
  const [buildError, setBuildError] = useState<string | null>(null)

  // Preselect from the query string, so a link can land someone on exactly the
  // practice they need: /practice?subject=math&grade=grade_5&topics=a,b
  //
  // This is what makes marking a paper a loop rather than a report — the
  // diagnosis hands the weak topics straight to the builder instead of asking
  // the reader to remember them and pick them out of a list again.
  //
  // Every value is validated against what the quiz can serve; a stale or
  // hand-edited link should leave the page usable rather than half-selected.
  useEffect(() => {
    const s = searchParams.get('subject')
    const g = searchParams.get('grade')
    const linkedSubject = ALL_SUBJECTS.find(x => x.slug === s)?.slug ?? null
    let linkedYear = PRACTICE_YEARS.find(y => y === g) ?? null
    // An older link can name a subject with no year: open the first year that has it.
    if (linkedSubject && !linkedYear) {
      linkedYear = PRACTICE_YEARS.find(y => topicsAt(linkedSubject, y).length > 0) ?? null
    }
    if (!linkedYear) return

    setYear(linkedYear)
    if (!linkedSubject || topicsAt(linkedSubject, linkedYear).length === 0) return
    setSubject(linkedSubject)

    const available = new Set<string>(topicsAt(linkedSubject, linkedYear).map(t => t.slug))
    const linkedTopics = (searchParams.get('topics') ?? '')
      .split(',')
      .filter(t => available.has(t)) as TopicSlug[]
    if (linkedTopics.length) setTopics(new Set(linkedTopics))
    setFromPaper(searchParams.get('from') === 'paper' && linkedTopics.length > 0)
  }, [searchParams])

  function chooseYear(y: YearLevel) {
    setYear(y)
    setFromPaper(false)
    // Keep the subject, and whichever chosen topics exist at the new level.
    if (subject && topicsAt(subject, y).length > 0) {
      const available = new Set<TopicSlug>(topicsAt(subject, y).map(t => t.slug))
      setTopics(prev => new Set(Array.from(prev).filter(t => available.has(t))))
    } else {
      setSubject(null)
      setTopics(new Set())
    }
  }

  function chooseSubject(s: SubjectSlug) {
    if (!year) return
    setSubject(s)
    setFromPaper(false)
    // A subject with one topic at this level leaves nothing to choose.
    const available = topicsAt(s, year)
    setTopics(new Set(available.length === 1 ? [available[0].slug] : []))
  }

  function toggleTopic(t: TopicSlug) {
    setTopics(prev => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })
  }

  const subjects = year ? subjectsAt(year) : []
  const topicOptions = year && subject ? topicsAt(subject, year) : []
  const allSelected = topicOptions.length > 0 && topicOptions.every(t => topics.has(t.slug))
  const subjectInfo = ALL_SUBJECTS.find(s => s.slug === subject)
  const pool = year ? Array.from(topics).reduce((n, t) => n + topicCountAt(t, year), 0) : 0
  const ready = Boolean(year && subject && topics.size > 0 && pool > 0)
  const papersHref = (year ? `/practice/exams?year=${year}` : '/practice/exams') as Route

  function toggleAll() {
    setTopics(allSelected ? new Set() : new Set(topicOptions.map(t => t.slug)))
  }

  // Availability comes from the coverage counts; the questions themselves come
  // from /api/practice/quiz only when a quiz starts, so no answers ship early.
  async function buildQuiz() {
    if (!ready || !year) return
    setBuilding(true)
    setBuildError(null)
    try {
      const res = await fetch('/api/practice/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics: Array.from(topics), yearLevel: year, count }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      const data = (await res.json()) as { questions: QuizQuestion[] }
      if (!data.questions?.length) throw new Error('No questions came back for that combination.')
      setQuestions(data.questions)
      setQuizKey(k => k + 1)
      setInQuiz(true)
      window.scrollTo({ top: 0 })
    } catch (err) {
      // Surfaced rather than swallowed — a silent failure here looks identical
      // to a quiz that simply never starts.
      setBuildError(err instanceof Error ? err.message : 'Could not build the quiz.')
    } finally {
      setBuilding(false)
    }
  }

  if (inQuiz && questions.length > 0 && year && topics.size > 0) {
    return (
      <QuizRunner
        key={quizKey}
        questions={questions}
        primaryTopic={Array.from(topics)[0]}
        primaryYearLevel={year}
        onExit={() => setInQuiz(false)}
        onRetry={buildQuiz}
        exitLabel="Change topics"
        nextStep={
          <div className="card mt-8 text-left">
            <p className="font-medium mb-1">Try a full {yearLabel(year)} paper</p>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Printable and timed, with a separate answer key. Marking it shows which topics to practice next.
            </p>
            <Link href={papersHref} className="btn-secondary w-full block text-center text-sm">
              See {yearLabel(year)} papers
            </Link>
          </div>
        }
      />
    )
  }

  const summary = ready && year && subjectInfo
    ? [
        yearLabel(year),
        subjectInfo.label,
        topics.size === 1 ? topicOptions.find(t => topics.has(t.slug))?.label : `${topics.size} topics`,
      ].join(' · ')
    : !year
      ? 'Choose a year level to begin.'
      : !subject
        ? 'Now choose a subject.'
        : 'Pick at least one topic.'

  return (
    <main className="flex-1 w-full">
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">
          Free practice · no account needed
        </p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight leading-tight mb-3 max-w-3xl text-balance">
          Short quizzes on the topics that <span className="text-brand-400">need work.</span>
        </h1>
        <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-2xl mb-5">
          Choose a year level and the topics to focus on. Every question is marked as you go, with a worked
          explanation, so each mistake becomes something learned.
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
          <li>✓ Marked instantly</li>
          <li>✓ An explanation for every answer</li>
          <li>✓ {practiceRange()}</li>
        </ul>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] gap-6 lg:gap-8 items-start">
        <div className="flex flex-col gap-4 min-w-0">
          {fromPaper && (
            <div className="rounded-2xl border border-teal-400/40 bg-teal-50 px-5 py-4 text-sm text-gray-700">
              <span className="font-medium text-teal-600">Picked from your marked paper.</span> These are the
              topics that cost the most marks. Change anything you like, then start.
            </div>
          )}

          <Step n={1} title="Year level" active>
            <div className="flex flex-col gap-4">
              {YEAR_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">{group.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.years.map(y => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => chooseYear(y)}
                        aria-pressed={year === y}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                          year === y
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'border-gray-200 text-gray-700 hover:border-brand-400 hover:bg-brand-50'
                        }`}
                      >
                        {yearLabel(y)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Step>

          <Step
            n={2}
            title="Subject"
            note={year && isVceYear(year) ? (year === 'year_12' ? 'Units 3 & 4' : 'Units 1 & 2') : undefined}
            active={Boolean(year)}
            waiting="Choose a year level first."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjects.map(s => {
                const on = subject === s.slug
                return (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => chooseSubject(s.slug)}
                    aria-pressed={on}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
                      on ? 'border-brand-600 ring-1 ring-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <SubjectIcon subject={s.slug} />
                    <span className="min-w-0">
                      <span className="block font-medium text-sm">{s.label}</span>
                      <span className="block text-xs text-gray-500">{s.tagline}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </Step>

          <Step
            n={3}
            title="Topics"
            note="Pick one or more"
            active={Boolean(subject)}
            waiting={year ? 'Choose a subject first.' : 'Choose a year level and subject first.'}
            action={
              topicOptions.length > 1 ? (
                <button type="button" onClick={toggleAll} className="text-sm text-brand-600 hover:underline">
                  {allSelected ? 'Clear all' : 'Select all'}
                </button>
              ) : undefined
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topicOptions.map(t => {
                const on = topics.has(t.slug)
                return (
                  <button
                    key={t.slug}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggleTopic(t.slug)}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-colors ${
                      on ? 'border-teal-400 ring-1 ring-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                        on ? 'bg-teal-400 border-teal-400 text-white' : 'border-gray-300 bg-white'
                      }`}
                    >
                      {on && (
                        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-sm">{t.label}</span>
                      <span className="block text-xs text-gray-500 mt-0.5">{topicBlurb(t)}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </Step>

          <Step n={4} title="Length" active>
            <div className="grid grid-cols-3 gap-2">
              {LENGTHS.map(l => (
                <button
                  key={l.count}
                  type="button"
                  onClick={() => setCount(l.count)}
                  aria-pressed={count === l.count}
                  className={`py-3 rounded-xl border text-center transition-colors ${
                    count === l.count
                      ? 'border-brand-600 ring-1 ring-brand-600 bg-brand-50 text-brand-600'
                      : 'border-gray-200 text-gray-700 hover:border-brand-400 hover:bg-brand-50'
                  }`}
                >
                  <span className="block text-sm font-medium">{l.label}</span>
                  <span className="block text-xs text-gray-500">{l.count} questions</span>
                </button>
              ))}
            </div>
            {ready && pool < count && (
              <p className="text-xs text-gray-500 mt-3">
                There are fewer questions than that for this choice, so the quiz will be a little shorter.
              </p>
            )}
          </Step>

          {/* Stays in view while a long topic list is scrolled, so the next step is never off-screen. */}
          <div className="sticky bottom-3 z-10">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-3 sm:p-4 flex items-center gap-3">
              <p className={`text-sm flex-1 min-w-0 truncate pl-1 ${ready ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                {summary}
              </p>
              <button type="button" onClick={buildQuiz} disabled={!ready || building} className="btn-primary flex-shrink-0">
                {building ? (
                  'Building…'
                ) : (
                  <>
                    <span className="sm:hidden">Start quiz</span>
                    <span className="hidden sm:inline">Start {count}-question quiz</span>
                  </>
                )}
              </button>
            </div>
            {buildError && <p className="text-sm text-red-600 mt-2">{buildError}</p>}
          </div>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="card">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">Printable papers</p>
            <h2 className="font-medium mb-2">Ready for a full paper?</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              A quiz works on the gaps. A full practice paper finds them: sit it timed, mark it with the answer
              key, and it shows which topics to practice here next.
            </p>
            <Link href={papersHref} className="btn-secondary w-full block text-center text-sm">
              {year ? `See ${yearLabel(year)} papers` : 'Browse the papers'}
            </Link>
            <p className="text-xs text-gray-400 mt-2 text-center">The first paper in every subject is free.</p>
          </div>

          {!signedIn && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <h2 className="font-medium text-sm mb-1">Keep a record of progress</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">
                Quizzes work without an account. On a student account, each one adds to topic accuracy on the
                parent dashboard.
              </p>
              <Link
                href={'/auth/login?next=/practice' as Route}
                className="text-sm font-medium text-brand-600 hover:underline"
              >
                Sign in or create an account →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}

function Step({
  n,
  title,
  note,
  active,
  waiting,
  action,
  children,
}: {
  n: number
  title: string
  note?: string
  active: boolean
  waiting?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="card" aria-disabled={!active || undefined}>
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`w-7 h-7 rounded-full text-sm font-medium flex items-center justify-center flex-shrink-0 ${
            active ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'
          }`}
        >
          {n}
        </span>
        <h2 className={`font-medium ${active ? '' : 'text-gray-400'}`}>{title}</h2>
        {note && active && <span className="text-sm text-gray-400">{note}</span>}
        {action && <span className="ml-auto">{action}</span>}
      </div>
      {active ? children : <p className="text-sm text-gray-400 sm:pl-10">{waiting}</p>}
    </section>
  )
}
