'use client'

import { useState } from 'react'
import type { YearLevel, TopicSlug, SubjectSlug } from '@/types'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { SUBJECTS, GRADES, TOPICS } from '@/lib/curriculum'

type Screen = 'select' | 'quiz' | 'results'

interface QuizQuestion {
  question_text: string
  options: string[]
  correct_index: number
  explanation: string
}

export default function PracticePage() {
  const [subject, setSubject] = useState<SubjectSlug | null>(null)
  const [grade, setGrade] = useState<YearLevel | null>(null)
  const [topic, setTopic] = useState<TopicSlug | null>(null)
  const [screen, setScreen] = useState<Screen>('select')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  function chooseSubject(s: SubjectSlug) {
    setSubject(s)
    setTopic(null)
  }

  function buildQuiz() {
    if (!subject || !grade || !topic) return
    const pool = QUESTION_BANK.filter(q => q.topic === topic && q.year_level === grade)
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(8, pool.length))
    setQuestions(shuffled)
    setAnswers(new Array(shuffled.length).fill(null))
    setQIndex(0)
    setSelected(null)
    setRevealed(false)
    setScreen('quiz')
  }

  function choose(i: number) {
    if (revealed) return
    setSelected(i)
    setRevealed(true)
    const updated = [...answers]
    updated[qIndex] = i
    setAnswers(updated)
  }

  function next() {
    if (qIndex + 1 >= questions.length) {
      setScreen('results')
    } else {
      setQIndex(qIndex + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  const correctCount = answers.filter((a, i) => a === questions[i]?.correct_index).length
  const pct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0
  const q = questions[qIndex]
  const poolSize = subject && grade && topic
    ? QUESTION_BANK.filter(item => item.topic === topic && item.year_level === grade).length
    : null

  if (screen === 'select') return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Start practising</h1>
      <p className="text-gray-500 mb-8">Choose a subject, year level, and topic.</p>

      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Subject</p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {SUBJECTS.map(s => (
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

      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Topic</p>
      {!subject ? (
        <p className="text-sm text-gray-400 mb-8">Pick a subject above to see its topics.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {TOPICS.filter(t => t.subject === subject).map(t => (
            <button key={t.slug} onClick={() => setTopic(t.slug)}
              className={`p-4 rounded-2xl border text-left transition-all
                ${topic === t.slug
                  ? 'border-teal-400 bg-teal-50 border-2'
                  : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
              <div className="font-medium text-sm">{t.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{t.description}</div>
            </button>
          ))}
        </div>
      )}

      {poolSize === 0 && (
        <p className="text-sm text-amber-600 mb-3">
          No questions yet for this year level and topic — try a different combination.
        </p>
      )}
      <button onClick={buildQuiz} disabled={!subject || !grade || !topic || poolSize === 0} className="btn-primary w-full">
        Start practice
      </button>
    </main>
  )

  if (screen === 'quiz' && q) return (
    <main className="max-w-xl mx-auto px-4 py-10">
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
    <main className="max-w-md mx-auto px-4 py-10 text-center">
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
        <button onClick={() => setScreen('select')} className="btn-secondary">Change topic</button>
        <button onClick={buildQuiz} className="btn-primary">Try again</button>
      </div>
    </main>
  )
}
