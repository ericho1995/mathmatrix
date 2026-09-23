import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import { Hammer } from 'lucide-react'
import { releasesIn } from '@/lib/catalogue'
import { ROADMAP, formatReleaseDate } from '@/lib/releases'
import { isVceYear } from '@/lib/pricing'
import { CATALOGUE_TOTALS, PLAN_TOTALS } from '@/lib/catalogue'
import { VCE_PAPER_PRICE } from '@/lib/pricing'

export const metadata: Metadata = {
  title: "What's new — papers added to PrepNest",
  description: `Every paper added to PrepNest, with dates, and what is being written next. ${CATALOGUE_TOTALS.papers} papers today; new ones are included in every plan.`,
}

/**
 * The changelog. A parent weighing up a subscription wants to know one thing
 * beyond the price: will there be more? This page answers with dates and paper
 * titles rather than a promise.
 */
export default function WhatsNewPage() {
  const releases = releasesIn('all')

  return (
    <main className="flex-1 w-full">
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">What&apos;s new</p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">Papers added to PrepNest</h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          New papers are published throughout the year. Every {PLAN_TOTALS.range} paper is included in a plan at no
          extra cost the day it is added, and VCE papers are {VCE_PAPER_PRICE} each.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12">
        <ol className="flex flex-col gap-8">
          {releases.map(({ release, papers }) => (
            <li key={release.title} className="relative pl-6 border-l-2 border-teal-100">
              <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-teal-400 ring-4 ring-white" aria-hidden />
              <p className="text-sm text-gray-400">{formatReleaseDate(release.date)}</p>
              <h2 className="text-lg font-semibold tracking-tight mt-0.5">{release.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mt-1 mb-3">{release.detail}</p>
              <ul className="flex flex-wrap gap-2">
                {papers.map(exam => (
                  <li key={exam.id}>
                    <Link
                      href={`/practice/exams/${exam.id}` as Route}
                      className="inline-block rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:border-brand-400 hover:text-brand-600"
                    >
                      {exam.title}
                      {!exam.premium && <span className="text-teal-600"> · Free</span>}
                      {exam.premium && isVceYear(exam.yearLevel) && <span className="text-gray-400"> · {VCE_PAPER_PRICE}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight mb-2">
            <Hammer className="w-5 h-5 text-brand-600" aria-hidden />
            Being written now
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            What is in progress. Each lands here, with its date, when it is published.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROADMAP.map(item => (
              <li key={item.title} className="card">
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1">{item.audience}</p>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-sm text-gray-500 mt-1">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-14 text-center">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/practice/exams" className="btn-primary">
            Browse all {CATALOGUE_TOTALS.papers} papers
          </Link>
          <Link href={'/pricing' as Route} className="btn-secondary">
            See plans
          </Link>
        </div>
      </section>
    </main>
  )
}
