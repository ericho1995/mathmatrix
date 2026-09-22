'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/** How long to keep re-checking before telling the customer to refresh. */
const MAX_ATTEMPTS = 10
const INTERVAL_MS = 2000

/**
 * Shown when Stripe sends a paying customer back to the catalogue.
 *
 * Checkout redirects the instant the card clears, but the entitlement is
 * written by the webhook, which lands a moment later. Without this the
 * customer arrives back on the catalogue, sees every paper still locked, and
 * reasonably concludes the payment failed — the single worst moment to leave
 * someone guessing. So an unsettled purchase re-checks the server a few times
 * rather than rendering a wall of padlocks.
 */
export default function PurchaseBanner({
  yearLabel,
  settled,
}: {
  yearLabel: string
  /** True once the entitlement is visible to this request. */
  settled: boolean
}) {
  const router = useRouter()
  const [attempts, setAttempts] = useState(0)
  const givenUp = attempts >= MAX_ATTEMPTS

  useEffect(() => {
    if (settled || givenUp) return
    const timer = setTimeout(() => {
      setAttempts(n => n + 1)
      router.refresh()
    }, INTERVAL_MS)
    return () => clearTimeout(timer)
  }, [settled, givenUp, attempts, router])

  if (settled) {
    return (
      <div className="card mb-6 border-green-200 bg-green-50">
        <p className="text-sm font-medium text-green-900">
          Payment received — every {yearLabel} paper is unlocked.
        </p>
        <p className="text-xs text-green-800 mt-1">
          Each paper comes with a printable exam and a separate answer key. Your receipt is on its
          way from Stripe.
        </p>
      </div>
    )
  }

  if (givenUp) {
    // The project's Tailwind config narrows `amber` to 50/400 only, so this
    // uses the two shades that exist plus neutral text.
    return (
      <div className="card mb-6 border-amber-400 bg-amber-50">
        <p className="text-sm font-medium text-gray-900">
          Payment received, but we haven&apos;t finished unlocking {yearLabel} yet.
        </p>
        <p className="text-xs text-gray-600 mt-1">
          This usually takes a few seconds. Refresh the page shortly — and if it is still locked,
          email us and we will sort it out. You have not been charged twice.
        </p>
      </div>
    )
  }

  return (
    <div className="card mb-6 border-brand-200 bg-brand-50">
      <p className="text-sm font-medium">Payment received — unlocking your {yearLabel} papers…</p>
      <p className="text-xs text-gray-500 mt-1">This takes a moment. No need to do anything.</p>
    </div>
  )
}
