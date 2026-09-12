import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { stripePriceIdFor, YEAR_LEVEL_LABEL } from '@/lib/pricing'
import { hasEntitlement } from '@/lib/auth/getEntitlements'
import type { YearLevel } from '@/types'

export const runtime = 'nodejs'

const VALID_YEAR_LEVELS = new Set(Object.keys(YEAR_LEVEL_LABEL))

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Payments are not configured' }, { status: 503 })
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // Checkout requires an account, because the entitlement has to attach to
  // someone. The webhook maps the session back to this id.
  if (!user) return NextResponse.json({ error: 'Sign in to buy' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { yearLevel } = (body ?? {}) as { yearLevel?: unknown }
  if (typeof yearLevel !== 'string' || !VALID_YEAR_LEVELS.has(yearLevel)) {
    return NextResponse.json({ error: 'Invalid yearLevel' }, { status: 400 })
  }
  const year = yearLevel as YearLevel

  if (await hasEntitlement(year)) {
    return NextResponse.json({ error: 'You already own this year level' }, { status: 409 })
  }

  // The amount is never taken from the request. The client names a year level;
  // the price is looked up server-side. Accepting a client-supplied price or
  // amount is the classic way a checkout flow gets exploited.
  const priceId = stripePriceIdFor(year)
  if (!priceId) {
    return NextResponse.json({ error: `No price configured for ${year}` }, { status: 503 })
  }

  const origin = req.nextUrl.origin
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email ?? undefined,
      // Read back by the webhook to decide who to grant, and what.
      metadata: { user_id: user.id, year_level: year },
      success_url: `${origin}/practice/exams?purchased=${year}`,
      cancel_url: `${origin}/practice/exams`,
    })
    if (!session.url) throw new Error('Stripe returned no checkout URL')
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[checkout] session create failed', error)
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 502 })
  }
}
