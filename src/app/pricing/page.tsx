import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import FAQAccordion from '@/components/home/FAQAccordion'
import PlanCards from '@/components/pricing/PlanCards'
import LookInside from '@/components/marketing/LookInside'
import { CalendarX, Check, LockKeyhole, ShieldCheck, X, type LucideIcon } from 'lucide-react'
import { FROM_PER_MONTH, PLANS, VCE_PAPER_PRICE, perPaper } from '@/lib/pricing'
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
  const yearPlan = PLANS.find(p => p.id === 'year') ?? PLANS[PLANS.length - 1]

  return (
    <main className="flex-1 w-full">
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-10 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">NAPLAN &amp; school years</p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
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
        <ul className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-2 text-sm text-gray-600">
          {TRUST.map(t => (
            <li key={t.text} className="flex items-center gap-2">
              <t.icon className="w-4 h-4 text-teal-600" />
              {t.text}
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 text-center mt-4">
          Prices in Australian dollars. Plans renew automatically at the same price until you cancel — cancel anytime
          from your account and keep access until the end of the period you&apos;ve paid for.
        </p>
      </section>

      {/* The value, in numbers a parent can check against the catalogue below. */}
      <section className="max-w-4xl mx-auto px-4 pt-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: String(PLAN_TOTALS.papers), label: `papers in the plan today, ${PLAN_TOTALS.range}` },
            { value: perPaper(yearPlan, PLAN_TOTALS.papers), label: 'a paper on the 12-month plan' },
            { value: 'Every child', label: 'in your family, on one plan' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl bg-brand-50/70 border border-brand-100/60 px-5 py-5 text-center">
              <p className="text-3xl font-semibold tracking-tight text-brand-800">{s.value}</p>
              <p className="text-sm text-gray-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6 text-center">
          Every plan includes
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {[
            `Every ${PLAN_TOTALS.range} paper — ${PLAN_TOTALS.papers} today across Maths, Reading, Language Conventions and Science`,
            'NAPLAN-style Numeracy, Reading and Language Conventions papers, with a colour Reading Magazine for each Reading paper',
            'A separate printable answer key for every paper, with an explanation for every answer',
            'Every child and every year level in your family, on one plan',
            'New papers as they are added, at no extra cost',
            'Mark a paper in minutes and see which topics to practice next',
            'Parent dashboard and progress tracking by topic',
            'Cancel anytime from your account — no phone calls',
          ].map(item => (
            <li key={item} className="text-sm text-gray-600 flex gap-2.5">
              <Check className="w-4 h-4 mt-0.5 text-teal-600 shrink-0" strokeWidth={2.5} />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Look inside: what the money buys, before anyone has to download. */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">Look inside</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">See what every paper looks like</h2>
            <p className="text-gray-500 leading-relaxed">
              Real pages from the free sample papers. Every paper in the plan is laid out the same way.
            </p>
          </div>
          <LookInside items={['readingCover', 'readingPage', 'numeracy', 'answerKey']} />
        </div>
      </section>

      {/* Free versus the plan, side by side, so the upgrade is a clear choice. */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight mb-2 text-center">Start free, upgrade when it&apos;s working</h2>
        <p className="text-gray-500 text-center mb-8">
          The free papers are complete papers, not cut-down previews. The plan unlocks the rest.
        </p>
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th scope="col" className="px-4 sm:px-5 py-3 font-medium text-gray-500">&nbsp;</th>
                <th scope="col" className="px-3 py-3 font-medium text-gray-700 text-center w-24 sm:w-32">Free</th>
                <th scope="col" className="px-3 py-3 font-medium text-brand-600 text-center w-28 sm:w-36">PrepNest plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { feature: 'Practice papers', free: `${PLAN_TOTALS.free} samples`, plan: `All ${PLAN_TOTALS.papers}` },
                { feature: 'New papers as they are published', free: false, plan: true },
                { feature: 'Answer key with an explanation for every answer', free: true, plan: true },
                { feature: 'Topic report after marking a paper', free: true, plan: true },
                { feature: 'On-screen topic quizzes', free: true, plan: true },
                { feature: 'Parent dashboard, with a free account', free: true, plan: true },
              ].map(row => (
                <tr key={row.feature}>
                  <th scope="row" className="px-4 sm:px-5 py-3 text-left font-normal text-gray-700">
                    {row.feature}
                  </th>
                  <td className="px-3 py-3 text-center">
                    <Cell value={row.free} />
                  </td>
                  <td className="px-3 py-3 text-center bg-brand-50/40">
                    <Cell value={row.plan} strong />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card mt-8 text-center">
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

// Each line matches the "Is paying online safe?" and cancellation FAQs.
const TRUST: { icon: LucideIcon; text: string }[] = [
  { icon: ShieldCheck, text: 'Secure checkout with Stripe' },
  { icon: LockKeyhole, text: 'We never see your card details' },
  { icon: CalendarX, text: 'Cancel anytime from your account' },
]

function Cell({ value, strong }: { value: boolean | string; strong?: boolean }) {
  if (typeof value === 'string') {
    return <span className={strong ? 'font-medium text-brand-800' : 'text-gray-600'}>{value}</span>
  }
  return value ? (
    <>
      <Check className={`w-5 h-5 mx-auto ${strong ? 'text-brand-600' : 'text-teal-600'}`} strokeWidth={2.5} />
      <span className="sr-only">Included</span>
    </>
  ) : (
    <>
      <X className="w-4 h-4 mx-auto text-gray-300" />
      <span className="sr-only">Not included</span>
    </>
  )
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Melbourne' }).format(
    new Date(iso)
  )
}
