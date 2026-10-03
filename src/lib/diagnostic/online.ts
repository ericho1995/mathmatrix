import { firstQuestionNumbers, hydrateExam } from '@/lib/pdf/resolveExam'
import { LONG_FORM_MARKS, toScreenQuestion, type ScreenQuestion } from '@/lib/web/questionHtml'
import { richHtml } from '@/lib/web/mathHtml'
import type { ReadingText } from '@/types/reading'
import type { Answer, BankQuestion } from './types'
import type { Mark } from './save'
import type { TailoredExam } from './tailor'
import { tailoredAsPractice } from './paper'
import { isCorrect } from './score'
import { BY_ID, textsFor } from './server'

// ─────────────────────────────────────────────────────────────────────────────
// A generated paper sat on screen. Server-only.
//
// The questions go to the browser as HTML with no answers in them, numbered
// exactly as the printed paper numbers them. Only once the paper is handed in
// does the server send the answer key: multiple choice and short answers are
// marked here; written questions come back with their marking guide for the
// parent (or the child) to give the marks, as they would with the printed key.
// ─────────────────────────────────────────────────────────────────────────────

export interface OnlineSection {
  title: string
  instructions?: string[]
  calculator?: boolean
  questions: ScreenQuestion[]
}

export interface OnlinePaper {
  title: string
  minutes: number
  sections: OnlineSection[]
  texts: Record<string, ReadingText>
}

function numberedQuestions(exam: TailoredExam) {
  const resolved = hydrateExam(tailoredAsPractice(exam))
  const starts = firstQuestionNumbers(resolved.sections)
  return resolved.sections.map((s, si) => ({
    section: s.section,
    questions: s.questions.map((q, qi) => ({ q: BY_ID.get(q.id)!, n: starts[si] + qi + 1, s: si })),
  }))
}

export function onlinePaper(exam: TailoredExam): OnlinePaper {
  const sections = numberedQuestions(exam)
  return {
    title: exam.title,
    minutes: exam.sections.reduce((n, s) => n + s.time_minutes, 0),
    sections: sections.map(({ section, questions }) => ({
      title: section.title,
      ...(section.instructions?.length ? { instructions: section.instructions } : {}),
      ...(typeof section.calculator_allowed === 'boolean' ? { calculator: section.calculator_allowed } : {}),
      questions: questions.map(({ q, n }) => toScreenQuestion(q, n)),
    })),
    texts: textsFor(exam.sections.flatMap(s => s.question_ids)),
  }
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const isWritten = (q: BankQuestion) => q.format === 'extended_response' || q.format === 'long_form'
const marksOf = (q: BankQuestion) => (q.format === 'extended_response' ? q.parts.reduce((n, p) => n + p.marks, 0) : q.marks ?? LONG_FORM_MARKS)

export interface KeyItem {
  id: string
  /** Section index and printed number. */
  s: number
  n: number
  written: boolean
  /** Choice and short answers: whether the answer was right. Null for written questions. */
  correct: boolean | null
  /** The right answer, as HTML (for a written question, the whole model answer). */
  answer: string
  explanation: string
  marks: number
  parts?: { label: string; marks: number; answer: string; explanation: string }[]
}

function answerHtml(q: BankQuestion): string {
  if (q.format === 'short_answer') return richHtml(q.expected_answer)
  if (q.format === 'extended_response' || q.format === 'long_form') return ''
  const i = q.correct_index
  const text = q.options[i] ?? ''
  return `<strong>${LETTERS[i]}</strong>${text ? ` — ${richHtml(text.replace(/ \| /g, ' · '))}` : ''}`
}

/** The answer key for a handed-in paper, with each automatic answer marked. */
export function answerKey(exam: TailoredExam, answers: ReadonlyMap<string, Answer>): KeyItem[] {
  return numberedQuestions(exam).flatMap(({ questions }) =>
    questions.map(({ q, n, s }) => {
      const written = isWritten(q)
      return {
        id: q.id,
        s,
        n,
        written,
        correct: written ? null : isCorrect(q, answers.get(q.id) ?? null),
        answer: answerHtml(q),
        explanation: richHtml(q.explanation),
        marks: written ? marksOf(q) : 1,
        ...(q.format === 'extended_response'
          ? { parts: q.parts.map(p => ({ label: p.label, marks: p.marks, answer: richHtml(p.expected_answer), explanation: richHtml(p.explanation) })) }
          : {}),
      }
    })
  )
}

/** The paper's question ids, so a browser's answers can be checked against them. */
export const paperQuestionIds = (exam: TailoredExam) => new Set(exam.sections.flatMap(s => s.question_ids))

/**
 * Marks for a paper sat on screen: automatic ones from the answers, written
 * ones as given (clamped to what the question is worth). Null if a written
 * question has no mark yet or a mark names a question not on the paper.
 */
export function onlineMarks(exam: TailoredExam, answers: ReadonlyMap<string, Answer>, written: ReadonlyMap<string, number>): Mark[] | null {
  const ids = paperQuestionIds(exam)
  for (const id of Array.from(written.keys())) if (!ids.has(id)) return null
  const out: Mark[] = []
  for (const id of exam.sections.flatMap(s => s.question_ids)) {
    const q = BY_ID.get(id)
    if (!q) continue
    if (isWritten(q)) {
      const m = written.get(id)
      if (m === undefined || !Number.isFinite(m)) return null
      const of = marksOf(q)
      out.push({ id, m: Math.max(0, Math.min(of, Math.round(m))), of })
    } else {
      out.push({ id, ok: isCorrect(q, answers.get(id) ?? null) })
    }
  }
  return out
}

/** Answers from the browser, kept only for questions on the paper and of a sane shape. */
export function parsePaperAnswers(exam: TailoredExam, raw: unknown): Map<string, Answer> | null {
  if (!Array.isArray(raw) || raw.length > 200) return null
  const ids = paperQuestionIds(exam)
  const out = new Map<string, Answer>()
  for (const item of raw) {
    const id = (item as { id?: unknown })?.id
    const a = (item as { a?: unknown })?.a
    if (typeof id !== 'string' || !ids.has(id)) return null
    if (a === null || (typeof a === 'number' && Number.isInteger(a) && a >= 0 && a < 8)) out.set(id, a)
    else if (typeof a === 'string' && a.length <= 4000) out.set(id, a)
    else return null
  }
  return out
}
