'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { YearLevel, TopicSlug, SubjectSlug } from '@/types'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { SUBJECTS, SELECTIVE_SUBJECTS, GRADES, TOPICS } from '@/lib/curriculum'
import QuizRunner from '@/components/practice/QuizRunner'
import PracticeModeTabs from '@/components/practice/PracticeModeTabs'

type Screen = 'select' | 'quiz'
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

  function gradeHasContent(s: SubjectSlug, g: YearLevel) {
    const subjectTopics = TOPICS.filter(t => t.subject === s).map(t => t.slug)
    return QUESTION_BANK.some(q => subjectTopics.includes(q.topic) && q.year_level === g)
  }

  function topicHasContent(t: TopicSlug) {
    if (mode === 'selective') return QUESTION_BANK.some(q => q.topic === t)
    if (!grade) return true
    return QUESTION_BANK.some(q => q.topic === t && q.year_level === grade)
  }

  // Drop any selected topic that turns out to have no content once a grade is chosen.
  useEffect(() => {
    if (mode !== 'general' || !grade) return
    setTopics(prev => {
      const filtered = new Set(Array.from(prev).filter(t => QUESTION_BANK.some(q => q.topic === t && q.year_level === grade)))
      return filtered.size === prev.size ? prev : filtered
    })
  }, [grade, mode])

  const unavailableGradeCount = subject && mode === 'general'
    ? GRADES.filter(g => !gradeHasContent(subject, g.value)).length
    : 0

  const pool = QUESTION_BANK.filter(
    q => topics.has(q.topic) && (mode === 'selective' || q.year_level === grade)
  )

  const [quizQuestions, setQuizQuestions] = useState<typeof pool>([])

  function buildQuiz() {
    if (!readyToBuild) return
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(questionCount, pool.length))
    setQuizQuestions(shuffled)
    setQuizKey(k => k + 1)
    setScreen('quiz')
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
        {activeSubjects.map(s => {
          const available = QUESTION_BANK.some(q => TOPICS.find(t => t.slug === q.topic)?.subject === s.slug)
          return (
            <button key={s.slug} onClick={() => available && chooseSubject(s.slug)}
              disabled={!available}
              title={available ? undefined : 'No questions yet for this subject'}
              className={`p-4 rounded-2xl border text-center transition-all
                ${!available
                  ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                  : subject === s.slug
                    ? 'border-2'
                    : 'border-gray-100 hover:border-gray-200 bg-white'}`}
              style={available && subject === s.slug ? { borderColor: s.color, backgroundColor: `${s.color}14` } : undefined}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-medium text-sm">{s.label}</div>
              {!available && <div className="text-xs text-gray-400 mt-0.5">Coming soon</div>}
            </button>
          )
        })}
      </div>

      {requiresGrade && (
        <>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Year level</p>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {GRADES.map(g => {
              const available = !subject || gradeHasContent(subject, g.value)
              return (
                <button key={g.value} onClick={() => available && setGrade(g.value)}
                  disabled={!available}
                  title={available ? undefined : 'No questions yet for this year level'}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all
                    ${!available
                      ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed'
                      : grade === g.value
                        ? 'border-brand-600 bg-brand-50 text-brand-600 border-2'
                        : 'border-gray-100 text-gray-700 hover:border-brand-400 hover:bg-brand-50'}`}>
                  {g.label}
                </button>
              )
            })}
          </div>
          {unavailableGradeCount > 0 && (
            <p className="text-xs text-gray-400 mb-6">
              Greyed-out years aren&apos;t available for general practice yet. Year 11-12 content lives under Selective subjects above.
            </p>
          )}
          {unavailableGradeCount === 0 && <div className="mb-6" />}
        </>
      )}

      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">
        Topics <span className="normal-case text-gray-400">(pick one or more)</span>
      </p>
      {!subject ? (
        <p className="text-sm text-gray-400 mb-8">Pick a subject above to see its topics.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {TOPICS.filter(t => t.subject === subject).map(t => {
            const available = topicHasContent(t.slug)
            return (
              <button key={t.slug} onClick={() => available && toggleTopic(t.slug)}
                disabled={!available}
                title={available ? undefined : 'No questions yet for this topic and year level'}
                className={`p-4 rounded-2xl border text-left transition-all
                  ${!available
                    ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                    : topics.has(t.slug)
                      ? 'border-teal-400 bg-teal-50 border-2'
                      : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                <div className="font-medium text-sm flex items-center gap-2">
                  {t.label}
                  {!available && <span className="text-xs font-normal text-gray-400">(none yet)</span>}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{t.description}</div>
              </button>
            )
          })}
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

      {topics.size > 0 && pool.length === 0 && (
        <p className="text-sm text-amber-600 mb-3">
          No questions yet for this combination. Try a different year level or topic.
        </p>
      )}
      {pool.length > 0 && <div className="mb-3" />}
      <button onClick={buildQuiz} disabled={!readyToBuild || pool.length === 0} className="btn-primary w-full">
        Start practice
      </button>
    </main>
  )
}
