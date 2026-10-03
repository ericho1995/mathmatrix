'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import { CircleUser, Menu, X } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { isGuardianRole } from '@/lib/auth/roles'
import type { UserRole } from '@/types'

export interface NavUser {
  email: string
  fullName: string
  role: UserRole
}

const linkClass = (active: boolean) =>
  `text-[15px] lg:text-sm xl:text-[15px] font-semibold whitespace-nowrap transition-colors ${active ? 'text-brand-600' : 'text-gray-500 hover:text-brand-600'}`

interface NavLink {
  href: Route
  label: string
  /** How to decide the link is the current page. */
  match: (path: string) => boolean
  /** In the phone menu only: the desktop bar has no room for it. */
  menuOnly?: boolean
}

const exact = (href: string) => (path: string) => path === href
const within = (href: string) => (path: string) => path === href || path.startsWith(`${href}/`)

/**
 * Navigation is organised by exam, the way parents search — "NAPLAN practice",
 * "VCE Methods trial exam" — rather than by feature. The papers used to sit
 * behind Practice → a second tab, so the product a visitor could buy was two
 * clicks from the nav and never named in it.
 *
 * The leaderboard is shown to students only. To a visitor it is an empty page
 * in the top-level nav, which is the wrong first impression for a new product.
 *
 * A parent or teacher gets their dashboard first and the guide to it (For
 * parents); to fit one line at 1024px, Free practice moves to the phone menu
 * for them — it is in the footer and on the dashboard too.
 */
export default function Navbar({ user }: { user: NavUser | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname() ?? '/'

  const guardian = isGuardianRole(user?.role)
  const student = user?.role === 'student'
  const links: NavLink[] = [
    ...(guardian ? [{ href: '/parent' as Route, label: 'Dashboard', match: exact('/parent') }] : []),
    { href: '/diagnostic' as Route, label: 'Diagnostic test', match: within('/diagnostic') },
    // What the tests produce and every way to help — for parents and visitors, not students.
    ...(student ? [] : [{ href: '/for-parents' as Route, label: 'For parents', match: exact('/for-parents') }]),
    { href: '/practice/exams', label: 'Exam papers', match: within('/practice/exams') },
    { href: '/naplan' as Route, label: 'NAPLAN', match: exact('/naplan') },
    { href: '/vce' as Route, label: 'VCE', match: exact('/vce') },
    // Exact, not "within": /practice/exams must not light this up too.
    { href: '/practice', label: 'Free practice', match: exact('/practice'), menuOnly: guardian },
    { href: '/pricing' as Route, label: 'Pricing', match: exact('/pricing') },
    ...(student ? [{ href: '/leaderboard' as Route, label: 'Leaderboard', match: exact('/leaderboard') }] : []),
  ]

  const close = () => setOpen(false)

  return (
    <header className="border-b-2 border-line bg-white/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex-shrink-0" aria-label="PrepNest home">
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-4 xl:gap-6" aria-label="Main">
          {links.filter(l => !l.menuOnly).map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={linkClass(l.match(pathname))}
              aria-current={l.match(pathname) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3 xl:gap-4">
          {user ? (
            <>
              <Link
                href={'/account' as Route}
                className={`inline-flex p-1 rounded-full ${pathname === '/account' ? 'text-brand-600' : 'text-gray-500 hover:text-brand-600'}`}
                aria-label="Account"
                title="Account"
                aria-current={pathname === '/account' ? 'page' : undefined}
              >
                <CircleUser className="w-7 h-7" aria-hidden />
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="btn-secondary text-sm py-2 px-4 whitespace-nowrap">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={linkClass(pathname === '/auth/login')}>
                Sign in
              </Link>
              <Link href={'/diagnostic' as Route} className="btn-primary text-sm py-2 px-4 whitespace-nowrap">
                <span className="xl:hidden">Free test</span>
                <span className="hidden xl:inline">Free diagnostic test</span>
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 -mr-2 text-gray-500"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="lg:hidden border-t-2 border-line px-4 py-4 flex flex-col gap-4 bg-white" aria-label="Main">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={linkClass(l.match(pathname))} onClick={close}>
              {l.label}
            </Link>
          ))}
          <Link href={'/help' as Route} className={linkClass(pathname === '/help')} onClick={close}>
            Help
          </Link>
          <div className="border-t-2 border-line pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <Link href={'/account' as Route} className={linkClass(pathname === '/account')} onClick={close}>
                  Account
                </Link>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="btn-secondary text-sm w-full">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={linkClass(pathname === '/auth/login')} onClick={close}>
                  Sign in
                </Link>
                <Link href={'/diagnostic' as Route} className="btn-primary text-sm text-center" onClick={close}>
                  Free diagnostic test
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
