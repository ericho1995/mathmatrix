import type { SubjectSlug } from '@/types'

/**
 * Official exam dates, each traced to the authority that sets it.
 *
 * Hand-maintained rather than fetched: these change once a year, and a
 * countdown that silently breaks when a third-party page changes shape is
 * worse than one that needs a yearly edit. When a year's dates are published,
 * add them here — expired entries hide themselves, so nothing needs deleting.
 */

export const NAPLAN_SOURCE = 'https://www.nap.edu.au/naplan/key-dates'
export const VCE_SOURCE = 'https://www.vcaa.vic.edu.au/administration/key-dates/vce-examination-timetable'

/** NAPLAN test windows. Each school sets its own days inside the window. */
export const NAPLAN_WINDOWS: { year: number; start: string; end: string }[] = [
  { year: 2026, start: '2026-03-11', end: '2026-03-23' },
  { year: 2027, start: '2027-03-10', end: '2027-03-22' },
  { year: 2028, start: '2028-03-15', end: '2028-03-27' },
  { year: 2029, start: '2029-03-14', end: '2029-03-26' },
]

export interface VceExam {
  subject: SubjectSlug
  label: string
  /** ISO date, Melbourne local. */
  date: string
  time: string
}

/** 2026 VCE written examinations for the subjects PrepNest has papers for. */
export const VCE_EXAMS_2026: VceExam[] = [
  { subject: 'general_maths', label: 'General Mathematics — Examination 1', date: '2026-10-30', time: '2:00 pm – 3:45 pm' },
  { subject: 'general_maths', label: 'General Mathematics — Examination 2', date: '2026-11-02', time: '2:00 pm – 3:45 pm' },
  { subject: 'maths_methods', label: 'Mathematical Methods — Examination 1', date: '2026-11-05', time: '9:00 am – 10:15 am' },
  { subject: 'maths_methods', label: 'Mathematical Methods — Examination 2', date: '2026-11-06', time: '11:45 am – 2:00 pm' },
  { subject: 'specialist_maths', label: 'Specialist Mathematics — Examination 1', date: '2026-11-09', time: '9:00 am – 10:15 am' },
  { subject: 'chemistry', label: 'Chemistry', date: '2026-11-10', time: '9:00 am – 11:45 am' },
  { subject: 'specialist_maths', label: 'Specialist Mathematics — Examination 2', date: '2026-11-11', time: '11:45 am – 2:00 pm' },
  { subject: 'physics', label: 'Physics', date: '2026-11-12', time: '9:00 am – 11:45 am' },
]

export const VCE_EXAM_PERIOD_2026 = { start: '2026-10-27', end: '2026-11-18' }

/**
 * Today's date as YYYY-MM-DD in Melbourne.
 *
 * Every date above is Australian local time. Counting in UTC would tell a
 * student on the evening before their exam that it is still a day away — the
 * server clock is UTC, and Melbourne is 10–11 hours ahead of it.
 */
export function todayInMelbourne(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Melbourne',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** Whole calendar days from today (Melbourne) until an ISO date. Negative once it has passed. */
export function daysUntil(isoDate: string, now: Date = new Date()): number {
  const [y1, m1, d1] = todayInMelbourne(now).split('-').map(Number)
  const [y2, m2, d2] = isoDate.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000)
}

/** The next NAPLAN window that has not yet finished, or null if the table has run out. */
export function nextNaplanWindow(now: Date = new Date()) {
  return NAPLAN_WINDOWS.find(w => daysUntil(w.end, now) >= 0) ?? null
}

/** VCE exams still to come, soonest first. */
export function upcomingVceExams(now: Date = new Date()): (VceExam & { days: number })[] {
  return VCE_EXAMS_2026.map(e => ({ ...e, days: daysUntil(e.date, now) }))
    .filter(e => e.days >= 0)
    .sort((a, b) => a.days - b.days)
}

/** "Thursday 5 November 2026" */
export function formatLongDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)))
}

/**
 * "10 – 22 March 2027", "27 October – 18 November 2026", "29 December 2026 – 8 January 2027".
 *
 * The start date only drops what it shares with the end. It used to drop the
 * month unconditionally, so the VCE exam period read "27 – 18 November 2026".
 */
export function formatWindow(start: string, end: string): string {
  const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) => {
    const [y, m, d] = iso.split('-').map(Number)
    return new Intl.DateTimeFormat('en-AU', { ...opts, timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)))
  }
  const [sy, sm] = start.split('-')
  const [ey, em] = end.split('-')
  const startOpts: Intl.DateTimeFormatOptions =
    sy !== ey ? { day: 'numeric', month: 'long', year: 'numeric' } : sm !== em ? { day: 'numeric', month: 'long' } : { day: 'numeric' }
  return `${fmt(start, startOpts)} – ${fmt(end, { day: 'numeric', month: 'long', year: 'numeric' })}`
}

export function dayWord(n: number): string {
  if (n === 0) return 'today'
  if (n === 1) return 'tomorrow'
  return `in ${n} days`
}
