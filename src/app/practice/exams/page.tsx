import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import type { PracticeExam } from '@/lib/questions/exams'
import PurchaseBanner from '@/components/practice/PurchaseBanner'
import ScrollActiveIntoView from '@/components/practice/ScrollActiveIntoView'
import YearPicker from '@/components/catalogue/YearPicker'
import YearSection from '@/components/catalogue/YearSection'
import { FROM_PER_MONTH, PLANS, VCE_PAPER_PRICE } from '@/lib/pricing'
import { canOpen, getAccess } from '@/lib/auth/access'
import { isPlanSellable } from '@/lib/stripe'
import { CATALOGUE_TOTALS, PLAN_TOTALS, YEAR_LEVEL_STATS, isYearLevel, type YearLevelStats } from '@/lib/catalogue'
import type { YearLevel } from '@/types'

export const metadata: Metadata = {
  title: 'Printable practice exam papers — PrepNest',
  description: `${CATALOGUE_TOTALS.papers} printable practice exams with separate answer keys, ${CATALOGUE_TOTALS.lowest} to ${CATALOGUE_TOTALS.highest}. ${CATALOGUE_TOTALS.free} are free to download.`,
}

/**
 * The catalogue, grouped by year level.
 *
 * It used to be grouped subject-first, but parents think in year levels ("my
 * son is in Year 5"). Grouped by subject,
 * a parent had to assemble their child's view by scrolling across three
 * sections, and the thing a purchase unlocks was never shown together in one
 * place. `?year=` narrows to one level, which is what the NAPLAN, VCE and
 * pricing pages link to.
 *
 * Each paper is drawn as a page tile (src/components/catalogue), so the size
 * of the library is visible at a glance rather than read from a list of titles.
 */
export default async function ExamsPage({
  searchParams,
}: {
  searchParams?: { subscribed?: string; year?: string }
}) {
  // What this visitor can already download — the same rule the exam page and
  // the PDF routes use. Admins see everything unlocked so the catalogue stays
  // inspectable in production.
  const access = await getAccess()
  const unlocked = (exam: PracticeExam) => canOpen(exam, access)
  const yearUnlocked = (s: YearLevelStats) => s.exams.every(unlocked)
  const owned = new Set<YearLevel>(YEAR_LEVEL_STATS.filter(yearUnlocked).map(s => s.yearLevel))
  const plansOpen = PLANS.some(p => isPlanSellable(p.id))

  // Stripe's success_url for a plan comes back here. Only a signed-in visitor
  // can have paid, so anyone else who typed the parameter sees nothing.
  const subscribed = access.signedIn && searchParams?.subscribed === '1'

  const yearParam = searchParams?.year
  const selected = isYearLevel(yearParam) ? yearParam : null
  const visible = selected ? YEAR_LEVEL_STATS.filter(s => s.yearLevel === selected) : YEAR_LEVEL_STATS

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 flex-1 w-full">
      <h1 className="text-3xl font-semibold tracking-tight mb-1">Exam papers</h1>
      <p className="text-gray-500 mb-5">
        Printable practice exams, each with a separate answer key. Print it, sit it, mark it.
      </p>

      {subscribed && <PurchaseBanner kind="plan" settled={access.admin || Boolean(access.plan)} />}

      {/* The pricing sentence a visitor reads before anything else — it must
          match what checkout actually sells. */}
      <p className="text-sm text-gray-500 mb-8">
        Every {PLAN_TOTALS.range} paper is included in a PrepNest plan, from{' '}
        <span className="font-medium text-gray-700">{FROM_PER_MONTH} a month</span>. VCE papers are{' '}
        {VCE_PAPER_PRICE} each, and a two-exam set counts as one. {CATALOGUE_TOTALS.free} sample papers are free, so
        you can see exactly what you are getting first.{' '}
        <Link href={'/pricing' as Route} className="underline hover:text-gray-700">
          How pricing works
        </Link>
      </p>

      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-900">Choose a year level</h2>
        {selected && (
          <Link href="/practice/exams" className="text-sm text-brand-600 hover:underline">
            Show all years
          </Link>
        )}
      </div>
      {/* Scrolls sideways on a phone rather than stacking three rows of tiles. */}
      <ScrollActiveIntoView label="Year level" className="-mx-4 px-4 pb-1 mb-10 overflow-x-auto sm:overflow-visible">
        <YearPicker
          items={YEAR_LEVEL_STATS.map(s => ({
            yearLevel: s.yearLevel,
            sub: `${s.papers} ${s.papers === 1 ? 'paper' : 'papers'}`,
            done: owned.has(s.yearLevel),
          }))}
          selected={selected}
          hrefFor={y => `/practice/exams?year=${y}`}
        />
      </ScrollActiveIntoView>

      <div className="flex flex-col gap-6">
        {visible.map(stats => (
          <YearSection
            key={stats.yearLevel}
            stats={stats}
            owned={owned.has(stats.yearLevel)}
            plansOpen={plansOpen}
            unlocked={unlocked}
            focused={Boolean(selected)}
          />
        ))}
      </div>
    </main>
  )
}
