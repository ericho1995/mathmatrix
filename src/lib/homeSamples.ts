import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { resolveExam } from '@/lib/pdf/resolveExam'
import { previewOf } from '@/lib/pdf/preview'
import { toScreenQuestion, type ScreenQuestion } from '@/lib/web/questionHtml'
import { BY_ID } from '@/lib/diagnostic/server'
import { DIFFICULTY_RANK } from '@/lib/diagnostic/select'
import { yearLabel } from '@/lib/yearLevels'
import { SELECTIVE_SUBJECTS, SUBJECTS } from '@/lib/curriculum'
import type { BankQuestion } from '@/lib/diagnostic/types'
import type { SubjectSlug, YearLevel } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Real questions for the homepage's test screen, one per level from Grade 3 to
// VCE, so a parent sees the range rather than one easy sum. Each comes from the
// open first half of a paper (what anyone can flip through), and is the
// hardest multiple-choice question there, preferring one with a diagram.
// Server-only: the questions are drawn to HTML here, without their answers.
// ─────────────────────────────────────────────────────────────────────────────

export interface HomeSample {
  label: string
  question: ScreenQuestion
  /** "Question 14 of 30", as the test screen shows it. */
  of: number
}

const PICKS: { year: YearLevel; subject: SubjectSlug }[] = [
  { year: 'grade_3', subject: 'math' },
  { year: 'grade_5', subject: 'math' },
  { year: 'grade_5', subject: 'english' },
  { year: 'year_7', subject: 'math' },
  // Year 8: a step up in reasoning (what one very different value does to the average).
  { year: 'year_8', subject: 'math' },
  { year: 'year_9', subject: 'math' },
  { year: 'year_12', subject: 'maths_methods' },
]

const SUBJECT = new Map([...SUBJECTS, ...SELECTIVE_SUBJECTS].map(s => [s.slug, s.label]))
const isChoice = (q: BankQuestion) => (q.format ?? 'multiple_choice') === 'multiple_choice' && 'options' in q && Array.isArray(q.options)

function pick(year: YearLevel, subject: SubjectSlug): HomeSample | null {
  for (const exam of PRACTICE_EXAMS.filter(e => e.yearLevel === year && e.subject === subject)) {
    const resolved = resolveExam(exam.id)
    if (!resolved) continue
    const open = previewOf(resolved).resolved.sections.flatMap(s => s.questions.map(q => BY_ID.get(q.id)!)).filter(q => q && isChoice(q))
    if (!open.length) continue
    const best = [...open].sort(
      (a, b) => DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty] || Number(Boolean(b.diagram)) - Number(Boolean(a.diagram))
    )[0]
    const all = resolved.sections.flatMap(s => s.questions)
    const n = all.findIndex(q => q.id === best.id) + 1
    return { label: `${yearLabel(year)} ${SUBJECT.get(subject) ?? subject}`, question: toScreenQuestion(best, n), of: all.length }
  }
  return null
}

export const HOME_SAMPLES: HomeSample[] = PICKS.map(p => pick(p.year, p.subject)).filter((s): s is HomeSample => Boolean(s))
