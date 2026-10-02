import Link from 'next/link'
import type { Route } from 'next'
import { CATALOGUE_TOTALS } from '@/lib/catalogue'
import { SUPPORT_EMAIL } from '@/lib/site'
import Bird from '@/components/brand/Bird'

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Exams',
    links: [
      { href: '/practice/exams', label: 'All exam papers' },
      { href: '/naplan', label: 'NAPLAN practice' },
      { href: '/vce', label: 'VCE practice' },
    ],
  },
  {
    title: 'Product',
    links: [
      { href: '/pricing', label: 'Pricing' },
      { href: '/practice', label: 'Free practice' },
      { href: '/whats-new', label: "What's new" },
      { href: '/leaderboard', label: 'Leaderboard' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/help', label: 'Help & FAQ' },
      { href: '/account', label: 'Your account' },
      { href: '/auth/register', label: 'Create an account' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="mt-20 bg-brand-700 text-white">
      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-2 sm:grid-cols-5 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <Bird pose="read" className="w-20 h-20 -ml-2 mb-1" />
          <p className="text-xl font-bold tracking-tight">PrepNest</p>
          <p className="text-sm text-brand-100 mt-2 leading-relaxed">
            Find where your child needs help, then practice exactly that. {CATALOGUE_TOTALS.lowest} to{' '}
            {CATALOGUE_TOTALS.highest}, aligned to the Australian Curriculum and the VCE study designs.
          </p>
          {SUPPORT_EMAIL && (
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm text-white underline underline-offset-2 mt-3 block">
              {SUPPORT_EMAIL}
            </a>
          )}
        </div>

        {COLUMNS.map(col => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-sm font-bold text-white mb-3">{col.title}</p>
            <ul className="flex flex-col gap-2">
              {col.links.map(l => (
                <li key={l.href}>
                  <Link href={l.href as Route} className="text-sm text-brand-50 hover:text-white hover:underline underline-offset-2">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/20">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-brand-100">© {new Date().getFullYear()} PrepNest</p>
          <p className="text-xs text-brand-100 text-center sm:text-right">
            Independent practice material. Not affiliated with ACARA or the VCAA.
          </p>
        </div>
      </div>
    </footer>
  )
}
