import React from 'react'
import { Check, Clock, HelpCircle, X } from 'lucide-react'
import { DiagramView } from '@/lib/pdf/diagrams'
import { pdfToHtml } from '@/lib/web/pdfToHtml'
import { richHtml } from '@/lib/web/mathHtml'
import { BY_ID } from '@/lib/diagnostic/server'
import type { DiagnosticReport, GradedItem } from '@/lib/diagnostic/types'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/**
 * Every question of the test, area by area: what was asked, the answer given,
 * the right answer and why. Rendered on the server; diagrams are the paper's.
 */
export default function QuestionReview({ report }: { report: DiagnosticReport }) {
  const numbered = report.items.map((item, i) => ({ item, n: i + 1 }))
  return (
    <div className="space-y-3">
      {report.areas.map(area => {
        const items = numbered.filter(x => x.item.area.id === area.id)
        return (
          <details key={area.id} className="card p-0 overflow-hidden group">
            <summary className="cursor-pointer select-none px-5 py-4 flex items-center justify-between gap-3 list-none">
              <span className="font-medium text-gray-900">{area.label}</span>
              <span className="text-sm text-gray-500">
                {area.correct} of {area.total} correct <span className="text-gray-300 group-open:hidden">· show</span>
              </span>
            </summary>
            <ol className="divide-y divide-gray-100 border-t border-gray-100">
              {items.map(({ item, n }) => (
                <Item key={item.id} item={item} n={n} />
              ))}
            </ol>
          </details>
        )
      })}
    </div>
  )
}

function Item({ item, n }: { item: GradedItem; n: number }) {
  const q = BY_ID.get(item.id)
  if (!q) return null
  const answered = item.answer !== null && item.answer !== undefined
  const options = q.format !== 'short_answer' && 'options' in q ? q.options : null
  const correctIndex = q.format !== 'short_answer' && 'correct_index' in q ? q.correct_index : null
  return (
    <li className="px-5 py-5">
      <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
        <span className="font-medium text-gray-500">Question {n}</span>
        {item.correct ? (
          <span className="inline-flex items-center gap-1 text-teal-600"><Check className="w-3.5 h-3.5" aria-hidden />Correct</span>
        ) : answered ? (
          <span className="inline-flex items-center gap-1 text-amber-400"><X className="w-3.5 h-3.5" aria-hidden />Not correct</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-gray-500"><HelpCircle className="w-3.5 h-3.5" aria-hidden />Not sure</span>
        )}
        <span className="text-gray-400">· {item.skill}</span>
        {item.followUp && <span className="text-gray-400">· follow-up</span>}
        {item.guessed && <span className="text-gray-400">· marked as a guess</span>}
        {item.ms !== null && (
          <span className={`inline-flex items-center gap-1 ${item.rapid ? 'text-amber-400' : 'text-gray-400'}`}>
            · <Clock className="w-3 h-3" aria-hidden />
            {Math.max(1, Math.round(item.ms / 1000))} s{item.rapid ? ' (too quick to count)' : ''}
          </span>
        )}
      </div>
      <div className="text-gray-900 leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: richHtml(q.question_text) }} />
      {q.diagram && (
        <div className="rounded-lg border border-gray-100 bg-white text-[#1a1a1a] p-2 mb-3 overflow-x-auto flex justify-center" dangerouslySetInnerHTML={{ __html: pdfToHtml(React.createElement(DiagramView, { diagram: q.diagram, fit: 420 })) }} />
      )}
      {options ? (
        <ul className="space-y-1.5 mb-3">
          {options.map((o, i) => {
            const isRight = i === correctIndex
            const isGiven = i === item.answer
            return (
              <li
                key={i}
                className={`flex items-start gap-2 text-sm rounded-lg px-3 py-1.5 ${
                  isRight ? 'bg-teal-50 text-gray-900' : isGiven ? 'bg-amber-50 text-gray-900' : 'text-gray-600'
                }`}
              >
                <span className="font-semibold w-4 shrink-0">{LETTERS[i]}</span>
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: o ? richHtml(o) : `Picture ${LETTERS[i]}` }} />
                {isRight && <span className="text-xs text-teal-600 whitespace-nowrap">right answer</span>}
                {isGiven && !isRight && <span className="text-xs text-amber-400 whitespace-nowrap">answer given</span>}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm mb-3">
          <span className="text-gray-500">Answer given:</span> <span className="font-medium">{answered ? String(item.answer) : '—'}</span>
          {q.format === 'short_answer' && (
            <>
              {' '}
              <span className="text-gray-500">· Right answer:</span> <span className="font-medium">{q.expected_answer}</span>
            </>
          )}
        </p>
      )}
      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: richHtml(q.explanation) }} />
    </li>
  )
}
