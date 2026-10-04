'use client'

import { Calculator } from 'lucide-react'
import type { ScreenQuestion } from '@/lib/web/questionHtml'
import type { Answer } from '@/lib/diagnostic/types'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/**
 * One question as the child sees it. The stem, diagram and options arrive as
 * server-rendered HTML (src/lib/web) — the same drawings the paper prints —
 * with no answers in them.
 */
export default function QuestionView({
  question,
  answer,
  onAnswer,
  compact = false,
}: {
  question: ScreenQuestion
  answer: Answer
  onAnswer: (a: Answer) => void
  /** A preview (the homepage): keep the diagram short so one tall drawing does not stretch the page. */
  compact?: boolean
}) {
  const q = question
  return (
    <div>
      {q.calculator !== undefined && (
        <p
          className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 mb-3 ${
            q.calculator ? 'bg-teal-50 text-teal-600' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" aria-hidden />
          {q.calculator ? 'Calculator allowed' : 'No calculator'}
        </p>
      )}
      <div className="text-xl sm:text-2xl font-bold leading-snug text-ink mb-5" dangerouslySetInnerHTML={{ __html: q.stem }} />

      {q.diagram && (
        // Diagrams are ink on paper, so they sit on white whatever the page around them.
        <div
          className={`rounded-2xl border-2 border-line bg-white text-[#1a1a1a] p-3 mb-6 overflow-x-auto flex justify-center ${
            compact ? '[&_svg]:max-h-56 [&_svg]:w-auto' : ''
          }`}
          dangerouslySetInnerHTML={{ __html: q.diagram }}
        />
      )}

      {q.kind === 'text' ? (
        <label className="flex items-center gap-2 text-lg">
          <span className="sr-only">Your answer</span>
          {q.unit?.prefix && <span className="text-gray-700">{q.unit.prefix}</span>}
          <input
            className="input text-lg max-w-[14rem]"
            inputMode="text"
            autoComplete="off"
            value={typeof answer === 'string' ? answer : ''}
            onChange={e => onAnswer(e.target.value === '' ? null : e.target.value)}
            maxLength={200}
            placeholder="Type your answer"
          />
          {q.unit?.suffix && <span className="text-gray-700">{q.unit.suffix}</span>}
        </label>
      ) : q.optionDiagrams?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Answers">
          {q.optionDiagrams.map((html, i) => (
            <Choice key={i} index={i} selected={answer === i} onSelect={() => onAnswer(i)}>
              <div className="bg-white text-[#1a1a1a] flex justify-center" dangerouslySetInnerHTML={{ __html: html }} />
              {q.options?.[i] && <div className="text-sm mt-1" dangerouslySetInnerHTML={{ __html: q.options[i] }} />}
            </Choice>
          ))}
        </div>
      ) : q.optionHeaders?.length ? (
        <div role="radiogroup" aria-label="Answers" className="overflow-x-auto">
          <div className="grid gap-2" style={{ gridTemplateColumns: `2.5rem repeat(${q.optionHeaders.length}, minmax(5rem, 1fr))` }}>
            <span />
            {q.optionHeaders.map(h => (
              <span key={h} className="text-xs font-medium text-gray-500 px-2">
                {h}
              </span>
            ))}
          </div>
          <div className="space-y-2 mt-1">
            {(q.options ?? []).map((o, i) => (
              <Choice key={i} index={i} selected={answer === i} onSelect={() => onAnswer(i)} table={q.optionHeaders!.length}>
                {o.split(' | ').map((cell, ci) => (
                  <span key={ci} className="px-2" dangerouslySetInnerHTML={{ __html: cell }} />
                ))}
              </Choice>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Answers">
          {(q.options ?? []).map((o, i) => (
            <Choice key={i} index={i} selected={answer === i} onSelect={() => onAnswer(i)}>
              <span dangerouslySetInnerHTML={{ __html: o }} />
            </Choice>
          ))}
        </div>
      )}
    </div>
  )
}

function Choice({
  index,
  selected,
  onSelect,
  children,
  table,
}: {
  index: number
  selected: boolean
  onSelect: () => void
  children: React.ReactNode
  table?: number
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border-2 border-b-4 px-4 py-3 text-base sm:text-lg font-semibold transition-colors active:border-b-2 active:translate-y-[2px] ${
        selected ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-line bg-white text-ink hover:bg-gray-50'
      } ${table ? 'grid items-center' : 'flex items-start gap-3'}`}
      style={table ? { gridTemplateColumns: `2.5rem repeat(${table}, minmax(5rem, 1fr))` } : undefined}
    >
      <span
        className={`inline-flex shrink-0 w-7 h-7 rounded-lg items-center justify-center text-sm font-bold ${
          selected ? 'bg-brand-500 text-white' : 'border-2 border-line text-gray-400'
        }`}
      >
        {LETTERS[index]}
      </span>
      {table ? children : <span className="flex-1 min-w-0">{children}</span>}
    </button>
  )
}
