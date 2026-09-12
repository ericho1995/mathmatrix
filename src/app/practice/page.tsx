'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { YearLevel, TopicSlug, SubjectSlug } from '@/types'
import { TOPIC_COVERAGE, topicTotal, topicCountAt } from '@/lib/questions/coverage'
import { SUBJECTS, SELECTIVE_SUBJECTS, GRADES, TOPICS } from '@/lib/curriculum'
import QuizRunner, { type QuizQuestion } from '@/components/practice/QuizRunner'
import PracticeModeTabs from '@/components/practice/PracticeModeTabs'
import PremiumExamLock from '@/components/practice/PremiumExamLock'

type Screen = 'select' | 'quiz' | 'exam-lock'
type Mode = 'general' | 'selective'

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20]

export default function PracticePage() {
  return (
    <Suspense fallback={null}>
      <PracticePageInner />
    </Suspense>
  )
}

function PracticePageInner() {
  const searchParams = useSearchParams()

  const [mode, setMode] = useState<Mode>('general')
  const [subject, setSubject] = useState<SubjectSlug | null>(null)
  const [grade, setGrade] = useState<YearLevel | null>(null)
  const [topics, setTopics] = useState<Set<TopicSlug>>(new Set())
  const [questionCount, setQuestionCount] = useState(10)
  const [screen, setScreen] = useState<Screen>('select')
  const [quizKey, setQuizKey] = useState(0)

  // Preselect a subject when arriving from a link like /practice?subject=math
  useEffect(() => {
    const s = searchParams.get('subject') as SubjectSlug | null
    if (!s) return
    if (SELECTIVE_SUBJECTS.some(sub => sub.slug === s)) {
      setMode('selective')
      setSubject(s)
    } else if (SUBJECTS.some(sub => sub.slug === s)) {
      setMode('general')
      setSubject(s)
    }
  }, [searchParams])

  function selectMode(m: Mode) {
    setMode(m)
    setSubject(null)
    setGrade(null)
    setTopics(new Set())
  }

  function chooseSubject(s: SubjectSlug) {
    setSubject(s)
    setTopics(new Set())
    setGrade(prevGrade => (prevGrade && gradeHasContent(s, prevGrade) ? prevGrade : null))
  }

  function toggleTopic(t: TopicSlug) {
    setTopics(prev => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })
  }

  const activeSubjects = mode === 'general' ? SUBJECTS : SELECTIVE_SUBJECTS
  const requiresGrade = mode === 'general'
  const readyToBuild = subject && topics.size > 0 && (!requiresGrade || grade)

  // Availability is answered from the generated coverage map (a few KB of
  // counts) rather than the question bank, so no question content reaches the
  // browser. The questions themselves come from /api/practice/quiz when a quiz
  // actually starts.
  function gradeHasContent(s: SubjectSlug, g: YearLevel) {
    return TOPICS.filter(t => t.subject === s).some(t => topicCountAt(t.slug, g) > 0)
  }

  function topicHasContent(t: TopicSlug) {
    if (mode === 'selective') return topicTotal(t) > 0
    if (!grade) return true
    return topicCountAt(t, grade) > 0
  }

  // Drop any selected topic that turns out to have no content once a grade is chosen.
  useEffect(() => {
    if (mode !== 'general' || !grade) return
    setTopics(prev => {
      const filtered = new Set(Array.from(prev).filter(t => topicCountAt(t, grade) > 0))
      return filtered.size === prev.size ? prev : filtered
    })
  }, [grade, mode])

  const poolSize = Array.from(topics).reduce(
    (sum, t) => sum + (mode === 'selective' ? topicTotal(t) : grade ? topicCountAt(t, grade) : 0),
    0
  )

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [building, setBuilding] = useState(false)
  const [buildError, setBuildError] = useState<string | null>(null)

  async function buildQuiz() {
    if (!readyToBuild) return
    setBuilding(true)
    setBuildError(null)
    try {
      const res = await fetch('/api/practice/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: Array.from(topics),
          yearLevel: mode === 'selective' ? null : grade,
          count: questionCount,
        }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      const data = (await res.json()) as { questions: QuizQuestion[] }
      if (!data.questions?.length) throw new Error('No questions came back for that combination.')
      setQuizQuestions(data.questions)
      setQuizKey(k => k + 1)
      setScreen('quiz')
    } catch (err) {
      // Surfaced rather than swallowed — a silent failure here looks identical
      // to a quiz that simply never starts.
      setBuildError(err instanceof Error ? err.message : 'Could not build the quiz.')
    } finally {
      setBuilding(false)
    }
  }

  if (screen === 'exam-lock') {
    const subjectLabel = [...SUBJECTS, ...SELECTIVE_SUBJECTS].find(s => s.slug === subject)?.label ?? 'exam'
    return (
      <PremiumExamLock title="Personalised exam paper" subjectLabel={subjectLabel} onBack={() => setScreen('select')} />
    )
  }

  if (screen === 'quiz' && quizQuestions.length > 0) {
    const primaryTopic = Array.from(topics)[0]
    const primaryYearLevel = mode === 'selective' ? 'year_11' : grade
    if (primaryTopic && primaryYearLevel) {
      return (
        <QuizRunner
          key={quizKey}
          questions={quizQuestions}
          primaryTopic={primaryTopic}
          primaryYearLevel={primaryYearLevel}
          onExit={() => setScreen('select')}
          onRetry={buildQuiz}
        />
      )
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 flex-1 w-full">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Practice</h1>
      <p className="text-gray-500 mb-6">
        Choose a subject and one or more topics to create a personalised set of questions.
      </p>

      <PracticeModeTabs />

      <div className="inline-flex rounded-xl border border-gray-100 p-1 mb-8">
        <button onClick={() => selectMode('general')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'general' ? 'bg-brand-600 text-white' : 'text-gray-500'}`}>
          General practice
        </button>
        <button onClick={() => selectMode('selective')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'selective' ? 'bg-brand-600 text-white' : 'text-gray-500'}`}>
          Selective subjects (Yr 11-12)
        </button>
      </div>

      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Subject</p>
      <div className={`grid gap-3 mb-8 ${mode === 'general' ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {activeSubjects
          .filter(s => TOPICS.filter(t => t.subject === s.slug).some(t => topicTotal(t.slug) > 0))
          .map(s => (
            <button key={s.slug} onClick={() => chooseSubject(s.slug)}
              className={`p-4 rounded-2xl border text-center transition-all
                ${subject === s.slug ? 'border-2' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
              style={subject === s.slug ? { borderColor: s.color, backgroundColor: `${s.color}14` } : undefined}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-medium text-sm">{s.label}</div>
            </button>
          ))}
      </div>

      {requiresGrade && (
        <>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Year level</p>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {GRADES
              .filter(g => !subject || gradeHasContent(subject, g.value))
              .map(g => (
                <button key={g.value} onClick={() => setGrade(g.value)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all
                    ${grade === g.value
                      ? 'border-brand-600 bg-brand-50 text-brand-600 border-2'
                      : 'border-gray-100 text-gray-700 hover:border-brand-400 hover:bg-brand-50'}`}>
                  {g.label}
                </button>
              ))}
          </div>
        </>
      )}

      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">
        Topics <span className="normal-case text-gray-400">(pick one or more)</span>
      </p>
      {!subject ? (
        <p className="text-sm text-gray-400 mb-8">Pick a subject above to see its topics.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {TOPICS.filter(t => t.subject === subject && topicHasContent(t.slug)).map(t => (
            <button key={t.slug} onClick={() => toggleTopic(t.slug)}
              className={`p-4 rounded-2xl border text-left transition-all
                ${topics.has(t.slug)
                  ? 'border-teal-400 bg-teal-50 border-2'
                  : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
              <div className="font-medium text-sm">{t.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{t.description}</div>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Number of questions</p>
      <div className="grid grid-cols-4 gap-2 mb-8">
        {QUESTION_COUNT_OPTIONS.map(n => (
          <button key={n} onClick={() => setQuestionCount(n)}
            className={`py-3 rounded-xl border text-sm font-medium transition-all
              ${questionCount === n
                ? 'border-brand-600 bg-brand-50 text-brand-600 border-2'
                : 'border-gray-100 text-gray-700 hover:border-brand-400 hover:bg-brand-50'}`}>
            {n}
          </button>
        ))}
      </div>

      {topics.size > 0 && poolSize === 0 && (
        <p className="text-sm text-amber-600 mb-3">
          No questions yet for this combination. Try a different year level or topic.
        </p>
      )}
      {buildError && <p className="text-sm text-red-600 mb-3">{buildError}</p>}
      {poolSize > 0 && !buildError && <div className="mb-3" />}
      <button onClick={buildQuiz} disabled={!readyToBuild || poolSize === 0 || building} className="btn-primary w-full">
        {building ? 'Building…' : 'Start practice'}
      </button>
      <button onClick={() => setScreen('exam-lock')} disabled={!readyToBuild || poolSize === 0 || building} className="btn-secondary w-full mt-2">
        Generate exam paper (PDF)
      </button>
    </main>
  )
}
