'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/ui/Logo'

export interface NavUser {
  email: string
  fullName: string
  role: 'student' | 'parent' | 'admin'
}

const linkClass = (active: boolean) =>
  `text-sm font-medium transition-colors ${active ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'}`

interface NavLink {
  href: Route
  label: string
  /** How to decide the link is the current page. */
  match: (path: string) => boolean
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
 */
export default function Navbar({ user }: { user: NavUser | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname() ?? '/'

  const links: NavLink[] = [
    { href: '/practice/exams', label: 'Exam papers', match: within('/practice/exams') },
    { href: '/naplan' as Route, label: 'NAPLAN', match: exact('/naplan') },
    { href: '/vce' as Route, label: 'VCE', match: exact('/vce') },
    // Exact, not "within": /practice/exams must not light this up too.
    { href: '/practice', label: 'Free practice', match: exact('/practice') },
    { href: '/pricing' as Route, label: 'Pricing', match: exact('/pricing') },
    ...(user?.role === 'student'
      ? [{ href: '/leaderboard' as Route, label: 'Leaderboard', match: exact('/leaderboard') }]
      : []),
    ...(user?.role === 'parent'
      ? [{ href: '/parent' as Route, label: 'Parent dashboard', match: exact('/parent') }]
      : []),
  ]

  const close = () => setOpen(false)

  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex-shrink-0" aria-label="PrepNest home">
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-6" aria-label="Main">
          {links.map(l => (
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

        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <>
              <Link href={'/account' as Route} className={linkClass(pathname === '/account')}>
                Account
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="btn-secondary text-sm py-2 px-4">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={linkClass(pathname === '/auth/login')}>
                Sign in
              </Link>
              <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">
                Get started free
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
        <nav className="lg:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-3 bg-white" aria-label="Main">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={linkClass(l.match(pathname))} onClick={close}>
              {l.label}
            </Link>
          ))}
          <Link href={'/help' as Route} className={linkClass(pathname === '/help')} onClick={close}>
            Help
          </Link>
          <div className="border-t border-gray-100 pt-3 flex flex-col gap-3">
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
                <Link href="/auth/register" className="btn-primary text-sm text-center" onClick={close}>
                  Get started free
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
