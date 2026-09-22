import Stripe from 'stripe'
import { stripePriceIdForPlan, stripePriceIdForVcePaper, type PlanId } from '@/lib/pricing'

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
 * Whether a plan can be bought right now. Server-only. Derived from the same
 * environment checkout reads, so a button is never shown for a plan checkout
 * would refuse — without its Stripe price, the UI says "opening soon" instead.
 */
export function isPlanSellable(plan: PlanId): boolean {
  return isStripeConfigured() && stripePriceIdForPlan(plan) !== null
}

export function isVcePaperSellable(): boolean {
  return isStripeConfigured() && stripePriceIdForVcePaper() !== null
}

/**
 * When the subscription's paid period ends. Stripe moved this from the
 * subscription to its items in API version 2025-03-31; read either, so the
 * webhook keeps working whichever shape arrives.
 */
export function periodEnd(sub: Stripe.Subscription): Date {
  const itemEnd = sub.items?.data?.[0]?.current_period_end
  const legacyEnd = (sub as unknown as { current_period_end?: number }).current_period_end
  const seconds = itemEnd ?? legacyEnd ?? sub.billing_cycle_anchor
  return new Date(seconds * 1000)
}
