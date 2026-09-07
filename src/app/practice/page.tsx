'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { YearLevel, TopicSlug, SubjectSlug } from '@/types'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { SUBJECTS, SELECTIVE_SUBJECTS, GRADES, TOPICS } from '@/lib/curriculum'
import { createClient } from '@/lib/supabase/client'

type Screen = 'select' | 'quiz' | 'results'
type Mode = 'general' | 'selective'

interface QuizQuestion {
  id: string
  question_text: string
  options: string[]
  correct_index: number
  explanation: string
}

const XP_PER_CORRECT = 10
const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20]

export default function PracticePage() {
  const searchParams = useSearchParams()

  const [mode, setMode] = useState<Mode>('general')
  const [subject, setSubject] = useState<SubjectSlug | null>(null)
  const [grade, setGrade] = useState<YearLevel | null>(null)
  const [topics, setTopics] = useState<Set<TopicSlug>>(new Set())
  const [questionCount, setQuestionCount] = useState(10)
  const [screen, setScreen] = useState<Screen>('select')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [times, setTimes] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const questionStartedAt = useRef(Date.now())
  const saved = useRef(false)

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

  const pool = QUESTION_BANK.filter(
    q => topics.has(q.topic) && (mode === 'selective' || q.year_level === grade)
  )

  function buildQuiz() {
    if (!readyToBuild) return
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(questionCount, pool.length))
    setQuestions(shuffled)
    setAnswers(new Array(shuffled.length).fill(null))
    setTimes(new Array(shuffled.length).fill(0))
    setQIndex(0)
    setSelected(null)
    setRevealed(false)
    questionStartedAt.current = Date.now()
    saved.current = false
    setScreen('quiz')
  }

  function choose(i: number) {
    if (revealed) return
    setSelected(i)
    setRevealed(true)
    const updated = [...answers]
    updated[qIndex] = i
    setAnswers(updated)
    const elapsed = [...times]
    elapsed[qIndex] = Math.round((Date.now() - questionStartedAt.current) / 1000)
    setTimes(elapsed)
  }

  function next() {
    if (qIndex + 1 >= questions.length) {
      setScreen('results')
    } else {
      setQIndex(qIndex + 1)
      setSelected(null)
      setRevealed(false)
      questionStartedAt.current = Date.now()
    }
  }

  const correctCount = answers.filter((a, i) => a === questions[i]?.correct_index).length
  const pct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0
  const q = questions[qIndex]

  // Persist the finished session, best-effort. Signed-out visitors and any
  // Supabase error are swallowed so the results screen never breaks on this.
  // A multi-topic custom exam is recorded under its first selected topic,
  // since practice_sessions has one topic column per session.
  useEffect(() => {
    if (screen !== 'results' || saved.current || questions.length === 0) return
    saved.current = true

    async function persist() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const primaryTopic = Array.from(topics)[0]
        const primaryYearLevel = mode === 'selective' ? 'year_11' : grade
        if (!user || !primaryTopic || !primaryYearLevel) return

        const xpEarned = correctCount * XP_PER_CORRECT

        const { data: session, error: sessionError } = await supabase
          .from('practice_sessions')
          .insert({
            student_id: user.id,
            topic: primaryTopic,
            year_level: primaryYearLevel,
            mode: 'practice',
            completed_at: new Date().toISOString(),
            total_questions: questions.length,
            correct_count: correctCount,
            xp_earned: xpEarned,
          })
          .select('id')
          .single()

        if (sessionError || !session) return

        await supabase.from('question_attempts').insert(
          questions.map((question, i) => ({
            session_id: session.id,
            question_id: question.id,
            selected_index: answers[i] ?? -1,
            is_correct: answers[i] === question.correct_index,
            time_taken_seconds: times[i] ?? 0,
          }))
        )

        const { data: studentProfile } = await supabase
          .from('student_profiles')
          .select('xp_total, streak_days, last_active')
          .eq('id', user.id)
          .single()

        if (studentProfile) {
          const today = new Date().toISOString().slice(0, 10)
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
          let streak = studentProfile.streak_days
          if (studentProfile.last_active === today) {
            // already practised today, streak unchanged
          } else if (studentProfile.last_active === yesterday) {
            streak += 1
          } else {
            streak = 1
          }

          await supabase
            .from('student_profiles')
            .update({
              xp_total: studentProfile.xp_total + xpEarned,
              streak_days: streak,
              last_active: today,
            })
            .eq('id', user.id)
        }
      } catch {
        // best-effort, results screen already rendered regardless
      }
    }

    persist()
  }, [screen, questions, answers, times, correctCount, topics, grade, mode])

  if (screen === 'select') return (
    <main className="max-w-2xl mx-auto px-4 py-10 flex-1 w-full">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Build your practice exam</h1>
      <p className="text-gray-500 mb-6">
        Choose a subject and one or more topics to create a personalised set of questions.
      </p>

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
        {activeSubjects.map(s => (
          <button key={s.slug} onClick={() => chooseSubject(s.slug)}
            className={`p-4 rounded-2xl border text-center transition-all
              ${subject === s.slug
                ? 'border-2'
                : 'border-gray-100 hover:border-gray-200 bg-white'}`}
            style={subject === s.slug ? { borderColor: s.color, backgroundColor: `${s.color}14` } : undefined}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-medium text-sm">{s.label}</div>
          </button>
        ))}
      </div>

      {requiresGrade && (
        <>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Year level</p>
          <div className="grid grid-cols-5 gap-2 mb-8">
            {GRADES.map(g => (
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
          {TOPICS.filter(t => t.subject === subject).map(t => (
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

      {topics.size > 0 && pool.length === 0 && (
        <p className="text-sm text-amber-600 mb-3">
          No questions yet for this combination. Try a different year level or topic.
        </p>
      )}
      {pool.length > 0 && (
        <p className="text-sm text-gray-400 mb-3">
          {Math.min(questionCount, pool.length)} question{Math.min(questionCount, pool.length) === 1 ? '' : 's'} ready from {pool.length} available.
        </p>
      )}
      <button onClick={buildQuiz} disabled={!readyToBuild || pool.length === 0} className="btn-primary w-full">
        Start practice
      </button>
    </main>
  )

  if (screen === 'quiz' && q) return (
    <main className="max-w-xl mx-auto px-4 py-10 flex-1 w-full">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">Question <strong className="text-gray-900">{qIndex + 1}</strong> of {questions.length}</span>
        <button onClick={() => setScreen('select')} className="text-sm text-gray-400 hover:text-gray-600">Exit</button>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full mb-6">
        <div className="h-1.5 bg-brand-400 rounded-full transition-all duration-300"
          style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }} />
      </div>
      <div className="card mb-4">
        <p className="text-lg font-medium leading-relaxed">{q.question_text}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {q.options.map((opt, i) => {
          let cls = 'p-4 rounded-xl border text-sm font-medium text-center transition-all cursor-pointer '
          if (!revealed) cls += 'border-gray-100 hover:border-brand-400 hover:bg-brand-50'
          else if (i === q.correct_index) cls += 'border-2 border-teal-400 bg-teal-50 text-teal-700'
          else if (i === selected && i !== q.correct_index) cls += 'border-2 border-red-300 bg-red-50 text-red-700'
          else cls += 'border-gray-100 opacity-50'
          return <button key={i} className={cls} onClick={() => choose(i)} disabled={revealed}>{opt}</button>
        })}
      </div>
      {revealed && (
        <div className={`p-4 rounded-xl text-sm mb-4 ${selected === q.correct_index ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'}`}>
          <strong>{selected === q.correct_index ? 'Correct!' : 'Not quite.'}</strong> {q.explanation}
        </div>
      )}
      {revealed && (
        <button onClick={next} className="btn-primary w-full">
          {qIndex + 1 < questions.length ? 'Next question' : 'See results'}
        </button>
      )}
    </main>
  )

  return (
    <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
      <div className="w-24 h-24 rounded-full bg-brand-50 border-2 border-brand-400 flex flex-col items-center justify-center mx-auto mb-6">
        <span className="text-3xl font-medium text-brand-600">{pct}%</span>
      </div>
      <h2 className="text-xl font-medium mb-1">
        {pct >= 90 ? 'Outstanding!' : pct >= 70 ? 'Well done!' : pct >= 50 ? 'Good effort!' : 'Keep going!'}
      </h2>
      <p className="text-gray-500 mb-8">
        You got {correctCount} out of {questions.length} correct.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setScreen('select')} className="btn-secondary">Change topics</button>
        <button onClick={buildQuiz} className="btn-primary">Try again</button>
      </div>
    </main>
  )
}
