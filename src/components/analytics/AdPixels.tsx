'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { CONSENT_EVENT, META_PIXEL_ID, PIXELS_CONFIGURED, SOURCE_COOKIE, TIKTOK_PIXEL_ID, getConsent, setConsent, track, type Consent } from '@/lib/analytics/track'

/**
 * The ad pixels, the cookie banner that asks before loading them, and two
 * small jobs that need every page:
 *
 *  - The first campaign a visitor arrived from (utm_*, fbclid, ttclid) is
 *    kept in the pn_src cookie for 90 days. It is PrepNest's own record and
 *    goes only into the Stripe metadata of a purchase, so the Stripe
 *    dashboard can say which campaign paid.
 *  - Back from Stripe Checkout (?purchased=1 or ?subscribed=1 with the
 *    session id), the purchase is reported once.
 *
 * Without NEXT_PUBLIC_META_PIXEL_ID or NEXT_PUBLIC_TIKTOK_PIXEL_ID set this
 * renders nothing and loads nothing.
 */
export default function AdPixels() {
  const pathname = usePathname()
  const search = useSearchParams()
  const [consent, setConsentState] = useState<Consent | null | 'unknown'>('unknown')

  useEffect(() => {
    setConsentState(getConsent())
    const onChange = (e: Event) => setConsentState((e as CustomEvent<Consent>).detail)
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  // First-touch campaign source.
  useEffect(() => {
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'fbclid', 'ttclid']
    const found = keys.filter(k => search.get(k)).map(k => `${k}=${search.get(k)!.slice(0, 80)}`)
    if (!found.length || document.cookie.includes(`${SOURCE_COOKIE}=`)) return
    document.cookie = `${SOURCE_COOKIE}=${encodeURIComponent(found.join('&').slice(0, 400))}; path=/; max-age=${60 * 60 * 24 * 90}; samesite=lax`
  }, [search])

  // Load the pixels once allowed.
  useEffect(() => {
    if (consent !== 'granted') return
    if (META_PIXEL_ID && !window.fbq) loadMeta(META_PIXEL_ID)
    if (TIKTOK_PIXEL_ID && !window.ttq) loadTikTok(TIKTOK_PIXEL_ID)
  }, [consent])

  // A page view on every client-side navigation (the pixels count the first themselves).
  const [first, setFirst] = useState(true)
  useEffect(() => {
    if (consent !== 'granted') return
    if (first) {
      setFirst(false)
      return
    }
    try {
      window.fbq?.('track', 'PageView')
      window.ttq?.page()
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per page, not per consent change
  }, [pathname, consent])

  // Back from checkout: the purchase, once per Stripe session.
  useEffect(() => {
    if (consent !== 'granted') return
    const session = search.get('session_id')
    if (!session || !(search.get('purchased') || search.get('subscribed'))) return
    const key = `pn-purchase-${session}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {}
    // The server sends the value with the same event id; Meta keeps one.
    track('Purchase', { eventId: session })
  }, [search, consent])

  if (!PIXELS_CONFIGURED || consent !== null) return null
  return (
    <div className="fixed inset-x-3 bottom-3 z-[90] sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm rounded-2xl border-2 border-line border-b-4 bg-white p-4 shadow-lg" role="dialog" aria-label="Cookies">
      <p className="text-sm text-gray-700">
        We use cookies to see which of our ads bring parents to PrepNest. Nothing about your child is ever shared.{' '}
        <Link href="/privacy" className="font-bold text-brand-600 underline">
          Privacy
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn-primary text-sm px-4 py-2" onClick={() => setConsent('granted')}>
          Allow
        </button>
        <button type="button" className="btn-secondary text-sm px-4 py-2" onClick={() => setConsent('denied')}>
          No thanks
        </button>
      </div>
    </div>
  )
}


/** Pixel ids are digits and letters; anything else is a misconfiguration, never run. */
const SAFE_ID = /^[A-Za-z0-9]{5,40}$/

/** Runs a platform's published base code, with the id filled in. */
function runSnippet(code: string) {
  const s = document.createElement('script')
  s.text = code
  document.head.appendChild(s)
}

/** Meta's base pixel code, as Meta publishes it. */
function loadMeta(id: string) {
  if (!SAFE_ID.test(id)) return console.error('[AdPixels] NEXT_PUBLIC_META_PIXEL_ID looks wrong')
  runSnippet(
    `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`
  )
}

/** TikTok's base pixel code, as TikTok publishes it. */
function loadTikTok(id: string) {
  if (!SAFE_ID.test(id)) return console.error('[AdPixels] NEXT_PUBLIC_TIKTOK_PIXEL_ID looks wrong')
  runSnippet(
    `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=d.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=d.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('${id}');ttq.page();}(window,document,'ttq');`
  )
}
