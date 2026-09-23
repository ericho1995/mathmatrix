import type { PracticeExam } from '@/lib/questions/exams'

/**
 * Minutes of writing time for a whole paper.
 *
 * Most papers are timed section by section. A Reading paper is one sitting —
 * its sections are texts in the magazine, not timed parts — so it carries a
 * single `total_minutes` and every section's own time is 0.
 */
export function paperMinutes(exam: Pick<PracticeExam, 'total_minutes' | 'sections'>): number {
  return exam.total_minutes ?? exam.sections.reduce((n, s) => n + s.time_minutes, 0)
}
