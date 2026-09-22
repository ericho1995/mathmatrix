import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, isStripeConfigured } from '@/lib/stripe'

export const runtime = 'nodejs'

/**
 * Sends a subscriber to Stripe's customer portal, where they can cancel,
 * switch plan, update their card and download invoices.
 *
 * A form POST from the account page, answered with a redirect, so it works
 * without client-side JavaScript. The portal must be switched on once in the
 * Stripe dashboard (Settings → Billing → Customer portal).
 */
export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin
  if (!isStripeConfigured()) return NextResponse.redirect(`${origin}/account?billing=unavailable`, 303)

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/auth/login?next=/account`, 303)

  const { data, error } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .order('current_period_end', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error || !data?.stripe_customer_id) {
    if (error) console.error('[billing-portal] subscription lookup failed', error.message)
    return NextResponse.redirect(`${origin}/account?billing=none`, 303)
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${origin}/account`,
    })
    return NextResponse.redirect(session.url, 303)
  } catch (err) {
    console.error('[billing-portal] session create failed', err)
    return NextResponse.redirect(`${origin}/account?billing=unavailable`, 303)
  }
}
