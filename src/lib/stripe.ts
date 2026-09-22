import Stripe from 'stripe'
import { stripePriceIdFor } from '@/lib/pricing'
import type { YearLevel } from '@/types'

/**
 * Stripe client, created lazily.
 *
 * Not created at module load: importing this file must not throw during a build
 * or on a deployment that has no Stripe keys yet. Callers get a clear error at
 * the point of use instead.
 */
let client: Stripe | null = null

export function getStripe(): Stripe {
  if (client) return client
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  // Pinned to whatever the installed SDK expects; leaving it unset would let a
  // future SDK bump silently change API behaviour.
  client = new Stripe(key, { apiVersion: '2026-08-26.dahlia' })
  return client
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

/**
 * Whether a year level can be bought right now. Server-only.
 *
 * Read from the same environment the checkout route reads, rather than kept as
 * a separate list: a year level is sellable exactly when its Stripe price
 * exists. That way a buy button can never be shown for something checkout will
 * refuse, and adding STRIPE_PRICE_YEAR_12 turns Year 12 on everywhere at once.
 */
export function isYearLevelSellable(yearLevel: YearLevel): boolean {
  return isStripeConfigured() && stripePriceIdFor(yearLevel) !== null
}
