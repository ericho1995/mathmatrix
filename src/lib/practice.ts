import type { Subject, SubjectSlug, Topic, YearLevel } from '@/types'
import { GRADES, SELECTIVE_SUBJECTS, SUBJECTS, TOPICS } from '@/lib/curriculum'
import { topicCountAt } from '@/lib/questions/coverage'
import { isVceYear } from '@/lib/pricing'

// ─────────────────────────────────────────────────────────────────────────────
// What the free quiz can offer at each year level.
//
// Answered from the generated coverage counts, never the question bank, so this
// module is safe to import from client components. The year level decides the
// subjects: picking Year 11 or 12 is what switches to the VCE subjects, rather
// than a separate "selective subjects" mode a visitor has to know to look for.
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_SUBJECTS: Subject[] = [...SUBJECTS, ...SELECTIVE_SUBJECTS]

/** "Grade 5", "Year 12" — the site's own spelling of each level, in full. */
export function yearLabel(year: YearLevel): string {
  return year.startsWith('grade_') ? `Grade ${year.slice(6)}` : `Year ${year.slice(5)}`
}

/** Topics of a subject that have quiz questions at this year level. */
export function topicsAt(subject: SubjectSlug, year: YearLevel): Topic[] {
  return TOPICS.filter(t => t.subject === subject && topicCountAt(t.slug, year) > 0)
}

/** Subjects with at least one playable topic at this year level. */
export function subjectsAt(year: YearLevel): Subject[] {
  return ALL_SUBJECTS.filter(s => topicsAt(s.slug, year).length > 0)
}

/** Year levels with anything to practice, in curriculum order. */
export const PRACTICE_YEARS: YearLevel[] = GRADES.map(g => g.value).filter(y => subjectsAt(y).length > 0)

/** Parents look for their child's stage first, so the levels are grouped the way schools group them. */
export const YEAR_GROUPS: { label: string; years: YearLevel[] }[] = [
  { label: 'Primary', years: PRACTICE_YEARS.filter(y => y.startsWith('grade_')) },
  { label: 'Secondary', years: PRACTICE_YEARS.filter(y => y.startsWith('year_') && !isVceYear(y)) },
  { label: 'VCE', years: PRACTICE_YEARS.filter(isVceYear) },
].filter(g => g.years.length > 0)

/** "Grade 3 to Year 12" */
export function practiceRange(): string {
  if (!PRACTICE_YEARS.length) return ''
  return `${yearLabel(PRACTICE_YEARS[0])} to ${yearLabel(PRACTICE_YEARS[PRACTICE_YEARS.length - 1])}`
}

/** Topic descriptions carry a band like "(Gr 3-6)" for the old unfiltered list; noise once the year is chosen. */
export function topicBlurb(topic: Topic): string {
  return topic.description.replace(/\s*\((?:Gr|Yr)[^)]*\)\s*$/, '')
}
