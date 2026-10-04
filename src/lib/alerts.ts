// ─────────────────────────────────────────────────────────────────────────────
// Emails the owner: alerts when something breaks that a customer would notice
// (a payment the webhook could not record, errors in visitors' browsers), and
// notices for things the team should act on (a family asking for more papers).
//
// Sent through Resend's API (the same service the sign-in emails use), so it
// needs RESEND_API_KEY and ALERT_EMAIL; ALERT_FROM defaults to
// alerts@prepnest.com.au, which must be on a domain verified in Resend.
// Without them an alert is only logged, as it always was.
//
// Alerts send at most one email per kind every ten minutes from each server
// instance, so a flood of errors is one email, not hundreds. Notices are
// never throttled: each one is a person waiting. Neither ever throws.
// ─────────────────────────────────────────────────────────────────────────────

const lastSent = new Map<string, number>()
const QUIET_MS = 10 * 60 * 1000

export async function sendAlert(kind: string, subject: string, details: Record<string, unknown>): Promise<void> {
  console.error(`[alert:${kind}] ${subject}`, details)
  const now = Date.now()
  if (now - (lastSent.get(kind) ?? 0) < QUIET_MS) return
  if (await email(subject, details, 'Full details are in the Vercel logs.')) lastSent.set(kind, now)
}

/** Emails the owner about something to act on. True if the email was accepted. */
export async function sendNotice(subject: string, details: Record<string, unknown>): Promise<boolean> {
  console.info(`[notice] ${subject}`, details)
  return email(subject, details)
}

async function email(subject: string, details: Record<string, unknown>, footer?: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  const to = process.env.ALERT_EMAIL
  if (!key || !to) return false
  const body = Object.entries(details)
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v, null, 2)}`)
    .join('\n')
    .slice(0, 4000)
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.ALERT_FROM ?? 'PrepNest alerts <alerts@prepnest.com.au>',
        to: [to],
        subject: `[PrepNest] ${subject}`,
        text: `${subject}\n\n${body}${footer ? `\n\n${footer}` : ''}`,
      }),
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) console.error('[alerts] email not accepted', res.status, (await res.text()).slice(0, 200))
    return res.ok
  } catch (error) {
    console.error('[alerts] email not sent', error)
    return false
  }
}
