'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { BUNDLE_PRICE, YEAR_LEVEL_LABEL } from '@/lib/pricing'
import type { YearLevel } from '@/types'

export default function PremiumExamLock({
  title,
  subjectLabel,
  yearLevel,
  backHref,
  onBack,
}: {
  title: string
  subjectLabel: string
  /** Omitted by the personalised builder, which has no single year level to sell. */
  yearLevel?: YearLevel
  backHref?: Route
  onBack?: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const yearLabel = yearLevel ? YEAR_LEVEL_LABEL[yearLevel] : null

  async function buy() {
    if (!yearLevel) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yearLevel }),
      })
      const data = await res.json()
      if (res.status === 401) {
        window.location.href = '/auth/login?next=/practice/exams'
        return
      }
      if (!res.ok) throw new Error(data.error ?? `Checkout failed (${res.status})`)
      window.location.href = data.url
    } catch (err) {
      // Shown rather than swallowed — a dead button with no explanation is the
      // worst possible state for the one screen that takes money.
      setError(err instanceof Error ? err.message : 'Could not start checkout.')
      setBusy(false)
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
      <div className="text-3xl mb-3">🔒</div>
      <h1 className="text-2xl font-medium tracking-tight mb-2">{title}</h1>

      {yearLabel ? (
        <p className="text-gray-500 mb-1">
          Unlock every {yearLabel} {subjectLabel} paper — each with a printable exam and a separate
          answer key — for {BUNDLE_PRICE}, once.
        </p>
      ) : (
        <p className="text-gray-500 mb-1">
          This is a downloadable {subjectLabel} exam paper, plus a separate answer key.
        </p>
      )}
      <p className="text-sm text-gray-400 mb-8">
        The first paper at every year level is free, so you can see exactly what you are buying.
      </p>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {yearLevel ? (
        <button onClick={buy} disabled={busy} className="btn-primary w-full mb-3 disabled:opacity-50">
          {busy ? 'Starting checkout…' : `Unlock ${yearLabel} for ${BUNDLE_PRICE}`}
        </button>
      ) : (
        <Link href={'/practice/exams' as Route} className="btn-primary w-full mb-3 block text-center">
          Browse exam papers
        </Link>
      )}

      {backHref && (
        <Link href={backHref} className="btn-secondary w-full block text-center">
          Back to exams
        </Link>
      )}
      {onBack && (
        <button onClick={onBack} className="btn-secondary w-full">
          Back
        </button>
      )}
    </main>
  )
}
