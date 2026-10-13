import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import { notFound } from 'next/navigation'
import { ChevronRight, FileText } from 'lucide-react'
import type { PracticeExam } from '@/lib/questions/exams'
import { FROM_PER_MONTH } from '@/lib/pricing'
import { shortTitle, summarisePaper, yearLabel } from '@/lib/catalogue'
import { dayWord, daysUntil, formatWindow, nextNaplanWindow } from '@/lib/examDates'
import type { SubjectSlug } from '@/types'
import {
  NAPLAN_LANDINGS,
  NAPLAN_SOURCE,
  breadcrumbLd,
  faqLd,
  minutesLabel,
  naplanFaqs,
  naplanLanding,
  naplanYearName,
  paperListLd,
  papersFor,
} from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import DiagnosticCta from '@/components/diagnostic/DiagnosticCta'

export const dynamicParams = false
export const revalidate = 3600

export function generateStaticParams() {
  return NAPLAN_LANDINGS.map(l => ({ year: l.slug }))
}

/** What each NAPLAN subject is called on the test itself, in test order. */
const TESTS: { subject: SubjectSlug; name: string; about: string }[] = [
  {
    subject: 'reading',
    name: 'Reading',
    about:
      'A colour Reading Magazine of stories, poems, reports and persuasive texts, and a question paper that sends students to each text by page, the same two booklets as the real test.',
  },
  {
    subject: 'english',
    name: 'Language Conventions',
    about: 'Spelling, grammar and punctuation, pitched at the year level.',
  },
  {
    subject: 'math',
    name: 'Numeracy',
    about: 'Number, algebra, measurement, geometry, statistics and probability, with the diagrams, graphs and tables the real test uses.',
  },
]

const SHARE_IMAGE = {
  url: '/naplan/opengraph-image.jpg',
  width: 1200,
  height: 630,
  alt: 'PrepNest NAPLAN practice papers: the colour Reading Magazine, a magazine page and a Language Conventions page',
}

export function generateMetadata({ params }: { params: { year: string } }): Metadata {
  const l = naplanLanding(params.year)
  if (!l) return {}
  const w = nextNaplanWindow()
  const title = `${l.naplanName} NAPLAN practice tests${w ? ` for ${w.year}` : ''} — Numeracy, Reading, Conventions — PrepNest`
  const count = TESTS.reduce((n, t) => n + papersFor(t.subject, l.yearLevel).length, 0)
  const description = `${count} printable ${l.naplanName} NAPLAN-style practice papers for Numeracy, Reading and Language Conventions, each with an answer key. Flip through the first half of any paper free.`
  const path = `/naplan/${l.slug}`
  return {
    title,
    description,
    alternates: { canonical: path },
    // A page's own openGraph replaces its parent's, share image included, so
    // the hub's card is named here.
    openGraph: {
      title,
      description,
      url: path,
      type: 'website',
      siteName: 'PrepNest',
      locale: 'en_AU',
      images: [SHARE_IMAGE],
    },
    twitter: { card: 'summary_large_image', images: [SHARE_IMAGE] },
  }
}

/**
 * One NAPLAN year: the page a parent lands on from "year 5 naplan practice
 * test". Paper counts and timings come from the catalogue.
 */
export default function NaplanYearPage({ params }: { params: { year: string } }) {
  const l = naplanLanding(params.year)
  if (!l) notFound()

  const w = nextNaplanWindow()
  const days = w ? daysUntil(w.start) : null
  const inWindow = w !== null && days !== null && days <= 0
  const tests = TESTS.map(t => ({ ...t, papers: papersFor(t.subject, l.yearLevel) })).filter(t => t.papers.length > 0)
  const all = tests.flatMap(t => t.papers)
  const faqs = naplanFaqs(l)
  const path = `/naplan/${l.slug}`
  const ours = yearLabel(l.yearLevel)
  const others = NAPLAN_LANDINGS.filter(o => o.slug !== l.slug)

  return (
    <main className="flex-1 w-full">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: 'NAPLAN', path: '/naplan' },
            { name: l.naplanName, path },
          ]),
          paperListLd(`${l.naplanName} NAPLAN practice papers`, all),
          faqLd(faqs),
        ]}
      />

      <section className="max-w-3xl mx-auto px-4 pt-10 pb-10">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-400 mb-4 flex items-center gap-1">
          <Link href="/naplan" className="hover:text-gray-600 hover:underline">
            NAPLAN
          </Link>
          <ChevronRight className="w-3 h-3" aria-hidden />
          <span className="text-gray-500">{l.naplanName}</span>
        </nav>
        <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">
          NAPLAN · {naplanYearName(l)}
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          {l.naplanName} NAPLAN practice tests
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-8">
          {all.length} full-length practice papers in the NAPLAN format, pitched at {ours}:{' '}
          {tests.map((t, i) => (
            <span key={t.subject}>
              {t.papers.length} {t.name}
              {i < tests.length - 2 ? ', ' : i === tests.length - 2 ? ' and ' : ''}
            </span>
          ))}
          , each with a separate answer key. Print one, sit it timed, and mark it together, or sit it on screen.
        </p>

        {w && (
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
                NAPLAN {w.year}: {formatWindow(w.start, w.end)}
              </p>
              <p className="text-sm text-gray-500">
                {inWindow ? 'The test window is open.' : `The test window opens ${dayWord(days ?? 0)}.`} Each school
                sets its own days inside the window.{' '}
                <a href={NAPLAN_SOURCE} className="underline hover:text-gray-700" rel="noopener" target="_blank">
                  Official dates
                </a>
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-10">
        <DiagnosticCta
          title={`Find out what your ${ours} child needs to practice`}
          body="A free 30-minute diagnostic in Numeracy, Reading or Language Conventions shows exactly which skills need work, then builds practice papers on them."
          year={l.yearLevel}
        />
      </section>

      {/* Per test: what it is, how long our papers run, and every paper. */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-14 flex flex-col gap-10">
          {tests.map(t => {
            const s = summarisePaper(t.papers[0])
            const sections = s.sections.length > 1 && !s.magazine ? s.sections : null
            return (
              <div key={t.subject}>
                <h2 className="text-lg font-medium tracking-tight mb-1">
                  {l.naplanName} {t.name}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-1">{t.about}</p>
                <p className="text-xs text-gray-400 mb-4">
                  Each paper: {s.questions} questions,{' '}
                  {sections
                    ? sections
                        .map(x => `${x.title.replace(/^Numeracy — /, '')} ${minutesLabel(x.minutes)}`)
                        .join(', ')
                    : minutesLabel(s.minutes)}
                  {s.magazine ? ', with its own Reading Magazine' : ''}.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {t.papers.map(e => (
                    <PaperLink key={e.id} exam={e} />
                  ))}
                </ul>
              </div>
            )
          })}
          <div>
            <h2 className="text-lg font-medium tracking-tight mb-1">{l.naplanName} Writing</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Not covered yet. Writing needs a prompt and a marking rubric rather than scored questions, and is being
              built separately.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6">Using practice papers well</h2>
        <ol className="flex flex-col gap-4 text-sm text-gray-600 list-decimal list-inside">
          <li>
            <span className="font-medium text-gray-900">Start with the free diagnostic test.</span> Sit it early to find
            out where your child is, rather than guessing.
          </li>
          <li>
            <span className="font-medium text-gray-900">Practice the gaps, not the whole test.</span> Marking a paper
            on PrepNest shows which topics lost marks and links straight to practice on those topics.
          </li>
          <li>
            <span className="font-medium text-gray-900">Save full, timed papers for the last few weeks.</span> That is
            when pacing and stamina matter most.
          </li>
          <li>
            <span className="font-medium text-gray-900">Keep it low-stakes.</span> NAPLAN is a snapshot of how a
            student is going, not a pass-or-fail test, so calm practice beats cramming.
          </li>
        </ol>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-14">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6">Questions</h2>
        <dl className="flex flex-col gap-6">
          {faqs.map(f => (
            <div key={f.q}>
              <dt className="font-medium text-gray-900 mb-1">{f.q}</dt>
              <dd className="text-sm text-gray-600 leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <p className="text-gray-500 mb-5">
            One plan unlocks every paper from Grade 3 to Year 10, every subject and every year level, from{' '}
            {FROM_PER_MONTH} a month. The first half of every paper is free to flip through.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href={`/practice/exams?year=${l.yearLevel}` as Route} className="btn-primary">
              All {ours} papers
            </Link>
            <Link href={'/pricing' as Route} className="btn-secondary">
              See pricing
            </Link>
          </div>
          <p className="text-sm text-gray-500 mb-3">Other NAPLAN years</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {others.map(o => (
              <Link
                key={o.slug}
                href={`/naplan/${o.slug}` as Route}
                className="px-3 py-1.5 rounded-full text-sm border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              >
                {o.naplanName}
              </Link>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-10 max-w-xl mx-auto">
            NAPLAN is run by the Australian Curriculum, Assessment and Reporting Authority (ACARA). PrepNest is an
            independent provider of practice material and is not affiliated with or endorsed by ACARA.
          </p>
        </div>
      </section>
    </main>
  )
}

function PaperLink({ exam }: { exam: PracticeExam }) {
  return (
    <li>
      <Link
        href={`/practice/exams/${exam.id}` as Route}
        className="card py-3 flex items-center gap-2 text-sm text-gray-700 hover:text-brand-600 hover:border-brand-200"
      >
        <FileText className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />
        {shortTitle(exam)}
      </Link>
    </li>
  )
}
