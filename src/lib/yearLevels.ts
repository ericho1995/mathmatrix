import type { YearLevel } from '../types'

/**
 * Year levels as people talk about them — "Grade 3", "Year 12" — grouped by
 * school stage for the year picker.
 *
 * Client-safe on purpose: the sign-up form (a client component) uses the same
 * picker as the catalogue, and catalogue.ts pulls in every paper. Paper counts
 * stay in catalogue.ts and are passed in by server pages.
 */
const LONG: Record<YearLevel, string> = {
  grade_3: 'Grade 3', grade_4: 'Grade 4', grade_5: 'Grade 5', grade_6: 'Grade 6',
  year_7: 'Year 7', year_8: 'Year 8', year_9: 'Year 9', year_10: 'Year 10',
  year_11: 'Year 11', year_12: 'Year 12',
}

const NAPLAN = new Set<YearLevel>(['grade_3', 'grade_5', 'year_7', 'year_9'])

export const YEAR_STAGES = [
  { id: 'primary', label: 'Primary', note: 'NAPLAN in Grades 3 and 5', years: ['grade_3', 'grade_4', 'grade_5', 'grade_6'] },
  { id: 'secondary', label: 'Secondary', note: 'NAPLAN in Years 7 and 9', years: ['year_7', 'year_8', 'year_9', 'year_10'] },
  { id: 'vce', label: 'VCE', note: 'Units 1 & 2 and 3 & 4', years: ['year_11', 'year_12'] },
] as const satisfies readonly { id: string; label: string; note: string; years: readonly YearLevel[] }[]

export function yearLabel(y: YearLevel): string {
  return LONG[y]
}

/** Short tag for a year tile: which external exam the level sits. */
export function yearTag(y: YearLevel): string | null {
  if (NAPLAN.has(y)) return 'NAPLAN'
  if (y === 'year_11') return 'Units 1 & 2'
  if (y === 'year_12') return 'Units 3 & 4'
  return null
}

/** Eyebrow over a year's section in the catalogue. */
export function stageTag(y: YearLevel): string {
  if (NAPLAN.has(y)) return 'NAPLAN year'
  if (y === 'year_11') return 'VCE Units 1 & 2'
  if (y === 'year_12') return 'VCE Units 3 & 4'
  return ''
}
