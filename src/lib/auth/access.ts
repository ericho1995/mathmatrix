import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from './getUserRole'
import { isVceYear, planById, type Plan } from '@/lib/pricing'
import type { YearLevel } from '@/types'

/**
 * What the signed-in visitor has paid for, and the one rule for what that opens.
 *
 * Every paywalled surface — the exam page, the mark page, both PDF routes, the
 * catalogue, the pricing and account pages — reads this. The exam PDF and its
 * answer key once carried separate inline checks and drifted apart, refusing a
 * paying customer their answer key; one function is what stops that recurring.
 *
 * Fails closed: a failed read is treated as "not paid". Most reads in this app
 * are wrapped so nothing crashes, which has repeatedly hidden real breakage —
 * that trade is not acceptable on a paywall, where failing open gives paid
 * content away. The failure is logged, and `failed` lets the account page say
 * "couldn't load" rather than "you own nothing".
 */
export interface ActivePlan {
  plan: Plan | undefined
  status: string
  /** End of the period already paid for. */
  periodEnd: string
  cancelAtPeriodEnd: boolean
}

export interface Access {
  signedIn: boolean
  admin: boolean
  /** The subscription that currently grants access, if any. */
  plan: ActivePlan | null
  /** VCE papers bought individually, by exam id. */
  papers: Set<string>
  /** Year levels bought under the old $29 bundle — still honoured. */
  legacyYears: Set<YearLevel>
  failed: boolean
}

const EMPTY: Access = { signedIn: false, admin: false, plan: null, papers: new Set(), legacyYears: new Set(), failed: false }

/** Stripe statuses that still grant access, provided the paid period has not ended. */
const LIVE_STATUSES = new Set(['active', 'trialing', 'past_due'])

/** Memoised per request, so a page and its components share one set of reads. */
export const getAccess = cache(async (): Promise<Access> => {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return EMPTY

  const [role, subs, papers, legacy] = await Promise.all([
    getUserRole(),
    supabase
      .from('subscriptions')
      .select('plan, status, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id)
      .order('current_period_end', { ascending: false }),
    supabase.from('paper_purchases').select('exam_id').eq('user_id', user.id),
    supabase.from('entitlements').select('year_level').eq('user_id', user.id),
  ])

  let failed = false
  for (const [name, res] of [['subscriptions', subs], ['paper_purchases', papers], ['entitlements', legacy]] as const) {
    if (res.error) {
      failed = true
      console.error(`[access] ${name} lookup failed`, { userId: user.id, error: res.error.message })
    }
  }

  const now = Date.now()
  const live = (subs.data ?? []).find(
    s => LIVE_STATUSES.has(s.status) && new Date(s.current_period_end).getTime() > now
  )

  return {
    signedIn: true,
    admin: role === 'admin',
    plan: live
      ? {
          plan: planById(live.plan),
          status: live.status,
          periodEnd: live.current_period_end,
          cancelAtPeriodEnd: live.cancel_at_period_end,
        }
      : null,
    papers: new Set((papers.data ?? []).map(r => r.exam_id as string)),
    legacyYears: new Set((legacy.data ?? []).map(r => r.year_level as YearLevel)),
    failed,
  }
})

/** The papers a paywall rule needs to know about. */
export interface GatedPaper {
  id: string
  yearLevel: YearLevel
  premium: boolean
}

export type AccessReason = 'free' | 'admin' | 'plan' | 'paper' | 'purchased'

/**
 * Why this visitor may open a paper, or null if they may not.
 *
 *  - free sample papers are open to everyone;
 *  - Grade 3 – Year 10 papers open with an active plan;
 *  - VCE papers open when that paper was bought;
 *  - a year level bought under the old bundle keeps every paper at that level.
 */
export function accessReason(exam: GatedPaper, access: Access): AccessReason | null {
  if (!exam.premium) return 'free'
  if (access.admin) return 'admin'
  if (access.legacyYears.has(exam.yearLevel)) return 'purchased'
  if (isVceYear(exam.yearLevel)) return access.papers.has(exam.id) ? 'paper' : null
  return access.plan ? 'plan' : null
}

export function canOpen(exam: GatedPaper, access: Access): boolean {
  return accessReason(exam, access) !== null
}
