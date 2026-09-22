'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/** How long to keep re-checking before telling the customer to refresh. */
const MAX_ATTEMPTS = 10
const INTERVAL_MS = 2000

const COPY = {
  plan: {
    pending: 'Payment received — switching on your plan…',
    done: 'Your plan is active — every paper it covers is unlocked.',
    doneNote: 'Each paper comes with a printable exam and a separate answer key. Your receipt is on its way from Stripe.',
    slow: 'Payment received, but we haven’t finished switching on your plan yet.',
  },
  paper: {
    pending: 'Payment received — unlocking this paper…',
    done: 'Payment received — this paper is yours.',
    doneNote: 'Download the exam and its answer key below. Your receipt is on its way from Stripe.',
    slow: 'Payment received, but we haven’t finished unlocking this paper yet.',
  },
}

/**
 * Shown when Stripe sends a paying customer back to the site.
 *
 * Checkout redirects the instant the card clears, but access is written by
 * the webhook, which lands a moment later. Without this the customer arrives
 * back, sees the paper still locked, and reasonably concludes the payment
 * failed — the single worst moment to leave someone guessing. So an unsettled
 * purchase re-checks the server a few times rather than rendering a padlock.
 */
export default function PurchaseBanner({
  kind,
  settled,
}: {
  kind: 'plan' | 'paper'
  /** True once the purchase is visible to this request. */
  settled: boolean
}) {
  const router = useRouter()
  const [attempts, setAttempts] = useState(0)
  const givenUp = attempts >= MAX_ATTEMPTS
  const copy = COPY[kind]

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
      <div className="card mb-6 border-green-200 bg-green-50 text-left">
        <p className="text-sm font-medium text-green-900">{copy.done}</p>
        <p className="text-xs text-green-800 mt-1">{copy.doneNote}</p>
      </div>
    )
  }

  if (givenUp) {
    // The project's Tailwind config narrows `amber` to 50/400 only, so this
    // uses the two shades that exist plus neutral text.
    return (
      <div className="card mb-6 border-amber-400 bg-amber-50 text-left">
        <p className="text-sm font-medium text-gray-900">{copy.slow}</p>
        <p className="text-xs text-gray-600 mt-1">
          This usually takes a few seconds. Refresh the page shortly — and if it is still locked, email us and we will
          sort it out. You have not been charged twice.
        </p>
      </div>
    )
  }

  return (
    <div className="card mb-6 border-brand-200 bg-brand-50 text-left">
      <p className="text-sm font-medium">{copy.pending}</p>
      <p className="text-xs text-gray-500 mt-1">This takes a moment. No need to do anything.</p>
    </div>
  )
}
