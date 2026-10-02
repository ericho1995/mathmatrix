import type { PracticeExam } from '../questions/exams.ts'
import type { TailoredExam } from './tailor.ts'
import { listJoin } from './score.ts'

// ─────────────────────────────────────────────────────────────────────────────
// A tailored exam as a printable paper: the catalogue's PracticeExam shape, so
// ExamPaperDocument and AnswerKeyDocument print it like any other paper, plus
// the note on its cover that says who it was built for.
// ─────────────────────────────────────────────────────────────────────────────

export function tailoredAsPractice(exam: TailoredExam): PracticeExam {
  return {
    id: exam.id,
    subject: exam.subject,
    yearLevel: exam.yearLevel,
    title: exam.title,
    sections: exam.sections,
    premium: true,
    ...(exam.reading_minutes ? { reading_minutes: exam.reading_minutes } : {}),
    ...(exam.formula_sheet ? { formula_sheet: exam.formula_sheet } : {}),
  }
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** The cover panel: who the paper is for, and where its questions go. */
export function tailoredCoverNote(exam: TailoredExam, childName: string | null): string[] {
  const work = exam.focus.filter(f => f.level !== 'strength')
  const lines = [childName ? `Built for ${childName}` : 'Built from a diagnostic test']
  lines.push(
    work.length
      ? `Made from ${childName ? `${childName}’s` : 'the'} diagnostic result: most of the questions practice ${listJoin(work.map(f => f.label))}.`
      : `Made from ${childName ? `${childName}’s` : 'the'} diagnostic result, which found no weak area: the questions stretch every area.`
  )
  for (const f of exam.focus) lines.push(`${f.label}: ${plural(f.questions, 'question', 'questions')}`)
  if (exam.secondChance) lines.push(`The last section repeats ${plural(exam.secondChance, 'question', 'questions')} from the diagnostic that went wrong, to try again.`)
  return lines
}
