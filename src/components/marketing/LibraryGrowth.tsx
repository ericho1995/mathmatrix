import Link from 'next/link'
import type { Route } from 'next'
import { ArrowRight, CalendarPlus, Hammer } from 'lucide-react'
import { releasesIn, type ReleaseScope } from '@/lib/catalogue'
import { ROADMAP, formatReleaseDate } from '@/lib/releases'

/**
 * "The library keeps growing": the latest releases with dates, and what is
 * being written next. Shown wherever someone decides whether to pay or keep
 * paying — the homepage, pricing, VCE and the account page — because a plan
 * that looks finished is a plan people download and cancel.
 */
export default function LibraryGrowth({
  scope = 'all',
  heading = 'The library keeps growing',
  intro,
  limit = 3,
  compact = false,
}: {
  scope?: ReleaseScope
  heading?: string
  intro?: string
  limit?: number
  compact?: boolean
}) {
  const recent = releasesIn(scope).slice(0, limit)
  const roadmap = ROADMAP.filter(item =>
    scope === 'all' ? true : scope === 'vce' ? item.audience === 'VCE' : item.audience !== 'VCE'
  )
  const addedCount = releasesIn(scope).reduce((n, r) => n + r.papers.length, 0)

  return (
    <div>
      {!compact && (
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">Always growing</p>
          <h2 className="text-3xl font-semibold tracking-tight mb-3">{heading}</h2>
          <p className="text-gray-500 leading-relaxed">
            {intro ??
              `${addedCount} papers have been added since launch, and more are being written now. Every new paper is included in your plan at no extra cost.`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <p className="flex items-center gap-2 text-sm font-medium mb-4">
            <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CalendarPlus className="w-4 h-4" aria-hidden />
            </span>
            Recently added
          </p>
          <ol className="flex flex-col gap-4">
            {recent.map(({ release, papers }) => (
              <li key={release.title} className="relative pl-4 border-l-2 border-teal-100">
                <p className="text-xs text-gray-400">{formatReleaseDate(release.date)}</p>
                <p className="text-sm font-medium text-gray-900">{release.title}</p>
                <p className="text-xs text-teal-700 mt-0.5">
                  {papers.length} new {papers.length === 1 ? 'paper' : 'papers'}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="card">
          <p className="flex items-center gap-2 text-sm font-medium mb-4">
            <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Hammer className="w-4 h-4" aria-hidden />
            </span>
            Being written now
          </p>
          <ul className="flex flex-col gap-3">
            {roadmap.map(item => (
              <li key={item.title} className="text-sm">
                <span className="font-medium text-gray-900">{item.title}</span>
                <span className="ml-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">{item.audience}</span>
                <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-center mt-6">
        <Link
          href={'/whats-new' as Route}
          className="text-sm font-medium text-brand-600 hover:underline inline-flex items-center gap-1"
        >
          See everything that&apos;s new <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </p>
    </div>
  )
}
