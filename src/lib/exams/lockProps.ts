import type { Route } from 'next'
import { PRACTICE_EXAMS, type PracticeExam } from '@/lib/questions/exams'
import { statsFor, subjectLabel, summarisePaper, yearLabel } from '@/lib/catalogue'
import { isYearLevelSellable } from '@/lib/stripe'

/**
 * Everything the lock screen needs for one paper. Server-only.
 *
 * The exam page and the mark page both gate on the same purchase, so both
 * render the same lock — built here once so they cannot describe the bundle
 * differently.
 */
export function lockPropsFor(exam: PracticeExam) {
  const stats = statsFor(exam.yearLevel)
  const freeSample = PRACTICE_EXAMS.find(
    e => e.subject === exam.subject && e.yearLevel === exam.yearLevel && !e.premium
  )
  return {
    title: exam.title,
    yearLevel: exam.yearLevel,
    yearLabel: yearLabel(exam.yearLevel),
    summary: summarisePaper(exam),
    sellable: isYearLevelSellable(exam.yearLevel),
    bundle: {
      papers: stats?.papers ?? 0,
      subjects: (stats?.subjects ?? [exam.subject]).map(subjectLabel),
    },
    freeSample: freeSample
      ? { id: freeSample.id, title: freeSample.title, subjectLabel: subjectLabel(freeSample.subject) }
      : undefined,
    backHref: `/practice/exams?year=${exam.yearLevel}` as Route,
  }
}
