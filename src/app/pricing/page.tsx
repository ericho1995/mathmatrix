import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import BuyBundleButton from '@/components/practice/BuyBundleButton'
import FAQAccordion from '@/components/home/FAQAccordion'
import { BUNDLE_PRICE } from '@/lib/pricing'
import { CATALOGUE_TOTALS, YEAR_LEVEL_STATS, subjectLabel } from '@/lib/catalogue'
import { isYearLevelSellable } from '@/lib/stripe'
import { listEntitledYearLevels } from '@/lib/auth/getEntitlements'
import { faqsIn } from '@/lib/faqs'

export const metadata: Metadata = {
  title: `Pricing — ${BUNDLE_PRICE} per year level — PrepNest`,
  description: `One payment of ${BUNDLE_PRICE} unlocks every practice exam paper for a year level, each with a separate answer key. ${CATALOGUE_TOTALS.free} sample papers are free. No subscription.`,
}

/**
 * The page a parent looks for before spending money.
 *
 * Every number is derived from the catalogue at render time — how many papers a
 * year level has, how many are free — so the page cannot quietly overstate what
 * $29 buys. Pricing pages that promise a library and deliver a handful are how
 * a one-off purchase turns into a refund request.
 */
export default async function PricingPage() {
  const owned = new Set(await listEntitledYearLevels())

  return (
    <main className="flex-1 w-full">
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-3">One price per year level</h1>
        <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto">
          {BUNDLE_PRICE} once unlocks every paper for your child&apos;s year level, across every subject at that
          level — each with a printable exam and a separate answer key. No subscription.
        </p>
      </section>

      {/* Free vs paid, side by side — the comparison every competitor leads with,
          because it answers "what do I get without paying?" first. */}
      <section className="max-w-3xl mx-auto px-4 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Plan
            name="Free"
            price="$0"
            note="No card, no account needed to start"
            items={[
              'One sample paper per subject at every year level',
              'The answer key for every free paper',
              'Mark a paper and see which topics need work',
              'On-screen practice quizzes on any topic, with an explanation for every answer',
              'Parent dashboard and weekly leaderboard with a free account',
            ]}
            cta={
              <Link href="/practice/exams" className="btn-secondary w-full block text-center">
                Download a free paper
              </Link>
            }
          />
          <Plan
            name="Year-level bundle"
            price={BUNDLE_PRICE}
            note="Once, per year level"
            highlighted
            items={[
              'Everything in Free',
              'Every paper for that year level, across all its subjects',
              'A separate answer key for every paper',
              'Mark every paper and track topics over time',
              'Secure checkout by Stripe — no subscription to cancel',
            ]}
            cta={
              <Link href="/practice/exams" className="btn-primary w-full block text-center">
                Choose a year level
              </Link>
            }
          />
        </div>
      </section>

      {/* What each year level actually contains. */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2 text-center">
            What each year level includes
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8">
            {CATALOGUE_TOTALS.papers} papers in total. Counts are live from the catalogue.
          </p>
          <div className="flex flex-col gap-3">
            {YEAR_LEVEL_STATS.map(s => (
              <div
                key={s.yearLevel}
                className="card flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
              >
                <div className="sm:w-28 shrink-0">
                  <Link
                    href={`/practice/exams?year=${s.yearLevel}` as Route}
                    className="font-medium hover:text-brand-600"
                  >
                    {s.label}
                  </Link>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    {s.papers} papers <span className="text-gray-400">· {s.free} free</span>
                  </p>
                  <p className="text-xs text-gray-400 truncate">{s.subjects.map(subjectLabel).join(', ')}</p>
                </div>
                <div className="sm:w-60 shrink-0">
                  {owned.has(s.yearLevel) ? (
                    <p className="text-sm text-teal-600">✓ You own this year level</p>
                  ) : (
                    <BuyBundleButton
                      yearLevel={s.yearLevel}
                      yearLabel={s.label}
                      sellable={isYearLevelSellable(s.yearLevel)}
                      variant="secondary"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6 text-center">
          Questions about buying
        </h2>
        <FAQAccordion items={faqsIn('buying')} />
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

function Plan({
  name,
  price,
  note,
  items,
  cta,
  highlighted = false,
}: {
  name: string
  price: string
  note: string
  items: string[]
  cta: React.ReactNode
  highlighted?: boolean
}) {
  return (
    <div className={`card flex flex-col ${highlighted ? 'border-brand-400 ring-1 ring-brand-400' : ''}`}>
      <p className="text-sm font-medium text-gray-500">{name}</p>
      <p className="text-3xl font-medium tracking-tight mt-1">{price}</p>
      <p className="text-xs text-gray-400 mb-5">{note}</p>
      <ul className="flex flex-col gap-2.5 mb-6 flex-1">
        {items.map(item => (
          <li key={item} className="text-sm text-gray-600 flex gap-2">
            <span className="text-teal-600 shrink-0" aria-hidden>
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
      {cta}
    </div>
  )
}
