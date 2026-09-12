import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import type Stripe from 'stripe'

export const runtime = 'nodejs'
// The signature is computed over the exact bytes Stripe sent, so the body must
// not be parsed or re-serialised before verification.
export const dynamic = 'force-dynamic'

/**
 * Grants entitlements when Stripe confirms a payment.
 *
 * Two things make this safe, and both are load-bearing:
 *
 *  1. The signature is verified before anything is read from the payload.
 *     Without that, anyone who knows the URL can grant themselves every paper
 *     by POSTing a fake event.
 *  2. The grant is an upsert on (user_id, year_level). Stripe delivers webhooks
 *     at least once and retries on any non-2xx, so a duplicate delivery must be
 *     a no-op rather than a second row.
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

  if (event.type !== 'checkout.session.completed') {
    // Acknowledge everything else so Stripe stops retrying it.
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true, skipped: 'not paid' })
  }

  const userId = session.metadata?.user_id
  const yearLevel = session.metadata?.year_level
  if (!userId || !yearLevel) {
    console.error('[stripe-webhook] session is missing metadata', { id: session.id })
    // 200, not an error: retrying will not add the missing metadata.
    return NextResponse.json({ received: true, skipped: 'missing metadata' })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !url) {
    console.error('[stripe-webhook] Supabase service credentials are not set')
    // 500 so Stripe retries — this one is worth retrying, since it is our
    // misconfiguration and the payment has already succeeded.
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }

  // Service role, because row-level security intentionally gives the client no
  // way to insert an entitlement for itself.
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

  const { error } = await admin
    .from('entitlements')
    .upsert(
      { user_id: userId, year_level: yearLevel, source: 'stripe', external_ref: session.id },
      { onConflict: 'user_id,year_level' }
    )

  if (error) {
    // Surfaced and retried rather than swallowed: a payment taken without the
    // entitlement written is the worst failure this system can have.
    console.error('[stripe-webhook] failed to grant entitlement', { userId, yearLevel, error: error.message })
    return NextResponse.json({ error: 'Could not record entitlement' }, { status: 500 })
  }

  console.info('[stripe-webhook] granted', { userId, yearLevel, session: session.id })
  return NextResponse.json({ received: true })
}
