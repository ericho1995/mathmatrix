// ─────────────────────────────────────────────────────────────────────────────
// Emails the owner when something breaks that a customer would notice: a
// payment the webhook could not record, or errors in visitors' browsers.
//
// Sent through Resend's API (the same service the sign-in emails use), so it
// needs RESEND_API_KEY and ALERT_EMAIL; ALERT_FROM defaults to
// alerts@prepnest.com.au, which must be on a domain verified in Resend.
// Without them an alert is only logged, as it always was.
//
// At most one email per alert kind every ten minutes from each server
// instance, so a flood of errors is one email, not hundreds. Never throws.
// ─────────────────────────────────────────────────────────────────────────────

const lastSent = new Map<string, number>()
const QUIET_MS = 10 * 60 * 1000

export async function sendAlert(kind: string, subject: string, details: Record<string, unknown>): Promise<void> {
  console.error(`[alert:${kind}] ${subject}`, details)
  const key = process.env.RESEND_API_KEY
  const to = process.env.ALERT_EMAIL
  if (!key || !to) return
  const now = Date.now()
  if (now - (lastSent.get(kind) ?? 0) < QUIET_MS) return
  lastSent.set(kind, now)
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.ALERT_FROM ?? 'PrepNest alerts <alerts@prepnest.com.au>',
        to: [to],
        subject: `[PrepNest] ${subject}`,
        text: `${subject}\n\n${JSON.stringify(details, null, 2).slice(0, 4000)}\n\nFull details are in the Vercel logs.`,
      }),
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) console.error('[alerts] email not accepted', res.status, (await res.text()).slice(0, 200))
  } catch (error) {
    console.error('[alerts] email not sent', error)
  }
}
