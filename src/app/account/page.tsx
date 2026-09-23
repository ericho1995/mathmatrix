import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/logError'
import { GRADES } from '@/lib/curriculum'
import { statsFor, subjectLabel, yearLabel, isYearLevel } from '@/lib/catalogue'
import { SUPPORT_EMAIL } from '@/lib/site'
import { getAccess } from '@/lib/auth/access'
import { FROM_PER_MONTH } from '@/lib/pricing'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { PLAN_TOTALS, releasesIn } from '@/lib/catalogue'
import { ROADMAP, formatReleaseDate } from '@/lib/releases'
import type { YearLevel } from '@/types'

export const metadata: Metadata = {
  title: 'Your account — PrepNest',
  robots: { index: false },
}

/**
 * Where a customer checks what they paid for.
 *
 * Before this page existed there was nowhere on the site that listed a
 * purchase. Someone who bought Year 5 in March and came back in May had to
 * remember which year level they bought, find it in the catalogue, and infer
 * from missing padlocks that it had worked.
 */
export default async function AccountPage({ searchParams }: { searchParams?: { billing?: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/account')

  const [{ data: profile, error: profileError }, { data: rows, error: entitlementsError }, access] = await Promise.all([
    supabase.from('profiles').select('full_name, role').eq('id', user.id).single(),
    supabase.from('entitlements').select('year_level, created_at').eq('user_id', user.id).order('created_at'),
    getAccess(),
  ])
  queryFailed('account.profile', profileError, { userId: user.id })
  // Kept distinct from "you have bought nothing": telling a paying customer
  // they own nothing because a read failed is the one message on this page
  // that must never be wrong.
  const purchasesFailed = queryFailed('account.entitlements', entitlementsError, { userId: user.id }) || access.failed
  const plan = access.plan
  const vcePapers = PRACTICE_EXAMS.filter(e => access.papers.has(e.id))
  const billingNotice =
    searchParams?.billing === 'none'
      ? 'There is no subscription on this account to manage.'
      : searchParams?.billing === 'unavailable'
        ? 'Billing management is unavailable right now — please try again shortly, or email us.'
        : null

  const role = (profile?.role as 'student' | 'parent' | 'admin' | undefined) ?? 'student'

  let studentYear: YearLevel | null = null
  if (role === 'student') {
    const { data: sp, error } = await supabase.from('student_profiles').select('year_level').eq('id', user.id).single()
    queryFailed('account.studentProfile', error, { userId: user.id })
    const level = sp?.year_level
    studentYear = isYearLevel(level) ? level : null
  }

  const purchases = (rows ?? [])
    .filter(r => isYearLevel(r.year_level))
    .map(r => ({ yearLevel: r.year_level as YearLevel, boughtOn: r.created_at as string }))

  const roleLabel = role === 'parent' ? 'Parent' : role === 'admin' ? 'Admin' : 'Student'

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 flex-1 w-full">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Your account</h1>
      <p className="text-gray-500 mb-8">{profile?.full_name || user.email}</p>

      <section className="card mb-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">Details</h2>
        <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
          <dt className="text-gray-400">Email</dt>
          <dd className="text-gray-700 break-all">{user.email}</dd>
          <dt className="text-gray-400">Account type</dt>
          <dd className="text-gray-700">{roleLabel}</dd>
          {studentYear && (
            <>
              <dt className="text-gray-400">Year level</dt>
              <dd className="text-gray-700">{GRADES.find(g => g.value === studentYear)?.label ?? studentYear}</dd>
            </>
          )}
        </dl>
      </section>

      {billingNotice && (
        <div className="card mb-6 border-amber-400 bg-amber-50">
          <p className="text-sm text-gray-800">{billingNotice}</p>
        </div>
      )}

      <section className="card mb-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">Your plan</h2>
        {purchasesFailed ? (
          <p className="text-sm text-gray-600">
            We couldn&apos;t load your plan just now. Nothing has been lost — please refresh in a moment.
          </p>
        ) : role === 'admin' ? (
          <p className="text-sm text-gray-600">Admin accounts can open every paper without a plan.</p>
        ) : plan ? (
          <>
            <p className="text-sm font-medium">
              {plan.plan?.name ?? 'PrepNest'} plan
              {plan.status === 'past_due' && <span className="text-red-600 font-normal"> · payment overdue</span>}
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Every {PLAN_TOTALS.range} paper ·{' '}
              {plan.cancelAtPeriodEnd
                ? `cancelled — access ends ${formatDate(plan.periodEnd)}`
                : `renews ${formatDate(plan.periodEnd)}`}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/practice/exams" className="btn-primary text-sm text-center">
                Open papers
              </Link>
              <form action="/api/billing/portal" method="post">
                <button type="submit" className="btn-secondary text-sm w-full">
                  {plan.cancelAtPeriodEnd ? 'Restart or change plan' : 'Manage or cancel plan'}
                </button>
              </form>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Change plan, update your card, download invoices or cancel — handled securely by Stripe.
            </p>
            {/* Beside the cancel button on purpose: the moment someone decides
                whether to keep paying is when they most need to see that the
                plan is still growing. */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">New in your plan</p>
              <ul className="flex flex-col gap-2 mb-3">
                {releasesIn('plan')
                  .slice(0, 3)
                  .map(({ release, papers }) => (
                    <li key={release.title} className="text-sm">
                      <span className="text-gray-400">{formatReleaseDate(release.date)}</span>{' '}
                      <span className="text-gray-800">{release.title}</span>{' '}
                      <span className="text-teal-700">
                        · {papers.length} {papers.length === 1 ? 'paper' : 'papers'}
                      </span>
                    </li>
                  ))}
              </ul>
              <p className="text-xs text-gray-500 mb-3">
                Being written now:{' '}
                {ROADMAP.filter(item => item.audience !== 'VCE')
                  .map(item => item.title)
                  .join(' · ')}
                . Each is added to your plan at no extra cost.
              </p>
              <Link href={'/whats-new' as Route} className="text-sm text-brand-600 hover:underline">
                See everything that&apos;s new →
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              You don&apos;t have a plan. A plan unlocks every {PLAN_TOTALS.range} paper, from {FROM_PER_MONTH} a
              month. The free sample papers are open to everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={'/pricing' as Route} className="btn-primary text-sm text-center">
                See plans
              </Link>
              <Link
                href={(studentYear ? `/practice/exams?year=${studentYear}` : '/practice/exams') as Route}
                className="btn-secondary text-sm text-center"
              >
                {studentYear ? `Browse ${yearLabel(studentYear)} papers` : 'Browse exam papers'}
              </Link>
            </div>
          </>
        )}
      </section>

      {vcePapers.length > 0 && (
        <section className="card mb-6">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">Your VCE papers</h2>
          <ul className="flex flex-col divide-y divide-gray-100">
            {vcePapers.map(e => (
              <li key={e.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <p className="text-sm min-w-0 truncate">{e.title}</p>
                <Link href={`/practice/exams/${e.id}` as Route} className="btn-secondary text-sm py-2 px-4 shrink-0">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {purchases.length > 0 && !purchasesFailed && (
      <section className="card mb-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">Year levels you purchased</h2>
        {purchasesFailed ? (
          <p className="text-sm text-gray-600">
            We couldn&apos;t load your purchases just now. Nothing has been lost — please refresh in a moment.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-100">
            {purchases.map(p => {
              const stats = statsFor(p.yearLevel)
              return (
                <li key={p.yearLevel} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{yearLabel(p.yearLevel)}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {stats ? `${stats.papers} papers · ${stats.subjects.map(subjectLabel).join(', ')} · ` : ''}
                      purchased {formatDate(p.boughtOn)}
                    </p>
                  </div>
                  <Link
                    href={`/practice/exams?year=${p.yearLevel}` as Route}
                    className="btn-secondary text-sm py-2 px-4 shrink-0"
                  >
                    Open papers
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
        <p className="text-xs text-gray-400 mt-4">Purchased under the earlier year-level pricing — yours to keep.</p>
      </section>
      )}

      <p className="text-xs text-gray-400 mb-6">Receipts are emailed by Stripe whenever you pay.</p>

      <section className="card mb-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">Shortcuts</h2>
        <ul className="flex flex-col gap-2.5 text-sm">
          {role === 'parent' && (
            <li>
              <Link href="/parent" className="text-brand-600 hover:underline">
                Parent dashboard — see your child&apos;s progress
              </Link>
            </li>
          )}
          {role === 'student' && (
            <li>
              <Link href="/" className="text-brand-600 hover:underline">
                Your dashboard — XP, streak and topics
              </Link>
            </li>
          )}
          <li>
            <Link href="/practice" className="text-brand-600 hover:underline">
              Free practice quizzes
            </Link>
          </li>
          <li>
            <Link href="/auth/forgot-password" className="text-brand-600 hover:underline">
              Change your password
            </Link>
          </li>
          <li>
            <Link href={'/help' as Route} className="text-brand-600 hover:underline">
              Help & FAQ
            </Link>
            {SUPPORT_EMAIL && (
              <span className="text-gray-400">
                {' '}
                · or email{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
                  {SUPPORT_EMAIL}
                </a>
              </span>
            )}
          </li>
        </ul>
      </section>

      <form action="/auth/signout" method="post">
        <button type="submit" className="btn-secondary text-sm">
          Sign out
        </button>
      </form>
    </main>
  )
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Australia/Melbourne',
  }).format(new Date(iso))
}
