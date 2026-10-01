import React from 'react'
import { DiagramView } from '@/lib/pdf/diagrams'
import { answerUnit } from '@/lib/questions/answerUnit'
import type { BankQuestion } from '@/lib/diagnostic/types'
import { pdfToHtml } from './pdfToHtml'
import { richHtml } from './mathHtml'

// ─────────────────────────────────────────────────────────────────────────────
// A bank question as the on-screen test shows it: HTML strings for the stem,
// the diagram and the options, and nothing that gives the answer away.
//
// The answer fields (correct_index, expected_answer, accepted_answers,
// explanation) are never read here, so they cannot leak into what the browser
// receives before the test is submitted.
// ─────────────────────────────────────────────────────────────────────────────

export interface ScreenQuestion {
  id: string
  /** Position in the test, from 1. */
  n: number
  kind: 'choice' | 'text'
  stem: string
  diagram?: string
  options?: string[]
  /** Picture answers: one drawing per option, in option order. */
  optionDiagrams?: string[]
  /** Options laid out as a table: the column headings; each option's cells are split on " | ". */
  optionHeaders?: string[]
  unit?: { prefix?: string; suffix?: string }
  /** Year 7–10 Maths: whether a calculator may be used on this question. */
  calculator?: boolean
  /** Reading: the text this question is about. */
  textId?: string
}

const diagramHtml = (diagram: Parameters<typeof DiagramView>[0]['diagram'], fit: number, bare?: boolean) =>
  pdfToHtml(React.createElement(DiagramView, { diagram, fit, bare }))

export function toScreenQuestion(q: BankQuestion, n: number): ScreenQuestion {
  const base: ScreenQuestion = {
    id: q.id,
    n,
    kind: q.format === 'short_answer' ? 'text' : 'choice',
    stem: richHtml(q.question_text),
    ...(q.diagram ? { diagram: diagramHtml(q.diagram, 520) } : {}),
    ...(typeof q.calculator_allowed === 'boolean' ? { calculator: q.calculator_allowed } : {}),
    ...(q.stimulus_id ? { textId: q.stimulus_id } : {}),
  }
  if (q.format === 'short_answer') {
    const unit = answerUnit(q.expected_answer)
    return unit.prefix || unit.suffix ? { ...base, unit } : base
  }
  if (q.format !== undefined && q.format !== 'multiple_choice') {
    throw new Error(`toScreenQuestion: ${q.id} cannot be shown on screen`)
  }
  return {
    ...base,
    options: q.options.map(o => richHtml(o)),
    ...(q.option_diagrams?.length ? { optionDiagrams: q.option_diagrams.map(d => diagramHtml(d, 240, true)) } : {}),
    ...(q.option_headers?.length ? { optionHeaders: q.option_headers } : {}),
  }
}
