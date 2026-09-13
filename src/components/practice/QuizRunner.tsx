'use client'

import { useEffect, useRef, useState } from 'react'
import type { TopicSlug, YearLevel, QuestionFormat } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { matchShortAnswer } from '@/lib/questions/matchShortAnswer'
import { queryFailed } from '@/lib/supabase/logError'

export interface QuizQuestion {
  id: string
  question_text: string
  explanation: string
  format?: QuestionFormat
  options?: string[]
  correct_index?: number
  expected_answer?: string
  accepted_answers?: string[]
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
  const [responses, setResponses] = useState<(string | null)[]>(new Array(questions.length).fill(null))
  const [times, setTimes] = useState<number[]>(new Array(questions.length).fill(0))
  const [selected, setSelected] = useState<number | null>(null)
  const [draftText, setDraftText] = useState('')
  const [revealed, setRevealed] = useState(false)
  // True when the finished session could not be written. Shown on the results
  // screen so a student is never told they earned XP that was never recorded.
  const [saveFailed, setSaveFailed] = useState(false)
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

  function submitLongForm() {
    if (revealed || !draftText.trim()) return
    setRevealed(true)
    const updated = [...responses]
    updated[qIndex] = draftText.trim()
    setResponses(updated)
    const elapsed = [...times]
    elapsed[qIndex] = Math.round((Date.now() - questionStartedAt.current) / 1000)
    setTimes(elapsed)
  }

  function submitShortAnswer() {
    if (revealed || !draftText.trim()) return
    setRevealed(true)
    const updated = [...responses]
    updated[qIndex] = draftText.trim()
    setResponses(updated)
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
      setDraftText('')
      setRevealed(false)
      questionStartedAt.current = Date.now()
    }
  }

  const gradableQuestions = questions.filter(q => q.format !== 'long_form')
  const correctCount = questions.filter((question, i) => {
    if (question.format === 'long_form') return false
    if (question.format === 'short_answer') {
      const resp = responses[i]
      return resp != null && matchShortAnswer(resp, { expected_answer: question.expected_answer ?? '', accepted_answers: question.accepted_answers })
    }
    return answers[i] === question.correct_index
  }).length
  const pct = gradableQuestions.length ? Math.round((correctCount / gradableQuestions.length) * 100) : 0
  const longFormCount = questions.length - gradableQuestions.length
  const q = questions[qIndex]
  const isLongForm = q?.format === 'long_form'
  const isShortAnswer = q?.format === 'short_answer'
  const shortAnswerCorrect = isShortAnswer && q && responses[qIndex] != null
    ? matchShortAnswer(responses[qIndex] as string, { expected_answer: q.expected_answer ?? '', accepted_answers: q.accepted_answers })
    : false

  // Persist the finished session. A failure here must never break the results
  // screen — but it must not be invisible either. Until this was fixed, a
  // student could finish a quiz, be told they had earned XP, and find their
  // total unchanged, with nothing logged anywhere to explain it. Every step
  // below now reports, and `saveFailed` tells the student their work did not
  // save rather than implying it did.
  useEffect(() => {
    if (screen !== 'results' || saved.current || questions.length === 0) return
    saved.current = true

    async function persist() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        // Signed-out visitors are not a failure — there is nowhere to save to.
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
            total_questions: gradableQuestions.length,
            correct_count: correctCount,
            xp_earned: xpEarned,
          })
          .select('id')
          .single()

        if (queryFailed('quiz.createSession', sessionError, { userId: user.id }) || !session) {
          setSaveFailed(true)
          return
        }

        const { error: attemptsError } = await supabase.from('question_attempts').insert(
          questions.map((question, i) => ({
            session_id: session.id,
            question_id: question.id,
            selected_index: question.format === 'long_form' || question.format === 'short_answer' ? -1 : answers[i] ?? -1,
            response_text: question.format === 'long_form' || question.format === 'short_answer' ? responses[i] : null,
            is_correct: question.format === 'long_form'
              ? null
              : question.format === 'short_answer'
                ? matchShortAnswer(responses[i] ?? '', { expected_answer: question.expected_answer ?? '', accepted_answers: question.accepted_answers })
                : answers[i] === question.correct_index,
            time_taken_seconds: times[i] ?? 0,
          }))
        )

        // The session row exists but its answers do not, so the results screen
        // is right about the score while the dashboard will disagree.
        if (queryFailed('quiz.saveAttempts', attemptsError, { sessionId: session.id })) setSaveFailed(true)

        const { data: studentProfile, error: profileError } = await supabase
          .from('student_profiles')
          .select('xp_total, streak_days, last_active')
          .eq('id', user.id)
          .single()

        if (queryFailed('quiz.readStudentProfile', profileError, { userId: user.id })) setSaveFailed(true)

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

          const { error: xpError } = await supabase
            .from('student_profiles')
            .update({
              xp_total: studentProfile.xp_total + xpEarned,
              streak_days: streak,
              last_active: today,
            })
            .eq('id', user.id)

          // The one a student notices: XP and streak silently not moving.
          if (queryFailed('quiz.updateXp', xpError, { userId: user.id, xpEarned })) setSaveFailed(true)
        }
      } catch (error) {
        // Still caught, so the results screen renders no matter what — but a
        // thrown error (offline, bad client config) is now reported too.
        console.error('[quiz.persist] unexpected error while saving the session', error)
        setSaveFailed(true)
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

      {isLongForm ? (
        <>
          <textarea
            value={revealed ? (responses[qIndex] ?? '') : draftText}
            onChange={e => setDraftText(e.target.value)}
            disabled={revealed}
            rows={6}
            placeholder="Write your answer..."
            className="w-full p-4 rounded-xl border border-gray-100 text-sm mb-4 focus:outline-none focus:border-brand-400 disabled:bg-gray-50 disabled:text-gray-500"
          />
          {!revealed && (
            <button onClick={submitLongForm} disabled={!draftText.trim()} className="btn-primary w-full mb-4 disabled:opacity-50">
              Submit answer
            </button>
          )}
          {revealed && (
            <div className="p-4 rounded-xl text-sm mb-4 bg-gray-50 text-gray-600">
              <strong>Response recorded.</strong> This is a long-answer question, so it isn&apos;t auto-marked — it will be available for a tutor or parent to review.
            </div>
          )}
        </>
      ) : isShortAnswer ? (
        <>
          <input
            type="text"
            value={revealed ? (responses[qIndex] ?? '') : draftText}
            onChange={e => setDraftText(e.target.value)}
            disabled={revealed}
            placeholder="Type your answer..."
            className="input mb-4"
          />
          {!revealed && (
            <button onClick={submitShortAnswer} disabled={!draftText.trim()} className="btn-primary w-full mb-4 disabled:opacity-50">
              Submit answer
            </button>
          )}
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {q.options!.map((opt, i) => {
            let cls = 'p-4 rounded-xl border text-sm font-medium text-center transition-all cursor-pointer '
            if (!revealed) cls += 'border-gray-100 hover:border-brand-400 hover:bg-brand-50'
            else if (i === q.correct_index) cls += 'border-2 border-teal-400 bg-teal-50 text-teal-700'
            else if (i === selected && i !== q.correct_index) cls += 'border-2 border-red-300 bg-red-50 text-red-700'
            else cls += 'border-gray-100 opacity-50'
            return <button key={i} className={cls} onClick={() => choose(i)} disabled={revealed}>{opt}</button>
          })}
        </div>
      )}

      {revealed && !isLongForm && (
        <div className={`p-4 rounded-xl text-sm mb-4 ${(isShortAnswer ? shortAnswerCorrect : selected === q.correct_index) ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'}`}>
          <strong>{(isShortAnswer ? shortAnswerCorrect : selected === q.correct_index) ? 'Correct!' : 'Not quite.'}</strong> {q.explanation}
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
        You got {correctCount} out of {gradableQuestions.length} correct.
        {longFormCount > 0 && ` Plus ${longFormCount} long-answer response${longFormCount === 1 ? '' : 's'} submitted for review.`}
      </p>
      {saveFailed && (
        <div className="card mb-6 text-left border-amber-200 bg-amber-50">
          <p className="text-sm text-gray-800 mb-1">This result couldn&apos;t be saved to your account.</p>
          <p className="text-sm text-gray-600">
            Your score above is correct, but it may not appear in your progress or XP total. This
            is a problem on our side — please try another quiz in a few minutes.
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onExit} className="btn-secondary">Back</button>
        {onRetry && <button onClick={onRetry} className="btn-primary">Try again</button>}
      </div>
    </main>
  )
}
