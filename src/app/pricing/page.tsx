import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import FAQAccordion from '@/components/home/FAQAccordion'
import PlanCards from '@/components/pricing/PlanCards'
import { FROM_PER_MONTH, VCE_PAPER_PRICE } from '@/lib/pricing'
import { CATALOGUE_TOTALS, PLAN_STATS, PLAN_TOTALS, VCE_STATS, VCE_TOTALS, subjectLabel } from '@/lib/catalogue'
import { getAccess } from '@/lib/auth/access'
import { faqsIn } from '@/lib/faqs'

export const metadata: Metadata = {
  title: `Pricing — unlimited practice papers from ${FROM_PER_MONTH} a month — PrepNest`,
  description: `One plan unlocks every ${PLAN_TOTALS.range} practice paper, NAPLAN and school years, with answer keys. From ${FROM_PER_MONTH} a month; cancel anytime. VCE papers ${VCE_PAPER_PRICE} each. ${CATALOGUE_TOTALS.free} papers are free.`,
}

/**
 * The page a parent looks for before spending money.
 *
 * Every number is derived at render time — prices and savings from
 * lib/pricing, paper counts from the catalogue — so the page cannot quietly
 * overstate what a plan includes. Pricing pages that promise a library and
 * deliver a handful are how a first customer becomes a lost one.
 */
export default async function PricingPage() {
  const access = await getAccess()
  const current = access.plan

  return (
    <main className="flex-1 w-full">
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-10 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">NAPLAN &amp; school years</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-3">
          Unlimited practice papers, {PLAN_TOTALS.range}
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto">
          One plan unlocks every NAPLAN and school-year paper, for every child in your family, each with a printable
          answer key. New papers are added throughout the year at no extra cost. Cancel anytime.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-6">
        {current && (
          <div className="card mb-6 border-teal-200 bg-teal-50 text-center">
            <p className="text-sm text-teal-900">
              You&apos;re on the <span className="font-medium">{current.plan?.name ?? 'PrepNest'} plan</span>.{' '}
              {current.cancelAtPeriodEnd ? 'It ends' : 'It renews'} on {formatDate(current.periodEnd)}.{' '}
              <Link href={'/account' as Route} className="underline">
                Manage it in your account
              </Link>
            </p>
          </div>
        )}
        <PlanCards current={current} />
        <p className="text-xs text-gray-400 text-center mt-6">
          Prices in Australian dollars. Plans renew automatically at the same price until you cancel — cancel anytime
          from your account and keep access until the end of the period you&apos;ve paid for.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6 text-center">
          Every plan includes
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {[
            `Every ${PLAN_TOTALS.range} paper — ${PLAN_TOTALS.papers} today across Maths, English and Science`,
            'NAPLAN-style Numeracy, Reading and Language Conventions papers',
            'A separate printable answer key for every paper',
            'Every child and every year level in your family, on one plan',
            'New papers as they are added, at no extra cost',
            'Mark a paper in minutes and see which topics to practice next',
            'Parent dashboard and progress tracking by topic',
            'Cancel anytime from your account — no phone calls',
          ].map(item => (
            <li key={item} className="text-sm text-gray-600 flex gap-2">
              <span className="text-teal-600 shrink-0" aria-hidden>
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
        <div className="card mt-10 text-center">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Not sure yet?</span> {CATALOGUE_TOTALS.free} papers are free — one per
            subject at every year level, answer key included. No card needed.
          </p>
          <Link href="/practice/exams" className="btn-secondary inline-block mt-4 text-sm">
            Download a free paper
          </Link>
        </div>
      </section>

      {/* VCE is sold differently, so it gets its own block rather than a fourth card. */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-2">VCE · Year 11 &amp; 12</p>
              <h2 className="text-2xl font-medium tracking-tight mb-2">{VCE_PAPER_PRICE} per paper, yours to keep</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                VCE papers are purchased one at a time, so a senior student pays only for the subjects they sit. Each is
                laid out like a VCAA exam, with reading time and a full answer key. {VCE_TOTALS.papers} papers today,{' '}
                {VCE_TOTALS.free} of them free samples, and more on the way.
              </p>
            </div>
            <div className="sm:w-48 shrink-0 flex flex-col gap-2">
              <Link href={'/vce' as Route} className="btn-primary text-center text-sm">
                See VCE papers
              </Link>
            </div>
          </div>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {VCE_STATS.map(s => (
              <li key={s.yearLevel} className="text-sm text-gray-600">
                <Link href={`/practice/exams?year=${s.yearLevel}` as Route} className="font-medium hover:text-brand-600">
                  {s.label}
                </Link>{' '}
                <span className="text-gray-400">
                  · {s.papers} papers · {s.subjects.map(subjectLabel).join(', ')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What the plan covers today, year by year. Counts are live. */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2 text-center">
          What the plan covers today
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Counts are live from the catalogue. New papers join your plan automatically as they are published.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PLAN_STATS.map(s => (
            <Link
              key={s.yearLevel}
              href={`/practice/exams?year=${s.yearLevel}` as Route}
              className="card text-center hover:border-brand-400"
            >
              <p className="font-medium text-sm">{s.label}</p>
              <p className="text-xs text-gray-400 mt-1">
                {s.papers} papers · {s.free} free
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-14">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6 text-center">
          Questions about plans and billing
        </h2>
        <FAQAccordion items={faqsIn('purchasing')} />
        <p className="text-sm text-gray-500 text-center mt-8">
          Something else?{' '}
          <Link href={'/help' as Route} className="text-brand-600 underline">
            Visit the help centre
          </Link>
        </p>
      </section>
    </main>
  )
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Melbourne' }).format(
    new Date(iso)
  )
}
