'use client'

import { useState } from 'react'
import { BUNDLE_PRICE } from '@/lib/pricing'
import type { YearLevel } from '@/types'

/**
 * Starts checkout for one year level.
 *
 * Shared by the lock screen, the catalogue and the pricing page so there is one
 * checkout call, not three that drift — the paper and answer-key routes did
 * exactly that with their paywall check.
 *
 * `sellable` comes from the server (isYearLevelSellable). When a year level has
 * no Stripe price, this renders a notice instead of a button: a button that
 * always errors is the worst thing to put on the screen that takes money.
 */
export default function BuyBundleButton({
  yearLevel,
  yearLabel,
  sellable,
  variant = 'primary',
  className = '',
}: {
  yearLevel: YearLevel
  yearLabel: string
  sellable: boolean
  variant?: 'primary' | 'secondary'
  className?: string
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!sellable) {
    return (
      <p className={`text-xs text-gray-400 ${className}`}>
        {yearLabel} purchases open soon. The free sample papers are available now.
      </p>
    )
  }

  async function buy() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yearLevel }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) {
        // Come back to exactly this page after signing in, so the purchase the
        // visitor was making is still in front of them.
        const here = window.location.pathname + window.location.search
        window.location.href = `/auth/login?next=${encodeURIComponent(here)}`
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
    <div className={className}>
      <button
        onClick={buy}
        disabled={busy}
        className={`${variant === 'primary' ? 'btn-primary' : 'btn-secondary'} w-full disabled:opacity-50`}
      >
        {busy ? 'Starting checkout…' : `Unlock ${yearLabel} for ${BUNDLE_PRICE}`}
      </button>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
