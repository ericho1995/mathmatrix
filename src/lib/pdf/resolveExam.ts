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
