import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { PLAN_IDS, isVceYear, stripePriceIdForPlan, stripePriceIdForVcePaper, type PlanId } from '@/lib/pricing'
import { canOpen, getAccess } from '@/lib/auth/access'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'

export const runtime = 'nodejs'

/**
 * Starts a Stripe Checkout session for one of two things:
 *
 *   { plan: 'month' | 'quarter' | 'year' }  a subscription to the Grade 3 – Year 10 plan
 *   { examId }                              one VCE paper, bought once
 *
 * The client names what it wants; the price is looked up server-side. The
 * amount is never taken from the request — that is how checkout flows get
 * exploited. The webhook reads the metadata back to decide what to grant.
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Payments are not configured' }, { status: 503 })
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // A purchase has to attach to an account.
  if (!user) return NextResponse.json({ error: 'Sign in to purchase' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { plan, examId } = (body ?? {}) as { plan?: unknown; examId?: unknown }
  const origin = req.nextUrl.origin
  const access = await getAccess()

  try {
    if (typeof plan === 'string') {
      if (!PLAN_IDS.has(plan as PlanId)) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      if (access.plan) {
        return NextResponse.json(
          { error: 'You already have a plan. Change or cancel it from your account page.' },
          { status: 409 }
        )
      }
      const priceId = stripePriceIdForPlan(plan as PlanId)
      if (!priceId) return NextResponse.json({ error: `No price configured for the ${plan} plan` }, { status: 503 })

      // Reuse the Stripe customer from an earlier subscription, so a returning
      // customer's history and payment method stay in one place.
      const { data: previous } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      const session = await getStripe().checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        ...(previous?.stripe_customer_id
          ? { customer: previous.stripe_customer_id }
          : { customer_email: user.email ?? undefined }),
        client_reference_id: user.id,
        metadata: { user_id: user.id, plan },
        // Copied onto the subscription, so later customer.subscription.* events
        // can be mapped back to the account without a lookup.
        subscription_data: { metadata: { user_id: user.id, plan } },
        // Lets specials run as promotion codes (e.g. on a school flyer) without
        // a code change.
        allow_promotion_codes: true,
        success_url: `${origin}/practice/exams?subscribed=1`,
        cancel_url: `${origin}/pricing`,
      })
      if (!session.url) throw new Error('Stripe returned no checkout URL')
      return NextResponse.json({ url: session.url })
    }

    if (typeof examId === 'string') {
      const exam = PRACTICE_EXAMS.find(e => e.id === examId)
      if (!exam || !exam.premium || !isVceYear(exam.yearLevel)) {
        return NextResponse.json({ error: 'That paper is not sold individually' }, { status: 400 })
      }
      if (canOpen(exam, access)) {
        return NextResponse.json({ error: 'You already own this paper' }, { status: 409 })
      }
      const priceId = stripePriceIdForVcePaper()
      if (!priceId) return NextResponse.json({ error: 'No price configured for VCE papers' }, { status: 503 })

      const session = await getStripe().checkout.sessions.create({
        mode: 'payment',
        // The one VCE price covers every paper; the paper's title goes on the
        // receipt through the description, and its id into the metadata.
        line_items: [{ price: priceId, quantity: 1 }],
        payment_intent_data: { description: exam.title },
        customer_email: user.email ?? undefined,
        client_reference_id: user.id,
        metadata: { user_id: user.id, exam_id: exam.id },
        allow_promotion_codes: true,
        success_url: `${origin}/practice/exams/${exam.id}?purchased=1`,
        cancel_url: `${origin}/practice/exams/${exam.id}`,
      })
      if (!session.url) throw new Error('Stripe returned no checkout URL')
      return NextResponse.json({ url: session.url })
    }

    return NextResponse.json({ error: 'Name a plan or a paper' }, { status: 400 })
  } catch (error) {
    console.error('[checkout] session create failed', error)
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 502 })
  }
}
