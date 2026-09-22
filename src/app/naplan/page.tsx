import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { BUNDLE_PRICE } from '@/lib/pricing'
import { NAPLAN_YEARS, statsFor, yearLabel } from '@/lib/catalogue'
import { NAPLAN_SOURCE, dayWord, daysUntil, formatWindow, nextNaplanWindow } from '@/lib/examDates'
import type { YearLevel } from '@/types'

export const metadata: Metadata = {
  title: 'NAPLAN practice tests for Years 3, 5, 7 and 9 — PrepNest',
  description:
    'Printable NAPLAN-style practice papers for Numeracy, Reading and Language Conventions, with separate answer keys. Free sample papers for every year level.',
}

// The countdown is computed at request time; an hour's staleness is fine for a
// number of days.
export const revalidate = 3600

const NAPLAN_SUBJECTS = new Set(['math', 'english'])

/**
 * The NAPLAN hub — the page a parent lands on from "NAPLAN practice test".
 *
 * Honest about coverage on purpose: NAPLAN has four domains and PrepNest papers
 * cover three. A parent who buys expecting Writing and finds none asks for a
 * refund, so the gap is stated where they decide, not discovered afterwards.
 */
export default function NaplanPage() {
  const naplan = nextNaplanWindow()
  const days = naplan ? daysUntil(naplan.start) : null
  const inWindow = naplan !== null && days !== null && days <= 0

  return (
    <main className="flex-1 w-full">
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">NAPLAN</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4">
          NAPLAN practice papers for Years 3, 5, 7 and 9
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-8">
          Full-length Numeracy, Reading and Language Conventions papers in the NAPLAN format, pitched at each year
          level, with a separate answer key. Print one, sit it timed, and mark it together.
        </p>

        {naplan && (
          <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="sm:w-32 shrink-0">
              {inWindow ? (
                <p className="text-lg font-medium text-brand-600">On now</p>
              ) : (
                <>
                  <p className="text-3xl font-medium tracking-tight text-brand-600">{days}</p>
                  <p className="text-xs text-gray-400">{days === 1 ? 'day to go' : 'days to go'}</p>
                </>
              )}
            </div>
            <div>
              <p className="font-medium">
                NAPLAN {naplan.year}: {formatWindow(naplan.start, naplan.end)}
              </p>
              <p className="text-sm text-gray-500">
                {inWindow
                  ? 'The test window is open.'
                  : `The test window opens ${dayWord(days ?? 0)}.`}{' '}
                Each school sets its own days inside the window, so check your school&apos;s timetable.{' '}
                <a href={NAPLAN_SOURCE} className="underline hover:text-gray-700" rel="noopener" target="_blank">
                  Official dates
                </a>
              </p>
            </div>
          </div>
        )}
      </section>

      {/* The four domains, and which ones PrepNest covers. */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6">What NAPLAN tests</h2>
          <p className="text-sm text-gray-500 mb-6">
            NAPLAN has four tests, sat in this order: Writing, Reading, Conventions of Language, then Numeracy.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Domain
              name="Reading"
              covered
              body="Passages of literary and informational text, each followed by a cluster of questions on it."
            />
            <Domain
              name="Conventions of Language"
              covered
              body="Spelling, grammar and punctuation questions pitched at the year level."
            />
            <Domain
              name="Numeracy"
              covered
              body="Number, algebra, measurement, geometry, statistics and probability. Years 7 and 9 papers are split into calculator and non-calculator sections."
            />
            <Domain
              name="Writing"
              covered={false}
              body="Not covered yet. Writing needs a prompt and a marking rubric rather than scored questions, and is being built separately."
            />
          </div>
        </div>
      </section>

      {/* One card per NAPLAN year, with its free papers one click away. */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6">Choose a year level</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {NAPLAN_YEARS.map(y => (
            <YearCard key={y} yearLevel={y} />
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-6">
          In between NAPLAN years? Papers for{' '}
          {(['grade_4', 'grade_6', 'year_8', 'year_10'] as YearLevel[]).map((y, i, all) => (
            <span key={y}>
              <Link href={`/practice/exams?year=${y}` as Route} className="text-brand-600 underline">
                {yearLabel(y)}
              </Link>
              {i < all.length - 2 ? ', ' : i === all.length - 2 ? ' and ' : ''}
            </span>
          ))}{' '}
          use the same format, so practice can carry on through the years with no test.
        </p>
      </section>

      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6">Using practice papers well</h2>
          <ol className="flex flex-col gap-4 text-sm text-gray-600 list-decimal list-inside">
            <li>
              <span className="font-medium text-gray-900">Start with the free paper.</span> Sit it early to find out
              where your child is, rather than guessing.
            </li>
            <li>
              <span className="font-medium text-gray-900">Practise the gaps, not the whole test.</span> Marking a
              paper on PrepNest shows which topics lost marks and links straight to practice on those topics.
            </li>
            <li>
              <span className="font-medium text-gray-900">Save full, timed papers for the last few weeks.</span>{' '}
              That is when pacing and stamina matter most.
            </li>
            <li>
              <span className="font-medium text-gray-900">Keep it low-stakes.</span> NAPLAN is a snapshot of how a
              student is going, not a pass-or-fail test, so calm practice beats cramming.
            </li>
          </ol>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-14 text-center">
        <p className="text-gray-500 mb-5">
          Every paper for a year level — Maths, English and Science — with answer keys, for {BUNDLE_PRICE} once.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/practice/exams" className="btn-primary">
            Browse NAPLAN papers
          </Link>
          <Link href={'/pricing' as Route} className="btn-secondary">
            See pricing
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-10 max-w-xl mx-auto">
          NAPLAN is run by the Australian Curriculum, Assessment and Reporting Authority (ACARA). PrepNest is an
          independent provider of practice material and is not affiliated with or endorsed by ACARA.
        </p>
      </section>
    </main>
  )
}

function Domain({ name, covered, body }: { name: string; covered: boolean; body: string }) {
  return (
    <div className="card">
      <p className="font-medium text-sm mb-1 flex items-center gap-2">
        <span className={covered ? 'text-teal-600' : 'text-gray-300'} aria-hidden>
          {covered ? '✓' : '○'}
        </span>
        {name}
        {!covered && <span className="text-xs font-normal text-gray-400">coming later</span>}
      </p>
      <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
    </div>
  )
}

function YearCard({ yearLevel }: { yearLevel: YearLevel }) {
  const stats = statsFor(yearLevel)
  const naplanPapers = PRACTICE_EXAMS.filter(e => e.yearLevel === yearLevel && NAPLAN_SUBJECTS.has(e.subject))
  const free = naplanPapers.filter(e => !e.premium)
  if (!stats) return null

  return (
    <div className="card flex flex-col">
      <p className="text-lg font-medium tracking-tight">{stats.label}</p>
      <p className="text-xs text-gray-400 mb-4">
        {naplanPapers.length} NAPLAN-format papers · {stats.papers} papers in total including Science
      </p>
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">Free to download</p>
      <ul className="flex flex-col gap-1.5 mb-5 flex-1">
        {free.map(e => (
          <li key={e.id}>
            <Link href={`/practice/exams/${e.id}` as Route} className="text-sm text-brand-600 hover:underline">
              📄 {e.subject === 'math' ? 'Numeracy' : 'Reading & Language Conventions'} — free paper
            </Link>
          </li>
        ))}
      </ul>
      <Link href={`/practice/exams?year=${yearLevel}` as Route} className="btn-secondary text-sm text-center">
        All {stats.label} papers
      </Link>
    </div>
  )
}
