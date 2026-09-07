'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export interface NavUser {
  email: string
  fullName: string
  role: 'student' | 'parent' | 'admin'
}

const linkClass = (active: boolean) =>
  `text-sm font-medium transition-colors ${active ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'}`

export default function Navbar({ user }: { user: NavUser | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const links: { href: Route; label: string }[] = [
    { href: '/practice', label: 'Practice' },
    { href: '/leaderboard', label: 'Leaderboard' },
    ...(user?.role === 'parent' ? [{ href: '/parent' as Route, label: 'Parent dashboard' }] : []),
    ...(user?.role === 'admin' ? [{ href: '/admin' as Route, label: 'Admin' }] : []),
  ]

  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-medium tracking-tight flex-shrink-0">
          Prep<span className="text-brand-400">Nest</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={linkClass(pathname === l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <form action="/auth/signout" method="post">
              <button type="submit" className="btn-secondary text-sm py-2 px-4">
                Sign out
              </button>
            </form>
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
          className="md:hidden p-2 -mr-2 text-gray-500"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-3 bg-white">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={linkClass(pathname === l.href)} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <form action="/auth/signout" method="post">
              <button type="submit" className="btn-secondary text-sm w-full mt-1">
                Sign out
              </button>
            </form>
          ) : (
            <>
              <Link href="/auth/login" className={linkClass(pathname === '/auth/login')} onClick={() => setOpen(false)}>
                Sign in
              </Link>
              <Link href="/auth/register" className="btn-primary text-sm text-center mt-1" onClick={() => setOpen(false)}>
                Get started free
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
