// ─────────────────────────────────────────────────────────────────────────────
// Ad measurement: the Meta and TikTok pixels, and the visitor's choice about
// them. Browser-only.
//
// Nothing loads, and nothing is sent, until the visitor allows it on the
// cookie banner (AdPixels). The choice is kept in localStorage for the browser
// and in the pn_consent cookie for the server, which only passes ad
// identifiers on to Meta (with a purchase) when it says "granted".
//
// Events carry what happened, never who the child is: no names, answers,
// results or year levels. Purchases also go to Meta from the server
// (lib/analytics/metaCapi.ts) under the same event id, so Meta counts them
// once even when an ad blocker stops the pixel.
// ─────────────────────────────────────────────────────────────────────────────

export type Consent = 'granted' | 'denied'
export const CONSENT_COOKIE = 'pn_consent'
export const SOURCE_COOKIE = 'pn_src'
const CONSENT_KEY = 'pn-consent'
export const CONSENT_EVENT = 'pn-consent'

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ''
export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? ''
export const PIXELS_CONFIGURED = Boolean(META_PIXEL_ID || TIKTOK_PIXEL_ID)

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

export function setConsent(v: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, v)
  } catch {}
  document.cookie = `${CONSENT_COOKIE}=${v}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: v }))
}

/** What happened, in PrepNest's words; mapped to each platform's standard event. */
export type AdEvent = 'StartFreeTest' | 'CompleteFreeTest' | 'CompleteRegistration' | 'InitiateCheckout' | 'Purchase'

const META: Record<AdEvent, { name: string; custom?: boolean }> = {
  StartFreeTest: { name: 'StartFreeTest', custom: true },
  CompleteFreeTest: { name: 'Lead' },
  CompleteRegistration: { name: 'CompleteRegistration' },
  InitiateCheckout: { name: 'InitiateCheckout' },
  Purchase: { name: 'Purchase' },
}
const TIKTOK: Record<AdEvent, string> = {
  StartFreeTest: 'ClickButton',
  CompleteFreeTest: 'SubmitForm',
  CompleteRegistration: 'CompleteRegistration',
  InitiateCheckout: 'InitiateCheckout',
  Purchase: 'CompletePayment',
}

type Fbq = (...args: unknown[]) => void
type Ttq = { track: (event: string, params?: Record<string, unknown>, opts?: { event_id?: string }) => void; page: () => void }
declare global {
  interface Window {
    fbq?: Fbq
    ttq?: Ttq
  }
}

/** Reports an event to whichever pixels are loaded. Does nothing without consent. */
export function track(event: AdEvent, opts: { eventId?: string; value?: number; currency?: string } = {}) {
  if (typeof window === 'undefined' || getConsent() !== 'granted') return
  const params: Record<string, unknown> = opts.value !== undefined ? { value: opts.value, currency: opts.currency ?? 'AUD' } : {}
  try {
    const m = META[event]
    window.fbq?.(m.custom ? 'trackCustom' : 'track', m.name, params, opts.eventId ? { eventID: opts.eventId } : undefined)
    window.ttq?.track(TIKTOK[event], params, opts.eventId ? { event_id: opts.eventId } : undefined)
  } catch (e) {
    console.warn('[track] could not report', event, e)
  }
}
