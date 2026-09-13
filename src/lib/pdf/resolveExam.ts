import { PRACTICE_EXAMS, type PracticeExam, type PracticeExamSection } from '@/lib/questions/exams'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { STIMULI } from '@/lib/questions/stimuli'
import type { Question, Stimulus } from '@/types'

export type ResolvedQuestion = Question & { stimulus?: Stimulus }

export interface ResolvedSection {
  section: PracticeExamSection
  questions: ResolvedQuestion[]
}

export interface ResolvedExam {
  exam: PracticeExam
  sections: ResolvedSection[]
}

export function resolveExam(examId: string): ResolvedExam | null {
  const exam = PRACTICE_EXAMS.find(e => e.id === examId)
  if (!exam) return null

  const questionById = new Map(QUESTION_BANK.map(q => [q.id, q]))
  const stimulusById = new Map(STIMULI.map(s => [s.id, s]))

  const sections: ResolvedSection[] = exam.sections.map(section => ({
    section,
    questions: section.question_ids
      .map(id => questionById.get(id))
      .filter((q): q is Question => Boolean(q))
      .map(q => ({ ...q, stimulus: q.stimulus_id ? stimulusById.get(q.stimulus_id) : undefined })),
  }))

  return { exam, sections }
}

// ─── Calculator/non-calculator two-booklet split (NAPLAN Phase 1 #1) ──────────
//
// Only `math` subject exams for year_7/8/9 ever have sections with BOTH
// calculator_allowed: true and calculator_allowed: false (see gen-exams.mjs's
// NUMERACY_CALC_SPLIT_GRADES). Grade 3-6 math has one plain section and
// English/science exams never set calculator_allowed at all — for those, every
// section's calculator_allowed is undefined, so isSplitEligible is false and
// selectExamSession is always a no-op passthrough, identical to today's
// behavior.

export type CalculatorSession = 'calculator' | 'non-calculator'

/** True only when a resolved exam mixes a calculator section with a non-calculator
 * one — i.e. it should be offered as two separate downloadable booklets rather than
 * one combined PDF. */
export function isSplitEligible(resolved: ResolvedExam): boolean {
  const hasCalculator = resolved.sections.some(s => s.section.calculator_allowed === true)
  const hasNonCalculator = resolved.sections.some(s => s.section.calculator_allowed === false)
  return hasCalculator && hasNonCalculator
}

/**
 * Filters a resolved exam down to one calculator "booklet" for split-eligible exams.
 * `sessionParam` is the raw `?session=` query-string value from the PDF routes.
 *
 * - `'calculator'` / `'non-calculator'`: returns just that group's sections, provided
 *   the exam actually has a non-empty group for it.
 * - Anything else — missing, `'general'`, or an unrecognized value — returns the exam
 *   completely unchanged. This is today's behavior for every non-split exam (Grade 3-6
 *   math, all English/science exams), preserved as the default/fallback with no
 *   regression. It is also the deliberate fallback for a split-eligible exam requested
 *   with no/invalid `session` (see task-8d-report.md for why: no existing caller of
 *   these routes can pass an invalid session for a split exam today, and falling back
 *   to the full combined PDF is safer than guessing a session or erroring).
 *
 * Returns the resolved session alongside the (possibly filtered) exam so callers
 * (filenames, filename-driven headers) know whether a split actually happened.
 */
export function selectExamSession(
  resolved: ResolvedExam,
  sessionParam: string | null
): { resolved: ResolvedExam; session: CalculatorSession | null } {
  if (sessionParam !== 'calculator' && sessionParam !== 'non-calculator') {
    return { resolved, session: null }
  }
  const wantCalculator = sessionParam === 'calculator'
  const sections = resolved.sections.filter(s => s.section.calculator_allowed === wantCalculator)
  if (sections.length === 0) {
    return { resolved, session: null }
  }
  return { resolved: { exam: resolved.exam, sections }, session: sessionParam }
}

/**
 * The question number each section starts at, so the exam paper and the answer
 * key never disagree about what "Question 3" means.
 *
 * Numbers run continuously through the paper — a NAPLAN Numeracy booklet with a
 * non-calculator and a calculator section numbers straight through — except for
 * a section marked `restart_numbering`. VCAA papers number within each section,
 * so Methods Exam 2 Section B opens at Question 1, not Question 21.
 */
export function firstQuestionNumbers(sections: ResolvedSection[]): number[] {
  const starts: number[] = []
  let running = 0
  for (const s of sections) {
    if (s.section.restart_numbering) running = 0
    starts.push(running)
    running += s.questions.length
  }
  return starts
}
