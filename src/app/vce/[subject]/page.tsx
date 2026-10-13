import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import { notFound } from 'next/navigation'
import { ChevronRight, FileText } from 'lucide-react'
import type { PracticeExam } from '@/lib/questions/exams'
import { VCE_PAPER_PRICE } from '@/lib/pricing'
import { shortTitle } from '@/lib/catalogue'
import { dayWord, formatLongDate } from '@/lib/examDates'
import {
  VCE_LANDINGS,
  VCE_SOURCE,
  breadcrumbLd,
  faqLd,
  paperListLd,
  paperShapes,
  papersFor,
  shapeSentence,
  topicsOf,
  upcomingExamsFor,
  vceFaqs,
  vceLanding,
} from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import DiagnosticCta from '@/components/diagnostic/DiagnosticCta'
import SubjectIcon from '@/components/ui/SubjectIcon'

export const dynamicParams = false
// The countdown is computed at request time; an hour's staleness is fine for a
// number of days.
export const revalidate = 3600

export function generateStaticParams() {
  return VCE_LANDINGS.map(l => ({ subject: l.slug }))
}

const SHARE_IMAGE = {
  url: '/vce/opengraph-image.jpg',
  width: 1200,
  height: 630,
  alt: 'PrepNest VCE practice exam: a Mathematical Methods Examination 1 page and its marking guide',
}

export function generateMetadata({ params }: { params: { subject: string } }): Metadata {
  const l = vceLanding(params.subject)
  if (!l) return {}
  const u34 = papersFor(l.subject, 'year_12').length
  const u12 = papersFor(l.subject, 'year_11').length
  // The exam year only while that year's exams are still to come.
  const examYear = u34 > 0 ? upcomingExamsFor(l.subject)[0]?.date.slice(0, 4) : undefined
  const title =
    u34 > 0
      ? `VCE ${l.name} practice exams${examYear ? ` ${examYear}` : ''} — Unit 3 & 4 — PrepNest`
      : `VCE ${l.name} practice exams — Unit 1 & 2 — PrepNest`
  const description =
    u34 > 0
      ? `${u34} VCE ${l.name} Unit 3 & 4 practice exams in the VCAA format, each with a marking guide and worked solutions${examYear ? `, plus the ${examYear} exam dates` : ''}. ${VCE_PAPER_PRICE} a paper; flip through the first half free.`
      : `${u12} VCE ${l.name} Unit 1 & 2 practice exams with marking guides and worked solutions. ${VCE_PAPER_PRICE} a paper; flip through the first half free.`
  const path = `/vce/${l.slug}`
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
 * One VCE subject: the page a student lands on from "vce methods practice
 * exam". Everything on it comes from the catalogue and the exam dates, so the
 * paper counts, the exam format and the dates cannot drift from what is sold.
 */
export default function VceSubjectPage({ params }: { params: { subject: string } }) {
  const l = vceLanding(params.subject)
  if (!l) notFound()

  const u34 = papersFor(l.subject, 'year_12')
  const u12 = papersFor(l.subject, 'year_11')
  // The written exam is Unit 3 & 4, so its countdown only belongs on a page
  // that sells Unit 3 & 4 papers. Chemistry has Unit 1 & 2 papers so far.
  const upcoming = u34.length > 0 ? upcomingExamsFor(l.subject) : []
  const shapes = paperShapes(u34.length > 0 ? u34 : u12)
  const topics = topicsOf(l.topics)
  const faqs = vceFaqs(l)
  const first = upcoming[0]
  const path = `/vce/${l.slug}`
  const others = VCE_LANDINGS.filter(o => o.slug !== l.slug)

  return (
    <main className="flex-1 w-full">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: 'VCE', path: '/vce' },
            { name: l.name, path },
          ]),
          paperListLd(`VCE ${l.name} practice exams`, [...u34, ...u12]),
          faqLd(faqs),
        ]}
      />

      <section className="max-w-3xl mx-auto px-4 pt-10 pb-10">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-400 mb-4 flex items-center gap-1">
          <Link href="/vce" className="hover:text-gray-600 hover:underline">
            VCE
          </Link>
          <ChevronRight className="w-3 h-3" aria-hidden />
          <span className="text-gray-500">{l.name}</span>
        </nav>
        <div className="flex items-center gap-3 mb-4">
          <SubjectIcon subject={l.subject} />
          <p className="text-xs font-medium uppercase tracking-widest text-brand-600">
            VCE {u34.length > 0 ? 'Units 3 & 4' : 'Units 1 & 2'}
          </p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">VCE {l.name} practice exams</h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-8">
          {u34.length > 0 ? (
            <>
              {u34.length} Unit 3 & 4 practice exams laid out like the VCAA papers, with reading time, sections and the
              same mix of questions, each with a separate marking guide and worked solutions.
              {u12.length > 0 && <> Plus {u12.length} Unit 1 & 2 papers for Year 11.</>}
            </>
          ) : (
            <>
              {u12.length} Unit 1 & 2 practice exams for Year 11, each with a separate marking guide and worked
              solutions. Unit 3 & 4 papers are on the way.
            </>
          )}
        </p>

        {first && (
          <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="sm:w-32 shrink-0">
              {first.days > 0 ? (
                <>
                  <p className="text-3xl font-medium tracking-tight text-brand-600">{first.days}</p>
                  <p className="text-xs text-gray-400">{first.days === 1 ? 'day to go' : 'days to go'}</p>
                </>
              ) : (
                <p className="text-lg font-medium text-brand-600">Today</p>
              )}
            </div>
            <div className="flex-1">
              <ul className="flex flex-col gap-1">
                {upcoming.map(e => (
                  <li key={e.label} className="text-sm">
                    <span className="font-medium">{e.label.replace(`${l.name} — `, '')}</span>{' '}
                    <span className="text-gray-500">
                      {formatLongDate(e.date)}, {e.time} ({dayWord(e.days)})
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 mt-2">
                Melbourne time.{' '}
                <a href={VCE_SOURCE} className="underline hover:text-gray-600" rel="noopener" target="_blank">
                  Official VCAA timetable
                </a>
              </p>
            </div>
          </div>
        )}
      </section>

      {/* The format, read off the papers themselves. */}
      {shapes.length > 0 && (
        <section className="bg-gray-50 border-y border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-14">
            <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6">
              What each practice exam looks like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shapes.map(s => (
                <div key={s.kind} className="card">
                  <p className="font-medium text-sm mb-1">{s.kind}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{shapeSentence(s)}</p>
                </div>
              ))}
            </div>
            {topics.length > 0 && (
              <>
                <h3 className="text-sm font-medium mt-10 mb-3">Areas of study covered</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {topics.map(t => (
                    <li key={t.slug} className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">{t.label}</span> — {t.description}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      )}

      <section className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6">The papers</h2>
        {u34.length > 0 && <PaperList title="Unit 3 & 4 · Year 12" papers={u34} />}
        {u12.length > 0 && <PaperList title="Unit 1 & 2 · Year 11" papers={u12} />}
        <p className="text-sm text-gray-500 mt-6">
          Every paper is {VCE_PAPER_PRICE}, purchased once and yours to keep. Open any paper to flip through its first
          half free, then sit it on screen or print it.
        </p>
      </section>

      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6">
            Using practice exams in the last weeks
          </h2>
          <ol className="flex flex-col gap-4 text-sm text-gray-600 list-decimal list-inside">
            <li>
              <span className="font-medium text-gray-900">Sit a full paper under exam conditions early.</span> Include
              the {shapes[0]?.readingMinutes ?? 15} minutes of reading time and stop when time is up. The point is to
              find where marks go, not to get a good score.
            </li>
            <li>
              <span className="font-medium text-gray-900">Mark it strictly against the marking guide.</span> Write down
              every lost mark next to its area of study. Patterns show up after two papers.
            </li>
            <li>
              <span className="font-medium text-gray-900">Redo what you lost, a few days later.</span> Without looking
              at the solution. A question you can only follow is not yet a question you can do.
            </li>
            <li>
              <span className="font-medium text-gray-900">Practice with exactly what you will take in.</span> The same
              calculator and the same notes you are allowed in the exam, so nothing is new on the day.
            </li>
            <li>
              <span className="font-medium text-gray-900">Use the VCAA past papers and examination reports too.</span>{' '}
              They are free on the{' '}
              <a href="https://www.vcaa.vic.edu.au" className="underline" rel="noopener" target="_blank">
                VCAA website
              </a>
              , and the reports say where students lost marks. PrepNest papers add fresh questions in the same format.
            </li>
          </ol>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-14">
        <DiagnosticCta
          title={`Not sure which areas of ${l.shortName} to work on?`}
          body={`The free diagnostic reports each area of study, then builds practice papers on the weakest, ${VCE_PAPER_PRICE} each like any VCE paper.`}
          year={u34.length > 0 ? 'year_12' : 'year_11'}
        />
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
          <p className="text-sm text-gray-500 mb-4">Other VCE subjects</p>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {others.map(o => (
              <Link
                key={o.slug}
                href={`/vce/${o.slug}` as Route}
                className="px-3 py-1.5 rounded-full text-sm border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              >
                {o.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/practice/exams?year=${u34.length > 0 ? 'year_12' : 'year_11'}` as Route} className="btn-primary">
              Browse every {u34.length > 0 ? 'Year 12' : 'Year 11'} paper
            </Link>
            <Link href="/vce" className="btn-secondary">
              VCE exam timetable
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

function PaperList({ title, papers }: { title: string; papers: PracticeExam[] }) {
  return (
    <div className="mb-6 last:mb-0">
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">{title}</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {papers.map(e => (
          <li key={e.id}>
            <Link
              href={`/practice/exams/${e.id}` as Route}
              className="card py-3 flex items-center gap-2 text-sm text-gray-700 hover:text-brand-600 hover:border-brand-200"
            >
              {/* No padlock: this page does not read entitlements, and a lock
                  shown to someone who has already paid reads as a failed purchase. */}
              <FileText className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />
              {shortTitle(e)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
