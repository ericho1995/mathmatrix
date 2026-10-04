import { NextRequest, NextResponse } from 'next/server'
import { sendAlert } from '@/lib/alerts'

export const runtime = 'nodejs'

/**
 * Errors from visitors' browsers (ErrorBeacon), so a page that breaks on
 * someone's phone shows up in the Vercel logs and, when alerts are set up,
 * in the owner's inbox. Only the message, where and the browser are kept;
 * the body is capped, and nothing here is stored.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {}
  try {
    const text = await req.text()
    if (text.length > 8000) return NextResponse.json({ ok: false }, { status: 413 })
    body = JSON.parse(text)
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const str = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : undefined)
  const details = {
    message: str(body.message, 500),
    page: str(body.page, 300),
    source: str(body.source, 300),
    stack: str(body.stack, 1500),
    browser: req.headers.get('user-agent')?.slice(0, 200),
  }
  if (!details.message) return NextResponse.json({ ok: false }, { status: 400 })
  await sendAlert('client-error', `Error on ${details.page ?? 'a page'}: ${details.message.slice(0, 80)}`, details)
  return NextResponse.json({ ok: true })
}
