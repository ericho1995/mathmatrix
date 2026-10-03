import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { PLAN_IDS, isVceYear, stripePriceIdForPlan, stripePriceIdForVcePaper, type PlanId } from '@/lib/pricing'
import { canOpen, getAccess } from '@/lib/auth/access'
import { vcePartnerId } from '@/lib/auth/vceSets'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { loadResult } from '@/lib/diagnostic/load'
import { tailoredAccess } from '@/lib/diagnostic/access'
import { tailoredExamId } from '@/lib/diagnostic/tailor'
import { loadPaper } from '@/lib/diagnostic/papers'
import { paperOpen } from '@/lib/diagnostic/access'
import { paperExamId } from '@/lib/diagnostic/weakPapers'

export const runtime = 'nodejs'

/**
 * Starts a Stripe Checkout session for one of two things:
 *
 *   { plan: 'month' | 'quarter' | 'year' }  a subscription to the Grade 3 – Year 10 plan
 *   { examId }                              one VCE paper, bought once
 *   { tailoredId }                          the VCE exam built from a diagnostic result
 *   { diagnosticPaperId }                   one VCE weak-areas paper generated from a result
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
  const { plan, examId, tailoredId, diagnosticPaperId } = (body ?? {}) as { plan?: unknown; examId?: unknown; tailoredId?: unknown; diagnosticPaperId?: unknown }
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

      // One purchase covers both exams of a two-paper VCE set (see vceSets.ts),
      // so the receipt names both.
      const partner = PRACTICE_EXAMS.find(e => e.id === vcePartnerId(exam.id))
      const description = partner ? `${exam.title} and ${lastTitlePart(partner.title)}` : exam.title

      const session = await getStripe().checkout.sessions.create({
        mode: 'payment',
        // The one VCE price covers every paper; the paper's title goes on the
        // receipt through the description, and its id into the metadata.
        line_items: [{ price: priceId, quantity: 1 }],
        payment_intent_data: { description },
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

    if (typeof tailoredId === 'string') {
      // The result must be one this visitor can see: their own, or a linked child's.
      const loaded = await loadResult(tailoredId)
      if (!loaded.ok) return NextResponse.json({ error: 'Result not found' }, { status: loaded.status === 401 ? 401 : 404 })
      const { result } = loaded
      if (!isVceYear(result.year)) {
        return NextResponse.json({ error: 'This exam is part of the plan, not sold on its own' }, { status: 400 })
      }
      if (tailoredAccess({ id: result.id, year: result.year }, access).mode === 'full') {
        return NextResponse.json({ error: 'You already have this exam' }, { status: 409 })
      }
      const priceId = stripePriceIdForVcePaper()
      if (!priceId) return NextResponse.json({ error: 'No price configured for VCE papers' }, { status: 503 })

      const session = await getStripe().checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        payment_intent_data: { description: result.exam.title },
        customer_email: user.email ?? undefined,
        client_reference_id: user.id,
        // The webhook records exam_id in paper_purchases, as for any VCE paper.
        metadata: { user_id: user.id, exam_id: tailoredExamId(result.id) },
        allow_promotion_codes: true,
        success_url: `${origin}/diagnostic/report/${result.id}?purchased=1`,
        cancel_url: `${origin}/diagnostic/report/${result.id}`,
      })
      if (!session.url) throw new Error('Stripe returned no checkout URL')
      return NextResponse.json({ url: session.url })
    }

    if (typeof diagnosticPaperId === 'string') {
      // The paper must belong to a result this visitor can see.
      const loaded = await loadPaper(diagnosticPaperId)
      if (!loaded.ok) return NextResponse.json({ error: 'Paper not found' }, { status: loaded.status === 401 ? 401 : 404 })
      const { paper, result } = loaded
      if (!isVceYear(paper.year)) {
        return NextResponse.json({ error: 'This paper is part of the plan, not sold on its own' }, { status: 400 })
      }
      if (paperOpen({ id: paper.id, year: paper.year }, access)) {
        return NextResponse.json({ error: 'You already have this paper' }, { status: 409 })
      }
      const priceId = stripePriceIdForVcePaper()
      if (!priceId) return NextResponse.json({ error: 'No price configured for VCE papers' }, { status: 503 })

      const session = await getStripe().checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        payment_intent_data: { description: paper.exam.title },
        customer_email: user.email ?? undefined,
        client_reference_id: user.id,
        // The webhook records exam_id in paper_purchases, as for any VCE paper.
        metadata: { user_id: user.id, exam_id: paperExamId(paper.id) },
        allow_promotion_codes: true,
        success_url: `${origin}/diagnostic/report/${result.id}?purchased=1`,
        cancel_url: `${origin}/diagnostic/report/${result.id}`,
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

/** "Mathematical Methods Unit 3 & 4 — Examination 2 (Practice 3)" → "Examination 2 (Practice 3)". */
function lastTitlePart(title: string): string {
  return title.split(' — ').pop() ?? title
}
