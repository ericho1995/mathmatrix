import Stripe from 'stripe'

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
