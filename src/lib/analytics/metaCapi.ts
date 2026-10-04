import { createHash } from 'node:crypto'
import type Stripe from 'stripe'

// ─────────────────────────────────────────────────────────────────────────────
// Purchases, reported to Meta from the server (the Conversions API), so an ad
// blocker or a closed tab can't lose them. The browser pixel reports the same
// purchase under the same event id (the Stripe session id), and Meta keeps one.
//
// Only for visitors who allowed ad cookies: checkout copies their choice and
// Meta's own browser ids into the session metadata (see trackingMetadata), and
// nothing is sent without them. What goes: the event, the amount, and the
// parent's email and account id, hashed as Meta requires. Nothing about a child.
//
// Needs NEXT_PUBLIC_META_PIXEL_ID and META_CAPI_TOKEN. Never throws: a
// reporting failure must not fail the webhook that grants access.
// ─────────────────────────────────────────────────────────────────────────────

const GRAPH = 'https://graph.facebook.com/v21.0'
const sha256 = (s: string) => createHash('sha256').update(s.trim().toLowerCase()).digest('hex')

/** The tracking fields checkout adds to a session's metadata (all optional, all short). */
export function trackingMetadata(req: { headers: Headers; cookies: { get(name: string): { value: string } | undefined } }): Record<string, string> {
  const out: Record<string, string> = {}
  const src = req.cookies.get('pn_src')?.value
  if (src) out.src = decodeURIComponent(src).slice(0, 450)
  if (req.cookies.get('pn_consent')?.value !== 'granted') return out
  out.ad_consent = '1'
  const fbp = req.cookies.get('_fbp')?.value
  const fbc = req.cookies.get('_fbc')?.value
  if (fbp) out.fbp = fbp.slice(0, 200)
  if (fbc) out.fbc = fbc.slice(0, 450)
  const ua = req.headers.get('user-agent')
  if (ua) out.ua = ua.slice(0, 450)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (ip) out.ip = ip.slice(0, 60)
  return out
}

export async function reportPurchase(session: Stripe.Checkout.Session, siteUrl: string): Promise<void> {
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const token = process.env.META_CAPI_TOKEN
  const m = session.metadata ?? {}
  if (!pixel || !token || m.ad_consent !== '1') return
  const email = session.customer_details?.email ?? session.customer_email ?? undefined
  const event = {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    event_id: session.id,
    action_source: 'website',
    event_source_url: siteUrl,
    user_data: {
      ...(email ? { em: [sha256(email)] } : {}),
      ...(m.user_id ? { external_id: [sha256(m.user_id)] } : {}),
      ...(m.fbp ? { fbp: m.fbp } : {}),
      ...(m.fbc ? { fbc: m.fbc } : {}),
      ...(m.ua ? { client_user_agent: m.ua } : {}),
      ...(m.ip ? { client_ip_address: m.ip } : {}),
    },
    custom_data: {
      value: (session.amount_total ?? 0) / 100,
      currency: (session.currency ?? 'aud').toUpperCase(),
      content_type: session.mode === 'subscription' ? 'plan' : 'paper',
    },
  }
  try {
    const res = await fetch(`${GRAPH}/${pixel}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [event] }),
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) console.error('[meta-capi] purchase not accepted', res.status, (await res.text()).slice(0, 300))
  } catch (error) {
    console.error('[meta-capi] purchase not sent', error)
  }
}
