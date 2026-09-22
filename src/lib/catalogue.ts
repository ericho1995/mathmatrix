import { PRACTICE_EXAMS, type PracticeExam } from '@/lib/questions/exams'
import { SUBJECTS, SELECTIVE_SUBJECTS, GRADES } from '@/lib/curriculum'
import { QUESTION_TOTAL } from '@/lib/questions/coverage'
import type { SubjectSlug, YearLevel } from '@/types'

/**
 * What the catalogue holds, counted once.
 *
 * The pricing page, the NAPLAN and VCE hubs, the catalogue and the homepage all
 * quote paper counts. Deriving every one of them from here is what stops them
 * disagreeing — the homepage and its own metadata already disagreed about the
 * lowest year level once, and paper counts change every time content lands.
 */

export const ALL_SUBJECTS = [...SUBJECTS, ...SELECTIVE_SUBJECTS]

export function subjectLabel(slug: SubjectSlug): string {
  return ALL_SUBJECTS.find(s => s.slug === slug)?.label ?? slug
}

export function subjectIcon(slug: SubjectSlug): string {
  return ALL_SUBJECTS.find(s => s.slug === slug)?.icon ?? '📄'
}

export interface YearLevelStats {
  yearLevel: YearLevel
  /** "Grade 3", "Year 11" */
  label: string
  /** "Gr 3", "Yr 11" */
  shortLabel: string
  papers: number
  free: number
  paid: number
  subjects: SubjectSlug[]
  exams: PracticeExam[]
}

const LONG_LABEL: Record<YearLevel, string> = {
  grade_3: 'Grade 3', grade_4: 'Grade 4', grade_5: 'Grade 5', grade_6: 'Grade 6',
  year_7: 'Year 7', year_8: 'Year 8', year_9: 'Year 9', year_10: 'Year 10',
  year_11: 'Year 11', year_12: 'Year 12',
}

export function yearLabel(yearLevel: YearLevel): string {
  return LONG_LABEL[yearLevel]
}

export function isYearLevel(value: unknown): value is YearLevel {
  return typeof value === 'string' && value in LONG_LABEL
}

/** One entry per year level that has at least one paper, in curriculum order. */
export const YEAR_LEVEL_STATS: YearLevelStats[] = GRADES.map(g => {
  const exams = PRACTICE_EXAMS.filter(e => e.yearLevel === g.value)
  // Subject order follows the curriculum lists, not the order papers were generated.
  const subjects = ALL_SUBJECTS.map(s => s.slug).filter(slug => exams.some(e => e.subject === slug))
  return {
    yearLevel: g.value,
    label: LONG_LABEL[g.value],
    shortLabel: g.label,
    papers: exams.length,
    free: exams.filter(e => !e.premium).length,
    paid: exams.filter(e => e.premium).length,
    subjects,
    exams,
  }
}).filter(s => s.papers > 0)

export function statsFor(yearLevel: YearLevel): YearLevelStats | undefined {
  return YEAR_LEVEL_STATS.find(s => s.yearLevel === yearLevel)
}

export const CATALOGUE_TOTALS = {
  papers: PRACTICE_EXAMS.length,
  // From the generated coverage file rather than bank.ts, so a page quoting it
  // does not pull the whole question bank into its server bundle.
  questions: QUESTION_TOTAL,
  subjects: ALL_SUBJECTS.length,
  free: PRACTICE_EXAMS.filter(e => !e.premium).length,
  paid: PRACTICE_EXAMS.filter(e => e.premium).length,
  lowest: YEAR_LEVEL_STATS[0]?.label ?? 'Grade 3',
  highest: YEAR_LEVEL_STATS[YEAR_LEVEL_STATS.length - 1]?.label ?? 'Year 12',
}

/** The NAPLAN year levels. Papers exist for 4, 6, 8 and 10 too, in the same format. */
export const NAPLAN_YEARS: YearLevel[] = ['grade_3', 'grade_5', 'year_7', 'year_9']

/** Strips "Maths Grade 3 — " so a paper reads as "Practice Exam 2" inside its own group. */
export function shortTitle(exam: PracticeExam): string {
  const parts = exam.title.split(' — ')
  return parts[parts.length - 1] ?? exam.title
}

export interface PaperSummary {
  questions: number
  minutes: number
  sections: { title: string; questions: number; minutes: number; calculator?: boolean }[]
  readingMinutes?: number
}

/** A paper's shape, from metadata alone — never question content. */
export function summarisePaper(exam: PracticeExam): PaperSummary {
  const sections = exam.sections.map(s => ({
    title: s.title,
    questions: s.question_ids.length,
    minutes: s.time_minutes,
    calculator: s.calculator_allowed,
  }))
  return {
    questions: sections.reduce((n, s) => n + s.questions, 0),
    minutes: sections.reduce((n, s) => n + s.minutes, 0),
    sections,
    readingMinutes: exam.reading_minutes,
  }
}
