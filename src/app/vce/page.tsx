import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { SELECTIVE_SUBJECTS } from '@/lib/curriculum'
import { VCE_PAPER_PRICE } from '@/lib/pricing'
import { shortTitle } from '@/lib/catalogue'
import {
  VCE_EXAM_PERIOD_2026,
  VCE_SOURCE,
  dayWord,
  daysUntil,
  formatLongDate,
  formatWindow,
  upcomingVceExams,
} from '@/lib/examDates'
import type { SubjectSlug } from '@/types'

export const metadata: Metadata = {
  title: 'VCE practice exams — Methods, General, Specialist, Chemistry, Physics — PrepNest',
  description:
    'Printable VCE practice exams in the VCAA format, with separate answer keys and the 2026 exam timetable. Free sample papers for every subject.',
}

export const revalidate = 3600

/**
 * The VCE hub.
 *
 * The timetable only lists subjects PrepNest has papers for, and says plainly
 * which of them have Unit 3 & 4 papers. Chemistry, Physics and Specialist are
 * examined at Unit 3 & 4 but only have Unit 1 & 2 papers here so far — linking
 * a Year 12 chemistry student to a "Chemistry" button that opens Year 11
 * content would be misleading at exactly the moment they are most anxious.
 */
export default function VcePage() {
  const upcoming = upcomingVceExams()
  const periodDays = daysUntil(VCE_EXAM_PERIOD_2026.start)
  const periodOver = daysUntil(VCE_EXAM_PERIOD_2026.end) < 0

  const papersFor = (subject: SubjectSlug, year: 'year_11' | 'year_12') =>
    PRACTICE_EXAMS.filter(e => e.subject === subject && e.yearLevel === year)

  return (
    <main className="flex-1 w-full">
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">VCE</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4">VCE practice exams</h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-8">
          Printable practice exams laid out like VCAA papers — reading time, sections, and the technology-free and
          technology-active split — each with a separate answer key.
        </p>

        {!periodOver && (
          <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="sm:w-32 shrink-0">
              {periodDays > 0 ? (
                <>
                  <p className="text-3xl font-medium tracking-tight text-brand-600">{periodDays}</p>
                  <p className="text-xs text-gray-400">{periodDays === 1 ? 'day to go' : 'days to go'}</p>
                </>
              ) : (
                <p className="text-lg font-medium text-brand-600">Exams on now</p>
              )}
            </div>
            <div>
              <p className="font-medium">
                2026 written exams: {formatWindow(VCE_EXAM_PERIOD_2026.start, VCE_EXAM_PERIOD_2026.end)}
              </p>
              <p className="text-sm text-gray-500">
                {periodDays > 0 ? `The exam period starts ${dayWord(periodDays)}. ` : ''}
                <a href={VCE_SOURCE} className="underline hover:text-gray-700" rel="noopener" target="_blank">
                  Full VCAA timetable
                </a>
              </p>
            </div>
          </div>
        )}
      </section>

      {/* The timetable, filtered to what PrepNest covers, with an honest note on
          which exams have matching Unit 3 & 4 papers. */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6">
            2026 exam timetable — subjects PrepNest covers
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-500">
              The 2026 written exams have finished. The VCAA publishes the next timetable during the year —{' '}
              <a href={VCE_SOURCE} className="underline" rel="noopener" target="_blank">
                check the VCAA site
              </a>
              .
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcoming.map(exam => {
                const unit34 = papersFor(exam.subject, 'year_12')
                return (
                  <li
                    key={exam.label}
                    className="card flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-4"
                  >
                    <div className="sm:w-28 shrink-0">
                      <p className="text-sm font-medium text-brand-600">{dayWord(exam.days)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{exam.label}</p>
                      <p className="text-xs text-gray-400">
                        {formatLongDate(exam.date)} · {exam.time}
                      </p>
                    </div>
                    <div className="sm:w-48 shrink-0 text-sm">
                      {unit34.length > 0 ? (
                        <Link
                          href={`/practice/exams?year=year_12` as Route}
                          className="text-brand-600 hover:underline"
                        >
                          Unit 3 & 4 practice papers →
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">Unit 1 & 2 papers only so far</span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="text-xs text-gray-400 mt-4">
            Times are Melbourne time. Always confirm against the{' '}
            <a href={VCE_SOURCE} className="underline" rel="noopener" target="_blank">
              official VCAA timetable
            </a>
            .
          </p>
        </div>
      </section>

      {/* What exists per subject, split by unit. */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6">Papers by subject</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SELECTIVE_SUBJECTS.map(subject => {
            const u12 = papersFor(subject.slug, 'year_11')
            const u34 = papersFor(subject.slug, 'year_12')
            if (u12.length + u34.length === 0) return null
            return (
              <div key={subject.slug} className="card">
                <p className="font-medium mb-3 flex items-center gap-2">
                  <span aria-hidden>{subject.icon}</span> {subject.label}
                </p>
                <UnitList title="Unit 3 & 4 · Year 12" papers={u34} />
                <UnitList title="Unit 1 & 2 · Year 11" papers={u12} />
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <p className="text-gray-500 mb-5">
            Every VCE paper is {VCE_PAPER_PRICE}, purchased once and yours to keep — pay only for the subjects you sit.
            The first paper in every subject is free, and more papers are on the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={'/practice/exams?year=year_12' as Route} className="btn-primary">
              Year 12 papers
            </Link>
            <Link href={'/practice/exams?year=year_11' as Route} className="btn-secondary">
              Year 11 papers
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-10 max-w-xl mx-auto">
            The VCE is administered by the Victorian Curriculum and Assessment Authority (VCAA). PrepNest is an
            independent provider of practice material and is not affiliated with or endorsed by the VCAA.
          </p>
        </div>
      </section>
    </main>
  )
}

function UnitList({ title, papers }: { title: string; papers: typeof PRACTICE_EXAMS }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1.5">{title}</p>
      {papers.length === 0 ? (
        <p className="text-sm text-gray-400">Not available yet</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {papers.map(e => (
            <li key={e.id}>
              <Link
                href={`/practice/exams/${e.id}` as Route}
                className="text-sm text-gray-700 hover:text-brand-600 hover:underline"
              >
                {/* No padlock: this page does not read entitlements, and a lock
                    shown to someone who has already paid reads as a failed purchase. */}
                📄 {shortTitle(e)}
                {!e.premium && <span className="text-xs text-teal-600"> Free</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
