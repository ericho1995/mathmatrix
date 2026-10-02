import { firstQuestionNumbers, hydrateExam } from '@/lib/pdf/resolveExam'
import { LONG_FORM_MARKS, toScreenQuestion, type ScreenQuestion } from '@/lib/web/questionHtml'
import { richHtml } from '@/lib/web/mathHtml'
import { isCorrect } from '@/lib/diagnostic/score'
import { BY_ID, textsFor } from '@/lib/diagnostic/server'
import type { PracticeExam } from '@/lib/questions/exams'
import type { ReadingText } from '@/types/reading'
import type { Answer, BankQuestion } from '@/lib/diagnostic/types'
import { paperQuestionMapWithIds } from './paperQuestions'
import { paperMinutes } from './paperTime'

// ─────────────────────────────────────────────────────────────────────────────
// Any paper sat on screen: a catalogue practice exam or a generated
// weak-areas paper. Server-only.
//
// The questions go to the browser as HTML with no answers in them, numbered
// exactly as the printed paper numbers them — for a catalogue paper, from the
// same map the marking screen and the result route use, so a split Numeracy
// paper's two booklets each start at 1 here too. Only once the paper is handed
// in does the server send the answer key: multiple choice and short answers
// are marked here; written questions come back with their marking guide, for
// the marks to be given as they would be with the printed key.
// ─────────────────────────────────────────────────────────────────────────────

/** A section with its questions in paper order and their printed numbers. */
export interface NumberedSection {
  title: string
  instructions?: string[]
  calculator?: boolean
  questions: { id: string; n: number }[]
}

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

/** Numbering straight from the paper's sections, as the PDF prints them. */
export function numberedFromExam(exam: PracticeExam): NumberedSection[] {
  const resolved = hydrateExam(exam)
  const starts = firstQuestionNumbers(resolved.sections)
  return resolved.sections.map((s, si) => ({
    title: s.section.title,
    ...(s.section.instructions?.length ? { instructions: s.section.instructions } : {}),
    ...(typeof s.section.calculator_allowed === 'boolean' ? { calculator: s.section.calculator_allowed } : {}),
    questions: s.questions.map((q, qi) => ({ id: q.id, n: starts[si] + qi + 1 })),
  }))
}

/**
 * A catalogue paper's numbering, from the marking map (paperQuestions.ts), so
 * a section index and number here are the ones the result route records.
 */
export function numberedCatalogue(exam: PracticeExam): NumberedSection[] | null {
  const map = paperQuestionMapWithIds(exam.id)
  if (!map) return null
  return map.map(s => {
    const meta = exam.sections.find(x => x.title === s.title)
    return {
      title: s.title,
      ...(meta?.instructions?.length ? { instructions: meta.instructions } : {}),
      ...(typeof meta?.calculator_allowed === 'boolean' ? { calculator: meta.calculator_allowed } : {}),
      questions: s.questions.map(q => ({ id: q.id, n: q.n })),
    }
  })
}

export function buildOnlinePaper(title: string, minutes: number, sections: NumberedSection[]): OnlinePaper {
  return {
    title,
    minutes,
    sections: sections.map(s => ({
      title: s.title,
      ...(s.instructions ? { instructions: s.instructions } : {}),
      ...(s.calculator !== undefined ? { calculator: s.calculator } : {}),
      questions: s.questions.map(q => toScreenQuestion(BY_ID.get(q.id)!, q.n)),
    })),
    texts: textsFor(sections.flatMap(s => s.questions.map(q => q.id))),
  }
}

/** A catalogue paper, ready to sit on screen. */
export function catalogueOnlinePaper(exam: PracticeExam): OnlinePaper | null {
  const sections = numberedCatalogue(exam)
  return sections ? buildOnlinePaper(exam.title, paperMinutes(exam), sections) : null
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
export const isWritten = (q: BankQuestion) => q.format === 'extended_response' || q.format === 'long_form'
export const marksOf = (q: BankQuestion) => (q.format === 'extended_response' ? q.parts.reduce((n, p) => n + p.marks, 0) : q.marks ?? LONG_FORM_MARKS)

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
export function answerKeyFor(sections: NumberedSection[], answers: ReadonlyMap<string, Answer>): KeyItem[] {
  return sections.flatMap((section, s) =>
    section.questions.map(({ id, n }) => {
      const q = BY_ID.get(id)!
      const written = isWritten(q)
      return {
        id,
        s,
        n,
        written,
        correct: written ? null : isCorrect(q, answers.get(id) ?? null),
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

/** Answers from the browser, kept only for questions on the paper and of a sane shape. */
export function parseAnswersFor(ids: ReadonlySet<string>, raw: unknown): Map<string, Answer> | null {
  if (!Array.isArray(raw) || raw.length > 200) return null
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

export const idsOf = (sections: NumberedSection[]) => new Set(sections.flatMap(s => s.questions.map(q => q.id)))
