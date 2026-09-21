import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/logError'
import { GRADES } from '@/lib/curriculum'
import { statsFor, subjectLabel, yearLabel, isYearLevel } from '@/lib/catalogue'
import { SUPPORT_EMAIL } from '@/lib/site'
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
export default async function AccountPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/account')

  const [{ data: profile, error: profileError }, { data: rows, error: entitlementsError }] = await Promise.all([
    supabase.from('profiles').select('full_name, role').eq('id', user.id).single(),
    supabase.from('entitlements').select('year_level, created_at').eq('user_id', user.id).order('created_at'),
  ])
  queryFailed('account.profile', profileError, { userId: user.id })
  // Kept distinct from "you have bought nothing": telling a paying customer
  // they own no year levels because a read failed is the one message on this
  // page that must never be wrong.
  const purchasesFailed = queryFailed('account.entitlements', entitlementsError, { userId: user.id })

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

      <section className="card mb-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">Your year levels</h2>
        {purchasesFailed ? (
          <p className="text-sm text-gray-600">
            We couldn&apos;t load your purchases just now. Nothing has been lost — please refresh in a moment.
          </p>
        ) : role === 'admin' ? (
          <p className="text-sm text-gray-600">Admin accounts can open every paper without buying.</p>
        ) : purchases.length === 0 ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              You haven&apos;t unlocked a year level yet. The free sample papers are open to everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={(studentYear ? `/practice/exams?year=${studentYear}` : '/practice/exams') as Route}
                className="btn-primary text-sm text-center"
              >
                {studentYear ? `Browse ${yearLabel(studentYear)} papers` : 'Browse exam papers'}
              </Link>
              <Link href={'/pricing' as Route} className="btn-secondary text-sm text-center">
                How pricing works
              </Link>
            </div>
          </>
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
                      bought {formatDate(p.boughtOn)}
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
        {!purchasesFailed && purchases.length > 0 && (
          <p className="text-xs text-gray-400 mt-4">Receipts are emailed by Stripe when you pay.</p>
        )}
      </section>

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
