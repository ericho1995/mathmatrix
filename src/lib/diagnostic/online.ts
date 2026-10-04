import type { Answer } from './types'
import type { Mark } from './save'
import type { TailoredExam } from './tailor'
import { tailoredAsPractice } from './paper'
import { isCorrect } from './score'
import { BY_ID } from './server'
import {
  answerKeyFor,
  buildOnlinePaper,
  isWritten,
  marksOf,
  numberedFromExam,
  parseAnswersFor,
  idsOf,
  type KeyItem,
  type OnlinePaper,
} from '@/lib/exams/onScreen'

// ─────────────────────────────────────────────────────────────────────────────
// A generated weak-areas paper sat on screen (see lib/exams/onScreen.ts for
// what every on-screen paper shares). Server-only.
// ─────────────────────────────────────────────────────────────────────────────

export type { KeyItem, OnlinePaper }

const numbered = (exam: TailoredExam) => numberedFromExam(tailoredAsPractice(exam))

export function onlinePaper(exam: TailoredExam): OnlinePaper {
  return buildOnlinePaper(
    exam.title,
    exam.sections.reduce((n, s) => n + s.time_minutes, 0),
    numbered(exam)
  )
}

export const answerKey = (exam: TailoredExam, answers: ReadonlyMap<string, Answer>): KeyItem[] => answerKeyFor(numbered(exam), answers)

export const parsePaperAnswers = (exam: TailoredExam, raw: unknown) => parseAnswersFor(idsOf(numbered(exam)), raw)

/**
 * Marks for a paper sat on screen: automatic ones from the answers, written
 * ones as given (clamped to what the question is worth). Null if a written
 * question has no mark yet or a mark names a question not on the paper.
 */
export function onlineMarks(exam: TailoredExam, answers: ReadonlyMap<string, Answer>, written: ReadonlyMap<string, number>): Mark[] | null {
  const ids = new Set(exam.sections.flatMap(s => s.question_ids))
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
