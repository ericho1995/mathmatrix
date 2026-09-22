import type { YearLevel } from '@/types'

/**
 * How PrepNest is sold.
 *
 * Grade 3 – Year 10 (NAPLAN and the school-year papers) is one plan that
 * unlocks every paper at every one of those year levels, so a family with
 * children in different years pays once. It renews automatically and can be
 * cancelled from the account page. The month is the premium price; the 3-month
 * and 12-month plans are the specials.
 *
 * VCE (Year 11 and 12) is sold by the paper: a senior student preparing for
 * one subject wants that subject's papers, not a subscription to everything.
 *
 * Every page reads these values — pricing, the lock screen, the catalogue, the
 * FAQ and the terms — so a price is changed here and nowhere else. The amount
 * actually charged is the Stripe price; keep the two in step.
 */
export type PlanId = 'month' | 'quarter' | 'year'

export interface Plan {
  id: PlanId
  /** "1 month", as the plan card heads it. */
  name: string
  priceAud: number
  months: number
  /** What the price renews as, for the card and the checkout line. */
  billing: string
  badge?: string
}

export const PLANS: Plan[] = [
  { id: 'month', name: '1 month', priceAud: 29, months: 1, billing: 'billed monthly' },
  { id: 'quarter', name: '3 months', priceAud: 59, months: 3, billing: 'billed every 3 months', badge: 'Most popular' },
  { id: 'year', name: '12 months', priceAud: 119, months: 12, billing: 'billed yearly', badge: 'Best value' },
]

export const PLAN_IDS = new Set<PlanId>(PLANS.map(p => p.id))

export function planById(id: string | null | undefined): Plan | undefined {
  return PLANS.find(p => p.id === id)
}

const MONTHLY = PLANS[0].priceAud

/** "$9.92" — the plan's price spread across its months. */
export function perMonth(plan: Plan): string {
  return money(plan.priceAud / plan.months)
}

/** Whole-percent saving against paying monthly; 0 for the monthly plan. */
export function savingPercent(plan: Plan): number {
  return Math.round((1 - plan.priceAud / plan.months / MONTHLY) * 100)
}

/** The cheapest per-month price across the plans, for "from $x a month" lines. */
export const FROM_PER_MONTH = perMonth(PLANS.reduce((a, b) => (b.priceAud / b.months < a.priceAud / a.months ? b : a)))

export const MONTHLY_PRICE = money(MONTHLY)

/** A VCE paper, bought once and kept. */
export const VCE_PAPER_PRICE_AUD = 20
export const VCE_PAPER_PRICE = money(VCE_PAPER_PRICE_AUD)

/** Year levels sold by the paper rather than covered by the plan. */
export function isVceYear(yearLevel: YearLevel): boolean {
  return yearLevel === 'year_11' || yearLevel === 'year_12'
}

/**
 * Change-of-mind refund window, in days from a purchase. The terms page and the
 * FAQ both read this, so the promise cannot drift between them. Offered
 * because every year level has a free sample paper: a parent can see the
 * product before paying, so the window costs little and removes the main
 * hesitation on a first purchase from an unknown brand.
 */
export const REFUND_DAYS = 7

function money(aud: number): string {
  return Number.isInteger(aud) ? `$${aud}` : `$${aud.toFixed(2)}`
}

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
 * Stripe price ids, read from the environment. The price a customer pays is
 * never taken from the client — the client names a plan or a paper and the id
 * is looked up here. Trusting a client-supplied price is how checkout flows
 * get exploited.
 *
 *   STRIPE_PRICE_PLAN_MONTH / STRIPE_PRICE_PLAN_QUARTER / STRIPE_PRICE_PLAN_YEAR
 *     recurring prices on one "PrepNest plan" product
 *   STRIPE_PRICE_VCE_PAPER
 *     one-off price used for every VCE paper (the paper goes in the metadata)
 */
export function stripePriceIdForPlan(plan: PlanId): string | null {
  return process.env[`STRIPE_PRICE_PLAN_${plan.toUpperCase()}`] ?? null
}

export function stripePriceIdForVcePaper(): string | null {
  return process.env.STRIPE_PRICE_VCE_PAPER ?? null
}
