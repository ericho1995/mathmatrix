import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import type { PracticeExam } from '@/lib/questions/exams'
import PracticeModeTabs from '@/components/practice/PracticeModeTabs'
import PurchaseBanner from '@/components/practice/PurchaseBanner'
import BuyBundleButton from '@/components/practice/BuyBundleButton'
import ScrollActiveIntoView from '@/components/practice/ScrollActiveIntoView'
import { BUNDLE_PRICE } from '@/lib/pricing'
import { listEntitledYearLevels } from '@/lib/auth/getEntitlements'
import { getUserRole } from '@/lib/auth/getUserRole'
import { createClient } from '@/lib/supabase/server'
import { isYearLevelSellable } from '@/lib/stripe'
import {
  CATALOGUE_TOTALS,
  YEAR_LEVEL_STATS,
  isYearLevel,
  shortTitle,
  subjectIcon,
  subjectLabel,
  yearLabel,
  type YearLevelStats,
} from '@/lib/catalogue'
import type { YearLevel } from '@/types'

export const metadata: Metadata = {
  title: 'Printable practice exam papers — PrepNest',
  description: `${CATALOGUE_TOTALS.papers} printable practice exams with separate answer keys, ${CATALOGUE_TOTALS.lowest} to ${CATALOGUE_TOTALS.highest}. ${CATALOGUE_TOTALS.free} are free to download.`,
}

/**
 * The catalogue, grouped by year level.
 *
 * It used to be grouped subject-first, but the product is sold per year level
 * and parents think in year levels ("my son is in Year 5"). Grouped by subject,
 * a parent had to assemble their child's view by scrolling across three
 * sections, and the thing a purchase unlocks was never shown together in one
 * place. `?year=` narrows to one level, which is what the NAPLAN, VCE and
 * pricing pages link to.
 */
export default async function ExamsPage({
  searchParams,
}: {
  searchParams?: { purchased?: string; year?: string }
}) {
  // What this visitor can already download. Admins see everything unlocked so
  // the catalogue stays inspectable in production, matching the exam detail
  // page and the PDF routes — all three decide access the same way.
  const [entitled, role, { data: auth }] = await Promise.all([
    listEntitledYearLevels(),
    getUserRole(),
    createClient().auth.getUser(),
  ])
  const owned = new Set<YearLevel>(entitled)
  const isAdmin = role === 'admin'
  const signedIn = Boolean(auth.user)

  const unlocked = (exam: PracticeExam) => !exam.premium || isAdmin || owned.has(exam.yearLevel)

  // Stripe's success_url comes back here. Validated against the real year
  // levels rather than rendering whatever is in the query string, and only for
  // a signed-in visitor — checkout requires an account, so anyone else reached
  // this by typing the parameter and should not be told a payment succeeded.
  const purchasedParam = searchParams?.purchased
  const purchased = signedIn && isYearLevel(purchasedParam) ? purchasedParam : null

  const yearParam = searchParams?.year
  const selected = isYearLevel(yearParam) ? yearParam : null
  const visible = selected ? YEAR_LEVEL_STATS.filter(s => s.yearLevel === selected) : YEAR_LEVEL_STATS

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Exam papers</h1>
      <p className="text-gray-500 mb-6">
        Printable practice exams, each with a separate answer key. Print it, sit it, mark it.
      </p>

      {purchased && (
        <PurchaseBanner yearLabel={yearLabel(purchased)} settled={isAdmin || owned.has(purchased)} />
      )}

      <PracticeModeTabs />

      {/* The pricing sentence a visitor reads before anything else. It said
          "{price} each" while the product is a whole-year-level bundle and a
          third of these papers are free — the storefront contradicting the
          checkout. */}
      <p className="text-sm text-gray-500 mb-6">
        One payment of <span className="font-medium text-gray-700">{BUNDLE_PRICE}</span> unlocks every paper for a
        year level. {CATALOGUE_TOTALS.free} sample papers are free, so you can see exactly what you are buying first.{' '}
        <Link href={'/pricing' as Route} className="underline hover:text-gray-700">
          How pricing works
        </Link>
      </p>

      <YearChips selected={selected} owned={owned} />

      <div className="flex flex-col gap-8">
        {visible.map(stats => (
          <YearSection
            key={stats.yearLevel}
            stats={stats}
            owned={isAdmin || owned.has(stats.yearLevel)}
            sellable={isYearLevelSellable(stats.yearLevel)}
            unlocked={unlocked}
            focused={Boolean(selected)}
          />
        ))}
      </div>
    </main>
  )
}

function YearChips({ selected, owned }: { selected: YearLevel | null; owned: Set<YearLevel> }) {
  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
      active ? 'bg-brand-600 border-brand-600 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'
    }`
  return (
    // Scrolls sideways on a phone rather than wrapping into four rows.
    <ScrollActiveIntoView label="Year level" className="-mx-4 px-4 mb-8 overflow-x-auto">
      <div className="flex gap-2 w-max">
        <Link href="/practice/exams" className={chip(!selected)} aria-current={!selected ? 'page' : undefined}>
          All years
        </Link>
        {YEAR_LEVEL_STATS.map(s => (
          <Link
            key={s.yearLevel}
            href={`/practice/exams?year=${s.yearLevel}` as Route}
            className={chip(selected === s.yearLevel)}
            aria-current={selected === s.yearLevel ? 'page' : undefined}
          >
            {s.shortLabel}
            {owned.has(s.yearLevel) && <span aria-label="unlocked"> ✓</span>}
          </Link>
        ))}
      </div>
    </ScrollActiveIntoView>
  )
}

function YearSection({
  stats,
  owned,
  sellable,
  unlocked,
  focused,
}: {
  stats: YearLevelStats
  owned: boolean
  sellable: boolean
  unlocked: (exam: PracticeExam) => boolean
  focused: boolean
}) {
  const bySubject = stats.subjects.map(subject => ({
    subject,
    exams: stats.exams.filter(e => e.subject === subject),
  }))
  const locked = stats.exams.filter(e => !unlocked(e)).length

  return (
    <section aria-labelledby={`year-${stats.yearLevel}`}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div>
          <h2 id={`year-${stats.yearLevel}`} className="text-lg font-medium tracking-tight">
            {focused ? (
              stats.label
            ) : (
              <Link href={`/practice/exams?year=${stats.yearLevel}` as Route} className="hover:text-brand-600">
                {stats.label}
              </Link>
            )}
          </h2>
          <p className="text-xs text-gray-400">
            {stats.papers} papers · {stats.free} free · {stats.subjects.map(subjectLabel).join(', ')}
          </p>
        </div>
        <div className="sm:w-64">
          {owned ? (
            <p className="text-sm text-teal-600 sm:text-right">✓ Every {stats.label} paper is unlocked</p>
          ) : locked > 0 ? (
            <BuyBundleButton
              yearLevel={stats.yearLevel}
              yearLabel={stats.label}
              sellable={sellable}
              variant={focused ? 'primary' : 'secondary'}
            />
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bySubject.map(({ subject, exams }) => (
          <div key={subject} className="card">
            <p className="font-medium text-sm mb-3 flex items-center gap-2">
              <span aria-hidden>{subjectIcon(subject)}</span> {subjectLabel(subject)}
            </p>
            <ul className="flex flex-col gap-2">
              {exams.map(exam => {
                const open = unlocked(exam)
                return (
                  <li key={exam.id}>
                    <Link
                      href={`/practice/exams/${exam.id}` as Route}
                      className="text-sm text-gray-700 hover:text-brand-600 hover:underline flex items-center gap-1.5"
                    >
                      <span aria-hidden>{open ? '📄' : '🔒'}</span>
                      {shortTitle(exam)}
                      {!exam.premium && <span className="text-xs text-teal-600">Free</span>}
                      {exam.premium && open && <span className="text-xs text-teal-600">Unlocked</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
