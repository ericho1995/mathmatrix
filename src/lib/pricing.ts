import type { YearLevel } from '@/types'

/**
 * The product is a year-level bundle: one payment unlocks every premium paper
 * for that year level. Per-paper pricing was considered and rejected — it
 * maximises the pain of a shallow catalogue, since a customer buys one paper,
 * discovers there are only a few, and does not come back.
 */
export const BUNDLE_PRICE_AUD = 29

export const BUNDLE_PRICE = `$${BUNDLE_PRICE_AUD}`

/** Kept for the older per-paper copy still referenced in a couple of places. */
export const PREMIUM_PRICE = BUNDLE_PRICE

export const YEAR_LEVEL_LABEL: Record<YearLevel, string> = {
  grade_3: 'Grade 3',
  grade_4: 'Grade 4',
  grade_5: 'Grade 5',
  grade_6: 'Grade 6',
  year_7: 'Year 7',
  year_8: 'Year 8',
  year_9: 'Year 9',
  year_10: 'Year 10',
  year_11: 'Year 11',
  year_12: 'Year 12',
}

/**
 * Stripe price ids, one per year level, read from the environment.
 *
 * The price a customer is charged is never taken from the client — the client
 * sends a year level, and the id is looked up here. Trusting a client-supplied
 * price or amount is how checkout flows get exploited.
 *
 * Set STRIPE_PRICE_<YEAR_LEVEL> in the environment, e.g. STRIPE_PRICE_YEAR_9.
 */
export function stripePriceIdFor(yearLevel: YearLevel): string | null {
  return process.env[`STRIPE_PRICE_${yearLevel.toUpperCase()}`] ?? null
}
