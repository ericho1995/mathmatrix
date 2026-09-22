import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getStripe, isStripeConfigured, periodEnd } from '@/lib/stripe'
import { PLANS, stripePriceIdForPlan } from '@/lib/pricing'
import type Stripe from 'stripe'

export const runtime = 'nodejs'
// The signature is computed over the exact bytes Stripe sent, so the body must
// not be parsed or re-serialised before verification.
export const dynamic = 'force-dynamic'

/**
 * Records what Stripe says a customer has paid for.
 *
 * Events handled (subscribe the endpoint to all four):
 *   checkout.session.completed     a plan started, or a VCE paper was bought
 *   customer.subscription.created  ┐
 *   customer.subscription.updated  ├ renewals, plan changes, cancellations,
 *   customer.subscription.deleted  ┘ failed payments
 *
 * Two things make this safe, and both are load-bearing:
 *
 *  1. The signature is verified before anything is read from the payload.
 *     Without that, anyone who knows the URL can grant themselves every paper
 *     by POSTing a fake event.
 *  2. Every write is an upsert on a natural key — the Stripe subscription id,
 *     or (user, paper). Stripe delivers at least once and retries on any
 *     non-2xx, so a repeated delivery must be a no-op, not a second grant.
 *
 * Database failures return 500 so Stripe retries: a payment taken without the
 * access recorded is the worst failure this system can have. Events that can
 * never succeed (missing metadata) return 200, since retrying will not help.
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Payments are not configured' }, { status: 503 })
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set — refusing to process')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error) {
    console.error('[stripe-webhook] signature verification failed', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const handled = [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
  ]
  if (!handled.includes(event.type)) {
    // Acknowledge everything else so Stripe stops retrying it.
    return NextResponse.json({ received: true })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !url) {
    console.error('[stripe-webhook] Supabase service credentials are not set')
    // 500 so Stripe retries — this is our misconfiguration, and the payment
    // has already gone through.
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }
  // Service role, because row-level security intentionally gives the client
  // no way to grant itself access.
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

  try {
    if (event.type === 'checkout.session.completed') {
      return await onCheckoutCompleted(event.data.object as Stripe.Checkout.Session, admin)
    }
    return await recordSubscription(event.data.object as Stripe.Subscription, admin)
  } catch (error) {
    console.error('[stripe-webhook] failed to record', { type: event.type, error })
    return NextResponse.json({ error: 'Could not record purchase' }, { status: 500 })
  }
}

async function onCheckoutCompleted(session: Stripe.Checkout.Session, admin: SupabaseClient) {
  const userId = session.metadata?.user_id
  if (!userId) {
    console.error('[stripe-webhook] session is missing user_id', { id: session.id })
    return NextResponse.json({ received: true, skipped: 'missing metadata' })
  }

  if (session.mode === 'subscription') {
    // The subscription events carry the same data, but they can arrive before
    // or after this one. Recording it here as well means access is granted as
    // soon as the customer lands back on the site, whichever comes first.
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
    if (!subscriptionId) return NextResponse.json({ received: true, skipped: 'no subscription on session' })
    const sub = await getStripe().subscriptions.retrieve(subscriptionId)
    return recordSubscription(sub, admin, userId)
  }

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true, skipped: 'not paid' })
  }

  const examId = session.metadata?.exam_id
  if (examId) {
    const { error } = await admin
      .from('paper_purchases')
      .upsert({ user_id: userId, exam_id: examId, external_ref: session.id }, { onConflict: 'user_id,exam_id' })
    if (error) throw new Error(`paper_purchases upsert: ${error.message}`)
    console.info('[stripe-webhook] paper granted', { userId, examId, session: session.id })
    return NextResponse.json({ received: true })
  }

  // Checkout sessions started under the old $29 year-level bundle, before the
  // plans replaced it, still complete here.
  const yearLevel = session.metadata?.year_level
  if (yearLevel) {
    const { error } = await admin
      .from('entitlements')
      .upsert(
        { user_id: userId, year_level: yearLevel, source: 'stripe', external_ref: session.id },
        { onConflict: 'user_id,year_level' }
      )
    if (error) throw new Error(`entitlements upsert: ${error.message}`)
    console.info('[stripe-webhook] year level granted', { userId, yearLevel, session: session.id })
    return NextResponse.json({ received: true })
  }

  console.error('[stripe-webhook] paid session names nothing to grant', { id: session.id })
  return NextResponse.json({ received: true, skipped: 'nothing to grant' })
}

async function recordSubscription(sub: Stripe.Subscription, admin: SupabaseClient, userIdHint?: string) {
  const userId = sub.metadata?.user_id ?? userIdHint
  if (!userId) {
    console.error('[stripe-webhook] subscription is missing user_id', { id: sub.id })
    return NextResponse.json({ received: true, skipped: 'missing metadata' })
  }
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id

  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      plan: planFromPrice(sub) ?? sub.metadata?.plan ?? 'unknown',
      status: sub.status,
      current_period_end: periodEnd(sub).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_subscription_id' }
  )
  if (error) throw new Error(`subscriptions upsert: ${error.message}`)

  console.info('[stripe-webhook] subscription recorded', { userId, subscription: sub.id, status: sub.status })
  return NextResponse.json({ received: true })
}

/**
 * Which plan the subscription is on, from the price it actually carries. The
 * metadata names the plan it started on, which goes stale if the customer
 * switches plan in Stripe's customer portal.
 */
function planFromPrice(sub: Stripe.Subscription): string | undefined {
  const priceId = sub.items?.data?.[0]?.price?.id
  return PLANS.find(p => stripePriceIdForPlan(p.id) === priceId)?.id
}
