'use client'

import { useEffect } from 'react'

/**
 * Sends uncaught errors in the browser to /api/client-error, at most five a
 * page, ignoring noise from browser extensions and third-party scripts.
 */
export default function ErrorBeacon() {
  useEffect(() => {
    let sent = 0
    const send = (message: string, source?: string, stack?: string) => {
      if (sent >= 5 || !message) return
      if (/^Script error\.?$/.test(message) || /extension:\/\//.test(source ?? '') || /ResizeObserver loop/.test(message)) return
      sent++
      const body = JSON.stringify({ message, source, stack, page: location.pathname })
      try {
        if (!navigator.sendBeacon?.('/api/client-error', new Blob([body], { type: 'application/json' }))) {
          void fetch('/api/client-error', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } })
        }
      } catch {}
    }
    const onError = (e: ErrorEvent) => send(e.message, e.filename, e.error instanceof Error ? e.error.stack : undefined)
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason
      send(r instanceof Error ? r.message : String(r), undefined, r instanceof Error ? r.stack : undefined)
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])
  return null
}
