'use client'

import { useEffect, useRef, useState } from 'react'
import type { TopicSlug, YearLevel } from '@/types'
import { createClient } from '@/lib/supabase/client'

export interface QuizQuestion {
  id: string
  question_text: string
  options: string[]
  correct_index: number
  explanation: string
}

const XP_PER_CORRECT = 10

export default function QuizRunner({
  questions,
  primaryTopic,
  primaryYearLevel,
  onExit,
  onRetry,
}: {
  questions: QuizQuestion[]
  primaryTopic: TopicSlug
  primaryYearLevel: YearLevel
  onExit: () => void
  onRetry?: () => void
}) {
  const [screen, setScreen] = useState<'quiz' | 'results'>('quiz')
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null))
  const [times, setTimes] = useState<number[]>(new Array(questions.length).fill(0))
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const questionStartedAt = useRef(Date.now())
  const saved = useRef(false)

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
  useEffect(() => {
    if (screen !== 'results' || saved.current || questions.length === 0) return
    saved.current = true

    async function persist() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

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
  }, [screen]) // eslint-disable-line react-hooks/exhaustive-deps

  if (screen === 'quiz' && q) return (
    <main className="max-w-xl mx-auto px-4 py-10 flex-1 w-full">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">Question <strong className="text-gray-900">{qIndex + 1}</strong> of {questions.length}</span>
        <button onClick={onExit} className="text-sm text-gray-400 hover:text-gray-600">Exit</button>
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
        <button onClick={onExit} className="btn-secondary">Back</button>
        {onRetry && <button onClick={onRetry} className="btn-primary">Try again</button>}
      </div>
    </main>
  )
}
